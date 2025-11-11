#!/bin/bash

echo "=== Setup Database DFReport ==="
echo ""
echo "Questo script configurerà il database MySQL per DFReport."
echo ""

# Step 1: Crea il database e le tabelle
echo "📦 Passo 1: Creazione database e tabelle..."
sudo mysql < database/schema.sql

if [ $? -ne 0 ]; then
    echo "❌ Errore nella creazione del database"
    exit 1
fi

echo "✅ Database creato!"
echo ""

# Step 2: Crea utente dedicato
echo "👤 Passo 2: Creazione utente dedicato per l'applicazione..."
sudo mysql < database/create-user.sql

if [ $? -ne 0 ]; then
    echo "❌ Errore nella creazione dell'utente"
    exit 1
fi

echo "✅ Utente creato!"
echo ""

# Step 3: Aggiorna il file .env
echo "📝 Passo 3: Aggiornamento file .env..."
if [ -f .env ]; then
    # Backup del file .env esistente
    cp .env .env.backup
    echo "   Backup creato: .env.backup"
fi

# Aggiorna le credenziali nel file .env
sed -i 's/DB_USER=root/DB_USER=dfreport/' .env
sed -i 's/DB_PASSWORD=rootpassword/DB_PASSWORD=DFReport2024!/' .env

echo "✅ File .env aggiornato!"
echo ""

echo "🎉 =============================================="
echo "   Setup completato con successo!"
echo "   =============================================="
echo ""
echo "📋 Configurazione database:"
echo "   - Database: dfreport_db"
echo "   - Utente: dfreport"
echo "   - Password: DFReport2024!"
echo "   - Host: localhost"
echo "   - Porta: 3306"
echo ""
echo "⚠️  IMPORTANTE: Cambia la password in produzione!"
echo ""
echo "🚀 Puoi ora testare l'applicazione su http://localhost:3000"
echo ""
