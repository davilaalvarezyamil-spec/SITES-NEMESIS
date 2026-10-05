// Usage: node build.js [client.json]  ->  writes index.html next to this file.
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const c = JSON.parse(fs.readFileSync(path.resolve(process.argv[2] || path.join(dir, 'client.json')), 'utf8'));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const svg = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICONS = {
  phone: svg('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>'),
  shield: svg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>'),
  tag: svg('<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><circle cx="7" cy="7" r="1.5"/>'),
  check: svg('<path d="M20 6 9 17l-5-5"/>'),
  drop: svg('<path d="M12 2.7s-6 6.6-6 11.3a6 6 0 0 0 12 0c0-4.7-6-11.3-6-11.3z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5"/>'),
  drain: svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v6M12 15v6M3 12h6M15 12h6"/>'),
  heater: svg('<rect x="6" y="2" width="12" height="18" rx="3"/><path d="M9 22h6M12 7v4"/><circle cx="12" cy="14" r="2"/>'),
  pipe: svg('<path d="M3 7h8a4 4 0 0 1 4 4v10"/><path d="M3 11h6a2 2 0 0 1 2 2v8"/><path d="M3 5v8M9 21h8"/>'),
  sewer: svg('<path d="M2 12h20M2 17h20"/><path d="M6 12V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5"/><path d="M10 9h4"/>'),
  alarm: svg('<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>'),
  bolt: svg('<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>'),
  fan: svg('<circle cx="12" cy="12" r="2"/><path d="M12 10c0-4 1-7 4-7s2 5-2 7M14 12c4 0 7 1 7 4s-5 2-7-2M12 14c0 4-1 7-4 7s-2-5 2-7M10 12c-4 0-7-1-7-4s5-2 7 2"/>'),
  home: svg('<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>')
};

const words = c.heroHeadline.trim().split(' ');
const cut = Math.max(1, words.length - 3);
const heroHeadlineHtml = esc(words.slice(0, cut).join(' ')) + ' <em>' + esc(words.slice(cut).join(' ')) + '</em>';

const blocks = {
  SERVICES: c.services.map(s => `<article class="svc"><div class="ico">${ICONS[s.icon] || ICONS.home}</div><h3>${esc(s.name)}</h3><p>${esc(s.text)}</p><a href="#quote" data-quote>Get a quote &rarr;</a></article>`).join(''),
  AREAS: c.areas.map(a => `<span>${esc(a)}</span>`).join(''),
  REVIEWS: c.reviews.map(r => `<blockquote class="rev" style="margin:0"><span class="stars" aria-label="5 stars">★★★★★</span><p>“${esc(r.text)}”</p><footer>${esc(r.name)} <span>· ${esc(r.town)}</span></footer></blockquote>`).join(''),
  WHY_POINTS: c.copy.whyPoints.map(p => `<div class="pt"><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div>`).join(''),
  STEPS: c.copy.steps.map(p => `<div class="step"><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div>`).join(''),
  FAQS: c.faqs.map(f => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join(''),
  JSONLD: JSON.stringify({
    '@context': 'https://schema.org', '@type': c.schemaType || 'Plumber',
    name: c.businessName, telephone: c.phone, email: c.email, address: c.address,
    areaServed: c.areas, aggregateRating: { '@type': 'AggregateRating', ratingValue: c.rating, reviewCount: c.reviewCount }
  }).replace(/</g, '\\u003c'),
  heroHeadlineHtml,
  phoneDigits: '+1' + c.phone.replace(/\D/g, '').replace(/^1/, ''),
  tradeLower: c.tradeTitle.toLowerCase() === 'plumbing' ? 'plumber' : c.tradeTitle.toLowerCase() + ' pro'
};
Object.keys(ICONS).forEach(k => { blocks['ICON_' + k] = ICONS[k]; });

const get = key => key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), c);
let html = fs.readFileSync(path.join(dir, 'template.html'), 'utf8').replace(/\{\{([\w.]+)\}\}/g, (m, key) => {
  if (key in blocks) return blocks[key];
  const v = get(key);
  if (v === undefined) { console.warn('Missing value for {{' + key + '}}'); return ''; }
  return esc(v);
});

fs.writeFileSync(path.join(dir, 'index.html'), html);
console.log('Wrote index.html for ' + c.businessName);
