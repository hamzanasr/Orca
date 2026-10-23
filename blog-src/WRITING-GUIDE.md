# دليل كتابة مقالات مدونة أوركا (للكتّاب والوكلاء)

You are writing Arabic articles for the blog of **ORCA (أوركا)**, a yacht and boat booking business in Jeddah, Saudi Arabia (bookorca.com). Each article is one JSON file that `build.mjs` turns into an interactive page. Paths below are relative to the repo folder `repo/`.

## Read first (required)
1. `blog-src/BOAT-PAGES.md` — verbatim text of every boat page; the most authoritative source (prices per group size, extras, deposits, inclusions).
1. `blog-src/FACTS.md` — summary of ORCA facts (its top section on per-person rules overrides the rest); the ONLY source for ORCA prices, capacities, marinas, booking and ID rules. Never invent ORCA facts.
2. `blog-src/topics.json` — all 100 article slugs, titles, target keywords and angles. Use it to link to sibling articles and to stay inside your topic's scope.
3. `blog-src/articles/bayada-trip-price.json` — the gold-standard example. Match its depth, structure, tone and interactivity.
4. `blog-src/fleet.json` — valid boat slugs for `/boats/<slug>` links and `boats` blocks.

## Goal
Rank in Google for real Saudi search intent AND get quoted by AI answer engines (Google AI Overviews, ChatGPT, Perplexity) — while being genuinely useful so the reader keeps reading and then books on WhatsApp.

## Audience and voice
- Saudi families, groups of friends, couples and visitors planning a sea trip in Jeddah; many are first-timers.
- Clear Modern Standard Arabic that reads naturally to Saudis. Light Saudi/Hijazi phrasing is welcome in a few headings, picker labels and FAQ questions where people actually search that way (e.g. "وش ألبس في رحلة البحر؟", "كم تكلف…"), but body text stays clean MSA.
- Practical, warm, confident. Talk to the reader ("أنت"). Short paragraphs (2–4 sentences). No fluff, no filler intros like "في هذا المقال سوف نتعرف"، no clichés like "تجربة لا تُنسى" repeated, no exaggeration.
- Western digits (1,300 not ١٣٠٠). Currency: "ريال" in prose, "ر.س" in tables/compact spots.

## SEO + GEO rules (non-negotiable)
- `title` (H1): matches the topic title in topics.json (you may polish wording, keep the keyword).
- `seoTitle`: ≤ 65 chars INCLUDING the ending " | أوركا". Put the main keyword first. Add "2026" when the topic is prices/timely.
- `description`: 110–165 chars, contains the keyword + a concrete fact/number + a reason to click.
- `summary` (rendered as "الجواب المختصر"): 40–75 words, a complete self-contained direct answer to the title question with concrete numbers. This is what AI engines quote. Name the subject explicitly (no "هي"/"هذا" without antecedent).
- `takeaways`: 3–5 bullet facts, each standalone and specific.
- Sections: 6–9 sections. H2s phrased as the questions people search (كم/كيف/ما/متى/أين/هل/أيهما) or clear topic labels. Every section's FIRST block is a `p` whose first 1–2 sentences directly answer the H2 (definition-first, ~40 words, liftable out of context).
- Use the topic's `kw` naturally in the H1, first paragraph, at least two H2s and the FAQ — never stuff. Include close variants and dialect spellings people search (بياضة/البياضة، ابو طير/أبو طير، يخت/يخوت، تأجير/استئجار).
- Facts beat adjectives: durations, prices (from FACTS.md), capacities, steps, months, distances only if verified.
- `faq`: 5–8 real questions people ask (include long-tail and conversational ones). Each answer 35–80 words, first sentence answers directly, self-contained.
- Length: 1,500–2,300 words total (the validator counts; minimum 1,100 is an error, under 1,400 a warning).

## Interactivity (keeps readers on the page)
Every article needs **at least 2 interactive blocks** (checklist, quiz, picker, calc) plus visual blocks (table, compare, steps, timeline, reveal, stats, callout). Aim for a rhythm: never more than 3 plain paragraphs in a row without a list, table, callout or widget. Pick widgets that genuinely fit the topic:
- `checklist` for preparation topics; `quiz` (3–5 questions) for safety/knowledge; `picker` ("اختر وضعك") for decisions; `calc` for anything about cost, group size or duration; `timeline` for itineraries/plans; `reveal` for catalogs (fish types, creatures, mistakes); `compare` for options.
- Put one `cta` block mid-article or near the end (1 per article, max 2), phrased around the reader's next step for this topic.

## JSON format
File: `blog-src/articles/<slug>.json`, UTF-8, valid JSON (double quotes; use Arabic quotes « » or escaped \" inside strings; no trailing commas).

```json
{
  "slug": "same-as-topics-json-and-file-name",
  "cat": "category key from topics.json",
  "title": "…", "seoTitle": "… | أوركا", "description": "…",
  "kw": ["primary keyword", "variant", "variant", "long tail"],
  "image": "images/<folder>/<file>.webp",       // optional; a real file that exists (ls Orca/images). Default = first boat's photo
  "imageAlt": "Arabic description of what the photo actually shows",
  "published": "2026-10-23",
  "summary": "…", "takeaways": ["…"],
  "boats": ["boat-slug", "…"],                    // 0–4 boats shown as cards at the end; from topics.json suggestion or better fit
  "related": ["article-slug", "…"],               // 4–6 sibling articles from topics.json (not itself)
  "wa": "prefilled WhatsApp message in Arabic about this topic",
  "sections": [ { "id": "latin-kebab-id", "h2": "…", "blocks": [ … ] } ],
  "faq": [ { "q": "…", "a": "…" } ]
}
```

Inline text in every text field supports only `**bold**` and `[label](url)`. No HTML.

### Block types
```json
{ "t": "p", "text": "…" }
{ "t": "h3", "text": "…" }
{ "t": "ul", "items": ["…", "…"] }            // also "ol"
{ "t": "callout", "v": "tip|warn|info|fact", "title": "optional", "text": "…" }
{ "t": "table", "caption": "…", "head": ["…","…"], "rows": [["…","…"],["…","…"]] }   // every row same length as head; first cell is the row label
{ "t": "steps", "items": [ { "title": "…", "text": "…" } ] }        // 3+
{ "t": "timeline", "items": [ { "time": "7:00 ص", "title": "…", "text": "…" } ] }   // 3+
{ "t": "stats", "items": [ { "value": "6 ساعات", "label": "…" } ] }  // facts only, 2–4 items
{ "t": "compare", "items": [ { "title": "…", "points": ["…"], "fit": "لمن يناسب", "best": true, "badge": "optional label" } ] }
{ "t": "reveal", "items": [ { "title": "…", "teaser": "one line", "text": "…" } ] }   // expandable cards
{ "t": "quote", "text": "a key sentence to highlight (NOT a testimonial)" }
{ "t": "boats", "slugs": ["qimat-al-fawz", "al-jawhari"] }          // inline boat cards with photo + price
{ "t": "cta", "text": "…", "button": "optional label", "wa": "optional custom WhatsApp text" }
{ "t": "checklist", "id": "latin-id", "title": "…", "intro": "optional", "groups": [ { "name": "…", "items": ["…", "…"] } ] }
{ "t": "quiz", "title": "optional", "questions": [ { "q": "…", "options": ["…","…","…"], "answer": 1, "explain": "…" } ] }   // answer = 0-based index; 3–5 questions; vary the correct index
{ "t": "picker", "title": "…", "question": "optional", "options": [ { "label": "short choice", "result": "recommendation with [links](/boats/x)" } ] }
{ "t": "calc", "kind": "split", "title": "optional", "people": 6, "presets": [ { "label": "قمة الفوز", "price": 1300, "max": 9, "incl": 6, "extra": 100 }, { "label": "الجوهري", "price": 1880, "max": 11, "tiers": [[6,1880],[11,2080]] }, { "label": "مثال مبلغ ثابت", "price": 4000, "max": 30, "flat": true } ] }  // every preset MUST carry the boat's people rule from BOAT-PAGES.md (incl+extra, tiers, or flat:true); the calculator then computes the real total for the chosen group size
{ "t": "calc", "kind": "hours", "presets": [ { "label": "قمة الفوز", "rate": 350, "half": 200 } ], "people": 6 }   // hourly creek cost
{ "t": "calc", "kind": "boats", "trip": "bayada|abuTair|creek|fishing", "people": 8 }   // live fleet finder by group size (uses real prices)
{ "t": "calc", "kind": "seats", "people": 4, "boatPrice": 1300, "boatCap": 9, "boatIncl": 6, "boatExtra": 100 }   // shared seats vs private boat
```
Calc presets must use real prices from FACTS.md.

## Links (internal linking builds topical authority)
- 8+ internal links per article inside the text: to sibling articles `/blog/<slug>` (only slugs in topics.json; prefer same category + the category pillar) and to boat pages `/boats/<slug>`. Also allowed: `/#calculator`, `/#packages`, `/terms`, `/blog/`, `/blog/category/<cat>`.
- Anchor text must be descriptive (the target's topic), never "اضغط هنا".
- Do not explain in depth what a sibling article covers — summarise in 1–2 sentences and link to it. This avoids duplicate content.
- External links: at most 1–3 per article, only to authoritative sources you actually checked (e.g. ncm.gov.sa, mewa.gov.sa, moi.gov.sa, visitsaudi.com, who.int, noaa.gov, wikipedia). Never link to competitors.

## Truth rules (the site must stay trustworthy)
- ORCA prices, capacities, marinas, policies: ONLY from FACTS.md. Computed per-person figures are fine (show the math).
- Never invent: customer counts, ratings, reviews, testimonials, awards, staff names, "our captains have 20 years", partnerships, services ORCA does not list (no scuba courses, no jet-ski rental, no catering menus, no hotel pickup), exact distances/travel times, exact water temperatures, regulations, fines or species protections you have not verified.
- General knowledge about Jeddah, the Red Sea, fishing, snorkeling, weather, safety and health: use WebSearch to verify anything specific. If not verifiable, write it as general guidance ("عادة"، "غالباً"، "تقريباً") or leave it out. For health topics (pregnancy, babies, seasickness medicine, stings) give general safety tips and tell readers to consult a doctor/pharmacist; never dose medication.
- Regulations (Border Guard, fishing rules): describe what FACTS.md says + general principles; for anything else, point to the official authority instead of inventing rules.
- Weather cancellations: there is no published refund policy for weather — say the captain decides if sailing is safe and readers should coordinate a new date with the ORCA team. Do not promise refunds.
- Prices are "as of October 2026" and final confirmation is via WhatsApp.

## Workflow per article
1. Re-read the topic entry in topics.json (slug, cat, kw, angle, boats).
2. Research anything non-ORCA you plan to state as fact (WebSearch, standard mode; batch searches).
3. Write `blog-src/articles/<slug>.json`.
4. Validate: run `node blog-src/build.mjs --check blog-src/articles/<slug>.json` from the `repo/` folder. Fix every ERROR. Read the warnings: fix short FAQ answers; for "price X is not an ORCA price" warnings, make sure the number is either a correct computed example or remove it.
5. Re-read your Arabic once for grammar, repetition and flow before moving on.

Do not run the full build (no arguments) and do not edit any file other than your own article JSON files.
