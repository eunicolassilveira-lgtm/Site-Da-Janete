// Um folículo isolado, para aprovação, com a pele em volta.
// O folículo (bainha, raiz, bulbo e papila) usa exatamente os paths aprovados; a epiderme, o poro e as fibras
// da derme também estão aprovados. Aqui: músculo eretor fusiforme preso nas duas pontas, glândula sebácea em
// cacho, vasos com hierarquia (principais, plexo, capilares e a alça na papila) e a hipoderme em lóbulos
// compactos de gordura (Voronoi), com fade para o escuro.
//   node scripts/foliculo-isolado.mjs  ->  prova/foliculo-isolado.png
import sharp from 'sharp';
import { Delaunay } from 'd3-delaunay';

import { hairFollicle, hairShaft, defsFoliculo } from './foliculo.mjs';

// ---------- a cena isolada ----------
const W = 900, S = 2.5, ANG = 12, X0 = 520;
const RAD = Math.PI / 180, a = ANG * RAD;
const prof = 262 * S * Math.cos(a);
const SUP = 640;
const PELE = prof / 0.53; // epiderme 8% + derme 45%
const EPI = SUP + PELE * 0.08, DER = SUP + PELE * 0.53;
const H = Math.round(DER + PELE * 0.3); // hipoderme ~35% mais baixa que antes
const R = (() => { let s = 11; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
const rr = (a0, b0) => a0 + R() * (b0 - a0);
const L = (lx, ly) => [X0 + (lx * Math.cos(a) - ly * Math.sin(a)) * S, SUP + (lx * Math.sin(a) + ly * Math.cos(a)) * S];
const pap = L(0, 248);
const f1 = (n) => n.toFixed(1);

// superfície com o funil do poro, epiderme e linha basal (aprovados)
const dip = (x) => 11 * Math.exp(-(((x - X0) / 20) ** 2));
const topo = (x) => SUP + dip(x);
const borda = Array.from({ length: 181 }, (_, i) => { const x = (i / 180) * W; return `${i ? 'L' : 'M'}${f1(x)},${topo(x).toFixed(2)}`; }).join('');
const peleD = `${borda} L${W},${H} L0,${H} Z`;
const basal = (x) => EPI + 6 * Math.sin(x / 26) + 2.5 * Math.sin(x / 9);
const basalD = Array.from({ length: 181 }, (_, i) => { const x = (i / 180) * W; return `${i ? 'L' : 'M'}${f1(x)},${basal(x).toFixed(2)}`; }).join('');
const epiD = `${borda} ${Array.from({ length: 181 }, (_, i) => { const x = W - (i / 180) * W; return `L${f1(x)},${basal(x).toFixed(2)}`; }).join(' ')} Z`;

// derme: feixes de colágeno e células (aprovados)
const fibras = [];
for (let b = 0; b < 26; b++) {
  const y0 = rr(EPI + 18, DER - 14), x0 = rr(-120, W), len = rr(220, 480), ang = rr(-0.22, 0.22), amp = rr(5, 14), fase = rr(0, 6.28);
  for (let k = 0; k < 4; k++) {
    const dy = k * rr(3, 5.5), o = rr(0.15, 0.25);
    let d = `M${f1(x0)},${f1(y0 + dy)}`;
    for (let s = 1; s <= 6; s++) {
      const u = s / 6, x = x0 + Math.cos(ang) * len * u, y = y0 + dy + Math.sin(ang) * len * u + Math.sin(u * 7 + fase + k * 0.4) * amp;
      d += ` ${s === 1 ? 'Q' : 'T'}${s === 1 ? `${f1(x0 + Math.cos(ang) * len / 12)},${f1(y0 + dy - amp)} ` : ''}${f1(x)},${f1(y)}`;
    }
    fibras.push(`<path d="${d}" stroke="#fbe4d6" stroke-opacity="${o.toFixed(2)}" stroke-width="${rr(0.9, 1.8).toFixed(1)}" fill="none" stroke-linecap="round"/>`);
  }
}
const celulas = Array.from({ length: 160 }, () => `<circle cx="${f1(rr(0, W))}" cy="${f1(rr(EPI + 10, DER - 6))}" r="${rr(1.2, 2.6).toFixed(1)}" fill="#8a4a50" fill-opacity="${rr(0.18, 0.35).toFixed(2)}"/>`).join('');
const celBasal = Array.from({ length: 120 }, (_, i) => { const x = i * 7.6 + rr(-1.5, 1.5); return `<circle cx="${f1(x)}" cy="${f1(basal(x) - 5)}" r="${rr(2.6, 3.6).toFixed(1)}" fill="#b26474" fill-opacity="0.55"/>`; }).join('');

// ---------- vasos com volume (contorno escuro por baixo, linha clara fina por cima) e que afinam ----------
const COR = { a: ['#c8343e', '#6a1218', '#ffb4b4'], v: ['#3a4ad6', '#161c6a', '#b8c0ff'] };
function vaso(pts, w0, w1, tipo) {
  const [cor, escuro, claro] = COR[tipo];
  const camadas = [[], [], []];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const d = `M${f1(p1[0])},${f1(p1[1])} C${f1(p1[0] + (p2[0] - p0[0]) / 6)},${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)},${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])},${f1(p2[1])}`;
    const w = w0 + (w1 - w0) * (i / Math.max(1, pts.length - 2));
    camadas[0].push(`<path d="${d}" stroke="${escuro}" stroke-width="${(w + 1.2).toFixed(2)}"/>`);
    camadas[1].push(`<path d="${d}" stroke="${cor}" stroke-width="${w.toFixed(2)}"/>`);
    if (w >= 1.4) camadas[2].push(`<path d="${d}" stroke="${claro}" stroke-opacity="0.6" stroke-width="${(w * 0.28).toFixed(2)}" transform="translate(-0.5 -0.6)"/>`);
  }
  return `<g fill="none" stroke-linecap="round">${camadas.map((c) => c.join('')).join('')}</g>`;
}
const [px, py] = pap;
const fundoF = L(0, 264), esqF = L(-19, 250), dirF = L(19, 250);
const PLX = DER + 10; // o plexo horizontal na transição derme/hipoderme
const plexoY = (x, o) => PLX + o + 12 * Math.sin(x / 85 + o) + 5 * Math.sin(x / 31);
const vasos = [];
// 1) principais na hipoderme: uma artéria e uma veia por região, subindo em curva pelos septos até o plexo
for (const [xa, xv] of [[150, 215], [705, 775]]) {
  const hh = H - PLX;
  vasos.push(vaso([[xa - 30, H + 10], [xa + 22, H - hh * 0.25], [xa - 18, H - hh * 0.5], [xa + 16, H - hh * 0.75], [xa, plexoY(xa, 0)]], 3.8, 2.4, 'a'));
  vasos.push(vaso([[xv + 34, H + 10], [xv - 20, H - hh * 0.28], [xv + 18, H - hh * 0.55], [xv - 14, H - hh * 0.8], [xv, plexoY(xv, 9)]], 4, 2.6, 'v'));
}
// 2) o plexo: vasos médios horizontais e ondulados
vasos.push(vaso(Array.from({ length: 19 }, (_, i) => { const x = -20 + i * 52; return [x, plexoY(x, 0)]; }), 2.2, 2, 'a'));
vasos.push(vaso(Array.from({ length: 19 }, (_, i) => { const x = W + 20 - i * 52; return [x, plexoY(x, 9)]; }), 2.3, 2, 'v'));
// 3) capilares finos subindo pela derme e fazendo uma alça perto da epiderme
const eixo = Array.from({ length: 30 }, (_, i) => L(0, (i / 29) * 262));
const longe = (x, y, m) => eixo.every(([ex, ey]) => Math.hypot(ex - x, ey - y) > m);
for (const [x0, tipo] of [[80, 'a'], [270, 'v'], [660, 'a'], [830, 'v']]) {
  const y0 = plexoY(x0, tipo === 'a' ? 0 : 9), meio = y0 + (basal(x0) + 60 - y0) * 0.55;
  const tronco = [[x0, y0], [x0 + 22, y0 - (y0 - meio) * 0.35], [x0 - 14, y0 - (y0 - meio) * 0.7], [x0 + 6, meio]];
  if (!tronco.every(([x, y]) => longe(x, y, 40))) continue;
  vasos.push(vaso(tronco, 1.4, 1.1, tipo));
  // divide em dois ramos que sobem ondulando e terminam numa pequena alça perto da epiderme
  for (const dir of [-1, 1]) {
    const topoC = basal(x0 + dir * 40) + 18;
    const r = [[x0 + 6, meio], [x0 + 6 + dir * 18, meio - (meio - topoC) * 0.35], [x0 + 6 + dir * 26, meio - (meio - topoC) * 0.7], [x0 + 6 + dir * 40, topoC]];
    vasos.push(vaso(r, 1.05, 0.75, tipo));
    const [tx, ty] = r[r.length - 1];
    vasos.push(vaso([[tx, ty], [tx + 4, ty - 8], [tx + 10, ty - 2], [tx + 11, ty + 9]], 0.8, 0.65, tipo));
  }
}
// 4) os ramos do bulbo: um de cada cor, do plexo até o fundo do folículo, e a alça clara envolvendo a papila
vasos.push(vaso([[esqF[0] - 90, plexoY(esqF[0] - 90, 0)], [esqF[0] - 40, PLX - 4], [esqF[0] - 12, esqF[1] + 26], [esqF[0], esqF[1] + 8]], 2, 1.4, 'a'));
vasos.push(vaso([[dirF[0], dirF[1] + 8], [dirF[0] + 14, dirF[1] + 28], [dirF[0] + 44, PLX + 6], [dirF[0] + 100, plexoY(dirF[0] + 100, 9)]], 1.4, 2, 'v'));
const alcaD = `M${f1(esqF[0])},${f1(esqF[1] + 8)} C${f1(esqF[0] + 2)},${f1(fundoF[1] + 17)} ${f1(dirF[0] - 2)},${f1(fundoF[1] + 17)} ${f1(dirF[0])},${f1(dirF[1] + 8)}`;
const alca = `<path d="${alcaD}" stroke="#4a1a30" stroke-width="2.8" fill="none" stroke-linecap="round"/><path d="${alcaD}" stroke="url(#alcaG)" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="${alcaD}" stroke="#ffe6ec" stroke-opacity="0.55" stroke-width="0.6" fill="none" transform="translate(0 -0.6)"/>` +
  `<path d="M${f1(fundoF[0] - 4)},${f1(fundoF[1] + 12)} C${f1(fundoF[0] - 6)},${f1(fundoF[1] + 2)} ${f1(px - 3)},${f1(py + 8)} ${f1(px - 2)},${f1(py + 2)}" stroke="#c8343e" stroke-width="1" fill="none"/>` +
  `<path d="M${f1(fundoF[0] + 4)},${f1(fundoF[1] + 12)} C${f1(fundoF[0] + 6)},${f1(fundoF[1] + 2)} ${f1(px + 3)},${f1(py + 8)} ${f1(px + 2)},${f1(py + 2)}" stroke="#3a4ad6" stroke-width="1" fill="none"/>`;
const onda = (x0, y0, x1, y1, n, amp) => { let d = `M${x0},${y0}`; for (let i = 1; i <= n; i++) { const u = i / n; d += ` Q${f1(x0 + (x1 - x0) * (u - 0.5 / n) + (i % 2 ? amp : -amp))},${f1(y0 + (y1 - y0) * (u - 0.5 / n))} ${f1(x0 + (x1 - x0) * u)},${f1(y0 + (y1 - y0) * u)}`; } return d; };
const nervos = `<path d="${onda(px - 200, PLX + 30, px - 44, py + 30, 7, 8)}" stroke="#7a6418" stroke-width="2.3" fill="none" stroke-linecap="round"/><path d="${onda(px - 200, PLX + 30, px - 44, py + 30, 7, 8)}" stroke="#d8b444" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;

// ---------- músculo eretor: fusiforme, curvo, preso na bainha (meio do folículo) e na base da epiderme ----------
// lado do ângulo aberto: para onde a base do folículo aponta (a raiz desce para a esquerda)
const m0 = L(-10, 128), m1 = [X0 - 205, basal(X0 - 205) - 3];
const mc = [(m0[0] + m1[0]) / 2 + 30, (m0[1] + m1[1]) / 2 + 26];
const qb = (t) => { const u = 1 - t; return [u * u * m0[0] + 2 * u * t * mc[0] + t * t * m1[0], u * u * m0[1] + 2 * u * t * mc[1] + t * t * m1[1]]; };
const qd = (t) => [2 * (1 - t) * (mc[0] - m0[0]) + 2 * t * (m1[0] - mc[0]), 2 * (1 - t) * (mc[1] - m0[1]) + 2 * t * (m1[1] - mc[1])];
const ladoM = (t, k) => { const [x, y] = qb(t), [dx, dy] = qd(t), l = Math.hypot(dx, dy), w = (1.6 + 10 * Math.pow(Math.sin(Math.PI * t), 0.9)) * k; return [x - (dy / l) * w, y + (dx / l) * w]; };
const N = 24;
const musPts = [...Array.from({ length: N + 1 }, (_, i) => ladoM(i / N, 1)), ...Array.from({ length: N + 1 }, (_, i) => ladoM(1 - i / N, -1))];
const musculo = `<path d="M${musPts.map((p) => `${f1(p[0])},${f1(p[1])}`).join(' L')} Z" fill="url(#musc)" stroke="#7e3036" stroke-width="0.9"/>` +
  [-0.62, -0.25, 0.12, 0.5].map((k) => `<path d="M${Array.from({ length: N - 3 }, (_, i) => ladoM((i + 2) / N, k)).map((p) => `${f1(p[0])},${f1(p[1])}`).join(' L')}" fill="none" stroke="#f2b4b4" stroke-opacity="0.38" stroke-width="0.7"/>`).join('');

// ---------- hipoderme: lóbulos compactos de gordura (Voronoi), septos claros, fade para o escuro ----------
const cel = [];
for (let tt = 0; tt < 20000 && cel.length < 900; tt++) {
  const x = rr(-40, W + 40), y = rr(DER - 10, H + 40);
  if (cel.some(([cx, cy]) => Math.hypot(cx - x, cy - y) < 17)) continue;
  cel.push([x, y]);
}
const lobulos = Array.from({ length: 9 }, (_, i) => [(i % 5) * 210 + (i >= 5 ? 105 : 0) + rr(-30, 30), DER + 30 + (i >= 5 ? (H - DER) * 0.62 : (H - DER) * 0.18) + rr(-20, 20)]);
const lobDe = (x, y) => lobulos.reduce((m, l, i) => (Math.hypot(l[0] - x, (l[1] - y) * 1.4) < Math.hypot(lobulos[m][0] - x, (lobulos[m][1] - y) * 1.4) ? i : m), 0);
const vor = Delaunay.from(cel).voronoi([-40, DER - 10, W + 40, H + 40]);
const gord = [];
cel.forEach((c, i) => {
  if (Math.hypot(c[0] - px, c[1] - py) < 44) return; // espaço em volta da papila
  const poly = vor.cellPolygon(i);
  if (!poly) return;
  const lob = lobDe(c[0], c[1]);
  // encolhe a célula: pouco entre células do mesmo lóbulo, mais na borda do lóbulo (o septo)
  const naBorda = [...vor.neighbors(i)].some((j) => lobDe(cel[j][0], cel[j][1]) !== lob);
  const k = naBorda ? 0.8 : 0.93;
  const pts = poly.map(([x, y]) => [c[0] + (x - c[0]) * k, c[1] + (y - c[1]) * k]);
  gord.push(`<path d="M${pts.map((p) => `${f1(p[0])},${f1(p[1])}`).join(' L')} Z" fill="url(#gord)" stroke="#94681e" stroke-width="1.6" stroke-linejoin="round"/>`);
  gord.push(`<ellipse cx="${f1(c[0] - 4)}" cy="${f1(c[1] - 4)}" rx="3.4" ry="2.2" fill="#fff4cc" fill-opacity="0.35"/>`);
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    ${defsFoliculo('f')}
    <linearGradient id="derme" x1="0" y1="${EPI}" x2="0" y2="${DER}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#d9aea4"/><stop offset="1" stop-color="#bd8678"/></linearGradient>
    <linearGradient id="epi" x1="0" y1="${SUP}" x2="0" y2="${EPI}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#d79c9c"/><stop offset="0.22" stop-color="#cc8a90"/><stop offset="1" stop-color="#b9737f"/></linearGradient>
    <linearGradient id="septo" x1="0" y1="${DER}" x2="0" y2="${H}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#d6a49a"/><stop offset="1" stop-color="#9a6e64"/></linearGradient>
    <radialGradient id="gord" cx="0.4" cy="0.35" r="0.75"><stop offset="0" stop-color="#ecd290"/><stop offset="0.7" stop-color="#d2a650"/><stop offset="1" stop-color="#a87c30"/></radialGradient>
    <linearGradient id="musc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c96a6a"/><stop offset="1" stop-color="#a84f55"/></linearGradient>
    <linearGradient id="alcaG" x1="0" x2="1" y1="0" y2="0"><stop offset="0.3" stop-color="#e05a66"/><stop offset="0.7" stop-color="#6a78f0"/></linearGradient>
    <linearGradient id="fade" x1="0" y1="${f1(DER + (H - DER) * 0.12)}" x2="0" y2="${H}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#1a1410" stop-opacity="0"/><stop offset="0.45" stop-color="#1a1410" stop-opacity="0.45"/><stop offset="0.8" stop-color="#0a0908" stop-opacity="0.85"/><stop offset="1" stop-color="#050607" stop-opacity="1"/></linearGradient>
    <radialGradient id="ceu" cx="0.5" cy="0.95" r="0.85"><stop offset="0" stop-color="#26302e"/><stop offset="1" stop-color="#080a0a"/></radialGradient>
    <radialGradient id="funil" cx="${X0}" cy="${SUP + 6}" r="34" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3a1418" stop-opacity="0.55"/><stop offset="1" stop-color="#3a1418" stop-opacity="0"/></radialGradient>
    <radialGradient id="vinheta" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stop-color="#050607" stop-opacity="0"/><stop offset="1" stop-color="#050607" stop-opacity="0.65"/></radialGradient>
    <clipPath id="clipPele"><path d="${peleD}"/></clipPath>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#ceu)"/>
  <g clip-path="url(#clipPele)">
    <rect y="${SUP - 20}" width="${W}" height="${f1(DER - SUP + 20)}" fill="url(#derme)"/>
    <rect y="${f1(DER - 10)}" width="${W}" height="${f1(H - DER + 10)}" fill="url(#septo)"/>
    <g>${celulas}</g>
    <g>${fibras.join('')}</g>
    <g>${gord.join('')}</g>
    <g>${vasos.join('')}</g>
    <g>${nervos}</g>
    ${musculo}
    <path d="${epiD}" fill="url(#epi)"/>
    <path d="${borda}" transform="translate(0 9)" fill="none" stroke="#e6b2ae" stroke-opacity="0.55" stroke-width="7"/>
    <g>${celBasal}</g>
    <path d="${basalD}" fill="none" stroke="#9a4e62" stroke-opacity="0.7" stroke-width="2"/>
    ${alca}
    ${hairFollicle({ x: X0, y: SUP, angle: ANG, scale: S, id: 'f' })}
    <ellipse cx="${X0}" cy="${SUP + 8}" rx="34" ry="12" fill="url(#funil)"/>
  </g>
  <rect y="${f1(DER)}" width="${W}" height="${f1(H - DER + 2)}" fill="url(#fade)"/>
  ${hairShaft({ x: X0, y: SUP, angle: ANG, scale: S, id: 'f' })}
  <path d="${borda}" fill="none" stroke="#f6dcd2" stroke-opacity="0.9" stroke-width="1.6"/>
  <rect width="${W}" height="${H}" fill="url(#vinheta)"/>
  <g font-family="Helvetica, Arial, sans-serif" font-size="21" fill="#f4ece6" fill-opacity="0.85">
    <text x="${W - 28}" y="${f1((SUP + EPI) / 2 + 7)}" text-anchor="end">Epiderme</text>
    <text x="${W - 28}" y="${f1(EPI + 60)}" text-anchor="end">Derme</text>
    <text x="${W - 28}" y="${f1(DER + 50)}" text-anchor="end">Hipoderme</text>
  </g>
</svg>`;
await sharp(Buffer.from(svg)).png().toFile('prova/foliculo-isolado.png');
console.log('prova/foliculo-isolado.png', W + 'x' + H, '| células de gordura', gord.length / 2);
