// O nome no rodapé (do Breu): "janete" monumental, medido para a tinta das letras encher a largura menos uma
// margem mínima, no escuro sobre a água parada. Quando entra, por tempo: a luz do fio cai como uma gota até a
// água, a água abre um anel e a luz se espalha pelas letras a partir de onde caiu, com brilho e reflexo.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const WORD = 'janete';
const TRACK = -0.045; // em em
const FONT = 'Satoshi';
const WEIGHT = 400;

export function foot({ reduced = false, fx: getFx } = {}) {
  const agua = document.querySelector('[data-agua]');
  const footEl = document.querySelector('[data-foot]');
  const svgs = [...agua.querySelectorAll('svg')];
  const texts = svgs.map((s) => s.querySelector('text'));
  const grad = agua.querySelector('#janete-luz');
  const gota = agua.querySelector('.agua__gota'), anel = agua.querySelector('.agua__anel'), linha = agua.querySelector('.agua__linha');
  const brilho = agua.querySelector('.agua__brilho');
  const st = { W: 0, asc: 0, m: 0, fx: 0, lit: 0 };

  function measure() {
    const vw = document.documentElement.clientWidth;
    const m = Math.max(10, vw * 0.016);
    const W = vw - 2 * m;
    const c = document.createElement('canvas').getContext('2d');
    c.font = `${WEIGHT} 1000px ${FONT}`;
    const chars = [...WORD];
    const xs = [];
    let x = 0;
    for (const ch of chars) { xs.push(x); x += c.measureText(ch).width + TRACK * 1000; }
    const first = c.measureText(chars[0]), last = c.measureText(chars[chars.length - 1]);
    const inkL = xs[0] - first.actualBoundingBoxLeft;
    const inkR = xs[xs.length - 1] + last.actualBoundingBoxRight;
    const s = W / (inkR - inkL);
    // altura até a linha de base (o "j" desce, mas a água fica na linha de base)
    const asc = Math.max(...chars.map((ch) => c.measureText(ch).actualBoundingBoxAscent)) * s;
    const xsAttr = xs.map((v) => ((v - inkL) * s).toFixed(2)).join(' ');
    for (const [i, svg] of svgs.entries()) {
      svg.setAttribute('viewBox', `0 0 ${W.toFixed(2)} ${asc.toFixed(2)}`);
      svg.setAttribute('width', W.toFixed(2));
      svg.setAttribute('height', asc.toFixed(2));
      svg.style.left = m + 'px';
      const t = texts[i];
      t.setAttribute('x', xsAttr);
      t.setAttribute('y', asc.toFixed(2));
      t.setAttribute('font-size', (1000 * s).toFixed(2));
    }
    let fx = getFx ? getFx() : vw / 2;
    if (!Number.isFinite(fx) || fx <= 0 || fx >= vw) fx = vw / 2;
    Object.assign(st, { W, asc, m, fx });
    agua.style.setProperty('--asc', asc + 'px');
    // a água tem pelo menos 40% da tela: assim a ponta do fio (a 64% da altura) alcança o nome no fim da página
    agua.style.setProperty('--agua-h', Math.max(asc * (vw < 768 ? 1.55 : 1.22), window.innerHeight * 0.4) + 'px');
    agua.style.setProperty('--fx', fx + 'px');
    footEl.style.setProperty('--m', m + 'px');
    grad.setAttribute('cx', (fx - m).toFixed(1));
    grad.setAttribute('cy', asc.toFixed(1));
    grad.setAttribute('r', (st.lit * W * 0.95 + 0.01).toFixed(1));
  }
  function setLit(v) {
    st.lit = v;
    grad.setAttribute('r', (v * st.W * 0.95 + 0.01).toFixed(1));
  }

  measure();
  document.fonts.ready.then(measure);
  window.addEventListener('resize', measure);

  if (reduced) {
    setLit(1);
    gsap.set(brilho, { opacity: 0.4 });
    gsap.set(linha, { opacity: 1 });
    return { measure };
  }
  const o = { v: 0 };
  ScrollTrigger.create({
    trigger: agua, start: 'top 80%', once: true,
    onEnter: () => {
      measure();
      const tl = gsap.timeline();
      tl.fromTo(gota, { scaleY: 0, opacity: 1 }, { scaleY: 1, duration: 0.85, ease: 'power2.in' }, 0)
        .to(gota, { opacity: 0, duration: 0.9, ease: 'power2.out' }, 0.9)
        .fromTo(anel, { scale: 0.2, opacity: 1 }, { scale: 14, opacity: 0, duration: 2.2, ease: 'expo.out' }, 0.82)
        .fromTo(linha, { opacity: 0 }, { opacity: 1, duration: 1.4, ease: 'power2.out' }, 0.82)
        .to(o, { v: 1, duration: 2.6, ease: 'power2.out', onUpdate: () => setLit(o.v) }, 0.84)
        .to(brilho, { opacity: 0.4, duration: 2.2, ease: 'power2.out' }, 1.2);
    },
  });
  return { measure };
}
