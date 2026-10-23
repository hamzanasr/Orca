#!/usr/bin/env node
// Builds the ORCA Arabic blog into ../Orca/blog from articles/*.json.
//   node blog-src/build.mjs                 validate everything, then write pages, sitemap, llms.txt, feed
//   node blog-src/build.mjs --check a.json  validate the given article files only (used while writing)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const SRC = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.resolve(SRC, '..', 'Orca');
const OUT = path.join(SITE, 'blog');
const URL_BASE = 'https://bookorca.com';
const TODAY = '2026-10-23';
const WA_NUM = '966568390147';

const readJSON = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const { categories: CATS, topics: TOPICS } = readJSON(path.join(SRC, 'topics.json'));
const FLEET = readJSON(path.join(SRC, 'fleet.json'));
const PRICES = readJSON(path.join(SRC, 'prices.json'));
const TOPIC = Object.fromEntries(TOPICS.map((t) => [t.slug, t]));

// ---------------------------------------------------------------- helpers
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const imgUrl = (p) => '/' + p.split('/').map(encodeURIComponent).join('/');
const absImg = (p) => URL_BASE + imgUrl(p);
const plain = (s) => String(s ?? '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
const words = (s) => plain(s).split(/\s+/).filter(Boolean).length;
const waLink = (msg) => `https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`;
const arDate = (iso) => {
  const m = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const [y, mo, d] = iso.split('-').map(Number);
  return `${d} ${m[mo - 1]} ${y}`;
};

// Inline markup: **bold** and [label](url). Everything else is escaped.
function md(text, ctx) {
  let out = esc(text);
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => {
    const u = url.replace(/&amp;/g, '&');
    if (ctx) ctx.links.push(u);
    const ext = /^https?:\/\//.test(u);
    return `<a href="${esc(u)}"${ext ? ' target="_blank" rel="noopener"' : ''}>${label}</a>`;
  });
  return out;
}

// WebP / JPEG / PNG dimensions without dependencies
const dimCache = {};
function dims(rel) {
  if (dimCache[rel]) return dimCache[rel];
  const b = fs.readFileSync(path.join(SITE, rel));
  let w = 1200, h = 800;
  if (b.toString('ascii', 0, 4) === 'RIFF') {
    const kind = b.toString('ascii', 12, 16);
    if (kind === 'VP8X') { w = 1 + b.readUIntLE(24, 3); h = 1 + b.readUIntLE(27, 3); }
    else if (kind === 'VP8 ') { w = b.readUInt16LE(26) & 0x3fff; h = b.readUInt16LE(28) & 0x3fff; }
    else if (kind === 'VP8L') { const n = b.readUInt32LE(21); w = 1 + (n & 0x3fff); h = 1 + ((n >> 14) & 0x3fff); }
  } else if (b[0] === 0x89) { w = b.readUInt32BE(16); h = b.readUInt32BE(20); }
  else if (b[0] === 0xff) {
    let i = 2;
    while (i < b.length) { const m = b[i + 1], len = b.readUInt16BE(i + 2); if (m >= 0xc0 && m <= 0xc3) { h = b.readUInt16BE(i + 5); w = b.readUInt16BE(i + 7); break; } i += 2 + len; }
  }
  return (dimCache[rel] = { w, h });
}
const img = (rel, alt, attrs = '') => { const d = dims(rel); return `<img src="${imgUrl(rel)}" alt="${esc(alt)}" width="${d.w}" height="${d.h}" ${attrs}>`; };

const ICON = {
  wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5.3-.5c.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4C2.7 15.6 2.2 13.8 2.2 12 2.2 6.6 6.6 2.2 12 2.2S21.8 6.6 21.8 12 17.4 21.8 12 21.8zM12 0C5.4 0 0 5.4 0 12c0 2.1.6 4.2 1.6 6L0 24l6.2-1.6c1.8 1 3.8 1.5 5.8 1.5 6.6 0 12-5.4 12-12S18.6 0 12 0z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
  up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
  calc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h8"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="m8 12 3 3 5-6"/></svg>',
  quiz: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5h.01"/></svg>',
  pick: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 3v6M12 9l-6 6M12 9l6 6M6 15v4M18 15v4"/></svg>',
  tip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/></svg>',
  warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 3 2 20h20L12 3zM12 10v4M12 17h.01"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
  fact: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 2l2.9 6.9L22 9.3l-5.5 4.7L18.2 21 12 17.3 5.8 21l1.7-7L2 9.3l7.1-.4z"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
};

// ---------------------------------------------------------------- validation
const BLOCKS = ['p', 'h3', 'ul', 'ol', 'callout', 'table', 'steps', 'checklist', 'quiz', 'picker', 'calc', 'compare', 'timeline', 'stats', 'boats', 'quote', 'reveal', 'cta'];
const INTERACTIVE = ['checklist', 'quiz', 'picker', 'calc'];
const KNOWN_PRICES = new Set([...[...fs.readFileSync(path.join(SRC, 'BOAT-PAGES.md'), 'utf8').matchAll(/(\d{1,2},\d{3}|\d{3,5})/g)].map((m) => +m[1].replace(',', '')), 200, 250, 300, 320, 350, 400, 450, 480, 500, 580, 600, 680, 700, 980, 1200, 1300, 1400, 1500, 1600, 1800, 1880, 1980, 2000, 2100, 2180, 2200, 2280, 2300, 2380, 2500, 3000, 3100, 3400, 3680, 4380, 5500, 6980, 7480, 16500, 30000]);

function validate(a, file) {
  const E = [], W = [];
  const ctx = { links: [] };
  const base = path.basename(file, '.json');
  const t = TOPIC[a.slug];
  if (a.slug !== base) E.push(`slug "${a.slug}" must equal file name "${base}"`);
  if (!t) E.push(`slug "${a.slug}" is not in topics.json`);
  else if (t.cat !== a.cat) E.push(`cat must be "${t.cat}"`);
  if (!CATS[a.cat]) E.push(`unknown cat "${a.cat}"`);
  for (const k of ['title', 'seoTitle', 'description', 'summary']) if (!a[k] || typeof a[k] !== 'string') E.push(`missing ${k}`);
  if (a.seoTitle && a.seoTitle.length > 65) E.push(`seoTitle is ${a.seoTitle.length} chars (max 65 incl. " | أوركا")`);
  if (a.seoTitle && !a.seoTitle.endsWith('| أوركا')) E.push('seoTitle must end with "| أوركا"');
  if (a.description && (a.description.length < 110 || a.description.length > 165)) E.push(`description is ${a.description.length} chars (needs 110-165)`);
  const sw = words(a.summary || '');
  if (sw < 25 || sw > 90) E.push(`summary is ${sw} words (needs 25-90)`);
  if (!Array.isArray(a.kw) || a.kw.length < 3) E.push('kw needs 3+ keywords');
  if (!Array.isArray(a.takeaways) || a.takeaways.length < 3 || a.takeaways.length > 6) E.push('takeaways needs 3-6 items');
  if (!Array.isArray(a.faq) || a.faq.length < 4 || a.faq.length > 10) E.push('faq needs 4-10 items');
  (a.faq || []).forEach((f, i) => { if (!f.q || !f.a) E.push(`faq[${i}] needs q and a`); else if (words(f.a) < 18) W.push(`faq[${i}] answer is short (${words(f.a)} words)`); md(f.a, ctx); });
  if (!Array.isArray(a.sections) || a.sections.length < 4 || a.sections.length > 12) E.push('sections needs 4-12 items');
  if (a.image && !fs.existsSync(path.join(SITE, a.image))) E.push(`image not found: ${a.image}`);
  (a.boats || []).forEach((b) => { if (!FLEET[b]) E.push(`boats: unknown boat slug "${b}"`); });
  (a.related || []).forEach((r) => { if (!TOPIC[r]) E.push(`related: unknown article slug "${r}"`); if (r === a.slug) E.push('related contains itself'); });
  if (!a.related || a.related.length < 3) E.push('related needs 3-6 article slugs');

  let wc = sw + (a.takeaways || []).reduce((n, x) => n + words(x), 0) + (a.faq || []).reduce((n, f) => n + words(f.q) + words(f.a), 0);
  const ids = new Set();
  let interactive = 0;
  const allText = [];
  for (const [si, s] of (a.sections || []).entries()) {
    if (!/^[a-z0-9-]+$/.test(s.id || '')) E.push(`sections[${si}].id must be lowercase latin/digits/hyphens`);
    if (ids.has(s.id)) E.push(`duplicate section id "${s.id}"`);
    ids.add(s.id);
    if (!s.h2) E.push(`sections[${si}] missing h2`);
    wc += words(s.h2);
    if (!Array.isArray(s.blocks) || !s.blocks.length) { E.push(`sections[${si}] has no blocks`); continue; }
    if (s.blocks[0].t !== 'p') W.push(`sections[${si}] should open with a "p" that answers the heading directly`);
    for (const [bi, b] of s.blocks.entries()) {
      const where = `sections[${si}].blocks[${bi}] (${b.t})`;
      if (!BLOCKS.includes(b.t)) { E.push(`${where}: unknown block type`); continue; }
      if (INTERACTIVE.includes(b.t)) interactive++;
      const texts = blockTexts(b);
      texts.forEach((x) => { if (typeof x !== 'string') E.push(`${where}: expected text, got ${typeof x}`); else { wc += words(x); md(x, ctx); allText.push(x); } });
      checkBlock(b, where, E);
    }
  }
  if (interactive < 2) E.push(`needs at least 2 interactive blocks (checklist/quiz/picker/calc), found ${interactive}`);
  if (wc < 1100) E.push(`article is ${wc} words (min 1100)`);
  else if (wc < 1400) W.push(`article is ${wc} words (aim for 1500+)`);

  let internal = 0;
  for (const u of ctx.links) {
    let m;
    if ((m = u.match(/^\/blog\/([a-z0-9-]+)$/))) { if (!TOPIC[m[1]]) E.push(`link to unknown article ${u}`); else if (m[1] === a.slug) E.push('links to itself'); else internal++; }
    else if ((m = u.match(/^\/boats\/([A-Za-z0-9-]+)$/))) { if (!FLEET[m[1]]) E.push(`link to unknown boat ${u}`); else internal++; }
    else if (/^\/(#calculator|#packages|#contact|terms|blog\/|blog\/category\/[a-z]+)$/.test(u)) internal++;
    else if (/^https:\/\/wa\.me\//.test(u)) {}
    else if (/^https:\/\//.test(u)) W.push(`external link ${u} (make sure it is an authoritative source)`);
    else E.push(`bad link "${u}" (use /blog/slug, /boats/slug, /#calculator, /terms or https://)`);
  }
  if (internal < 6) E.push(`only ${internal} internal links in text (need 6+: other /blog/ articles and /boats/ pages)`);

  const joined = allText.join(' ') + ' ' + (a.faq || []).map((f) => f.a).join(' ');
  if (/(\d[\d,]*\+?\s*(عميل|عملاء|زبون|رحلة ناجحة))|(تقييم\s*\d)|(★)/.test(joined)) E.push('looks like an invented proof claim (customer counts / ratings) — remove it');
  for (const m of joined.matchAll(/(\d{1,2},\d{3}|\d{4,5})\s*(ريال|ر\.س)/g)) {
    const n = +m[1].replace(',', '');
    if (!KNOWN_PRICES.has(n)) W.push(`price ${m[1]} ${m[2]} is not an ORCA price in FACTS.md — fine only if it is a computed example`);
  }
  return { E, W, wc, interactive, internal };
}

function blockTexts(b) {
  switch (b.t) {
    case 'p': case 'h3': case 'quote': return [b.text];
    case 'ul': case 'ol': return b.items || [];
    case 'callout': return [b.title || '', b.text];
    case 'table': return [b.caption || '', ...(b.head || []), ...(b.rows || []).flat()];
    case 'steps': case 'timeline': return (b.items || []).flatMap((i) => [i.title, i.text]);
    case 'checklist': return [b.title, ...(b.groups || []).flatMap((g) => [g.name, ...(g.items || [])])];
    case 'quiz': return [b.title || '', ...(b.questions || []).flatMap((q) => [q.q, ...(q.options || []), q.explain || ''])];
    case 'picker': return [b.title, b.question || '', ...(b.options || []).flatMap((o) => [o.label, o.result])];
    case 'calc': return [b.title || '', b.intro || ''];
    case 'compare': return (b.items || []).flatMap((i) => [i.title, ...(i.points || []), i.fit || '']);
    case 'stats': return (b.items || []).flatMap((i) => [i.value, i.label]);
    case 'reveal': return (b.items || []).flatMap((i) => [i.title, i.teaser || '', i.text]);
    case 'cta': return [b.text];
    default: return [];
  }
}

function checkBlock(b, where, E) {
  const need = (cond, msg) => { if (!cond) E.push(`${where}: ${msg}`); };
  switch (b.t) {
    case 'ul': case 'ol': need(b.items?.length >= 2, 'needs 2+ items'); break;
    case 'callout': need(['tip', 'warn', 'info', 'fact'].includes(b.v), 'v must be tip|warn|info|fact'); need(b.text, 'needs text'); break;
    case 'table': need(b.head?.length >= 2 && b.rows?.length >= 2, 'needs head (2+) and rows (2+)'); (b.rows || []).forEach((r, i) => need(r.length === b.head?.length, `row ${i} has ${r.length} cells, head has ${b.head?.length}`)); break;
    case 'steps': case 'timeline': need(b.items?.length >= 3 && b.items.every((i) => i.title && i.text), 'needs 3+ items with title and text'); if (b.t === 'timeline') need(b.items?.every((i) => i.time), 'every timeline item needs time'); break;
    case 'checklist': need(/^[a-z0-9-]+$/.test(b.id || ''), 'needs latin id'); need(b.title, 'needs title'); need(b.groups?.length >= 1 && b.groups.every((g) => g.name && g.items?.length >= 2), 'needs groups with name and 2+ items'); break;
    case 'quiz': need(b.questions?.length >= 3, 'needs 3+ questions'); (b.questions || []).forEach((q, i) => need(q.q && q.options?.length >= 2 && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length && q.explain, `question ${i} needs q, options, valid answer index and explain`)); break;
    case 'picker': need(b.title && b.options?.length >= 2 && b.options.every((o) => o.label && o.result), 'needs title and 2+ options with label and result'); break;
    case 'calc':
      need(['split', 'hours', 'boats', 'seats'].includes(b.kind), 'kind must be split|hours|boats|seats');
      if (b.kind === 'split') {
        need(b.presets?.length >= 1 && b.presets.every((p) => p.label && p.price > 0 && p.max > 0), 'split needs presets [{label, price, max, ...pricing rule}]');
        (b.presets || []).forEach((p, i) => need((p.incl > 0 && p.extra >= 0) || Array.isArray(p.tiers) || p.flat === true, `preset ${i} "${p.label}" needs its people rule from BOAT-PAGES.md: {incl, extra} (e.g. incl 6, extra 100), or tiers [[6,1880],[11,2080]], or flat:true for a fixed total`));
      }
      if (b.kind === 'hours') need(b.presets?.length >= 1 && b.presets.every((p) => p.label && p.rate > 0), 'hours needs presets [{label, rate, half?}]');
      if (b.kind === 'boats' && b.trip) need(['creek', 'bayada', 'abuTair', 'fishing'].includes(b.trip), 'trip must be creek|bayada|abuTair|fishing');
      break;
    case 'compare': need(b.items?.length >= 2 && b.items.every((i) => i.title && i.points?.length), 'needs 2+ items with title and points'); break;
    case 'stats': need(b.items?.length >= 2 && b.items.every((i) => i.value && i.label), 'needs 2+ items with value and label'); break;
    case 'boats': need(b.slugs?.length >= 1 && b.slugs.every((s) => FLEET[s]), 'needs valid boat slugs'); break;
    case 'reveal': need(b.items?.length >= 2 && b.items.every((i) => i.title && i.text), 'needs 2+ items with title and text'); break;
    case 'cta': need(b.text, 'needs text'); break;
    default: break;
  }
}

// ---------------------------------------------------------------- renderers
function renderBlock(b, a, ctx) {
  const M = (s) => md(s, ctx);
  switch (b.t) {
    case 'p': return `<p>${M(b.text)}</p>`;
    case 'h3': return `<h3>${M(b.text)}</h3>`;
    case 'ul': return `<ul>${b.items.map((i) => `<li>${M(i)}</li>`).join('')}</ul>`;
    case 'ol': return `<ol>${b.items.map((i) => `<li>${M(i)}</li>`).join('')}</ol>`;
    case 'quote': return `<p class="quote">${M(b.text)}</p>`;
    case 'callout': {
      const label = b.title || { tip: 'نصيحة', warn: 'تنبيه مهم', info: 'معلومة', fact: 'هل تعلم؟' }[b.v];
      return `<aside class="callout ${b.v}" aria-label="${esc(plain(label))}">${ICON[b.v]}<div><b>${M(label)}</b><p>${M(b.text)}</p></div></aside>`;
    }
    case 'table':
      return `<div class="tbl-wrap" role="region" aria-label="${esc(plain(b.caption || 'جدول'))}" tabindex="0"><table>${b.caption ? `<caption>${M(b.caption)}</caption>` : ''}<thead><tr>${b.head.map((h) => `<th scope="col">${M(h)}</th>`).join('')}</tr></thead><tbody>${b.rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${M(c)}</th>` : `<td>${M(c)}</td>`)).join('')}</tr>`).join('')}</tbody></table></div>`;
    case 'steps': return `<ol class="steps">${b.items.map((i) => `<li><b>${M(i.title)}</b><span>${M(i.text)}</span></li>`).join('')}</ol>`;
    case 'timeline': return `<ol class="timeline">${b.items.map((i) => `<li><time>${esc(i.time)}</time><div><b>${M(i.title)}</b><span>${M(i.text)}</span></div></li>`).join('')}</ol>`;
    case 'stats': return `<div class="stats">${b.items.map((i) => `<div><b>${M(i.value)}</b><span>${M(i.label)}</span></div>`).join('')}</div>`;
    case 'compare':
      return `<div class="compare">${b.items.map((i) => `<article class="${i.best ? 'best' : ''}">${i.best ? `<span class="badge">${esc(i.badge || 'الأنسب لمعظم الناس')}</span>` : ''}<h3>${M(i.title)}</h3><ul>${i.points.map((p) => `<li>${M(p)}</li>`).join('')}</ul>${i.fit ? `<p class="fit">${M(i.fit)}</p>` : ''}</article>`).join('')}</div>`;
    case 'reveal':
      return `<div class="reveal">${b.items.map((i) => `<details><summary><b>${M(i.title)}</b>${i.teaser ? `<span>${M(i.teaser)}</span>` : ''}</summary><p>${M(i.text)}</p></details>`).join('')}</div>`;
    case 'boats': return boatCards(b.slugs);
    case 'cta': {
      const msg = b.wa || a.wa || `السلام عليكم، قرأت مقال "${a.title}" وأرغب في الاستفسار عن رحلة`;
      return `<div class="icta"><p>${M(b.text)}</p><a class="btn btn-wa" href="${esc(waLink(msg))}" target="_blank" rel="noopener">${ICON.wa}<span>${esc(b.button || 'احجز عبر واتساب')}</span></a></div>`;
    }
    case 'checklist': {
      let k = 0;
      return `<div class="widget" data-checklist="${esc(a.slug + '-' + b.id)}"><h3 class="widget-h">${ICON.check}${M(b.title)}</h3><p class="widget-sub">${M(b.intro || 'أشّر على كل غرض جهّزته — قائمتك تبقى محفوظة في متصفحك حتى يوم الرحلة.')}</p><div class="ck-bar" aria-hidden="true"><i></i></div><p class="ck-count" aria-live="polite"></p>${b.groups.map((g) => `<div class="ck-group"><h4>${M(g.name)}</h4><ul>${g.items.map((i) => `<li><label><input type="checkbox" id="ck-${esc(b.id)}-${k++}"><span>${M(i)}</span></label></li>`).join('')}</ul></div>`).join('')}<p class="ck-done">ممتاز! كل شيء جاهز — رحلة سعيدة 🌊</p><div class="ck-actions"><button type="button" class="btn btn-ghost btn-sm" data-ck-send>أرسل الناقص لقروب الرحلة</button><button type="button" class="btn btn-ghost btn-sm" data-ck-reset>ابدأ من جديد</button></div></div>`;
    }
    case 'quiz':
      return `<div class="widget" data-quiz><h3 class="widget-h">${ICON.quiz}${M(b.title || 'اختبر معلوماتك')}</h3><p class="widget-sub">${M(b.intro || 'اختر إجابة لكل سؤال وسيظهر لك الشرح مباشرة.')}</p>${b.questions.map((q) => `<div class="quiz-q" data-answer="${q.answer}"><p class="q">${M(q.q)}</p><div class="quiz-opts">${q.options.map((o) => `<button type="button">${M(o)}</button>`).join('')}</div><p class="quiz-ex">${M(q.explain)}</p></div>`).join('')}<p class="quiz-score" aria-live="polite"></p></div>`;
    case 'picker':
      return `<div class="widget" data-picker><h3 class="widget-h">${ICON.pick}${M(b.title)}</h3>${b.question ? `<p class="widget-sub">${M(b.question)}</p>` : ''}<div class="w-row">${b.options.map((o) => `<button type="button" class="pill" aria-pressed="false">${M(o.label)}</button>`).join('')}</div>${b.options.map((o) => `<div class="pick-out" aria-live="polite"><p>${M(o.result)}</p></div>`).join('')}</div>`;
    case 'calc': return renderCalc(b, M);
    default: return '';
  }
}

let calcN = 0;
function renderCalc(b, M) {
  const id = `c${++calcN}`;
  const head = (title, sub) => `<h3 class="widget-h">${ICON.calc}${M(b.title || title)}</h3><p class="widget-sub">${M(b.intro || sub)}</p>`;
  const rng = (name, min, max, val, label) => `<label class="w-label" for="${id}-${name}">${label}</label><div class="range"><input type="range" id="${id}-${name}" name="${name}" min="${min}" max="${max}" value="${val}"><output for="${id}-${name}">${val}</output></div>`;
  const pillsHtml = (group, label, items) => `<span class="w-label">${label}</span><div class="w-row" data-group="${group}" role="group" aria-label="${esc(label)}">${items.map((it, i) => `<button type="button" class="pill" data-v="${esc(it.v)}" aria-pressed="${i === (it.on ?? 0) || it.on === true ? 'true' : 'false'}">${esc(it.label)}</button>`).join('')}</div>`;
  const result = '<div class="result" aria-live="polite"></div>';
  if (b.kind === 'split') {
    const p0 = b.presets[0];
    const n0 = Math.min(p0.max, b.people || 6);
    const v0 = p0.tiers ? (p0.tiers.find((t) => n0 <= t[0]) || p0.tiers[p0.tiers.length - 1])[1] : p0.incl ? p0.price + Math.max(0, n0 - p0.incl) * p0.extra : p0.price;
    return `<div class="widget" data-calc="split" data-cfg="${esc(JSON.stringify({ presets: b.presets }))}">${head('حاسبة تقسيم التكلفة على الأشخاص', 'اختر الرحلة وعدد المشاركين لتعرف نصيب كل شخص.')}${pillsHtml('preset', 'الرحلة', b.presets.map((p, i) => ({ v: i, label: p.label })))}<label class="w-label" for="${id}-price">السعر الإجمالي (ر.س)</label><input class="num-in" type="number" inputmode="numeric" min="0" id="${id}-price" name="price" value="${v0}">${rng('people', 1, Math.max(...b.presets.map((p) => p.max)), n0, 'عدد الأشخاص')}${result}</div>`;
  }
  if (b.kind === 'hours') {
    const hasHalf = b.presets.some((p) => p.half);
    const hrs = [...(hasHalf ? [{ v: 0.5, label: 'نصف ساعة' }] : []), { v: 1, label: 'ساعة' }, { v: 2, label: 'ساعتان' }, { v: 3, label: '3 ساعات' }, { v: 4, label: '4 ساعات' }];
    hrs.forEach((h) => { h.on = h.v === 1; });
    return `<div class="widget" data-calc="hours" data-cfg="${esc(JSON.stringify({ presets: b.presets }))}">${head('حاسبة جولة الخور بالساعة', 'اختر القارب والمدة وعدد الأشخاص.')}${pillsHtml('rate', 'القارب', b.presets.map((p, i) => ({ v: i, label: `${p.label} (${p.rate.toLocaleString('en-US')} ر.س/س)` })))}${pillsHtml('hrs', 'المدة', hrs.map((h) => ({ ...h, on: h.on })))}${rng('people', 1, 30, b.people || 6, 'عدد الأشخاص')}${result}</div>`;
  }
  if (b.kind === 'boats') {
    const trips = [{ v: 'bayada', label: 'جزيرة بياضة' }, { v: 'abuTair', label: 'جزيرة أبو طير' }, { v: 'creek', label: 'جولة الخور' }, { v: 'fishing', label: 'رحلة صيد' }];
    const on = trips.findIndex((x) => x.v === (b.trip || 'bayada'));
    return `<div class="widget" data-calc="boats">${head('أداة: أي قارب يناسب مجموعتك؟', 'حدد نوع الرحلة وعدد الأشخاص، وستظهر لك القوارب المناسبة من أسطول أوركا مرتبة من الأوفر.')}${pillsHtml('trip', 'نوع الرحلة', trips.map((x, i) => ({ ...x, on: i === on })))}${rng('people', 1, 70, b.people || 8, 'عدد الأشخاص')}${result}</div>`;
  }
  if (b.kind === 'seats') {
    return `<div class="widget" data-calc="seats" data-cfg="${esc(JSON.stringify({ boatPrice: b.boatPrice || 1300, boatCap: b.boatCap || 9, boatIncl: b.boatIncl || 6, boatExtra: b.boatExtra ?? 100 }))}">${head('المقعد الفردي أم القارب الخاص؟', 'قارن تكلفة المقاعد الفردية لمجموعتك مع حجز قارب كامل لبياضة.')}${pillsHtml('tier', 'فئة المقعد', [{ v: 250, label: 'اقتصادي 250' }, { v: 300, label: 'VIP 300' }, { v: 320, label: 'VVIP 320' }])}${rng('people', 1, 12, b.people || 4, 'عدد الأشخاص')}${result}</div>`;
  }
  return '';
}

function boatCards(slugs) {
  return `<div class="boats">${slugs.map((s) => { const b = FLEET[s]; return `<a class="bcard" href="/boats/${s}"><div class="ph">${img(b.img, b.name, 'loading="lazy" decoding="async"')}</div><div class="bd"><b>${esc(b.name)}</b><small>${b.cap ? `حتى ${ppl(b.cap)} · ` : ''}${esc(b.marina)}</small><small>${esc(b.tag)}</small><span class="pr">${esc(b.price)}</span></div></a>`; }).join('')}</div>`;
}

// ---------------------------------------------------------------- page chrome
const CSS = fs.readFileSync(path.join(SRC, 'blog.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '').replace(/\s*([{};,>])\s*/g, '$1').replace(/;}/g, '}');
const JS_SRC = `var ORCA_FLEET=${JSON.stringify(Object.fromEntries(Object.entries(PRICES).filter(([k]) => FLEET[k]).map(([k, p]) => [k, { n: FLEET[k].name, cap: FLEET[k].cap, m: FLEET[k].marina, ...p }])))};\n` + fs.readFileSync(path.join(SRC, 'blog.js'), 'utf8');
const JS_V = crypto.createHash('md5').update(JS_SRC).digest('hex').slice(0, 10);

const NAV = [['/', 'الرئيسية'], ['/#packages', 'الأسطول'], ['/#calculator', 'حاسبة الأسعار'], ['/blog/', 'المدونة'], ['/#contact', 'تواصل معنا']];

function head({ title, desc, canonical, image, type = 'website', extra = '', schema }) {
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<meta name="theme-color" content="#0B2545">
<meta property="og:type" content="${type}">
<meta property="og:locale" content="ar_SA">
<meta property="og:site_name" content="أوركا للرحلات البحرية">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${image}">
<meta name="twitter:card" content="summary_large_image">
${extra}<link rel="icon" type="image/webp" href="/images/logo.webp">
<link rel="apple-touch-icon" href="/images/logo.webp">
<link rel="alternate" type="application/rss+xml" title="مدونة أوركا" href="${URL_BASE}/blog/feed.xml">
<link rel="preload" href="/font/plex-arabic-700.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/font/plex-arabic-400.woff2" as="font" type="font/woff2" crossorigin>
<style>${CSS}</style>
<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>
<script src="/blog/blog.js?v=${JS_V}" defer></script>
</head>`;
}

function header(current) {
  const wa = waLink('السلام عليكم، أرغب في حجز رحلة بحرية مع أوركا');
  return `<a class="skip" href="#main">تخطَّ إلى المحتوى</a>
<header class="hdr">
  <div class="container">
    <a class="logo" href="/" aria-label="أوركا — الصفحة الرئيسية"><img src="/images/logo.webp" alt="" width="84" height="84"><span><b>أوركا <span>ORCA</span></b><small>تجربة تشدك للبحر</small></span></a>
    <nav class="nav" aria-label="القائمة الرئيسية">${NAV.map(([h, l]) => `<a href="${h}"${h === current ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</nav>
    <div class="hdr-cta">
      <a class="btn btn-wa btn-sm" href="${esc(wa)}" target="_blank" rel="noopener" aria-label="احجز عبر واتساب">${ICON.wa}<span>احجز الآن</span></a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mnav" aria-label="فتح القائمة">${ICON.menu}</button>
    </div>
  </div>
  <nav class="mnav" id="mnav" aria-label="قائمة الجوال">${NAV.map(([h, l]) => `<a href="${h}">${l}</a>`).join('')}</nav>
</header>`;
}

function footer() {
  const pillars = ['jazirat-bayada-guide', 'yacht-rental-jeddah-guide', 'fishing-trips-jeddah-guide', 'obhur-creek-guide', 'abu-tair-island'];
  return `<footer class="ftr">
  <div class="container">
    <div class="ftr-grid">
      <div>
        <a class="logo" href="/"><img src="/images/logo.webp" alt="" width="84" height="84" loading="lazy"><span><b>أوركا <span>ORCA</span></b><small>تجربة تشدك للبحر</small></span></a>
        <p>أوركا منصة سعودية لحجز وتأجير اليخوت والقوارب في جدة على البحر الأحمر: رحلات بياضة وأبو طير، جولات خور أبحر، الصيد، والحفلات.</p>
      </div>
      <div><h2>أدلة مختارة</h2><ul>${pillars.filter((s) => TOPIC[s]).map((s) => `<li><a href="/blog/${s}">${esc(shortTitle(TOPIC[s].title))}</a></li>`).join('')}</ul></div>
      <div><h2>أقسام المدونة</h2><ul>${Object.entries(CATS).slice(0, 6).map(([k, c]) => `<li><a href="/blog/category/${k}">${esc(c.name)}</a></li>`).join('')}</ul></div>
      <div><h2>الحجز والاستفسار</h2><ul><li><a href="https://wa.me/${WA_NUM}" target="_blank" rel="noopener">واتساب: <bdi dir="ltr">056 839 0147</bdi></a></li><li><a href="tel:0531403454">اتصال: <bdi dir="ltr">053 140 3454</bdi></a></li><li><a href="/#calculator">حاسبة الأسعار</a></li><li><a href="/terms">شروط وأحكام الحجز</a></li></ul></div>
    </div>
    <p class="ftr-bottom">&copy; 2026 أوركا لتأجير اليخوت والقوارب بجدة. جميع الحقوق محفوظة.</p>
  </div>
</footer>`;
}
const ppl = (n) => (n <= 10 ? `${n} أشخاص` : `${n} شخصاً`);
const shortTitle = (t) => t.split(/[:؟]/)[0].trim();

const ORG = { '@type': ['LocalBusiness', 'TravelAgency'], '@id': `${URL_BASE}/#org`, name: 'أوركا للرحلات البحرية', alternateName: ['ORCA Marine Trips', 'أوركا', 'bookorca'], url: `${URL_BASE}/`, logo: `${URL_BASE}/images/logo.png`, image: `${URL_BASE}/images/og-image.jpg`, telephone: '+966531403454', priceRange: '250 - 30,000 SAR', address: { '@type': 'PostalAddress', addressLocality: 'Jeddah', addressRegion: 'Makkah Province', addressCountry: 'SA' }, areaServed: { '@type': 'City', name: 'Jeddah' }, contactPoint: [{ '@type': 'ContactPoint', telephone: '+966568390147', contactType: 'reservations', availableLanguage: ['Arabic', 'English'], areaServed: 'SA' }] };
const WEBSITE = { '@type': 'WebSite', '@id': `${URL_BASE}/#website`, url: `${URL_BASE}/`, name: 'أوركا للرحلات البحرية', inLanguage: 'ar', publisher: { '@id': `${URL_BASE}/#org` } };
const BLOG_NODE = { '@type': 'Blog', '@id': `${URL_BASE}/blog/#blog`, url: `${URL_BASE}/blog/`, name: 'مدونة أوركا للرحلات البحرية', inLanguage: 'ar', publisher: { '@id': `${URL_BASE}/#org` } };

// ---------------------------------------------------------------- article page
function minutesOf(wc) { return Math.max(3, Math.round(wc / 170)); }
function heroImage(a) { return a.image || (a.boats?.[0] && FLEET[a.boats[0]].img) || 'images/og-image.jpg'; }

function articlePage(a, all, wc) {
  const ctx = { links: [] };
  const M = (s) => md(s, ctx);
  const cat = CATS[a.cat];
  const url = `${URL_BASE}/blog/${a.slug}`;
  const hero = heroImage(a);
  const mins = minutesOf(wc);
  const pub = a.published || TODAY, mod = a.updated || pub;
  const wa = a.wa || `السلام عليكم، قرأت مقال "${a.title}" في مدونة أوركا وأرغب في الاستفسار عن رحلة`;
  const related = (a.related || []).filter((s) => all[s]).slice(0, 6);
  const sameCat = Object.values(all).filter((x) => x.cat === a.cat && x.slug !== a.slug && !related.includes(x.slug));
  while (related.length < 3 && sameCat.length) related.push(sameCat.shift().slug);
  calcN = 0;

  const sections = a.sections.map((s) => `<section id="${s.id}" aria-labelledby="h-${s.id}"><h2 id="h-${s.id}">${M(s.h2)}<a class="anchor" href="#${s.id}" aria-label="رابط هذا القسم">#</a></h2>${s.blocks.map((b) => renderBlock(b, a, ctx)).join('\n')}</section>`).join('\n');
  const tocItems = a.sections.map((s) => `<li><a href="#${s.id}">${esc(plain(s.h2))}</a></li>`).join('') + '<li><a href="#faq">الأسئلة الشائعة</a></li>';

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      ORG, WEBSITE, BLOG_NODE,
      { '@type': 'BlogPosting', '@id': `${url}#article`, headline: a.title, description: a.description, image: [absImg(hero)], datePublished: pub, dateModified: mod, inLanguage: 'ar', wordCount: wc, timeRequired: `PT${mins}M`, articleSection: cat.name, keywords: a.kw.join('، '), author: { '@type': 'Organization', name: 'فريق أوركا للرحلات البحرية', url: `${URL_BASE}/` }, publisher: { '@id': `${URL_BASE}/#org` }, isPartOf: { '@id': `${URL_BASE}/blog/#blog` }, mainEntityOfPage: url, about: a.kw.slice(0, 3).map((k) => ({ '@type': 'Thing', name: k })), mentions: (a.boats || []).map((s) => ({ '@type': 'Product', name: FLEET[s].name, url: `${URL_BASE}/boats/${s}` })) },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'الرئيسية', item: `${URL_BASE}/` }, { '@type': 'ListItem', position: 2, name: 'المدونة', item: `${URL_BASE}/blog/` }, { '@type': 'ListItem', position: 3, name: cat.name, item: `${URL_BASE}/blog/category/${a.cat}` }, { '@type': 'ListItem', position: 4, name: a.title, item: url }] },
      { '@type': 'FAQPage', '@id': `${url}#faq`, mainEntity: a.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: plain(f.a) } })) },
    ],
  };

  const extra = `<meta property="article:published_time" content="${pub}">\n<meta property="article:modified_time" content="${mod}">\n<meta property="article:section" content="${esc(cat.name)}">\n`;
  const html = `${head({ title: a.seoTitle, desc: a.description, canonical: url, image: absImg(hero), type: 'article', extra, schema })}
<body>
${header('/blog/')}
<div class="progress" aria-hidden="true"><i></i></div>
<main id="main">
  <div class="a-hero">
    <div class="container">
      <ol class="crumbs" aria-label="مسار التصفح"><li><a href="/">الرئيسية</a></li><li><a href="/blog/">المدونة</a></li><li><a href="/blog/category/${a.cat}">${esc(cat.name)}</a></li></ol>
      <a class="chip" href="/blog/category/${a.cat}">${esc(cat.name)}</a>
      <h1>${esc(a.title)}</h1>
      <p class="lede">${M(a.description)}</p>
      <div class="meta"><span>${ICON.user}فريق أوركا</span><span>${ICON.cal}<time datetime="${mod}">آخر تحديث: ${arDate(mod)}</time></span><span>${ICON.clock}${mins} دقائق قراءة</span></div>
      <figure class="hero-img">${img(hero, a.imageAlt || `${a.title} — صورة من أسطول أوركا في جدة`, 'fetchpriority="high" decoding="async"')}</figure>
    </div>
  </div>
  <div class="container a-grid">
    <article class="a-main">
      <details class="toc-m"><summary>محتويات المقال (${a.sections.length + 1} أقسام)</summary><ol>${tocItems}</ol></details>
      <section class="answer" aria-labelledby="h-answer"><h2 id="h-answer">${ICON.bolt.replace('<svg', '<svg width="20" height="20"')}الجواب المختصر</h2><p>${M(a.summary)}</p></section>
      <section class="takeaways" aria-labelledby="h-take"><h2 id="h-take">أهم ما ستعرفه في هذا المقال</h2><ul>${a.takeaways.map((t) => `<li>${M(t)}</li>`).join('')}</ul></section>
      <div class="prose" data-minutes="${mins}">
${sections}
        <section id="faq" aria-labelledby="h-faq"><h2 id="h-faq">الأسئلة الشائعة</h2><div class="faq">${a.faq.map((f, i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(f.q)}</summary><p>${M(f.a)}</p></details>`).join('')}</div></section>
        ${a.boats?.length ? `<section id="boats" aria-labelledby="h-boats"><h2 id="h-boats">قوارب مقترحة لهذه الرحلة</h2><p>اخترنا لك من أسطول أوركا القوارب الأنسب لموضوع هذا المقال. اضغط على أي قارب لرؤية الصور والباقات كاملة.</p>${boatCards(a.boats.slice(0, 4))}</section>` : ''}
      </div>
      <p class="updated">راجع فريق أوركا هذا المقال وحدّث أسعاره في ${arDate(mod)}. الأسعار المذكورة بالريال السعودي وقابلة للتغيير، وتأكيدها النهائي يكون عبر واتساب عند الحجز.</p>
      <div class="feedback" data-feedback="${a.slug}"><p>هل أفادك هذا المقال؟</p><button type="button" class="btn btn-ghost btn-sm" data-v="yes">نعم، مفيد 👍</button><button type="button" class="btn btn-ghost btn-sm" data-v="no">يحتاج تحسين</button><span class="thanks">شكراً لك! رأيك يساعدنا نكتب أفضل.</span></div>
      <div class="share"><span>شارك المقال:</span><button type="button" class="btn btn-ghost btn-sm" data-share="wa">واتساب</button><button type="button" class="btn btn-ghost btn-sm" data-share="copy">نسخ الرابط</button><button type="button" class="btn btn-ghost btn-sm" data-share="native">مشاركة</button></div>
    </article>
    <aside class="a-side" aria-label="أدوات المقال">
      <nav class="toc" aria-label="محتويات المقال"><h2>محتويات المقال</h2><ol>${tocItems}</ol><p class="toc-time"><b>${mins} دقائق قراءة</b></p></nav>
      <div class="side-card"><h2>جاهز للبحر؟</h2><p>أرسل لنا موعدك وعدد الأشخاص، ونقترح لك القارب الأنسب ونؤكد السعر النهائي.</p><a class="btn btn-wa" href="${esc(waLink(wa))}" target="_blank" rel="noopener">${ICON.wa}<span>احجز عبر واتساب</span></a><a class="btn btn-ghost" href="/#calculator">احسب التكلفة</a></div>
    </aside>
  </div>
  <section class="related" aria-labelledby="h-rel"><div class="container"><h2 id="h-rel">اقرأ أيضاً</h2><div class="cards">${related.map((s) => card(all[s])).join('')}</div></div></section>
  <section class="band" aria-labelledby="h-band"><div class="container"><div><h2 id="h-band">خطّط رحلتك القادمة مع أوركا</h2><p>26 قارباً ويختاً في جدة لرحلات بياضة وأبو طير وخور أبحر والصيد والمناسبات. فريق الحجز يرد عليك عبر واتساب على مدار الساعة.</p></div><div class="w-row"><a class="btn btn-wa" href="${esc(waLink(wa))}" target="_blank" rel="noopener">${ICON.wa}<span>احجز رحلتك الآن</span></a><a class="btn btn-ghost" href="/#packages">تصفح الأسطول</a></div></div></section>
</main>
<div class="mbar"><a class="btn btn-wa" href="${esc(waLink(wa))}" target="_blank" rel="noopener">${ICON.wa}<span>احجز عبر واتساب</span></a><a class="btn btn-ghost" href="/#calculator">احسب السعر</a></div>
<button class="to-top" type="button" aria-label="العودة لأعلى الصفحة">${ICON.up}</button>
${footer()}
</body>
</html>
`;
  return html;
}

function card(a, opts = {}) {
  const t = TOPIC[a.slug];
  return `<article class="card" data-card${opts.cat ? ` data-cat="${a.cat}"` : ''} data-kw="${esc(a.kw.join(' '))}"><div class="ph">${img(heroImage(a), '', 'loading="lazy" decoding="async"')}</div><div class="bd"><a class="chip" href="/blog/category/${a.cat}">${esc(CATS[a.cat].name)}</a><h3><a href="/blog/${a.slug}">${esc(a.title)}</a></h3><p>${esc(a.description)}</p><div class="cm"><span>${minutesOf(a._wc)} دقائق قراءة</span><span>${t ? '' : ''}</span></div></div></article>`;
}

// ---------------------------------------------------------------- index + categories
function catNav(all, current) {
  const counts = {};
  Object.values(all).forEach((a) => { counts[a.cat] = (counts[a.cat] || 0) + 1; });
  return `<nav class="cats" aria-label="أقسام المدونة"><a href="/blog/"${current ? '' : ' aria-current="page"'}>كل المقالات <small>${Object.keys(all).length}</small></a>${Object.entries(CATS).filter(([k]) => counts[k]).map(([k, c]) => `<a href="/blog/category/${k}"${current === k ? ' aria-current="page"' : ''}>${esc(c.name)} <small>${counts[k]}</small></a>`).join('')}</nav>`;
}

function indexPage(all) {
  const list = Object.values(all).sort((a, b) => TOPIC[a.slug].n - TOPIC[b.slug].n);
  const pillars = ['jazirat-bayada-guide', 'yacht-rental-jeddah-guide', 'obhur-creek-guide', 'fishing-trips-jeddah-guide', 'abu-tair-island', 'first-boat-trip-guide', 'jeddah-sea-tourism', 'border-guard-permit'].filter((s) => all[s]);
  const url = `${URL_BASE}/blog/`;
  const desc = 'مدونة أوركا: أدلة عملية عن رحلات جزيرة بياضة وأبو طير، تأجير اليخوت والقوارب في جدة، الصيد، السلامة، والأسعار المحدثة 2026.';
  const schema = { '@context': 'https://schema.org', '@graph': [ORG, WEBSITE, { ...BLOG_NODE, description: desc, blogPost: list.map((a) => ({ '@type': 'BlogPosting', headline: a.title, url: `${URL_BASE}/blog/${a.slug}`, datePublished: a.published || TODAY })) }, { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'الرئيسية', item: `${URL_BASE}/` }, { '@type': 'ListItem', position: 2, name: 'المدونة', item: url }] }] };
  const groups = Object.entries(CATS).map(([k, c]) => [k, c, list.filter((a) => a.cat === k)]).filter(([, , l]) => l.length);
  return `${head({ title: 'مدونة أوركا: أدلة الرحلات البحرية في جدة | أوركا', desc, canonical: url, image: `${URL_BASE}/images/og-image.jpg`, schema })}
<body>
${header('/blog/')}
<main id="main">
  <section class="b-hero" aria-labelledby="h-blog">
    <div class="container">
      <ol class="crumbs" aria-label="مسار التصفح"><li><a href="/">الرئيسية</a></li><li>المدونة</li></ol>
      <h1 id="h-blog">مدونة أوركا: كل ما تحتاج معرفته عن الرحلات البحرية في جدة</h1>
      <p>${list.length} دليلاً عملياً كتبه فريق أوركا عن رحلات بياضة وأبو طير وخور أبحر والصيد: أسعار محدثة، قوائم تجهيز تفاعلية، حاسبات تكلفة، ونصائح سلامة.</p>
      <div class="search" role="search"><label class="sr-only" for="blog-q">ابحث في المدونة</label>${ICON.search}<input id="blog-q" type="search" placeholder="ابحث: بياضة، سعر يخت، صيد، الهوية..." autocomplete="off"></div>
    </div>
  </section>
  <div class="container">${catNav(all, null)}</div>
  <section class="b-sec" data-hide-on-search aria-labelledby="h-start"><div class="container"><h2 id="h-start">ابدأ من هنا: الأدلة الأساسية</h2><div class="pillars">${pillars.map((s) => { const a = all[s]; return `<a class="pillar" href="/blog/${s}">${img(heroImage(a), '', 'loading="lazy" decoding="async"').replace(/width="\d+" height="\d+"/, 'width="72" height="72"')}<span><b>${esc(shortTitle(a.title))}</b><small>${esc(CATS[a.cat].name)} · ${minutesOf(a._wc)} دقائق</small></span></a>`; }).join('')}</div></div></section>
  ${groups.map(([k, c, l]) => `<section class="b-sec" aria-labelledby="h-${k}"><div class="container"><h2 id="h-${k}"><span>${esc(c.name)}</span><a href="/blog/category/${k}" data-hide-on-search>كل مقالات ${esc(c.name)} (${l.length}) ‹</a></h2><div class="cards">${l.map((a) => card(a)).join('')}</div></div></section>`).join('\n')}
  <div class="container"><p class="no-res">لم نجد مقالاً بهذه الكلمات. جرّب كلمة أخرى أو <a href="https://wa.me/${WA_NUM}" target="_blank" rel="noopener">اسأل فريق أوركا مباشرة عبر واتساب</a>.</p></div>
  <section class="band" aria-labelledby="h-band"><div class="container"><div><h2 id="h-band">عندك سؤال لم تجد جوابه؟</h2><p>فريق أوركا يرد عليك عبر واتساب على مدار الساعة، ويساعدك تختار القارب والوجهة المناسبة لميزانيتك.</p></div><div class="w-row"><a class="btn btn-wa" href="${esc(waLink('السلام عليكم، عندي سؤال عن الرحلات البحرية'))}" target="_blank" rel="noopener">${ICON.wa}<span>اسألنا عبر واتساب</span></a><a class="btn btn-ghost" href="/#packages">تصفح الأسطول</a></div></div></section>
</main>
${footer()}
</body>
</html>
`;
}

function categoryPage(k, all) {
  const c = CATS[k];
  const list = Object.values(all).filter((a) => a.cat === k).sort((a, b) => TOPIC[a.slug].n - TOPIC[b.slug].n);
  const url = `${URL_BASE}/blog/category/${k}`;
  const desc = `${c.desc} ${list.length} مقالاً من مدونة أوركا للرحلات البحرية في جدة.`.slice(0, 160);
  const schema = { '@context': 'https://schema.org', '@graph': [ORG, WEBSITE, { '@type': 'CollectionPage', '@id': `${url}#page`, url, name: c.name, description: c.desc, inLanguage: 'ar', isPartOf: { '@id': `${URL_BASE}/blog/#blog` }, mainEntity: { '@type': 'ItemList', itemListElement: list.map((a, i) => ({ '@type': 'ListItem', position: i + 1, url: `${URL_BASE}/blog/${a.slug}`, name: a.title })) } }, { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'الرئيسية', item: `${URL_BASE}/` }, { '@type': 'ListItem', position: 2, name: 'المدونة', item: `${URL_BASE}/blog/` }, { '@type': 'ListItem', position: 3, name: c.name, item: url }] }] };
  return `${head({ title: `${c.name}: أدلة ومقالات | مدونة أوركا`, desc, canonical: url, image: absImg(heroImage(list[0])), schema })}
<body>
${header('/blog/')}
<main id="main">
  <section class="b-hero" aria-labelledby="h-cat"><div class="container"><ol class="crumbs" aria-label="مسار التصفح"><li><a href="/">الرئيسية</a></li><li><a href="/blog/">المدونة</a></li><li>${esc(c.name)}</li></ol><h1 id="h-cat">${esc(c.name)}</h1><p>${esc(c.desc)}</p><div class="search" role="search"><label class="sr-only" for="blog-q">ابحث في ${esc(c.name)}</label>${ICON.search}<input id="blog-q" type="search" placeholder="ابحث في هذا القسم..." autocomplete="off"></div></div></section>
  <div class="container">${catNav(all, k)}</div>
  <section class="b-sec" aria-labelledby="h-list"><div class="container"><h2 id="h-list">كل مقالات ${esc(c.name)} (${list.length})</h2><div class="cards">${list.map((a) => card(a)).join('')}</div><p class="no-res">لا توجد نتائج. جرّب كلمة أخرى.</p></div></section>
  <section class="band" aria-labelledby="h-band"><div class="container"><div><h2 id="h-band">جاهز تحجز؟</h2><p>أرسل لفريق أوركا موعدك وعدد الأشخاص ونوع الرحلة، ونرسل لك الخيارات والأسعار مباشرة.</p></div><div class="w-row"><a class="btn btn-wa" href="${esc(waLink('السلام عليكم، أرغب في حجز رحلة بحرية'))}" target="_blank" rel="noopener">${ICON.wa}<span>احجز عبر واتساب</span></a><a class="btn btn-ghost" href="/#calculator">حاسبة الأسعار</a></div></div></section>
</main>
${footer()}
</body>
</html>
`;
}

// ---------------------------------------------------------------- sitemap, llms.txt, feed, headers
function replaceBetween(text, start, end, block) {
  const re = new RegExp(`${start}[\\s\\S]*?${end}\\n?`);
  return re.test(text) ? text.replace(re, block) : null;
}

function writeSitemap(all) {
  const p = path.join(SITE, 'sitemap.xml');
  let xml = fs.readFileSync(p, 'utf8');
  const urls = [['/blog/', TODAY, '0.8'], ...Object.keys(CATS).filter((k) => Object.values(all).some((a) => a.cat === k)).map((k) => [`/blog/category/${k}`, TODAY, '0.6']), ...Object.values(all).map((a) => [`/blog/${a.slug}`, a.updated || a.published || TODAY, '0.7'])];
  const block = `  <!-- BLOG:START (generated by blog-src/build.mjs) -->\n${urls.map(([u, d, pr]) => `  <url>\n    <loc>${URL_BASE}${u}</loc>\n    <lastmod>${d}</lastmod>\n    <priority>${pr}</priority>\n  </url>`).join('\n')}\n  <!-- BLOG:END -->\n`;
  xml = replaceBetween(xml, '  <!-- BLOG:START', '<!-- BLOG:END -->', block) ?? xml.replace('</urlset>', block + '</urlset>');
  fs.writeFileSync(p, xml);
}

function writeLlms(all) {
  const p = path.join(SITE, 'llms.txt');
  let txt = fs.readFileSync(p, 'utf8');
  const list = Object.values(all).sort((a, b) => TOPIC[a.slug].n - TOPIC[b.slug].n);
  const block = `<!-- BLOG:START -->\n## المدونة — أدلة الرحلات البحرية في جدة\n- [مدونة أوركا](${URL_BASE}/blog/): ${list.length} دليلاً عن بياضة وأبو طير وخور أبحر وتأجير اليخوت والصيد والسلامة\n${Object.entries(CATS).map(([k, c]) => { const l = list.filter((a) => a.cat === k); return l.length ? `\n### ${c.name}\n${l.map((a) => `- [${a.title}](${URL_BASE}/blog/${a.slug}): ${plain(a.summary).replace(/\s+/g, ' ')}`).join('\n')}` : ''; }).join('\n')}\n<!-- BLOG:END -->\n`;
  txt = replaceBetween(txt, '<!-- BLOG:START -->', '<!-- BLOG:END -->', block) ?? txt.replace(/\n## الأسئلة الشائعة/, `\n${block}\n## الأسئلة الشائعة`);
  if (!txt.includes('<!-- BLOG:START -->')) txt += '\n' + block;
  fs.writeFileSync(p, txt);
}

function writeFeed(all) {
  const list = Object.values(all).sort((a, b) => (b.published || TODAY).localeCompare(a.published || TODAY) || TOPIC[a.slug].n - TOPIC[b.slug].n);
  const x = (s) => esc(s);
  const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n<title>مدونة أوركا للرحلات البحرية</title>\n<link>${URL_BASE}/blog/</link>\n<description>أدلة عملية عن الرحلات البحرية وتأجير اليخوت والقوارب في جدة.</description>\n<language>ar</language>\n<atom:link href="${URL_BASE}/blog/feed.xml" rel="self" type="application/rss+xml"/>\n${list.map((a) => `<item><title>${x(a.title)}</title><link>${URL_BASE}/blog/${a.slug}</link><guid>${URL_BASE}/blog/${a.slug}</guid><pubDate>${new Date((a.published || TODAY) + 'T08:00:00+03:00').toUTCString()}</pubDate><category>${x(CATS[a.cat].name)}</category><description>${x(a.description)}</description></item>`).join('\n')}\n</channel>\n</rss>\n`;
  fs.writeFileSync(path.join(OUT, 'feed.xml'), rss);
}

// Homepage teaser: links the main page to the blog's guides (crawl path + topical authority)
function writeHomeTeaser(all) {
  const p = path.join(SITE, 'index.html');
  let html = fs.readFileSync(p, 'utf8');
  const picks = ['jazirat-bayada-guide', 'bayada-trip-price', 'yacht-rental-jeddah-guide', 'obhur-creek-guide', 'fishing-trips-jeddah-guide', 'border-guard-permit', 'first-boat-trip-guide', 'abu-tair-island'].filter((s) => all[s]).slice(0, 6);
  if (!picks.length) return;
  const block = `<!-- BLOG-TEASER:START (generated by blog-src/build.mjs) -->
    <section id="guides" class="guides-section">
        <style>
            .guides-section{padding:70px 0;background:var(--off-white)}
            .guides-grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr))}
            .guide-card{display:flex;gap:14px;align-items:center;background:var(--white);border:1px solid var(--gray-100);border-radius:var(--radius-md);padding:12px;color:var(--navy);transition:box-shadow .2s,transform .2s}
            .guide-card:hover{box-shadow:var(--shadow-md);transform:translateY(-2px)}
            .guide-card img{width:84px;height:84px;border-radius:12px;object-fit:cover;flex:none}
            .guide-card b{display:block;line-height:1.6;font-size:.98rem}
            .guide-card small{color:var(--gray-600);font-size:.82rem}
            .guides-more{text-align:center;margin-top:24px}
        </style>
        <div class="container">
            <div class="section-title">
                <span class="sub-title">مدونة أوركا</span>
                <h2>أدلة تساعدك قبل رحلتك البحرية في جدة</h2>
                <div class="title-underline"></div>
            </div>
            <div class="guides-grid">
${picks.map((s) => { const a = all[s]; return `                <a class="guide-card" href="/blog/${s}"><img src="${imgUrl(heroImage(a))}" alt="" width="84" height="84" loading="lazy" decoding="async"><span><b>${esc(shortTitle(a.title))}</b><small>${esc(CATS[a.cat].name)} · ${minutesOf(a._wc)} دقائق قراءة</small></span></a>`; }).join('\n')}
            </div>
            <div class="guides-more"><a href="/blog/" class="btn btn-primary">تصفح كل الأدلة (${Object.keys(all).length} مقالاً)</a></div>
        </div>
    </section>
    <!-- BLOG-TEASER:END -->
`;
  const next = replaceBetween(html, '<!-- BLOG-TEASER:START', '<!-- BLOG-TEASER:END -->', block) ?? html.replace('    <!-- FAQ (visible Q&A', `    ${block}\n    <!-- FAQ (visible Q&A`);
  fs.writeFileSync(p, next);
}

function writeHeaders() {
  const p = path.join(SITE, '_headers');
  let h = fs.readFileSync(p, 'utf8');
  if (!h.includes('/blog/blog.js')) {
    h += '\n# Blog script is linked with ?v=<content hash> by blog-src/build.mjs: cache for 1 day.\n/blog/blog.js\n  Cache-Control: public, max-age=86400, stale-while-revalidate=604800\n/blog/feed.xml\n  Cache-Control: public, max-age=3600\n';
    fs.writeFileSync(p, h);
  }
}

// ---------------------------------------------------------------- main
const args = process.argv.slice(2);
const checkOnly = args[0] === '--check';
const files = checkOnly ? args.slice(1) : fs.readdirSync(path.join(SRC, 'articles')).filter((f) => f.endsWith('.json')).map((f) => path.join(SRC, 'articles', f));

let failed = 0;
const all = {};
for (const f of files) {
  let a;
  try { a = readJSON(f); } catch (e) { console.log(`✗ ${path.basename(f)}: invalid JSON — ${e.message}`); failed++; continue; }
  const { E, W, wc, interactive, internal } = validate(a, f);
  a._wc = wc;
  const tag = `${path.basename(f)} — ${wc} words, ${interactive} interactive, ${internal} internal links`;
  if (E.length) { failed++; console.log(`✗ ${tag}\n${E.map((e) => '   ERROR ' + e).join('\n')}${W.length ? '\n' + W.map((w) => '   warn  ' + w).join('\n') : ''}`); }
  else { console.log(`✓ ${tag}${W.length ? '\n' + W.map((w) => '   warn  ' + w).join('\n') : ''}`); all[a.slug] = a; }
}

if (checkOnly) process.exit(failed ? 1 : 0);
if (failed && !args.includes('--skip-invalid')) { console.log(`\n${failed} article(s) failed validation — fix them before building.`); process.exit(1); }

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'category'), { recursive: true });
fs.writeFileSync(path.join(OUT, 'blog.js'), JS_SRC);
for (const a of Object.values(all)) fs.writeFileSync(path.join(OUT, `${a.slug}.html`), articlePage(a, all, a._wc));
fs.writeFileSync(path.join(OUT, 'index.html'), indexPage(all));
for (const k of Object.keys(CATS)) if (Object.values(all).some((a) => a.cat === k)) fs.writeFileSync(path.join(OUT, 'category', `${k}.html`), categoryPage(k, all));
writeFeed(all);
writeSitemap(all);
writeLlms(all);
writeHomeTeaser(all);
writeHeaders();
const total = Object.values(all).reduce((n, a) => n + a._wc, 0);
console.log(`\nBuilt ${Object.keys(all).length} articles (${total.toLocaleString('en-US')} words) + index + categories into ${path.relative(process.cwd(), OUT) || OUT}`);
