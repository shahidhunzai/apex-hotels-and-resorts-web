# Roomy

Roomy is a full-stack property platform with a React + Vite frontend and an Express + MongoDB backend.

## Stack

- Frontend: React 18, Vite, React Router, Bootstrap, Tailwind (utility support)
- Backend: Express 5, Mongoose, Nodemailer, JWT auth, Helmet, express-rate-limit
- Database: MongoDB

## Project Structure

```text
roomy/
├── backend/
│   ├── server.js
│   ├── .env.example
│   ├── package.json
│   ├── data/
│   ├── uploads/
│   └── src/
│       ├── app.js
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── utils/
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── public/
│   └── src/
└── package.json
```

## Local Development

1. Install dependencies.

```bash
npm --prefix backend install
npm --prefix frontend install
```

2. Create backend env file.

```bash
cp backend/.env.example backend/.env
```

3. Update required values in backend/.env.

- ADMIN_PASSWORD
- JWT_SECRET
- SMTP_USER
- SMTP_PASS
- ADMIN_EMAIL
- FROM_EMAIL
- MONGODB_URI

4. Run both services from root.

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5001

## Scripts

- Root
	- npm run dev: run frontend + backend
	- npm start: run frontend only
	- npm run server: run backend only
	- npm run build: build frontend
- Frontend
	- npm --prefix frontend run dev
	- npm --prefix frontend run build
	- npm --prefix frontend run preview
- Backend
	- npm --prefix backend run dev
	- npm --prefix backend run start

## API Endpoints

- GET /api/health
- GET /api/cms
- GET /api/google-reviews?placeId=...
- GET /api/bookings/availability
- POST /api/contact
- POST /api/bookings
- POST /api/admin/login
- POST /api/admin/upload
- PUT /api/admin/cms
- POST /api/admin/seed
- GET /api/admin/bookings
- PATCH /api/admin/bookings/:id
- PATCH /api/admin/bookings/:id/status

## Security Notes

- Admin routes require JWT auth (no anonymous admin access).
- Rate limiting is enabled for admin and login routes.
- Helmet security headers are enabled.
- Keep JWT_SECRET, SMTP credentials, and ADMIN_PASSWORD private.

## DigitalOcean Production Deployment (Droplet)

This is a practical go-live guide using one Ubuntu Droplet + Nginx + PM2 + SSL.

### 1) Create infrastructure

1. Create Ubuntu 22.04 or 24.04 Droplet.
2. Point domain A record to Droplet IP.
3. Open firewall ports 22, 80, 443.

### 2) Server base setup

SSH into server and run:

```bash
sudo apt update && sudo apt -y upgrade
sudo apt -y install nginx git ufw
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt -y install nodejs
sudo npm i -g pm2
```

Enable firewall:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

### 3) Deploy project code

```bash
cd /var/www
sudo mkdir -p roomy && sudo chown -R $USER:$USER roomy
cd roomy
git clone <YOUR_REPO_URL> .
npm --prefix backend install --omit=dev
npm --prefix frontend install
npm --prefix frontend run build
```

### 4) Configure backend env

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

Production values to set:

- PORT=5001
- FRONTEND_ORIGIN=https://your-domain.com
- MONGODB_URI=<Atlas or managed Mongo connection string>
- ADMIN_USERNAME=<strong username>
- ADMIN_PASSWORD=<strong password>
- JWT_SECRET=<long random secret>
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL, ADMIN_EMAIL
- GOOGLE_PLACES_API_KEY=<optional>

Recommendation: use MongoDB Atlas (or DigitalOcean Managed MongoDB), not local Mongo on the same Droplet.

### 5) Run backend with PM2

```bash
cd /var/www/roomy/backend
pm2 start server.js --name roomy-backend
pm2 save
pm2 startup
```

Follow the printed `pm2 startup` command once, then run `pm2 save` again.

### 6) Configure Nginx

Create Nginx site:

```bash
sudo nano /etc/nginx/sites-available/roomy
```

Use this config:

```nginx
server {
		listen 80;
		server_name your-domain.com www.your-domain.com;

		root /var/www/roomy/frontend/dist;
		index index.html;

		location / {
				try_files $uri $uri/ /index.html;
		}

		location /api/ {
				proxy_pass http://127.0.0.1:5001;
				proxy_http_version 1.1;
				proxy_set_header Upgrade $http_upgrade;
				proxy_set_header Connection 'upgrade';
				proxy_set_header Host $host;
				proxy_set_header X-Real-IP $remote_addr;
				proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
				proxy_set_header X-Forwarded-Proto $scheme;
		}

		location /uploads/ {
				proxy_pass http://127.0.0.1:5001;
				proxy_set_header Host $host;
				proxy_set_header X-Real-IP $remote_addr;
				proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
				proxy_set_header X-Forwarded-Proto $scheme;
		}
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/roomy /etc/nginx/sites-enabled/roomy
sudo nginx -t
sudo systemctl reload nginx
```

### 7) Enable HTTPS (Let's Encrypt)

```bash
sudo apt -y install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
sudo systemctl status certbot.timer
```

### 8) Go-live checks

```bash
curl -I https://your-domain.com
curl https://your-domain.com/api/health
pm2 status
pm2 logs roomy-backend --lines 100
```

Expected:

- site opens over HTTPS
- /api/health returns `{ "ok": true }`
- PM2 shows backend online

### 9) Updating after new commits

```bash
cd /var/www/roomy
git pull
npm --prefix backend install --omit=dev
npm --prefix frontend install
npm --prefix frontend run build
pm2 restart roomy-backend
sudo systemctl reload nginx
```

## Notes

- Twilio integration has been removed.
- CMS and bookings seed JSON files are optional.
- If backend/data/cms.json is missing or invalid, admin seed returns 404 with cms: null.
- Frontend fallback dummy CMS cards/slides are hidden when CMS data is absent.
