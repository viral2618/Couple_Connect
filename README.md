# Couple Connect - Production Deployment Guide

A Next.js application for couples with real-time chat, games, and video calling features.

## 🚀 Quick Start (Development)

```bash
npm install
npm run dev
```

## 🏭 Production Deployment

### Prerequisites

- Ubuntu 20.04+ server
- Domain name pointed to your server
- Docker and Docker Compose
- SSL certificate (Let's Encrypt recommended)

### 1. Server Setup

Run the setup script on your production server:

```bash
chmod +x setup-production.sh
./setup-production.sh
```

### 2. Environment Configuration

Update `.env.production` with your production values:

```env
# Database
DATABASE_URL="your-mongodb-connection-string"

# Security
JWT_SECRET="your-super-secure-jwt-secret"
SESSION_SECRET="your-super-secure-session-secret"

# Email
EMAIL_HOST="smtp.gmail.com"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Search
MEILISEARCH_MASTER_KEY="your-meilisearch-master-key"

# Domain
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

### 3. SSL Certificate

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 4. Deploy

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 GitHub Actions CI/CD

Set up these secrets in your GitHub repository:

- `DATABASE_URL`: Your MongoDB connection string
- `JWT_SECRET`: Your JWT secret
- `DOCKER_USERNAME`: Your Docker Hub username
- `DOCKER_PASSWORD`: Your Docker Hub password
- `HOST`: Your server IP address
- `USERNAME`: Your server username
- `SSH_KEY`: Your private SSH key

## 📊 Monitoring

### Health Check

```bash
curl https://your-domain.com/api/health
```

### Logs

```bash
docker-compose -f docker-compose.prod.yml logs -f app
```

### Database Status

```bash
node check-db.js
```

## 🔒 Security Features

- Rate limiting on API endpoints
- HTTPS enforcement
- Security headers
- JWT authentication
- Session management
- Input validation
- CORS protection

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │────│   Next.js App   │────│    MongoDB      │
│  Load Balancer  │    │   (Docker)      │    │   (Atlas)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────│   MeiliSearch   │──────────────┘
                        │   (Docker)      │
                        └─────────────────┘
```

## 🚀 Performance Optimizations

- Docker multi-stage builds
- Static file caching
- Gzip compression
- Image optimization
- Code splitting
- Database indexing

## 🔄 Backup Strategy

### Database Backup

```bash
# MongoDB Atlas automatic backups are enabled
# For manual backup:
mongodump --uri="your-connection-string" --out=backup-$(date +%Y%m%d)
```

### Application Backup

```bash
# Backup application files
tar -czf couple-connect-backup-$(date +%Y%m%d).tar.gz /opt/couple-connect
```

## 📈 Scaling

### Horizontal Scaling

Update `docker-compose.prod.yml`:

```yaml
services:
  app:
    deploy:
      replicas: 3
    # ... rest of config
```

### Load Balancer

Configure Nginx upstream:

```nginx
upstream app {
    server app_1:3000;
    server app_2:3000;
    server app_3:3000;
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check MongoDB connection
   node check-db.js
   ```

2. **SSL Certificate Issues**
   ```bash
   # Renew certificate
   sudo certbot renew
   ```

3. **Docker Issues**
   ```bash
   # Restart services
   docker-compose -f docker-compose.prod.yml restart
   ```

### Logs Location

- Application: `docker logs couple-connect_app_1`
- Nginx: `/var/log/nginx/`
- System: `journalctl -u docker`

## 📞 Support

For production support:
- Check logs first
- Review monitoring dashboards
- Contact system administrator

## 🔐 Security Checklist

- [ ] SSL certificate installed and auto-renewal configured
- [ ] Firewall configured (ports 80, 443, 22 only)
- [ ] Strong passwords and secrets
- [ ] Regular security updates
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting configured
- [ ] Rate limiting enabled
- [ ] Database access restricted

## 📝 License

Private - All rights reserved