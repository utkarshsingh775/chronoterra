// Downloads every historical snapshot plus Natural Earth's modern borders (cached in data-cache/),
// then writes compact, lightly simplified TopoJSON per era into public/data, plus index.json
// (realm name -> territory per era) for the chronicle charts.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import mapshaper from 'mapshaper';
import { ERAS, eraKey } from '../src/eras.js';
import { measure, fixWinding, canonicalName, EARTH_KM2_PER_SR } from '../src/geo.js';

const HISTORICAL = (key) =>
  `https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/world_${key}.geojson`;
const NATURAL_EARTH =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson';

const OUT = new URL('../public/data/', import.meta.url);
const CACHE = new URL('../data-cache/', import.meta.url);
// Share of vertices kept. Shared borders are simplified once, so neighbours never gap or overlap.
const SIMPLIFY = '60%';
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

async function download(era) {
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

async function build(era) {
  const key = eraKey(era.year);
  const cached = new URL(`world_${key}.geojson`, CACHE);
  let features;
  if (!FORCE) features = await readFile(cached, 'utf8').then((s) => JSON.parse(s).features, () => null);
  if (!features) {
    features = await download(era);
    await writeFile(cached, JSON.stringify({ type: 'FeatureCollection', features }));
  }
  for (const f of features) f.geometry = fixWinding(f.geometry);

  const out = await mapshaper.applyCommands(
    `-i realms.json -simplify ${SIMPLIFY} keep-shapes -o out.json format=topojson quantization=100000`,
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
for (let i = 0; i < ERAS.length; i += 8) {
  results.push(...(await Promise.all(ERAS.slice(i, i + 8).map(build))));
}

const index = {};
for (const { year, areas } of results) {
  for (const [name, sr] of areas) (index[name] ||= []).push([year, Math.round(sr * EARTH_KM2_PER_SR)]);
}
await writeFile(new URL('index.json', OUT), JSON.stringify(index));
console.log(`✓ index.json — ${Object.keys(index).length} realms`);
