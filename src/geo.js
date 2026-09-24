import { geoArea, geoCentroid } from 'd3-geo';

export const EARTH_KM2_PER_SR = 6371 * 6371;

// Names the snapshots use for the same state at different times, merged for the territory index.
const SAME_REALM = {
  Rome: 'Roman Empire',
  'Roman Republic': 'Roman Empire',
  'Rome (Constantinus)': 'Roman Empire',
  'Rome (Diocletianus)': 'Roman Empire',
  'Rome (Galerius)': 'Roman Empire',
  'Rome (Maximian)': 'Roman Empire',
  'Western Roman Empire': 'Roman Empire',
  'Eastern Roman Empire': 'Byzantine Empire',
  'Ottoman Sultanate': 'Ottoman Empire',
  'Manchu Empire': 'Qing Empire',
  Burma: 'Myanmar',
  Byelarus: 'Belarus',
  'Ivory Coast': "Côte d'Ivoire",
  Swaziland: 'eSwatini',
  Macedonia: 'North Macedonia',
  "Korea, Democratic People's Republic of": 'North Korea',
  'Korea, Republic of': 'South Korea',
  'Tanzania, United Republic of': 'Tanzania',
  'Gambia, The': 'Gambia',
  'United States of America': 'United States',
  Zaire: 'Democratic Republic of the Congo',
};

export const canonicalName = (name) => SAME_REALM[name] || name;

// d3 (and the globe's polygon triangulation, which relies on d3's containment test) treats a
// clockwise ring as "the whole sphere minus this shape". Many source polygons are wound that way,
// which makes them vanish on the globe, so each polygon part is re-wound when it covers > half the sphere.
function rewindPolygon(rings) {
  return geoArea({ type: 'Polygon', coordinates: rings }) > 2 * Math.PI ? rings.map((r) => [...r].reverse()) : rings;
}

export function fixWinding(geometry) {
  if (geometry.type === 'Polygon') return { type: 'Polygon', coordinates: rewindPolygon(geometry.coordinates) };
  if (geometry.type === 'MultiPolygon') return { type: 'MultiPolygon', coordinates: geometry.coordinates.map(rewindPolygon) };
  return geometry;
}

export function measure(feature) {
  const area = geoArea(feature);
  const [lng, lat] = geoCentroid(feature);
  return { area, lat, lng };
}
