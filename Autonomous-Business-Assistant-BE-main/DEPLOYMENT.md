# Deployment Guide - Supply Chain Management System

## Production Deployment Checklist

### 1. Pre-Deployment Preparation

#### Environment Configuration
```bash
# Update .env for production
DEBUG=False
SECRET_KEY=<generate-strong-secret-key>
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DB_NAME=supply_chain_prod
DB_USER=scm_user
DB_PASSWORD=<strong-password>
DB_HOST=<production-db-host>
DB_PORT=5432

# Redis
REDIS_HOST=<production-redis-host>
REDIS_PORT=6379

# OpenAI
OPENAI_API_KEY=<production-api-key>
OPENAI_MODEL=gpt-4
```

#### Generate Secret Key
```python
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

### 2. Database Setup

```bash
# Connect to production PostgreSQL
psql -h <host> -U postgres

# Create production database and user
CREATE DATABASE supply_chain_prod;
CREATE USER scm_user WITH PASSWORD 'strong_password_here';
ALTER ROLE scm_user SET client_encoding TO 'utf8';
ALTER ROLE scm_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE scm_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE supply_chain_prod TO scm_user;

# Exit psql
\q
```

### 3. Application Setup

```bash
# Clone repository
git clone <your-repo-url>
cd supply_chain_project

# Create virtual environment
python3.10 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput

# Test configuration
python manage.py check --deploy
```

### 4. Gunicorn Setup

#### Install Gunicorn
```bash
pip install gunicorn
```

#### Create systemd service file
```bash
sudo nano /etc/systemd/system/supply_chain.service
```

```ini
[Unit]
Description=Supply Chain Management Gunicorn Service
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/supply_chain
Environment="PATH=/var/www/supply_chain/venv/bin"
ExecStart=/var/www/supply_chain/venv/bin/gunicorn \
    --workers 4 \
    --bind 0.0.0.0:8000 \
    --timeout 300 \
    --access-logfile /var/log/supply_chain/access.log \
    --error-logfile /var/log/supply_chain/error.log \
    config.wsgi:application

[Install]
WantedBy=multi-user.target
```

#### Enable and start service
```bash
sudo systemctl daemon-reload
sudo systemctl enable supply_chain
sudo systemctl start supply_chain
sudo systemctl status supply_chain
```

### 5. Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/supply_chain
```

```nginx
upstream supply_chain_app {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 10M;

    access_log /var/log/nginx/supply_chain_access.log;
    error_log /var/log/nginx/supply_chain_error.log;

    location /static/ {
        alias /var/www/supply_chain/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        proxy_pass http://supply_chain_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 300s;
        proxy_read_timeout 300s;
    }
}
```

#### Enable site and restart Nginx
```bash
sudo ln -s /etc/nginx/sites-available/supply_chain /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL Certificate (Let's Encrypt)

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### 7. Redis Setup

```bash
# Install Redis
sudo apt-get install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf

# Set password
requirepass your_strong_redis_password

# Restart Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

Update .env:
```
REDIS_PASSWORD=your_strong_redis_password
```

Update settings.py:
```python
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': f"redis://:{os.getenv('REDIS_PASSWORD')}@{os.getenv('REDIS_HOST')}:{os.getenv('REDIS_PORT')}/{os.getenv('REDIS_DB')}",
        # ... rest of config
    }
}
```

### 8. Monitoring and Logging

#### Log Rotation
```bash
sudo nano /etc/logrotate.d/supply_chain
```

```
/var/log/supply_chain/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload supply_chain
    endscript
}
```

#### Monitoring with systemd
```bash
# View logs
sudo journalctl -u supply_chain -f

# Check status
sudo systemctl status supply_chain

# Restart service
sudo systemctl restart supply_chain
```

### 9. Backup Strategy

#### Database Backup Script
```bash
#!/bin/bash
# /usr/local/bin/backup_supply_chain_db.sh

BACKUP_DIR="/var/backups/supply_chain"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="supply_chain_prod"
DB_USER="scm_user"

mkdir -p $BACKUP_DIR

pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: db_backup_$TIMESTAMP.sql.gz"
```

#### Set up cron job
```bash
sudo crontab -e
```

```
# Daily database backup at 2 AM
0 2 * * * /usr/local/bin/backup_supply_chain_db.sh
```

### 10. Security Hardening

#### Firewall (UFW)
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

#### Fail2Ban
```bash
sudo apt-get install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

#### Environment Variables Protection
```bash
# Secure .env file
chmod 600 /var/www/supply_chain/.env
chown www-data:www-data /var/www/supply_chain/.env
```

### 11. Performance Tuning

#### PostgreSQL Configuration
```sql
-- /etc/postgresql/14/main/postgresql.conf

# Memory
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 16MB
maintenance_work_mem = 128MB

# Connections
max_connections = 100

# Query Performance
random_page_cost = 1.1
effective_io_concurrency = 200
```

#### Gunicorn Worker Configuration
```bash
# Calculate workers: (2 x CPU cores) + 1
# For 4 CPU cores: --workers 9

ExecStart=/var/www/supply_chain/venv/bin/gunicorn \
    --workers 9 \
    --worker-class gthread \
    --threads 2 \
    --worker-connections 1000 \
    --max-requests 10000 \
    --max-requests-jitter 1000 \
    --timeout 300 \
    --bind 0.0.0.0:8000 \
    config.wsgi:application
```

### 12. Health Checks

#### Monitoring Script
```bash
#!/bin/bash
# /usr/local/bin/check_supply_chain_health.sh

API_URL="https://yourdomain.com/api/supply-chain/health/"

response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

if [ $response -eq 200 ]; then
    echo "$(date): API is healthy"
else
    echo "$(date): API is down (HTTP $response)"
    # Send alert (email, Slack, etc.)
    systemctl restart supply_chain
fi
```

#### Cron job for health checks
```bash
*/5 * * * * /usr/local/bin/check_supply_chain_health.sh >> /var/log/supply_chain/health_check.log 2>&1
```

### 13. Continuous Deployment

#### Basic deployment script
```bash
#!/bin/bash
# /usr/local/bin/deploy_supply_chain.sh

set -e

cd /var/www/supply_chain

# Pull latest code
git pull origin main

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Restart service
sudo systemctl restart supply_chain

echo "Deployment completed successfully!"
```

### 14. Environment-Specific Settings

#### Production settings override
```python
# config/settings_prod.py

from .settings import *

# Security
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# HSTS
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Database Connection Pooling
DATABASES['default']['CONN_MAX_AGE'] = 600

# Logging
LOGGING['handlers']['file'] = {
    'class': 'logging.handlers.RotatingFileHandler',
    'filename': '/var/log/supply_chain/django.log',
    'maxBytes': 1024 * 1024 * 10,  # 10 MB
    'backupCount': 10,
    'formatter': 'verbose',
}
```

### 15. Post-Deployment Verification

```bash
# Test API endpoints
curl https://yourdomain.com/api/supply-chain/health/
curl https://yourdomain.com/api/supply-chain/status/

# Check logs
sudo tail -f /var/log/supply_chain/error.log
sudo tail -f /var/log/nginx/supply_chain_error.log

# Monitor system resources
htop
iostat
```

### 16. Rollback Procedure

```bash
#!/bin/bash
# Quick rollback script

cd /var/www/supply_chain

# Checkout previous version
git log --oneline -5  # View recent commits
git checkout <previous-commit-hash>

# Restart service
sudo systemctl restart supply_chain

echo "Rollback completed"
```

## Troubleshooting Production Issues

### High Memory Usage
```bash
# Check process memory
ps aux | grep gunicorn | awk '{sum+=$6} END {print sum/1024 " MB"}'

# Reduce workers if needed
sudo nano /etc/systemd/system/supply_chain.service
# Decrease --workers value
```

### Database Connection Issues
```bash
# Check PostgreSQL connections
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"

# Increase max_connections if needed
sudo nano /etc/postgresql/14/main/postgresql.conf
```

### Slow API Responses
```bash
# Check Redis cache
redis-cli
> INFO stats
> SLOWLOG get 10

# Monitor database queries
# Add to settings.py temporarily:
LOGGING = {
    'loggers': {
        'django.db.backends': {
            'level': 'DEBUG',
        }
    }
}
```

## Cost Optimization

### Resource Sizing Recommendations

**Small Deployment (< 100 requests/hour)**
- CPU: 2 cores
- RAM: 4 GB
- Gunicorn workers: 5
- PostgreSQL: shared_buffers = 128MB

**Medium Deployment (100-1000 requests/hour)**
- CPU: 4 cores
- RAM: 8 GB
- Gunicorn workers: 9
- PostgreSQL: shared_buffers = 256MB

**Large Deployment (> 1000 requests/hour)**
- CPU: 8+ cores
- RAM: 16+ GB
- Gunicorn workers: 17+
- PostgreSQL: shared_buffers = 512MB
- Consider horizontal scaling

## Support and Maintenance

### Regular Maintenance Tasks

**Daily:**
- Check error logs
- Verify backups completed
- Monitor API response times

**Weekly:**
- Review security logs
- Update dependencies (security patches)
- Analyze slow queries

**Monthly:**
- Full security audit
- Performance optimization review
- Capacity planning review

### Emergency Contacts

Keep this information updated:
- Database Administrator: [contact]
- DevOps Engineer: [contact]
- On-Call Developer: [contact]
- Hosting Provider Support: [contact]

---

**Deployment Completed! 🚀**

Your Supply Chain Management System is now running in production.
