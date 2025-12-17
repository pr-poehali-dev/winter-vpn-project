CREATE TABLE IF NOT EXISTS vpn_servers (
    id SERIAL PRIMARY KEY,
    server_id VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    country_code VARCHAR(10) NOT NULL,
    flag_emoji VARCHAR(10) NOT NULL,
    ip_address VARCHAR(50) NOT NULL,
    port INTEGER NOT NULL DEFAULT 51820,
    protocol VARCHAR(20) NOT NULL DEFAULT 'wireguard',
    ping_ms INTEGER NOT NULL,
    load_percent INTEGER NOT NULL DEFAULT 0,
    max_users INTEGER NOT NULL DEFAULT 1000,
    current_users INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vpn_sessions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    server_id VARCHAR(10) NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    connected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    disconnected_at TIMESTAMP,
    duration_seconds INTEGER DEFAULT 0,
    data_downloaded_mb NUMERIC(10, 2) DEFAULT 0,
    data_uploaded_mb NUMERIC(10, 2) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255),
    subscription_type VARCHAR(50) NOT NULL DEFAULT 'free',
    subscription_expires_at TIMESTAMP,
    total_connections INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vpn_sessions_user_id ON vpn_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_vpn_sessions_server_id ON vpn_sessions(server_id);
CREATE INDEX IF NOT EXISTS idx_vpn_sessions_status ON vpn_sessions(status);

INSERT INTO vpn_servers (server_id, name, country_code, flag_emoji, ip_address, port, ping_ms, load_percent, current_users, max_users) VALUES
('mc', 'Монако', 'MC', '🇲🇨', '185.156.72.45', 51820, 12, 23, 230, 1000),
('lu', 'Люксембург', 'LU', '🇱🇺', '185.205.210.78', 51820, 8, 45, 450, 1000),
('ch', 'Швейцария', 'CH', '🇨🇭', '185.230.126.32', 51820, 15, 67, 670, 1000),
('nl', 'Нидерланды', 'NL', '🇳🇱', '194.36.88.210', 51820, 10, 34, 340, 1000),
('sg', 'Сингапур', 'SG', '🇸🇬', '103.253.145.98', 51820, 45, 56, 560, 1000),
('is', 'Исландия', 'IS', '🇮🇸', '82.221.139.25', 51820, 25, 12, 120, 1000)
ON CONFLICT (server_id) DO NOTHING;