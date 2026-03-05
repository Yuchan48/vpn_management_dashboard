-- Table to store VPN clients
CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    -- Device name; must be unique
    public_key TEXT,
    -- WireGuard public key
    ip_address TEXT,
    -- VPN internal IP address
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- Table to store admin users
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
