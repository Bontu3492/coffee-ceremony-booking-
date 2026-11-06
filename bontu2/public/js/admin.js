(() => {
'use strict';
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => new Intl.NumberFormat('en-US').format(n) + ' ETB';
let token = sessionStorage.getItem('adm') || '';
let CAT = null;

async function api(path, method = 'GET', body) {
  const res = await fetch('/api/admin' + path, { method, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: body ? JSON.stringify(body) : undefined });
  if (res.status === 401) { signOut(); throw new Error('unauthorized'); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'error'), { data });
  return data;
}
function signOut() { token = ''; sessionStorage.removeItem('adm'); $('#app').classList.add('hidden'); $('#out').classList.add('hidden'); $('#login').classList.remove('hidden'); }
function show() { $('#login').classList.add('hidden'); $('#app').classList.remove('hidden'); $('#out').classList.remove('hidden'); refresh(); }

$('#login').addEventListener('submit', async e => {
  e.preventDefault(); $('#lerr').textContent = '';
  try {
    const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: $('#pw').value }) });
    const d = await r.json();
    if (!r.ok) throw new Error(r.status === 429 ? 'Too many attempts. Wait a few minutes.' : 'Wrong password.');
    token = d.token; sessionStorage.setItem('adm', token); $('#pw').value = ''; show();
  } catch (err) { $('#lerr').textContent = err.message; }
});
$('#out').onclick = signOut;

async function refresh() {
  if (!CAT) CAT = await (await fetch('/api/catalog')).json();
  const [s, b, bl] = await Promise.all([api('/stats'), loadRows(), api('/blocked')]);
  $('#stats').innerHTML = [['Waiting for confirmation', s.pending], ['Upcoming confirmed', s.upcoming], ['Today', s.today], ['Revenue this month', money(s.revenueMonth)], ['Revenue all time', money(s.revenueConfirmed)]]
    .map(([k, v]) => `<div class="stat"><b>${esc(v)}</b>${k}</div>`).join('');
  $('#blist').innerHTML = bl.blocked.length ? bl.blocked.map(x => `<li>${esc(x.date)} ${x.reason ? '— ' + esc(x.reason) : ''} <button class="btn sm ghost" data-unblock="${esc(x.date)}">Open again</button></li>`).join('') : '<li>No closed dates.</li>';
}

async function loadRows() {
  const p = new URLSearchParams();
  for (const [k, id] of [['q', '#fq'], ['status', '#fs'], ['from', '#ff'], ['to', '#ft']]) if ($(id).value) p.set(k, $(id).value);
  const { bookings } = await api('/bookings?' + p);
  const pkgName = id => (CAT.packages.find(x => x.id === id) || { name: { en: id } }).name.en;
  $('#rows').innerHTML = bookings.length ? bookings.map(b => `<tr>
    <td><b>${esc(b.ref)}</b><br><small>${esc(b.createdAt)}</small></td>
    <td>${esc(b.date)}<br>${esc(b.time)}–${esc(b.end)}</td>
    <td>${esc(b.name)}<br><a href="tel:${esc(b.phone)}">${esc(b.phone)}</a>${b.email ? '<br>' + esc(b.email) : ''}</td>
    <td>${esc(pkgName(b.package))} · ${b.guests} guests<br>${esc(b.eventType)}<br><small>${esc(b.area)}, ${esc(b.address)}</small>${b.addons.length ? '<br><small>+ ' + esc(b.addons.join(', ')) + '</small>' : ''}${b.notes ? '<br><small><i>' + esc(b.notes) + '</i></small>' : ''}</td>
    <td>${money(b.total)}<br><small>deposit ${money(b.deposit)}</small></td>
    <td><span class="status ${esc(b.status)}">${esc(b.status)}</span></td>
    <td><div class="acts">${['confirmed', 'completed', 'cancelled'].filter(x => x !== b.status).map(x => `<button class="btn sm ${x === 'cancelled' ? 'ghost' : 'dark'}" data-id="${b.id}" data-status="${x}">${x === 'confirmed' ? 'Confirm' : x === 'completed' ? 'Done' : 'Cancel'}</button>`).join('')}<button class="btn sm ghost" data-del="${b.id}" aria-label="Delete">Delete</button></div></td></tr>`).join('')
    : '<tr><td colspan="7">No bookings match.</td></tr>';
}

document.addEventListener('click', async e => {
  const t = e.target;
  try {
    if (t.dataset.status) { await api('/bookings/' + t.dataset.id, 'PATCH', { status: t.dataset.status }); refresh(); }
    else if (t.dataset.del) { if (confirm('Delete this booking permanently?')) { await api('/bookings/' + t.dataset.del, 'DELETE'); refresh(); } }
    else if (t.dataset.unblock) { await api('/blocked/' + t.dataset.unblock, 'DELETE'); refresh(); }
    else if (t.id === 'csv') {
      const r = await fetch('/api/admin/export.csv', { headers: { Authorization: 'Bearer ' + token } });
      const a = document.createElement('a'); a.href = URL.createObjectURL(await r.blob()); a.download = 'bookings.csv'; a.click();
    }
  } catch (err) { if (err.data && err.data.error === 'slot_taken') alert('That time is now taken by another booking.'); }
});
$('#blk').addEventListener('submit', async e => { e.preventDefault(); await api('/blocked', 'POST', { date: $('#bd').value, reason: $('#br').value }); $('#bd').value = ''; $('#br').value = ''; refresh(); });
let tmr; for (const id of ['#fq', '#fs', '#ff', '#ft']) $(id).addEventListener('input', () => { clearTimeout(tmr); tmr = setTimeout(() => loadRows().catch(() => {}), 250); });

if (token) show();
})();
