// Intro do logo (adaptada do Breu): o monograma JM aparece grande no centro e assenta enquanto o nome
// "Janete Moraes · Terapeuta Capilar" sai de trás com a borda borrada. Quando a página está pronta, o logo
// inteiro voa (FLIP: escala + translação) até a marca da nav e o escuro da tela se dissolve na entrada do hero.
// O markup e o CSS crítico estão inline no <head> do index.html (o primeiro quadro já sai certo).
import { gsap } from 'gsap';

export async function initLogoIntro({ target, ready = [], maxWait = 4000, smooth, onReveal, speed = 1 }) {
  const root = document.documentElement;
  const loader = document.querySelector('[data-logo-intro]');
  const finish = () => {
    root.classList.add('logo-intro-done');
    loader?.remove();
  };
  if (!loader || !root.classList.contains('logo-intro-on')) {
    finish();
    onReveal?.();
    return;
  }

  const logo = loader.querySelector('[data-logo-intro-logo]');
  const mark = loader.querySelector('[data-logo-intro-mark]');
  const word = loader.querySelector('[data-logo-intro-word]');
  const to = typeof target === 'string' ? document.querySelector(target) : target;
  const k = 1 / speed;

  // prende o scroll sem esconder a barra
  smooth?.stop();
  window.scrollTo(0, 0);
  const pin = () => window.scrollY && window.scrollTo(0, 0);
  window.addEventListener('scroll', pin);

  const isReady = Promise.race([
    Promise.all(ready.map((p) => Promise.resolve(p).catch(() => {}))),
    new Promise((r) => setTimeout(r, maxWait)),
  ]);

  // o monograma começa sozinho no centro da tela (desce meia altura do nome) e maior
  const dy = (word.offsetHeight + parseFloat(getComputedStyle(logo).rowGap || 0)) / 2;
  gsap.set(mark, { y: dy, scale: 1.45, opacity: 0, filter: 'blur(10px)', transformOrigin: '50% 50%' });
  gsap.set(word, { '--reveal': '-20%', filter: 'blur(6px)', y: 6 });

  const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } });
  tl.to(mark, { opacity: 1, scale: 1.3, filter: 'blur(0px)', duration: 0.7 * k, ease: 'power2.out' })
    .to(mark, { y: 0, scale: 1, duration: 0.85 * k }, `+=${0.05 * k}`)
    .to(word, { y: 0, '--reveal': '120%', filter: 'blur(0px)', duration: 0.9 * k, ease: 'power2.out' }, `-=${0.3 * k}`);

  Promise.all([isReady, tl.then()]).then(() => {
    const a = logo.getBoundingClientRect();
    const b = to.getBoundingClientRect();
    const fly = gsap.timeline({
      delay: 0.1 * k,
      onComplete: () => {
        window.removeEventListener('scroll', pin);
        finish();
        smooth?.start();
      },
    });
    fly
      .add(() => onReveal?.(), 0.15 * k)
      .to(logo, { x: b.left - a.left, y: b.top - a.top, scale: b.width / a.width, duration: 1 * k, ease: 'expo.inOut' }, 0)
      .to(loader, { backgroundColor: 'rgba(20,24,19,0)', duration: 0.9 * k, ease: 'power2.inOut' }, 0.25 * k);
  });
}
