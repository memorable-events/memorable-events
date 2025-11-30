import sqlite3
from werkzeug.security import generate_password_hash
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "data.db")

def reset_password():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    new_pass = "admin"
    hashed = generate_password_hash(new_pass)
    
    # Check if admin exists
    cur.execute("SELECT id FROM admins LIMIT 1")
    row = cur.fetchone()
    
    if row:
        print(f"Updating existing admin (id={row[0]}) password to '{new_pass}'...")
        cur.execute("UPDATE admins SET password = ? WHERE id = ?", (hashed, row[0]))
    else:
        print(f"No admin found. Creating new admin 'admin' with password '{new_pass}'...")
        cur.execute("INSERT INTO admins (username, password) VALUES (?, ?)", ("admin", hashed))
    
    conn.commit()
    conn.close()
    print("Done. You can now login with:")
    print(f"Username: admin")
    print(f"Password: {new_pass}")

if __name__ == "__main__":
    reset_password()
