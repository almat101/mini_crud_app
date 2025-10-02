-- Inizializzazione tabella products
CREATE TABLE products (  
    id SERIAL PRIMARY KEY,  
    name VARCHAR(255) NOT NULL,  
    price NUMERIC(10, 2) NOT NULL,  
    category VARCHAR(100),
    user_id INTEGER NOT NULL
);


-- Insert sample data into the products table
INSERT INTO products (name, price, category, user_id) VALUES 
('Mac m2', 999.99, 'Electronics', 1),
('Pixel 9', 599.99, 'Electronics', 2),
('Desk Chair', 149.99, 'Furniture', 1),
('Coffee Table', 89.99, 'Furniture', 3),
('Headphones', 49.99, 'Accessories', 2),
('Backpack', 39.99, 'Accessories', 1);



-- Se avessi usato un solo DATABASE per contenere entrambe le tabelle prodotti e utenti avrei potuto usare
-- una foreign key per collegare la tabella products con un utente specifico tramite il suo id
-- Nelle app a microservizi basta usare un ID per mantenere la logica tra la tabella products e il suo ID utente apposito
