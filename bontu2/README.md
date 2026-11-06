# Bontu · Ethiopian Coffee Ceremony Booking

A complete booking site: storefront (English + Amharic), real availability checking,
server-side pricing, customer booking tracker, and an admin dashboard.

**Stack:** Node.js 22.13+ (tested on 22 and works on newer, e.g. 26) + Express, with Node's built-in SQLite (no native modules, no Visual Studio needed), plain HTML/CSS/JS (no build step).

## Run it
```bash
npm install
cp .env.example .env      # then edit ADMIN_PASSWORD, phone numbers, etc.
npm start
```
Site: http://localhost:3000  ·  Admin: http://localhost:3000/admin

## What works
- Packages and prices from your draft (1,499 / 2,499 / 3,999 ETB) + add-ons, extra hours, extra guests, travel outside Addis
- Booking wizard: package → date/time → details → review. Shows the Ethiopian calendar date
- Double-booking protection (1 hour buffer between ceremonies; raise `MAX_PARALLEL` if you have several teams)
- Prices are calculated on the server, never trusted from the browser
- Customers get a reference (BC-XXXXXX) and can look up / cancel with reference + phone
- Admin: confirm / complete / cancel, search and filter, close dates, CSV export, revenue stats
- Optional Telegram message to you on every new booking (set `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`)
- Rate limiting, input validation, CSP headers, constant-time admin login

## Photos
Real ceremony photos live in `public/img/photos/` (list in the README there). Replace any file with your own JPG of the same name.
If a photo is missing, a built-in illustration is shown instead (`npm run art` regenerates those).

## Buna Qalaa
Offered as an add-on (600 ETB, set in `server/catalog.js`) with its own section on the home page. The “Add Buna Qalaa” button opens the booking with it already selected.

## Change prices / packages
Edit `server/catalog.js` (packages, add-ons, event types, areas) and `server/config.js` (hours, deposit %, buffer).

## Deploy
Netlify only hosts static files, so it cannot run this backend. Use a Node host:
- **Render / Railway / Fly.io:** connect the repo, build `npm install`, start `npm start`.
  Attach a persistent disk and set `DB_PATH` to a path on it (e.g. `/data/bookings.db`), otherwise bookings are lost on redeploy.
- **Docker:** `docker build -t bontu . && docker run -p 3000:3000 -v bontu-data:/data -e ADMIN_PASSWORD=... bontu`
- **Any VPS:** `npm start` behind nginx/Caddy, run with pm2 or systemd.

Always set `ADMIN_PASSWORD` and `SESSION_SECRET`.

## Payments
Customers are told to send the deposit by Telebirr to the number in `.env` and quote their reference; you mark the booking Confirmed in the admin.
Automatic Telebirr checkout needs a merchant account and is not included.
