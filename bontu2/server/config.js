'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Tiny .env loader (no extra dependency)
try {
  const envFile = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
} catch (_) { /* ignore */ }

const e = process.env;
module.exports = {
  port: Number(e.PORT) || 3000,
  dbPath: e.DB_PATH || path.join(__dirname, '..', 'data', 'bookings.db'),
  adminPassword: e.ADMIN_PASSWORD || 'changeme',
  usingDefaultPassword: !e.ADMIN_PASSWORD,
  sessionSecret: e.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  contact: {
    phone: e.CONTACT_PHONE || '+251911000000',
    telegram: e.CONTACT_TELEGRAM || '',
    telebirrNumber: e.TELEBIRR_NUMBER || '0911000000',
    telebirrName: e.TELEBIRR_NAME || 'Bontu Coffee Ceremony',
  },
  telegram: { token: e.TELEGRAM_BOT_TOKEN || '', chatId: e.TELEGRAM_CHAT_ID || '' },
  // Scheduling rules
  openMin: 7 * 60,          // earliest start 07:00
  closeMin: 23 * 60,        // ceremony must end by 23:00
  slotStep: 30,             // start times every 30 min
  bufferMin: 60,            // travel / setup gap between two ceremonies
  maxParallel: Math.max(1, Number(e.MAX_PARALLEL) || 1),
  maxDaysAhead: 365,
  minLeadDays: 1,           // earliest bookable date = tomorrow (Addis time)
  depositPercent: 30,
  extraGuestPrice: 120,
  maxGuests: 80,
  travelFeeOutside: 1000,
  tzOffsetHours: 3,         // Africa/Addis_Ababa (UTC+3, no DST)
};
