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
VALUES ('demo', 'demo@demo.com', '$2b$10$Sg4fgd3LWumHL1hMNvfpweod6v2ZtBYMD2vEyPp7Z2lW/l21lJ7Qu')
ON CONFLICT (email) DO NOTHING;
-- demo demo@demo.com demotest
