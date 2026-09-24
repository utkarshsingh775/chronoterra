import { ERAS, formatYear, ageOf } from './eras.js';
import { fmtArea } from './data.js';
import { fetchChronicle } from './wiki.js';

const WORLD_LAND_KM2 = 148.9e6;
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const hsl = ([h, s, l], a = 1) => `hsla(${h}, ${s}%, ${l}%, ${a})`;

function chartSvg(series, currentYear, accent) {
  const points = series
    .map(([year, km2]) => ({ year, km2, i: ERAS.findIndex((e) => e.year === year) }))
    .filter((p) => p.i >= 0)
    .sort((a, b) => a.i - b.i);
  if (!points.length) return '<p class="chr-muted">No territorial record for this realm.</p>';

  const W = 1000, H = 210, PAD = 28;
  const lo = Math.max(0, points[0].i - 1);
  const hi = Math.min(ERAS.length - 1, points[points.length - 1].i + 1);
  const span = Math.max(1, hi - lo);
  const max = Math.max(...points.map((p) => p.km2));
  const x = (i) => PAD + ((i - lo) / span) * (W - PAD * 2);
  const y = (km2) => H - PAD - (km2 / max) * (H - PAD * 2);

  const segments = [];
  for (const p of points) {
    const seg = segments[segments.length - 1];
    if (seg && p.i === seg[seg.length - 1].i + 1) seg.push(p);
    else segments.push([p]);
  }
  const paths = segments
    .map((seg) => {
      const line = seg.map((p, k) => `${k ? 'L' : 'M'}${x(p.i).toFixed(1)},${y(p.km2).toFixed(1)}`).join(' ');
      const area = `${line} L${x(seg[seg.length - 1].i).toFixed(1)},${H - PAD} L${x(seg[0].i).toFixed(1)},${H - PAD} Z`;
      return `<path class="chr-area" d="${area}"/><path class="chr-line" d="${line}"/>`;
    })
    .join('');

  const cur = ERAS.findIndex((e) => e.year === currentYear);
  const marker =
    cur >= lo && cur <= hi
      ? `<line class="chr-now" x1="${x(cur)}" x2="${x(cur)}" y1="${PAD - 10}" y2="${H - PAD}"/><text class="chr-now-label" x="${x(cur)}" y="${PAD - 14}">now viewing</text>`
      : '';
  const dots = points
    .map(
      (p) =>
        `<circle class="chr-dot ${p.year === currentYear ? 'current' : ''}" cx="${x(p.i)}" cy="${y(p.km2)}" r="${p.year === currentYear ? 7 : 5}" data-year="${p.year}" data-km2="${p.km2}"/>`
    )
    .join('');
  const labels = [...new Set([points[0], points[points.length - 1]])]
    .map((p) => `<text class="chr-axis" x="${x(p.i)}" y="${H - 6}">${esc(formatYear(p.year))}</text>`)
    .join('');

  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="--accent:${accent}">
    <defs><linearGradient id="chr-grad" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.55"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </linearGradient></defs>
    <line class="chr-base" x1="${PAD}" x2="${W - PAD}" y1="${H - PAD}" y2="${H - PAD}"/>
    ${paths}${marker}${dots}${labels}
  </svg>
  <div class="chr-chart-tip" id="chr-chart-tip"></div>
  <p class="chr-muted">Peak ≈ ${fmtArea(max)} · click any point to travel to that era</p>`;
}

function sectionHtml(section, i) {
  const paragraphs = section.text.slice(0, 9000).split(/\n+/).filter(Boolean);
  const blocks = paragraphs.map((p) =>
    p.length < 70 && !/[.!?]$/.test(p) ? `<h5>${esc(p)}</h5>` : `<p>${esc(p)}</p>`
  );
  const visible = i === 0 ? 4 : 2;
  const more = blocks.length > visible;
  return `<section class="chr-section ${i === 0 ? 'lead' : ''}">
    ${section.title ? `<h3>${esc(section.title)}</h3>` : ''}
    <div class="chr-text">${blocks.slice(0, visible).join('')}${
      more ? `<div class="chr-more">${blocks.slice(visible).join('')}</div>` : ''
    }</div>
    ${more ? '<button class="chr-expand">Continue reading ↓</button>' : ''}
  </section>`;
}

const chips = (realms) =>
  realms
    .map(
      (r) =>
        `<button class="chip" data-realm="${esc(r.name)}"><i style="background:${hsl(r.hsl)}"></i>${esc(r.name)}</button>`
    )
    .join('');

export function createChronicle({ onJump, onOpenRealm, onShowOnGlobe, onClose }) {
  const root = $('chronicle');
  const scroll = $('chronicle-scroll');
  let token = 0;
  let isOpen = false;

  function close() {
    if (!isOpen) return;
    isOpen = false;
    token++;
    root.classList.remove('open');
    root.setAttribute('aria-hidden', 'true');
    onClose?.();
  }

  function open({ realm, era, data, index }) {
    isOpen = true;
    const t = ++token;
    const accent = hsl(realm.hsl);
    const series = index?.[realm.key] || [];
    const years = series.map((s) => s[0]).sort((a, b) => a - b);
    const subjects = data.subjects.get(realm.name) || [];
    const contemporaries = data.powers.filter((r) => r.name !== realm.name).slice(0, 10);
    const share = (realm.km2 / WORLD_LAND_KM2) * 100;

    const stats = [
      ['Territory', fmtArea(realm.km2)],
      ['Share of Earth’s land', share >= 0.1 ? `${share.toFixed(1)}%` : '< 0.1%'],
      realm.rank ? ['Rank this era', `#${realm.rank} of ${data.powers.length}`] : ['Type', 'Culture / people'],
      years.length ? ['On the map', `${formatYear(years[0])} – ${formatYear(years[years.length - 1])}`] : null,
      realm.overlord ? ['Subject of', realm.overlord] : subjects.length ? ['Subject realms', String(subjects.length)] : null,
    ].filter(Boolean);

    scroll.innerHTML = `
      <header class="chr-hero" style="--accent:${accent}">
        <div class="chr-hero-img" id="chr-hero-img"></div>
        <div class="chr-hero-text">
          <div class="chr-kicker">${esc(formatYear(era.year))} · The ${esc(ageOf(era.year).name)} World</div>
          <h1>${esc(realm.name)}</h1>
          <p class="chr-desc" id="chr-desc">${esc(era.caption)}</p>
          <div class="chr-actions">
            <button class="btn-primary" data-act="globe">◎ Show on globe</button>
            <a class="btn-ghost" id="chr-wiki" target="_blank" rel="noopener" hidden>Wikipedia ↗</a>
          </div>
        </div>
      </header>
      <div class="chr-body">
        <div class="chr-stats">${stats.map(([k, v]) => `<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div>
        <section class="chr-card chr-chart"><h4>Territory across time</h4>${chartSvg(series, era.year, accent)}</section>
        <div class="chr-columns">
          <article class="chr-article" id="chr-article">
            <div class="chr-skeleton"><i></i><i></i><i></i><i></i><i></i></div>
          </article>
          <aside class="chr-side">
            <div class="chr-card chr-facts" id="chr-facts"><h4>✦ Did you know?</h4><div class="chr-skeleton"><i></i><i></i><i></i></div></div>
            <div class="chr-card"><h4>The world in ${esc(formatYear(era.year))}</h4><ul class="chr-era-facts">${era.facts
              .map((f) => `<li>${esc(f)}</li>`)
              .join('')}</ul></div>
            ${subjects.length ? `<div class="chr-card"><h4>Subject realms</h4><div class="chips">${chips(subjects.slice(0, 16))}</div></div>` : ''}
            <div class="chr-card"><h4>Contemporaries</h4><div class="chips">${chips(contemporaries)}</div></div>
          </aside>
        </div>
        <section class="chr-gallery-wrap" id="chr-gallery-wrap" hidden><h4>Gallery</h4><div class="chr-gallery" id="chr-gallery"></div></section>
        <footer class="chr-footer">Text and images from Wikipedia (CC BY-SA). Borders from the historical-basemaps project and Natural Earth.</footer>
      </div>`;

    scroll.scrollTop = 0;
    root.classList.add('open');
    root.setAttribute('aria-hidden', 'false');

    fetchChronicle(realm.name, era.year)
      .then((c) => {
        if (t !== token) return;
        const article = $('chr-article');
        if (!c || !c.sections.length) {
          article.innerHTML = '<p class="chr-muted">The archives hold no detailed record of this realm.</p>';
          $('chr-facts').remove();
          return;
        }
        const img = c.summary?.originalimage?.source || c.summary?.thumbnail?.source;
        if (img) {
          const pre = new Image();
          pre.onload = () => {
            if (t !== token) return;
            $('chr-hero-img').style.backgroundImage = `url("${img}")`;
            $('chr-hero-img').classList.add('loaded');
          };
          pre.src = img;
        }
        if (c.summary?.description) $('chr-desc').textContent = c.summary.description;
        $('chr-wiki').href = c.url;
        $('chr-wiki').hidden = false;

        const heading = c.title !== realm.name ? `<div class="chr-source">From the article <em>${esc(c.title)}</em></div>` : '';
        article.innerHTML = heading + c.sections.slice(0, 9).map(sectionHtml).join('');

        $('chr-facts').innerHTML = c.facts.length
          ? `<h4>✦ Did you know?</h4><ol>${c.facts.map((f) => `<li>${esc(f)}</li>`).join('')}</ol>`
          : '';
        if (!c.facts.length) $('chr-facts').remove();

        if (c.gallery.length) {
          $('chr-gallery').innerHTML = c.gallery
            .map((g) => `<figure data-src="${esc(g.src)}" data-caption="${esc(g.caption)}"><img loading="lazy" src="${esc(g.src)}" alt=""/></figure>`)
            .join('');
          $('chr-gallery-wrap').hidden = false;
        }
      })
      .catch(() => {
        if (t !== token) return;
        $('chr-article').innerHTML = '<p class="chr-muted">The archives could not be reached. Check your connection and try again.</p>';
      });
  }

  scroll.addEventListener('click', (e) => {
    const expand = e.target.closest('.chr-expand');
    if (expand) {
      const section = expand.closest('.chr-section');
      section.classList.toggle('expanded');
      expand.textContent = section.classList.contains('expanded') ? 'Show less ↑' : 'Continue reading ↓';
      return;
    }
    const chip = e.target.closest('[data-realm]');
    if (chip) return onOpenRealm(chip.dataset.realm);
    const dot = e.target.closest('.chr-dot');
    if (dot) return onJump(Number(dot.dataset.year));
    if (e.target.closest('[data-act="globe"]')) {
      close();
      return onShowOnGlobe?.();
    }
    const fig = e.target.closest('figure[data-src]');
    if (fig) {
      $('lightbox-img').src = fig.dataset.src;
      $('lightbox-caption').textContent = fig.dataset.caption;
      $('lightbox').classList.add('open');
    }
  });

  scroll.addEventListener('mouseover', (e) => {
    const dot = e.target.closest('.chr-dot');
    const tip = $('chr-chart-tip');
    if (!tip) return;
    if (!dot) return tip.classList.remove('show');
    const box = dot.closest('.chr-chart').getBoundingClientRect();
    const r = dot.getBoundingClientRect();
    tip.innerHTML = `<b>${esc(formatYear(Number(dot.dataset.year)))}</b>${fmtArea(Number(dot.dataset.km2))}`;
    tip.style.left = `${r.left - box.left + r.width / 2}px`;
    tip.style.top = `${r.top - box.top}px`;
    tip.classList.add('show');
  });

  $('chronicle-close').addEventListener('click', close);
  $('lightbox').addEventListener('click', () => $('lightbox').classList.remove('open'));

  return {
    open,
    close,
    get isOpen() {
      return isOpen;
    },
  };
}
