import './index.css';
import './legal.css';
const ano = document.querySelector('[data-ano]');
if (ano) ano.textContent = new Date().getFullYear();
