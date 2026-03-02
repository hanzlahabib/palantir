# Epic 17: Deployment & Operations

## Priority: FINAL
## Dependencies: All other epics
## Blocks: None
## Estimated Effort: 1 day
## Parallelizable With: Nothing (last step)

---

## Objective
Deploy the complete PALANTIR application to the Contabo VPS at `palantir.hanzla.com` with Nginx reverse proxy, SSL, and PM2 process management.

## Tasks

### 17.1 Production Build
- Frontend: `pnpm run build` -> outputs to `dist/`
- Backend: Compile TypeScript or run with `tsx`
- Environment variables set in production `.env`

### 17.2 CyberPanel Site Setup
- Create website `palantir.hanzla.com` in CyberPanel
- Issue SSL certificate via Let's Encrypt
- Configure DNS A record pointing to VPS IP

### 17.3 Nginx Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name palantir.hanzla.com;

    root /home/palantir.hanzla.com/public_html;
    index index.html;

    # API and WebSocket proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /ws {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 17.4 PM2 Process Management
```javascript
// pm2.config.js
module.exports = {
  apps: [{
    name: 'palantir-api',
    script: 'server/index.ts',
    interpreter: 'tsx',
    env: { NODE_ENV: 'production', PORT: 3001 },
    instances: 1,
    max_memory_restart: '500M',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }]
};
```

### 17.5 Deployment Script
- SSH to VPS
- Pull latest code
- Install dependencies: `pnpm install --frozen-lockfile`
- Build frontend: `pnpm run build`
- Copy `dist/` to `/home/palantir.hanzla.com/public_html/`
- Restart PM2: `pm2 restart palantir-api`

### 17.6 Monitoring
- PM2 logs: `pm2 logs palantir-api`
- Health check: `curl https://palantir.hanzla.com/api/health`
- Memory usage: `pm2 monit`

## Files Created
- `deploy/nginx.conf` — Nginx configuration
- `deploy/pm2.config.js` — PM2 process config
- `deploy/deploy.sh` — Deployment script

## Acceptance Criteria
- [ ] `https://palantir.hanzla.com` loads the full app
- [ ] SSL certificate valid
- [ ] API endpoints accessible via `/api/*`
- [ ] WebSocket connections work via `/ws`
- [ ] PM2 keeps server running after restart
- [ ] All data feeds load correctly in production
