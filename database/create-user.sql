-- Script per creare un utente MySQL dedicato per l'applicazione

-- Crea l'utente dfreport con password sicura
-- IMPORTANTE: Cambia questa password in produzione!
CREATE USER IF NOT EXISTS 'dfreport'@'localhost' IDENTIFIED BY 'DFReport2024!';

-- Garantisci tutti i privilegi sul database dfreport_db
GRANT ALL PRIVILEGES ON dfreport_db.* TO 'dfreport'@'localhost';

-- Applica le modifiche
FLUSH PRIVILEGES;

-- Mostra l'utente creato
SELECT User, Host FROM mysql.user WHERE User = 'dfreport';
