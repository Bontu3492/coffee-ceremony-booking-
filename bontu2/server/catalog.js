'use strict';
// Single source of truth for packages and add-ons. Served to the browser via /api/catalog
// and used by the server to compute prices (the browser is never trusted for money).

const items = {
  coffee:  { en: 'Fresh-roasted coffee, three rounds', am: 'ሦስት ዙር ትኩስ ቡና' },
  incense: { en: 'Frankincense (itan)', am: 'እጣን', price: 150 },
  music:   { en: 'Traditional music', am: 'ባህላዊ ሙዚቃ', price: 1500 },
  popcorn: { en: 'Popcorn (fendisha)', am: 'ፈንዲሻ', price: 250 },
  ketema:  { en: 'Fresh grass floor (ketema)', am: 'ቀጤማ', price: 200 },
  decor:   { en: 'Ceremony decorations', am: 'ማስጌጫ', price: 1800 },
  qalaa:   { en: 'Buna Qalaa (coffee cooked in butter)', am: 'ቡና ቃላ', price: 600 },
  snacks:  { en: 'Snacks (kolo, dabo)', am: 'ቆሎና ዳቦ', price: 500 },
};

const packages = [
  {
    id: 'basic', hours: 1, people: 2, price: 1499,
    name: { en: 'Basic', am: 'መሠረታዊ' },
    tagline: { en: 'A small, quiet ceremony for two.', am: 'ለሁለት ሰዎች ትንሽ ሥነ ሥርዓት።' },
    includes: ['coffee', 'incense'],
  },
  {
    id: 'premium', hours: 2, people: 3, price: 2499, popular: true,
    name: { en: 'Premium', am: 'ፕሪሚየም' },
    tagline: { en: 'Music, popcorn and a floor of fresh grass.', am: 'ሙዚቃ፣ ፈንዲሻና ቀጤማ።' },
    includes: ['coffee', 'music', 'popcorn', 'ketema'],
  },
  {
    id: 'wedding', hours: 3, people: 8, price: 3999,
    name: { en: 'Wedding special', am: 'የሠርግ ልዩ' },
    tagline: { en: 'Decorated setting, snacks and three full hours.', am: 'ያጌጠ ቦታ፣ ቁርስና ሦስት ሰዓት።' },
    includes: ['coffee', 'decor', 'snacks'],
  },
];

const addons = [
  ...['qalaa', 'incense', 'ketema', 'popcorn', 'snacks', 'music', 'decor'].map(id => ({ id, price: items[id].price, name: items[id] })),
  { id: 'attire', price: 400, name: { en: 'Host in traditional dress (habesha kemis)', am: 'አስተናጋጅ በባህላዊ ልብስ' } },
];

const extraHourPrice = 600;
const maxExtraHours = 3;

const eventTypes = [
  { id: 'wedding', en: 'Wedding or engagement', am: 'ሠርግ ወይም ተሞሽሮ' },
  { id: 'birthday', en: 'Birthday', am: 'የልደት በዓል' },
  { id: 'shimgilina', en: 'Shimigilina / Jaarsumma', am: 'ሽምግልና / ጃርሱማ' },
  { id: 'government', en: 'Government program', am: 'የመንግሥት ፕሮግራም' },
  { id: 'campus', en: 'Campus or community gathering', am: 'የትምህርት ቤት ወይም የማኅበረሰብ ስብሰባ' },
  { id: 'other', en: 'Something else', am: 'ሌላ' },
];

const areas = [
  'Bole', 'Yeka', 'Kirkos', 'Arada', 'Lideta', 'Addis Ketema', 'Kolfe Keranio',
  'Nifas Silk-Lafto', 'Akaky Kaliti', 'Gullele',
].map(n => ({ id: n.toLowerCase().replace(/[^a-z]+/g, '-'), en: n, am: n }));
areas.push({ id: 'outside', en: 'Outside Addis Ababa', am: 'ከአዲስ አበባ ውጭ' });

module.exports = { items, packages, addons, extraHourPrice, maxExtraHours, eventTypes, areas };
