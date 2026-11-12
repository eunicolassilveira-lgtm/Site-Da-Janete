// O mundo: o escuro do fundo e a faixa contínua do jardim (do canteiro ao breu), fixos atrás do conteúdo.
// O scroll da página vira uma posição Y no mundo por uma curva monotônica que casa o centro de cada seção
// com o foco dela no cenário (cena.js). Assim o cenário nunca descola das seções, seja qual for a altura do
// conteúdo, e anda mais devagar que o texto (profundidade).
// Camadas: fundo (0,14), faixa (1) com o frasco e o fio de luz, pólen (canvas, várias profundidades),
// primeiro plano desfocado (1,35–1,8). Tudo por transform; a única suavização é o Lenis.
import { SRC_W, SEG_H, BAND, SEGMENTOS, STRIP_H, FOCO, DECOR, FIO, MARCOS, SEMENTE } from './cena.js';
const FRASCO = SEMENTE;
import ROTULOS from './rotulos.json';

const F_FUNDO = 0.14;
const GLOW_Y = 0.62; // onde fica a névoa clara na imagem do fundo (fração da altura)

export function createWorld({ reduced = false } = {}) {
  const $ = (s) => document.querySelector(s);
  const fundoL = $('.world__fundo'), stripL = $('.world__strip'), decorL = $('.world__decor');
  const fundoImg = fundoL.querySelector('img');
  const strip = stripL.querySelector('[data-strip]');
  const marks = $('.world__marks');
  const shade = $('.world__shade');
  let lastFx = -1, lastD = -1, frame = 0;
  const COBRE = '.glass, .scrim, .h2, .lede, .eyebrow, .slider, .caso, .estrutura, .sobre__foto, .spec, .final__btns, .foot__cols, .hero__cta, .hero__title, .nav, .wa';

  // ---------- montagem da faixa ----------
  strip.style.width = SRC_W + 'px';
  strip.style.height = STRIP_H + 'px';
  const fadeIn = (img) => {
    img.addEventListener('load', () => img.decode().catch(() => {}).then(() => img.classList.add('is-on')), { once: true });
  };
  const segs = SEGMENTOS.map((s, i) => {
    const img = new Image();
    img.decoding = 'async';
    img.alt = '';
    img.className = 'seg' + (i ? ' seg--emenda' : '');
    img.style.top = s.top + 'px';
    img.style.setProperty('--band', BAND * 0.92 + 'px');
    img.dataset.src = s.src;
    fadeIn(img);
    if (i === 0) img.src = s.src; // o canteiro vem já (pré-carregado no HTML)
    strip.appendChild(img);
    return { el: img, top: s.top, loaded: i === 0, shown: true };
  });

  // no monte de musgo, onde a raiz começa: um ponto de luz que respira (a semente do fio)
  const brilho = document.createElement('i');
  brilho.className = 'brilho';
  brilho.style.cssText = `left:${FRASCO.cx - 520}px; top:${FRASCO.base - 470}px; width:1040px; height:700px;`;
  const semente = document.createElement('div');
  semente.className = 'semente-mundo';
  semente.style.cssText = `left:${FRASCO.cx}px; top:${FRASCO.base - 6}px;`;
  semente.innerHTML = '<i></i>';
  strip.append(brilho, semente);
  const frImg = semente;

  // fio de luz (a raiz principal) em coordenadas da faixa
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'fio');
  svg.setAttribute('viewBox', `0 0 ${SRC_W} ${STRIP_H}`);
  svg.setAttribute('width', SRC_W);
  svg.setAttribute('height', STRIP_H);
  const d = catmull(FIO);
  const paths = ['fio__halo', 'fio__meio', 'fio__nucleo'].map((c) => {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    p.setAttribute('class', c);
    svg.appendChild(p);
    return p;
  });
  strip.appendChild(svg);
  const path = paths[2];
  const total = path.getTotalLength();
  const LUT = [];
  for (let i = 0; i <= 800; i++) {
    const l = (total * i) / 800;
    const p = path.getPointAtLength(l);
    LUT.push({ l, x: p.x, y: p.y });
  }
  paths.forEach((p) => { p.style.strokeDasharray = `${total} ${total}`; p.style.strokeDashoffset = total; });

  // sementes de luz ao longo do fio + marcos das notas + a cabeça (o vagalume)
  const nodes = [];
  for (let l = 220; l < total - 120; l += 300) {
    const p = path.getPointAtLength(l);
    const el = document.createElement('i');
    el.className = 'mk-semente';
    marks.appendChild(el);
    nodes.push({ el, x: p.x, y: p.y, l, on: false });
  }
  const pins = MARCOS.map((m) => {
    const p = pointAtY(m.y);
    const el = document.createElement('div');
    el.className = 'mk-marco';
    el.innerHTML = `<i></i><span>${m.nome}</span>`;
    marks.appendChild(el);
    return { el, x: p.x, y: m.y, n: m.n, on: false };
  });
  // legendas da anatomia: um ponto na estrutura, uma linha fina e o nome; acendem quando o fio passa
  const rotulos = ROTULOS.map((r) => {
    const el = document.createElement('div');
    el.className = `mk-rotulo mk-rotulo--${r.lado}`;
    el.innerHTML = `<i></i><b></b><span>${r.nome}</span>`;
    marks.appendChild(el);
    return { ...r, el, on: false, em: r.em ?? r.y };
  });
  const head = document.createElement('div');
  head.className = 'mk-vagalume';
  head.innerHTML = '<i></i>';
  marks.appendChild(head);

  // primeiro plano
  const decor = DECOR.map((o) => {
    const img = new Image();
    img.decoding = 'async';
    img.alt = '';
    img.className = 'decor' + (o.flip ? ' decor--flip' : '');
    img.dataset.src = `/img/d-${o.img}.webp`;
    if (o.blur) img.style.filter = `blur(${o.blur}px)`;
    fadeIn(img);
    // as plantas da frente do hero vêm já, com as primeiras imagens: a entrada as revela junto com o jardim
    if (o.at === 0) img.src = img.dataset.src;
    decorL.appendChild(img);
    return { ...o, el: img, loaded: o.at === 0 };
  });

  // ---------- geometria ----------
  const state = { vw: 0, vh: 0, k: 1, x: 0, Y: 0, Ypx: 0, sy: 0, mobile: false, mouse: { x: 0, y: 0 } };
  let vw = 0, vh = 0, k = 1, stripW = 0, baseTop = 0, mobile = false, fundoTop = 0;
  let anchors = [];
  let lastKey = '';
  const intro = { fundo: 0, strip: 0, fio: 1 }; // deslocamentos da entrada (px de tela); fio: 0 → 1 libera o fio
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

  function measure() {
    vw = document.documentElement.clientWidth;
    vh = window.innerHeight;
    mobile = vw < 760;
    stripW = mobile ? Math.max(vw, vh * 1.55) : Math.max(vw * 1.02, vh * 1.3);
    k = stripW / SRC_W;
    // a base do frasco fica a 74% da altura (66% no celular, onde o título precisa de mais ar em cima)
    baseTop = vh * (mobile ? 0.655 : 0.745) - FRASCO.base * k;

    // fundo: cobre a tela com folga, a névoa clara atrás do frasco
    const fH = Math.max(vh * 1.3, (stripW * SEG_H) / SRC_W);
    const fW = Math.max((fH * SRC_W) / SEG_H, vw * 1.06);
    fundoImg.style.width = fW + 'px';
    fundoImg.style.height = (fW * SEG_H) / SRC_W + 'px';
    fundoImg.style.left = (vw - fW) / 2 + 'px';
    fundoTop = baseTop + (FRASCO.base - 60) * k - GLOW_Y * ((fW * SEG_H) / SRC_W);

    paths[0].style.strokeWidth = 16 / k;
    paths[1].style.strokeWidth = 5 / k;
    paths[2].style.strokeWidth = 1.6 / k;

    decor.forEach((o) => { o.el.style.width = o.w * k + 'px'; });

    // âncoras: centro da seção ↔ foco no mundo
    const toY = (focus) => focus - (vh / 2 - baseTop) / k;
    const maxS = Math.max(document.documentElement.scrollHeight - vh, 1);
    const yEnd = STRIP_H - (vh - baseTop) / k;
    const list = [{ s: 0, y: 0 }];
    document.querySelectorAll('[data-scene]').forEach((sec) => {
      const f = FOCO[sec.dataset.scene];
      if (f == null) return;
      const r = sec.getBoundingClientRect();
      const s = r.top + window.scrollY + r.height / 2 - vh / 2;
      list.push({ s, y: Math.min(toY(f), yEnd) });
    });
    list.push({ s: maxS, y: yEnd });
    anchors = [];
    for (const a of list) {
      const prev = anchors[anchors.length - 1];
      if (prev && (a.s <= prev.s + 1 || a.y < prev.y)) {
        if (a.s > prev.s + 1) anchors.push({ s: a.s, y: prev.y });
        continue;
      }
      anchors.push({ ...a });
    }
    tangents(anchors);
    Object.assign(state, { vw, vh, k, mobile });
    lastKey = '';
  }

  // Fritsch–Carlson: curva monotônica e suave entre as âncoras (sem quina de velocidade)
  function tangents(a) {
    const n = a.length;
    const dl = [];
    for (let i = 0; i < n - 1; i++) dl.push((a[i + 1].y - a[i].y) / (a[i + 1].s - a[i].s));
    for (let i = 0; i < n; i++) {
      if (i === 0) a[i].m = dl[0];
      else if (i === n - 1) a[i].m = dl[n - 2];
      else a[i].m = dl[i - 1] * dl[i] <= 0 ? 0 : (dl[i - 1] + dl[i]) / 2;
    }
    for (let i = 0; i < n - 1; i++) {
      if (dl[i] === 0) { a[i].m = 0; a[i + 1].m = 0; continue; }
      const al = a[i].m / dl[i], be = a[i + 1].m / dl[i];
      const h = al * al + be * be;
      if (h > 9) { const t = 3 / Math.sqrt(h); a[i].m = t * al * dl[i]; a[i + 1].m = t * be * dl[i]; }
    }
  }
  function worldY(s) {
    const a = anchors;
    if (s <= a[0].s) return a[0].y;
    if (s >= a[a.length - 1].s) return a[a.length - 1].y;
    let i = 0;
    while (s > a[i + 1].s) i++;
    const h = a[i + 1].s - a[i].s, t = (s - a[i].s) / h;
    const t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * a[i].y + (t3 - 2 * t2 + t) * h * a[i].m + (-2 * t3 + 3 * t2) * a[i + 1].y + (t3 - t2) * h * a[i + 1].m;
  }
  function lutAtY(y) {
    if (y <= LUT[0].y) return 0;
    let lo = 0, hi = LUT.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (LUT[mid].y <= y) lo = mid; else hi = mid - 1; }
    return lo;
  }
  function pointAtY(y) {
    if (y <= FIO[0][1]) return { x: FIO[0][0], y };
    for (let i = 1; i < FIO.length; i++) {
      if (FIO[i][1] >= y) {
        const [x0, y0] = FIO[i - 1], [x1, y1] = FIO[i];
        return { x: x0 + ((x1 - x0) * (y - y0)) / (y1 - y0 || 1), y };
      }
    }
    return { x: FIO[FIO.length - 1][0], y };
  }

  // ---------- carregamento ----------
  // imagem que chega depois aparece num fade, nunca de estalo (as do hero chegam antes da entrada)
  function load(o) {
    if (o.loaded) return;
    o.loaded = true;
    o.el.src = o.el.dataset.src;
  }
  function loadAll() {
    segs.forEach(load);
    decor.forEach(load);
  }

  // ---------- quadro ----------
  const ss = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
  function render(force = false) {
    const s = window.scrollY;
    const key = `${s}|${intro.fundo}|${intro.strip}|${intro.fio}|${mouse.x.toFixed(3)}|${mouse.y.toFixed(3)}`;
    if (!force && key === lastKey) return;
    lastKey = key;
    const Y = worldY(s);
    const Ypx = Y * k;
    const mx = mouse.x, my = mouse.y; // -1..1, só no desktop

    // câmera horizontal: no celular, depois do hero, o fio vai para a margem direita (o texto fica livre)
    const yCenter = Y + (vh / 2 - baseTop) / k;
    let x = (vw - stripW) / 2;
    if (mobile) {
      const t = ss(vh * 0.28, vh * 0.85, s);
      const fx = pointAtY(yCenter).x;
      const target = vw - 22 - fx * k;
      x = Math.min(0, Math.max(vw - stripW, x + (target - x) * t));
    }

    // fundo só enquanto aparece acima do jardim
    const fundoOn = Ypx < vh * 1.6;
    fundoL.style.visibility = fundoOn ? '' : 'hidden';
    if (fundoOn) {
      fundoImg.style.transform = `translate3d(${(-mx * 8).toFixed(2)}px, ${(fundoTop - Ypx * F_FUNDO + intro.fundo - my * 5).toFixed(2)}px, 0)`;
    }
    const sx = x - mx * 16, sy = baseTop - Ypx + intro.strip - my * 7;
    strip.style.transform = `translate3d(${sx.toFixed(2)}px, ${sy.toFixed(2)}px, 0) scale(${k})`;
    // a semente cede um pouco mais ao mouse que o jardim
    frImg.style.transform = `translate3d(${(-mx * 5).toFixed(2)}px, ${(-my * 2).toFixed(2)}px, 0)`;

    for (const g of segs) {
      const top = sy + g.top * k, bot = top + SEG_H * k;
      const on = bot > -vh * 0.5 && top < vh * 1.5;
      if (on !== g.shown) { g.shown = on; g.el.style.visibility = on ? '' : 'hidden'; }
    }

    // fio: aceso até a altura de 64% da tela (a cabeça é o vagalume)
    const headY = (Y + (vh * 0.64 - baseTop) / k) * intro.fio + FIO[0][1] * (1 - intro.fio);
    const li = lutAtY(headY);
    const L = Math.min(LUT[li].l, total);
    const off = (total - L).toFixed(1);
    for (const p of paths) p.style.strokeDashoffset = off;
    const toScreen = (px, py) => [sx + px * k, sy + py * k];
    if (L > 2) {
      const hp = LUT[li];
      const [hx, hy] = toScreen(hp.x, hp.y);
      head.style.transform = `translate3d(${hx.toFixed(1)}px, ${hy.toFixed(1)}px, 0)`;
      head.classList.toggle('is-on', L < total - 4);
    } else head.classList.remove('is-on');
    for (const nd of nodes) {
      const on = L >= nd.l;
      if (on !== nd.on) { nd.on = on; nd.el.classList.toggle('is-on', on); }
      const [nx, ny] = toScreen(nd.x, nd.y);
      nd.el.style.transform = `translate3d(${nx.toFixed(1)}px, ${ny.toFixed(1)}px, 0)`;
    }
    for (const p of pins) {
      const on = headY >= p.y;
      if (on !== p.on) {
        p.on = on;
        p.el.classList.toggle('is-on', on);
        document.querySelector(`[data-nota="${p.n}"]`)?.classList.toggle('is-lit', on);
      }
      const [px, py] = toScreen(p.x, p.y);
      p.el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
    }

    for (const r of rotulos) {
      const on = headY >= r.em;
      if (on !== r.on) { r.on = on; r.el.classList.toggle('is-on', on); }
      const [rx, ry] = toScreen(r.x, r.y);
      const vis = ry > -80 && ry < vh + 80;
      r.el.style.visibility = vis ? '' : 'hidden';
      if (vis) r.el.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0)`;
    }
    // primeiro plano: anda f vezes o chão, alinhado no Y "at"
    for (const o of decor) {
      if (mobile && o.mobile === false) { o.el.style.visibility = 'hidden'; continue; }
      const h = o.el.naturalHeight ? (o.el.naturalHeight / o.el.naturalWidth) * o.w : o.w * 0.8;
      const at = o.at ?? o.y + h / 2 - (vh / 2 - baseTop) / k;
      const yy = baseTop + (o.y - Y) * k - (o.f - 1) * (Y - at) * k + intro.strip * o.f;
      const xx = x + o.x * k - mx * 22 * o.f;
      const on = yy < vh + 60 && yy + h * k > -60;
      o.el.style.visibility = on ? '' : 'hidden';
      if (on) o.el.style.transform = `translate3d(${xx.toFixed(1)}px, ${yy.toFixed(1)}px, 0)`;
    }
    // sombra lateral: escurece onde fica o texto e deixa o corredor do fio aceso
    const fxs = Math.round(((sx + pointAtY(yCenter).x * k) / vw) * 200) / 2;
    const dk = Math.round(ss(vh * 0.25, vh * 0.9, Ypx) * 50) / 50;
    if (fxs !== lastFx) { lastFx = fxs; shade.style.setProperty('--fx', fxs + '%'); }
    if (dk !== lastD) { lastD = dk; shade.style.setProperty('--d', dk); }
    Object.assign(state, { x: sx, sy, Y, Ypx });
    state.mouse.x = mx; state.mouse.y = my;
  }

  // ponteiro: o mundo cede alguns pixels ao mouse (desktop), por mola no ticker
  function onPointer(e) {
    if (mobile || e.pointerType === 'touch') return;
    mouse.tx = (e.clientX / vw) * 2 - 1;
    mouse.ty = (e.clientY / vh) * 2 - 1;
  }
  // a legenda some quando um cartão ou texto da página está por cima dela (só aparece onde a tela está livre)
  function cover() {
    for (const r of rotulos) {
      if (!r.on || r.el.style.visibility === 'hidden') continue;
      const span = r.el.querySelector('span').getBoundingClientRect();
      const cy = span.top + span.height / 2;
      const pts = [[span.left + 4, cy], [span.right - 4, cy], [(span.left + span.right) / 2, cy]];
      const coberto = pts.some(([px, py]) => px > 0 && py > 0 && px < vw && py < vh && document.elementsFromPoint(px, py).some((e) => e.closest(COBRE)));
      if (coberto !== r.coberto) { r.coberto = coberto; r.el.classList.toggle('is-coberto', coberto); }
    }
  }
  function tick() {
    if (++frame % 10 === 0) cover();
    if (!reduced) {
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      if (Math.abs(mouse.tx - mouse.x) < 0.0005) mouse.x = mouse.tx;
      if (Math.abs(mouse.ty - mouse.y) < 0.0005) mouse.y = mouse.ty;
    }
    render();
  }

  measure();
  render(true);
  window.addEventListener('pointermove', onPointer, { passive: true });
  let rz;
  window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => { measure(); render(true); }); });
  new ResizeObserver(() => { measure(); render(true); }).observe(document.querySelector('main'));

  return { tick, measure, render, loadAll, intro, state, firstImages: [fundoImg, segs[0].el, ...decor.filter((o) => o.at === 0).map((o) => o.el)], debug: () => ({ anchors, k, baseTop, stripW }) };
}

// caminho suave (Catmull-Rom → Bézier) pelos pontos do fio
function catmull(pts) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0]},${p2[1]}`;
  }
  return d;
}
