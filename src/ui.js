// As partes interativas: lista de dores, antes e depois, dúvidas e o visualizador dos relatos.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function ui({ reduced = false } = {}) {
  dores(reduced);
  document.querySelectorAll('[data-slider]').forEach((el) => slider(el, reduced));
  faq(reduced);
  lightbox();
  estrutura(reduced);
  const ano = document.querySelector('[data-ano]');
  if (ano) ano.textContent = new Date().getFullYear();
}

function dores(reduced) {
  const btns = [...document.querySelectorAll('[data-dores] .dor')];
  const cta = document.querySelector('[data-dores-cta]');
  const n = cta.querySelector('[data-dores-n]');
  let shown = false;
  btns.forEach((b) => b.addEventListener('click', () => {
    b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    const count = btns.filter((x) => x.getAttribute('aria-pressed') === 'true').length;
    n.textContent = count;
    const any = count > 0;
    if (any === shown) return;
    shown = any;
    if (any) {
      cta.hidden = false;
      if (!reduced) gsap.fromTo(cta, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' });
    } else if (reduced) cta.hidden = true;
    else gsap.to(cta, { opacity: 0, y: 10, duration: 0.3, ease: 'power2.in', onComplete: () => { cta.hidden = true; } });
  }));
}

function slider(el, reduced) {
  const range = el.querySelector('.slider__range');
  const set = (v) => {
    const p = Math.max(0, Math.min(100, v));
    el.style.setProperty('--p', p + '%');
    el.classList.toggle('is-a', p <= 18);
    el.classList.toggle('is-d', p >= 82);
    range.value = Math.round(p);
  };
  const fromX = (x) => { const r = el.getBoundingClientRect(); set(((x - r.left) / r.width) * 100); };
  let tw;
  const stop = () => tw?.kill();
  el.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') { stop(); fromX(e.clientX); } });
  el.addEventListener('touchstart', (e) => { stop(); fromX(e.touches[0].clientX); }, { passive: true });
  el.addEventListener('touchmove', (e) => { stop(); fromX(e.touches[0].clientX); }, { passive: true });
  range.addEventListener('input', () => { stop(); set(Number(range.value)); });
  set(50);
  if (reduced) return;
  // na primeira vez que aparece, a linha de luz passeia sozinha para mostrar que dá para arrastar
  const o = { v: 50 };
  ScrollTrigger.create({
    trigger: el, start: 'top 68%', once: true,
    onEnter: () => {
      tw = gsap.timeline({ delay: 0.4, onUpdate: () => set(o.v) })
        .to(o, { v: 18, duration: 1.2, ease: 'power2.inOut' })
        .to(o, { v: 80, duration: 1.6, ease: 'power2.inOut' })
        .to(o, { v: 50, duration: 1.2, ease: 'power2.inOut' });
    },
  });
}

function faq(reduced) {
  document.querySelectorAll('[data-faq] .faq').forEach((item) => {
    const q = item.querySelector('.faq__q');
    const a = item.querySelector('.faq__a');
    q.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      item.classList.toggle('is-open', open);
      q.setAttribute('aria-expanded', String(open));
      const d = reduced ? 0 : 0.6;
      gsap.killTweensOf(a);
      if (open) gsap.fromTo(a, { height: a.offsetHeight }, { height: 'auto', opacity: 1, duration: d, ease: 'expo.out', onComplete: () => ScrollTrigger.refresh() });
      else gsap.to(a, { height: 0, opacity: 0, duration: d * 0.6, ease: 'power3.out', onComplete: () => ScrollTrigger.refresh() });
    });
  });
}

function lightbox() {
  const dlg = document.querySelector('[data-lightbox]');
  const img = dlg.querySelector('img');
  document.querySelectorAll('[data-relato]').forEach((b) => b.addEventListener('click', () => {
    img.src = b.dataset.relato;
    dlg.showModal();
    dlg.scrollTop = 0;
  }));
  dlg.querySelector('[data-lightbox-close]').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
}

// o fio em corte: as camadas saem uma de dentro da outra e as legendas aparecem
function estrutura(reduced) {
  const el = document.querySelector('[data-estrutura]');
  if (!el || reduced) return;
  const rots = el.querySelectorAll('.e-rot');
  gsap.set(el.querySelector('.estrutura__cortex'), { x: 90, opacity: 0 });
  gsap.set(el.querySelector('.estrutura__medula'), { x: 150, opacity: 0 });
  gsap.set(rots, { opacity: 0 });
  ScrollTrigger.create({
    trigger: el, start: 'top 78%', once: true,
    onEnter: () => gsap.timeline({ delay: 0.2 })
      .to(el.querySelector('.estrutura__cortex'), { x: 0, opacity: 1, duration: 1.2, ease: 'expo.out' })
      .to(el.querySelector('.estrutura__medula'), { x: 0, opacity: 1, duration: 1.2, ease: 'expo.out' }, 0.3)
      .to(rots, { opacity: 1, duration: 0.8, ease: 'power2.out', stagger: 0.18 }, 0.8),
  });
}
