# Deploy — `nexagon.nexamind.com.sa` (full stack)

Postgres + Redis + NestJS backend + Next.js frontend, run via Docker Compose on
the VPS. nginx reverse-proxies HTTPS to the frontend (:3001); the frontend
proxies `/api` to the backend internally. Cloudflare sits in front.

```
Browser ─TLS─► Cloudflare ─TLS(origin cert)─► nginx :443 ─► Next.js :3001 ─► NestJS :3000 ─► Postgres/Redis
                                                                (internal docker network)
```

> Runs the dev-mode compose (`npm run dev` / `start:dev`). That's what the app
> is built to boot as today. Hardening to built production images later needs two
> fixes first — see "Later" at the bottom.

---

## Step 1 — Get the code + secrets on the VPS

```bash
# on the VPS
git clone <your-repo-url> nexagon && cd nexagon
cp .env.example .env
nano .env        # set JWT_SECRET (openssl rand -hex 32) and ANTHROPIC_API_KEY
```

## Step 2 — Install Docker

```bash
curl -fsSL https://get.docker.com | sh
```

## Step 3 — Boot the stack

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

First boot installs deps and runs `prisma db push` + seed (a few minutes). Watch it:

```bash
docker compose logs -f backend     # wait for "Nest application successfully started"
docker compose logs -f frontend    # wait for "Ready in ..." on :3001
```

Smoke-test locally on the box before wiring nginx:

```bash
curl -I http://127.0.0.1:3001                 # Next.js -> 200
curl http://127.0.0.1:3000/api/v1/health      # backend (if a health route exists)
```

## Step 4 — Cloudflare DNS + TLS

In the Cloudflare **`nexamind.com.sa`** zone:

- **DNS**: A record `nexagon` → VPS IP, proxy **ON** (orange cloud).
- **SSL/TLS → Overview**: mode **Full (strict)**; **Always Use HTTPS** On.
- **SSL/TLS → Origin Server → Create Certificate** (defaults, 15-year). Copy the
  cert + key onto the VPS:

```bash
mkdir -p /etc/nginx/ssl
nano /etc/nginx/ssl/cloudflare-origin.pem   # paste certificate
nano /etc/nginx/ssl/cloudflare-origin.key   # paste private key
chmod 600 /etc/nginx/ssl/cloudflare-origin.key
```

## Step 5 — nginx

```bash
apt update && apt install -y nginx
cp deploy/nginx.conf /etc/nginx/sites-available/nexagon
ln -s /etc/nginx/sites-available/nexagon /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx && systemctl enable nginx
```

## Step 6 — Firewall

Closes the Docker-published ports (3000/3001/5432/6379) to the outside; only
SSH + web reach the box, and only Cloudflare should hit web:

```bash
ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw enable
```

## Step 7 — Verify

```bash
curl -I https://nexagon.nexamind.com.sa
```

Open the site, log in (`admin@ews.sa` / `admin123`), navigate, refresh a
sub-route. API calls go to `/api/*` same-origin — confirm in the browser
network tab they return 200, not CORS errors.

---

## Redeploy after code changes

Source is volume-mounted, so backend hot-reloads and the Next dev server
recompiles on change. For a clean pull:

```bash
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart backend frontend
```

New backend modules or `.env` changes need the `restart` above.

## Later — switch to built production images

Running dev servers in prod works but is heavier. To use the `backend/` and
`frontend/` Dockerfiles instead, first fix:
1. `frontend/next.config.js` — add `output: 'standalone'` (its Dockerfile copies
   `.next/standalone`, which won't exist otherwise).
2. `backend/Dockerfile` — the runner stage does `npm ci --only=production` but
   never generates the Prisma client; add `RUN npx prisma generate` (and run
   `npx prisma migrate deploy` on startup).
Then write a compose that `build:`s those images and drops the source volumes.
