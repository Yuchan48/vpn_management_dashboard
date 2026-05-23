# Deployment Guide

This guide explains how to deploy the WireGuard Management Platform on Ubuntu Linux using:

- WireGuard
- Node.js
- PM2
- Nginx
- Certbot HTTPS

---

# 1. Server Requirements

Recommended:

- Ubuntu 22.04+
- 1 vCPU minimum
- 1GB RAM minimum

Required open ports:

- `80` HTTP
- `443` HTTPS
- `51820/udp` WireGuard

---

# 2. Install System Dependencies

Update packages:

```bash
sudo apt update
```

Install required packages:

```bash
sudo apt install -y \
  nginx \
  wireguard \
  certbot \
  python3-certbot-nginx \
  git \
  curl
```

Install Node.js 20:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

sudo apt install -y nodejs
```

Install PM2 globally:

```bash
sudo npm install -g pm2
```

---

# 3. Clone Repository

Clone the repository:

```bash
git clone https://github.com/Yuchan48/vpn_management_dashboard.git
```

Move into the project directory:

```bash
cd vpn_management_dashboard
```

---

# 4. Configure Environment Variables

Create backend environment file:

```bash
cd backend

cp .env.example .env
```

Update `.env` with your production values.

---

# 5. Generate WireGuard Keys

Move into WireGuard directory:

```bash
cd /etc/wireguard
```

Generate server keys:

```bash
wg genkey | tee server_private.key | wg pubkey > server_public.key
```

Restrict private key permissions:

```bash
chmod 600 server_private.key
```

View public key:

```bash
cat server_public.key
```

Copy the public key into:

```env
SERVER_PUBLIC_KEY=your_public_key
```

---

# 6. Configure WireGuard

Edit WireGuard configuration:

```bash
sudo nano /etc/wireguard/wg0.conf
```

Enable IP forwarding:

```bash
sudo nano /etc/sysctl.conf
```

Uncomment:

```txt
net.ipv4.ip_forward=1
```

Apply changes:

```bash
sudo sysctl -p
```

Enable WireGuard on boot:

```bash
sudo systemctl enable wg-quick@wg0
```

Start WireGuard:

```bash
sudo systemctl start wg-quick@wg0
```

Verify status:

```bash
sudo wg
```

---

# 7. Configure Nginx

Update domain names inside:

```txt
nginx/frontend.conf
```

Replace:

```txt
wg-management-dashboard.duckdns.org
```

with your own domain.

Copy nginx config into nginx sites directory:

```bash
sudo cp nginx/frontend.conf /etc/nginx/sites-available/vpn-dashboard
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/vpn-dashboard \
           /etc/nginx/sites-enabled/vpn-dashboard
```

Test nginx configuration:

```bash
sudo nginx -t
```

Reload nginx:

```bash
sudo systemctl reload nginx
```

---

# 8. Configure HTTPS

Generate SSL certificates using Certbot:

```bash
sudo certbot --nginx
```

Verify certificate auto-renewal:

```bash
sudo certbot renew --dry-run
```

---

# 9. Configure PM2

Create production PM2 config:

```bash
cd backend

cp ecosystem.config.example.js ecosystem.config.js
```

Update `ecosystem.config.js` with production values.

Start backend server:

```bash
pm2 start ecosystem.config.js --env production
```

Save PM2 process list:

```bash
pm2 save
```

Enable PM2 startup on reboot:

```bash
pm2 startup
```

View backend logs:

```bash
pm2 logs vpn-backend
```

---

# 10. Build Frontend

Move into frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Build frontend:

```bash
npm run build
```

Create nginx frontend directory:

```bash
sudo mkdir -p /usr/local/var/www/vpn-dashboard
```

Copy frontend build files:

```bash
sudo cp -r dist/* /usr/local/var/www/vpn-dashboard/
```

Restart nginx:

```bash
sudo systemctl restart nginx
```

---

# 11. Updating Deployment

## Backend Update

```bash
git pull

cd backend

npm install

pm2 restart vpn-backend
```

## Frontend Update

```bash
cd frontend

npm install

npm run build

sudo rm -rf /usr/local/var/www/vpn-dashboard/*

sudo cp -r dist/* /usr/local/var/www/vpn-dashboard/
```

Restart nginx:

```bash
sudo systemctl restart nginx
```

---

# 12. Useful Commands

WireGuard status:

```bash
sudo wg
```

PM2 logs:

```bash
pm2 logs vpn-backend
```

Nginx error logs:

```bash
sudo tail -f /var/log/nginx/error.log
```

Restart WireGuard:

```bash
sudo systemctl restart wg-quick@wg0
```

Restart nginx:

```bash
sudo systemctl restart nginx
```
