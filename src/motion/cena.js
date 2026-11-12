// O mundo em coordenadas da faixa (1672 px de largura, a largura das imagens geradas; os WebP têm 2560 px).
// Faixa: um corte do couro cabeludo desenhado em código (scripts/cenario.mjs), em sete trechos que se emendam
// (263 px de sobreposição): a cabeça com os fios → epiderme → derme → folículo → bulbo, a raiz. A descida é a
// ideia do site: o cabelo se trata na raiz. O fio de luz segue o fio de cabelo até a papila.
import fio from './fio-pontos.json';
import cena from './cena.json';

export const SRC_W = 1672;
export const SEG_H = 941;
export const BAND = 263;
const passo = SEG_H - BAND; // 678

export const SEGMENTOS = Array.from({ length: 7 }, (_, i) => ({ src: `/img/pele-${i}.webp`, top: passo * i }));
export const STRIP_H = passo * 6 + SEG_H; // 5009

// Onde o fio de cabelo central sai da pele: ali nasce o fio de luz (os valores vêm do gerador do cenário).
export const SEMENTE = cena.semente;

// Ponto do mundo que fica no centro da tela quando o centro da seção passa pelo centro da tela.
export const FOCO = cena.foco;

// Primeiro plano desfocado: anda mais rápido que o chão, só nas bordas.
export const DECOR = [
  { img: 'mecha', x: -190, y: 300, w: 430, f: 1.35, at: 0, blur: 5 },
  { img: 'mecha', x: 1430, y: 270, w: 450, f: 1.35, at: 0, blur: 6, flip: true },
  { img: 'celulas', x: -170, y: 1500, w: 360, f: 1.7, blur: 4 },
  { img: 'celulas', x: 1420, y: 2240, w: 380, f: 1.65, blur: 4.5, flip: true },
  { img: 'celulas', x: 1460, y: 2950, w: 320, f: 1.75, blur: 5 },
  { img: 'celulas', x: -190, y: 3620, w: 400, f: 1.7, blur: 4.5, flip: true },
  { img: 'celulas', x: 1420, y: 4200, w: 360, f: 1.8, blur: 5 },
];

export const FIO = fio;

// As três fases do tratamento, marcadas na raiz do folículo central; acendem o cartão [data-nota].
export const MARCOS = cena.marcos;
