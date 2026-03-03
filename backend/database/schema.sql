-- Table to store VPN clients
CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Unique ID for each client

    name TEXT NOT NULL UNIQUE,              -- Device name; must be unique

    -- WireGuard public key
    -- Nullable at this stage because keys are not generated immediately
    public_key TEXT,

    /*
    -- WireGuard private key
    -- This is only for development purposes. In production, .conf files should be generated on the server, sent back to the user, and private keys should not be stored in the database.

    private_key TEXT,
    */

    -- VPN internal IP address
    -- Nullable at this stage because IP is assigned after creation
    ip_address TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP  -- Timestamp when client is created
);
