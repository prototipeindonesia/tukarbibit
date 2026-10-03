/* =========================================================
   TukarBibit — Seed Data
   ========================================================= */

const EMOJI_PLANTS = ['🌱','🌿','🌶️','🍅','🌻','🪴','🌵','🍃','🌸','🌳','🥬','🍓','🌽','🧄','🍋'];

const SEED_USERS = [
  { id: 'u1', name: 'Rina',     city: 'Jakarta',   land: 'Pot / Balkon',      points: 120, rating: 4.9, swaps: 12, badges: ['Ramah','Cepat','Bibit Sehat'] },
  { id: 'u2', name: 'Pak Budi', city: 'Bandung',   land: 'Kebun Komunitas',   points: 340, rating: 4.8, swaps: 41, badges: ['Pakar','Kontributor','Bibit Sehat'] },
  { id: 'u3', name: 'Sari',     city: 'Yogyakarta',land: 'Rooftop',           points: 60,  rating: 4.6, swaps: 5,  badges: ['Ramah'] },
  { id: 'u4', name: 'Dimas',    city: 'Jakarta',   land: 'Halaman',           points: 210, rating: 4.7, swaps: 23, badges: ['Cepat','Kontributor'] },
  { id: 'u5', name: 'Maya',     city: 'Surabaya',  land: 'Pot / Balkon',      points: 85,  rating: 4.5, swaps: 7,  badges: ['Ramah','Cepat'] }
];

const SEED_LISTINGS = [
  { id: 'l1', userId: 'u2', plant: 'Tomat Cherry',   emoji: '🍅', type: 'Bibit', qty: 6,  desc: 'Bibit tomat cherry sehat, umur 3 minggu. Cocok untuk pot besar.',   wants: 'Cabai / Seledri',   city: 'Bandung',    createdAt: Date.now() - 86400000 * 2 },
  { id: 'l2', userId: 'u4', plant: 'Cabai Rawit',    emoji: '🌶️', type: 'Bibit', qty: 10, desc: 'Cabai rawit merah lokal, tahan panas, cocok dataran rendah.',       wants: 'Basil / Mint',      city: 'Jakarta',    createdAt: Date.now() - 86400000 * 1 },
  { id: 'l3', userId: 'u1', plant: 'Basil',          emoji: '🌿', type: 'Stek',  qty: 5,  desc: 'Stek basil sudah berakar, siap tanam di pot.',                       wants: 'Cabai Rawit',       city: 'Jakarta',    createdAt: Date.now() - 3600000 * 5 },
  { id: 'l4', userId: 'u5', plant: 'Mint',           emoji: '🍃', type: 'Anakan',qty: 8,  desc: 'Mint segar, cepat tumbuh, butuh sinar pagi saja.',                   wants: 'Tomat / Basil',     city: 'Surabaya',   createdAt: Date.now() - 3600000 * 12 },
  { id: 'l5', userId: 'u3', plant: 'Lidah Buaya',    emoji: '🌵', type: 'Anakan',qty: 4,  desc: 'Anakan lidah buaya, mudah dirawat, cocok pemula.',                   wants: 'Apa saja',          city: 'Yogyakarta', createdAt: Date.now() - 3600000 * 20 },
  { id: 'l6', userId: 'u2', plant: 'Seledri',        emoji: '🥬', type: 'Bibit', qty: 12, desc: 'Bibit seledri umur 4 minggu, siap pindah tanam.',                    wants: 'Tomat Cherry',      city: 'Bandung',    createdAt: Date.now() - 86400000 * 3 }
];

const SEED_GUIDES = [
  {
    id: 'g1', name: 'Cabai Rawit', emoji: '🌶️',
    difficulty: 'Mudah',
    light: 'Matahari penuh (6+ jam)',
    water: '2x sehari, pagi & sore',
    soil: 'Gembur, drainase baik, pH 6–7',
    harvest: '80–90 hari',
    tips: [
      'Semai di tempat hangat, jangan kena hujan langsung.',
      'Pindah tanam setelah 4 daun sejati.',
      'Pangkas tunas air agar buah maksimal.',
      'Waspada thrips dan kutu kebul — gunakan sabun insektisida.'
    ]
  },
  {
    id: 'g2', name: 'Tomat Cherry', emoji: '🍅',
    difficulty: 'Sedang',
    light: 'Matahari penuh (7+ jam)',
    water: 'Rutin, hindari tanah terlalu basah',
    soil: 'Kompos kaya, drainase baik',
    harvest: '70–85 hari',
    tips: [
      'Butuh ajir/turus sejak awal.',
      'Buang tunas ketiak untuk pertumbuhan fokus.',
      'Pupuk kalium saat mulai berbuah.'
    ]
  },
  {
    id: 'g3', name: 'Basil', emoji: '🌿',
    difficulty: 'Mudah',
    light: '4–6 jam sinar',
    water: 'Setiap hari, tanah lembap',
    soil: 'Pot dengan kompos + sekam',
    harvest: '30–45 hari',
    tips: [
      'Petik pucuk agar bercabang.',
      'Jangan biarkan berbunga bila ingin daun banyak.',
      'Cocok di balkon & jendela dapur.'
    ]
  },
  {
    id: 'g4', name: 'Mint', emoji: '🍃',
    difficulty: 'Mudah',
    light: 'Sinar pagi, teduh siang',
    water: 'Lembap, siram tiap hari',
    soil: 'Tanah gembur, pot terpisah',
    harvest: '25–35 hari',
    tips: [
      'Mint menyebar cepat — tanam di pot sendiri.',
      'Pangkas rutin agar tidak kering.',
      'Daun dipanen saat muda untuk aroma terbaik.'
    ]
  },
  {
    id: 'g5', name: 'Lidah Buaya', emoji: '🌵',
    difficulty: 'Sangat Mudah',
    light: 'Terang tidak langsung',
    water: '1x seminggu, jangan berlebih',
    soil: 'Berpasir, drainase cepat',
    harvest: '6+ bulan (daun)',
    tips: [
      'Jangan disiram berlebih — akar mudah busuk.',
      'Cocok untuk pemula dan sibuk.',
      'Pisahkan anakan bila pot terlalu penuh.'
    ]
  },
  {
    id: 'g6', name: 'Seledri', emoji: '🥬',
    difficulty: 'Sedang',
    light: 'Sinar pagi, teduh siang',
    water: 'Rutin, jaga kelembapan',
    soil: 'Kompos + pasir halus',
    harvest: '90–120 hari',
    tips: [
      'Semai di permukaan tanah, jangan dikubur dalam.',
      'Butuh kesabaran — pertumbuhan lambat.',
      'Panen batang luar dulu agar terus tumbuh.'
    ]
  }
];

/* Default tasks untuk pengguna baru */
const SEED_TASKS = [
  { id: 't1', plant: 'Cabai Rawit', emoji: '🌶️', action: 'Siram pagi',  date: 'Setiap hari', done: false },
  { id: 't2', plant: 'Basil',       emoji: '🌿', action: 'Pangkas pucuk',date: 'Sabtu',       done: false },
  { id: 't3', plant: 'Tomat Cherry',emoji: '🍅', action: 'Pupuk kalium', date: 'Minggu',      done: false }
];

/* Seed chat antar user (contoh) */
const SEED_CHATS = {
  'u2': [
    { id: 'c1', from: 'u2', text: 'Halo! Saya lihat kamu punya Basil. Saya punya bibit Tomat Cherry, mau tukar?', ts: Date.now() - 3600000 },
    { id: 'c2', from: 'me', text: 'Wah boleh! Berapa banyak basil yang kamu butuh?', ts: Date.now() - 3500000 }
  ]
};