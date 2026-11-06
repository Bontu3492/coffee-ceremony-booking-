(() => {
'use strict';
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = { get: k => { try { return localStorage.getItem(k); } catch (_) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} } };

/* ------------------------------------------------------------------ i18n */
let lang = store.get('lang') || ((navigator.language || '').startsWith('am') ? 'am' : 'en');
const I = {
  en: {
    nav_home: 'Home', nav_packages: 'Packages', nav_book: 'Book now', nav_about: 'About', nav_track: 'My booking',
    h_title: 'Ethiopian coffee ceremony, at your event.', h_lead: 'Jebena, frankincense and fresh grass. We bring everything.',
    h_cta1: 'See packages', h_cta2: 'Book a date',
    r1: 'First round', r1d: 'The strongest', r2: 'Second round', r2d: 'Softer', r3: 'Third round', r3d: 'The blessing',
    ev_title: 'For every gathering', ev1: 'Weddings and engagements', ev2: 'Birthdays', ev3: 'Shimigilina / Jaarsumma', ev4: 'Government programs', ev5: 'Campus and community gatherings', ev6: 'And many more',
    pk_title: 'Pick a package', pk_sub: 'Coffee in three rounds is always included.',
    hours: 'hours', hour: 'hour', people: 'people', per_extra: 'Extra guests', popular: 'Most booked', choose: 'Book this package',
    how_title: 'How it works', s1: 'Choose', s1d: 'Pick a package.', s2: 'Pick a time', s2d: 'Pick a free time.', s3: 'We confirm', s3d: 'We call to confirm.', s4: 'Enjoy', s4d: 'We set up. You enjoy.',
    cta_title: 'Ready to book?', cta_btn: 'Book now',
    about_title: 'About the ceremony', about_p1: 'The coffee ceremony is how Ethiopia says welcome: beans roasted in front of you, brewed in a clay jebena, served in three rounds.',
    about_p2: 'Staying for all three rounds honours the host.',
    about_p3: 'We bring the full ceremony to your event.',
    abol: 'Abol', abol_d: 'The first and strongest round.', tona: 'Tona', tona_d: 'The second, gentler pour.', baraka: 'Baraka', baraka_d: 'The third, the blessing.',
    f_tag: 'Traditional Ethiopian coffee ceremonies for your event.', f_call: 'Call', f_tg: 'Telegram',
    b_title: 'Book your ceremony', st1: 'Package', st2: 'Date and time', st3: 'Details', st4: 'Review',
    b_next: 'Continue', b_back: 'Back', b_confirm: 'Confirm booking', b_sending: 'Sending…',
    date: 'Date', date_hint: 'Bookings open from tomorrow.', et_date: 'Ethiopian calendar', time: 'Start time', pick_date: 'Choose a date to see free times.', loading: 'Checking availability…', no_slots: 'No free times on this date. Try another day.', closed: 'We are closed on this date.',
    extra_hours: 'Extra hours', guests: 'Number of guests', name: 'Your name', phone: 'Phone number', phone_hint: 'Ethiopian number, e.g. 0911 22 33 44.', email: 'Email (optional)', event: 'Event type', area: 'Where is the event?', address: 'Address or landmark', notes: 'Anything we should know? (optional)',
    addons: 'Add-ons', included: 'Included', summary: 'Your booking', pkg: 'Package', when: 'When', where: 'Where', extra_guests: 'extra guests', travel: 'Travel outside Addis', total: 'Total', deposit: 'Deposit to confirm',
    e_required: 'Please fill this in.', e_phone: 'Enter a valid Ethiopian phone number.', e_email: 'Enter a valid email address.', e_date: 'Choose a date.', e_time: 'Choose a start time.', e_guests: 'Enter a number from 1 to 80.',
    e_slot_taken: 'Someone just booked that time. Please choose another.', e_generic: 'Something went wrong. Please try again.', e_rate: 'Too many attempts. Please wait a while and try again.',
    d_title: 'Booking received', d_p: 'Keep this reference. We will call to confirm.', d_dep: 'To confirm, send the deposit', d_dep2: 'by Telebirr to', d_dep3: 'and tell us your reference.',
    d_cal: 'Add to calendar', d_print: 'Print', d_track: 'Track booking',
    t_title: 'Find your booking', t_ref: 'Booking reference', t_find: 'Find booking', t_nf: 'No booking matches that reference and phone number.', t_cancel: 'Cancel booking', t_cancel_q: 'Cancel this booking?', t_cancelled: 'Booking cancelled.', t_late: 'Bookings can only be cancelled up to the day before. Please call us.',
    s_pending: 'Awaiting confirmation', s_confirmed: 'Confirmed', s_completed: 'Completed', s_cancelled: 'Cancelled',
    bq_title: 'Buna Qalaa', bq_text: 'Whole coffee cherries cooked in clarified butter (ghee). A traditional Oromo delicacy, served to honour your guests.', bq_btn: 'Add Buna Qalaa',
    ETB: 'ETB',
  },
  am: {
    nav_home: 'መነሻ', nav_packages: 'ጥቅሎች', nav_book: 'ቀጠሮ ያዙ', nav_about: 'ስለ እኛ', nav_track: 'ቀጠሮዬ',
    h_title: 'የኢትዮጵያ ቡና ሥነ ሥርዓት፣ በዝግጅትዎ ላይ።', h_lead: 'ጀበና፣ እጣንና ቀጤማ። ሁሉንም እኛ እናመጣለን።',
    h_cta1: 'ጥቅሎችን ይመልከቱ', h_cta2: 'ቀን ይያዙ',
    r1: 'አቦል', r1d: 'ጠንካራው', r2: 'ቶና', r2d: 'ለስላሳው', r3: 'በረካ', r3d: 'ምርቃቱ',
    ev_title: 'ለማንኛውም ዝግጅት', ev1: 'ሠርግና ተሞሽሮ', ev2: 'የልደት በዓል', ev3: 'ሽምግልና / ጃርሱማ', ev4: 'የመንግሥት ፕሮግራሞች', ev5: 'የትምህርት ቤትና የማኅበረሰብ ስብሰባዎች', ev6: 'እና ሌሎችም',
    pk_title: 'ጥቅል ይምረጡ', pk_sub: 'ሦስት ዙር ቡና ሁልጊዜ ተካቷል።',
    hours: 'ሰዓት', hour: 'ሰዓት', people: 'ሰዎች', per_extra: 'ተጨማሪ እንግዳ', popular: 'ብዙ የሚመረጥ', choose: 'ይህን ጥቅል ይያዙ',
    how_title: 'እንዴት ይሠራል', s1: 'ይምረጡ', s1d: 'ጥቅል ይምረጡ።', s2: 'ሰዓት ይያዙ', s2d: 'ክፍት ሰዓት ይምረጡ።', s3: 'እናረጋግጣለን', s3d: 'ደውለን እናረጋግጣለን።', s4: 'ይደሰቱ', s4d: 'እኛ እናዘጋጃለን፤ እርስዎ ይደሰቱ።',
    cta_title: 'ለመያዝ ዝግጁ ነዎት?', cta_btn: 'አሁን ይያዙ',
    about_title: 'ስለ ቡና ሥነ ሥርዓት', about_p1: 'የቡና ሥነ ሥርዓት ኢትዮጵያ እንኳን ደህና መጡ የምትልበት መንገድ ነው፤ ቡና ፊትዎ ተቆልቶ በጀበና ተፈልቶ በሦስት ዙር ይቀርባል።',
    about_p2: 'ሦስቱንም ዙር መቆየት ለአስተናጋጁ ክብር ነው።',
    about_p3: 'ሙሉ ሥነ ሥርዓቱን ወደ ዝግጅትዎ እናመጣለን።',
    abol: 'አቦል', abol_d: 'የመጀመሪያው ጠንካራ ዙር።', tona: 'ቶና', tona_d: 'ሁለተኛው ለስላሳ ዙር።', baraka: 'በረካ', baraka_d: 'ሦስተኛው የምርቃት ዙር።',
    f_tag: 'ባህላዊ የኢትዮጵያ ቡና ሥነ ሥርዓት ለዝግጅትዎ።', f_call: 'ይደውሉ', f_tg: 'ቴሌግራም',
    b_title: 'ቀጠሮዎን ይያዙ', st1: 'ጥቅል', st2: 'ቀንና ሰዓት', st3: 'ዝርዝር', st4: 'ማረጋገጫ',
    b_next: 'ቀጥል', b_back: 'ተመለስ', b_confirm: 'ቀጠሮውን አረጋግጥ', b_sending: 'በመላክ ላይ…',
    date: 'ቀን', date_hint: 'ከነገ ጀምሮ መያዝ ይቻላል።', et_date: 'የኢትዮጵያ ዘመን አቆጣጠር', time: 'የመጀመሪያ ሰዓት', pick_date: 'ክፍት ሰዓቶችን ለማየት ቀን ይምረጡ።', loading: 'በመፈተሽ ላይ…', no_slots: 'በዚህ ቀን ክፍት ሰዓት የለም። ሌላ ቀን ይሞክሩ።', closed: 'በዚህ ቀን ዝግ ነን።',
    extra_hours: 'ተጨማሪ ሰዓት', guests: 'የእንግዶች ብዛት', name: 'ስምዎ', phone: 'ስልክ ቁጥር', phone_hint: 'ለምሳሌ 0911 22 33 44።', email: 'ኢሜይል (አማራጭ)', event: 'የዝግጅት ዓይነት', area: 'ዝግጅቱ የት ነው?', address: 'አድራሻ ወይም መለያ ቦታ', notes: 'ልናውቀው የሚገባ ነገር አለ? (አማራጭ)',
    addons: 'ተጨማሪዎች', included: 'ተካቷል', summary: 'የእርስዎ ቀጠሮ', pkg: 'ጥቅል', when: 'መቼ', where: 'የት', extra_guests: 'ተጨማሪ እንግዶች', travel: 'ከአዲስ አበባ ውጭ ጉዞ', total: 'ጠቅላላ', deposit: 'ለማረጋገጥ ቀብድ',
    e_required: 'እባክዎ ይህን ይሙሉ።', e_phone: 'ትክክለኛ የኢትዮጵያ ስልክ ቁጥር ያስገቡ።', e_email: 'ትክክለኛ ኢሜይል ያስገቡ።', e_date: 'ቀን ይምረጡ።', e_time: 'ሰዓት ይምረጡ።', e_guests: 'ከ1 እስከ 80 ያስገቡ።',
    e_slot_taken: 'ያ ሰዓት አሁን ተይዟል። ሌላ ይምረጡ።', e_generic: 'ችግር ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።', e_rate: 'ብዙ ሙከራ ተደርጓል። ቆይተው ይሞክሩ።',
    d_title: 'ቀጠሮዎ ተቀብለናል', d_p: 'ይህን ቁጥር ያስቀምጡ። ለማረጋገጥ እንደውላለን።', d_dep: 'ለማረጋገጥ ቀብዱን ይላኩ', d_dep2: 'በቴሌብር ወደ', d_dep3: 'እና ቁጥሩን ይንገሩን።',
    d_cal: 'ወደ ካላንደር ጨምር', d_print: 'አትም', d_track: 'ቀጠሮ ተከታተል',
    t_title: 'ቀጠሮዎን ያግኙ', t_ref: 'የቀጠሮ ቁጥር', t_find: 'ፈልግ', t_nf: 'ከዚህ ቁጥርና ስልክ ጋር የሚመሳሰል ቀጠሮ አልተገኘም።', t_cancel: 'ቀጠሮ ሰርዝ', t_cancel_q: 'ይህን ቀጠሮ ይሰረዝ?', t_cancelled: 'ቀጠሮው ተሰርዟል።', t_late: 'ቀጠሮ መሰረዝ የሚቻለው እስከ ዋዜማው ብቻ ነው። እባክዎ ይደውሉ።',
    s_pending: 'ማረጋገጫ በመጠበቅ ላይ', s_confirmed: 'ተረጋግጧል', s_completed: 'ተጠናቋል', s_cancelled: 'ተሰርዟል',
    bq_title: 'ቡና ቃላ', bq_text: 'በተጣራ ቅቤ የተጠበሰ ሙሉ ቡና። እንግዶችን ለማክበር የሚቀርብ ባህላዊ የኦሮሞ ምግብ።', bq_btn: 'ቡና ቃላ ጨምር',
    ETB: 'ብር',
  },
};
const t = k => (I[lang] && I[lang][k]) ?? I.en[k] ?? k;
const L = o => (o && (o[lang] || o.en)) || '';
const money = n => new Intl.NumberFormat('en-US').format(n) + ' ' + t('ETB');

/* ------------------------------------------------------------------ dates */
const EM = { en: ['Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit', 'Megabit', 'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'],
  am: ['መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን'] };
function ethDate(iso) {
  const [Y, M, D] = iso.split('-').map(Number);
  const a = Math.floor((14 - M) / 12), y = Y + 4800 - a, m = M + 12 * a - 3;
  const jdn = D + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  const r = (jdn - 1723856) % 1461, n = (r % 365) + 365 * Math.floor(r / 1460);
  const year = 4 * Math.floor((jdn - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  return `${EM[lang][Math.floor(n / 30)]} ${(n % 30) + 1}, ${year}`;
}
const fmtDate = iso => new Date(iso + 'T12:00:00Z').toLocaleDateString(lang === 'am' ? 'am-ET' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/* ------------------------------------------------------------------ data / api */
let CAT = null, CFG = null;
async function api(path, opts) {
  const res = await fetch('/api' + path, opts && opts.body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(opts.body) } : undefined);
  let data = {}; try { data = await res.json(); } catch (_) {}
  if (!res.ok) { const e = new Error(data.error || 'error'); e.data = data; e.status = res.status; throw e; }
  return data;
}
const pkg = id => CAT.packages.find(p => p.id === id);
const addonName = id => { const a = CAT.addons.find(x => x.id === id); return a ? L(a.name) : id; };

// Illustrations: drop a real photo at public/img/photos/<name>.jpg and it replaces the artwork automatically.
function pic(name, alt, cls = '', fb = '') {
  return `<img class="${cls}" src="img/photos/${name}.jpg" data-fb="${fb || 'img/' + name + '.svg'}" alt="${esc(alt)}" loading="lazy">`;
}
document.addEventListener('error', e => {
  const im = e.target;
  if (im.tagName === 'IMG' && im.dataset.fb && !im.dataset.done) { im.dataset.done = 1; im.src = im.dataset.fb; }
}, true);
document.addEventListener('load', e => { const im = e.target; if (im.tagName === 'IMG' && im.src.includes('/photos/')) im.classList.add('photo'); }, true);

function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 3200); }

/* ------------------------------------------------------------------ chrome */
function chrome(route) {
  document.documentElement.lang = lang;
  const links = [['', 'nav_home'], ['packages', 'nav_packages'], ['book', 'nav_book'], ['about', 'nav_about'], ['track', 'nav_track']];
  $('#nav').innerHTML = links.map(([r, k]) => `<a href="#/${r}" ${r === route ? 'aria-current="page"' : ''}>${t(k)}</a>`).join('');
  $('#langBtn').textContent = lang === 'en' ? 'አማርኛ' : 'English';
  $('#fTag').textContent = t('f_tag');
  $('#fLinks').innerHTML = links.slice(1).map(([r, k]) => `<a href="#/${r}">${t(k)}</a><br>`).join('');
  $('#year').textContent = new Date().getFullYear();
  if (CFG) {
    const c = CFG.contact;
    $('#fContact').innerHTML = `${t('f_call')}: <a href="tel:${esc(c.phone)}">${esc(c.phone)}</a>` +
      (c.telegram ? `<br>${t('f_tg')}: <a href="https://t.me/${esc(c.telegram)}" rel="noopener">@${esc(c.telegram)}</a>` : '');
  }
}

/* ------------------------------------------------------------------ pages */
function pkgCard(p) {
  const incl = p.includes.map(id => `<li>${esc(L(CAT.items[id]))}</li>`).join('');
  return `<article class="pk ${p.popular ? 'pop' : ''}">
    ${pic('pack-' + p.id, L(p.name))}
    <div class="in"><h3>${esc(L(p.name))}${p.popular ? `<span class="tag">${t('popular')}</span>` : ''}</h3>
      <p class="meta">${esc(L(p.tagline))}</p>
      <div class="price">${money(p.price)}</div>
      <p class="meta">${p.hours} ${p.hours > 1 ? t('hours') : t('hour')} · ${p.people} ${t('people')}</p>
      <ul>${incl}</ul>
      <a class="btn ${p.popular ? '' : 'dark'}" href="#/book?pkg=${p.id}">${t('choose')}</a></div></article>`;
}

function pageHome() {
  const bq = CAT.addons.find(x => x.id === 'qalaa');
  return `<section class="hero"><div class="wrap">
      <div><h1>${t('h_title')}</h1><p class="lead">${t('h_lead')}</p>
        <div class="cta"><a class="btn" href="#/book">${t('h_cta2')}</a><a class="btn ghost" href="#/packages">${t('h_cta1')}</a></div>
        <div class="rounds"><div><b>${t('r1')}</b>${t('r1d')}</div><div><b>${t('r2')}</b>${t('r2d')}</div><div><b>${t('r3')}</b>${t('r3d')}</div></div></div>
      <div class="hero-photos">${pic('hero', 'Coffee poured from a clay jebena into painted cups', '', 'img/hero.svg')}${pic('hero2', 'Ceremony set on fresh grass with a woven basket and flowers', 'inset', 'img/pack-wedding.svg')}</div></div></section>
    <section class="events"><div class="wrap"><h2>${t('ev_title')}</h2>
      <ul>${[1, 2, 3, 4, 5, 6].map(i => `<li>${t('ev' + i)}</li>`).join('')}</ul></div></section>
    <section><div class="wrap"><h2>${t('pk_title')}</h2><p>${t('pk_sub')}</p>
      <div class="pk-grid">${CAT.packages.map(pkgCard).join('')}</div></div></section>
    <section class="bq"><div class="wrap bq-grid">
      <div>${pic('buna-qalaa', 'Roasted coffee in a clay bowl, held by an Oromo woman in traditional dress', '', 'img/about.svg')}</div>
      <div><h2>${t('bq_title')}</h2><p>${t('bq_text')}</p><a class="btn" href="#/book?qalaa=1">${t('bq_btn')} · +${money(bq.price)}</a></div></div></section>
    <section><div class="wrap"><h2>${t('how_title')}</h2>
      <ol class="steps">${[1, 2, 3, 4].map(i => `<li><b>${t('s' + i)}</b>${t('s' + i + 'd')}</li>`).join('')}</ol></div></section>
    <section class="cta-band"><div class="wrap"><h2>${t('cta_title')}</h2><a class="btn" href="#/book">${t('cta_btn')}</a></div></section>`;
}

function pagePackages() {
  const extras = CAT.addons.map(a => `<li>${esc(L(a.name))} <b>+${money(a.price)}</b></li>`).join('');
  return `<section><div class="wrap"><h1>${t('pk_title')}</h1><p>${t('pk_sub')}</p>
    <div class="pk-grid">${CAT.packages.map(pkgCard).join('')}</div>
    <div class="card" style="margin-top:2rem"><h3>${t('addons')}</h3>
      <ul style="columns:2;padding-left:1.1rem">${extras}<li>${t('extra_hours')} <b>+${money(CAT.extraHourPrice)}</b></li><li>${t('per_extra')} <b>+${money(CFG.rules.extraGuestPrice)}</b></li></ul></div></div></section>`;
}

function pageAbout() {
  return `<section><div class="wrap about-grid"><div><h1>${t('about_title')}</h1><p>${t('about_p1')}</p><p>${t('about_p2')}</p><p>${t('about_p3')}</p>
      <a class="btn" href="#/book">${t('nav_book')}</a></div>${pic('about', 'Three cups of coffee beside a clay jebena')}</div>
    <div class="wrap"><div class="three"><div><b>${t('abol')}</b>${t('abol_d')}</div><div><b>${t('tona')}</b>${t('tona_d')}</div><div><b>${t('baraka')}</b>${t('baraka_d')}</div></div></div></section>`;
}

/* ---- booking wizard ---- */
const B = { step: 1, pkg: 'premium', date: '', time: '', extraHours: 0, addons: new Set(), guests: null, name: '', phone: '', email: '', eventType: 'wedding', area: 'bole', address: '', notes: '', slots: null, slotsErr: '', busy: false, err: {}, banner: '' };

function calc() {
  const p = pkg(B.pkg); const g = B.guests || p.people;
  let total = p.price; const rows = [[L(p.name), p.price]];
  if (g > p.people) { const x = (g - p.people) * CFG.rules.extraGuestPrice; total += x; rows.push([`${g - p.people} ${t('extra_guests')}`, x]); }
  if (B.extraHours) { const x = B.extraHours * CAT.extraHourPrice; total += x; rows.push([`+${B.extraHours} ${t('hours')}`, x]); }
  for (const id of B.addons) if (!p.includes.includes(id)) { const a = CAT.addons.find(x => x.id === id); total += a.price; rows.push([L(a.name), a.price]); }
  if (B.area === 'outside') { total += CFG.rules.travelFeeOutside; rows.push([t('travel'), CFG.rules.travelFeeOutside]); }
  return { rows, total, deposit: Math.round(total * CFG.rules.depositPercent / 100 / 10) * 10, guests: g };
}
const endTime = () => { const p = pkg(B.pkg), [h, m] = B.time.split(':').map(Number), e = h * 60 + m + (p.hours + B.extraHours) * 60; return String(Math.floor(e / 60)).padStart(2, '0') + ':' + String(e % 60).padStart(2, '0'); };

async function loadSlots() {
  B.slots = null; B.slotsErr = '';
  if (!B.date) return paintBook();
  paintBook();
  try {
    const r = await api(`/availability?date=${B.date}&package=${B.pkg}&extraHours=${B.extraHours}`);
    B.slots = r.slots; B.slotsErr = r.blocked ? 'closed' : '';
    if (B.time && !r.slots.some(s => s.time === B.time && s.available)) B.time = '';
  } catch (e) { B.slots = []; B.slotsErr = 'err'; }
  paintBook();
}

function fieldErr(k) { return B.err[k] ? `<div class="msg">${esc(B.err[k])}</div>` : ''; }
const fc = k => `field ${B.err[k] ? 'err' : ''}`;

function stepHtml() {
  const p = pkg(B.pkg);
  if (B.step === 1) return `<div class="choice" role="radiogroup" aria-label="${t('st1')}">${CAT.packages.map(x => `
    <label class="${x.id === B.pkg ? 'on' : ''}"><input type="radio" name="pkg" value="${x.id}" ${x.id === B.pkg ? 'checked' : ''}>
    ${pic('pack-' + x.id, '')}<span class="grow"><b>${esc(L(x.name))}</b><br><small>${x.hours} ${t('hours')} · ${x.people} ${t('people')}</small></span><span class="p">${money(x.price)}</span></label>`).join('')}</div>`;
  if (B.step === 2) {
    let slots = `<p class="hint">${t('pick_date')}</p>`;
    if (B.date) {
      if (B.slots === null) slots = `<p class="hint">${t('loading')}</p>`;
      else if (B.slotsErr === 'closed') slots = `<p class="msg">${t('closed')}</p>`;
      else if (!B.slots.some(s => s.available)) slots = `<p class="msg">${t('no_slots')}</p>`;
      else slots = `<div class="slots">${B.slots.map(s => `<button type="button" class="slot" data-time="${s.time}" aria-pressed="${s.time === B.time}" ${s.available ? '' : 'disabled'}>${s.time}</button>`).join('')}</div>`;
    }
    return `<div class="grid2"><div class="${fc('date')}"><label for="date">${t('date')}</label><input id="date" type="date" min="${CFG.rules.minDate}" max="${CFG.rules.maxDate}" value="${B.date}">
      <div class="hint">${B.date ? `${t('et_date')}: <b>${ethDate(B.date)}</b>` : t('date_hint')}</div>${fieldErr('date')}</div>
      <div class="field"><label for="xh">${t('extra_hours')}</label><select id="xh">${Array.from({ length: CAT.maxExtraHours + 1 }, (_, i) => `<option value="${i}" ${i === B.extraHours ? 'selected' : ''}>${i ? '+' + i + ' (' + money(i * CAT.extraHourPrice) + ')' : '0'}</option>`).join('')}</select></div></div>
      <div class="${fc('time')}"><span class="lab">${t('time')}${B.time ? ` — ${B.time}–${endTime()}` : ''}</span>${slots}${fieldErr('time')}</div>`;
  }
  if (B.step === 3) {
    const g = B.guests || p.people;
    return `<div class="grid2"><div class="${fc('name')}"><label for="name">${t('name')}</label><input id="name" autocomplete="name" value="${esc(B.name)}">${fieldErr('name')}</div>
      <div class="${fc('phone')}"><label for="phone">${t('phone')}</label><input id="phone" type="tel" inputmode="tel" autocomplete="tel" value="${esc(B.phone)}"><div class="hint">${t('phone_hint')}</div>${fieldErr('phone')}</div>
      <div class="${fc('email')}"><label for="email">${t('email')}</label><input id="email" type="email" autocomplete="email" value="${esc(B.email)}">${fieldErr('email')}</div>
      <div class="${fc('guests')}"><label for="guests">${t('guests')}</label><input id="guests" type="number" min="1" max="${CFG.rules.maxGuests}" value="${g}"><div class="hint">${p.people} ${t('people')} ${t('included').toLowerCase()} · +${money(CFG.rules.extraGuestPrice)} ${t('per_extra').toLowerCase()}</div>${fieldErr('guests')}</div>
      <div class="field"><label for="eventType">${t('event')}</label><select id="eventType">${CAT.eventTypes.map(e => `<option value="${e.id}" ${e.id === B.eventType ? 'selected' : ''}>${esc(L(e))}</option>`).join('')}</select></div>
      <div class="field"><label for="area">${t('area')}</label><select id="area">${CAT.areas.map(a => `<option value="${a.id}" ${a.id === B.area ? 'selected' : ''}>${esc(L(a))}${a.id === 'outside' ? ' (+' + money(CFG.rules.travelFeeOutside) + ')' : ''}</option>`).join('')}</select></div></div>
      <div class="${fc('address')}"><label for="address">${t('address')}</label><input id="address" autocomplete="street-address" value="${esc(B.address)}">${fieldErr('address')}</div>
      <div class="field"><span class="lab">${t('addons')}</span><div class="choice">${CAT.addons.map(a => {
        const inc = p.includes.includes(a.id), on = inc || B.addons.has(a.id);
        return `<label class="${on ? 'on' : ''}"><input type="checkbox" data-addon="${a.id}" ${on ? 'checked' : ''} ${inc ? 'disabled' : ''}><span class="grow">${esc(L(a.name))}</span><span class="p">${inc ? t('included') : '+' + money(a.price)}</span></label>`; }).join('')}</div></div>
      <div class="field"><label for="notes">${t('notes')}</label><textarea id="notes" maxlength="500">${esc(B.notes)}</textarea></div>`;
  }
  const c = calc();
  return `<dl class="sum" style="position:static;margin:0">${[
    [t('pkg'), esc(L(p.name))], [t('when'), `${esc(fmtDate(B.date))}<br>${B.time}–${endTime()}<br><small>${ethDate(B.date)}</small>`],
    [t('where'), `${esc(L(CAT.areas.find(a => a.id === B.area)))}, ${esc(B.address)}`], [t('guests'), c.guests],
    [t('name'), esc(B.name)], [t('phone'), esc(B.phone)]].map(([k, v]) => `<div class="row"><dt>${k}</dt><dd style="margin:0;text-align:right">${v}</dd></div>`).join('')}</dl>`;
}

function paintBook() {
  const root = $('#bookRoot'); if (!root) return;
  const keep = document.activeElement && document.activeElement.id;
  const c = calc();
  const steps = ['st1', 'st2', 'st3', 'st4'];
  root.innerHTML = `<ol class="stepper">${steps.map((s, i) => `<li class="${i + 1 === B.step ? 'on' : i + 1 < B.step ? 'done' : ''}">${i + 1}. ${t(s)}</li>`).join('')}</ol>
    <div class="book"><div class="card">${B.banner ? `<div class="alert" role="alert">${esc(B.banner)}</div>` : ''}${stepHtml()}
      <div class="nav-btns">${B.step > 1 ? `<button class="btn ghost" type="button" id="back">${t('b_back')}</button>` : '<span></span>'}
      <button class="btn" type="button" id="next" ${B.busy ? 'disabled' : ''}>${B.step === 4 ? (B.busy ? t('b_sending') : t('b_confirm')) : t('b_next')}</button></div></div>
      <aside class="card sum" aria-label="${t('summary')}"><h3>${t('summary')}</h3>
        ${c.rows.map(([k, v]) => `<div class="row"><span>${esc(k)}</span><span>${money(v)}</span></div>`).join('')}
        <div class="row total"><span>${t('total')}</span><span>${money(c.total)}</span></div>
        <div class="row"><span>${t('deposit')}</span><span>${money(c.deposit)}</span></div></aside></div>`;
  if (keep) { const el = document.getElementById(keep); if (el) { el.focus(); try { el.setSelectionRange(el.value.length, el.value.length); } catch (_) {} } }
}

function readStep3() {
  const v = id => ($('#' + id) || {}).value || '';
  B.name = v('name').trim(); B.phone = v('phone').trim(); B.email = v('email').trim(); B.address = v('address').trim(); B.notes = v('notes');
  B.guests = parseInt(v('guests'), 10) || null; B.eventType = v('eventType') || B.eventType; B.area = v('area') || B.area;
}
function validate(step) {
  const e = {};
  if (step === 2) { if (!B.date) e.date = t('e_date'); if (!B.time) e.time = t('e_time'); }
  if (step === 3) {
    if (B.name.length < 2) e.name = t('e_required');
    if (!/^(\+?251|0)?[79]\d{8}$/.test(B.phone.replace(/[\s-]/g, ''))) e.phone = t('e_phone');
    if (B.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(B.email)) e.email = t('e_email');
    if (!(B.guests >= 1 && B.guests <= CFG.rules.maxGuests)) e.guests = t('e_guests');
    if (B.address.length < 4) e.address = t('e_required');
  }
  B.err = e; return !Object.keys(e).length;
}

async function submitBooking() {
  B.busy = true; B.banner = ''; paintBook();
  try {
    const r = await api('/bookings', { body: { package: B.pkg, date: B.date, time: B.time, extraHours: B.extraHours, addons: [...B.addons], guests: B.guests || pkg(B.pkg).people,
      name: B.name, phone: B.phone, email: B.email, eventType: B.eventType, area: B.area, address: B.address, notes: B.notes, lang } });
    store.set('lastRef', r.booking.ref);
    renderDone(r.booking);
  } catch (e) {
    B.busy = false;
    if (e.data && e.data.error === 'slot_taken') { B.banner = t('e_slot_taken'); B.step = 2; B.time = ''; loadSlots(); return; }
    if (e.status === 429) B.banner = t('e_rate'); else if (e.data && e.data.fields) { B.banner = Object.keys(e.data.fields).join(', '); B.step = 3; } else B.banner = t('e_generic');
    paintBook();
  }
}

function icsFor(b) {
  const d = b.date.replace(/-/g, ''), tm = s => s.replace(':', '') + '00', pk = pkg(b.package);
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Bontu//Coffee//EN', 'BEGIN:VEVENT', `UID:${b.ref}@bontu`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART;TZID=Africa/Addis_Ababa:${d}T${tm(b.time)}`, `DTEND;TZID=Africa/Addis_Ababa:${d}T${tm(b.end)}`, `SUMMARY:Coffee ceremony (${pk.name.en})`, `LOCATION:${b.address.replace(/[,;\n]/g, ' ')}`, `DESCRIPTION:Booking ${b.ref}`, 'END:VEVENT', 'END:VCALENDAR'];
  return URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar' }));
}

function renderDone(b) {
  const root = $('#bookRoot'); const c = CFG.contact;
  root.innerHTML = `<div class="done-box"><img src="img/logo.svg" alt="" width="72" height="72" style="margin:0 auto 1rem"><h1 style="font-size:2.2rem">${t('d_title')}</h1><p>${t('d_p')}</p>
    <div class="ref" aria-label="${t('t_ref')}">${esc(b.ref)}</div>
    <div class="card" style="text-align:left;margin:1.5rem 0">${bookingBlock(b)}</div>
    <p>${t('d_dep')} <b>${money(b.deposit)}</b> ${t('d_dep2')} <b>${esc(c.telebirrNumber)}</b> (${esc(c.telebirrName)}) ${t('d_dep3')}</p>
    <p><a class="btn sm" id="ics" download="bontu-${esc(b.ref)}.ics" href="${icsFor(b)}">${t('d_cal')}</a> <button class="btn sm ghost" id="print">${t('d_print')}</button> <a class="btn sm dark" href="#/track">${t('d_track')}</a></p></div>`;
  $('#print').onclick = () => window.print();
  window.scrollTo({ top: 0 });
}

function bookingBlock(b) {
  const p = pkg(b.package);
  return `<div class="row" style="display:flex;justify-content:space-between"><b>${esc(L(p.name))}</b><span class="status ${b.status}">${t('s_' + b.status)}</span></div>
    <p style="margin:.6rem 0 0">${esc(fmtDate(b.date))}, ${b.time}–${b.end}<br><small>${ethDate(b.date)}</small></p>
    <p style="margin:.4rem 0 0">${esc(L(CAT.areas.find(a => a.id === b.area)))}, ${esc(b.address)}</p>
    <p style="margin:.4rem 0 0">${b.guests} ${t('people')}${b.addons.length ? ' · ' + b.addons.map(a => esc(addonName(a))).join(', ') : ''}</p>
    <p style="margin:.4rem 0 0"><b>${t('total')}: ${money(b.total)}</b> · ${t('deposit')}: ${money(b.deposit)}</p>`;
}

function pageBook(q) {
  if (q.pkg && pkg(q.pkg) && !B._init) { B.pkg = q.pkg; if (B.step === 1) B.step = 2; }
  if (q.qalaa && !B._init) B.addons.add('qalaa');
  B._init = true;
  setTimeout(() => { paintBook(); if (B.step === 2 && B.date) loadSlots(); }, 0);
  return `<section><div class="wrap"><h1>${t('b_title')}</h1><div id="bookRoot"></div></div></section>`;
}

function bindBook() {
  const root = document.getElementById('main');
  root.addEventListener('click', async e => {
    if (!$('#bookRoot')) return;
    const slot = e.target.closest('.slot');
    if (slot) { B.time = slot.dataset.time; B.err = {}; return paintBook(); }
    if (e.target.id === 'back') { if (B.step === 3) readStep3(); B.step--; B.banner = ''; B.err = {}; return paintBook(); }
    if (e.target.id === 'next') {
      if (B.step === 3) readStep3();
      if (B.step === 4) return submitBooking();
      if (!validate(B.step)) return paintBook();
      B.step++; B.banner = ''; paintBook(); window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
  root.addEventListener('change', e => {
    if (!$('#bookRoot')) return;
    const el = e.target;
    if (el.name === 'pkg') { B.pkg = el.value; B.guests = null; B.addons = new Set(); B.time = ''; paintBook(); }
    else if (el.id === 'date') { B.date = el.value; B.time = ''; B.err = {}; loadSlots(); }
    else if (el.id === 'xh') { B.extraHours = +el.value; B.time = ''; loadSlots(); }
    else if (el.dataset.addon) { el.checked ? B.addons.add(el.dataset.addon) : B.addons.delete(el.dataset.addon); readStep3(); paintBook(); }
    else if (['guests', 'area', 'eventType'].includes(el.id)) { readStep3(); paintBook(); }
  });
}

/* ---- track ---- */
function pageTrack() {
  setTimeout(() => {
    const f = $('#trackForm'); if (!f) return;
    $('#tref').value = store.get('lastRef') || '';
    f.onsubmit = async ev => {
      ev.preventDefault(); const out = $('#trackOut'); out.innerHTML = `<p class="hint">${t('loading')}</p>`;
      try { const r = await api('/bookings/lookup', { body: { ref: $('#tref').value, phone: $('#tphone').value } }); showTracked(r.booking); }
      catch (e) { out.innerHTML = `<div class="alert" role="alert">${e.status === 429 ? t('e_rate') : t('t_nf')}</div>`; }
    };
  }, 0);
  return `<section><div class="wrap"><h1>${t('t_title')}</h1><form id="trackForm" class="card" style="max-width:520px">
    <div class="field"><label for="tref">${t('t_ref')}</label><input id="tref" required autocomplete="off" style="text-transform:uppercase"></div>
    <div class="field"><label for="tphone">${t('phone')}</label><input id="tphone" type="tel" inputmode="tel" required></div>
    <button class="btn" type="submit">${t('t_find')}</button></form><div id="trackOut" style="max-width:520px;margin-top:1.2rem"></div></div></section>`;
}
function showTracked(b) {
  const out = $('#trackOut');
  const can = ['pending', 'confirmed'].includes(b.status);
  out.innerHTML = `<div class="card"><p style="margin:0 0 .6rem"><b style="font:400 1.5rem var(--display)">${esc(b.ref)}</b></p>${bookingBlock(b)}
    ${can ? `<p style="margin-top:1rem"><button class="btn sm ghost" id="cancelBtn">${t('t_cancel')}</button></p>` : ''}</div>`;
  const cb = $('#cancelBtn');
  if (cb) cb.onclick = async () => {
    if (!confirm(t('t_cancel_q'))) return;
    try { const r = await api('/bookings/cancel', { body: { ref: b.ref, phone: $('#tphone').value } }); toast(t('t_cancelled')); showTracked(r.booking); }
    catch (e) { toast(e.data && e.data.error === 'too_late_to_cancel' ? t('t_late') : t('e_generic')); }
  };
}

/* ------------------------------------------------------------------ router */
async function route() {
  const [path, qs] = (location.hash.replace(/^#\/?/, '') || '').split('?');
  const q = Object.fromEntries(new URLSearchParams(qs || ''));
  const main = $('#main');
  if (!CAT) { main.innerHTML = `<div class="loading">…</div>`; try { [CAT, CFG] = await Promise.all([api('/catalog'), api('/config')]); } catch (_) { main.innerHTML = `<div class="loading">${t('e_generic')}</div>`; return; } }
  const pages = { '': pageHome, packages: pagePackages, book: () => pageBook(q), about: pageAbout, track: pageTrack };
  const r = pages[path] ? path : '';
  chrome(r);
  main.innerHTML = pages[r]();
  document.title = 'Bontu · ' + t('nav_' + (r || 'home') ) ;
  if (!q._keep) window.scrollTo({ top: 0 });
}
$('#langBtn').addEventListener('click', () => { lang = lang === 'en' ? 'am' : 'en'; store.set('lang', lang); route(); });
window.addEventListener('hashchange', route);
bindBook();
route();
})();
