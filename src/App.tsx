import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, ChevronDown, Droplet, Wind, EyeOff, HeartCrack, ArrowRight, ArrowLeftRight, Sparkles, Heart, Search, CheckCircle, Check } from 'lucide-react';

/* --- SMART IMAGE SLIDER COMPONENT --- */
const SmartSlider = ({ before, after, label }: { before: string, after: string, label: string }) => {
  const [position, setPosition] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setPosition(percent);
  };

  return (
    <div className="flex flex-col gap-4">
      <div 
        ref={sliderRef}
        className="relative w-full aspect-[4/5] md:aspect-square overflow-hidden rounded-[2rem] shadow-xl cursor-ew-resize select-none touch-pan-y bg-stone-200 group"
        onMouseMove={(e) => handleMove(e.clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      >
        {/* After (Bottom) */}
        <img src={after} alt="Depois" className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none" referrerPolicy="no-referrer" />
        
        {/* Before (Top, clipped) */}
        <img 
          src={before} 
          alt="Antes" 
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none" 
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          referrerPolicy="no-referrer"
        />

        {/* Labels inside */}
        <div className="absolute top-4 left-4 bg-stone-900/80 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full transition-opacity duration-200" style={{ opacity: position > 20 ? 1 : 0}}>Antes</div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-emerald-950 text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full shadow-sm transition-opacity duration-200" style={{ opacity: position < 80 ? 1 : 0}}>Depois</div>

        {/* Center Line and Handle */}
        <div 
          className="absolute top-0 bottom-0 w-[2px] bg-white pointer-events-none z-10 drop-shadow-sm transition-opacity"
          style={{ left: `${position}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-transform group-hover:scale-110">
            <ArrowLeftRight size={18} className="text-emerald-900" />
          </div>
        </div>
      </div>
      <p className="text-center font-medium text-emerald-900/80 text-sm md:text-base px-4">{label}</p>
    </div>
  );
};

/* --- ACCORDION COMPONENT --- */
const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-emerald-900/10 last:border-0 relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full py-6 flex flex-col items-center justify-center text-center hover:text-emerald-600 transition-colors gap-3"
      >
        <span className="font-serif text-xl md:text-2xl font-medium px-4 text-emerald-950">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="shrink-0 text-emerald-400">
          <ChevronDown className="text-emerald-500 mx-auto" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: "auto", opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-emerald-800 leading-relaxed text-center px-4 md:px-8">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* --- MAIN APP --- */
export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [checkedPains, setCheckedPains] = useState<number[]>([]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };
  
  const fadeDown = {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navigation */}
      <motion.header 
        initial="hidden" animate="visible" variants={stagger}
        className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-stone-50/95 backdrop-blur-xl py-3 border-b border-emerald-900/5 shadow-sm' : 'bg-transparent py-6'}`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-center">
          <motion.div variants={fadeDown} className="flex flex-col items-center md:items-start group cursor-pointer">
            <img 
              src="https://github.com/eunicolassilveira-lgtm/site-cia-do-tapete/blob/main/2.png?raw=true"
              alt="Janete Moraes Terapia Capilar"
              className={`h-14 md:h-20 w-auto object-contain transition-all duration-300 ${!scrolled ? 'brightness-0 invert drop-shadow-md' : ''}`}
            />
          </motion.div>
          <motion.a variants={fadeDown} href="https://wa.me/555180625399?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20a%20terapia%20capilar" target="_blank" rel="noopener noreferrer" className={`hidden md:flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${scrolled ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'}`}>
            Fale Comigo <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </div>
      </motion.header>

      {/* HUGE EMOTIONAL HERO SECTION */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* Stunning emotional image of a woman loving her hair */}
          <img 
            src="https://github.com/eunicolassilveira-lgtm/site-cia-do-tapete/blob/main/Gemini_Generated_Image_y4un0gy4un0gy4un.png?raw=true" 
            alt="Mulher sorrindo e tocando seu cabelo saudável, sentindo-se confiante" 
            className="w-full h-full object-cover object-[50%_25%] md:object-[50%_45%] transform hover:scale-[1.02] transition-transform duration-[20s]"
            referrerPolicy="no-referrer"
          />
          {/* Deep dark gradient overlay so text is super readable, yet maintains the lush feel */}
          <div className="absolute inset-0 bg-stone-900/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-50 via-emerald-950/60 to-emerald-950/30" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col gap-12 items-center text-center mt-20 md:mt-12">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-4xl flex flex-col items-center">
            <motion.div variants={fadeUp} className="inline-flex items-center justify-center mx-auto gap-2 px-5 py-2 rounded-full border border-emerald-200/20 bg-emerald-950/40 backdrop-blur-md mb-8 shadow-2xl">
              <Sparkles className="text-amber-200" size={14} />
              <span className="text-xs uppercase tracking-widest font-semibold text-emerald-50">Especialista em Terapia Capilar</span>
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="font-serif text-4xl sm:text-5xl md:text-7xl font-bold md:font-medium leading-[1.1] md:leading-[1.05] text-white mb-6 mx-auto drop-shadow-xl px-4 md:px-0">
              Volte a sentir orgulho do seu cabelo e <br className="hidden md:block"/><span className="italic text-emerald-300">paz ao se olhar</span> no espelho.
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-base sm:text-lg md:text-2xl text-stone-100 leading-relaxed mb-10 max-w-2xl mx-auto text-center font-light drop-shadow-md px-4 md:px-0">
              Muito além de tratar raízes e fios, meu propósito é devolver a sua confiança. Esqueça a aflição da queda e recupere a sua melhor versão com acolhimento.
            </motion.p>
            
            <motion.div variants={fadeUp} className="w-full px-6 md:px-0">
              <a href="#diagnostico" className="btn-shimmer inline-flex items-center justify-center mx-auto gap-3 bg-emerald-500 text-white px-8 py-5 md:px-10 md:py-6 rounded-full font-bold text-base md:text-lg hover:bg-emerald-600 hover:shadow-[0_0_40px_rgba(87,103,83,0.4)] hover:-translate-y-1 transition-all w-full sm:w-auto">
                Quero resgatar minha autoestima
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* EMOTIONAL PAIN POINTS - CHECKLIST */}
      <section className="py-24 bg-stone-50 text-emerald-950 px-6 relative">
        <div className="max-w-5xl mx-auto relative z-10 bg-white rounded-[3rem] p-10 md:p-14 border border-stone-200/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] flex flex-col md:flex-row gap-12 items-center">
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="md:w-5/12 text-center md:text-left">
             <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold md:font-medium leading-[1.2] md:leading-[1.1] mb-5">
              A queda capilar não afeta só o espelho. <br className="hidden md:block"/><span className="italic text-emerald-500">Abala a sua paz.</span>
             </h2>
             <p className="text-emerald-800/80 text-lg">Eu sei exatamente o que você está sentindo. <strong className="text-emerald-950">Marque abaixo as situações que você vivencia hoje:</strong></p>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="md:w-7/12 w-full space-y-3"
          >
            {[
              'Sente angústia profunda na hora do banho ao ver os fios descendo pelo ralo?',
              'Evita fotos ou iluminações fortes tentando esconder entradas e falhas do couro cabeludo?',
              'Sente insegurança em dias de vento pelo medo dele bagunçar e expor o afinamento?',
              'Frustração após gastar rios de dinheiro em produtos "milagrosos" que não deram resultado?'
            ].map((text, idx) => {
              const isChecked = checkedPains.includes(idx);
              return (
                <motion.div 
                  key={idx} 
                  variants={fadeUp}
                  onClick={() => {
                    setCheckedPains((prev) => 
                      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
                    );
                  }}
                  className={`p-5 rounded-2xl border flex gap-4 items-center transition-all cursor-pointer select-none ${isChecked ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-stone-50/80 border-stone-200 hover:bg-stone-100'}`}
                >
                  <div className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-md border-2 transition-colors duration-300 ${isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-stone-300 shadow-inner'}`}>
                    <AnimatePresence>
                      {isChecked && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                          <Check size={16} strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <p className={`leading-snug font-medium text-left transition-colors duration-300 ${isChecked ? 'text-emerald-950' : 'text-emerald-950/80'}`}>{text}</p>
                </motion.div>
              );
            })}
          </motion.div>
        
        </div>
      </section>

      {/* INTERACTIVE EMOTIONAL TRANSFORMATION */}
      <section className="py-32 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center max-w-4xl mx-auto mb-16 md:mb-20">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold md:font-medium text-emerald-950 mb-6 leading-[1.2] md:leading-tight">
              Veja esses dois casos que pelos médicos <br className="hidden md:block"/><span className="italic text-emerald-500">não tinham solução...</span>
            </h2>
            <p className="text-lg text-emerald-800/80">
              Mas que na minha mão, com a investigação correta e a terapia adequada, <strong className="text-emerald-950">eu os transformei!</strong> Deslize as imagens e compare.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
             <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
               <SmartSlider 
                 before="https://github.com/eunicolassilveira-lgtm/site-cia-do-tapete/blob/main/calvo%20antes%201.jpeg?raw=true"
                 after="https://github.com/eunicolassilveira-lgtm/site-cia-do-tapete/blob/main/calvo%20depois%201.jpeg?raw=true"
                 label="Resultado expressivo de repovoamento alcançado em 6 meses de tratamento."
               />
             </motion.div>
             <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}>
               <SmartSlider 
                 before="https://github.com/eunicolassilveira-lgtm/site-cia-do-tapete/blob/main/calvo%20antes%202.jpeg?raw=true" 
                 after="https://github.com/eunicolassilveira-lgtm/site-cia-do-tapete/blob/main/calvo%20depois%202.jpeg?raw=true"
                 label="Diagnóstico de queda irreversível. Repovoamento severo recuperado em 6 meses."
               />
             </motion.div>
          </div>
        </div>
      </section>

      {/* PRODUCTS STRATEGY */}
      <section id="diagnostico" className="py-32 bg-stone-100 text-emerald-950 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-16 md:mb-20 text-center max-w-3xl mx-auto">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold md:font-medium leading-[1.2] mb-6">
              A jornada guiada para <br className="hidden md:block"/><span className="italic text-emerald-500">recuperar seus fios e sua paz</span>
            </h2>
            <p className="text-emerald-800/80 text-lg">Escolha o formato ideal para o seu momento. Em todos eles, eu pegarei na sua mão.</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Produto 1: Diagnóstico */}
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="bg-white rounded-[2.5rem] p-10 md:p-12 shadow-sm border border-stone-200 flex flex-col hover:shadow-xl transition-shadow duration-500 relative">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-8 mx-auto">
                <Search className="text-emerald-800" />
              </div>
              <h3 className="font-serif text-2xl font-medium text-emerald-950 mb-3 text-center">Diagnóstico Preciso</h3>
              <div className="flex justify-center mb-5">
                <span className="text-[10px] uppercase tracking-widest font-bold bg-stone-100/80 text-emerald-700 px-3 py-1.5 rounded-full border border-stone-200">Online ou Presencial</span>
              </div>
              <p className="text-emerald-800/80 mb-6 leading-relaxed text-center font-medium">
                O passo fundamental. Através de um questionário investigativo com você, descobrirei a causa raiz da queda e montarei seu protocolo exato.
              </p>
              <ul className="space-y-4 mb-8 text-emerald-800/90 text-sm flex-grow text-left">
                 <li className="flex gap-2 items-start"><CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" /> <strong>Mapeamento Clínico:</strong> Investigação da causa da queda</li>
                 <li className="flex gap-2 items-start"><CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" /> <strong>Protocolo Nutricional:</strong> Inclui Nutricionista para prescrição de vitaminas</li>
                 <li className="flex gap-2 items-start"><CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" /> <strong>Cura Focada:</strong> Indicação do cronograma de produtos.*</li>
                 <li className="flex gap-2 items-start text-[11px] text-emerald-700/80 p-3 bg-stone-50 rounded-xl border border-emerald-900/5 mt-2">
                   * Os produtos de alta performance para uso em casa são adquiridos à parte, pois cada caso demanda uma fórmula diferente para garantir o seu avanço.
                 </li>
              </ul>
              
              <div className="mt-auto">
                <div className="text-center mb-6 pt-6 border-t border-stone-200">
                  <span className="text-3xl font-bold text-emerald-500">R$ 300</span>
                </div>
                <a href="https://wa.me/555180625399?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20fazer%20o%20Diagn%C3%B3stico%20Preciso%21" target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-white border-2 border-emerald-950 text-emerald-950 py-4 rounded-full font-bold hover:bg-emerald-950 hover:text-white transition-colors">
                  Agendar Diagnóstico
                </a>
              </div>
            </motion.div>

            {/* Produto 2: Terapia Online */}
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="bg-emerald-950 rounded-[2.5rem] p-10 md:p-12 shadow-2xl border border-emerald-900 flex flex-col transform lg:-translate-y-6 relative text-white">
              <div className="inline-flex px-4 py-1.5 bg-emerald-500 text-white rounded-full text-xs font-bold tracking-widest uppercase mb-6 mx-auto shadow-md">O Mais Adotado</div>
              <div className="w-16 h-16 bg-emerald-900 rounded-full flex items-center justify-center mb-6 mx-auto shadow-sm">
                <Phone className="text-emerald-500" />
              </div>
              <h3 className="font-serif text-2xl font-medium mb-3 text-center">Terapia Guiada (Online)</h3>
              <div className="flex justify-center mb-5">
                <span className="text-[10px] uppercase tracking-widest font-bold bg-emerald-900/80 text-emerald-300 px-3 py-1.5 rounded-full border border-emerald-800">100% Remoto</span>
              </div>
              <p className="text-emerald-100/90 mb-6 leading-relaxed text-center font-medium">
                Acompanhamento contínuo estruturado em planos de 1, 3 ou 6 meses, prestando suporte diário para você avançar.
              </p>
              
              <div className="flex-grow">
                <div className="space-y-4 mb-6 bg-emerald-900/50 p-5 rounded-[1.25rem] text-left border border-emerald-800">
                   <div className="text-sm"><strong className="text-emerald-500">No 1º Mês:</strong> Redução da inflamação e controle total da oleosidade.</div>
                   <div className="text-sm"><strong className="text-emerald-500">No 3º Mês:</strong> Estancamento da queda e nascimento de fios limpos.</div>
                   <div className="text-sm"><strong className="text-emerald-500">No 6º Mês:</strong> Inflamação zerada e fios crescendo muito saudáveis.</div>
                </div>
                
                <ul className="space-y-4 mb-8 text-emerald-100/90 text-sm text-left">
                   <li className="flex gap-2 items-start"><CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" /> <strong>Tração Inicial:</strong> 5 reuniões online ao vivo no 1º mês para alinhar detalhes.</li>
                   <li className="flex gap-2 items-start"><CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" /> <strong>Manutenção:</strong> Reuniões quinzenais nos planos de 3 e 6 meses.</li>
                   <li className="flex gap-2 items-start"><CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" /> <strong>Suporte VIP:</strong> Acompanhamento tira-dúvidas diário no WhatsApp.</li>
                   <li className="flex gap-2 items-start"><CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" /> <strong>Protocolo Nutricional:</strong> Inclui Nutricionista p/ vitaminas.</li>
                </ul>
              </div>

              <div className="mt-auto">
                <div className="text-center mb-6 pt-6 border-t border-emerald-800">
                  <span className="block text-[10px] text-emerald-500 uppercase tracking-widest font-bold mb-1">Custo-Benefício Inteligente</span>
                  <span className="text-[1.1rem] font-bold text-white px-2 mt-2 tracking-tight block leading-snug">
                    Mensalidade progressiva garantindo maior desconto no fechamento de planos longos.
                  </span>
                </div>
                <a href="https://docs.google.com/forms/d/e/1FAIpQLScheMu5q53a0Vuiuu-Vxjj_-X6wq92Mh462AEO2amKzasxNDQ/viewform?usp=sharing&ouid=109871994429268708417" target="_blank" rel="noopener noreferrer" className="btn-shimmer block w-full text-center bg-emerald-500 text-white py-4 md:py-5 rounded-full font-bold hover:bg-emerald-600 transition-colors">
                  Investimento por Plano
                </a>
              </div>
            </motion.div>

            {/* Produto 3: Terapia Presencial */}
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }} className="bg-white rounded-[2.5rem] p-10 md:p-12 shadow-sm border border-stone-200 flex flex-col hover:shadow-xl transition-shadow duration-500 relative">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <Heart className="text-emerald-800" />
              </div>
              <h3 className="font-serif text-2xl font-medium text-emerald-950 mb-4 text-center">A Experiência Clínica</h3>
              <p className="text-emerald-800/80 mb-6 leading-relaxed text-center font-medium">
                Atendimento presencial focado em ativação celular e profundo relaxamento para o couro cabeludo. O ápice do cuidado.
              </p>
              <ul className="space-y-4 mb-8 text-emerald-800/90 text-sm flex-grow text-left">
                 <li className="flex gap-2 items-start"><CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" /> Tratamento em clínica equipada</li>
                 <li className="flex gap-2 items-start"><CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" /> Massoterapia craniana para alívio</li>
                 <li className="flex gap-2 items-start"><CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" /> Aplicação de tecnologias (Laser/LED)</li>
                 <li className="flex gap-2 items-start"><CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" /> <strong>Diagnóstico c/ Nutricionista Incluso</strong></li>
              </ul>
              
              <div className="mt-auto">
                <div className="text-center mb-6 pt-6 border-t border-stone-200">
                  <span className="block text-[10px] text-emerald-600/80 uppercase tracking-widest font-bold mb-1">Planos Variáveis</span>
                  <span className="text-2xl font-bold text-emerald-500">R$ 950 a R$ 2.500</span>
                </div>
                <a href="https://docs.google.com/forms/d/e/1FAIpQLScheMu5q53a0Vuiuu-Vxjj_-X6wq92Mh462AEO2amKzasxNDQ/viewform?usp=sharing&ouid=109871994429268708417" target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-white border-2 border-emerald-950 text-emerald-950 py-4 rounded-full font-bold hover:bg-emerald-950 hover:text-white transition-colors">
                  Consultar Presencial
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ABOUT EXPERT SECTION */}
      <section className="py-32 px-6 bg-emerald-950 text-stone-50 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-800/30 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-20 relative z-10">
          
          {/* Image */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} className="w-full md:w-1/2 flex justify-center">
            <div className="relative max-w-[460px] w-full mx-auto">
              <div className="absolute inset-0 bg-emerald-400/20 translate-x-6 translate-y-6 rounded-[2.5rem] -z-10" />
              <img 
                src="https://github.com/eunicolassilveira-lgtm/site-cia-do-tapete/blob/main/WhatsApp%20Image%202026-04-20%20at%2018.26.24.jpeg?raw=true" 
                alt="Janete - Terapeuta Capilar Especializada"
                className="rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] object-cover w-full h-auto z-10 relative border-[6px] border-emerald-900/40"
                referrerPolicy="no-referrer"
              />
              <motion.div 
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.6 }}
                className="absolute -bottom-8 -left-2 md:-left-8 bg-white text-emerald-950 px-8 py-5 rounded-3xl shadow-2xl flex items-center gap-5 border border-stone-200 z-20"
              >
                <div className="bg-emerald-100 text-emerald-800 w-14 h-14 rounded-full flex items-center justify-center font-bold text-2xl">+4</div>
                <div className="font-semibold text-[15px] leading-tight">Anos de<br/>Experiência</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="w-full md:w-1/2 text-center md:text-left">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900 border border-emerald-800 mb-6 text-xs font-semibold tracking-widest text-emerald-500 uppercase mx-auto md:mx-0">
              <Sparkles size={14} /> Quem vai cuidar de você
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold md:font-medium leading-[1.1] mb-6 md:mb-8">
              Muito prazer, <br className="hidden md:block"/><span className="italic text-emerald-500">sou a Janete.</span>
            </motion.h2>
            <motion.div variants={fadeUp} className="space-y-6 text-[1.1rem] text-emerald-100/90 leading-relaxed font-light">
              <p>
                Sou <strong className="text-white font-medium">Terapeuta Capilar especializada em Tricologia</strong>. O meu compromisso não é apenas com o fio do seu cabelo, mas com a paz que você sente ao abrir um sorriso na frente do espelho.
              </p>
              <p>
                Dedico minha vida ao aprofundamento científico constante. Com <strong className="text-white font-medium">mais de 20 especializações de peso na área</strong>, desenvolvi uma análise clínica aguçada e acolhedora, enxergando rapidamente os gatilhos que passam despercebidos na estética tradicional.
              </p>
              <p>
                Hoje a minha missão não tem barreiras. Tenho o privilégio de assumir casos e transformar a autoestima de milhares de homens e mulheres <strong className="text-white font-medium">em todo o Brasil e no Exterior</strong> através do meu acompanhamento. E agora estou pronta para olhar por você.
              </p>
            </motion.div>
          </motion.div>
          
        </div>
      </section>

      {/* EMOTIONAL FAQ */}
      <section className="py-32 px-6 max-w-4xl mx-auto bg-stone-50">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold md:font-medium text-emerald-950 mb-4 md:mb-6">
            Dúvidas Frequentes
          </h2>
          <p className="text-emerald-800/80">Estou aqui para trazer total clareza ao seu coração.</p>
        </motion.div>
        
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="space-y-2"
        >
          <motion.div variants={fadeUp}>
            <FAQItem 
              question="Já chorei ao tentar de tudo e nada adiantar. Como saber se agora vai dar certo?" 
              answer="Eu compreendo a sua frustração. Produtos de prateleira tratam o sintoma genérico. Na nossa terapia, nós vamos descobrir o que o SEU corpo está pedindo internamente, unindo acolhimento e dados precisos. Quando você trata na raiz hormonal ou emocional correta, o cabelo apenas reflete essa saúde e volta." 
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <FAQItem 
              question="Eu não sou da sua cidade, o acompanhamento digital acalento abraça da mesma forma?" 
              answer="Completamente. Posso dizer que 80% da sua recuperação vem do que você aplica, come e sente diariamente na sua casa, seguindo a minha orientação. Nossas consultas de vídeo são profundas e eu estarei a uma mensagem de WhatsApp de distância de você." 
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <FAQItem 
              question="Em quanto tempo eu poderei me olhar no espelho com alegria novamente?" 
              answer="O renascimento capilar respeita o tempo da natureza humana. Logo nas primeiras semanas, você sentirá um couro cabeludo leve e limpo; e estancaremos aquela dor terrível da queda bruta no banho. Os fios 'novinhos em folha' e felizes começarão a saltar visíveis a partir do terceiro ou quarto mês do nosso encontro." 
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <FAQItem 
              question="Sinto vergonha de expor minha cabeça. Como é a conversa?" 
              answer="Meu espaço é, antes de mais nada, uma zona segura, livre de qualquer julgamento. Seja presencial ou em vídeo, o atendimento é particular. Você terá total privacidade, será respeitado(a) e acolhido(a) nas suas fragilidades, com sigilo absoluto." 
            />
          </motion.div>
        </motion.div>
      </section>

      {/* EMOTIONAL FOOTER CTA */}
      <footer id="contato" className="relative py-32 px-6 overflow-hidden bg-emerald-950 text-emerald-50 text-center flex flex-col items-center">
        {/* Soft, gorgeous aesthetic background */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center mix-blend-luminosity" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/90 to-emerald-950" />
        
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <img 
            src="https://github.com/eunicolassilveira-lgtm/site-cia-do-tapete/blob/main/2.png?raw=true"
            alt="Janete Moraes Terapia Capilar"
            className="h-16 md:h-20 w-auto object-contain mb-8 brightness-0 invert opacity-90"
          />
          
          <motion.h2 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} 
            className="font-serif text-3xl sm:text-4xl md:text-6xl font-bold md:font-medium mb-8 leading-[1.2] md:leading-tight text-white drop-shadow-sm px-4 md:px-0"
          >
            Sua jornada feliz com o espelho começa com um simples "olá".
          </motion.h2>
          
          <motion.p 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.1 }}
            className="text-stone-200 mb-12 text-base md:text-2xl font-light px-4 md:px-0"
          >
            Cada dia com angústia de prender o cabelo é um dia a menos de total liberdade. Confie em mim para dar esse primeiro passo junto com você hoje.
          </motion.p>
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.2 }} className="w-full px-6 md:px-0">
            <a 
              href="https://wa.me/555180625399?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20a%20terapia%20capilar" 
              target="_blank" rel="noopener noreferrer"
              className="btn-shimmer inline-flex justify-center items-center gap-3 bg-emerald-500 text-white px-8 py-5 md:px-12 md:py-6 rounded-full font-bold text-base md:text-xl hover:bg-emerald-600 hover:scale-105 transition-all shadow-[0_0_50px_rgba(87,103,83,0.3)] w-full sm:w-auto mt-4"
            >
              Mandar mensagem no WhatsApp <Phone size={20}/>
            </a>
          </motion.div>
        </div>
        
        <div className="relative z-10 mt-32 text-emerald-600/60 text-sm font-medium tracking-wide flex flex-col gap-2 items-center">
          <span>© {new Date().getFullYear()} Janete Terapia Capilar. Devolvendo sorrisos.</span>
          <span>Desenvolvido por Arkadigital</span>
        </div>
      </footer>
    </div>
  );
}
