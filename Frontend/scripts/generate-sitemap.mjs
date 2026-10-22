// Writes public/sitemap.xml before each build: static pages + live tours, treks, blogs and history.
// If the API is unreachable the static pages are still written, so the build never fails on this.
import { writeFileSync } from 'node:fs';

const SITE = 'https://www.aarohanholidays.com';
const API = 'https://aarohan-holidays.vercel.app/api';

const staticPages = [
  ['/', 'weekly', '1.0'],
  ['/tours', 'daily', '0.9'],
  ['/treks', 'daily', '0.9'],
  ['/blogs', 'weekly', '0.6'],
  ['/history', 'monthly', '0.5'],
  ['/about', 'monthly', '0.5'],
  ['/other-services', 'monthly', '0.6'],
  ['/contact', 'monthly', '0.5'],
  ['/cancellation-policy', 'yearly', '0.3'],
  ['/privacy', 'yearly', '0.2'],
  ['/terms', 'yearly', '0.2'],
];

const load = async (path) => {
  try {
    const res = await fetch(`${API}${path}`, { signal: AbortSignal.timeout(15000) });
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (err) {
    console.warn(`sitemap: could not load ${path} (${err.message})`);
    return [];
  }
};

const [tours, treks, blogs, history] = await Promise.all([
  load('/tours?limit=1000'),
  load('/treks?limit=1000'),
  load('/blogs?limit=1000'),
  load('/history?limit=1000'),
]);

const urls = [
  ...staticPages.map(([loc, freq, pri]) => ({ loc, freq, pri })),
  ...tours.map((t) => ({ loc: `/tour/${t._id}`, freq: 'weekly', pri: '0.8', mod: t.updatedAt })),
  ...treks.map((t) => ({ loc: `/trek/${t._id}`, freq: 'weekly', pri: '0.8', mod: t.updatedAt })),
  ...blogs.map((b) => ({ loc: `/blogs/${b.slug || b._id}`, freq: 'monthly', pri: '0.5', mod: b.updatedAt })),
  ...history.map((h) => ({ loc: `/history/${h.slug || h._id}`, freq: 'monthly', pri: '0.4', mod: h.updatedAt })),
];

const entry = (u) =>
  `  <url><loc>${SITE}${u.loc === '/' ? '' : u.loc}</loc>` +
  `${u.mod ? `<lastmod>${new Date(u.mod).toISOString().slice(0, 10)}</lastmod>` : ''}` +
  `<changefreq>${u.freq}</changefreq><priority>${u.pri}</priority></url>`;

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(entry).join('\n')}
</urlset>
`;

writeFileSync(new URL('../public/sitemap.xml', import.meta.url), xml);
console.log(`sitemap: wrote ${urls.length} urls`);
