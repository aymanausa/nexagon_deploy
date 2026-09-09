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
- **Docker Engine + Compose plugin:**
  ```bash
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $USER   # re-login after this
  docker compose version          # confirm v2+
  ```

## 3. Get the code

```bash
# from your machine, or clone if you have a git remote
git clone <your-nexamind-repo> nexagon && cd nexagon/v2
# (or: scp -r nexamind/v2 user@vps:/opt/nexagon && ssh in)
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

**b) Firewall (ufw):**
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'   # 80 + 443
sudo ufw enable
```

## 7. Reverse proxy + HTTPS (Nginx + Let's Encrypt)

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```
`/etc/nginx/sites-available/nexagon`:
```nginx
server {
    server_name nexagon.example.sa;
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;      # websockets
        proxy_set_header Connection "upgrade";
    }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/nexagon /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d nexagon.example.sa    # auto-configures HTTPS + renewal
```
Point your domain's **A record** at the VPS IP first. After certbot, the site is live on `https://`.

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
- [ ] `backend/.env` created with real keys (not committed).
- [ ] `JWT_SECRET`, `POSTGRES_PASSWORD`/`DATABASE_URL`, `CORS_ORIGINS` changed from defaults.
- [ ] Internal ports bound to `127.0.0.1` (or removed); firewall on.
- [ ] Nginx + HTTPS via certbot; domain A record set.
- [ ] Default admin password changed.
- [ ] `/live-data` shows sources ACTIVE.

## Notes / ceilings
- Dev-mode stack is fine for pilot scale; for heavy/production traffic, add multi-stage production
  Docker builds (`next build` / `nest build`), a process manager, and managed Postgres.
- External sources (GDELT, RASFF) are rate-limited/unofficial — the app already backs off and caches;
  expect the news/auto-scenario features to fill in over time rather than instantly.
