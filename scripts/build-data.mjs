// Downloads every historical snapshot plus Natural Earth's modern borders (cached in data-cache/),
// then writes compact, lightly simplified TopoJSON per era into public/data, plus index.json
// (realm name -> territory per era) for the chronicle charts.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import mapshaper from 'mapshaper';
import { ERAS, eraKey } from '../src/eras.js';
import { measure, fixWinding, canonicalName, EARTH_KM2_PER_SR } from '../src/geo.js';

const HISTORICAL = (key) =>
  `https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/world_${key}.geojson`;
// India's point of view: all of Jammu & Kashmir, Ladakh (incl. Aksai Chin) and Arunachal Pradesh within India,
// as required for maps published in India. Natural Earth only ships point-of-view files at 10m.
const NATURAL_EARTH =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries_ind.geojson';
// Snapshots from this year on show the Republic of India; its outline is replaced with the official one.
const INDIA_FROM = 1945;

const OUT = new URL('../public/data/', import.meta.url);
const CACHE = new URL('../data-cache/', import.meta.url);
// Share of vertices kept. Shared borders are simplified once, so neighbours never gap or overlap.
// The 10m modern file has ~20x the detail of the historical snapshots, so it keeps far fewer.
const SIMPLIFY = (era) => (era.source === 'naturalearth' ? '5%' : era.kind === 'paleo' ? '12%' : '60%');
const round = (c) => (typeof c[0] === 'number' ? [+c[0].toFixed(3), +c[1].toFixed(3)] : c.map(round));

// Natural Earth names that differ from the historical dataset's modern snapshots.
const ALIASES = { 'United States of America': 'United States', Czechia: 'Czech Republic' };
const FORCE = process.argv.includes('--force');

const neName = (short, long) => ALIASES[short] || (short.includes('.') && long ? long : short);

function fromNaturalEarth(p) {
  return {
    NAME: neName(p.NAME, p.NAME_LONG),
    SUBJECTO: p.SOVEREIGNT !== p.ADMIN ? ALIASES[p.SOVEREIGNT] || p.SOVEREIGNT : null,
    PARTOF: null,
  };
}

// Real plate reconstructions from the GPlates Web Service (EarthByte), Merdith et al. 2021 model.
// The service returns unnamed coastline polygons, so every piece is labelled with the era's landmass.
const GPLATES = (ma) => `https://gws.gplates.org/reconstruct/coastlines/?time=${ma}&model=merdith2021`;

async function downloadPaleo(era) {
  const ma = Math.round(Math.abs(era.year) / 1e6);
  const res = await fetch(GPLATES(ma));
  if (!res.ok) throw new Error(`GPlates ${ma}Ma: HTTP ${res.status}`);
  const geo = await res.json();
  return geo.features
    .filter((f) => f.geometry)
    .map((f) => ({
      type: 'Feature',
      properties: { NAME: era.land, SUBJECTO: null, PARTOF: null },
      geometry: { type: f.geometry.type, coordinates: round(f.geometry.coordinates) },
    }));
}

async function download(era) {
  if (era.kind === 'paleo') return downloadPaleo(era);
  const url = era.source === 'naturalearth' ? NATURAL_EARTH : HISTORICAL(eraKey(era.year));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  const geo = await res.json();
  return geo.features
    .map((f) => {
      const p = era.source === 'naturalearth' ? fromNaturalEarth(f.properties) : f.properties;
      const name = p.NAME?.trim();
      if (!name || !f.geometry) return null;
      return {
        type: 'Feature',
        properties: { NAME: name, SUBJECTO: p.SUBJECTO?.trim() || null, PARTOF: p.PARTOF?.trim() || null },
        geometry: { type: f.geometry.type, coordinates: round(f.geometry.coordinates) },
      };
    })
    .filter(Boolean);
}

const cacheFile = (era) => new URL(era.source === 'naturalearth' ? 'world_today_india_view.geojson' : `world_${eraKey(era.year)}.geojson`, CACHE);
const isMapped = (era) => era.kind !== 'cosmic';

async function loadFeatures(era) {
  const cached = cacheFile(era);
  let features;
  if (!FORCE) features = await readFile(cached, 'utf8').then((s) => JSON.parse(s).features, () => null);
  if (!features) {
    features = await download(era);
    await writeFile(cached, JSON.stringify({ type: 'FeatureCollection', features }));
  }
  return features;
}

let indiaOutline;
const officialIndia = async () =>
  (indiaOutline ||= loadFeatures(ERAS.find((e) => e.source === 'naturalearth')).then((fs) => fs.find((f) => f.properties.NAME === 'India')));

// Swap the snapshot's India for the official outline and cut that outline out of every neighbour.
async function withOfficialIndia(features) {
  const india = await officialIndia();
  const out = await mapshaper.applyCommands(
    `-i realms.json india.json combine-files -filter 'NAME != "India"' target=realms -erase india target=realms ` +
      `-merge-layers target=realms,india force name=realms -filter-slivers -o out.json format=geojson`,
    { 'realms.json': { type: 'FeatureCollection', features }, 'india.json': { type: 'FeatureCollection', features: [india] } }
  );
  return JSON.parse(out['out.json']).features.filter((f) => f.geometry);
}

async function build(era) {
  const key = eraKey(era.year);
  let features = await loadFeatures(era);
  if (era.source !== 'naturalearth' && era.year >= INDIA_FROM && features.some((f) => f.properties.NAME === 'India')) {
    features = await withOfficialIndia(features);
  }
  for (const f of features) f.geometry = fixWinding(f.geometry);

  const out = await mapshaper.applyCommands(
    `-i realms.json -simplify ${SIMPLIFY(era)} keep-shapes -o out.json format=topojson quantization=100000`,
    { 'realms.json': { type: 'FeatureCollection', features } }
  );
  await writeFile(new URL(`world_${key}.topo.json`, OUT), out['out.json']);

  const areas = new Map();
  for (const f of features) {
    const { area } = measure(f);
    const name = canonicalName(f.properties.NAME);
    areas.set(name, (areas.get(name) || 0) + area);
  }
  console.log(`✓ ${key.padEnd(10)} ${features.length} features`);
  return { year: era.year, areas };
}

await mkdir(OUT, { recursive: true });
await mkdir(CACHE, { recursive: true });
const results = [];
const MAPPED = ERAS.filter(isMapped);
for (let i = 0; i < MAPPED.length; i += 8) {
  results.push(...(await Promise.all(MAPPED.slice(i, i + 8).map(build))));
}

const index = {};
for (const { year, areas } of results) {
  for (const [name, sr] of areas) (index[name] ||= []).push([year, Math.round(sr * EARTH_KM2_PER_SR)]);
}
await writeFile(new URL('index.json', OUT), JSON.stringify(index));
console.log(`✓ index.json — ${Object.keys(index).length} realms`);
