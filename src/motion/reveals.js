// Textos e cartões entram por tempo quando chegam na tela (nunca scrub em texto).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function splitLines(el) {
  const parts = el.innerHTML.split(/<br\s*\/?>/i).map((s) => s.trim()).filter(Boolean);
  el.innerHTML = parts.map((p) => `<span class="line-mask"><span>${p}</span></span>`).join('');
  return el.querySelectorAll('.line-mask > span');
}

export function reveals({ reduced = false } = {}) {
  // atraso em cascata nos irmãos (listas, grades)
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    const sibs = [...el.parentElement.children].filter((c) => c.hasAttribute('data-reveal'));
    const i = sibs.indexOf(el);
    if (sibs.length > 1) el.dataset.delay = ((i % 4) * 0.09).toFixed(2);
  });
  document.querySelectorAll('[data-lines]').forEach((el) => {
    const lines = splitLines(el);
    if (reduced) return;
    gsap.set(lines, { yPercent: 140 });
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => gsap.to(lines, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.09 }),
    });
  });
  if (reduced) return;
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    gsap.set(el, { opacity: 0, y: 36 });
    ScrollTrigger.create({
      trigger: el, start: 'top 92%', once: true,
      onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', delay: Number(el.dataset.delay) || 0, clearProps: 'transform,opacity' }),
    });
  });
}
