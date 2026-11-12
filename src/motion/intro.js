// Entrada do hero (do Breu): tudo começa no escuro. A luz abre num círculo a partir da semente no musgo,
// fundo e jardim assentam em profundidades diferentes, o fio desce pela raiz até a ponta acesa, o título sobe
// linha a linha e a pill de "raiz" faz a assinatura. Os caules da frente entram por último e passam a balançar.
import { gsap } from 'gsap';

export function intro({ world, pill, reduced = false }) {
  const root = document.documentElement;
  const lines = document.querySelectorAll('.hero__title .ln__in');
  const veil = document.querySelector('[data-veil]');
  const fade = ['.nav__links', '.nav__cta', '.hero__sub', '.hero__cta', '.hero__corner'];
  root.classList.remove('is-loading');
  if (reduced) {
    document.querySelector('.hero__title').classList.add('is-open');
    veil.style.display = 'none';
    pill.play();
    return gsap.timeline();
  }
  const vh = window.innerHeight;
  const w = world.intro;
  w.fundo = vh * 0.05; w.strip = vh * 0.1; w.fio = 0;
  gsap.set(lines, { yPercent: 140 });
  gsap.set(fade, { opacity: 0, y: 14 });
  gsap.set('.hero__front', { opacity: 0, y: vh * 0.12 });
  gsap.set(veil, { '--r': '0vmax', '--o': 1 });
  const tl = gsap.timeline();
  tl.to(veil, { '--r': '130vmax', duration: 2.6, ease: 'sine.inOut' }, 0.15)
    .to(veil, { '--o': 0, duration: 1.6, ease: 'sine.inOut' }, 1.5)
    .add(() => { veil.style.display = 'none'; }, 3.15)
    .fromTo('.world__fundo', { opacity: 0 }, { opacity: 1, duration: 1.4, ease: 'power2.out' }, 0)
    .to(w, { fundo: 0, duration: 2.8, ease: 'expo.out' }, 0)
    .fromTo(['.world__strip', '.world__fios', '.world__decor', '.world__polen', '.world__marks'], { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' }, 0.1)
    .to(w, { strip: 0, duration: 2.6, ease: 'expo.out' }, 0.1)
    .to(w, { fio: 1, duration: 2.2, ease: 'power2.inOut' }, 1.1)
    .to(lines, { yPercent: 0, duration: 1.35, ease: 'expo.out', stagger: 0.11 }, 0.75)
    .add(() => document.querySelector('.hero__title').classList.add('is-open'), 1.75)
    .add(pill.play(), 1.55)
    .to('.hero__front', { opacity: 1, y: 0, duration: 2.2, ease: 'expo.out' }, 1.5)
    .to(fade, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09 }, 2.2);
  return tl;
}
