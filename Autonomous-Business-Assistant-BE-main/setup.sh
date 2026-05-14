#!/bin/bash
# Quick setup script for Supply Chain Management System

echo "🚀 Setting up Supply Chain Management System..."

# Check Python version
echo "Checking Python version..."
python3 --version

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your database and API credentials!"
else
    echo "✓ .env file already exists"
fi

# Database setup
echo ""
echo "📦 Database Setup"
echo "Run the following commands to set up PostgreSQL:"
echo "  sudo -u postgres psql"
echo "  CREATE DATABASE supply_chain_db;"
echo "  CREATE USER postgres WITH PASSWORD 'your-password';"
echo "  GRANT ALL PRIVILEGES ON DATABASE supply_chain_db TO postgres;"
echo "  \\q"
echo ""
echo "Then run:"
echo "  python manage.py makemigrations"
echo "  python manage.py migrate"
echo "  python manage.py createsuperuser"
echo ""

# Redis check
echo "🔧 Checking Redis..."
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo "✓ Redis is running"
    else
        echo "⚠️  Redis is installed but not running. Start it with:"
        echo "  sudo systemctl start redis-server"
    fi
else
    echo "⚠️  Redis not found. Install it with:"
    echo "  Ubuntu/Debian: sudo apt-get install redis-server"
    echo "  macOS: brew install redis"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your credentials"
echo "2. Set up PostgreSQL database (see instructions above)"
echo "3. Run migrations: python manage.py migrate"
echo "4. Create superuser: python manage.py createsuperuser"
echo "5. Start server: python manage.py runserver"
echo ""
echo "API will be available at: http://localhost:8000"
echo "Admin interface: http://localhost:8000/admin/"
