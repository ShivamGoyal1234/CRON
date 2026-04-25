This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Deploy on Hostinger VPS with Nginx

This app can run on your server `srv1115957.hstgr.cloud` behind Nginx with the domain `cron.shivam-goyal.site`, alongside other apps.

### 1) Point domain DNS

Create an `A` record:

- Host: `cron`
- Value: your VPS public IP
- TTL: default

### 2) Prepare env on server

In project root:

```bash
cp env.production.example .env.production
```

Update `.env.production` values, especially:

- `POSTGRES_PASSWORD`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL=https://cron.shivam-goyal.site`
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (if using Google auth)

### 3) Start containers

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

App becomes available on `127.0.0.1:3001`.

### 4) Configure Nginx reverse proxy

Copy provided config:

```bash
sudo cp deploy/nginx/cron.shivam-goyal.site.conf /etc/nginx/sites-available/cron.shivam-goyal.site
sudo ln -s /etc/nginx/sites-available/cron.shivam-goyal.site /etc/nginx/sites-enabled/cron.shivam-goyal.site
sudo nginx -t
sudo systemctl reload nginx
```

### 5) Enable HTTPS (Let's Encrypt)

```bash
sudo certbot --nginx -d cron.shivam-goyal.site
```

Choose redirect to HTTPS when prompted.

### 6) Open firewall ports

Allow `80` and `443` on server firewall/security group.

### Useful commands

```bash
docker compose -f docker-compose.prod.yml logs -f app
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml restart app
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
