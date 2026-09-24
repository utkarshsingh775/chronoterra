const API = 'https://en.wikipedia.org/w/api.php?format=json&origin=*&';
const REST = 'https://en.wikipedia.org/api/rest_v1/page/';
const POLITY_RE = /empire|kingdom|dynasty|sultanate|caliphate|khanate|republic|confederacy|state|civilization|culture|history|principality|duchy|polity|shogunate/i;
const SKIP_SECTIONS = /^(see also|references|notes|further reading|external links|bibliography|sources|citations|footnotes|gallery|explanatory notes)$/i;
const SUPERLATIVE_RE = /\b(largest|first|oldest|greatest|longest|richest|most|biggest|earliest|only)\b/i;
const NOTABLE_RE = /\b(founded|capital|population|peak|famous|renowned|known as|invented|built|remains|conquered|golden age)\b/i;

// Names the dataset uses that Wikipedia search resolves to the wrong article.
const OVERRIDES = {
  Rome: (y) => (y < -27 ? 'Roman Republic' : 'Roman Empire'),
  'Greek city-states': () => 'Ancient Greece',
  Qin: () => 'Qin dynasty',
  Zhou: () => 'Zhou dynasty',
  'Zhou states': () => 'Zhou dynasty',
  Shang: () => 'Shang dynasty',
  Song: () => 'Song dynasty',
  Tang: () => 'Tang dynasty',
  Ming: () => 'Ming dynasty',
  Sui: () => 'Sui dynasty',
  Egypt: (y) => (y < 640 ? 'Ancient Egypt' : 'Egypt'),
  Assyria: () => 'Neo-Assyrian Empire',
  Carthage: () => 'Ancient Carthage',
};

const json = (url) => fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))));
const cache = new Map();

async function findTitle(name, year) {
  if (OVERRIDES[name]) return OVERRIDES[name](year);
  const q = await json(`${API}action=query&list=search&srlimit=6&srsearch=${encodeURIComponent(name)}`);
  const results = q.query?.search || [];
  if (!results.length) return null;
  const exact = results.find((r) => r.title.toLowerCase() === name.toLowerCase());
  // For pre-modern eras a bare name ("Rome", "Han") usually means the city or people, not the polity.
  if (year < 1800 && !POLITY_RE.test(name)) {
    const polity = results.find((r) => POLITY_RE.test(r.title) && r.title.toLowerCase().includes(name.toLowerCase().split(' ')[0]));
    if (polity) return polity.title;
  }
  return (exact || results[0]).title;
}

function parseSections(text) {
  const parts = text.split(/\n(={2,})\s*(.+?)\s*\1\n/);
  const sections = [{ title: null, level: 2, text: parts[0].trim() }];
  for (let i = 1; i < parts.length; i += 3) {
    sections.push({ title: parts[i + 1], level: parts[i].length, text: parts[i + 2].trim() });
  }
  const merged = [];
  for (const s of sections) {
    if (s.level > 2 && merged.length) {
      if (s.text) merged[merged.length - 1].text += `\n\n${s.title}\n${s.text}`;
    } else merged.push({ ...s });
  }
  return merged.filter((s) => s.text.length > 80 && !(s.title && SKIP_SECTIONS.test(s.title)));
}

const score = (s) => (SUPERLATIVE_RE.test(s) ? 3 : 0) + (NOTABLE_RE.test(s) ? 1 : 0) + (/\b\d{3,4}\b/.test(s) ? 1 : 0);

// The most "fact-like" sentence from each section, so facts span the whole article.
function extractFacts(sections) {
  const facts = [];
  for (const s of sections) {
    let best = null;
    for (const paragraph of s.text.split(/\n+/)) {
      if (paragraph.length < 80) continue;
      for (const raw of paragraph.match(/[^.!?]+[.!?]+(?=\s|$)/g) || []) {
        const sentence = raw.trim();
        if (sentence.length < 70 || sentence.length > 230 || !/^[A-Z]/.test(sentence) || /\(\s*[,;]?\s*\)/.test(sentence)) continue;
        const sc = score(sentence);
        if (sc >= 3 && (!best || sc > best.sc)) best = { sentence, sc };
      }
    }
    if (best) facts.push(best.sentence);
    if (facts.length >= 5) break;
  }
  return facts;
}

async function loadGallery(title) {
  try {
    const media = await json(`${REST}media-list/${encodeURIComponent(title)}`);
    return (media.items || [])
      .filter((m) => m.type === 'image' && m.showInGallery && m.srcset?.length)
      .map((m) => ({
        src: `https:${m.srcset[m.srcset.length - 1].src}`,
        caption: m.caption?.text || m.title.replace(/^File:|\.\w+$/g, '').replace(/_/g, ' '),
      }))
      .slice(0, 12);
  } catch {
    return [];
  }
}

export function fetchChronicle(name, year) {
  const key = `${name}|${year < 1800}`;
  if (!cache.has(key)) {
    const p = (async () => {
      const title = await findTitle(name, year);
      if (!title) return null;
      const [summary, full, gallery] = await Promise.all([
        json(`${REST}summary/${encodeURIComponent(title)}`).catch(() => null),
        json(`${API}action=query&prop=extracts&explaintext=1&exsectionformat=wiki&redirects=1&titles=${encodeURIComponent(title)}`),
        loadGallery(title),
      ]);
      const page = Object.values(full.query?.pages || {})[0];
      const sections = parseSections(page?.extract || '');
      return {
        title,
        summary,
        sections,
        facts: extractFacts(sections.slice(1)),
        gallery,
        url: summary?.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
      };
    })();
    p.catch(() => cache.delete(key));
    cache.set(key, p);
  }
  return cache.get(key);
}
