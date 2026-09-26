// Asserts that the built eras show India's official borders: Jammu & Kashmir, Ladakh
// (including Aksai Chin), Siachen and Arunachal Pradesh inside India, and that no neighbour
// still overlaps them. Run with `npm run check` after `npm run data`.
import { readFile } from 'node:fs/promises';
import { geoContains } from 'd3-geo';
import { feature } from 'topojson-client';
import { ERAS, eraKey } from '../src/eras.js';

const DATA = new URL('../public/data/', import.meta.url);

// Places that other datasets commonly assign to Pakistan or China.
const CLAIMS = {
  Gilgit: [74.31, 35.92],
  Muzaffarabad: [73.47, 34.37],
  Srinagar: [74.8, 34.08],
  Leh: [77.58, 34.16],
  'Aksai Chin': [79.3, 35.2],
  Siachen: [77.1, 35.4],
  Tawang: [91.86, 27.59],
  Itanagar: [93.6, 27.08],
};
// Sanity checks that the erase step did not eat into the neighbours.
const NEIGHBOURS = { Lahore: [74.35, 31.55], Kathmandu: [85.3, 27.7], Dhaka: [90.4, 23.8] };

const INDIA_FROM = 1945;
let failures = 0;

for (const era of ERAS.filter((e) => e.kind !== 'cosmic' && e.year >= INDIA_FROM)) {
  const key = eraKey(era.year);
  const topo = JSON.parse(await readFile(new URL(`world_${key}.topo.json`, DATA), 'utf8'));
  const features = feature(topo, topo.objects.realms).features.filter((f) => f.geometry);
  const owners = (point) => features.filter((f) => geoContains(f, point)).map((f) => f.properties.NAME);

  const problems = [];
  for (const [place, point] of Object.entries(CLAIMS)) {
    const hits = owners(point);
    if (hits.length !== 1 || hits[0] !== 'India') problems.push(`${place} -> ${hits.join(' + ') || 'nobody'}`);
  }
  for (const [place, point] of Object.entries(NEIGHBOURS)) {
    const hits = owners(point);
    if (hits.length !== 1 || hits[0] === 'India') problems.push(`${place} -> ${hits.join(' + ') || 'nobody'}`);
  }

  if (problems.length) {
    failures++;
    console.error(`✗ ${key}: ${problems.join(', ')}`);
  } else {
    console.log(`✓ ${key}`);
  }
}

if (failures) {
  console.error(`\n${failures} era(s) do not match India's official map.`);
  process.exit(1);
}
console.log('\nAll eras from 1945 show India’s official borders, with no overlapping neighbours.');
