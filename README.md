# Couple Connect - Production Deployment Guide

A Next.js application for couples with real-time chat and video calling features. 

## 🚀 Quick Start (Development)

```bash
npm install
npm run dev
```

## 📹 Video Calling Setup

For video calling feature setup, see [VIDEO_CALLING_SETUP.md](VIDEO_CALLING_SETUP.md)

```bash
# Quick install
npm install mediasoup@^3.13.0 mediasoup-client@^3.7.0
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

# Video Calling (Production only) - CRITICAL!
# Set this to your server's PUBLIC IP address
# Find it with: curl ifconfig.me
MEDIASOUP_ANNOUNCED_IP="your-server-public-ip"
MEDIASOUP_MIN_PORT=10000
MEDIASOUP_MAX_PORT=10100
```

**IMPORTANT:** For video calling to work, you MUST set `MEDIASOUP_ANNOUNCED_IP` to your server's public IP address.

### 2.1 Quick Video Setup

```bash
# Automatically configure video calling
chmod +x setup-video-production.sh
./setup-video-production.sh
```

### 3. SSL Certificate

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 4. Deploy

```bash
# Open MediaSoup ports
sudo ufw allow 10000:10100/udp
sudo ufw allow 10000:10100/tcp

# Start services
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
- End-to-end encrypted video calls (DTLS-SRTP)

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │────│   Next.js App   │────│    MongoDB      │
│  Load Balancer  │    │   (Docker)      │    │   (Atlas)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │──────────────│   MeiliSearch   │──────────────┤
         │              │   (Docker)      │              │
         │              └─────────────────┘              │
         │                                               │
         │              ┌─────────────────┐              │
         └──────────────│   MediaSoup     │──────────────┘
                        │  (Video SFU)    │
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

### Video Calling Not Working?

```bash
# Run diagnostics
node check-video-setup.js
```

See [VIDEO_CALLING_TROUBLESHOOTING.md](VIDEO_CALLING_TROUBLESHOOTING.md) for detailed solutions.

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