'use strict';
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const config = require('./config');
const db = require('./db');
const catalog = require('./catalog');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '20kb' }));

// ---------------------------------------------------------------- security headers
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'same-origin',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'",
      "font-src https://fonts.gstatic.com",
      "img-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  });
  next();
});

// ---------------------------------------------------------------- helpers
const nowAddis = () => new Date(Date.now() + config.tzOffsetHours * 3600e3);
const isoDate = d => d.toISOString().slice(0, 10);
const todayAddis = () => isoDate(nowAddis());
const addDays = (iso, n) => { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return isoDate(d); };
const hhmm = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
const parseTime = s => { const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(s || ''); return m ? (+m[1]) * 60 + (+m[2]) : null; };
const validDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s || '') && isoDate(new Date(s + 'T00:00:00Z')) === s;

function normalizePhone(raw) {
  let d = String(raw || '').replace(/\D/g, '');
  if (d.startsWith('251')) d = d.slice(3);
  if (d.startsWith('0')) d = d.slice(1);
  return /^[79]\d{8}$/.test(d) ? '+251' + d : null;
}
const clean = (s, max) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);

const pkgById = id => catalog.packages.find(p => p.id === id);

function makeRef() {
  const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  for (;;) {
    let r = 'BC-';
    const b = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) r += A[b[i] % A.length];
    if (!db.prepare('SELECT 1 FROM bookings WHERE ref = ?').get(r)) return r;
  }
}

// ---------------------------------------------------------------- pricing (server is authoritative)
function quote(pkg, { guests, extraHours, addons: ids, area }) {
  const lines = [{ key: 'package', amount: pkg.price }];
  const extraPeople = Math.max(0, guests - pkg.people);
  if (extraPeople) lines.push({ key: 'extraGuests', qty: extraPeople, amount: extraPeople * config.extraGuestPrice });
  if (extraHours) lines.push({ key: 'extraHours', qty: extraHours, amount: extraHours * catalog.extraHourPrice });
  const chosen = [];
  for (const id of ids) {
    const a = catalog.addons.find(x => x.id === id);
    if (!a || pkg.includes.includes(id) || chosen.includes(id)) continue; // ignore unknown / already included
    chosen.push(id);
    lines.push({ key: 'addon', id, amount: a.price });
  }
  if (area === 'outside') lines.push({ key: 'travel', amount: config.travelFeeOutside });
  const total = lines.reduce((s, l) => s + l.amount, 0);
  const deposit = Math.round((total * config.depositPercent) / 100 / 10) * 10;
  return { lines, total, deposit, addons: chosen };
}

// ---------------------------------------------------------------- availability
function blockedReason(date) {
  const r = db.prepare('SELECT reason FROM blocked_dates WHERE date = ?').get(date);
  return r ? (r.reason || 'Closed') : null;
}
function isFree(date, start, end, ignoreId = 0) {
  const rows = db.prepare(`SELECT start_min, end_min FROM bookings
    WHERE date = ? AND status IN ('pending','confirmed') AND id != ?`).all(date, ignoreId);
  let overlap = 0;
  for (const r of rows) if (start < r.end_min + config.bufferMin && end + config.bufferMin > r.start_min) overlap++;
  return overlap < config.maxParallel;
}
function dateProblem(date) {
  if (!validDate(date)) return 'invalid_date';
  const min = addDays(todayAddis(), config.minLeadDays);
  const max = addDays(todayAddis(), config.maxDaysAhead);
  if (date < min) return 'too_soon';
  if (date > max) return 'too_far';
  return null;
}

// ---------------------------------------------------------------- tiny rate limiter
const hits = new Map();
function limit(name, max, windowMs) {
  return (req, res, next) => {
    const key = name + ':' + req.ip;
    const now = Date.now();
    const rec = (hits.get(key) || []).filter(t => now - t < windowMs);
    if (rec.length >= max) return res.status(429).json({ error: 'rate_limited' });
    rec.push(now); hits.set(key, rec); next();
  };
}
setInterval(() => { const now = Date.now(); for (const [k, v] of hits) if (!v.some(t => now - t < 3600e3)) hits.delete(k); }, 600e3).unref();

// ---------------------------------------------------------------- Telegram notification (optional)
async function notifyTelegram(text) {
  const { token, chatId } = config.telegram;
  if (!token || !chatId || typeof fetch !== 'function') return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch (e) { console.warn('Telegram notify failed:', e.message); }
}

// ---------------------------------------------------------------- public API
const api = express.Router();

api.get('/config', (req, res) => {
  res.json({
    contact: config.contact,
    rules: {
      openMin: config.openMin, closeMin: config.closeMin, slotStep: config.slotStep,
      depositPercent: config.depositPercent, extraGuestPrice: config.extraGuestPrice,
      maxGuests: config.maxGuests, travelFeeOutside: config.travelFeeOutside,
      minDate: addDays(todayAddis(), config.minLeadDays),
      maxDate: addDays(todayAddis(), config.maxDaysAhead),
    },
  });
});

api.get('/catalog', (req, res) => res.json(catalog));

api.get('/availability', limit('avail', 120, 60e3), (req, res) => {
  const { date } = req.query;
  const pkg = pkgById(req.query.package);
  const extraHours = Math.min(catalog.maxExtraHours, Math.max(0, parseInt(req.query.extraHours, 10) || 0));
  if (!pkg) return res.status(400).json({ error: 'invalid_package' });
  const problem = dateProblem(date);
  if (problem) return res.status(400).json({ error: problem });
  const blocked = blockedReason(date);
  const dur = (pkg.hours + extraHours) * 60;
  const slots = [];
  for (let s = config.openMin; s + dur <= config.closeMin; s += config.slotStep) {
    slots.push({ time: hhmm(s), end: hhmm(s + dur), available: !blocked && isFree(date, s, s + dur) });
  }
  res.json({ date, blocked, slots });
});

api.post('/bookings', limit('book', 8, 3600e3), (req, res) => {
  const b = req.body || {};
  const errors = {};
  const pkg = pkgById(b.package);
  if (!pkg) errors.package = 'invalid';
  const name = clean(b.name, 80);
  if (name.length < 2) errors.name = 'required';
  const phone = normalizePhone(b.phone);
  if (!phone) errors.phone = 'invalid';
  const email = clean(b.email, 120);
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = 'invalid';
  const eventType = catalog.eventTypes.find(e => e.id === b.eventType);
  if (!eventType) errors.eventType = 'invalid';
  const area = catalog.areas.find(a => a.id === b.area);
  if (!area) errors.area = 'invalid';
  const address = clean(b.address, 200);
  if (address.length < 4) errors.address = 'required';
  const guests = parseInt(b.guests, 10);
  if (!(guests >= 1 && guests <= config.maxGuests)) errors.guests = 'invalid';
  const extraHours = parseInt(b.extraHours, 10) || 0;
  if (extraHours < 0 || extraHours > catalog.maxExtraHours) errors.extraHours = 'invalid';
  const date = String(b.date || '');
  const dp = dateProblem(date);
  if (dp) errors.date = dp;
  const start = parseTime(b.time);
  if (start === null || start < config.openMin || start % config.slotStep) errors.time = 'invalid';
  if (Object.keys(errors).length) return res.status(400).json({ error: 'validation', fields: errors });

  const end = start + (pkg.hours + extraHours) * 60;
  if (end > config.closeMin) return res.status(400).json({ error: 'validation', fields: { time: 'too_late' } });
  if (blockedReason(date)) return res.status(409).json({ error: 'date_blocked' });

  const q = quote(pkg, { guests, extraHours, addons: Array.isArray(b.addons) ? b.addons.map(String) : [], area: area.id });

  // better-sqlite3 is synchronous, so check + insert cannot interleave with another request.
  const insert = db.transaction(() => {
    if (!isFree(date, start, end)) return null;
    const ref = makeRef();
    db.prepare(`INSERT INTO bookings
      (ref,name,phone,email,package_id,event_type,date,start_min,end_min,extra_hours,guests,area,address,notes,addons,total,deposit,lang)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(ref, name, phone, email || null, pkg.id, eventType.id, date, start, end, extraHours, guests,
        area.id, address, clean(b.notes, 500) || null, JSON.stringify(q.addons), q.total, q.deposit,
        b.lang === 'am' ? 'am' : 'en');
    return ref;
  });
  const ref = insert();
  if (!ref) return res.status(409).json({ error: 'slot_taken' });

  notifyTelegram(`☕ New booking ${ref}\n${pkg.name.en} · ${date} ${hhmm(start)}–${hhmm(end)}\n${name} · ${phone}\n${eventType.en} · ${area.en}, ${address}\nTotal ${q.total} ETB (deposit ${q.deposit})`);
  res.status(201).json({ booking: publicBooking(getByRef(ref)), quote: q });
});

function getByRef(ref) { return db.prepare('SELECT * FROM bookings WHERE ref = ?').get(String(ref || '').toUpperCase().trim()); }
function publicBooking(r) {
  return {
    ref: r.ref, name: r.name, phone: r.phone, package: r.package_id, eventType: r.event_type,
    date: r.date, time: hhmm(r.start_min), end: hhmm(r.end_min), guests: r.guests, area: r.area, address: r.address,
    addons: JSON.parse(r.addons), extraHours: r.extra_hours, total: r.total, deposit: r.deposit, status: r.status,
  };
}

// Look up / cancel by reference + phone (POST so the phone never appears in URLs or logs)
function ownBooking(req) {
  const r = getByRef(req.body?.ref);
  const phone = normalizePhone(req.body?.phone);
  return r && phone && r.phone === phone ? r : null;
}
api.post('/bookings/lookup', limit('lookup', 15, 15 * 60e3), (req, res) => {
  const r = ownBooking(req);
  if (!r) return res.status(404).json({ error: 'not_found' });
  res.json({ booking: publicBooking(r) });
});
api.post('/bookings/cancel', limit('cancel', 10, 15 * 60e3), (req, res) => {
  const r = ownBooking(req);
  if (!r) return res.status(404).json({ error: 'not_found' });
  if (!['pending', 'confirmed'].includes(r.status)) return res.status(409).json({ error: 'not_cancellable' });
  if (r.date <= todayAddis()) return res.status(409).json({ error: 'too_late_to_cancel' });
  db.prepare("UPDATE bookings SET status='cancelled', updated_at=datetime('now') WHERE id=?").run(r.id);
  notifyTelegram(`❌ Booking ${r.ref} cancelled by customer (${r.name}, ${r.date})`);
  res.json({ booking: publicBooking(getByRef(r.ref)) });
});

// ---------------------------------------------------------------- admin API
const adminHash = crypto.createHash('sha256').update(config.adminPassword).digest();
const sign = p => crypto.createHmac('sha256', config.sessionSecret).update(p).digest('hex');
function makeToken() { const exp = String(Date.now() + 12 * 3600e3); return exp + '.' + sign(exp); }
function validToken(t) {
  const [exp, sig] = String(t || '').split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const a = Buffer.from(sig), b = Buffer.from(sign(exp));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function requireAdmin(req, res, next) {
  const t = (req.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!validToken(t)) return res.status(401).json({ error: 'unauthorized' });
  next();
}

const admin = express.Router();
admin.post('/login', limit('login', 10, 15 * 60e3), (req, res) => {
  const given = crypto.createHash('sha256').update(String(req.body?.password || '')).digest();
  if (!crypto.timingSafeEqual(given, adminHash)) return res.status(401).json({ error: 'bad_password' });
  res.json({ token: makeToken() });
});

admin.use(requireAdmin);

const adminRow = r => ({ ...publicBooking(r), id: r.id, email: r.email, notes: r.notes, adminNote: r.admin_note, createdAt: r.created_at, lang: r.lang });

admin.get('/bookings', (req, res) => {
  const where = []; const args = [];
  if (['pending', 'confirmed', 'completed', 'cancelled'].includes(req.query.status)) { where.push('status = ?'); args.push(req.query.status); }
  if (validDate(req.query.from)) { where.push('date >= ?'); args.push(req.query.from); }
  if (validDate(req.query.to)) { where.push('date <= ?'); args.push(req.query.to); }
  if (req.query.q) {
    const q = '%' + String(req.query.q).slice(0, 40).replace(/[%_]/g, '') + '%';
    where.push('(name LIKE ? OR phone LIKE ? OR ref LIKE ?)'); args.push(q, q, q);
  }
  const rows = db.prepare(`SELECT * FROM bookings ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY date ASC, start_min ASC LIMIT 500`).all(...args);
  res.json({ bookings: rows.map(adminRow) });
});

admin.patch('/bookings/:id', (req, res) => {
  const r = db.prepare('SELECT * FROM bookings WHERE id = ?').get(Number(req.params.id));
  if (!r) return res.status(404).json({ error: 'not_found' });
  const status = req.body?.status;
  if (status !== undefined && !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) return res.status(400).json({ error: 'invalid_status' });
  if (status && ['pending', 'confirmed'].includes(status) && !['pending', 'confirmed'].includes(r.status) && !isFree(r.date, r.start_min, r.end_min, r.id))
    return res.status(409).json({ error: 'slot_taken' });
  db.prepare("UPDATE bookings SET status = COALESCE(?, status), admin_note = COALESCE(?, admin_note), updated_at = datetime('now') WHERE id = ?")
    .run(status ?? null, req.body?.adminNote !== undefined ? clean(req.body.adminNote, 500) : null, r.id);
  res.json({ booking: adminRow(db.prepare('SELECT * FROM bookings WHERE id = ?').get(r.id)) });
});

admin.delete('/bookings/:id', (req, res) => {
  const info = db.prepare('DELETE FROM bookings WHERE id = ?').run(Number(req.params.id));
  res.json({ deleted: info.changes });
});

admin.get('/stats', (req, res) => {
  const today = todayAddis();
  const one = (sql, ...a) => db.prepare(sql).get(...a);
  res.json({
    pending: one("SELECT COUNT(*) n FROM bookings WHERE status='pending'").n,
    upcoming: one("SELECT COUNT(*) n FROM bookings WHERE status='confirmed' AND date >= ?", today).n,
    today: one("SELECT COUNT(*) n FROM bookings WHERE status IN ('pending','confirmed') AND date = ?", today).n,
    revenueConfirmed: one("SELECT COALESCE(SUM(total),0) n FROM bookings WHERE status IN ('confirmed','completed')").n,
    revenueMonth: one("SELECT COALESCE(SUM(total),0) n FROM bookings WHERE status IN ('confirmed','completed') AND substr(date,1,7)=?", today.slice(0, 7)).n,
  });
});

admin.get('/blocked', (req, res) => res.json({ blocked: db.prepare('SELECT date, reason FROM blocked_dates WHERE date >= ? ORDER BY date').all(todayAddis()) }));
admin.post('/blocked', (req, res) => {
  if (!validDate(req.body?.date)) return res.status(400).json({ error: 'invalid_date' });
  db.prepare('INSERT OR REPLACE INTO blocked_dates (date, reason) VALUES (?, ?)').run(req.body.date, clean(req.body.reason, 100) || null);
  res.status(201).json({ ok: true });
});
admin.delete('/blocked/:date', (req, res) => {
  res.json({ deleted: db.prepare('DELETE FROM blocked_dates WHERE date = ?').run(req.params.date).changes });
});

admin.get('/export.csv', (req, res) => {
  const rows = db.prepare('SELECT * FROM bookings ORDER BY date, start_min').all();
  const cell = v => {
    let s = String(v ?? '');
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // neutralise spreadsheet formulas
    return '"' + s.replace(/"/g, '""') + '"';
  };
  const head = ['Ref', 'Status', 'Date', 'Start', 'End', 'Package', 'Event', 'Guests', 'Name', 'Phone', 'Email', 'Area', 'Address', 'Add-ons', 'Total ETB', 'Deposit ETB', 'Notes', 'Created'];
  const lines = [head.map(cell).join(',')];
  for (const r of rows) lines.push([r.ref, r.status, r.date, hhmm(r.start_min), hhmm(r.end_min), r.package_id, r.event_type, r.guests, r.name, r.phone, r.email, r.area, r.address, JSON.parse(r.addons).join(' '), r.total, r.deposit, r.notes, r.created_at].map(cell).join(','));
  res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="bookings.csv"' });
  res.send('\ufeff' + lines.join('\r\n'));
});

api.use('/admin', admin);
app.use('/api', api);
app.use('/api', (req, res) => res.status(404).json({ error: 'not_found' }));

// ---------------------------------------------------------------- static site
const pub = path.join(__dirname, '..', 'public');
app.use(express.static(pub, { extensions: ['html'], maxAge: '1h' }));
app.get('/admin', (req, res) => res.sendFile(path.join(pub, 'admin.html')));
app.get(/^\/(?!api\/)[^.]*$/, (req, res) => res.sendFile(path.join(pub, 'index.html'))); // old /package, /book URLs still land on the app

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large') return res.status(400).json({ error: 'bad_request' });
  console.error(err); res.status(500).json({ error: 'server_error' });
});

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`☕ Bontu coffee ceremony running on http://localhost:${config.port}`);
    console.log(`   Admin dashboard: http://localhost:${config.port}/admin`);
    if (config.usingDefaultPassword) console.warn('   ⚠ ADMIN_PASSWORD is not set — using the default "changeme". Set it before going live.');
  });
}
module.exports = app;
