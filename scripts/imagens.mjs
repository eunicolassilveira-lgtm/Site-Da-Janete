// Gera as imagens do site em WebP (python não tem Pillow aqui; sharp faz o mesmo)
import sharp from 'sharp';
const O = 'originais/', P = 'public/img/';
const job = async (src, out, w, q = 78) => {
  const r = await sharp(O + src).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: q, effort: 6 }).toFile(P + out);
  console.log(out, r.width + 'x' + r.height, Math.round(r.size / 1024) + 'KB');
};
await job('janete-hero-sem-logo.jpg', 'hero-1080.webp', 1080, 80);
await job('janete-hero-sem-logo.jpg', 'hero-640.webp', 640, 78);
for (const n of [1, 2, 3, 4]) { await job(`janete-foto-${n}.jpg`, `caso-${n}.webp`, 750); await job(`janete-foto-${n}.jpg`, `caso-${n}-480.webp`, 480); }
await job('foto-janete.jpg', 'janete.webp', 920);
await job('foto-janete.jpg', 'janete-520.webp', 520);
for (const n of [1, 2, 3]) await job(`feedback-${n}.jpg`, `feedback-${n}.webp`, 700);
// logo: recortado no que tem tinta, branco sobre transparente
const meta = await sharp(O + 'logo.png').trim().toBuffer({ resolveWithObject: true });
console.log('logo trim', meta.info.width, meta.info.height, meta.info.trimOffsetLeft, meta.info.trimOffsetTop);
await sharp(meta.data).webp({ quality: 90, alphaQuality: 100 }).toFile(P + 'logo.webp');
await sharp(meta.data).png().toFile(P + 'logo.png');
await sharp(meta.data).flatten({ background: '#576753' }).png().toFile('/private/tmp/claude-501/-Users-katrinymachadosantana--claude-spares-spare-cZqnc1/507e9660-7c1c-449c-865f-a330fdfc5451/scratchpad/logo-sage.png');
await sharp(O + 'logo.png').resize(64).png().toFile('public/favicon.png');
