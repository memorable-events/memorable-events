-- Schema for MySQL / SQLite
-- Creates tables used by the Flask backend.

CREATE TABLE IF NOT EXISTS admins (
	id INTEGER PRIMARY KEY AUTO_INCREMENT,
	username VARCHAR(255) NOT NULL UNIQUE,
	password TEXT NOT NULL,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
	id INTEGER PRIMARY KEY AUTO_INCREMENT,
	title TEXT,
	description TEXT,
	date DATETIME,
	metadata TEXT,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inquiries (
	id INTEGER PRIMARY KEY AUTO_INCREMENT,
	name VARCHAR(255),
	email VARCHAR(255),
	message TEXT,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Note: For SQLite, replace AUTO_INCREMENT / DATETIME defaults as appropriate,
-- or simply use the Flask app's automatic initialization which creates compatible tables.

