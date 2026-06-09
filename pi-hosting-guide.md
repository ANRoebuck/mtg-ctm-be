# Self-Hosting the Backend on a Raspberry Pi

This guide covers setting up the MTG CTM backend on a Raspberry Pi at home, bypassing the Cloudflare blocking issues caused by the current Heroku-hosted CORS proxy. Requests to Shopify stores will originate from your home's residential IP, which Cloudflare treats as normal user traffic.

---

## 1. Equipment

### Recommended: Raspberry Pi 4 Model B (2GB)

The 2GB model is sufficient for a Node.js API making outbound HTTP requests. You don't need more RAM unless you intend to run other services on the same Pi.

| Item | Where to buy (UK) | Approx. cost |
|---|---|---|
| Raspberry Pi 4 Model B 2GB | [Pimoroni](https://pimoroni.com), [The Pi Hut](https://thepihut.com), Amazon | £35–45 |
| Raspberry Pi 4 Model B 4GB (overkill but future-proof) | Same | £55–65 |
| 32GB microSD card (Class 10 / A1 rated) | Amazon, Argos | £8–12 |
| Official Raspberry Pi USB-C PSU | Pimoroni, The Pi Hut | £8–10 |
| Case (optional but recommended) | Amazon, Pimoroni | £5–15 |
| **Total (2GB, with case)** | | **~£56–82** |

> **Alternatives:**
> - **Raspberry Pi 5 (4GB, ~£70)** — faster, runs cooler under load, but meaningfully more expensive and unnecessary for this use case.
> - **An old PC or laptop** — if you have one sitting unused, this works just as well and costs nothing. x86 Docker images are more widely available than ARM ones, which simplifies some steps.
> - **Orange Pi Zero 2W (~£18)** — cheaper, but less community support and occasional driver issues. Not recommended unless you're comfortable troubleshooting.

Stock for Raspberry Pi 4 is now reliable. Pimoroni and The Pi Hut are UK-based and typically ship within a few days.

---

## 2. Setting Up the Pi

### 2a. Flash the OS

Download and install [Raspberry Pi Imager](https://www.raspberrypi.com/software/).

- Choose OS: **Raspberry Pi OS Lite (64-bit)** — no desktop, minimal footprint.
- Before flashing, click the gear icon (⚙️) in Imager and configure:
  - Set a hostname (e.g. `mtg-pi`)
  - Enable SSH
  - Set your username and password
  - Configure Wi-Fi (or use ethernet — ethernet is more reliable for a server)

Flash to the SD card, insert into the Pi, and power on.

### 2b. Connect and update

Find the Pi's IP on your local network (check your router's admin panel, or use `ping mtg-pi.local`), then SSH in:

```bash
ssh alex@mtg-pi.local
```

Update the system:

```bash
sudo apt update && sudo apt upgrade -y
```

### 2c. Install Docker

Docker lets the app run in an isolated container with consistent dependencies, and makes CI/CD straightforward.

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

Verify:

```bash
docker run hello-world
```

---

## 3. Dockerise the Backend

### 3a. Add a Dockerfile to the project

Create `Dockerfile` at the project root:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN npm run build

EXPOSE 5001

CMD ["node", "dist/app.js"]
```

### 3b. Add a docker-compose.yml

Create `docker-compose.yml` at the project root:

```yaml
services:
  backend:
    image: ghcr.io/YOUR_GITHUB_USERNAME/mtg-ctm-be:latest
    container_name: mtg-ctm-be
    restart: unless-stopped
    ports:
      - "127.0.0.1:5001:5001"
    environment:
      - NODE_ENV=production
      - PORT=5001
```

> Note: binding to `127.0.0.1:5001` rather than `0.0.0.0:5001` means the app is only reachable via the nginx reverse proxy (set up in section 5), not directly from the network.

### 3c. Remove the CORS proxy from the backend

The backend currently routes all requests through the Heroku CORS proxy, which is what Cloudflare blocks. Since Node.js doesn't have browser CORS restrictions, the proxy isn't needed.

In `src/gateway/http.ts` (or wherever `MTG_CTM_CORS_ANYWHERE` is defined), change the constant to an empty string:

```typescript
export const MTG_CTM_CORS_ANYWHERE = '';
```

This means `searchTermToUrl` in `AbstractDataGetter` will construct direct URLs to seller sites, and requests will originate from the Pi's residential IP.

> **Test this locally first** before deploying — run `npm run dev` without the proxy and verify sellers that were previously intermittent now return results consistently.

---

## 4. CI/CD — Auto-deploy on GitHub Push

The approach: GitHub Actions builds a Docker image on every push to `main`, publishes it to GitHub Container Registry (GHCR, free), and a lightweight tool called Watchtower running on the Pi polls for new images and restarts the container automatically.

### 4a. GitHub Actions workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/arm64
          push: true
          tags: ghcr.io/${{ github.repository_owner }}/mtg-ctm-be:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

> `platforms: linux/arm64` builds for the Pi 4's ARM64 architecture. If you're using an old x86 PC instead, change this to `linux/amd64`.

### 4b. Make the package public (or configure Pi auth)

Go to your GitHub package settings and set the `mtg-ctm-be` container image to **public**. This lets the Pi pull it without authentication. Alternatively, generate a Personal Access Token with `read:packages` scope and configure it on the Pi:

```bash
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

### 4c. Install Watchtower on the Pi

Watchtower watches running containers for new image versions and restarts them automatically.

Add it to `docker-compose.yml`:

```yaml
services:
  backend:
    image: ghcr.io/YOUR_GITHUB_USERNAME/mtg-ctm-be:latest
    container_name: mtg-ctm-be
    restart: unless-stopped
    ports:
      - "127.0.0.1:5001:5001"
    environment:
      - NODE_ENV=production
      - PORT=5001

  watchtower:
    image: containrrr/watchtower
    container_name: watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: --interval 300 mtg-ctm-be
```

`--interval 300` checks for a new image every 5 minutes. `mtg-ctm-be` tells Watchtower to only watch that container.

### 4d. Start everything on the Pi

```bash
docker compose up -d
```

From this point on, pushing to `main` on GitHub triggers a build, pushes the new image to GHCR, and within 5 minutes Watchtower picks it up and restarts the container on the Pi.

---

## 5. Exposing the Service to the Internet

There are two good free options. **Cloudflare Tunnel is recommended** — it requires no port forwarding and is significantly easier to secure.

---

### Option A: Cloudflare Tunnel (Recommended — free, no port forwarding)

Cloudflare Tunnel creates an outbound-only encrypted tunnel from your Pi to Cloudflare's network. No inbound ports need to be opened on your router. Traffic from the internet hits Cloudflare's edge, travels through the tunnel to your Pi, and the response goes back the same way.

**Your Pi's outbound requests to Shopify stores still originate from your residential IP** — the tunnel only affects inbound traffic to your API. The Cloudflare-blocking problem is not reintroduced.

**Prerequisites:** A domain you control with nameservers pointed at Cloudflare (Cloudflare offers free DNS hosting — transfer any domain or register one cheaply at ~£8–12/year through Cloudflare or Namecheap).

#### Setup:

```bash
# On the Pi
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64 \
  -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

# Authenticate (opens a browser on your main machine — copy the URL)
cloudflared tunnel login

# Create a tunnel
cloudflared tunnel create mtg-ctm

# Create config file
mkdir -p ~/.cloudflared
cat > ~/.cloudflared/config.yml << EOF
tunnel: mtg-ctm
credentials-file: /home/YOUR_USER/.cloudflared/TUNNEL_ID.json

ingress:
  - hostname: api.yourdomain.com
    service: http://localhost:5001
  - service: http_status:404
EOF

# Point your DNS hostname at the tunnel (replaces manual DNS setup)
cloudflared tunnel route dns mtg-ctm api.yourdomain.com

# Install as a system service so it starts on boot
sudo cloudflared service install
sudo systemctl start cloudflared
```

**Pros:** Free, no port forwarding, automatic HTTPS, zero router configuration, works behind CGNAT (some ISPs share IPs between customers, which breaks standard port forwarding).

**Cons:** Adds Cloudflare as an inbound dependency; if Cloudflare has an outage, your API is unreachable (though this is very rare). Requires owning a domain.

---

### Option B: Port forwarding + Dynamic DNS + nginx (free, more control)

If you'd rather not depend on Cloudflare for inbound traffic, this is the traditional approach.

#### Step 1: Dynamic DNS

Your home IP changes periodically. A DDNS service keeps a hostname updated to point at your current IP.

**DuckDNS** is free and straightforward:

1. Sign up at [duckdns.org](https://www.duckdns.org) and create a subdomain (e.g. `mtg-ctm.duckdns.org`).
2. On the Pi, set up the update script:

```bash
mkdir -p ~/duckdns
cat > ~/duckdns/duck.sh << 'EOF'
echo url="https://www.duckdns.org/update?domains=YOUR_SUBDOMAIN&token=YOUR_TOKEN&ip=" | curl -k -o ~/duckdns/duck.log -K -
EOF
chmod +x ~/duckdns/duck.sh

# Run every 5 minutes via cron
(crontab -l 2>/dev/null; echo "*/5 * * * * ~/duckdns/duck.sh >/dev/null 2>&1") | crontab -
```

**Pros:** Completely free, no domain purchase required, simple setup.
**Cons:** You get a `*.duckdns.org` subdomain rather than your own domain. Doesn't work behind CGNAT.

#### Step 2: Port forwarding

In your router's admin panel (usually at `192.168.1.1` or `192.168.0.1`):

- Forward external **port 443** → Pi's local IP, **port 443**
- Forward external **port 80** → Pi's local IP, **port 80** (needed for SSL certificate renewal)
- Give the Pi a static local IP in your router's DHCP settings (so the forwarding target doesn't change)

#### Step 3: nginx reverse proxy + SSL

```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

Create `/etc/nginx/sites-available/mtg-ctm`:

```nginx
server {
    listen 80;
    server_name mtg-ctm.duckdns.org;

    location / {
        proxy_pass http://127.0.0.1:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/mtg-ctm /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Obtain SSL certificate
sudo certbot --nginx -d mtg-ctm.duckdns.org
```

Certbot edits the nginx config to add HTTPS automatically and sets up auto-renewal.

**Pros:** Full control, no external service dependency for inbound traffic, your own domain if you want one.
**Cons:** Requires router access and port forwarding support, doesn't work behind CGNAT, slightly more setup.

---

## 6. Security and Rate Limiting

Whichever exposure method you use, apply these measures.

### 6a. Firewall (UFW)

```bash
sudo apt install ufw -y
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

This blocks everything except SSH and web traffic. The Docker container only listens on `127.0.0.1:5001` (set in docker-compose.yml), so it's not directly reachable from outside nginx.

### 6b. Rate limiting in nginx

Add to the nginx config (inside the `http {}` block in `/etc/nginx/nginx.conf`, or at the top of your site config):

```nginx
# Allow 30 requests per minute per IP, burst of 10
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;
```

Then inside your `location /` block:

```nginx
location / {
    limit_req zone=api burst=10 nodelay;
    limit_req_status 429;
    proxy_pass http://127.0.0.1:5001;
    ...
}
```

Adjust `30r/m` to match expected legitimate usage. A user doing a card search triggers a handful of parallel requests, so 30/minute is generous for normal use without being open to abuse.

### 6c. Fail2ban (SSH brute force protection)

```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

Default config bans IPs after 5 failed SSH attempts. No additional configuration needed for basic protection.

### 6d. SSH hardening

Disable password authentication and root login — SSH key access only (you set this up via Pi Imager in step 2a):

```bash
sudo nano /etc/ssh/sshd_config
# Ensure these lines are set:
# PasswordAuthentication no
# PermitRootLogin no
sudo systemctl restart sshd
```

### 6e. Keep the Pi updated automatically

```bash
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

This automatically applies security patches without requiring manual intervention.

---

## 7. Frontend Changes

### 7a. Update the API base URL

The frontend currently points at the Heroku backend. This needs to change to your Pi's hostname.

In `mtg-ctm-web`, find wherever the backend URL is configured — likely in `src/gateway/http.js` or an environment variable. Change it to your Pi's hostname:

```javascript
// Before
const API_BASE = 'https://your-heroku-app.herokuapp.com';

// After
const API_BASE = 'https://api.yourdomain.com';  // Cloudflare Tunnel
// or
const API_BASE = 'https://mtg-ctm.duckdns.org'; // DuckDNS
```

Use an environment variable so you can switch between environments without changing code:

```javascript
const API_BASE = process.env.REACT_APP_API_URL || 'https://api.yourdomain.com';
```

Set the variable in a `.env.production` file (not committed to git):

```
REACT_APP_API_URL=https://api.yourdomain.com
```

### 7b. CORS

The backend already has CORS configured (`app.use(cors())`). No changes needed unless you want to lock it down to your specific frontend origin:

```typescript
// In src/app.ts — optional tightening
app.use(cors({ origin: 'https://your-frontend-domain.com' }));
```

### 7c. Mobile app

If `mtg-ctm-mob` also calls the backend directly, update the API base URL there too. The same environment variable approach applies.

---

## 8. Summary Checklist

```
Hardware
[ ] Buy Raspberry Pi 4 2GB + SD card + PSU
[ ] Flash Raspberry Pi OS Lite (64-bit) with SSH enabled
[ ] SSH in, run apt update && apt upgrade

Docker
[ ] Install Docker on Pi
[ ] Add Dockerfile and docker-compose.yml to mtg-ctm-be repo
[ ] Remove CORS proxy (set MTG_CTM_CORS_ANYWHERE = '')
[ ] Test locally without proxy

CI/CD
[ ] Add .github/workflows/deploy.yml
[ ] Set GHCR package visibility to public (or set up Pi auth)
[ ] Push to main — verify image builds and appears in GHCR
[ ] Start docker-compose on Pi with Watchtower
[ ] Push a test change — verify Pi auto-updates within 5 mins

Exposure
[ ] Choose: Cloudflare Tunnel (recommended) or port forwarding
[ ] Cloudflare Tunnel: install cloudflared, create tunnel, configure DNS
[ ] Port forwarding: set up DuckDNS updater, port forward 80+443, install nginx + certbot

Security
[ ] Configure UFW
[ ] Add nginx rate limiting
[ ] Install fail2ban
[ ] Disable SSH password auth
[ ] Enable unattended-upgrades

Frontend
[ ] Update API base URL in mtg-ctm-web
[ ] Update API base URL in mtg-ctm-mob if applicable
[ ] Verify CORS settings
```
