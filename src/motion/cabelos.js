// Os cabelos do topo, vivos, no formato das ilustrações de tricologia: poucos fios grandes, pretos e
// brilhantes, cada um saindo da pele numa curva longa e lisa (como uma foice), grosso na base e terminando numa
// ponta bem fina, com volume de cilindro (sombra, reflexo e luz de contorno). Atrás, alguns fios menores.
// Desenhados num canvas nas mesmas coordenadas da faixa do world.js (acompanham o scroll e a profundidade).
// Cada fio é uma mola: balança devagar e, quando o mouse (ou o dedo) passa perto, é empurrado para o lado do
// movimento, como uma mão passando no cabelo, e volta aos poucos.
const TOPO = 712, CX = 836, SRC_W = 1672;
const surf = (x) => TOPO + 0.00011 * (x - CX) ** 2;
const slope = (x) => 0.00022 * (x - CX);
const SEG = 28;
import FOLS from './foliculos.json';
const RAD = Math.PI / 180;

function rng(seed) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export function cabelos(world, { reduced = false } = {}) {
  const cv = document.querySelector('[data-cabelos]');
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, dpr = 1, fios = [], cleared = false, mobile = null;

  function criar() {
    const R = rng(20261111);
    const rr = (a, b) => a + R() * (b - a);
    mobile = window.innerWidth < 760;
    fios = [];
    const fio = (o) => fios.push({ th: 0, v: 0, fase: rr(0, 6.28), ...o });
    // fios pequenos, atrás (curtos, finos, mais apagados)
    const nP = mobile ? 34 : 80;
    for (let i = 0; i < nP; i++) {
      const x = rr(-40, SRC_W + 40);
      if (FOLS.some((F) => Math.abs(x - F.x) < 40)) continue;
      const lado = R() < 0.5 ? -1 : 1;
      fio({ cam: 0, x, L: rr(110, 280), w: rr(6, 9.5), base: Math.atan(slope(x)) + rr(-0.25, 0.25), curva: lado * rr(0.35, 0.95), k: rr(14, 20), tom: 0.6 });
    }
    // fios médios: completam a cabeça inteira entre os grandes, no mesmo formato de foice
    const nM = mobile ? 22 : 52;
    for (let i = 0; i < nM; i++) {
      const x = (SRC_W + 120) * ((i + R()) / nM) - 60;
      if (FOLS.some((F) => Math.abs(x - F.x) < 36)) continue;
      const fora = Math.sign(x - 836) || 1;
      const lado = R() < 0.65 ? fora : -fora;
      fio({ cam: 0, x, L: rr(330, 600), w: rr(10, 17), base: Math.atan(slope(x)) * 1.1 + rr(-0.2, 0.2) - lado * 0.06, curva: lado * rr(0.85, 1.5), k: rr(6, 10), tom: rr(0.8, 0.95) });
    }
    // fios grandes: um para cada folículo do cenário, saindo do poro na mesma direção da raiz (fio e raiz são
    // uma peça contínua) e curvando para o mesmo lado em que já saem inclinados
    for (const F of FOLS) {
      const dir = F.a < -1 ? -1 : F.a > 1 ? 1 : (R() < 0.5 ? -1 : 1);
      fio({
        cam: F.blur >= 8 ? 0 : 1, x: F.x, w: F.w, base: F.a * RAD,
        L: (F.central ? 760 : rr(560, 720)) * F.s,
        curva: dir * (F.central ? 1.25 : rr(1.0, 1.45)),
        k: F.central ? 4.5 : rr(5, 8), tom: F.blur >= 8 ? 0.5 : F.blur >= 4 ? 0.8 : 1, central: F.central,
      });
    }
    fios.forEach((f) => { f.y = surf(f.x) + 4; });
  }

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
  }
  criar();
  size();
  let rz;
  window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { size(); if ((window.innerWidth < 760) !== mobile) criar(); }, 120); });

  // ponteiro: posição e velocidade (px por quadro, suavizada)
  const p = { x: -9999, y: -9999, vx: 0, vy: 0, lx: null, ly: null, ativo: false };
  const mover = (x, y) => {
    if (p.lx != null) { p.vx += (x - p.lx - p.vx) * 0.5; p.vy += (y - p.ly - p.vy) * 0.5; }
    p.lx = x; p.ly = y; p.x = x; p.y = y; p.ativo = true;
  };
  window.addEventListener('pointermove', (e) => mover(e.clientX, e.clientY), { passive: true });
  window.addEventListener('touchmove', (e) => { const t = e.touches[0]; if (t) mover(t.clientX, t.clientY); }, { passive: true });
  window.addEventListener('touchstart', (e) => { const t = e.touches[0]; if (t) { p.lx = t.clientX; p.ly = t.clientY; mover(t.clientX, t.clientY); } }, { passive: true });
  const sair = () => { p.ativo = false; p.lx = null; p.ly = null; };
  document.addEventListener('pointerleave', sair);
  window.addEventListener('touchend', sair);
  window.addEventListener('blur', sair);

  // geometria: a linha central faz uma curva lisa (a curvatura cresce para a ponta), meia largura afinando
  const cx = new Float32Array(SEG + 1), cy = new Float32Array(SEG + 1), nx = new Float32Array(SEG + 1), ny = new Float32Array(SEG + 1), hw = new Float32Array(SEG + 1);
  function geometria(f, sx, sy, k) {
    let x = sx + f.x * k, y = sy + f.y * k;
    const seg = (f.L * k) / SEG, w0 = (f.w * k) / 2;
    for (let i = 0; i <= SEG; i++) {
      const u = i / SEG;
      const a = f.base + f.curva * Math.pow(u, 1.45) + f.th * Math.pow(u, 1.2);
      if (i > 0) { x += Math.sin(a) * seg; y -= Math.cos(a) * seg; }
      cx[i] = x; cy[i] = y; nx[i] = Math.cos(a); ny[i] = Math.sin(a);
      // grosso na base, afina devagar e termina numa ponta bem fina
      hw[i] = w0 * Math.pow(1 - u, 0.75) * (1 - 0.12 * u) + 0.25;
    }
  }
  // faixa entre duas posições ao longo da largura (−1 = um lado, 1 = o outro), de "de" até "ate" no comprimento
  function faixa(path, a0, a1, de = 0, ate = SEG) {
    path.moveTo(cx[de] + nx[de] * hw[de] * a0, cy[de] + ny[de] * hw[de] * a0);
    for (let i = de + 1; i <= ate; i++) path.lineTo(cx[i] + nx[i] * hw[i] * a0, cy[i] + ny[i] * hw[i] * a0);
    for (let i = ate; i >= de; i--) path.lineTo(cx[i] + nx[i] * hw[i] * a1, cy[i] + ny[i] * hw[i] * a1);
    path.closePath();
  }
  // um gradiente da raiz até a ponta (para o brilho nascer e sumir ao longo do fio)
  function aoLongo(a, cor) {
    const g = ctx.createLinearGradient(cx[0], cy[0], cx[SEG], cy[SEG]);
    g.addColorStop(0, `rgba(${cor}, 0)`);
    g.addColorStop(0.12, `rgba(${cor}, ${a})`);
    g.addColorStop(0.62, `rgba(${cor}, ${a})`);
    g.addColorStop(0.92, `rgba(${cor}, 0)`);
    return g;
  }
  function desenhar(f, sx, sy, k) {
    geometria(f, sx, sy, k);
    const t = f.tom;
    // corpo preto
    const c = new Path2D(); faixa(c, -1, 1);
    ctx.fillStyle = t < 1 ? 'rgba(14, 10, 9, 0.85)' : '#090605';
    ctx.fill(c);
    // volume: um cinza quente largo do lado da luz, e o reflexo estreito e claro
    const s1 = new Path2D(); faixa(s1, -0.78, -0.05);
    ctx.fillStyle = aoLongo((0.22 * t).toFixed(3), '120, 108, 102'); ctx.fill(s1);
    const s2 = new Path2D(); faixa(s2, -0.56, -0.3, 1, SEG - 3);
    ctx.fillStyle = aoLongo((0.5 * t).toFixed(3), '236, 230, 224'); ctx.fill(s2);
    // luz fria de contorno do outro lado (o cenário tem a luz atrás)
    const r = new Path2D(); faixa(r, 0.72, 0.95, 1, SEG - 2);
    ctx.fillStyle = aoLongo(((f.central ? 0.6 : 0.26) * t).toFixed(3), '210, 240, 234'); ctx.fill(r);
  }

  let last = performance.now(), t = 0;
  function draw(now = performance.now()) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now; t += dt;
    const { x: sx, sy, k } = world.state;
    if (!k || sy + TOPO * k < -60) {
      if (!cleared) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); cleared = true; }
      return;
    }
    cleared = false;
    p.vx *= 0.9; p.vy *= 0.9;
    const raio = Math.max(150, 240 * k);

    if (!reduced) {
      for (const f of fios) {
        const vento = 0.045 * Math.sin(t * 0.6 + f.x * 0.005 + f.fase * 0.2) + 0.018 * Math.sin(t * 1.4 + f.x * 0.017 + f.fase);
        let forca = 0;
        if (p.ativo) {
          const rx = sx + f.x * k, ry = sy + f.y * k, L = f.L * k;
          let dmin = 1e9, dxp = 0, qx = rx, qy = ry;
          // percorre o fio e acha o ponto mais perto do ponteiro
          for (let i = 1; i <= 8; i++) {
            const u = i / 8, a = f.base + f.curva * Math.pow(u, 1.45) + f.th * Math.pow(u, 1.2);
            qx += Math.sin(a) * L / 8; qy -= Math.cos(a) * L / 8;
            const d = Math.hypot(p.x - qx, p.y - qy);
            if (d < dmin) { dmin = d; dxp = qx - p.x; }
          }
          if (dmin < raio) {
            const inf = (1 - dmin / raio) ** 2;
            forca = inf * (p.vx * 0.14 + Math.sign(dxp) * 1.8 + Math.abs(p.vy) * 0.04 * Math.sign(dxp));
          }
        }
        const acc = -f.k * (f.th - vento) - 2.6 * f.v + forca * (f.cam ? 24 : 34);
        f.v += acc * dt;
        f.th += f.v * dt;
        if (f.th > 0.9) { f.th = 0.9; f.v *= -0.3; } else if (f.th < -0.9) { f.th = -0.9; f.v *= -0.3; }
      }
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    for (const f of fios) if (f.cam === 0) desenhar(f, sx, sy, k);
    for (const f of fios) if (f.cam === 1 && !f.central) desenhar(f, sx, sy, k);
    desenhar(fios.find((f) => f.central), sx, sy, k);
  }

  return { draw, size };
}
