-- Database schema per l'applicazione di gestione familiare

-- Creazione del database
CREATE DATABASE IF NOT EXISTS dfreport_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE dfreport_db;

-- Tabella Utenti
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cognome VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    data_nascita DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabella famiglia
CREATE TABLE IF NOT EXISTS famiglie (
    id VARCHAR(36) PRIMARY KEY,
    cognome_familiare VARCHAR(100) NOT NULL,
    codice_invito VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_codice_invito (codice_invito)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabella di join Utenti-famiglia con ruolo
CREATE TABLE IF NOT EXISTS membri_famiglia (
    user_id VARCHAR(36) NOT NULL,
    famiglia_id VARCHAR(36) NOT NULL,
    ruolo ENUM('UTENTE', 'MEMBRO', 'LAVORATORE', 'CAPOFAMIGLIA') NOT NULL DEFAULT 'MEMBRO',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, famiglia_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (famiglia_id) REFERENCES famiglie(id) ON DELETE CASCADE,
    INDEX idx_famiglia (famiglia_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabella Abitazioni
CREATE TABLE IF NOT EXISTS abitazioni (
    id VARCHAR(36) PRIMARY KEY,
    famiglia_id VARCHAR(36) NOT NULL,
    indirizzo VARCHAR(255) NOT NULL,
    citta VARCHAR(100) NOT NULL,
    cap VARCHAR(10) NOT NULL,
    provincia VARCHAR(2) NOT NULL,
    descrizione TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (famiglia_id) REFERENCES famiglie(id) ON DELETE CASCADE,
    INDEX idx_famiglia (famiglia_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabella Contratti di Utenza
CREATE TABLE IF NOT EXISTS contratti_utenza (
    id VARCHAR(36) PRIMARY KEY,
    abitazione_id VARCHAR(36) NOT NULL,
    tipo_utenza ENUM('ELETTRICITA', 'GAS', 'ACQUA', 'INTERNET', 'TELEFONO', 'RIFIUTI', 'ALTRO') NOT NULL,
    fornitore VARCHAR(100) NOT NULL,
    piano_tariffario VARCHAR(100) NOT NULL,
    data_inizio DATE NOT NULL,
    durata_giorni INT NOT NULL,
    costo_periodico DECIMAL(10, 2) NOT NULL,
    periodicita ENUM('MENSILE', 'BIMESTRALE', 'TRIMESTRALE', 'SEMESTRALE', 'ANNUALE') NOT NULL,
    scadenza_pagamento DATE,
    file_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (abitazione_id) REFERENCES abitazioni(id) ON DELETE CASCADE,
    INDEX idx_abitazione (abitazione_id),
    INDEX idx_scadenza (scadenza_pagamento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabella Movimenti (Spese e Introiti)
CREATE TABLE IF NOT EXISTS movimenti (
    id VARCHAR(36) PRIMARY KEY,
    famiglia_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    tipo ENUM('SPESA', 'INTROITO') NOT NULL,
    descrizione VARCHAR(255) NOT NULL,
    importo DECIMAL(10, 2) NOT NULL,
    data DATE NOT NULL,
    categoria ENUM(
        -- Categorie Spesa
        'ALIMENTARI', 'TRASPORTI', 'ABITAZIONI', 'SALUTE', 'SVAGO',
        'ISTRUZIONE', 'IMPOSTE', 'ANIMALI', 'STRAORDINARIE',
        -- Categorie Introito
        'REDDITO', 'OCCASIONALI', 'SUSSIDI', 'INTERESSI'
    ) NOT NULL,
    responsabile ENUM('PERSONALE', 'FAMILIARE'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (famiglia_id) REFERENCES famiglie(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_famiglia (famiglia_id),
    INDEX idx_user (user_id),
    INDEX idx_data (data),
    INDEX idx_tipo (tipo),
    INDEX idx_categoria (categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabella per le sessioni di NextAuth (opzionale, ma utile)
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    expires TIMESTAMP NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_token (session_token),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabella per i token di verifica (opzionale)
CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires TIMESTAMP NOT NULL,
    PRIMARY KEY (identifier, token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
