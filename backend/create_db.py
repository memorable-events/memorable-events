"""Create the SQLite database and a default admin user.

Run this script from the repo (no server run):
    python create_db.py

It will create `data.db` in the `backend` folder and ensure a default admin user
is present. Use environment variables `ADMIN_USERNAME` and `ADMIN_PASSWORD` to
control the created admin credentials.
"""
import os
import sqlite3
from werkzeug.security import generate_password_hash

BASE_DIR = os.path.dirname(__file__)
DB_PATH = os.path.join(BASE_DIR, "data.db")


SQL_CREATE = [
    """
    CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        date TEXT,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS inquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """,
]


def ensure_default_admin(conn):
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM admins")
    row = cur.fetchone()
    if row and row[0] == 0:
        admin_user = os.environ.get("ADMIN_USERNAME", "admin")
        admin_pass = os.environ.get("ADMIN_PASSWORD", "admin")
        hashed = generate_password_hash(admin_pass)
        cur.execute(
            "INSERT INTO admins (username, password) VALUES (?, ?)", (admin_user, hashed)
        )
        conn.commit()
        print(f"Created default admin user '{admin_user}'. Set ADMIN_PASSWORD env var to change it.")


def main():
    os.makedirs(BASE_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    for s in SQL_CREATE:
        cur.execute(s)
    conn.commit()
    ensure_default_admin(conn)
    conn.close()
    print(f"Initialized sqlite DB at: {DB_PATH}")


if __name__ == "__main__":
    main()
