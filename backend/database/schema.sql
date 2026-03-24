-- Table to store VPN clients
CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    -- Device name; must be unique
    public_key TEXT,
    -- WireGuard public key
    ip_address TEXT,
    -- VPN internal IP address
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    -- User ID
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- Table to store users
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- Index to optimize queries filtering clients by user_id
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_public_key ON clients(public_key);
