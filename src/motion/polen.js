// Pólen e vagalumes: pontos de luz fria em várias profundidades que acompanham a descida.
// Cada ponto tem uma profundidade z: anda z vezes o mundo no scroll (os de perto passam mais rápido e maiores,
// os de longe quase parados), sobe devagar e balança. Mais claros perto do eixo da luz (o centro do fio).
// Um canvas só, sprites pré-desenhados, composição "lighter".
export function polen(world, { reduced = false } = {}) {
  const cv = document.querySelector('[data-polen]');
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, dpr = 1, parts = [];
  const sprite = document.createElement('canvas');
  const S = 64;
  sprite.width = sprite.height = S;
  const g = sprite.getContext('2d');
  const grad = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  grad.addColorStop(0, 'rgba(240,255,250,1)');
  grad.addColorStop(0.12, 'rgba(214,246,238,0.9)');
  grad.addColorStop(0.35, 'rgba(160,226,214,0.28)');
  grad.addColorStop(1, 'rgba(120,200,190,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, S, S);

  function seed() {
    const n = world.state.mobile ? 42 : 86;
    parts = Array.from({ length: n }, (_, i) => {
      const z = 0.25 + Math.pow(Math.random(), 1.6) * 1.5;
      return {
        x: Math.random(),
        y: Math.random(),
        z,
        r: (0.7 + Math.random() * 1.3) * (0.6 + z * 0.55),
        sp: (0.004 + Math.random() * 0.012) * (0.5 + z * 0.5),
        ph: Math.random() * Math.PI * 2,
        fl: 0.6 + Math.random() * 1.6,
        a: 0.35 + Math.random() * 0.65,
      };
    });
  }
  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    seed();
  }
  size();
  window.addEventListener('resize', size);

  let last = performance.now(), t = 0;
  function draw(now = performance.now()) {
    const dt = reduced ? 0 : Math.min(0.05, (now - last) / 1000);
    last = now; t += dt;
    const { Ypx, x: sx, k, mouse, vh } = world.state;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    const axis = sx + 836 * k; // eixo da luz na tela
    const span = H + 120;
    for (const p of parts) {
      p.y -= p.sp * dt;
      let yy = (p.y * span - Ypx * p.z * 0.9) % span;
      if (yy < 0) yy += span;
      yy -= 60;
      const xx = p.x * W + Math.sin(t * 0.35 * p.fl + p.ph) * 14 * p.z - mouse.x * 20 * p.z;
      const near = Math.exp(-Math.pow((xx - axis) / (W * 0.28), 2));
      const flick = 0.75 + 0.25 * Math.sin(t * p.fl * 2.1 + p.ph);
      const alpha = p.a * flick * (0.25 + 0.75 * near) * (p.z > 1.2 ? 0.55 : 1);
      if (alpha < 0.02) continue;
      const r = p.r * 7;
      ctx.globalAlpha = Math.min(1, alpha);
      ctx.drawImage(sprite, xx - r, yy - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
  }
  return { draw };
}
