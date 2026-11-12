// O cenário do site da Janete, desenhado em código: um corte lateral do couro cabeludo no estilo das
// ilustrações de tricologia, com as cores reais escurecidas para o clima escuro do site.
//
// De cima para baixo: a superfície da pele com os poros; a epiderme (faixa rosada); a derme (bege rosada,
// com fibras, vasos, nervos e glândulas); os folículos em forma de gota inclinada, com a raiz escura dentro da
// bainha clara, o bulbo e a papila; a hipoderme (gordura amarelada) e os vasos maiores.
//
// Cada folículo é um componente (foliculo) desenhado em coordenadas locais, com o poro na origem, girado pelo
// mesmo ângulo da base do fio: fio e raiz são uma peça contínua. Os fios acima da pele são desenhados ao vivo
// no site (src/motion/cabelos.js) a partir dos mesmos dados (foliculos.json), para reagir ao mouse.
//
// O fio de luz do site desce pela raiz do folículo central até a papila e continua pelo vaso que a alimenta,
// até a gordura (fio-pontos.json). Também saem daqui as legendas (rotulos.json) e o mapa das seções (cena.json).
//
// Formato: sete trechos de 1672 × 941 (coordenadas da faixa) que se emendam com 263 de sobreposição, em WebP
// de 2560 px de largura, mais o fundo e o primeiro plano desfocado.
//   node scripts/cenario.mjs          (tudo)
//   node scripts/cenario.mjs 2        (só o trecho 2, para conferir)
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const W = 1672, SEG_H = 941, BAND = 263, PASSO = SEG_H - BAND, H = PASSO * 6 + SEG_H; // 5009
const OUT = 'public/img/';
const CX = 836, TOPO = 712; // o alto da curva da cabeça
const EPI = 150; // espessura da epiderme
const PLEXO1 = 2340, HIPO = 2410, PLEXO2 = 3660;
const RAD = Math.PI / 180;

// ---------- utilidades ----------
function rng(seed) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const R = rng(20261112);
const rr = (a, b) => a + R() * (b - a);
const f = (n) => n.toFixed(1);
const surf = (x) => TOPO + 0.00011 * (x - CX) ** 2;
const slope = (x) => 0.00022 * (x - CX);
const juncao = (x) => surf(x) + EPI + 8 * Math.sin(x / 42) + 3 * Math.sin(x / 13);
const bez = (p0, p1, p2, p3) => `M${f(p0[0])},${f(p0[1])}C${f(p1[0])},${f(p1[1])} ${f(p2[0])},${f(p2[1])} ${f(p3[0])},${f(p3[1])}`;
function catmull(pts) {
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`;
  }
  return d;
}
function tubo(d, w, cor, escuro, brilho, extra = '') {
  return `<path d="${d}" fill="none" stroke="${escuro}" stroke-width="${f(w + 3)}" stroke-linecap="round" ${extra}/>` +
    `<path d="${d}" fill="none" stroke="${cor}" stroke-width="${f(w)}" stroke-linecap="round" ${extra}/>` +
    `<path d="${d}" fill="none" stroke="${brilho}" stroke-opacity="0.55" stroke-width="${f(Math.max(1, w * 0.28))}" stroke-linecap="round" transform="translate(${f(-w * 0.18)} ${f(-w * 0.12)})" ${extra}/>`;
}
const ARTERIA = ['#c8343e', '#5a0e16', '#ffb0b0'], VEIA = ['#3a4ad6', '#121860', '#b4bcff'], NERVO = ['#d8b444', '#5a4410', '#fff0b0'];

// ---------- os folículos ----------
// x: onde o fio sai da pele; a: ângulo da base do fio (graus; a raiz desce na mesma linha, para o lado oposto);
// D: profundidade até o centro do bulbo; s: escala (espessura); blur: desfoque (profundidade de campo).
const FOLICULOS = [
  { x: 780, a: -6, D: 1250, s: 1, blur: 0, central: true },
  { x: 360, a: -10, D: 1120, s: 0.9, blur: 0 },
  { x: 1330, a: 10, D: 1150, s: 0.9, blur: 0 },
  { x: 70, a: 12, D: 960, s: 0.76, blur: 4 },
  { x: 1600, a: -12, D: 960, s: 0.76, blur: 4 },
  { x: 570, a: 5, D: 820, s: 0.62, blur: 8 },
  { x: 1070, a: -5, D: 840, s: 0.62, blur: 8 },
];
const H0 = 14, HB = 56, S0 = 30, SB = 92; // meias larguras: fio na saída, bulbo, bainha na saída, bainha no bulbo
const PW = 22; // meia largura da papila

// transforma um ponto do folículo (coordenadas locais) para a faixa
function local(F, lx, ly) {
  const a = F.a * RAD, y0 = surf(F.x);
  return [F.x + lx * F.s * Math.cos(a) - ly * Math.sin(a), y0 + lx * F.s * Math.sin(a) + ly * Math.cos(a)];
}

// o contorno em gota: estreito no poro, alarga até o bulbo, fundo arredondado com a reentrância da papila
function gota(h0, hb, D, pw, extra = 0) {
  const yb = D + hb + extra, n1 = D - 3.3 * hb, n2 = D - 1.55 * hb, nm = n1 + (n2 - n1) * 0.5, hm = h0 + (hb - h0) * 0.28;
  return `M${f(-h0)},-8 C${f(-h0)},${f(n1 * 0.6)} ${f(-h0)},${f(n1)} ${f(-hm)},${f(nm)}` +
    ` C${f(-hb * 0.82)},${f(n2)} ${f(-hb)},${f(D - hb * 0.55)} ${f(-hb)},${f(D)}` +
    ` C${f(-hb)},${f(D + hb * 0.62)} ${f(-hb * 0.64)},${f(yb)} ${f(-pw)},${f(yb)}` +
    ` C${f(-pw * 0.72)},${f(yb - hb * 0.66)} ${f(pw * 0.72)},${f(yb - hb * 0.66)} ${f(pw)},${f(yb)}` +
    ` C${f(hb * 0.64)},${f(yb)} ${f(hb)},${f(D + hb * 0.62)} ${f(hb)},${f(D)}` +
    ` C${f(hb)},${f(D - hb * 0.55)} ${f(hb * 0.82)},${f(n2)} ${f(hm)},${f(nm)}` +
    ` C${f(h0)},${f(n1)} ${f(h0)},${f(n1 * 0.6)} ${f(h0)},-8Z`;
}

const gradDefs = [];
function foliculo(F, i) {
  const D = F.D / F.s; // desenhado em escala s: a profundidade fica a mesma
  const id = `f${i}`;
  gradDefs.push(
    `<linearGradient id="${id}b" x1="${-SB}" x2="${SB}" y1="0" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#8e6a4c"/><stop offset="0.2" stop-color="#d4ac86"/><stop offset="0.48" stop-color="#f2dab8"/><stop offset="0.8" stop-color="#d4ac86"/><stop offset="1" stop-color="#7e5a40"/></linearGradient>`,
    `<linearGradient id="${id}r" x1="${-HB}" x2="${HB}" y1="0" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3a2a22"/><stop offset="0.18" stop-color="#140c08"/><stop offset="0.55" stop-color="#050302"/><stop offset="0.86" stop-color="#110a07"/><stop offset="1" stop-color="#2a1e18"/></linearGradient>`,
  );
  const g = [];
  const yb = D + HB;
  // glândula sebácea (atrás, presa à bainha do lado de fora da curva)
  const lado = F.a <= 0 ? 1 : -1;
  if (!F.blur || F.blur < 8) {
    const lob = [[S0 + 16, D * 0.25, 26], [S0 + 40, D * 0.29, 30], [S0 + 20, D * 0.33, 26], [S0 + 46, D * 0.235, 20], [S0 + 12, D * 0.37, 20], [S0 + 36, D * 0.35, 18]];
    g.push(tubo(`M${f(lado * (S0 - 6))},${f(D * 0.215)} C${f(lado * (S0 + 2))},${f(D * 0.22)} ${f(lado * (S0 + 8))},${f(D * 0.23)} ${f(lado * (S0 + 14))},${f(D * 0.245)}`, 10, '#d6a840', '#6a4810', '#fff0b8'));
    g.push(`<g stroke="#6a4810" stroke-width="2.4">${lob.map(([x, y, r]) => `<circle cx="${f(lado * x)}" cy="${f(y)}" r="${r}" fill="url(#sebo)"/>`).join('')}</g>`);
    g.push(`<g fill="#fff6d8" fill-opacity="0.3">${lob.map(([x, y, r]) => `<ellipse cx="${f(lado * x - r * 0.3)}" cy="${f(y - r * 0.35)}" rx="${f(r * 0.3)}" ry="${f(r * 0.2)}"/>`).join('')}</g>`);
  }
  // vasos chegando à papila, por baixo
  g.push(`<g fill="none" stroke-linecap="round"><path d="M-10,${f(yb + 260)} C-30,${f(yb + 150)} -4,${f(yb + 60)} -4,${f(yb - HB * 0.32)}" stroke="#5a0e16" stroke-width="6"/><path d="M-10,${f(yb + 260)} C-30,${f(yb + 150)} -4,${f(yb + 60)} -4,${f(yb - HB * 0.32)}" stroke="#c8343e" stroke-width="3.6"/><path d="M12,${f(yb + 260)} C34,${f(yb + 150)} 6,${f(yb + 60)} 5,${f(yb - HB * 0.32)}" stroke="#121860" stroke-width="6"/><path d="M12,${f(yb + 260)} C34,${f(yb + 150)} 6,${f(yb + 60)} 5,${f(yb - HB * 0.32)}" stroke="#3a4ad6" stroke-width="3.6"/></g>`);
  // bainha de tecido (rosada), bainha radicular externa (clara, com volume e borda), bainha interna, raiz
  g.push(`<path d="${gota(S0 + 6, SB + 7, D, PW * 1.1, 11)}" fill="#b8707a" stroke="#5e2a30" stroke-width="2.4"/>`);
  g.push(`<path d="${gota(S0, SB, D, PW, 6)}" fill="url(#${id}b)" stroke="#6a4830" stroke-width="2"/>`);
  g.push(`<path d="${gota(H0 + 5, HB + 8, D, PW * 0.95, 2)}" fill="#c99c72" stroke="#8a5e3c" stroke-width="1.6"/>`);
  g.push(`<path d="${gota(H0, HB, D, PW * 0.9, 0)}" fill="url(#${id}r)"/>`);
  // brilho lateral na raiz e no bulbo
  g.push(`<path d="M${f(-H0 * 0.45)},6 C${f(-H0 * 0.45)},${f(D * 0.5)} ${f(-H0 * 0.6)},${f(D - 3 * HB)} ${f(-HB * 0.55)},${f(D - 0.6 * HB)}" stroke="#e8d8cc" stroke-opacity="0.28" stroke-width="3.2" fill="none" stroke-linecap="round"/>`);
  g.push(`<ellipse cx="${f(-HB * 0.45)}" cy="${f(D - HB * 0.2)}" rx="${f(HB * 0.18)}" ry="${f(HB * 0.5)}" fill="#fff" fill-opacity="0.14" transform="rotate(10 ${f(-HB * 0.45)} ${f(D - HB * 0.2)})"/>`);
  // matriz: pontinhos claros onde o fio é formado, em volta da papila
  const m = [];
  for (let k = 0; k < 34; k++) { const ang = rr(Math.PI * 1.08, Math.PI * 1.92), d = rr(PW * 1.25, HB * 0.85); m.push(`<circle cx="${f(Math.cos(ang) * d)}" cy="${f(yb + Math.sin(ang) * d * 0.95)}" r="${f(rr(1.4, 2.4))}"/>`); }
  g.push(`<g fill="#f2d8c0" fill-opacity="0.35">${m.join('')}</g>`);
  // papila dérmica: encaixa na reentrância do fundo
  g.push(`<path d="M${f(-PW * 0.95)},${f(yb + 3)} C${f(-PW * 0.78)},${f(yb - HB * 0.6)} ${f(PW * 0.78)},${f(yb - HB * 0.6)} ${f(PW * 0.95)},${f(yb + 3)}Z" fill="url(#papilaG)" stroke="#6a1820" stroke-width="1.4"/>`);
  // o poro: uma pequena depressão na pele onde o fio sai
  g.push(`<path d="M${f(-S0 - 12)},-6 Q0,16 ${f(S0 + 12)},-6 Z" fill="#2a1216" fill-opacity="0.75"/>`);
  const corpo = `<g transform="translate(${f(F.x)} ${f(surf(F.x))}) rotate(${F.a}) scale(${F.s})"${F.blur ? ` filter="url(#b${F.blur})" opacity="${F.blur >= 8 ? 0.55 : 0.8}"` : ''}>${g.join('')}</g>`;
  return `<g clip-path="url(#clipPele)">${corpo}</g>`;
}

// ---------- o eixo do fio de luz: a raiz central e o vaso que alimenta a papila ----------
const FC = FOLICULOS[0];
const FIO = [];
for (let ly = 0; ly < FC.D + HB * 0.62; ly += 54) FIO.push(local(FC, 0, ly).map(Math.round));
FIO.push(local(FC, 0, FC.D + HB * 0.62).map(Math.round));
const PB = local(FC, 0, FC.D + HB * 1.9); // abaixo da papila, onde o vaso chega
const VASO_LUZ = [PB, [PB[0] - 10, PB[1] + 170], [PB[0] - 34, PLEXO1 + 120], [878, 2850], [858, 3250], [844, PLEXO2], [838, 4000], [836, 4160]];
for (const p of VASO_LUZ) FIO.push(p.map(Math.round));

const parts = [];
const add = (s) => parts.push(s);
const pele = `M0,${f(surf(0))} ` + Array.from({ length: 85 }, (_, i) => { const x = (i / 84) * W; return `L${f(x)},${f(surf(x))}`; }).join(' ') + ` L${W},${H} L0,${H}Z`;
const sup = Array.from({ length: 120 }, (_, i) => { const x = (i / 119) * W; return `${i ? 'L' : 'M'}${f(x)},${f(surf(x))}`; }).join('');
const off = (y) => ((y - TOPO) / (H - TOPO)).toFixed(4);

// ---------- 1) a pele: epiderme rosada lisa, derme bege rosada, hipoderme amarelada ----------
add(`<path d="${pele}" fill="url(#tecido)"/>`);
add(`<rect x="0" y="${TOPO - 120}" width="${W}" height="${H - TOPO + 120}" filter="url(#textura)" clip-path="url(#clipPele)"/>`);
{
  // epiderme: faixa lisa com células bem sutis e uma linha clara no topo (camada córnea)
  const ep = `M0,${f(surf(0))} ` + Array.from({ length: 120 }, (_, i) => { const x = (i / 119) * W; return `L${f(x)},${f(surf(x))}`; }).join(' ') + ' ' + Array.from({ length: 200 }, (_, i) => { const x = W - (i / 199) * W; return `L${f(x)},${f(juncao(x))}`; }).join(' ') + 'Z';
  add(`<path d="${ep}" fill="url(#epiG)"/>`);
  const cel = [];
  for (let r = 0; r < 8; r++) for (let x = rr(-10, 10); x < W + 10; x += rr(16, 24)) {
    const d = 26 + r * 15; if (d > EPI - 12) continue;
    const y = surf(x) + d + rr(-3, 3), a = Math.atan(slope(x)) * 57.3;
    cel.push(`<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rr(7.5, 10))}" ry="${f(rr(4.5, 6.5))}" transform="rotate(${f(a)} ${f(x)} ${f(y)})"/>`);
  }
  add(`<g fill="#f0a8b4" fill-opacity="0.05" stroke="#f6c0c8" stroke-opacity="0.09" stroke-width="1">${cel.join('')}</g>`);
  add(`<path d="${sup}" fill="none" stroke="#f6c8bc" stroke-opacity="0.4" stroke-width="10" transform="translate(0 6)"/>`);
  const d = Array.from({ length: 400 }, (_, i) => { const x = (i / 399) * W; return `${i ? 'L' : 'M'}${f(x)},${f(juncao(x))}`; }).join('');
  add(`<path d="${d}" fill="none" stroke="#a0466a" stroke-opacity="0.55" stroke-width="5"/>`);
  add(`<path d="${d}" fill="none" stroke="#f4b8c8" stroke-opacity="0.25" stroke-width="1.4" transform="translate(0 -3)"/>`);
}
// derme: fibras onduladas
{
  const fib = [];
  for (let i = 0; i < 520; i++) {
    const y0 = rr(TOPO + EPI + 40, PLEXO1 + 30), x0 = rr(-120, W);
    const len = rr(140, 440), ang = rr(-0.2, 0.2);
    const x3 = x0 + Math.cos(ang) * len, y3 = y0 + Math.sin(ang) * len, amp = rr(6, 18);
    fib.push(`<path d="${bez([x0, y0], [x0 + (x3 - x0) * 0.33, y0 - amp], [x0 + (x3 - x0) * 0.66, y0 + amp], [x3, y3])}" stroke-opacity="${(0.05 + R() * 0.06).toFixed(3)}" stroke-width="${f(rr(2, 5))}"/>`);
  }
  add(`<g fill="none" stroke="#ffd8c4" stroke-linecap="round" filter="url(#b1)">${fib.join('')}</g>`);
}

// ---------- 2) vasos, nervos e glândulas sudoríparas na derme ----------
const longeDosFoliculos = (x, y, m = 70) => FOLICULOS.every((F) => {
  const t = (y - surf(F.x)) / Math.cos(F.a * RAD);
  if (t < -20 || t > F.D + 120) return true;
  return Math.abs(local(F, 0, t)[0] - x) > m * F.s + (t > F.D - 200 ? 40 : 0);
});
function arvore(x, y, ang, len, w, prof, cores, out) {
  const topo = juncao(x) + 26;
  let x1 = x + Math.cos(ang) * len, y1 = y + Math.sin(ang) * len;
  if (y1 < topo) { const k = (y - topo) / (y - y1); x1 = x + (x1 - x) * k; y1 = topo; }
  if (!longeDosFoliculos(x1, y1) || !longeDosFoliculos((x + x1) / 2, (y + y1) / 2)) return;
  const c1 = [x + (x1 - x) * 0.3 + rr(-30, 30), y + (y1 - y) * 0.3], c2 = [x + (x1 - x) * 0.7 + rr(-30, 30), y + (y1 - y) * 0.7];
  out.push(tubo(bez([x, y], c1, c2, [x1, y1]), w, ...cores));
  if (prof <= 0 || y1 <= topo + 2) return;
  for (let i = 0; i < 2; i++) arvore(x1, y1, ang + (i - 0.5) * rr(0.55, 0.85) + rr(-0.12, 0.12), len * rr(0.55, 0.72), w * 0.72, prof - 1, cores, out);
}
{
  const vas = [];
  const plexo = (y, a) => `M-60,${y + 30} C300,${y - 30 * a} 600,${y + 40 * a} ${CX},${y + 10} S1300,${y - 40 * a} ${W + 60},${y + 20}`;
  vas.push(tubo(plexo(PLEXO1, 1), 15, ...ARTERIA), tubo(plexo(PLEXO1 + 32, -1), 17, ...VEIA));
  for (const x0 of [260, 600, 1000, 1320, 1600, 40]) {
    arvore(x0, PLEXO1 + 10, -Math.PI / 2 + rr(-0.18, 0.18), rr(560, 680), 11, 4, ARTERIA, vas);
    arvore(x0 + rr(40, 80), PLEXO1 + 40, -Math.PI / 2 + rr(-0.18, 0.18), rr(560, 680), 12, 4, VEIA, vas);
  }
  for (let x = 30; x < W; x += 96) {
    const y = juncao(x);
    if (!longeDosFoliculos(x, y + 40, 50)) continue;
    vas.push(tubo(`M${f(x - 7)},${f(y + 80)} C${f(x - 9)},${f(y + 16)} ${f(x + 9)},${f(y + 16)} ${f(x + 7)},${f(y + 80)}`, 3, ...(R() < 0.5 ? ARTERIA : VEIA)));
  }
  add(`<g opacity="0.8">${vas.join('')}</g>`);
  const ner = [];
  for (const [x0, top] of [[300, 1020], [1330, 1000], [1600, 1250], [60, 1250]]) {
    let d = `M${x0},${PLEXO1 + 70}`;
    for (let y = PLEXO1 + 70, i = 0; y > top; y -= 80, i++) d += ` Q${f(x0 + (i % 2 ? 22 : -22))},${f(y - 40)} ${f(x0 + rr(-5, 5))},${f(y - 80)}`;
    ner.push(tubo(d, 6.5, ...NERVO));
  }
  ner.push(tubo(`M-60,${PLEXO1 + 70} C500,${PLEXO1 + 110} 1100,${PLEXO1 + 30} ${W + 60},${PLEXO1 + 80}`, 7, ...NERVO));
  for (const [x, y] of [[330, 1880], [1300, 1760]]) ner.push(`<ellipse cx="${x}" cy="${y}" rx="20" ry="32" fill="#d8b444" fill-opacity="0.35" stroke="#fff0b0" stroke-opacity="0.5" stroke-width="2.4"/><ellipse cx="${x}" cy="${y}" rx="12" ry="20" fill="none" stroke="#fff0b0" stroke-opacity="0.35" stroke-width="2"/>`);
  add(`<g opacity="0.85">${ner.join('')}</g>`);
}
function sudoripara(cx, cy, xPoro) {
  const out = [], y0 = surf(xPoro) + 4;
  let d = `M${xPoro},${f(y0)}`;
  for (let y = y0, i = 0; y < cy - 40; y += 66, i++) {
    const t1 = (y + 33 - y0) / (cy - y0), t2 = (y + 66 - y0) / (cy - y0);
    d += ` Q${f(xPoro + (cx - xPoro) * t1 + (i % 2 ? 18 : -18))},${f(y + 33)} ${f(xPoro + (cx - xPoro) * t2)},${f(y + 66)}`;
  }
  out.push(tubo(d, 8, '#e6c49a', '#5a3a1e', '#fff2dc'));
  let n = `M${cx},${cy - 36}`;
  for (let i = 0; i < 24; i++) { const a = rr(0, 6.28), r = rr(8, 50); n += ` Q${f(cx + rr(-52, 52))},${f(cy + rr(-44, 44))} ${f(cx + Math.cos(a) * r)},${f(cy + Math.sin(a) * r * 0.8)}`; }
  out.push(tubo(n, 8, '#e6c49a', '#5a3a1e', '#fff2dc'));
  out.push(`<ellipse cx="${xPoro}" cy="${f(y0)}" rx="12" ry="4" fill="#1a0c0c" fill-opacity="0.8"/>`);
  return out.join('');
}
const SUDOR = { x: 1330, y: 2170 };
add(sudoripara(SUDOR.x, SUDOR.y, 1360));
add(sudoripara(260, 2210, 290));

// ---------- 3) hipoderme: lóbulos de gordura e os vasos maiores ----------
{
  const gord = [];
  const xLuz = (y) => (y < PLEXO2 ? 880 - (y - PLEXO1) * 0.03 : 840);
  for (let tries = 0; tries < 16000 && gord.length < 560; tries++) {
    const x = rr(-60, W + 60), y = rr(HIPO + 30, H + 40), r = rr(30, 64);
    if (Math.abs(x - xLuz(y)) < 46 + r && y < 4300) continue;
    if (gord.some((g) => Math.hypot(g[0] - x, g[1] - y) < g[2] + r + 3)) continue;
    gord.push([x, y, r]);
  }
  add(`<g stroke="#2a1606" stroke-width="5">${gord.map(([x, y, r]) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="url(#gord)" fill-opacity="0.5"/>`).join('')}</g>`);
  add(`<g fill="#fff2c0" fill-opacity="0.18">${gord.map(([x, y, r]) => `<ellipse cx="${f(x - r * 0.3)}" cy="${f(y - r * 0.32)}" rx="${f(r * 0.28)}" ry="${f(r * 0.18)}"/>`).join('')}</g>`);
  const grande = (y, a) => `M-60,${y + 50} C400,${y - 40 * a} 700,${y + 60 * a} ${CX},${y + 10} S1300,${y - 60 * a} ${W + 60},${y + 30}`;
  add(tubo(grande(PLEXO2, 1), 24, ...ARTERIA) + tubo(grande(PLEXO2 + 44, -1), 26, ...VEIA));
  // o vaso que alimenta a papila do folículo central: o fio de luz desce por ele
  add(tubo(catmull(VASO_LUZ), 13, ...ARTERIA));
  add(tubo(catmull(VASO_LUZ.map(([x, y], i) => [x + 22 + (i ? 6 : 0), y + (i ? 10 : 6)])), 11, ...VEIA));
}

// ---------- 4) os folículos (do fundo para a frente) e o músculo eretor ----------
add(`<ellipse cx="${f(local(FC, 0, FC.D)[0])}" cy="${f(local(FC, 0, FC.D)[1])}" rx="420" ry="380" fill="url(#raizLuz)"/>`);
FOLICULOS.map((F, i) => [F, i]).sort((a, b) => (b[0].blur || 0) - (a[0].blur || 0)).forEach(([F, i]) => { if (!F.central) add(foliculo(F, i)); });
{
  // músculo eretor do pelo: da bainha (lado de dentro da curva) até a junção com a epiderme
  const a0 = local(FC, -(S0 + 4), FC.D * 0.44), xa = FC.x - 210, a1 = [xa, juncao(xa) + 18];
  const mx = (a0[0] + a1[0]) / 2 + 30, my = (a0[1] + a1[1]) / 2 + 40;
  const mus = `M${f(a0[0])},${f(a0[1] - 26)} Q${f(mx)},${f(my - 30)} ${f(a1[0] - 6)},${f(a1[1] - 18)} L${f(a1[0] + 14)},${f(a1[1] + 20)} Q${f(mx + 18)},${f(my + 26)} ${f(a0[0])},${f(a0[1] + 26)}Z`;
  add(`<path d="${mus}" fill="#b03a46" fill-opacity="0.85" stroke="#5a1018" stroke-width="3"/>`);
  const est = [];
  for (let t = 0.08; t < 0.95; t += 0.04) {
    const x = (1 - t) * (1 - t) * a0[0] + 2 * (1 - t) * t * mx + t * t * a1[0], y = (1 - t) * (1 - t) * a0[1] + 2 * (1 - t) * t * my + t * t * a1[1];
    est.push(`<path d="M${f(x - 16)},${f(y - 12)} L${f(x + 16)},${f(y + 12)}"/>`);
  }
  add(`<g stroke="#ffb0b0" stroke-opacity="0.22" stroke-width="1.4">${est.join('')}</g>`);
  add(`<ellipse cx="${f(a1[0] + 4)}" cy="${f(a1[1] + 2)}" rx="15" ry="9" fill="#f4ece6" fill-opacity="0.9" transform="rotate(-35 ${f(a1[0] + 4)} ${f(a1[1] + 2)})"/>`);
  // protuberância (bulge), onde ficam as células-tronco
  const b0 = local(FC, -(S0 + 2), FC.D * 0.47), b1 = local(FC, -(S0 + 2), FC.D * 0.55), bm = local(FC, -(S0 + 34), FC.D * 0.51);
  add(`<path d="M${f(b0[0])},${f(b0[1])} Q${f(bm[0])},${f(bm[1] - 40)} ${f(bm[0])},${f(bm[1])} Q${f(bm[0])},${f(bm[1] + 40)} ${f(b1[0])},${f(b1[1])}Z" fill="#9a78b0" fill-opacity="0.7" stroke="#d8c0ec" stroke-opacity="0.45" stroke-width="2"/>`);
}
add(foliculo(FC, 0));

// ---------- 5) luz: o centro aceso, as laterais (onde fica o texto) mais escuras ----------
add(`<rect x="${CX - 430}" y="${TOPO}" width="860" height="${H - TOPO}" fill="url(#coluna)" clip-path="url(#clipPele)"/>`);
add(`<g clip-path="url(#clipPele)"><rect x="0" y="${TOPO + 30}" width="${W}" height="${H}" fill="url(#sombraH)"/><rect x="0" y="${TOPO}" width="${W}" height="${H}" fill="#030304" fill-opacity="0.18"/></g>`);
add(`<path d="${pele}" fill="url(#sub)"/>`);
add(`<rect x="0" y="4500" width="${W}" height="${H - 4500}" fill="url(#fundoV)"/>`);
add(`<path d="${sup}" fill="none" stroke="#ffe2d6" stroke-opacity="0.5" stroke-width="2.6"/>`);
add(`<path d="${sup}" fill="none" stroke="#ffe2d6" stroke-opacity="0.16" stroke-width="12" filter="url(#b4)"/>`);

const defs = `
<defs>
  <linearGradient id="tecido" x1="0" y1="${TOPO}" x2="0" y2="${H}" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#7a4a40"/>
    <stop offset="${off(TOPO + EPI + 20)}" stop-color="#6c4038"/>
    <stop offset="${off(1300)}" stop-color="#5c3832"/>
    <stop offset="${off(PLEXO1 - 40)}" stop-color="#4a2c28"/>
    <stop offset="${off(HIPO + 40)}" stop-color="#46301a"/>
    <stop offset="${off(4400)}" stop-color="#2c1c0e"/>
    <stop offset="${off(4800)}" stop-color="#120c07"/>
    <stop offset="1" stop-color="#040506"/>
  </linearGradient>
  <linearGradient id="epiG" x1="0" y1="${TOPO}" x2="0" y2="${TOPO + EPI}" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#b47070"/><stop offset="0.1" stop-color="#9c5a62"/><stop offset="1" stop-color="#874a56"/>
  </linearGradient>
  <linearGradient id="coluna" x1="0" x2="1" y1="0" y2="0">
    <stop offset="0" stop-color="#d8f1ec" stop-opacity="0"/><stop offset="0.5" stop-color="#d8f1ec" stop-opacity="0.08"/><stop offset="1" stop-color="#d8f1ec" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="sombraH" x1="0" x2="1" y1="0" y2="0">
    <stop offset="0" stop-color="#030304" stop-opacity="0.78"/><stop offset="0.24" stop-color="#030304" stop-opacity="0.55"/>
    <stop offset="0.4" stop-color="#030304" stop-opacity="0.18"/><stop offset="0.5" stop-color="#030304" stop-opacity="0.03"/>
    <stop offset="0.6" stop-color="#030304" stop-opacity="0.18"/><stop offset="0.76" stop-color="#030304" stop-opacity="0.55"/>
    <stop offset="1" stop-color="#030304" stop-opacity="0.78"/>
  </linearGradient>
  <linearGradient id="fundoV" x1="0" y1="4500" x2="0" y2="${H}" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#040506" stop-opacity="0"/><stop offset="1" stop-color="#040506" stop-opacity="1"/>
  </linearGradient>
  <linearGradient id="sub" x1="0" y1="${TOPO}" x2="0" y2="${TOPO + 160}" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#ffc0a8" stop-opacity="0.18"/><stop offset="1" stop-color="#ffc0a8" stop-opacity="0"/>
  </linearGradient>
  <radialGradient id="papilaG" cx="0.5" cy="0.35" r="0.7">
    <stop offset="0" stop-color="#ffd0c4"/><stop offset="0.4" stop-color="#e07a78"/><stop offset="1" stop-color="#8a2e36"/>
  </radialGradient>
  <radialGradient id="gord" cx="0.4" cy="0.35" r="0.7">
    <stop offset="0" stop-color="#f2cf6a"/><stop offset="0.6" stop-color="#c8922e"/><stop offset="1" stop-color="#7a5212"/>
  </radialGradient>
  <radialGradient id="sebo" cx="0.4" cy="0.35" r="0.7">
    <stop offset="0" stop-color="#fbe49a"/><stop offset="0.6" stop-color="#d6a840"/><stop offset="1" stop-color="#8a6418"/>
  </radialGradient>
  <radialGradient id="raizLuz" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#d8f1ec" stop-opacity="0.26"/><stop offset="0.45" stop-color="#9ed8ce" stop-opacity="0.09"/><stop offset="1" stop-color="#9ed8ce" stop-opacity="0"/>
  </radialGradient>
  ${gradDefs.join('\n  ')}
  <filter id="textura" x="0" y="0" width="1" height="1" filterUnits="objectBoundingBox">
    <feTurbulence type="fractalNoise" baseFrequency="0.004 0.02" numOctaves="3" seed="11"/>
    <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.85  0 0 0 0 0.78  0 0 0 0.14 -0.04"/>
  </filter>
  <filter id="b1" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.2"/></filter>
  <filter id="b4" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4.5"/></filter>
  <filter id="b8" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8"/></filter>
  <clipPath id="clipPele"><path d="${pele}"/></clipPath>
</defs>`;

// ---------- legendas e mapa das seções ----------
const P = (lx, ly) => local(FC, lx, ly).map(Math.round);
const sebo = P(S0 + 46, FC.D * 0.29);
const mid = (y) => local(FC, 0, y);
const ROTULOS = [
  { nome: 'Haste do fio', x: FC.x - 70, y: TOPO - 330, lado: 'l', em: TOPO + 1 },
  { nome: 'Poro', x: FC.x + 30, y: TOPO + 2, lado: 'r', em: TOPO + 1 },
  { nome: 'Epiderme', x: 1080, y: Math.round(surf(1080) + 80), lado: 'r' },
  { nome: 'Derme', x: 1080, y: 1180, lado: 'r' },
  { nome: 'Glândula sebácea', x: sebo[0] + 30, y: sebo[1], lado: 'r' },
  { nome: 'Músculo eretor do pelo', x: FC.x - 130, y: Math.round(mid(FC.D * 0.44)[1] - 190), lado: 'l' },
  { nome: 'Bulge: células-tronco', ...(([x, y]) => ({ x, y }))(P(-(S0 + 34), FC.D * 0.51)), lado: 'l' },
  { nome: 'Bainha radicular externa', ...(([x, y]) => ({ x, y }))(P(S0 + 2, FC.D * 0.62)), lado: 'r' },
  { nome: 'Bainha radicular interna', ...(([x, y]) => ({ x, y }))(P(-(H0 + 4), FC.D * 0.7)), lado: 'l' },
  { nome: 'Bulbo: onde o fio nasce', ...(([x, y]) => ({ x, y }))(P(SB, FC.D)), lado: 'r' },
  { nome: 'Papila dérmica', ...(([x, y]) => ({ x, y }))(P(-PW, FC.D + HB * 0.75)), lado: 'l' },
  { nome: 'Vasos que nutrem a raiz', x: Math.round(PB[0] + 10), y: Math.round(PLEXO1 + 40), lado: 'r' },
  { nome: 'Glândula sudorípara', x: SUDOR.x + 50, y: SUDOR.y, lado: 'r' },
  { nome: 'Hipoderme', x: 560, y: 3000, lado: 'l' },
];
const bulboY = Math.round(mid(FC.D)[1]);
const CENA = {
  semente: { cx: FC.x, base: TOPO },
  foco: { dores: 930, fases: Math.round(mid(FC.D * 0.53)[1]), metodo: bulboY + 30, casos: 2720, planos: 3160, diagnostico: 3480, relatos: 3780, final: 4140 },
  marcos: [
    { n: 1, nome: '1º mês', y: Math.round(mid(FC.D * 0.3)[1]) },
    { n: 2, nome: '3º mês', y: Math.round(mid(FC.D * 0.53)[1]) },
    { n: 3, nome: '6º mês', y: Math.round(mid(FC.D * 0.76)[1]) },
  ],
};
const DADOS_FIOS = FOLICULOS.map((F) => ({ x: F.x, a: F.a, s: F.s, w: H0 * 2 * F.s, central: !!F.central, blur: F.blur }));

// ---------- saída ----------
const corpo = defs + parts.join('\n');
async function trecho(i) {
  const top = PASSO * i;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="2560" height="1441" viewBox="0 ${top} ${W} ${SEG_H}">${corpo}</svg>`;
  const buf = await sharp(Buffer.from(svg), { limitInputPixels: false }).webp({ quality: 80, alphaQuality: 90, effort: 5 }).toBuffer();
  writeFileSync(`${OUT}pele-${i}.webp`, buf);
  console.log(`pele-${i}.webp`, Math.round(buf.length / 1024) + 'KB');
}

writeFileSync('src/motion/fio-pontos.json', JSON.stringify(FIO));
writeFileSync('src/motion/rotulos.json', JSON.stringify(ROTULOS, null, 1));
writeFileSync('src/motion/cena.json', JSON.stringify(CENA, null, 1));
writeFileSync('src/motion/foliculos.json', JSON.stringify(DADOS_FIOS, null, 1));
console.log('fio:', FIO.length, 'pontos, de', FIO[0], 'a', FIO[FIO.length - 1], '| bulbo y', bulboY, '| foco', JSON.stringify(CENA.foco));
const so = process.argv[2];
if (so != null && so !== 'tudo') await trecho(Number(so));
else for (let i = 0; i < 7; i++) await trecho(i);
