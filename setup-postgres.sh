#!/bin/bash
# PostgreSQL Setup Script for Proxmox
# Run this on your PostgreSQL container/server (192.168.2.124)

set -e

# Configuration
DB_NAME="arcos_db"
DB_USER="arcos_user"
DB_PASSWORD="${DB_PASSWORD:-arcos_secure_password_change_me}"

echo "=========================================="
echo "  PostgreSQL Setup for Arcos App"
echo "=========================================="

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL not found. Installing..."
    apt-get update
    apt-get install -y postgresql postgresql-contrib
    systemctl enable postgresql
    systemctl start postgresql
fi

# Create database and user
echo "Creating database and user..."
sudo -u postgres psql << EOF
-- Create user if not exists
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = '${DB_USER}') THEN
        CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';
    END IF;
END
\$\$;

-- Create database if not exists
SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
EOF

# Configure PostgreSQL to accept connections from Docker network
echo "Configuring PostgreSQL for remote connections..."

# Find postgresql.conf location
PG_CONF=$(sudo -u postgres psql -t -P format=unaligned -c "SHOW config_file;")
PG_HBA=$(sudo -u postgres psql -t -P format=unaligned -c "SHOW hba_file;")

# Allow connections from all interfaces (Docker network)
if ! grep -q "listen_addresses = '\*'" "$PG_CONF"; then
    echo "listen_addresses = '*'" >> "$PG_CONF"
fi

# Allow connections from Docker bridge network (172.x.x.x) and local network (192.168.x.x)
if ! grep -q "arcos_user" "$PG_HBA"; then
    echo "# Allow Arcos app connections" >> "$PG_HBA"
    echo "host    ${DB_NAME}    ${DB_USER}    172.0.0.0/8    md5" >> "$PG_HBA"
    echo "host    ${DB_NAME}    ${DB_USER}    192.168.0.0/16    md5" >> "$PG_HBA"
fi

# Restart PostgreSQL
echo "Restarting PostgreSQL..."
systemctl restart postgresql

echo ""
echo "=========================================="
echo "  PostgreSQL Setup Complete!"
echo "=========================================="
echo ""
echo "Database: ${DB_NAME}"
echo "User: ${DB_USER}"
echo "Password: ${DB_PASSWORD}"
echo ""
echo "Connection string:"
echo "postgresql://${DB_USER}:${DB_PASSWORD}@192.168.2.124:5432/${DB_NAME}"
echo ""
echo "Make sure port 5432 is accessible from your Docker containers!"
