import Globe from 'globe.gl';
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Mesh,
  MeshPhongMaterial,
  Points,
  PointsMaterial,
  SphereGeometry,
  TextureLoader,
  SRGBColorSpace,
} from 'three';
import { ERAS, AGES, ageOf, formatYear, dataUrl } from './eras.js';
import { loadEra, loadIndex, fmtArea } from './data.js';
import { fetchChronicle } from './wiki.js';
import { createAmbience } from './audio.js';
import { createChronicle } from './chronicle.js';

const TICK_LABELS = new Set([-10000, -3000, -1000, -323, -1, 400, 800, 1200, 1492, 1700, 1815, 1914, 1960, 2024]);
const PLAY_INTERVAL_MS = 5200;
const FACT_INTERVAL_MS = 9000;

const STYLES = {
  satellite: {
    tiles: (x, y, l) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${l}/${y}/${x}`,
    credit: 'Imagery © Esri, Maxar, Earthstar Geographics',
    backdrop: 'earth',
    fill: 0.58,
    stroke: 'rgba(255, 246, 225, 0.55)',
    atmosphere: '#8fb8ff',
  },
  terrain: {
    tiles: (x, y, l) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/${l}/${y}/${x}`,
    maxLevel: 8,
    backdrop: '#c9d4c0',
    credit: 'Relief © Esri, US National Park Service',
    fill: 0.6,
    stroke: 'rgba(40, 30, 20, 0.55)',
    atmosphere: '#a9c8ff',
  },
  atlas: {
    tiles: (x, y, l) => `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/${l}/${y}/${x}`,
    maxLevel: 16,
    backdrop: '#2a2c31',
    credit: 'Basemap © Esri, HERE, Garmin',
    fill: 0.76,
    stroke: 'rgba(255, 250, 240, 0.7)',
    atmosphere: '#e8c98a',
  },
  classic: {
    tiles: null,
    credit: 'NASA Blue Marble',
    fill: 0.52,
    stroke: 'rgba(255, 240, 210, 0.45)',
    atmosphere: '#8fb8ff',
  },
};

const $ = (id) => document.getElementById(id);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const hsla = ([h, s, l], a, dl = 0) => `hsla(${h}, ${s}%, ${clamp(l + dl, 0, 100)}%, ${a})`;
const store = {
  get: (k, d) => localStorage.getItem(`chronoterra.${k}`) ?? d,
  set: (k, v) => localStorage.setItem(`chronoterra.${k}`, v),
};

const state = {
  eraIndex: ERAS.findIndex((e) => e.year === 100),
  data: null,
  index: null,
  hovered: null,
  selected: null,
  showLabels: true,
  playing: false,
  mode: store.get('mode', 'realms'),
  style: store.get('style', 'satellite'),
  baseAltitude: 0.007,
};

const audio = createAmbience();
const era = () => ERAS[state.eraIndex];
const realmColor = (r) => (state.mode === 'empires' ? r.empireHsl : r.hsl);
loadIndex().then((index) => (state.index = index));

// ---------- Globe ----------

performance.mark("t-start");
const globe = new Globe($('globe'), { animateIn: true })
  .backgroundColor('#03040a')
  .atmosphereAltitude(0.2)
  .onGlobeReady(() => document.body.classList.add('globe-ready'))
  .globeOffset([0, 36])
  .polygonsTransitionDuration(450)
  .polygonCapCurvatureResolution(3)
  .polygonGeoJsonGeometry('geometry')
  .polygonLabel(({ __realm: r }) => {
    const lines = [
      r.overlord ? `Subject of ${esc(r.overlord)}` : r.culture ? 'Culture / people' : r.rank ? `#${r.rank} largest realm` : '',
      fmtArea(r.km2),
    ].filter(Boolean);
    return `<div class="tip" style="--c:${hsla(realmColor(r), 1)}"><b>${esc(r.name)}</b><span>${lines.join(' · ')}</span><em>Click to explore · double-click for chronicle</em></div>`;
  })
  .onPolygonHover((f) => setHovered(f ? f.__realm.name : null))
  .onPolygonClick((f) => handleRealmClick(f.__realm.name))
  .onGlobeClick(() => deselect())
  .labelLat('lat')
  .labelLng('lng')
  .labelText('text')
  .labelSize('size')
  .labelColor('color')
  .labelAltitude(0.024)
  .labelResolution(3)
  .labelIncludeDot(false)
  .pointerEventsFilter((obj, d) => !(d && d.__isLabel))
  .pointOfView({ lat: 32, lng: 40, altitude: 2.3 });

const material = globe.globeMaterial();
material.color = new Color('#b8bcc9');
material.specular = new Color('#1c2640');
material.shininess = 14;

// Procedural starfield: crisper than a sky texture at any resolution, and nothing to download.
function addStars(count, size, opacity) {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const tint = new Color();
  for (let i = 0; i < count; i++) {
    const u = Math.random() * 2 - 1;
    const t = Math.random() * Math.PI * 2;
    const r = 20000 + Math.random() * 10000;
    const s = Math.sqrt(1 - u * u);
    pos.set([r * s * Math.cos(t), r * u, r * s * Math.sin(t)], i * 3);
    tint.setHSL(Math.random() < 0.5 ? 0.6 : 0.1, 0.35, 0.75 + Math.random() * 0.25);
    col.set([tint.r, tint.g, tint.b], i * 3);
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(pos, 3));
  geo.setAttribute('color', new Float32BufferAttribute(col, 3));
  const mat = new PointsMaterial({ size, sizeAttenuation: false, vertexColors: true, transparent: true, opacity, depthWrite: false });
  globe.scene().add(new Points(geo, mat));
}
setTimeout(() => document.body.classList.add('globe-ready'), 5000);

// A tiny low-res Earth just beneath the map tiles, so tiles still streaming in never leave black holes.
const backdrop = new Mesh(new SphereGeometry(99.6, 64, 32), new MeshPhongMaterial({ shininess: 6 }));
backdrop.rotation.y = -Math.PI / 2;
new TextureLoader().load('/textures/earth-lowres.jpg', (tex) => {
  tex.colorSpace = SRGBColorSpace;
  backdrop.userData.texture = tex;
  if (STYLES[state.style]?.backdrop === 'earth') backdrop.material.map = tex;
  backdrop.material.needsUpdate = true;
});
globe.scene().add(backdrop);
addStars(7000, 1.1, 0.7);
addStars(900, 2, 0.9);

const controls = globe.controls();
controls.autoRotate = true;
controls.autoRotateSpeed = 0.35;
controls.minDistance = 101.5;
controls.maxDistance = 800;
controls.zoomSpeed = 0.8;
controls.enableDamping = true;

globe.onZoom(({ altitude }) => {
  controls.rotateSpeed = clamp(altitude * 0.45, 0.02, 1);
  controls.autoRotateSpeed = clamp(altitude * 0.16, 0.02, 0.35);
  // Keep realms hugging the surface when zoomed in close, instead of floating above it.
  const base = clamp(altitude * 0.0032, 0.0006, 0.007);
  if (Math.abs(base - state.baseAltitude) / state.baseAltitude > 0.25) {
    state.baseAltitude = base;
    refreshPolygons();
  }
});

$('globe').addEventListener('pointerdown', () => setAutoRotate(false));
window.addEventListener('resize', () => globe.width(innerWidth).height(innerHeight));

function applyStyle(name) {
  state.style = STYLES[name] ? name : 'satellite';
  store.set('style', state.style);
  const s = STYLES[state.style];
  // Only the classic style needs the (large) static textures, so they're never fetched otherwise.
  if (!s.tiles) globe.globeImageUrl('/textures/earth-blue-marble.jpg').bumpImageUrl('/textures/earth-topology.png');
  backdrop.visible = !!s.tiles;
  backdrop.material.map = s.backdrop === 'earth' ? backdrop.userData.texture || null : null;
  backdrop.material.color.set(s.backdrop === 'earth' ? '#ffffff' : s.backdrop || '#000');
  backdrop.material.needsUpdate = true;
  globe.globeTileEngineMaxLevel(s.maxLevel || 17).globeTileEngineUrl(s.tiles).atmosphereColor(s.atmosphere);
  document.body.dataset.style = state.style;
  $('credits').textContent = `${s.credit} · Borders: historical-basemaps, Natural Earth`;
  for (const b of $('style-switch').children) b.classList.toggle('active', b.dataset.style === state.style);
  refreshPolygons();
  refreshLabels();
}

function applyMode(mode) {
  state.mode = mode;
  store.set('mode', mode);
  for (const b of $('mode-switch').children) b.classList.toggle('active', b.dataset.mode === mode);
  refreshPolygons();
  refreshLabels();
  renderPowers();
}

$('style-switch').addEventListener('click', (e) => e.target.dataset.style && applyStyle(e.target.dataset.style));
$('mode-switch').addEventListener('click', (e) => e.target.dataset.mode && applyMode(e.target.dataset.mode));

// ---------- Rendering ----------

function refreshPolygons() {
  if (!state.data) return;
  const { hovered, selected, baseAltitude } = state;
  const s = STYLES[state.style];
  const lordOfSelected = selected && state.data.realms.get(selected)?.overlord;
  const inFocus = (r) => !selected || r.name === selected || r.overlord === selected || r.name === lordOfSelected;

  globe
    .polygonCapColor(({ __realm: r }) => {
      const c = realmColor(r);
      if (r.name === selected) return hsla(c, 0.88, 6);
      if (r.name === hovered) return hsla(c, Math.min(0.9, s.fill + 0.22), 6);
      const a = r.culture ? s.fill * 0.35 : s.fill;
      return hsla(c, inFocus(r) ? a : a * 0.35);
    })
    .polygonSideColor(({ __realm: r }) => hsla(realmColor(r), r.name === selected ? 0.6 : 0.25, -12))
    .polygonStrokeColor(({ __realm: r }) =>
      r.name === selected ? 'rgba(255, 248, 225, 1)' : r.culture ? 'rgba(255, 246, 225, 0.18)' : s.stroke
    )
    .polygonAltitude(({ __realm: r }) =>
      r.name === selected ? baseAltitude * 4 + 0.006 : r.name === hovered ? baseAltitude * 2.4 : baseAltitude * r.lift
    );
}

function refreshLabels() {
  if (!state.data || !state.showLabels) return globe.labelsData([]);
  const modern = era().year >= 1800;
  const color = state.style === 'atlas' ? 'rgba(255, 250, 240, 0.95)' : 'rgba(255, 246, 228, 0.92)';
  const labels = state.data.powers
    .filter((r) => r.name.length <= 30)
    .slice(0, modern ? 40 : 20)
    .map((r) => ({
      __isLabel: true,
      lat: r.lat,
      lng: r.lng,
      text: r.name,
      color: r.name === state.selected ? '#fff4d6' : color,
      size: clamp(Math.sqrt(r.area) * (modern ? 3 : 3.6), modern ? 0.35 : 0.55, 2.4),
    }));
  globe.labelsData(labels);
}

function render(data) {
  state.data = data;
  if (state.selected && !data.realms.has(state.selected)) deselect();
  performance.mark("t-data"); globe.polygonsData(data.features); performance.mark("t-polys");
  refreshPolygons();
  refreshLabels();
  renderPowers();
  if (state.selected) renderInfoStats(data.realms.get(state.selected));
}

let prefetchTimer = null;

function setHovered(name) {
  if (state.hovered === name) return;
  state.hovered = name;
  // Lingering over a realm warms its Wikipedia chronicle so the click opens instantly.
  clearTimeout(prefetchTimer);
  if (name) prefetchTimer = setTimeout(() => fetchChronicle(name, era().year).catch(() => {}), 700);
  refreshPolygons();
  document.querySelectorAll('#powers-list li.hover').forEach((li) => li.classList.remove('hover'));
  if (name) document.querySelector(`#powers-list li[data-name="${CSS.escape(name)}"]`)?.classList.add('hover');
}

// ---------- Powers panel ----------

function renderPowers() {
  const q = $('search').value.trim().toLowerCase();
  const list = $('powers-list');
  const data = state.data;
  const realms = !data
    ? []
    : q
      ? data.ranked.filter((r) => r.name.toLowerCase().includes(q)).slice(0, 50)
      : data.powers.slice(0, 20);
  $('powers-title').textContent = q ? 'Search results' : 'Great powers of the age';
  $('powers-count').textContent = data ? `${data.powers.length} realms` : '';
  const top = realms[0]?.km2 || 1;

  list.innerHTML = realms.length
    ? realms
        .map(
          (r, i) => `<li data-name="${esc(r.name)}" class="${r.name === state.selected ? 'active' : ''}" style="--c:${hsla(realmColor(r), 1)};--d:${i * 18}ms">
            <span class="dot"></span>
            <span class="name">${esc(r.name)}${r.overlord ? `<small>under ${esc(r.overlord)}</small>` : ''}</span>
            <span class="area">${fmtArea(r.km2)}</span>
            <span class="bar" style="width:${Math.max(2, (r.km2 / top) * 100)}%"></span>
          </li>`
        )
        .join('')
    : `<li class="empty">${data ? 'No realm by that name in this era.' : 'Loading…'}</li>`;
}

$('powers-list').addEventListener('click', (e) => {
  const li = e.target.closest('li[data-name]');
  if (li) {
    select(li.dataset.name);
    document.body.classList.remove('powers-open');
  }
});
$('powers-list').addEventListener('mouseover', (e) => {
  const li = e.target.closest('li[data-name]');
  if (li) setHovered(li.dataset.name);
});
$('powers-list').addEventListener('mouseleave', () => setHovered(null));
$('search').addEventListener('input', renderPowers);
$('powers-toggle').addEventListener('click', () => document.body.classList.toggle('powers-open'));

// ---------- Selection, info card & chronicle ----------

let wikiToken = 0;
let lastClick = { name: null, t: 0 };

function handleRealmClick(name) {
  const now = performance.now();
  if (lastClick.name === name && now - lastClick.t < 420) openChronicle(name);
  else select(name);
  lastClick = { name, t: now };
}

function renderInfoStats(realm) {
  $('info-kicker').textContent = `${formatYear(era().year)} · ${ageOf(era().year).name}`;
  const stats = [fmtArea(realm.km2)];
  if (realm.rank) stats.push(`#${realm.rank} of ${state.data.powers.length}`);
  if (realm.overlord) stats.push(`under ${realm.overlord}`);
  const subjects = state.data.subjects.get(realm.name);
  if (subjects?.length) stats.push(`${subjects.length} subject realm${subjects.length > 1 ? 's' : ''}`);
  $('info-stats').innerHTML = stats.map((s) => `<span>${esc(s)}</span>`).join('');
}

async function select(name, { fly = true } = {}) {
  const realm = state.data?.realms.get(name);
  if (!realm) return;
  const changed = state.selected !== name;
  state.selected = name;
  refreshPolygons();
  refreshLabels();
  renderPowers();
  setAutoRotate(false);
  if (changed) audio.chime();

  if (fly) {
    globe.pointOfView({ lat: realm.lat, lng: realm.lng, altitude: clamp(0.35 + Math.sqrt(realm.area) * 2.4, 0.45, 2.6) }, 1400);
  }

  $('info').style.setProperty('--c', hsla(realmColor(realm), 1));
  $('info-name').textContent = name;
  renderInfoStats(realm);
  $('info').classList.add('open');
  if (!changed) return;

  $('info-extract').textContent = 'Consulting the archives…';
  $('info-extract').classList.add('pending');
  $('info-img').classList.remove('show');

  const token = ++wikiToken;
  try {
    const c = await fetchChronicle(name, era().year);
    if (token !== wikiToken) return;
    const text = c?.summary?.extract || c?.sections?.[0]?.text || 'No archival record found for this realm.';
    $('info-extract').textContent = text.length > 420 ? `${text.slice(0, 420).replace(/\s+\S*$/, '')}…` : text;
    const thumb = c?.summary?.thumbnail?.source;
    if (thumb) {
      $('info-img').onload = () => $('info-img').classList.add('show');
      $('info-img').src = thumb;
    }
  } catch {
    if (token === wikiToken) $('info-extract').textContent = 'The archives could not be reached.';
  } finally {
    if (token === wikiToken) $('info-extract').classList.remove('pending');
  }
}

function deselect() {
  if (!state.selected) return;
  state.selected = null;
  wikiToken++;
  $('info').classList.remove('open');
  refreshPolygons();
  refreshLabels();
  renderPowers();
}

const chronicle = createChronicle({
  onJump: (year) => {
    const name = state.selected;
    chronicle.close();
    setEra(ERAS.findIndex((e) => e.year === year)).then(() => name && select(name));
  },
  onOpenRealm: (name) => {
    select(name, { fly: true });
    openChronicle(name);
  },
  onShowOnGlobe: () => state.selected && select(state.selected),
  onClose: () => document.body.classList.remove('chronicle-open'),
});

function openChronicle(name = state.selected) {
  const realm = state.data?.realms.get(name);
  if (!realm) return;
  if (state.selected !== name) select(name);
  setPlaying(false);
  document.body.classList.add('chronicle-open');
  chronicle.open({ realm, era: era(), data: state.data, index: state.index });
}

$('info-close').addEventListener('click', deselect);
$('open-chronicle').addEventListener('click', () => openChronicle());

// ---------- Facts ----------

let factIndex = 0;
let factTimer = null;

function showFact(i) {
  const facts = era().facts;
  factIndex = (i + facts.length) % facts.length;
  const el = $('fact-text');
  el.classList.add('fade');
  setTimeout(() => {
    el.textContent = facts[factIndex];
    el.classList.remove('fade');
  }, 220);
  $('fact-dots').innerHTML = facts.map((_, k) => `<i class="${k === factIndex ? 'on' : ''}"></i>`).join('');
  clearInterval(factTimer);
  factTimer = setInterval(() => showFact(factIndex + 1), FACT_INTERVAL_MS);
}

$('fact-prev').addEventListener('click', () => showFact(factIndex - 1));
$('fact-next').addEventListener('click', () => showFact(factIndex + 1));
$('facts').addEventListener('mouseenter', () => clearInterval(factTimer));
$('facts').addEventListener('mouseleave', () => showFact(factIndex));

// ---------- Timeline ----------

const track = $('track');
const pct = (i) => (i / (ERAS.length - 1)) * 100;

function buildTimeline() {
  $('ticks').innerHTML = ERAS.map((e, i) => {
    const major = TICK_LABELS.has(e.year);
    const label = e.year === -1 ? 'AD 1' : formatYear(e.year).replace('AD ', '');
    return `<div class="tick ${major ? 'major' : ''}" style="left:${pct(i)}%">${major ? `<label>${label}</label>` : ''}</div>`;
  }).join('');

  $('ages').innerHTML = AGES.map((a) => `<button data-age="${a.name}">${a.name}</button>`).join('');
  $('ages').addEventListener('click', (e) => {
    const age = AGES.find((a) => a.name === e.target.dataset.age);
    if (age) setEra(ERAS.findIndex((x) => x.year >= age.from));
  });
}

function showEraUI(i) {
  const e = ERAS[i];
  $('thumb').style.left = `${pct(i)}%`;
  $('track-fill').style.width = `${pct(i)}%`;

  const yearEl = $('era-year');
  if (yearEl.dataset.year !== String(e.year)) {
    yearEl.classList.add('changing');
    setTimeout(() => {
      yearEl.textContent = formatYear(e.year);
      yearEl.dataset.year = e.year;
      yearEl.classList.remove('changing');
    }, 200);
  }
  $('era-caption').textContent = e.caption;
  const age = ageOf(e.year).name;
  $('era-age').textContent = `The ${age} World`;
  for (const b of $('ages').children) b.classList.toggle('active', b.dataset.age === age);
}

const indexFromX = (x) => {
  const r = track.getBoundingClientRect();
  return Math.round(clamp((x - r.left) / r.width, 0, 1) * (ERAS.length - 1));
};

let dragIndex = null;
track.addEventListener('pointerdown', (e) => {
  track.setPointerCapture(e.pointerId);
  track.classList.add('dragging');
  dragIndex = indexFromX(e.clientX);
  showEraUI(dragIndex);
});
track.addEventListener('pointermove', (e) => {
  const i = indexFromX(e.clientX);
  const tip = $('track-tip');
  tip.style.left = `${pct(i)}%`;
  tip.querySelector('b').textContent = formatYear(ERAS[i].year);
  tip.querySelector('span').textContent = ERAS[i].caption;
  tip.classList.add('show');
  if (dragIndex === null) return;
  dragIndex = i;
  showEraUI(i);
});
track.addEventListener('pointerleave', () => $('track-tip').classList.remove('show'));
track.addEventListener('pointerup', () => {
  if (dragIndex === null) return;
  track.classList.remove('dragging');
  const i = dragIndex;
  dragIndex = null;
  setEra(i);
});

let loadToken = 0;

async function setEra(i) {
  i = clamp(i, 0, ERAS.length - 1);
  const changed = i !== state.eraIndex || !state.data;
  state.eraIndex = i;
  showEraUI(i);
  history.replaceState(null, '', `#${ERAS[i].year}`);
  if (changed) {
    audio.setAge(ageOf(ERAS[i].year).name);
    audio.whoosh();
    showFact(0);
  }

  const token = ++loadToken;
  const loaderTimer = setTimeout(() => $('loader').classList.add('show'), 150);
  try {
    const data = await loadEra(ERAS[i].year);
    if (token !== loadToken) return;
    render(data);
    [i + 1, i - 1, i + 2].filter((j) => ERAS[j]).forEach((j) => loadEra(ERAS[j].year).catch(() => {}));
  } catch {
    if (token === loadToken) $('era-caption').textContent = 'These borders could not be loaded — check your connection.';
  } finally {
    clearTimeout(loaderTimer);
    if (token === loadToken) $('loader').classList.remove('show');
  }
  if (token === loadToken && state.playing) schedulePlay();
}

// ---------- Playback & controls ----------

let playTimer = null;

function schedulePlay() {
  clearTimeout(playTimer);
  playTimer = setTimeout(() => {
    if (!state.playing) return;
    if (state.eraIndex >= ERAS.length - 1) return setPlaying(false);
    setEra(state.eraIndex + 1);
  }, PLAY_INTERVAL_MS);
}

function setPlaying(on) {
  state.playing = on;
  $('play').textContent = on ? '❚❚' : '▶';
  $('play').classList.toggle('on', on);
  clearTimeout(playTimer);
  if (on) {
    deselect();
    if (state.eraIndex >= ERAS.length - 1) setEra(0);
    else schedulePlay();
  }
}

function setAutoRotate(on) {
  controls.autoRotate = on;
  $('rotate').classList.toggle('active', on);
}

function setSound(on) {
  if (on) audio.start();
  else audio.setMuted(true);
  $('sound').classList.toggle('on', on);
  store.set('sound', on ? '1' : '0');
}

const zoomBy = (factor) => {
  const pov = globe.pointOfView();
  globe.pointOfView({ ...pov, altitude: clamp(pov.altitude * factor, 0.02, 7) }, 500);
};

const toggleLabels = () => {
  state.showLabels = !state.showLabels;
  $('labels').classList.toggle('active', state.showLabels);
  refreshLabels();
};

$('play').addEventListener('click', () => setPlaying(!state.playing));
$('prev').addEventListener('click', () => setEra(state.eraIndex - 1));
$('next').addEventListener('click', () => setEra(state.eraIndex + 1));
$('zoom-in').addEventListener('click', () => zoomBy(0.55));
$('zoom-out').addEventListener('click', () => zoomBy(1 / 0.55));
$('rotate').addEventListener('click', () => setAutoRotate(!controls.autoRotate));
$('labels').addEventListener('click', toggleLabels);
$('sound').addEventListener('click', () => setSound(!$('sound').classList.contains('on')));
$('help-btn').addEventListener('click', () => $('help').classList.toggle('open'));
$('help').addEventListener('click', () => $('help').classList.remove('open'));

window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') {
    if (e.key === 'Escape') e.target.blur();
    return;
  }
  if (document.body.classList.contains('intro-open')) return;
  const key = e.key.toLowerCase();
  if (e.key === 'Escape') {
    if ($('lightbox').classList.contains('open')) $('lightbox').classList.remove('open');
    else if ($('help').classList.contains('open')) $('help').classList.remove('open');
    else if (chronicle.isOpen) chronicle.close();
    else deselect();
    return;
  }
  if (chronicle.isOpen) return;
  if (e.key === 'ArrowRight') setEra(state.eraIndex + 1);
  else if (e.key === 'ArrowLeft') setEra(state.eraIndex - 1);
  else if (e.key === 'Enter') openChronicle();
  else if (e.key === ' ') {
    e.preventDefault();
    setPlaying(!state.playing);
  } else if (key === 'm') setSound(!$('sound').classList.contains('on'));
  else if (key === 'l') toggleLabels();
  else if (key === 'r') setAutoRotate(!controls.autoRotate);
  else if (e.key === '?') $('help').classList.toggle('open');
  else if (e.key === '/') {
    e.preventDefault();
    document.body.classList.add('powers-open');
    $('search').focus();
  }
});

// ---------- Intro & boot ----------

function enter(withMusic) {
  document.body.classList.remove('intro-open');
  setSound(withMusic);
  setTimeout(() => $('intro').remove(), 1200);
}

$('begin').addEventListener('click', () => enter(true));
$('begin-silent').addEventListener('click', () => enter(false));

const params = new URLSearchParams(location.search);
performance.mark("t-globe"); buildTimeline();
applyStyle(params.get('style') || state.style);
applyMode(params.get('mode') || state.mode);
const fromHash = ERAS.findIndex((e) => String(e.year) === location.hash.slice(1));
if (params.has('skipintro')) enter(false);
// Building hundreds of polygon meshes blocks a frame, so let the page and bare globe paint first.
const afterFirstPaint = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r))));
afterFirstPaint().then(() => setEra(fromHash >= 0 ? fromHash : state.eraIndex)).then(() => {
  const realm = params.get('realm');
  if (!realm) return;
  select(realm);
  if (params.has('chronicle')) loadIndex().then(() => openChronicle(realm));
});

// ---------- Offline cache & background precaching ----------

// Quietly pull every era through the service worker (nearest eras first, two at a time),
// so dragging across the timeline never waits on the network. requestIdleCallback is no use
// here: the globe renders every frame, so the browser never reports itself idle.
function precacheEras() {
  if (navigator.connection?.saveData) return;
  const queue = ERAS.map((e, i) => ({ url: dataUrl(e.year), d: Math.abs(i - state.eraIndex) }))
    .sort((a, b) => a.d - b.d)
    .map((q) => q.url);
  const worker = () => {
    const url = queue.shift();
    if (url) fetch(url, { priority: 'low' }).catch(() => {}).finally(() => setTimeout(worker, 120));
  };
  worker();
  worker();
}

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  (async () => {
    const reg = await navigator.serviceWorker.register('/sw.js').catch(() => null);
    if (!reg) return;
    if (!navigator.serviceWorker.controller) {
      await new Promise((r) => navigator.serviceWorker.addEventListener('controllerchange', r, { once: true }));
    }
    setTimeout(precacheEras, 2500);
  })();
}

window.addEventListener('hashchange', () => {
  const i = ERAS.findIndex((e) => String(e.year) === location.hash.slice(1));
  if (i >= 0 && i !== state.eraIndex) setEra(i);
});
