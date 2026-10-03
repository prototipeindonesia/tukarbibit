/* =========================================================
   TukarBibit — Main Application Logic
   ========================================================= */

/* ---------- STORAGE KEYS ---------- */
const LS = {
  user:     'tb_user',
  users:    'tb_users',
  listings: 'tb_listings',
  offers:   'tb_offers',
  swaps:    'tb_swaps',
  chats:    'tb_chats',
  tasks:    'tb_tasks',
  reviews:  'tb_reviews',
  guides:   'tb_guides'
};

/* ---------- STATE ---------- */
let state = {
  user: null,
  users: [],
  listings: [],
  offers: [],
  swaps: [],
  chats: {},
  tasks: [],
  reviews: [],
  guides: [],
  activeTab: 'home',
  filter: { q: '', city: '', type: '' }
};

/* ---------- HELPERS ---------- */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const uid = () => 'x' + Math.random().toString(36).slice(2, 9);
const fmtDate = ts => new Date(ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2400);
}

function userById(id) { return state.users.find(u => u.id === id) || state.user; }

/* ---------- BOOTSTRAP ---------- */
function bootstrap() {
  state.users    = load(LS.users,    SEED_USERS);
  state.listings = load(LS.listings, SEED_LISTINGS);
  state.offers   = load(LS.offers,   []);
  state.swaps    = load(LS.swaps,    []);
  state.chats    = load(LS.chats,    SEED_CHATS);
  state.tasks    = load(LS.tasks,    SEED_TASKS);
  state.reviews  = load(LS.reviews,  []);
  state.guides   = load(LS.guides,   SEED_GUIDES);

  const savedUser = load(LS.user, null);
  if (savedUser) {
    state.user = savedUser;
    showApp();
  } else {
    showAuth();
  }
}

/* ---------- AUTH ---------- */
function showAuth() {
  $('#authScreen').classList.remove('hidden');
  $('#app').classList.add('hidden');
}
function showApp() {
  $('#authScreen').classList.add('hidden');
  $('#app').classList.remove('hidden');
  updatePoints();
  renderTab('home');
}

function handleLogin(e) {
  e.preventDefault();
  const name = $('#loginName').value.trim();
  const city = $('#loginCity').value.trim();
  if (!name || !city) return;

  let u = state.users.find(x => x.name.toLowerCase() === name.toLowerCase());
  if (!u) {
    u = { id: uid(), name, city, land: 'Pot / Balkon', points: 100, rating: 5.0, swaps: 0, badges: ['Pendatang Baru'] };
    state.users.push(u);
    save(LS.users, state.users);
  }
  state.user = u;
  save(LS.user, u);
  showApp();
  toast(`Selamat datang, ${u.name}! 🌱`);
}

function handleRegister(e) {
  e.preventDefault();
  const name = $('#regName').value.trim();
  const city = $('#regCity').value.trim();
  const land = $('#regLand').value;
  if (!name || !city) return;

  const u = { id: uid(), name, city, land, points: 100, rating: 5.0, swaps: 0, badges: ['Pendatang Baru'] };
  state.users.push(u);
  save(LS.users, state.users);
  state.user = u;
  save(LS.user, u);
  showApp();
  toast(`Akun dibuat. Selamat berkebun, ${u.name}! 🌿`);
}

function logout() {
  localStorage.removeItem(LS.user);
  state.user = null;
  closeModal();
  showAuth();
  toast('Kamu telah keluar.');
}

/* ---------- POINTS ---------- */
function updatePoints() {
  if (!state.user) return;
  $('#pointsDisplay').textContent = state.user.points;
  $('#topAvatar').textContent = state.user.name.charAt(0).toUpperCase();
}
function addPoints(n) {
  state.user.points += n;
  save(LS.user, state.user);
  // update di daftar user juga
  const idx = state.users.findIndex(u => u.id === state.user.id);
  if (idx > -1) { state.users[idx].points = state.user.points; save(LS.users, state.users); }
  updatePoints();
}

/* ---------- TABS ---------- */
function renderTab(tab) {
  state.activeTab = tab;
  $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  const main = $('#mainContent');
  main.innerHTML = '';

  switch (tab) {
    case 'home':    main.innerHTML = viewHome();    break;
    case 'explore': main.innerHTML = viewExplore(); bindExplore(); break;
    case 'add':     main.innerHTML = viewAdd();     bindAdd();      break;
    case 'swaps':   main.innerHTML = viewSwaps();   bindSwaps();    break;
    case 'guides':  main.innerHTML = viewGuides();  bindGuides();   break;
    case 'profile': main.innerHTML = viewProfile(); bindProfile();  break;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------- VIEW: HOME ---------- */
function viewHome() {
  const myListings = state.listings.filter(l => l.userId === state.user.id);
  const recent = state.listings.filter(l => l.userId !== state.user.id).slice(0, 4);
  const pendingOffers = state.offers.filter(o => o.toUserId === state.user.id && o.status === 'pending');
  const todayTasks = state.tasks.filter(t => !t.done);

  return `
    <section class="hero">
      <h2>Halo, ${state.user.name} 👋</h2>
      <p>Mari bertukar bibit dan hijaukan ${state.user.city} bersama komunitas.</p>
      <div class="hero-stats">
        <div class="hero-stat"><b>${myListings.length}</b><span>Listing saya</span></div>
        <div class="hero-stat"><b>${pendingOffers.length}</b><span>Tawaran masuk</span></div>
        <div class="hero-stat"><b>${state.user.swaps}</b><span>Swap selesai</span></div>
      </div>
    </section>

    ${pendingOffers.length ? `
      <section class="section">
        <div class="section-head"><h3>🔔 Tawaran Menunggu</h3></div>
        ${pendingOffers.map(o => {
          const listing = state.listings.find(l => l.id === o.listingId) || {};
          const from = userById(o.fromUserId);
          return `
            <div class="list-row">
              <div class="thumb">${listing.emoji || '🌱'}</div>
              <div class="info">
                <h4>${from?.name} ingin menukar ${listing.plant}</h4>
                <p>Menawarkan: <b>${o.offerPlant}</b></p>
              </div>
              <div class="actions">
                <button class="btn btn-sm btn-accent" data-accept="${o.id}">Terima</button>
                <button class="btn btn-sm btn-ghost" data-reject="${o.id}">Tolak</button>
              </div>
            </div>`;
        }).join('')}
      </section>
    ` : ''}

    <section class="section">
      <div class="section-head">
        <h3>🌿 Bibit di Sekitar ${state.user.city}</h3>
        <span class="link" data-go="explore">Lihat semua →</span>
      </div>
      ${recent.length ? `<div class="grid">${recent.map(plantCard).join('')}</div>` : emptyState('Belum ada listing di kotamu.')}
    </section>

    <section class="section">
      <div class="section-head"><h3>📅 Tugas Hari Ini</h3></div>
      ${todayTasks.length ? todayTasks.map(taskRow).join('') : emptyState('Tidak ada tugas. Tanamanmu bahagia 🌱')}
    </section>
  `;
}

/* ---------- VIEW: EXPLORE ---------- */
function viewExplore() {
  const f = state.filter;
  const list = state.listings.filter(l => {
    if (l.userId === state.user.id) return false;
    if (f.q && !(`${l.plant} ${l.desc}`.toLowerCase().includes(f.q.toLowerCase()))) return false;
    if (f.city && l.city !== f.city) return false;
    if (f.type && l.type !== f.type) return false;
    return true;
  });
  const cities = [...new Set(state.listings.map(l => l.city))];

  return `
    <section class="section">
      <h3 style="margin-bottom:12px">🔍 Jelajah Bibit</h3>
      <div class="card" style="margin-bottom:16px">
        <div class="form-group">
          <input id="fQ" placeholder="Cari bibit… (mis. cabai, tomat)" value="${f.q}">
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <div class="form-group" style="flex:1;min-width:140px;margin:0">
            <select id="fCity">
              <option value="">Semua kota</option>
              ${cities.map(c => `<option value="${c}" ${f.city===c?'selected':''}>${c}</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="flex:1;min-width:140px;margin:0">
            <select id="fType">
              <option value="">Semua jenis</option>
              <option ${f.type==='Bibit'?'selected':''}>Bibit</option>
              <option ${f.type==='Stek'?'selected':''}>Stek</option>
              <option ${f.type==='Anakan'?'selected':''}>Anakan</option>
            </select>
          </div>
        </div>
      </div>
      ${list.length ? `<div class="grid">${list.map(plantCard).join('')}</div>` : emptyState('Tidak ditemukan bibit yang cocok.')}
    </section>
  `;
}
function bindExplore() {
  const apply = () => {
    state.filter.q    = $('#fQ').value;
    state.filter.city = $('#fCity').value;
    state.filter.type = $('#fType').value;
    renderTab('explore');
  };
  $('#fQ').addEventListener('input', debounce(apply, 220));
  $('#fCity').addEventListener('change', apply);
  $('#fType').addEventListener('change', apply);

  $$('[data-offer]').forEach(btn => {
    btn.addEventListener('click', () => openOfferModal(btn.dataset.offer));
  });
}

/* ---------- PLANT CARD ---------- */
function plantCard(l) {
  const owner = userById(l.userId);
  const mine = l.userId === state.user.id;
  return `
    <article class="plant-card">
      <div class="plant-thumb">${l.emoji || '🌱'}</div>
      <div class="plant-body">
        <h4>${l.plant}</h4>
        <div class="owner">
          <span class="avatar" style="width:20px;height:20px;font-size:10px">${owner?.name?.charAt(0)||'?'}</span>
          ${owner?.name || '?'} · ${l.city}
        </div>
        <div class="plant-tags">
          <span class="tag accent">${l.type}</span>
          <span class="tag">${l.qty} pcs</span>
          ${owner?.rating >= 4.7 ? '<span class="tag gold">⭐ Terpercaya</span>' : ''}
        </div>
        <p style="font-size:12.5px;color:var(--text-muted);margin-bottom:10px">${l.desc}</p>
        ${mine
          ? `<button class="btn btn-ghost btn-block btn-sm" disabled>Milik saya</button>`
          : `<button class="btn btn-accent btn-block btn-sm" data-offer="${l.id}">Ajukan Tukar</button>`}
      </div>
    </article>
  `;
}

/* ---------- VIEW: ADD ---------- */
function viewAdd() {
  return `
    <section class="section">
      <h3 style="margin-bottom:6px">➕ Tambah Bibit</h3>
      <p style="color:var(--text-muted);font-size:13.5px;margin-bottom:16px">Bagikan bibitmu agar bisa ditukar dengan pekebun lain.</p>
      <form id="addForm" class="card">
        <div class="form-group">
          <label>Pilih ikon tanaman</label>
          <div class="emoji-picker" id="emojiPicker">
            ${EMOJI_PLANTS.map((e, i) => `<button type="button" data-emoji="${e}" class="${i===0?'selected':''}">${e}</button>`).join('')}
          </div>
        </div>
        <div class="form-group">
          <label>Nama tanaman</label>
          <input id="addPlant" placeholder="Mis. Cabai Rawit" required>
        </div>
        <div class="form-group" style="display:flex;gap:10px;flex-wrap:wrap">
          <div style="flex:1;min-width:120px">
            <label>Jenis</label>
            <select id="addType">
              <option>Bibit</option><option>Stek</option><option>Anakan</option>
            </select>
          </div>
          <div style="flex:1;min-width:120px">
            <label>Jumlah</label>
            <input id="addQty" type="number" min="1" value="1" required>
          </div>
        </div>
        <div class="form-group">
          <label>Deskripsi</label>
          <textarea id="addDesc" placeholder="Kondisi, umur, cara perawatan singkat…" required></textarea>
        </div>
        <div class="form-group">
          <label>Ingin ditukar dengan</label>
          <input id="addWants" placeholder="Mis. Basil / Mint / apa saja" required>
        </div>
        <div class="form-group">
          <label>Kota</label>
          <input id="addCity" value="${state.user.city}" required>
        </div>
        <button class="btn btn-primary btn-block" type="submit">Publikasikan Bibit</button>
      </form>
    </section>
  `;
}
function bindAdd() {
  let selectedEmoji = EMOJI_PLANTS[0];
  $$('#emojiPicker button').forEach(b => {
    b.addEventListener('click', () => {
      $$('#emojiPicker button').forEach(x => x.classList.remove('selected'));
      b.classList.add('selected');
      selectedEmoji = b.dataset.emoji;
    });
  });

  $('#addForm').addEventListener('submit', e => {
    e.preventDefault();
    const listing = {
      id: uid(),
      userId: state.user.id,
      plant: $('#addPlant').value.trim(),
      emoji: selectedEmoji,
      type: $('#addType').value,
      qty: +$('#addQty').value,
      desc: $('#addDesc').value.trim(),
      wants: $('#addWants').value.trim(),
      city: $('#addCity').value.trim(),
      createdAt: Date.now()
    };
    state.listings.unshift(listing);
    save(LS.listings, state.listings);
    addPoints(5);
    toast('Bibit berhasil dipublikasikan! +5 Poin Bibit 🪙');
    renderTab('home');
  });
}

/* ---------- VIEW: SWAPS ---------- */
function viewSwaps() {
  const myListings = state.listings.filter(l => l.userId === state.user.id);
  const myOffers   = state.offers.filter(o => o.fromUserId === state.user.id);
  const inbox      = state.offers.filter(o => o.toUserId === state.user.id);
  const activeChats = Object.keys(state.chats).filter(k => state.chats[k].length);

  return `
    <section class="section">
      <h3 style="margin-bottom:12px">🔄 Pusat Tukar</h3>

      <div class="section-head"><h4 style="font-size:15px">Listing saya</h4></div>
      ${myListings.length ? myListings.map(l => {
        const owner = state.user;
        return `
          <div class="list-row">
            <div class="thumb">${l.emoji}</div>
            <div class="info">
              <h4>${l.plant}</h4>
              <p>${l.type} · ${l.qty} pcs · ${fmtDate(l.createdAt)}</p>
            </div>
            <button class="btn btn-sm btn-ghost" data-del="${l.id}">Hapus</button>
          </div>`;
      }).join('') : emptyState('Belum ada listing.')}

      <div class="section-head" style="margin-top:22px"><h4 style="font-size:15px">Tawaran masuk</h4></div>
      ${inbox.length ? inbox.map(o => offerRow(o)).join('') : emptyState('Belum ada tawaran masuk.')}

      <div class="section-head" style="margin-top:22px"><h4 style="font-size:15px">Tawaran saya</h4></div>
      ${myOffers.length ? myOffers.map(o => myOfferRow(o)).join('') : emptyState('Kamu belum mengajukan tawaran.')}

      <div class="section-head" style="margin-top:22px"><h4 style="font-size:15px">💬 Chat</h4></div>
      ${activeChats.length ? activeChats.map(uidUser => {
        const u = userById(uidUser);
        const last = state.chats[uidUser].slice(-1)[0];
        return `
          <div class="list-row" data-chat="${uidUser}" style="cursor:pointer">
            <div class="thumb">${u?.name?.charAt(0) || '?'}</div>
            <div class="info">
              <h4>${u?.name || 'Pengguna'}</h4>
              <p>${last.text.slice(0, 50)}${last.text.length > 50 ? '…' : ''}</p>
            </div>
            <span class="tag">Chat</span>
          </div>`;
      }).join('') : emptyState('Belum ada percakapan.')}
    </section>
  `;
}
function offerRow(o) {
  const listing = state.listings.find(l => l.id === o.listingId) || {};
  const from = userById(o.fromUserId);
  const status = o.status === 'pending' ? '<span class="tag gold">Menunggu</span>'
               : o.status === 'accepted' ? '<span class="tag accent">Diterima</span>'
               : '<span class="tag">Ditolak</span>';
  return `
    <div class="list-row">
      <div class="thumb">${listing.emoji || '🌱'}</div>
      <div class="info">
        <h4>${from?.name} → ${listing.plant}</h4>
        <p>Menawarkan: <b>${o.offerPlant}</b> ${status}</p>
      </div>
      ${o.status === 'pending' ? `
        <div class="actions">
          <button class="btn btn-sm btn-accent" data-accept="${o.id}">✓</button>
          <button class="btn btn-sm btn-ghost" data-reject="${o.id}">✕</button>
        </div>` : ''}
    </div>`;
}
function myOfferRow(o) {
  const listing = state.listings.find(l => l.id === o.listingId) || {};
  const to = userById(o.toUserId);
  const status = o.status === 'pending' ? '<span class="tag gold">Menunggu</span>'
               : o.status === 'accepted' ? '<span class="tag accent">Diterima</span>'
               : '<span class="tag">Ditolak</span>';
  return `
    <div class="list-row">
      <div class="thumb">${listing.emoji || '🌱'}</div>
      <div class="info">
        <h4>Ke ${to?.name} · ${listing.plant}</h4>
        <p>Kamu menawarkan: <b>${o.offerPlant}</b> ${status}</p>
      </div>
    </div>`;
}

function bindSwaps() {
  $$('[data-del]').forEach(b => b.addEventListener('click', () => {
    if (!confirm('Hapus listing ini?')) return;
    state.listings = state.listings.filter(l => l.id !== b.dataset.del);
    save(LS.listings, state.listings);
    toast('Listing dihapus.');
    renderTab('swaps');
  }));

  $$('[data-accept]').forEach(b => b.addEventListener('click', () => acceptOffer(b.dataset.accept)));
  $$('[data-reject]').forEach(b => b.addEventListener('click', () => rejectOffer(b.dataset.reject)));
  $$('[data-chat]').forEach(el => el.addEventListener('click', () => openChat(el.dataset.chat)));
}

/* ---------- OFFER FLOW ---------- */
function openOfferModal(listingId) {
  const l = state.listings.find(x => x.id === listingId);
  if (!l) return;
  const owner = userById(l.userId);

  openModal(`
    <button class="modal-close" data-close>✕</button>
    <h3>Ajukan Tukar</h3>
    <p class="modal-sub">Dengan <b>${owner.name}</b> · ${l.plant}</p>
    <div class="list-row" style="margin-bottom:14px">
      <div class="thumb">${l.emoji}</div>
      <div class="info">
        <h4>${l.plant}</h4>
        <p>${l.type} · ${l.qty} pcs</p>
      </div>
    </div>
    <div class="form-group">
      <label>Kamu menawarkan apa?</label>
      <input id="offerPlant" placeholder="Mis. Basil 3 stek" required>
    </div>
    <div class="form-group">
      <label>Pesan (opsional)</label>
      <textarea id="offerMsg" placeholder="Halo, saya ingin tukar…"></textarea>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" data-close>Batal</button>
      <button class="btn btn-accent" id="submitOffer">Kirim Tawaran</button>
    </div>
  `, () => {
    $('#submitOffer').addEventListener('click', () => {
      const offerPlant = $('#offerPlant').value.trim();
      if (!offerPlant) { toast('Isi dulu apa yang kamu tawarkan.'); return; }
      const offer = {
        id: uid(),
        listingId,
        fromUserId: state.user.id,
        toUserId: l.userId,
        offerPlant,
        msg: $('#offerMsg').value.trim(),
        status: 'pending',
        createdAt: Date.now()
      };
      state.offers.unshift(offer);
      save(LS.offers, state.offers);

      // Siapkan chat room
      if (!state.chats[l.userId]) state.chats[l.userId] = [];
      state.chats[l.userId].push({
        id: uid(), from: 'me',
        text: `Hai! Saya ingin tukar ${l.plant} dengan ${offerPlant}. ${offer.msg || ''}`.trim(),
        ts: Date.now()
      });
      save(LS.chats, state.chats);

      closeModal();
      toast('Tawaran terkirim! 🌿');
      renderTab('swaps');
    });
  });
}

function acceptOffer(id) {
  const o = state.offers.find(x => x.id === id);
  if (!o) return;
  o.status = 'accepted';
  const listing = state.listings.find(l => l.id === o.listingId);
  if (listing) listing.status = 'swapped';

  state.swaps.push({
    id: uid(),
    offerId: o.id,
    withUser: o.fromUserId,
    plant: listing?.plant,
    emoji: listing?.emoji,
    date: Date.now()
  });

  // Kurangi stok
  if (listing && listing.qty > 0) listing.qty -= 1;

  // Kurangi jumlah swap pengguna (kita naikkan counter, bukan turun)
  state.user.swaps += 1;
  const idx = state.users.findIndex(u => u.id === state.user.id);
  if (idx > -1) state.users[idx].swaps = state.user.swaps;
  save(LS.user, state.user);
  save(LS.users, state.users);
  save(LS.offers, state.offers);
  save(LS.listings, state.listings);
  save(LS.swaps, state.swaps);

  addPoints(15);
  toast('Tukar disepakati! +15 Poin Bibit 🪙');
  renderTab('home');
}

function rejectOffer(id) {
  const o = state.offers.find(x => x.id === id);
  if (!o) return;
  o.status = 'rejected';
  save(LS.offers, state.offers);
  toast('Tawaran ditolak.');
  renderTab('swaps');
}

/* ---------- CHAT ---------- */
function openChat(uidUser) {
  const u = userById(uidUser);
  const msgs = state.chats[uidUser] || [];
  openModal(`
    <button class="modal-close" data-close>✕</button>
    <h3>Chat dengan ${u?.name || 'Pengguna'}</h3>
    <p class="modal-sub">${u?.city || ''}</p>
    <div class="chat-window" id="chatWin">
      ${msgs.map(m => `<div class="msg ${m.from==='me'?'me':'them'}">${m.text}</div>`).join('') || '<p style="color:var(--text-muted);text-align:center">Belum ada pesan.</p>'}
    </div>
    <div class="chat-input">
      <input id="chatInput" placeholder="Tulis pesan…" autocomplete="off">
      <button class="btn btn-accent" id="sendChat">Kirim</button>
    </div>
  `, () => {
    const win = $('#chatWin');
    win.scrollTop = win.scrollHeight;
    const send = () => {
      const val = $('#chatInput').value.trim();
      if (!val) return;
      state.chats[uidUser] = state.chats[uidUser] || [];
      state.chats[uidUser].push({ id: uid(), from: 'me', text: val, ts: Date.now() });
      save(LS.chats, state.chats);
      $('#chatInput').value = '';
      win.insertAdjacentHTML('beforeend', `<div class="msg me">${val}</div>`);
      win.scrollTop = win.scrollHeight;

      // Auto-reply ringan biar terasa hidup
      setTimeout(() => {
        const replies = ['Oke, siap! 👍', 'Boleh, kapan bisa ketemu?', 'Terima kasih! 🌱', 'Saya cek dulu ya.', 'Bisa kirim foto bibitnya?'];
        const reply = replies[Math.floor(Math.random() * replies.length)];
        state.chats[uidUser].push({ id: uid(), from: uidUser, text: reply, ts: Date.now() });
        save(LS.chats, state.chats);
        win.insertAdjacentHTML('beforeend', `<div class="msg them">${reply}</div>`);
        win.scrollTop = win.scrollHeight;
      }, 900);
    };
    $('#sendChat').addEventListener('click', send);
    $('#chatInput').addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
  });
}

/* ---------- VIEW: GUIDES ---------- */
function viewGuides() {
  return `
    <section class="section">
      <h3 style="margin-bottom:4px">📖 Panduan & Jadwal</h3>
      <p style="color:var(--text-muted);font-size:13.5px;margin-bottom:16px">Pelajari cara merawat tanaman dan kelola jadwal perawatan.</p>

      <div class="section-head"><h4 style="font-size:15px">🌿 Ensiklopedia Tanaman</h4></div>
      ${state.guides.map(g => `
        <div class="guide-card" data-guide="${g.id}">
          <div class="guide-emoji">${g.emoji}</div>
          <div class="guide-info">
            <h4>${g.name}</h4>
            <p>${g.difficulty} · Panen ${g.harvest}</p>
            <span class="tag">💡 ${g.light}</span>
          </div>
        </div>
      `).join('')}

      <div class="section-head" style="margin-top:22px">
        <h4 style="font-size:15px">📅 Jadwal Perawatan</h4>
        <button class="link" id="addTask">+ Tambah</button>
      </div>
      ${state.tasks.length ? state.tasks.map(taskRow).join('') : emptyState('Belum ada jadwal.')}
    </section>
  `;
}
function taskRow(t) {
  return `
    <div class="task ${t.done ? 'done' : ''}" data-task="${t.id}">
      <input type="checkbox" ${t.done ? 'checked' : ''} data-toggle="${t.id}">
      <div class="task-label">${t.emoji} <b>${t.plant}</b> — ${t.action}</div>
      <span class="task-date">${t.date}</span>
    </div>
  `;
}
function bindGuides() {
  $$('[data-guide]').forEach(el => el.addEventListener('click', () => openGuide(el.dataset.guide)));
  $$('[data-toggle]').forEach(cb => cb.addEventListener('change', () => {
    const t = state.tasks.find(x => x.id === cb.dataset.toggle);
    if (t) { t.done = cb.checked; save(LS.tasks, state.tasks); if (t.done) toast('Bagus! Tugas selesai 🌿'); }
    renderTab('guides');
  }));
  $('#addTask').addEventListener('click', () => openTaskModal());
}

function openGuide(id) {
  const g = state.guides.find(x => x.id === id);
  if (!g) return;
  openModal(`
    <button class="modal-close" data-close>✕</button>
    <div style="text-align:center;margin-bottom:14px">
      <div class="guide-emoji" style="margin:0 auto;width:80px;height:80px;font-size:44px">${g.emoji}</div>
      <h3 style="margin-top:10px">${g.name}</h3>
      <span class="tag accent">${g.difficulty}</span>
    </div>
    <div class="stat-grid" style="grid-template-columns:repeat(2,1fr)">
      <div class="stat-box"><b style="font-size:16px">${g.light.split('(')[0]}</b><span>Cahaya</span></div>
      <div class="stat-box"><b style="font-size:16px">${g.water}</b><span>Air</span></div>
      <div class="stat-box"><b style="font-size:16px">${g.soil}</b><span>Media</span></div>
      <div class="stat-box"><b style="font-size:16px">${g.harvest}</b><span>Panen</span></div>
    </div>
    <h4 style="margin:14px 0 8px">💡 Tips Perawatan</h4>
    <ul style="padding-left:20px;color:var(--text)">
      ${g.tips.map(t => `<li style="margin-bottom:6px">${t}</li>`).join('')}
    </ul>
    <div class="modal-footer">
      <button class="btn btn-primary btn-block" data-close>Tutup</button>
    </div>
  `);
}

function openTaskModal() {
  openModal(`
    <button class="modal-close" data-close>✕</button>
    <h3>Tambah Jadwal Perawatan</h3>
    <p class="modal-sub">Ingatkan saya untuk merawat tanaman.</p>
    <div class="form-group">
      <label>Tanaman</label>
      <input id="taskPlant" placeholder="Mis. Cabai Rawit" required>
    </div>
    <div class="form-group">
      <label>Ikon</label>
      <div class="emoji-picker" id="taskEmoji">
        ${EMOJI_PLANTS.slice(0, 8).map((e, i) => `<button type="button" data-emoji="${e}" class="${i===0?'selected':''}">${e}</button>`).join('')}
      </div>
    </div>
    <div class="form-group">
      <label>Kegiatan</label>
      <input id="taskAction" placeholder="Mis. Siram pagi" required>
    </div>
    <div class="form-group">
      <label>Kapan</label>
      <input id="taskDate" placeholder="Mis. Setiap hari / Sabtu" required>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" data-close>Batal</button>
      <button class="btn btn-accent" id="saveTask">Simpan</button>
    </div>
  `, () => {
    let emoji = EMOJI_PLANTS[0];
    $$('#taskEmoji button').forEach(b => b.addEventListener('click', () => {
      $$('#taskEmoji button').forEach(x => x.classList.remove('selected'));
      b.classList.add('selected'); emoji = b.dataset.emoji;
    }));
    $('#saveTask').addEventListener('click', () => {
      const plant = $('#taskPlant').value.trim();
      const action = $('#taskAction').value.trim();
      const date = $('#taskDate').value.trim();
      if (!plant || !action || !date) { toast('Lengkapi semua kolom.'); return; }
      state.tasks.unshift({ id: uid(), plant, emoji, action, date, done: false });
      save(LS.tasks, state.tasks);
      closeModal();
      toast('Jadwal ditambahkan 🌱');
      renderTab('guides');
    });
  });
}

/* ---------- VIEW: PROFILE ---------- */
function viewProfile() {
  const u = state.user;
  const myListings = state.listings.filter(l => l.userId === u.id);
  const mySwaps = state.swaps.filter(s => s.withUser !== u.id); // semua swap user
  const avgRating = u.rating.toFixed(1);

  return `
    <section class="profile-head">
      <div class="profile-avatar">${u.name.charAt(0).toUpperCase()}</div>
      <div>
        <h3>${u.name}</h3>
        <div class="meta">📍 ${u.city} · 🪴 ${u.land}</div>
        <div class="badges">
          ${(u.badges || []).map(b => `<span class="badge ${b==='Pakar'||b==='Kontributor'?'gold':'green'}">${b}</span>`).join('')}
        </div>
      </div>
    </section>

    <div class="stat-grid">
      <div class="stat-box"><b>${avgRating}</b><span>⭐ Rating</span></div>
      <div class="stat-box"><b>${u.swaps}</b><span>Swap sukses</span></div>
      <div class="stat-box"><b>${u.points}</b><span>🪙 Poin Bibit</span></div>
      <div class="stat-box"><b>${myListings.length}</b><span>Listing aktif</span></div>
    </div>

    <section class="section">
      <div class="section-head"><h3 style="font-size:16px">🪙 Poin Bibit</h3></div>
      <div class="card">
        <p style="font-size:13.5px;color:var(--text-muted);margin-bottom:10px">
          Poin didapat dari swap sukses, ulasan positif, dan kontribusi. Tukar poin dengan bibit langka dari komunitas.
        </p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-sm btn-ghost" data-redeem="50">Tukar 50 · Pot kecil</button>
          <button class="btn btn-sm btn-ghost" data-redeem="100">Tukar 100 · Bibit langka</button>
          <button class="btn btn-sm btn-ghost" data-redeem="200">Tukar 200 · Paket kompos</button>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-head"><h3 style="font-size:16px">⭐ Ulasan</h3></div>
      ${state.reviews.length ? state.reviews.map(r => `
        <div class="list-row">
          <div class="thumb">${r.emoji || '🌱'}</div>
          <div class="info">
            <h4>${r.from} · ${'⭐'.repeat(r.rating)}</h4>
            <p>${r.text}</p>
          </div>
        </div>
      `).join('') : emptyState('Belum ada ulasan. Selesaikan swap untuk mendapat ulasan.')}
    </section>

    <section class="section">
      <div class="section-head"><h3 style="font-size:16px">⚙️ Pengaturan</h3></div>
      <button class="btn btn-ghost btn-block" id="btnLogout" style="justify-content:flex-start">🚪 Keluar Akun</button>
    </section>
  `;
}
function bindProfile() {
  $('#btnLogout').addEventListener('click', logout);
  $$('[data-redeem]').forEach(b => b.addEventListener('click', () => {
    const cost = +b.dataset.redeem;
    if (state.user.points < cost) { toast('Poin tidak cukup.'); return; }
    addPoints(-cost);
    toast(`Berhasil menukar ${cost} poin! 🎁`);
  }));
}

/* ---------- MODAL ---------- */
function openModal(html, onMount) {
  const root = $('#modalRoot');
  const body = $('#modalBody');
  body.innerHTML = html;
  root.classList.remove('hidden');
  $$('[data-close]', body).forEach(el => el.addEventListener('click', closeModal));
  if (onMount) onMount();
}
function closeModal() { $('#modalRoot').classList.add('hidden'); $('#modalBody').innerHTML = ''; }

/* ---------- UTIL ---------- */
function emptyState(msg) {
  return `<div class="empty"><div class="icon">🌾</div><p>${msg}</p></div>`;
}
function debounce(fn, ms) {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

/* ---------- GLOBAL EVENT BINDING ---------- */
document.addEventListener('click', e => {
  // Nav
  const nav = e.target.closest('.nav-btn');
  if (nav) { renderTab(nav.dataset.tab); return; }

  // Go shortcut
  const go = e.target.closest('[data-go]');
  if (go) { renderTab(go.dataset.go); return; }

  // Accept/Reject di home
  const acc = e.target.closest('[data-accept]');
  if (acc) { acceptOffer(acc.dataset.accept); return; }
  const rej = e.target.closest('[data-reject]');
  if (rej) { rejectOffer(rej.dataset.reject); return; }

  // Offer (di view Explore — fallback)
  const off = e.target.closest('[data-offer]');
  if (off) { openOfferModal(off.dataset.offer); return; }

  // Profile shortcut
  if (e.target.closest('#btnProfile')) { renderTab('profile'); return; }

  // Points shortcut
  if (e.target.closest('#btnPoints')) {
    openModal(`
      <button class="modal-close" data-close>✕</button>
      <h3>🪙 Poin Bibit</h3>
      <p class="modal-sub">Kamu punya <b>${state.user.points} Poin Bibit</b></p>
      <p style="font-size:13.5px;color:var(--text-muted)">
        Poin didapat dari swap sukses (+15), menambahkan listing (+5), dan kontribusi komunitas.
        Poin tidak bisa dibeli dengan uang — ini untuk menjaga semangat barter.
      </p>
      <div class="modal-footer">
        <button class="btn btn-primary btn-block" data-close>Mengerti</button>
      </div>
    `);
    return;
  }
});

/* ---------- INIT ---------- */
document.addEventListener('DOMContentLoaded', () => {
  // Auth tab switch
  $$('.auth-tab').forEach(tab => tab.addEventListener('click', () => {
    $$('.auth-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const mode = tab.dataset.auth;
    $('#loginForm').classList.toggle('hidden', mode !== 'login');
    $('#registerForm').classList.toggle('hidden', mode !== 'register');
  }));

  $('#loginForm').addEventListener('submit', handleLogin);
  $('#registerForm').addEventListener('submit', handleRegister);

  bootstrap();
});