# Nexagon — VPS Deployment Guide

How to host Nexagon on your own VPS. The whole stack runs from **one `docker compose` command**;
this guide covers a quick launch, then production hardening (secrets, reverse proxy + HTTPS, firewall,
backups).

## 1. What runs

`docker-compose.yml` boots four containers on an internal Docker network:

| Service | Image | Port | Public? |
|---|---|---|---|
| **frontend** (Next.js) | node:20-alpine | 3001 | **Yes** — the only thing users hit |
| backend (NestJS API) | node:20-alpine | 3000 | No (internal; the frontend proxies `/api` to it) |
| postgres | postgres:16-alpine | 5432 | No |
| redis | redis:7-alpine | 6379 | No |

The browser only talks to the **frontend**; it server-side-proxies `/api` to the backend
(`BACKEND_URL`). So in production you expose **only the frontend**, behind Nginx + TLS.

> Note: the stack runs the apps in **dev mode** (fast, source-mounted). That's fine for a pilot/demo
> VPS. A fully production-optimized build (multi-stage `next build` / `nest build`) is a later
> enhancement — see §9.

## 2. Prerequisites

- A VPS: **Ubuntu 22.04+**, **>= 2 vCPU / 4 GB RAM / 20 GB disk** (dev servers + Postgres).
- A domain name pointed at the VPS (optional but recommended for HTTPS).

### 2a. Create the deploy user (`aymanausa`)

Don't run the stack as `root`. Create a dedicated non-root sudo user and **do the entire rest of this
guide logged in as that user**. Run these once, as `root` (or an existing sudo user):

```bash
# create the user with a home dir and bash shell, then set a password
sudo adduser aymanausa                 # prompts for a password (or: sudo adduser --gecos "" aymanausa)
sudo usermod -aG sudo aymanausa        # grant sudo

# (recommended) copy your SSH key so you can log in as aymanausa directly
sudo rsync --archive --chown=aymanausa:aymanausa ~/.ssh /home/aymanausa
```

Now **log out and log back in as `aymanausa`** (`ssh aymanausa@<vps-ip>`). Everything below — Docker,
cloning, `docker compose`, backups — runs as this user, and the project lives under its home
(e.g. `/home/aymanausa/nexagon`).

> After the Docker step below adds `aymanausa` to the `docker` group, this user can manage the stack
> without `sudo` for `docker` commands (`sudo` is still needed for firewall/Nginx/system tasks).

### 2b. Docker Engine + Compose plugin

Logged in **as `aymanausa`**, install Docker (so `$USER` below resolves to `aymanausa`):
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # adds aymanausa to the docker group; re-login after this
docker compose version          # confirm v2+
```

## 3. Get the code

As `aymanausa`, from its home directory:
```bash
# from your machine, or clone if you have a git remote
git clone <your-nexamind-repo> ~/nexagon && cd ~/nexagon/v2
# (or from your machine: scp -r nexamind/v2 aymanausa@<vps-ip>:~/nexagon && ssh aymanausa@<vps-ip>)
```

## 4. Configure secrets (required)

**a) API keys** — create `backend/.env` (gitignored; never commit it):
```env
FAO_USERNAME=your_fao_user
FAO_PASSWORD=your_fao_pass
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_WORKSPACE_ID=wrkspc_...
COMTRADE_API_KEY=your_comtrade_key
```
Without these, the AI + Comtrade + FAO features degrade gracefully but won't populate.

**b) Production secrets in `docker-compose.yml`** — before going live, change:
- `JWT_SECRET` -> a long random string (`openssl rand -hex 32`).
- `POSTGRES_PASSWORD` (postgres service) **and** the password in the backend `DATABASE_URL` — keep them equal.
- `CORS_ORIGINS` -> your domain, e.g. `https://nexagon.example.sa`.

## 5. First launch (quick start)

```bash
docker compose up -d
docker compose logs -f backend   # watch it install deps, run prisma, seed, and refresh data
```
First boot takes a few minutes (npm install + `prisma db push` + seed + initial live-data pulls).
When you see **"Nest application successfully started"**, browse to `http://<vps-ip>:3001`.

**Default login (seeded):** `admin@ews.sa` / `admin123` — **change this password immediately** (see §8).

## 6. Production hardening

**a) Stop exposing internal services.** Edit `docker-compose.yml` and bind the DB/redis/backend to
localhost only (or remove their `ports:` entirely — the frontend reaches the backend by service name):
```yaml
  postgres:
    ports: [ "127.0.0.1:5432:5432" ]   # or delete this line
  redis:
    ports: [ "127.0.0.1:6379:6379" ]   # or delete
  backend:
    ports: [ "127.0.0.1:3000:3000" ]   # keep internal; Nginx does not need it
  frontend:
    ports: [ "127.0.0.1:3001:3001" ]   # Nginx proxies to this; not public directly
```
Then `docker compose up -d` to apply.

**b) Firewall (ufw).** Since **Cloudflare** proxies all traffic, only Cloudflare's edge should reach
your origin — don't leave 80/443 open to the whole internet:
```bash
sudo ufw allow OpenSSH
# allow HTTPS only from Cloudflare's IP ranges (edge → origin)
for ip in $(curl -s https://www.cloudflare.com/ips-v4); do sudo ufw allow from $ip to any port 443 proto tcp; done
for ip in $(curl -s https://www.cloudflare.com/ips-v6); do sudo ufw allow from $ip to any port 443 proto tcp; done
sudo ufw enable
```
(If you use a **Cloudflare Tunnel** — Option B below — you don't open 443 at all; skip these `allow` lines.)

## 7. HTTPS via Cloudflare + Nginx reverse proxy

SSL is handled by **Cloudflare** (TLS terminates at Cloudflare's edge), so there is **no certbot /
Let's Encrypt on the origin**. Two supported ways to connect Cloudflare to this VPS — pick one.

**In the Cloudflare dashboard first:** add your domain, and create a DNS record for the app
(e.g. `nexagon`) pointing at the VPS IP with the **proxy enabled (orange cloud)**. Then set
**SSL/TLS → Overview → Full (strict)** so the edge↔origin hop is also encrypted and validated.

### Option A — Nginx with a Cloudflare Origin Certificate (recommended)

1. In Cloudflare: **SSL/TLS → Origin Server → Create Certificate** (free, valid 15 years). Save the
   cert and key to the VPS, e.g. `/etc/ssl/cloudflare/nexagon.pem` and `nexagon.key`.
2. Install Nginx and configure it to listen on 443 with that origin cert:
   ```bash
   sudo apt install -y nginx
   ```
   `/etc/nginx/sites-available/nexagon`:
   ```nginx
   server {
       listen 443 ssl;
       listen [::]:443 ssl;
       server_name nexagon.example.sa;

       ssl_certificate     /etc/ssl/cloudflare/nexagon.pem;
       ssl_certificate_key /etc/ssl/cloudflare/nexagon.key;

       location / {
           proxy_pass http://127.0.0.1:3001;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           # real visitor IP comes from Cloudflare, not the edge IP
           proxy_set_header X-Real-IP $http_cf_connecting_ip;
           proxy_set_header X-Forwarded-For $http_cf_connecting_ip;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_set_header Upgrade $http_upgrade;      # websockets
           proxy_set_header Connection "upgrade";
       }
   }
   ```
   ```bash
   sudo ln -s /etc/nginx/sites-available/nexagon /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```
3. (Recommended) Turn on **Authenticated Origin Pulls** in Cloudflare so Nginx only accepts the
   Cloudflare edge, and enable **Always Use HTTPS** so visitors are redirected to `https://`.

Once DNS (orange cloud) is set, the site is live on `https://nexagon.example.sa` — Cloudflare renews
edge certs automatically; the origin cert is valid 15 years.

### Option B — Cloudflare Tunnel (no open inbound ports)

Even simpler and more secure: run `cloudflared`, which dials **out** to Cloudflare, so the VPS needs
**no inbound 80/443** at all.
```bash
# install cloudflared, then:
cloudflared tunnel login
cloudflared tunnel create nexagon
# route the hostname to the tunnel, pointing at the local frontend:
cloudflared tunnel route dns nexagon nexagon.example.sa
```
`~/.cloudflared/config.yml`:
```yaml
tunnel: <tunnel-id>
credentials-file: /root/.cloudflared/<tunnel-id>.json
ingress:
  - hostname: nexagon.example.sa
    service: http://localhost:3001
  - service: http_404
```
```bash
sudo cloudflared service install   # run the tunnel as a systemd service
```
No Nginx or origin cert needed; Cloudflare handles TLS end-to-end and the origin stays fully closed.

## 8. First-run tasks

- **Change the admin password** (Settings, or reseed with a new hash) and consider adding real users.
- Verify data populated: open **Live Data** (`/live-data`) — providers should read ACTIVE with record counts.
- The **news** feed and other refreshes run on schedule (e.g. GDELT is rate-limited; it fills in over
  the first hours / next cron). Admins can trigger refreshes from each module.

## 9. Operations

- **Logs:** `docker compose logs -f backend` (or `frontend`).
- **Restart a service:** `docker compose restart backend`.
- **Update to new code:** `git pull && docker compose up -d` (backend/frontend reinstall deps as needed).
  For a frontend rebuild after changes: `docker compose exec frontend rm -rf .next && docker compose restart frontend`.
- **Backups (Postgres):**
  ```bash
  docker compose exec -T postgres pg_dump -U ews_user ews_db > backup_$(date +%F).sql
  ```
  Data lives in the `postgres_data` volume; snapshot it or schedule `pg_dump` via cron.
- **Scheduled jobs** (news, procurement, auto-scenarios) run inside the backend via `@Cron` — no extra setup.

## 10. Checklist before you demo publicly
- [ ] Deploying as the non-root user **`aymanausa`** (in `sudo` + `docker` groups); project under `~/nexagon`.
- [ ] `backend/.env` created with real keys (not committed).
- [ ] `JWT_SECRET`, `POSTGRES_PASSWORD`/`DATABASE_URL`, `CORS_ORIGINS` changed from defaults.
- [ ] Internal ports bound to `127.0.0.1` (or removed); firewall on (443 restricted to Cloudflare IPs, or Tunnel = no open ports).
- [ ] Cloudflare: DNS record proxied (orange cloud), SSL/TLS mode **Full (strict)**; Nginx origin cert (Option A) or Tunnel running (Option B).
- [ ] Default admin password changed.
- [ ] `/live-data` shows sources ACTIVE.

## Notes / ceilings
- Dev-mode stack is fine for pilot scale; for heavy/production traffic, add multi-stage production
  Docker builds (`next build` / `nest build`), a process manager, and managed Postgres.
- External sources (GDELT, RASFF) are rate-limited/unofficial — the app already backs off and caches;
  expect the news/auto-scenario features to fill in over time rather than instantly.
