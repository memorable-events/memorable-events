import os
import sqlite3
from datetime import datetime, timedelta
from functools import wraps

from flask import Flask, request, jsonify, g
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import uuid
import requests
import re
from flask import send_from_directory, Response, stream_with_context
import urllib.parse
import cloudinary
import cloudinary.uploader
import cloudinary.api

BASE_DIR = os.path.dirname(__file__)
DB_PATH = os.path.join(BASE_DIR, "data.db")
SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-me")
JWT_ALGORITHM = "HS256"
STATIC_REELS_DIR = os.path.join(BASE_DIR, "static", "reels")
os.makedirs(STATIC_REELS_DIR, exist_ok=True)


def get_db():
	db = getattr(g, "db", None)
	if db is None:
		db = sqlite3.connect(DB_PATH)
		db.row_factory = sqlite3.Row
		g.db = db
	return db


def close_db(e=None):
	db = getattr(g, "db", None)
	if db is not None:
		db.close()


def init_db():
	db = get_db()
	cur = db.cursor()
	cur.execute(
		"""
		CREATE TABLE IF NOT EXISTS admins (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)
		"""
	)
	cur.execute(
		"""
		CREATE TABLE IF NOT EXISTS events (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT,
			description TEXT,
			date TEXT,
			metadata TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)
		"""
	)
	cur.execute(
		"""
		CREATE TABLE IF NOT EXISTS inquiries (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT,
			email TEXT,
			message TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)
		"""
	)
	cur.execute(
		"""
		CREATE TABLE IF NOT EXISTS bookings (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			date TEXT NOT NULL,
			time_slot TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)
		"""
	)
	db.commit()


def ensure_default_admin():
	db = get_db()
	cur = db.cursor()
	cur.execute("SELECT COUNT(*) as c FROM admins")
	row = cur.fetchone()
	if row and row[0] == 0:
		admin_user = os.environ.get("ADMIN_USERNAME", "admin")
		admin_pass = os.environ.get("ADMIN_PASSWORD", "admin")
		print(f"DEBUG: Creating default admin with username='{admin_user}', password='{admin_pass}'")
		hashed = generate_password_hash(admin_pass)
		cur.execute(
			"INSERT INTO admins (username, password) VALUES (?, ?)", (admin_user, hashed)
		)
		db.commit()
		print(f"Created default admin user '{admin_user}'. Set ADMIN_PASSWORD env var to change it.")


def create_app():
	app = Flask(__name__)
	app.config["SECRET_KEY"] = SECRET_KEY
	# Allow frontend origins and Authorization header for JWT auth
	# Allow frontend origins and Authorization header for JWT auth
	CORS(app, resources={r"/api/*": {"origins": "*"}}, allow_headers=["Content-Type", "Authorization"])

	# Initialize Cloudinary
	cloudinary_config = {
		"cloud_name": os.environ.get("CLOUDINARY_CLOUD_NAME"),
		"api_key": os.environ.get("CLOUDINARY_API_KEY"),
		"api_secret": os.environ.get("CLOUDINARY_API_SECRET")
	}

	# PythonAnywhere Proxy Fix
	# PythonAnywhere free tier provides 'http_proxy' but some libs look for 'HTTP_PROXY'
	proxy = os.environ.get("http_proxy") or os.environ.get("HTTP_PROXY")
	if proxy:
		# Ensure scheme is present
		if not proxy.startswith("http"):
			proxy = f"http://{proxy}"
			
		print(f"DEBUG: Found proxy: {proxy}")
		# Set ALL variants to be safe
		os.environ["HTTP_PROXY"] = proxy
		os.environ["HTTPS_PROXY"] = proxy
		os.environ["http_proxy"] = proxy
		os.environ["https_proxy"] = proxy
		
		cloudinary_config["api_proxy"] = proxy
	else:
		print("DEBUG: No proxy environment variable found.")

	cloudinary.config(**cloudinary_config)

	@app.route("/api/debug-connection", methods=["GET"])
	def debug_connection():
		results = {}
		# Test Google
		try:
			r = requests.get("https://www.google.com", timeout=5)
			results["google"] = f"Success: {r.status_code}"
		except Exception as e:
			results["google"] = f"Failed: {str(e)}"
			
		# Test Cloudinary
		try:
			r = requests.get("https://api.cloudinary.com/v1_1/ping", timeout=5)
			results["cloudinary"] = f"Success: {r.status_code}"
		except Exception as e:
			results["cloudinary"] = f"Failed: {str(e)}"
			
		results["proxy_env"] = {
			"http_proxy": os.environ.get("http_proxy"),
			"HTTP_PROXY": os.environ.get("HTTP_PROXY"),
			"https_proxy": os.environ.get("https_proxy"),
			"HTTPS_PROXY": os.environ.get("HTTPS_PROXY")
		}
		return jsonify(results)

	# Initialize DB and default admin now (avoid using before_first_request)
	with app.app_context():
		init_db()
		ensure_default_admin()

	@app.teardown_appcontext
	def _close_db(exc):
		close_db(exc)

	def create_token(admin_id):
		payload = {
			"admin_id": admin_id,
			"exp": datetime.utcnow() + timedelta(hours=8),
		}
		return jwt.encode(payload, app.config["SECRET_KEY"], algorithm=JWT_ALGORITHM)

	def token_required(f):
		@wraps(f)
		def decorated(*args, **kwargs):
			auth = request.headers.get("Authorization", "")
			if not auth.startswith("Bearer "):
				return jsonify({"error": "Missing or invalid Authorization header"}), 401
			token = auth.split(" ", 1)[1]
			try:
				data = jwt.decode(token, app.config["SECRET_KEY"], algorithms=[JWT_ALGORITHM])
				admin_id = data.get("admin_id")
				db = get_db()
				cur = db.cursor()
				cur.execute("SELECT id, username FROM admins WHERE id = ?", (admin_id,))
				admin = cur.fetchone()
				if not admin:
					return jsonify({"error": "Invalid token"}), 401
				g.admin = admin
			except jwt.ExpiredSignatureError:
				return jsonify({"error": "Token expired"}), 401
			except Exception:
				return jsonify({"error": "Invalid token"}), 401
			return f(*args, **kwargs)

		return decorated

	@app.route("/login", methods=["POST"])
	def login():
		data = request.get_json() or {}
		username = data.get("username")
		password = data.get("password")
		print(f"DEBUG: Login attempt for username='{username}', password='{password}'")
		if not username or not password:
			return jsonify({"error": "username and password required"}), 400
		db = get_db()
		cur = db.cursor()
		cur.execute("SELECT id, password FROM admins WHERE username = ?", (username,))
		row = cur.fetchone()
		if not row:
			return jsonify({"error": "Invalid credentials"}), 401
		admin_id = row[0]
		stored_hash = row[1]
		password_ok = check_password_hash(stored_hash, password)
		print(f"DEBUG: Stored hash='{stored_hash}', password_ok={password_ok}")
		if not password_ok:
			return jsonify({"error": "Invalid credentials"}), 401
		token = create_token(admin_id)
		return jsonify({"token": token})

	@app.route("/admin/events", methods=["GET"])
	@token_required
	def list_events():
		db = get_db()
		cur = db.cursor()
		cur.execute("SELECT id, title, description, date, metadata, created_at FROM events ORDER BY created_at DESC")
		rows = cur.fetchall()
		events = [dict(row) for row in rows]
		return jsonify({"events": events})

	@app.route("/admin/events", methods=["POST"])
	@token_required
	def create_event():
		data = request.get_json() or {}
		title = data.get("title")
		description = data.get("description")
		date = data.get("date")
		metadata = data.get("metadata")
		db = get_db()
		cur = db.cursor()
		cur.execute(
			"INSERT INTO events (title, description, date, metadata) VALUES (?, ?, ?, ?)",
			(title, description, date, metadata),
		)
		db.commit()
		return jsonify({"ok": True, "id": cur.lastrowid}), 201

	@app.route("/admin/events/<int:event_id>", methods=["PUT"])
	@token_required
	def update_event(event_id):
		data = request.get_json() or {}
		title = data.get("title")
		description = data.get("description")
		date = data.get("date")
		metadata = data.get("metadata")
		db = get_db()
		cur = db.cursor()
		cur.execute(
			"UPDATE events SET title = ?, description = ?, date = ?, metadata = ? WHERE id = ?",
			(title, description, date, metadata, event_id),
		)
		db.commit()
		return jsonify({"ok": True})

	@app.route("/admin/events/<int:event_id>", methods=["DELETE"])
	@token_required
	def delete_event(event_id):
		db = get_db()
		cur = db.cursor()
		cur.execute("DELETE FROM events WHERE id = ?", (event_id,))
		db.commit()
		return jsonify({"ok": True})

	@app.route("/admin/inquiries", methods=["GET"])
	@token_required
	def list_inquiries():
		db = get_db()
		cur = db.cursor()
		cur.execute("SELECT id, name, email, message, created_at FROM inquiries ORDER BY created_at DESC")
		rows = cur.fetchall()
		items = [dict(row) for row in rows]
		return jsonify({"inquiries": items})

	# ===== Booking API =====
	@app.route("/api/bookings", methods=["GET"])
	def get_bookings():
		date = request.args.get("date")
		db = get_db()
		cur = db.cursor()
		if date:
			cur.execute("SELECT * FROM bookings WHERE date = ?", (date,))
		else:
			cur.execute("SELECT * FROM bookings ORDER BY date, time_slot")
		rows = cur.fetchall()
		return jsonify([dict(row) for row in rows])

	@app.route("/api/bookings", methods=["POST"])
	@token_required
	def create_booking():
		data = request.get_json() or {}
		date = data.get("date")
		time_slot = data.get("time_slot")
		if not date or not time_slot:
			return jsonify({"error": "Date and time_slot required"}), 400
		
		db = get_db()
		cur = db.cursor()
		# Check if exists
		cur.execute("SELECT id FROM bookings WHERE date = ? AND time_slot = ?", (date, time_slot))
		if cur.fetchone():
			return jsonify({"error": "Slot already booked"}), 409
			
		cur.execute("INSERT INTO bookings (date, time_slot) VALUES (?, ?)", (date, time_slot))
		db.commit()
		return jsonify({"ok": True, "id": cur.lastrowid}), 201

	@app.route("/api/bookings/<int:booking_id>", methods=["DELETE"])
	@token_required
	def delete_booking(booking_id):
		db = get_db()
		cur = db.cursor()
		cur.execute("DELETE FROM bookings WHERE id = ?", (booking_id,))
		db.commit()
		return jsonify({"ok": True})

	@app.route("/api/inquiry", methods=["POST"])
	def public_inquiry():
		data = request.get_json() or {}
		name = data.get("name")
		email = data.get("email") # Optional now
		date = data.get("date")
		contact_number = data.get("contactNumber")
		indoor_outdoor = data.get("indoorOutdoor")
		event_type = data.get("type")
		message = data.get("message")
		
		# Save to DB
		db = get_db()
		cur = db.cursor()
		cur.execute(
			"INSERT INTO inquiries (name, email, message) VALUES (?, ?, ?)",
			(name, email or "", message),
		)
		db.commit()
		inquiry_id = cur.lastrowid

		# Construct Message
		msg_body = f"*New Inquiry via Website*\n\n*Name:* {name}"
		if contact_number:
			msg_body += f"\n*Phone:* {contact_number}"
		if date:
			msg_body += f"\n*Date:* {date}"
		if indoor_outdoor:
			msg_body += f"\n*Service:* {indoor_outdoor}"
		if event_type:
			msg_body += f"\n*Type:* {event_type}"
		if email:
			msg_body += f"\n*Email:* {email}"
		
		msg_body += f"\n*Message:* {message}"

		# Send Notification
		# Option 1: Twilio (User Preferred - Reliable & Standard)
		# Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER in env
		try:
			import requests
			
			# Twilio
			twilio_sid = os.environ.get("TWILIO_ACCOUNT_SID")
			twilio_token = os.environ.get("TWILIO_AUTH_TOKEN")
			# Default Twilio Sandbox number if not specified
			twilio_from = os.environ.get("TWILIO_FROM_NUMBER", "whatsapp:+14155238886")
			phone = "919978634999"

			if twilio_sid and twilio_token:
				url = f"https://api.twilio.com/2010-04-01/Accounts/{twilio_sid}/Messages.json"
				auth = (twilio_sid, twilio_token)
				data = {
					"From": twilio_from,
					"To": f"whatsapp:+{phone}",
					"Body": msg_body
				}
				requests.post(url, data=data, auth=auth, timeout=10)
				print(f"DEBUG: Sent WhatsApp notification via Twilio")

			# Option 2: WhatsApp Cloud API (Official)
			elif os.environ.get("WHATSAPP_CLOUD_NUMBER_ID"):
				wa_id = os.environ.get("WHATSAPP_CLOUD_NUMBER_ID")
				wa_token = os.environ.get("WHATSAPP_CLOUD_TOKEN")
				url = f"https://graph.facebook.com/v17.0/{wa_id}/messages"
				headers = {"Authorization": f"Bearer {wa_token}", "Content-Type": "application/json"}
				payload = {
					"messaging_product": "whatsapp", "to": "919978634999", "type": "text",
					"text": {"body": msg_body}
				}
				requests.post(url, json=payload, headers=headers, timeout=10)
				print(f"DEBUG: Sent WhatsApp Cloud API notification")

			# Option 3: Discord Webhook (Free & Easy)
			elif os.environ.get("DISCORD_WEBHOOK_URL"):
				discord_url = os.environ.get("DISCORD_WEBHOOK_URL")
				payload = {"content": f"🎉 **New Inquiry**\n{msg_body}"}
				requests.post(discord_url, json=payload, timeout=10)
				print(f"DEBUG: Sent Discord notification")

			# Option 4: Telegram (Free & Reliable)
			elif os.environ.get("TELEGRAM_BOT_TOKEN"):
				tg_token = os.environ.get("TELEGRAM_BOT_TOKEN")
				tg_chat_id = os.environ.get("TELEGRAM_CHAT_ID")
				url = f"https://api.telegram.org/bot{tg_token}/sendMessage"
				payload = {"chat_id": tg_chat_id, "text": msg_body, "parse_mode": "Markdown"}
				requests.post(url, json=payload, timeout=10)
				print(f"DEBUG: Sent Telegram notification")

			# Option 5: CallMeBot (Legacy)
			elif os.environ.get("WHATSAPP_BOT_API_KEY"):
				import urllib.parse
				phone = "919978634999"
				api_key = os.environ.get("WHATSAPP_BOT_API_KEY")
				encoded_text = urllib.parse.quote(msg_body)
				url = f"https://api.callmebot.com/whatsapp.php?phone={phone}&text={encoded_text}&apikey={api_key}"
				requests.get(url, timeout=10)
				print(f"DEBUG: Sent WhatsApp notification via CallMeBot")
				
			# Option 6: Fonoster (User Preferred)
			elif os.environ.get("FONOSTER_ACCESS_KEY_ID"):
				access_key_id = os.environ.get("FONOSTER_ACCESS_KEY_ID")
				access_key_secret = os.environ.get("FONOSTER_ACCESS_KEY_SECRET")
				project_id = os.environ.get("FONOSTER_PROJECT_ID") # Optional depending on setup
				
				# Note: This is a generic implementation. Fonoster's specific API endpoint and payload 
				# structure might vary based on the specific integration (e.g., Twilio adapter via Fonoster).
				# Assuming a standard HTTP request to a configured endpoint or using their SDK logic if available.
				# Since we are using requests, we will assume a direct API call.
				
				# Placeholder for Fonoster API endpoint - User needs to verify specific endpoint
				url = "https://api.fonoster.com/v1/messages" 
				auth = (access_key_id, access_key_secret)
				payload = {
					"from": "919978634999", # Sender ID or Number
					"to": "919978634999",
					"text": msg_body
				}
				
				# requests.post(url, json=payload, auth=auth, timeout=10)
				print(f"DEBUG: Sent WhatsApp notification via Fonoster (Simulated - Verify Endpoint)")

			else:
				print("DEBUG: No notification credentials found.")
				
		except Exception as e:
			print(f"ERROR: Failed to send notification: {e}")

		return jsonify({"ok": True, "id": inquiry_id}), 201

	# ===== Generic API for frontend admin =====
	import json

	from default_data import DEFAULT_DATA

	CONTENT_PATH = os.path.join(BASE_DIR, "content.json")

	def read_content():
		if not os.path.exists(CONTENT_PATH):
			print("DEBUG: content.json not found, creating from defaults")
			with open(CONTENT_PATH, "w", encoding="utf-8") as f:
				json.dump(DEFAULT_DATA, f, ensure_ascii=False, indent=2)
			return DEFAULT_DATA
		
		with open(CONTENT_PATH, "r", encoding="utf-8") as f:
			try:
				data = json.load(f)
			except json.JSONDecodeError:
				print("DEBUG: content.json corrupted, resetting")
				data = {}
		
		# Auto-seed ONLY if key is missing completely
		needs_save = False
		for key, default_items in DEFAULT_DATA.items():
			if key not in data:
				print(f"DEBUG: Key '{key}' missing in content.json, auto-seeding")
				data[key] = default_items
				needs_save = True
		
		if needs_save:
			with open(CONTENT_PATH, "w", encoding="utf-8") as f:
				json.dump(data, f, ensure_ascii=False, indent=2)
				
		return data

	def write_content(data):
		print(f"DEBUG: Writing content to {CONTENT_PATH}")
		with open(CONTENT_PATH, "w", encoding="utf-8") as f:
			json.dump(data, f, ensure_ascii=False, indent=2)

	resource_map = {
		"indoor-decorations": "indoorDecorations",
		"outdoor-decorations": "outdoorDecorations",
		"indoor-plans": "indoorPlans",
		"outdoor-plans": "outdoorPlans",
		"cakes": "cakes",
		"gallery": "galleryItems"
		# "reels" REMOVED from generic map to prevent auto-seed issues
	}

	# ===== Dedicated Reels API (To fix persistence issues) =====
	@app.route("/api/reels", methods=["GET"])
	def get_reels():
		print("DEBUG: Fetching reels specifically")
		data = read_content()
		# Return empty list if key missing, DO NOT AUTO-SEED from defaults here
		return jsonify({"reels": data.get("reels", [])})

	@app.route("/api/reels", methods=["POST"])
	@token_required
	def create_reel():
		print("DEBUG: Creating new reel")
		payload = request.get_json() or {}
		data = read_content()
		
		# Ensure 'reels' key exists
		if "reels" not in data:
			data["reels"] = []
			
		items = data["reels"]
		# Robust ID generation
		max_id = max([it.get("id", 0) for it in items], default=0)
		payload["id"] = max_id + 1
		
		items.append(payload)
		data["reels"] = items
		write_content(data)
		
		return jsonify(payload), 201

	@app.route("/api/reels/<int:reel_id>", methods=["GET"])
	def get_single_reel(reel_id):
		data = read_content()
		items = data.get("reels", [])
		idx = find_item_by_id(items, reel_id)
		if idx is None:
			return jsonify({"error": "Reel not found"}), 404
		return jsonify(items[idx])

	@app.route("/api/reels/<int:reel_id>", methods=["DELETE"])
	@token_required
	def delete_reel(reel_id):
		print(f"DEBUG: Deleting reel {reel_id}")
		data = read_content()
		items = data.get("reels", [])
		
		initial_len = len(items)
		# Filter out the item
		items = [it for it in items if str(it.get("id")) != str(reel_id)]
		
		if len(items) == initial_len:
			return jsonify({"error": "Reel not found"}), 404
			
		data["reels"] = items
		write_content(data)
		return jsonify({"ok": True})


	@app.route("/api/reels/<int:reel_id>", methods=["PUT"])
	@token_required
	def update_reel(reel_id):
		print(f"DEBUG: Updating reel {reel_id}")
		data = read_content()
		items = data.get("reels", [])
		
		idx = find_item_by_id(items, reel_id)
		if idx is None:
			return jsonify({"error": "Reel not found"}), 404
			
		payload = request.get_json() or {}
		payload["id"] = reel_id # Ensure ID is preserved
		items[idx] = payload
		
		data["reels"] = items
		write_content(data)
		return jsonify(payload)

	@app.route("/api/content", methods=["GET"])
	def api_get_content():
		return jsonify(read_content())

	@app.route("/api/debug-headers", methods=["GET", "POST"])
	def api_debug_headers():
		# Convert headers to a plain dict
		headers = {k: v for k, v in request.headers.items()}
		return jsonify({"headers": headers, "remote_addr": request.remote_addr})

	@app.route("/api/debug-connectivity", methods=["GET"])
	def api_debug_connectivity():
		results = {}
		
		# Test 1: Google (Usually whitelisted)
		try:
			r = requests.get("https://www.google.com", timeout=5)
			results["google"] = f"OK ({r.status_code})"
		except Exception as e:
			results["google"] = f"FAIL: {str(e)}"
			
		# Test 2: Cobalt (Alternative API)
		try:
			r = requests.get("https://api.cobalt.tools", timeout=5)
			results["cobalt"] = f"OK ({r.status_code})"
		except Exception as e:
			results["cobalt"] = f"FAIL: {str(e)}"
			
		# Test 3: Instagram (Direct check)
		try:
			r = requests.get("https://www.instagram.com", timeout=5)
			results["instagram"] = f"OK ({r.status_code})"
		except Exception as e:
			results["instagram"] = f"FAIL: {str(e)}"

		return jsonify(results)

	@app.route("/api/login", methods=["POST"])
	def api_login():
		# Accept either {username, password} or {password} only.
		data = request.get_json() or {}
		username = data.get("username")
		password = data.get("password")
		if not password:
			return jsonify({"error": "password required"}), 400

		db = get_db()
		cur = db.cursor()
		if username:
			# existing behavior: lookup by username
			cur.execute("SELECT id, password FROM admins WHERE username = ?", (username,))
			row = cur.fetchone()
			if not row:
				return jsonify({"error": "Invalid credentials"}), 401
			admin_id = row[0]
			stored_hash = row[1]
			if not check_password_hash(stored_hash, password):
				return jsonify({"error": "Invalid credentials"}), 401
			token = create_token(admin_id)
			return jsonify({"token": token})

		# No username: try to find any admin that matches the password
		cur.execute("SELECT id, password FROM admins")
		rows = cur.fetchall()
		for row in rows:
			admin_id = row[0]
			stored_hash = row[1]
			if check_password_hash(stored_hash, password):
				token = create_token(admin_id)
				return jsonify({"token": token})

		# Also allow matching against ADMIN_PASSWORD env var for convenience
		env_pass = os.environ.get("ADMIN_PASSWORD")
		if env_pass and password == env_pass:
			# find admin id for admin username
			admin_user = os.environ.get("ADMIN_USERNAME", "admin")
			cur.execute("SELECT id FROM admins WHERE username = ?", (admin_user,))
			row = cur.fetchone()
			admin_id = row[0] if row else 1
			token = create_token(admin_id)
			return jsonify({"token": token})

		return jsonify({"error": "Invalid credentials"}), 401

	def find_item_by_id(items, item_id):
		for i, it in enumerate(items):
			if str(it.get("id")) == str(item_id):
				return i
		return None

	# api_collection and api_item moved to end of file to prevent route shadowing

	@app.route("/api/upload", methods=["POST"])
	@token_required
	def upload_file():
		try:
			if "file" not in request.files:
				return jsonify({"error": "No file part"}), 400
			file = request.files["file"]
			if file.filename == "":
				return jsonify({"error": "No selected file"}), 400

			# Check if it's a video
			is_video = file.content_type.startswith('video/')
			
			if is_video:
				# Upload video to Cloudinary using direct Request (Bypassing SDK to force Proxy)
				import time
				import cloudinary.utils
				
				# Save temporarily
				filename = f"{uuid.uuid4()}_{file.filename}"
				filepath = os.path.join(STATIC_REELS_DIR, filename)
				file.save(filepath)
				
				try:
					# Prepare Direct Upload
					cloud_name = os.environ.get("CLOUDINARY_CLOUD_NAME")
					api_key = os.environ.get("CLOUDINARY_API_KEY")
					api_secret = os.environ.get("CLOUDINARY_API_SECRET")
					
					timestamp = int(time.time())
					params_to_sign = {"timestamp": timestamp}
					signature = cloudinary.utils.api_sign_request(params_to_sign, api_secret)
					
					payload = {
						"api_key": api_key,
						"timestamp": timestamp,
						"signature": signature
					}
					
					# Explicit Proxy for PythonAnywhere
					proxies = {
						"http": "http://proxy.server:3128",
						"https": "http://proxy.server:3128"
					}
					
					print(f"DEBUG: Starting direct upload to Cloudinary for {filename}")
					
					with open(filepath, "rb") as f:
						files = {"file": f}
						upload_url = f"https://api.cloudinary.com/v1_1/{cloud_name}/video/upload"
						
						# Force proxy usage
						resp = requests.post(upload_url, data=payload, files=files, proxies=proxies, timeout=600)
						
					if resp.status_code != 200:
						print(f"Cloudinary Direct Upload Failed: {resp.text}")
						return jsonify({"error": f"Cloudinary Upload Failed: {resp.text}"}), 500
						
					result = resp.json()
					cloudinary_url = result.get("secure_url")
					return jsonify({"url": cloudinary_url})

				finally:
					# Clean up
					if os.path.exists(filepath):
						os.remove(filepath)

			else:
				# Image upload (ImgBB)
				api_key = os.environ.get("IMGBB_API_KEY")
				if not api_key:
					return jsonify({"error": "Server configuration error: Missing IMGBB_API_KEY"}), 500

				# ImgBB API expects 'image' field
				files = {"image": (file.filename, file.read(), file.content_type)}
				params = {"key": api_key}
				resp = requests.post("https://api.imgbb.com/1/upload", files=files, params=params)
				
				if resp.status_code != 200:
					print(f"ImgBB Error: {resp.text}")
					return jsonify({"error": f"Failed to upload to external provider: {resp.text}"}), 502
				
				result = resp.json()
				if not result.get("success"):
					return jsonify({"error": "External provider reported failure"}), 502
					
				# Return the direct display URL
				return jsonify({"url": result["data"]["url"]})

		except Exception as e:
			print(f"Upload exception: {e}")
			import traceback
			traceback.print_exc()
			return jsonify({"error": f"Internal upload error: {str(e)}"}), 500

	@app.route("/api/settings", methods=["POST"])
	@token_required
	def update_settings():
		payload = request.get_json() or {}
		data = read_content()
		# Merge settings
		current_settings = data.get("settings", {})
		current_settings.update(payload)
		data["settings"] = current_settings
		write_content(data)
		return jsonify(current_settings)

	@app.route("/api/fetch-reel", methods=["POST"])
	@token_required
	def fetch_reel():
		data = request.get_json() or {}
		url = data.get("url")
		if not url:
			return jsonify({"error": "URL is required"}), 400

		# Clean URL (remove query params) to improve success rate
		clean_url = url.split("?")[0]
		print(f"DEBUG: Cleaned URL: {clean_url}")

		# METHOD 1: Cobalt API (Primary - Best for Server Environments)
		try:
			print(f"DEBUG: Attempting Cobalt API for {clean_url}")
			headers = {
				"Accept": "application/json",
				"Content-Type": "application/json",
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
			}
			cobalt_payload = {"url": clean_url}
			cobalt_resp = requests.post("https://api.cobalt.tools/api/json", json=cobalt_payload, headers=headers, timeout=15)
			
			if cobalt_resp.status_code == 200:
				c_data = cobalt_resp.json()
				download_link = c_data.get("url")
				
				if download_link:
					print(f"DEBUG: Cobalt success. Downloading video...")
					c_video = requests.get(download_link, stream=True)
					
					filename = f"{uuid.uuid4()}_cobalt.mp4"
					filepath = os.path.join(STATIC_REELS_DIR, filename)
					
					with open(filepath, 'wb') as f:
						for chunk in c_video.iter_content(chunk_size=8192):
							f.write(chunk)
							
					# Upload to Cloudinary
					upload_result = cloudinary.uploader.upload(filepath, resource_type="video")
					cloudinary_url = upload_result.get("secure_url")
					thumbnail_url = cloudinary_url.rsplit('.', 1)[0] + '.jpg'
					
					if os.path.exists(filepath):
						os.remove(filepath)
						
					return jsonify({"url": cloudinary_url, "thumbnail": thumbnail_url, "embedUrl": url})
			else:
				print(f"DEBUG: Cobalt failed {cobalt_resp.status_code}: {cobalt_resp.text}")
					
		except Exception as e:
			print(f"Cobalt API failed: {e}")

		# METHOD 2: yt-dlp REMOVED (Caused rate-limit errors and delay on PythonAnywhere)
		# If Cobalt fails, we go straight to Link Fallback (Client-side Embed).

		# FINAL FALLBACK: Link Only (Iframe)
		print("DEBUG: Download failed. Using fallback link.")
		return jsonify({
			"url": url, 
			"thumbnail": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400", 
			"embedUrl": url,
			"fallback": True
		})

	@app.route("/static/reels/<path:filename>")
	def serve_reel(filename):
		return send_from_directory(STATIC_REELS_DIR, filename)

	@app.route("/api/<resource>", methods=["POST", "GET"])
	def api_collection(resource):
		mapped = resource_map.get(resource)
		if not mapped:
			return jsonify({"error": "Unknown resource"}), 404
		data = read_content()
		if request.method == "GET":
			return jsonify({mapped: data.get(mapped, [])})
		# POST -> create (protected)
		auth = token_required(lambda: None)
		resp = auth()
		if isinstance(resp, tuple) and resp[1] >= 400:
			return resp
		payload = request.get_json() or {}
		items = data.get(mapped, [])
		# assign id
		max_id = max([it.get("id", 0) for it in items], default=0)
		payload["id"] = max_id + 1
		items.append(payload)
		data[mapped] = items
		write_content(data)
		return jsonify(payload), 201

	@app.route("/api/<resource>/<int:item_id>", methods=["PUT", "DELETE"]) 
	def api_item(resource, item_id):
		mapped = resource_map.get(resource)
		if not mapped:
			return jsonify({"error": "Unknown resource"}), 404
		# Protected
		auth = token_required(lambda: None)
		resp = auth()
		if isinstance(resp, tuple) and resp[1] >= 400:
			return resp
		data = read_content()
		items = data.get(mapped, [])
		idx = find_item_by_id(items, item_id)
		if idx is None:
			return jsonify({"error": "Not found"}), 404
		if request.method == "DELETE":
			items.pop(idx)
			data[mapped] = items
			write_content(data)
			return jsonify({"ok": True})
		# PUT -> update
		payload = request.get_json() or {}
		payload["id"] = item_id
		items[idx] = payload
		data[mapped] = items
		write_content(data)
		return jsonify(payload)

	return app


# Create the app instance globally for WSGI
app = create_app()

if __name__ == "__main__":
	app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)

