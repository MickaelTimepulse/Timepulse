#!/bin/bash

# Script de backup de la base de données Supabase
# Usage: ./backup-database.sh [table_name]

# Charger les variables d'environnement
source .env

DATE=$(date +%Y_%m_%d_%H%M%S)
BACKUP_DIR="backups"
mkdir -p "$BACKUP_DIR"

# Fonction de backup pour une table spécifique
backup_table() {
    local TABLE=$1
    local OUTPUT_FILE="${BACKUP_DIR}/backup_${TABLE}_${DATE}.sql"

    echo "🔄 Backup de la table: $TABLE"

    # Utiliser psql pour exporter les données
    PGPASSWORD="${SUPABASE_DB_PASSWORD}" psql \
        -h "${SUPABASE_DB_HOST}" \
        -U "${SUPABASE_DB_USER}" \
        -d "${SUPABASE_DB_NAME}" \
        -p "${SUPABASE_DB_PORT:-5432}" \
        -c "COPY (SELECT * FROM ${TABLE}) TO STDOUT" > "$OUTPUT_FILE"

    if [ $? -eq 0 ]; then
        echo "✅ Backup réussi: $OUTPUT_FILE"
    else
        echo "❌ Erreur lors du backup de $TABLE"
    fi
}

# Fonction de backup complet
backup_all() {
    echo "🚀 Démarrage du backup complet..."

    # Liste des tables principales
    TABLES=(
        "events"
        "races"
        "organizers"
        "athletes"
        "registrations"
        "entries"
        "email_logs"
        "homepage_features"
        "service_pages"
        "settings"
        "carpooling_offers"
        "carpooling_bookings"
        "bib_exchange_listings"
    )

    for TABLE in "${TABLES[@]}"; do
        backup_table "$TABLE"
    done

    echo "✅ Backup complet terminé dans le dossier: $BACKUP_DIR"
}

# Backup du schéma complet
backup_schema() {
    local OUTPUT_FILE="${BACKUP_DIR}/schema_complete_${DATE}.sql"
    echo "🔄 Backup du schéma complet..."

    PGPASSWORD="${SUPABASE_DB_PASSWORD}" pg_dump \
        -h "${SUPABASE_DB_HOST}" \
        -U "${SUPABASE_DB_USER}" \
        -d "${SUPABASE_DB_NAME}" \
        -p "${SUPABASE_DB_PORT:-5432}" \
        --schema-only \
        > "$OUTPUT_FILE"

    if [ $? -eq 0 ]; then
        echo "✅ Schéma sauvegardé: $OUTPUT_FILE"
    else
        echo "❌ Erreur lors du backup du schéma"
    fi
}

# Menu principal
if [ -z "$1" ]; then
    echo "📦 Script de backup Timepulse"
    echo "Usage:"
    echo "  ./backup-database.sh [table_name]  - Backup d'une table spécifique"
    echo "  ./backup-database.sh all           - Backup de toutes les tables"
    echo "  ./backup-database.sh schema        - Backup du schéma uniquement"
    exit 1
fi

case "$1" in
    "all")
        backup_all
        ;;
    "schema")
        backup_schema
        ;;
    *)
        backup_table "$1"
        ;;
esac
