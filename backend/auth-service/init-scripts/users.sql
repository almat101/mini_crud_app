-- Inizializzazione tabella users 
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert utente demo
INSERT INTO users (username, email, password_hash)
VALUES ('demo', 'demo@demo.com', '')
ON CONFLICT (email) DO NOTHING;

