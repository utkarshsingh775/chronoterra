import { geoDistance } from 'd3-geo';
import { feature } from 'topojson-client';
import { dataUrl } from './eras.js';
import { measure, fixWinding, canonicalName, EARTH_KM2_PER_SR } from './geo.js';

const CULTURE_RE =
  /hunter|gatherer|forag|fisher|fichers|nomad|pastoral|farmers|peoples|cultures?\b|tribes|aboriginal|siberians|khoisan|saami|touareg|shellfish|bison|marine mammal/i;

// Jewel-toned palette, ordered so consecutive entries contrast.
export const PALETTE = [
  [4, 74, 60], [195, 78, 56], [45, 92, 58], [285, 52, 64], [140, 48, 50], [24, 88, 58],
  [220, 72, 64], [85, 55, 50], [330, 62, 64], [170, 62, 44], [255, 58, 70], [60, 70, 66],
  [355, 55, 72], [110, 36, 62], [205, 40, 72], [15, 48, 50],
];

const hash = (str) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
};

export const fmtArea = (km2) =>
  km2 >= 1e6 ? `${(km2 / 1e6).toFixed(1)}M km²` : km2 >= 1e3 ? `${Math.round(km2 / 1e3)}K km²` : `${Math.round(km2)} km²`;

// Each realm keeps its preferred colour across eras unless a neighbour already wears it.
function assignColors(ranked) {
  const placed = [];
  for (const r of ranked) {
    r.radius = Math.sqrt(r.area / Math.PI);
    if (r.culture) {
      r.hsl = [hash(r.name) % 360, 16, 62];
      continue;
    }
    const taken = new Set();
    for (const o of placed) {
      if (geoDistance([r.lng, r.lat], [o.lng, o.lat]) < (r.radius + o.radius) * 1.4 + 0.03) taken.add(o.colorIndex);
    }
    const preferred = hash(r.name) % PALETTE.length;
    let idx = preferred;
    for (let k = 0; k < PALETTE.length; k++) {
      const c = (preferred + k) % PALETTE.length;
      if (!taken.has(c)) {
        idx = c;
        break;
      }
    }
    r.colorIndex = idx;
    r.hsl = PALETTE[idx];
    placed.push(r);
  }

  for (const r of ranked) {
    const lord = r.overlord && ranked.find((o) => o.name === r.overlord);
    const [h, s, l] = lord ? lord.hsl : r.hsl;
    r.empireHsl = lord ? [h, Math.max(28, s - 18), Math.min(80, l + 12)] : r.hsl;
  }
}

function processEra(topo) {
  const realms = new Map();
  const features = feature(topo, topo.objects.realms).features.filter((f) => f.geometry);

  for (const f of features) {
    const p = f.properties;
    const name = p.NAME;
    const overlord = p.SUBJECTO && p.SUBJECTO !== name ? p.SUBJECTO : null;
    f.geometry = fixWinding(f.geometry);
    const m = measure(f);
    f.__area = m.area;

    let realm = realms.get(name);
    if (!realm) {
      realm = {
        ...m,
        name,
        key: canonicalName(name),
        overlord,
        partOf: p.PARTOF && p.PARTOF !== name ? p.PARTOF : null,
        area: 0,
        largest: f,
      };
      realms.set(name, realm);
    }
    realm.area += m.area;
    if (m.area > realm.largest.__area) {
      realm.largest = f;
      realm.lat = m.lat;
      realm.lng = m.lng;
    }
    f.__realm = realm;
  }

  const ranked = [...realms.values()].sort((a, b) => b.area - a.area);
  for (const r of ranked) {
    r.km2 = r.area * EARTH_KM2_PER_SR;
    // SUBJECTO often just repeats the nation's short name ("Russian Empire" -> "Russia"); only real overlords count.
    if (r.overlord && !realms.has(r.overlord)) r.overlord = null;
    r.culture = !r.overlord && CULTURE_RE.test(r.name);
  }
  assignColors(ranked);
  // Smaller realms sit slightly higher so overlapping polygons never z-fight and enclaves stay visible.
  ranked.forEach((r, i) => (r.lift = 1 + (i / ranked.length) * 0.6));

  const states = ranked.filter((r) => !r.culture);
  const powers = states.length >= 5 ? states : ranked;
  powers.forEach((r, i) => (r.rank = i + 1));
  const subjects = new Map();
  for (const r of ranked) if (r.overlord) subjects.set(r.overlord, [...(subjects.get(r.overlord) || []), r]);

  return { features, realms, ranked, powers, subjects };
}

const cache = new Map();

export function loadEra(year) {
  if (!cache.has(year)) {
    const p = fetch(dataUrl(year))
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(processEra);
    p.catch(() => cache.delete(year));
    cache.set(year, p);
  }
  return cache.get(year);
}

let indexPromise;
export const loadIndex = () => (indexPromise ||= fetch('/data/index.json').then((r) => r.json()));
