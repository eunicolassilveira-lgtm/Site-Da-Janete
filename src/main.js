import './sections/world.css';
import './sections/hero.css';
import './sections/final.css';
import './index.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createWorld } from './motion/world.js';
import { polen as makePolen } from './motion/polen.js';
import { cabelos as makeCabelos } from './motion/cabelos.js';
import { pill as makePill } from './motion/pill.js';
import { intro } from './motion/intro.js';
import { initLogoIntro } from './motion/logo-intro.js';
import { foot as makeFoot } from './motion/foot.js';
import { reveals } from './motion/reveals.js';
import { smoothScroll } from './motion/smooth.js';
import { FIO } from './motion/cena.js';
import { ui } from './ui.js';

gsap.registerPlugin(ScrollTrigger);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const world = createWorld({ reduced });

// espera a Satoshi e as primeiras imagens do mundo (no máximo 4 s) antes de tirar o logo da frente
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const loaded = Promise.race([
  Promise.all([
    document.fonts.load('400 40px Satoshi'),
    document.fonts.load('500 40px Satoshi'),
    ...world.firstImages.map((img) => (img.complete ? img.decode() : new Promise((r) => img.addEventListener('load', r, { once: true })).then(() => img.decode()))),
  ]).catch(() => {}),
  wait(4000),
]);

const lenis = reduced ? null : smoothScroll();
let revealed;
const onReveal = new Promise((r) => { revealed = r; });
window.__logoIntroBooted = true;
initLogoIntro({ target: '.nav__brand', ready: [loaded], smooth: lenis, onReveal: () => revealed() });

boot();

async function boot() {
  await loaded;
  reveals({ reduced });
  ui({ reduced });
  const pill = makePill({ reduced });
  const dust = makePolen(world, { reduced });
  const fios = makeCabelos(world, { reduced });
  makeFoot({ reduced, fx: () => world.state.x + FIO[FIO.length - 1][0] * world.state.k });
  world.measure();
  document.fonts.ready.then(() => world.measure());

  const hero = document.querySelector('.hero');
  const root = document.documentElement;
  gsap.ticker.add(() => {
    const sy = window.scrollY;
    const vh = window.innerHeight;
    world.tick();
    dust.draw();
    fios.draw();
    hero.classList.toggle('is-out', sy > vh * 0.1);
    root.classList.toggle('is-past-hero', sy > vh * 0.85);
    root.classList.toggle('is-at-end', sy > root.scrollHeight - vh * 1.6);
  });

  await onReveal;
  intro({ world, pill, reduced });
  setTimeout(() => world.loadAll(), reduced ? 0 : 1200);
  ScrollTrigger.refresh();
}
