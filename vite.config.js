import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// O CSS vai embutido no HTML na versão de produção: o navegador não precisa esperar nenhum arquivo para
// desenhar a primeira tela (o Raio-X apontava o .css como bloqueio de renderização). Os caminhos do CSS
// (/fonts, /img) são absolutos, então continuam valendo dentro do <style>.
function cssNoHtml() {
  return {
    name: 'css-no-html',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      const paginas = Object.values(bundle).filter((a) => a.fileName.endsWith('.html'));
      for (const [nome, asset] of Object.entries(bundle)) {
        if (!nome.endsWith('.css')) continue;
        const tag = new RegExp(`<link rel="stylesheet"[^>]*href="/${nome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`);
        let usado = false;
        for (const html of paginas) {
          if (!tag.test(html.source)) continue;
          html.source = html.source.replace(tag, () => `<style>${asset.source}</style>`);
          usado = true;
        }
        if (usado) delete bundle[nome];
      }
    },
  };
}

export default defineConfig({
  plugins: [cssNoHtml()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        privacidade: resolve(import.meta.dirname, 'privacidade/index.html'),
        termos: resolve(import.meta.dirname, 'termos/index.html'),
      },
    },
  },
});
