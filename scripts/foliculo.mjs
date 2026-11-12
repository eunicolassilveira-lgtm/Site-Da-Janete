// O folículo aprovado, como componente reutilizável (usado em scripts/foliculo-isolado.mjs e no cenário).
// Coordenadas locais: o poro em (0,0) e o eixo descendo; o grupo é girado pelo ângulo da base do fio.
// "espelho" inverte o lado da glândula (para o lado do ângulo aberto quando o folículo inclina para o outro lado).
// ---------- o componente: HairFollicle({ x, y, angle, scale, anexos }) ----------
// coordenadas locais: poro em (0,0), eixo descendo; o grupo é girado pelo ângulo da base do fio.
// "anexos" liga a glândula sebácea (nos folículos grandes). O músculo é desenhado fora (precisa da epiderme).
const LOBULOS = [[-24, 50, 10], [-36, 58, 9.5], [-23, 66, 10.5], [-37, 72, 8.5], [-28, 81, 8], [-16, 77, 6.5]];
export function hairFollicle({ x, y, angle, scale, id = 'f', anexos = true, espelho = false, dyGlandula = 0 }) {
  const t = `translate(${x} ${y}) rotate(${angle}) scale(${espelho ? -scale : scale} ${scale})`;
  let sebacea = '';
  if (anexos) {
    // células internas: círculos claros com um pontinho no centro
    const cel = [];
    for (const [cx, cy, r] of LOBULOS) {
      for (let k = 0; k < 5; k++) {
        const a = k * 1.3 + cx * 0.1, d = r * (k ? 0.52 : 0);
        const ex = cx + Math.cos(a) * d, ey = cy + Math.sin(a) * d, er = r * 0.26;
        cel.push(`<circle cx="${ex.toFixed(2)}" cy="${ey.toFixed(2)}" r="${er.toFixed(2)}" fill="#fff4cf" fill-opacity="0.75" stroke="#c49a3e" stroke-width="0.25"/><circle cx="${ex.toFixed(2)}" cy="${ey.toFixed(2)}" r="${(er * 0.28).toFixed(2)}" fill="#a07a2a"/>`);
      }
    }
    sebacea = `<g transform="translate(0 ${dyGlandula})">
    <path d="M -10.6 46 C -13 46.5, -15 47.5, -16.5 49" fill="none" stroke="#8a6624" stroke-width="4.6" stroke-linecap="round"/>
    <path d="M -10.6 46 C -13 46.5, -15 47.5, -16.5 49" fill="none" stroke="#e2c070" stroke-width="3" stroke-linecap="round"/>
    <g stroke="#8a6624" stroke-width="1">${LOBULOS.map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id}-sebo)"/>`).join('')}</g>
    <g>${cel.join('')}</g></g>`;
  }
  return `
  <g transform="${t}">
    ${sebacea}
    <!-- bainha externa (bege claro), gota alongada -->
    <path d="M -11 0 C -11 80, -14 160, -22 205 C -28 240, -14 262, 0 262 C 14 262, 28 240, 22 205 C 14 160, 11 80, 11 0 Z" fill="url(#${id}-bainha)" stroke="#b8946a" stroke-width="1"/>
    <!-- bainha radicular interna: linha clara acompanhando a raiz -->
    <path d="M -6 2 C -6 90, -7.2 160, -14.4 200 C -19.6 222, -15 238, -10.5 244" fill="none" stroke="#f8ead0" stroke-opacity="0.85" stroke-width="1.1"/>
    <path d="M 6 2 C 6 90, 7.2 160, 14.4 200 C 19.6 222, 15 238, 10.5 244" fill="none" stroke="#f8ead0" stroke-opacity="0.85" stroke-width="1.1"/>
    <!-- raiz + bulbo (escuro), continuação do fio -->
    <path d="M -4 0 C -4 90, -5 160, -12 200 C -18 228, -10 248, -6 250 Q 0 238 6 250 C 10 248, 18 228, 12 200 C 5 160, 4 90, 4 0 Z" fill="url(#${id}-bulbo)"/>
    <path d="M -2.4 4 C -2.4 90, -3 160, -8.5 202 C -11 220, -9.5 232, -7.5 238" fill="none" stroke="#e8d8cc" stroke-opacity="0.35" stroke-width="0.9" stroke-linecap="round"/>
    <!-- papila dérmica -->
    <ellipse cx="0" cy="248" rx="6" ry="9" fill="#d98a8a"/>
  </g>`;
}
export function hairShaft({ x, y, angle, scale, id = 'f' }) {
  return `
  <g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})">
    <path d="M -4 14 L -4 0 C -4 -70, -1 -150, 38 -236 C 5 -150, 4 -70, 4 0 L 4 14 Z" fill="url(#${id}-fio)"/>
    <path d="M -2.2 -6 C -2.2 -70, 0.5 -140, 30 -214" fill="none" stroke="#f4ece6" stroke-opacity="0.45" stroke-width="0.8" stroke-linecap="round"/>
  </g>`;
}
export function defsFoliculo(id = 'f') {
  return `
    <linearGradient id="${id}-bainha" x1="-28" x2="28" y1="0" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#c9a477"/><stop offset="0.45" stop-color="#e8cfa6"/><stop offset="1" stop-color="#c9a477"/></linearGradient>
    <radialGradient id="${id}-bulbo" cx="0" cy="215" r="40" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3a2a22"/><stop offset="1" stop-color="#0d0907"/></radialGradient>
    <linearGradient id="${id}-fio" x1="-4" x2="6" y1="0" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3a2a22"/><stop offset="0.5" stop-color="#0d0907"/><stop offset="1" stop-color="#1a120e"/></linearGradient>
    <radialGradient id="${id}-sebo" cx="0.38" cy="0.35" r="0.7"><stop offset="0" stop-color="#f0d68a"/><stop offset="1" stop-color="#d9b45a"/></radialGradient>`;
}

