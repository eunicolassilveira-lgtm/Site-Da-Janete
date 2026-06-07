import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, ChevronDown, ChevronRight, Droplet, Wind, EyeOff, HeartCrack, ArrowRight, ArrowLeftRight, Sparkles, Heart, Search, CheckCircle, Check, MapPin, MessageCircle, Play, Pause, Quote } from 'lucide-react';

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
        <img src={after} alt="Depois" className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none" referrerPolicy="no-referrer" loading="lazy" />
        
        {/* Before (Top, clipped) */}
        <img 
          src={before} 
          alt="Antes" 
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none" 
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          referrerPolicy="no-referrer"
          loading="lazy"
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

  const handleScrollPlanos = () => {
    const container = document.getElementById('planos-container');
    if (container) {
      // Allow a small threshold (10px) to consider it "at the end"
      const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 10;
      if (isAtEnd) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Scroll forward by one card (approx 320px)
        container.scrollBy({ left: 320, behavior: 'smooth' });
      }
    }
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
              src="https://wsrv.nl/?url=raw.githubusercontent.com/eunicolassilveira-lgtm/site-cia-do-tapete/main/2.png&output=webp&w=400&q=80"
              alt="Janete Moraes Terapia Capilar"
              className={`h-14 md:h-20 w-auto object-contain transition-all duration-300 ${!scrolled ? 'brightness-0 invert drop-shadow-md' : ''}`}
            />
          </motion.div>
          <div className="hidden lg:flex items-center gap-8">
            <motion.a variants={fadeDown} href="#planos" className={`text-sm font-medium hover:text-emerald-500 transition-colors ${!scrolled ? 'text-white' : 'text-emerald-950'}`}>Planos</motion.a>
            <motion.a variants={fadeDown} href="#sobre" className={`text-sm font-medium hover:text-emerald-500 transition-colors ${!scrolled ? 'text-white' : 'text-emerald-950'}`}>Sobre</motion.a>
            <motion.a variants={fadeDown} href="#duvidas" className={`text-sm font-medium hover:text-emerald-500 transition-colors ${!scrolled ? 'text-white' : 'text-emerald-950'}`}>Dúvidas</motion.a>
            <motion.a variants={fadeDown} href="https://wa.me/555180625399?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20a%20terapia%20capilar" target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${scrolled ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'}`}>
              Fale Comigo <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </motion.a>
          </div>
          <div className="flex lg:hidden items-center">
             <motion.a variants={fadeDown} href="https://wa.me/555180625399?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20a%20terapia%20capilar" target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${scrolled ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'}`}>
              Fale Comigo <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </motion.a>
          </div>
        </div>
      </motion.header>

      {/* HUGE EMOTIONAL HERO SECTION */}
      <section className="relative min-h-[auto] md:min-h-[100svh] flex flex-col justify-start pt-24 pb-12 md:pb-0 md:pt-0 md:justify-center px-6 overflow-hidden bg-[#576753]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#576753]" />
          {/* Stunning emotional image of a woman loving her hair */}
          <img 
            src="https://github.com/eunicolassilveira-lgtm/site-cia-do-tapete/blob/main/Gemini_Generated_Image_y4un0gy4un0gy4un.png?raw=true" 
            alt="Mulher sorrindo e tocando seu cabelo saudável, sentindo-se confiante" 
            className="absolute inset-0 w-full h-full object-cover object-[50%_25%] md:object-[50%_45%] transform hover:scale-[1.02] transition-transform duration-[20s]"
            fetchPriority="high"
            loading="eager"
            referrerPolicy="no-referrer"
          />
          {/* Deep dark gradient overlay so text is super readable, yet maintains the lush feel */}
          <div className="absolute inset-0 bg-stone-900/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-50 via-[#576753]/60 to-[#576753]/30" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col gap-8 md:gap-12 items-center text-center mt-6 md:mt-12">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-4xl flex flex-col items-center">
            <motion.div variants={fadeUp} className="inline-flex items-center justify-center mx-auto gap-2 px-5 py-2 rounded-full border border-white/20 bg-black/30 backdrop-blur-md mb-8 shadow-2xl">
              <Sparkles className="text-white" size={14} />
              <span className="text-xs uppercase tracking-widest font-semibold text-white">Especialista em Terapia Capilar</span>
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold md:font-medium leading-[1.2] md:leading-[1.1] text-white mx-auto drop-shadow-xl px-4 md:px-0">
              Volte a sentir orgulho do seu cabelo e <br className="hidden md:block"/><span className="italic text-white">paz quando se olhar</span> no espelho.
            </motion.h1>
          </motion.div>
        </div>
      </section>

      {/* EMOTIONAL PAIN POINTS - CHECKLIST */}
      <section className="py-16 md:py-20 bg-stone-50 text-emerald-950 px-6 relative">
        <div className="max-w-5xl mx-auto relative z-10 bg-white rounded-[3rem] p-10 md:p-14 border border-stone-200/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] flex flex-col md:flex-row gap-12 items-center">
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="md:w-5/12 text-center md:text-left">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold md:font-medium leading-[1.2] md:leading-[1.1] mb-5">
              A queda capilar não afeta só a sua autoestima. <br className="hidden md:block"/><span className="italic text-emerald-500">Ela tira a sua paz no dia a dia.</span>
             </h2>
             <p className="text-emerald-800/80 text-lg">Eu sei exatamente o que você está sentindo. <strong className="text-emerald-950">Marque abaixo as situações que fazem parte do seu dia:</strong></p>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="md:w-7/12 w-full"
          >
            <div className="flex overflow-x-auto pb-6 -mx-6 px-6 snap-x snap-mandatory md:flex-col md:space-y-3 md:overflow-visible md:pb-0 md:mx-0 md:px-0 gap-4 md:gap-0 items-stretch [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {[
                'Sente angústia no banho ao ver a quantidade de fios indo embora pelo ralo?',
                'Evita fotos e lugares muito iluminados para não deixar as falhas e entradas à mostra?',
                'Sente insegurança em dias de vento, com medo de despentear e revelar o afinamento?',
                'Já gastou muito dinheiro em produtos "milagrosos" e só colheu frustração?'
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
                    className={`w-[85vw] md:w-full p-5 md:p-6 snap-center flex-shrink-0 rounded-2xl border flex flex-row items-start gap-4 transition-all cursor-pointer select-none ${isChecked ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-stone-50/80 border-stone-200 hover:bg-stone-100'}`}
                  >
                    <div className={`mt-[2px] min-w-[24px] min-h-[24px] w-6 h-6 flex flex-shrink-0 items-center justify-center rounded-md border-2 transition-colors duration-300 box-border ${isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-stone-300 shadow-inner'}`}>
                      <AnimatePresence>
                        {isChecked && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                            <Check size={16} strokeWidth={3} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <p className={`leading-snug font-medium text-left break-words whitespace-normal transition-colors duration-300 flex-1 ${isChecked ? 'text-emerald-950' : 'text-emerald-950/80'} m-0`}>{text}</p>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Scroll Indicator Hint - Mobile Only */}
            <div className="flex justify-center gap-1.5 mt-2 md:hidden">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/80"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/40"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/20"></div>
            </div>
          </motion.div>
        
        </div>
        <AnimatePresence>
          {checkedPains.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-12 text-center relative z-10"
            >
              <a href="#planos" className="btn-shimmer inline-flex items-center justify-center gap-3 bg-emerald-500 text-white px-8 py-4 sm:px-10 sm:py-5 rounded-full font-bold text-base sm:text-lg hover:bg-emerald-600 hover:shadow-[0_0_40px_rgba(87,103,83,0.4)] hover:-translate-y-1 transition-all w-[90%] sm:w-auto">
                Quero recuperar minha autoestima
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* INTERACTIVE EMOTIONAL TRANSFORMATION */}
      <section className="py-16 md:py-20 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center max-w-4xl mx-auto mb-12 md:mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold md:font-medium text-emerald-950 mb-6 leading-[1.2] md:leading-tight">
              Veja dois casos que, segundo os médicos, <br className="hidden md:block"/><span className="italic text-emerald-500">não tinham mais solução.</span>
            </h2>
            <p className="text-lg text-emerald-800/80">
              Com a investigação certa e a terapia adequada, <strong className="text-emerald-950">eu transformei os dois.</strong> Deslize as imagens e compare o antes e o depois.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
             <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
               <SmartSlider 
                 before="https://github.com/eunicolassilveira-lgtm/site-cia-do-tapete/blob/main/calvo%20antes%201.jpeg?raw=true"
                 after="https://github.com/eunicolassilveira-lgtm/site-cia-do-tapete/blob/main/calvo%20depois%201.jpeg?raw=true"
                 label="Repovoamento expressivo alcançado em 6 meses de tratamento."
               />
             </motion.div>
             <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}>
               <SmartSlider 
                 before="https://github.com/eunicolassilveira-lgtm/site-cia-do-tapete/blob/main/calvo%20antes%202.jpeg?raw=true" 
                 after="https://github.com/eunicolassilveira-lgtm/site-cia-do-tapete/blob/main/calvo%20depois%202.jpeg?raw=true"
                 label="Caso diagnosticado como queda irreversível. Repovoamento recuperado em apenas 6 meses."
               />
             </motion.div>
          </div>
        </div>
      </section>

      {/* FEEDBACK SECTION */}
      <section className="py-16 md:py-20 px-6 bg-stone-50">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12 md:mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold md:font-medium text-emerald-950 mb-6 leading-[1.2]">
              Histórias de quem confiou em mim
            </h2>
            <p className="text-lg text-emerald-800/80">
              Veja e ouça o relato de quem viveu essa transformação.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-stretch">
            
            {/* WHATSAPP PRINT feedback */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-white p-6 md:p-8 rounded-[2rem] border border-emerald-900/10 shadow-[0_15px_40px_rgba(87,103,83,0.12)] flex flex-col items-center justify-center h-full hover:shadow-[0_20px_50px_rgba(87,103,83,0.2)] transition-shadow duration-300">
              <div className="w-full max-w-sm mx-auto overflow-hidden rounded-2xl border border-stone-100 mb-6 bg-stone-100 flex items-center justify-center">
                <img 
                  src="https://wsrv.nl/?url=raw.githubusercontent.com/eunicolassilveira-lgtm/Site-Da-Janete/main/WhatsApp%20Image%202026-06-07%20at%2015.40.54.jpeg&output=webp&w=600&q=80" 
                  alt="Relato recebido por WhatsApp" 
                  className="w-full h-auto object-cover max-h-[400px] object-top"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>
              <div className="text-center w-full">
                 <p className="text-sm font-bold text-emerald-900/60 uppercase tracking-wider">Relato recebido por WhatsApp</p>
              </div>
            </motion.div>

            {/* AUDIO feedback */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-white p-6 md:p-8 rounded-[2rem] border border-emerald-900/10 shadow-[0_15px_40px_rgba(87,103,83,0.12)] flex flex-col justify-center h-full hover:shadow-[0_20px_50px_rgba(87,103,83,0.2)] transition-shadow duration-300 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Quote size={120} />
               </div>
               
               <div className="relative z-10 flex flex-col h-full justify-center">
                 <div className="flex items-center gap-4 mb-8">
                   <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                     <Quote className="text-emerald-600" size={24} />
                   </div>
                   <div>
                     <h3 className="font-serif font-bold text-2xl text-emerald-950">Ouça o relato de um paciente</h3>
                   </div>
                 </div>
                 
                 <div className="bg-stone-50 rounded-2xl p-6 border border-emerald-100 w-full mb-6">
                    {/* Native player wrapper styling */}
                    <audio controls className="w-full h-12 outline-none" preload="metadata">
                      {/* O arquivo real de aúdio será adicionado aqui depois */}
                      <source src="https://raw.githubusercontent.com/eunicolassilveira-lgtm/Site-Da-Janete/main/depoimento-audio_2.mp3" type="audio/mpeg" />
                      Seu navegador não suporta o elemento de áudio.
                    </audio>
                 </div>
                 
                 <div className="text-center w-full mt-auto">
                    <p className="text-sm font-bold text-emerald-900/60 uppercase tracking-wider">Relato recebido em áudio</p>
                 </div>
               </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* PRODUCTS STRATEGY */}
      <section id="planos" className="py-16 md:py-20 bg-stone-100 text-emerald-950 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* SECTION 1 - TERAPIA GUIADA (ONLINE) */}
          <div className="scroll-mt-24" id="terapia-online">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-12 text-center max-w-3xl mx-auto">
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold md:font-medium leading-[1.2]">
                Escolha o formato ideal para o seu momento. Em todos eles, eu vou pegar na sua mão do início ao fim.
              </h2>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-10 text-center max-w-2xl mx-auto bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100">
              <span className="inline-block text-[10px] uppercase tracking-widest font-bold bg-emerald-900/10 text-emerald-800 px-3 py-1.5 rounded-full border border-emerald-900/20 mb-4">100% Remoto</span>
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-emerald-950 mb-3">
                Terapia capilar online
              </h3>
              <p className="text-emerald-900/80 font-medium">
                Planos de 1, 3 e 6 meses
              </p>
              <span className="block mt-4 text-sm font-bold text-emerald-950/70 md:hidden">↳ Arraste para o lado e veja o que cada plano entrega.</span>
            </motion.div>

            {/* Carousel Container for Mobile */}
            <div className="relative">
              <div id="planos-container" className="flex overflow-x-auto pb-8 -mx-6 px-6 snap-x snap-mandatory lg:grid lg:grid-cols-3 gap-6 lg:gap-8 items-stretch lg:overflow-visible lg:pb-0 lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth">
                
                {/* PLANO 1 MÊS */}
                <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="min-w-[85vw] md:min-w-0 snap-center bg-white rounded-[2rem] p-8 lg:p-10 border border-emerald-900/10 shadow-[0_15px_40px_rgba(87,103,83,0.12)] flex flex-col hover:shadow-[0_20px_50px_rgba(87,103,83,0.25)] transition-shadow duration-300 h-full relative z-10">
                <div className="mb-6">
                  <h3 className="font-serif text-2xl font-bold text-emerald-950 mb-2">Plano 1 Mês</h3>
                  <p className="text-sm font-medium text-emerald-800/60 h-[40px]">Acompanhamento intensivo e de perto</p>
                </div>
                
                <div className="flex-grow flex flex-col">
                  <ul className="space-y-4 mb-8 text-emerald-950 text-sm flex-grow">
                     <li className="flex gap-3 items-start"><Check className="text-emerald-500 shrink-0 mt-0.5" size={18} /> <span>4 reuniões de alinhamento (1 por semana), para um acompanhamento mais de perto</span></li>
                     <li className="flex gap-3 items-start"><Check className="text-emerald-500 shrink-0 mt-0.5" size={18} /> <span><strong>Resultado esperado:</strong> redução da inflamação e controle total da oleosidade</span></li>
                     <li className="flex gap-3 items-start"><Check className="text-emerald-500 shrink-0 mt-0.5" size={18} /> <span><strong>Brinde:</strong> Protocolo Nutricional (Nutricionista para prescrição de vitaminas)</span></li>
                  </ul>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                    <p className="text-[12px] text-amber-900 leading-snug"><strong>Aviso:</strong> Os produtos do tratamento não estão inclusos e são adquiridos à parte.</p>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-stone-100 text-center">
                  <span className="block text-[11px] text-emerald-800/60 mb-3 uppercase tracking-wider font-bold">Valor sob consulta, varia conforme cada caso</span>
                  <a href="https://wa.me/555180625399?text=Ol%C3%A1%2C%20queria%20consultar%20o%20valor%20do%20Plano%201%20M%C3%AAs%20da%20Terapia%20Guiada!" target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-white border-2 border-emerald-950 text-emerald-950 py-4 rounded-xl font-bold hover:bg-emerald-950 hover:text-white transition-colors">
                    Consultar valor
                  </a>
                </div>
              </motion.div>

              {/* PLANO 3 MESES */}
              <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="min-w-[85vw] md:min-w-0 snap-center bg-white rounded-[2rem] p-8 lg:p-10 border border-emerald-900/10 shadow-[0_15px_40px_rgba(87,103,83,0.12)] flex flex-col hover:shadow-[0_20px_50px_rgba(87,103,83,0.25)] transition-shadow duration-300 h-full relative">
                <div className="mb-6">
                  <h3 className="font-serif text-2xl font-bold text-emerald-950 mb-2">Plano 3 Meses</h3>
                  <p className="text-sm font-medium text-emerald-800/60 h-[40px]">Acompanhamento contínuo</p>
                </div>
                
                <div className="flex-grow flex flex-col">
                  <ul className="space-y-4 mb-8 text-emerald-950 text-sm flex-grow">
                     <li className="flex gap-3 items-start"><Check className="text-emerald-500 shrink-0 mt-0.5" size={18} /> <span>4 reuniões no 1º mês (1 por semana) e, depois, 1 reunião a cada 15 dias</span></li>
                     <li className="flex gap-3 items-start"><Check className="text-emerald-500 shrink-0 mt-0.5" size={18} /> <span>Suporte por WhatsApp a qualquer hora e momento</span></li>
                     <li className="flex gap-3 items-start"><Check className="text-emerald-500 shrink-0 mt-0.5" size={18} /> <span>Acompanhamento para verificar se o tratamento está sendo seguido e ajustar o protocolo quando necessário</span></li>
                     <li className="flex gap-3 items-start"><Check className="text-emerald-500 shrink-0 mt-0.5" size={18} /> <span><strong>Resultado esperado:</strong> estancamento da queda e nascimento de fios limpos</span></li>
                     <li className="flex gap-3 items-start"><Check className="text-emerald-500 shrink-0 mt-0.5" size={18} /> <span><strong>Brinde:</strong> Protocolo Nutricional (Nutricionista para prescrição de vitaminas)</span></li>
                  </ul>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                    <p className="text-[12px] text-amber-900 leading-snug"><strong>Aviso:</strong> Os produtos do tratamento não estão inclusos e são adquiridos à parte.</p>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-stone-100 text-center">
                  <span className="block text-[11px] text-emerald-800/60 mb-3 uppercase tracking-wider font-bold">Valor sob consulta, varia conforme cada caso</span>
                  <a href="https://wa.me/555180625399?text=Ol%C3%A1%2C%20queria%20consultar%20o%20valor%20do%20Plano%203%20Meses%20da%20Terapia%20Guiada!" target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-white border-2 border-emerald-950 text-emerald-950 py-4 rounded-xl font-bold hover:bg-emerald-950 hover:text-white transition-colors">
                    Consultar valor
                  </a>
                </div>
              </motion.div>

              {/* PLANO 6 MESES */}
              <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }} className="min-w-[85vw] md:min-w-0 snap-center bg-[#576753] text-white rounded-[2rem] p-8 lg:p-10 shadow-[0_20px_60px_rgba(87,103,83,0.4)] border border-white/20 flex flex-col relative h-full transform lg:-translate-y-4 hover:shadow-[0_25px_65px_rgba(87,103,83,0.5)] transition-shadow duration-300">
                <div className="absolute top-0 center right-6 lg:right-auto lg:left-1/2 lg:-translate-x-1/2 -translate-y-1/2">
                  <span className="bg-white text-[#576753] text-[10px] uppercase font-bold tracking-widest py-1.5 px-4 rounded-full shadow-lg whitespace-nowrap">O Mais Adotado</span>
                </div>

                <div className="mb-6">
                  <h3 className="font-serif text-2xl font-bold text-white mb-2">Plano 6 Meses</h3>
                  <p className="text-sm font-medium text-white/90 h-[40px]">Resultado completo e duradouro</p>
                </div>
                
                <div className="flex-grow flex flex-col">
                  <ul className="space-y-4 mb-8 text-white text-sm flex-grow">
                     <li className="flex gap-3 items-start"><Check className="text-white shrink-0 mt-0.5" size={18} /> <span>Tudo do Plano 3 Meses, porém ao longo de 6 meses (4 reuniões no 1º mês e reuniões quinzenais nos meses seguintes)</span></li>
                     <li className="flex gap-3 items-start"><Check className="text-white shrink-0 mt-0.5" size={18} /> <span>Suporte por WhatsApp a qualquer hora e momento</span></li>
                     <li className="flex gap-3 items-start"><Check className="text-white shrink-0 mt-0.5" size={18} /> <span>Acompanhamento prolongado para avaliar a evolução e ajustar o protocolo durante todo o tratamento</span></li>
                     <li className="flex gap-3 items-start"><Check className="text-white shrink-0 mt-0.5" size={18} /> <span><strong>Resultado esperado:</strong> inflamação zerada e fios crescendo muito saudáveis</span></li>
                     <li className="flex gap-3 items-start"><Check className="text-white shrink-0 mt-0.5" size={18} /> <span><strong>Brinde:</strong> Protocolo Nutricional (Nutricionista para prescrição de vitaminas)</span></li>
                  </ul>
                  <div className="p-4 bg-white/10 border border-white/20 rounded-xl mb-6">
                    <p className="text-[12px] text-white leading-snug"><strong>Aviso:</strong> Os produtos do tratamento não estão inclusos e são adquiridos à parte.</p>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-white/20 text-center">
                  <span className="block text-[11px] text-emerald-300 mb-3 uppercase tracking-wider font-bold">Valor sob consulta, varia conforme cada caso</span>
                  <a href="https://wa.me/555180625399?text=Ol%C3%A1%2C%20queria%20consultar%20o%20valor%20do%20Plano%206%20Meses%20da%20Terapia%20Guiada!" target="_blank" rel="noopener noreferrer" className="btn-shimmer block w-full text-center bg-emerald-500 text-white py-4 rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg">
                    Consultar valor
                  </a>
                </div>
              </motion.div>
            </div>
            
            {/* Right Arrow Indicators */}
            <button 
              onClick={handleScrollPlanos}
              className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-6 w-14 h-14 md:w-16 md:h-16 flex items-center justify-center bg-emerald-500 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.5)] border-4 border-white text-white z-20 hover:scale-110 hover:bg-emerald-600 transition-all animate-[pulse_2s_ease-in-out_infinite] lg:hidden"
              aria-label="Ver mais planos / Voltar ao início"
            >
              <ChevronRight size={32} className="translate-x-[2px]" />
            </button>
          </div>
            
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="bg-stone-200/50 rounded-2xl p-6 text-center max-w-4xl mx-auto mt-4 border border-stone-200 relative z-0">
             <p className="text-emerald-950 font-medium text-sm md:text-base">
               <strong>Importante:</strong> em todos os planos, os produtos da Janete, necessários para o tratamento ter o resultado esperado, são adquiridos à parte e não estão inclusos no valor do acompanhamento.
             </p>
          </motion.div>
          </div>

          <div className="w-full h-px bg-stone-200 my-8" />

          {/* SECTION 2 - DIAGNÓSTICO PRECISO & SECTION 3 - EXPERIÊNCIA CLÍNICA*/}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* DIAGNÓSTICO */}
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="bg-white rounded-[2rem] p-8 lg:p-10 border border-emerald-900/10 shadow-[0_15px_40px_rgba(87,103,83,0.12)] flex flex-col hover:shadow-[0_20px_50px_rgba(87,103,83,0.25)] transition-shadow duration-300 h-full relative">
              <div className="mb-6">
                <h3 className="font-serif text-2xl font-bold text-emerald-950 mb-3 block">Diagnóstico Preciso</h3>
                <span className="inline-block text-[10px] uppercase tracking-widest font-bold bg-stone-100/80 text-emerald-700 px-3 py-1.5 rounded-full border border-stone-200">Online ou Presencial</span>
              </div>

              <p className="text-emerald-800/80 text-sm leading-relaxed mb-8 flex-grow">
                O passo fundamental. Através de um questionário investigativo com você, descobrirei a causa raiz da queda e montarei seu protocolo exato.
              </p>

              <div>
                <ul className="space-y-4 mb-8 text-emerald-950 text-sm">
                   <li className="flex gap-3 items-start"><Check className="text-emerald-500 shrink-0 mt-0.5" size={18} /> <span><strong>Mapeamento Clínico:</strong> Investigação da causa da queda</span></li>
                   <li className="flex gap-3 items-start"><Check className="text-emerald-500 shrink-0 mt-0.5" size={18} /> <span><strong>Protocolo Nutricional:</strong> Inclui Nutricionista para prescrição de vitaminas</span></li>
                   <li className="flex gap-3 items-start"><Check className="text-emerald-500 shrink-0 mt-0.5" size={18} /> <span><strong>Cura Focada:</strong> Indicação do cronograma de produtos.</span></li>
                </ul>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                  <p className="text-[12px] text-amber-900 leading-snug"><strong>Aviso:</strong> Os produtos de alta performance para uso em casa são adquiridos à parte, pois cada caso demanda uma fórmula diferente.</p>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-stone-100 text-center">
                <a href="https://wa.me/555180625399?text=Ol%C3%A1%2C%20queria%20consultar%20o%20valor%20do%20Diagn%C3%B3stico%20Preciso%21" target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-white border-2 border-emerald-950 text-emerald-950 py-4 rounded-xl font-bold hover:bg-emerald-950 hover:text-white transition-colors">
                  Consultar valor
                </a>
              </div>
            </motion.div>

            {/* PRESENCIAL */}
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="bg-white rounded-[2rem] p-8 lg:p-10 border border-emerald-900/10 shadow-[0_15px_40px_rgba(87,103,83,0.12)] flex flex-col hover:shadow-[0_20px_50px_rgba(87,103,83,0.25)] transition-shadow duration-300 h-full relative">
              <div className="mb-6">
                <h3 className="font-serif text-2xl font-bold text-emerald-950 mb-3 block">A Experiência Clínica</h3>
                <span className="inline-block text-[10px] uppercase tracking-widest font-bold bg-stone-100/80 text-emerald-700 px-3 py-1.5 rounded-full border border-stone-200">Presencial</span>
              </div>

              <p className="text-emerald-800/80 text-sm leading-relaxed mb-8 flex-grow">
                Atendimento presencial focado em ativação celular e profundo relaxamento para o couro cabeludo. O ápice do cuidado.
              </p>

              <div>
                <ul className="space-y-4 mb-8 text-emerald-950 text-sm">
                   <li className="flex gap-3 items-start"><Check className="text-emerald-500 shrink-0 mt-0.5" size={18} /> <span>Tratamento em clínica equipada</span></li>
                   <li className="flex gap-3 items-start"><Check className="text-emerald-500 shrink-0 mt-0.5" size={18} /> <span>Massoterapia craniana para alívio</span></li>
                   <li className="flex gap-3 items-start"><Check className="text-emerald-500 shrink-0 mt-0.5" size={18} /> <span>Aplicação de tecnologias (Laser/LED)</span></li>
                   <li className="flex gap-3 items-start"><Check className="text-emerald-500 shrink-0 mt-0.5" size={18} /> <span><strong>Diagnóstico c/ Nutricionista Incluso</strong></span></li>
                </ul>
              </div>

              <div className="mt-auto pt-4 border-t border-stone-100 text-center">
                <a href="https://wa.me/555180625399?text=Ol%C3%A1%2C%20queria%20consultar%20o%20valor%20da%20Experi%C3%AAncia%20Cl%C3%ADnica%20Presencial%21" target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-white border-2 border-emerald-950 text-emerald-950 py-4 rounded-xl font-bold hover:bg-emerald-950 hover:text-white transition-colors">
                  Consultar valor
                </a>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* ABOUT EXPERT SECTION */}
      <section id="sobre" className="py-16 md:py-20 px-6 bg-[#576753] text-stone-50 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-20 relative z-10">
          
          {/* Image */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} className="w-full md:w-1/2 flex justify-center">
            <div className="relative max-w-[460px] w-full mx-auto">
              <div className="absolute inset-0 bg-white/10 translate-x-6 translate-y-6 rounded-[2.5rem] -z-10" />
              <img 
                src="https://wsrv.nl/?url=raw.githubusercontent.com/eunicolassilveira-lgtm/site-cia-do-tapete/main/WhatsApp%20Image%202026-04-20%20at%2018.26.24.jpeg&output=webp&w=800&q=80" 
                alt="Janete - Terapeuta Capilar Especializada"
                className="rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] object-cover w-full h-auto z-10 relative border-[6px] border-white/20"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <motion.div 
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.6 }}
                className="absolute -bottom-8 -left-2 md:-left-8 bg-white text-[#576753] px-8 py-5 rounded-3xl shadow-2xl flex items-center gap-5 border border-stone-200 z-20"
              >
                <div className="bg-[#576753]/10 text-[#576753] w-14 h-14 rounded-full flex items-center justify-center font-bold text-2xl">+4</div>
                <div className="font-semibold text-[15px] leading-tight text-[#576753]">Anos de<br/>Experiência</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="w-full md:w-1/2 text-center md:text-left">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6 text-xs font-semibold tracking-widest text-white uppercase mx-auto md:mx-0">
              <Sparkles size={14} /> Quem vai cuidar de você
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold md:font-medium leading-[1.1] mb-6 md:mb-8 text-white">
              Muito prazer, <br className="hidden md:block"/><span className="italic text-white">sou a Janete.</span>
            </motion.h2>
            <motion.div variants={fadeUp} className="space-y-6 text-[1.1rem] text-white/90 leading-relaxed font-light">
              <p>
                Sou <strong className="text-white font-medium">Terapeuta Capilar especializada em Tricologia</strong>, a ciência que estuda o cabelo e o couro cabeludo. Mais do que cuidar do seu fio, o meu compromisso é com a paz que você sente ao sorrir na frente do espelho.
              </p>
              <p>
                Dedico a minha vida ao estudo constante. São <strong className="text-white font-medium">mais de 20 especializações na área</strong>, e foi assim que desenvolvi um olhar clínico apurado e acolhedor, capaz de enxergar rápido as causas que costumam passar despercebidas na estética tradicional.
              </p>
              <p>
                Hoje a minha missão não tem fronteiras. Tenho o privilégio de acompanhar e transformar a autoestima de milhares de homens e mulheres, no Brasil e no exterior. E agora eu estou pronta para cuidar de você.
              </p>
            </motion.div>
          </motion.div>
          
        </div>
      </section>

      {/* EMOTIONAL FAQ */}
      <section id="duvidas" className="py-16 md:py-20 px-6 max-w-4xl mx-auto bg-stone-50">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold md:font-medium text-emerald-950 mb-4 md:mb-6">
            Dúvidas Frequentes
          </h2>
          <p className="text-emerald-800/80">Estou aqui para tirar todas as suas dúvidas com carinho.</p>
        </motion.div>
        
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="space-y-2"
        >
          <motion.div variants={fadeUp}>
            <FAQItem 
              question="Já tentei de tudo e nada deu certo. Como ter certeza de que agora vai ser diferente?" 
              answer="Eu compreendo a sua frustração. Produtos de prateleira tratam o sintoma genérico. Na nossa terapia, nós vamos descobrir o que o SEU corpo está pedindo internamente, unindo acolhimento e dados precisos. Quando você trata na raiz hormonal ou emocional correta, o cabelo apenas reflete essa saúde e volta." 
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <FAQItem 
              question="Não moro na sua cidade. Posso ter um acompanhamento online?" 
              answer="Completamente. Posso dizer que 80% da sua recuperação vem do que você aplica, come e sente diariamente na sua casa, seguindo a minha orientação. Nossas consultas de vídeo são profundas e eu estarei a uma mensagem de WhatsApp de distância de você." 
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <FAQItem 
              question="Em quanto tempo eu vou ver os resultados?" 
              answer="Muitos pacientes se sentem mais calmos e no controle logo no 1º mês, ao notarem a queda estabilizando. O repovoamento visual expressivo ocorre em média entre o 3º e 6º mês, variando com a dedicação a cada etapa do protocolo." 
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <FAQItem 
              question="Tenho vergonha de mostrar o meu couro cabeludo. Como funciona a nossa conversa?" 
              answer="O nosso ambiente, seja na clínica ou no vídeo, é 100% focado no seu acolhimento e sigilo. Eu vejo a sua dor com um olhar de carinho e técnica científica. Meu único objetivo é que essa seja a última vez que você se sente assim." 
            />
          </motion.div>
        </motion.div>
      </section>

      {/* EMOTIONAL FOOTER CTA */}
      <footer id="contato" className="relative py-16 md:py-20 px-6 overflow-hidden bg-[#576753] text-emerald-50 text-center flex flex-col items-center">
        {/* Soft, gorgeous aesthetic background */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center mix-blend-luminosity" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#576753] via-[#576753]/90 to-[#576753]" />
        
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <img 
            src="https://wsrv.nl/?url=raw.githubusercontent.com/eunicolassilveira-lgtm/site-cia-do-tapete/main/2.png&output=webp&w=400&q=80"
            alt="Janete Moraes Terapia Capilar"
            className="h-16 md:h-20 w-auto object-contain mb-8 brightness-0 invert opacity-90"
            loading="lazy"
          />
          
          <motion.h2 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} 
            className="font-serif text-3xl sm:text-4xl md:text-6xl font-bold md:font-medium mb-8 leading-[1.2] md:leading-tight text-white drop-shadow-sm px-4 md:px-0"
          >
            Sua jornada feliz com o espelho começa com um simples "olá".
          </motion.h2>
          
          <motion.p 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.1 }}
            className="text-white/90 mb-12 text-base md:text-2xl font-light px-4 md:px-0"
          >
            Cada dia preso a essa angústia é um dia a menos de liberdade. Dê o primeiro passo hoje. Eu vou estar com você do início ao fim.
          </motion.p>
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.2 }} className="w-full px-6 md:px-0">
            <a 
              href="https://wa.me/555180625399?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20a%20terapia%20capilar" 
              target="_blank" rel="noopener noreferrer"
              className="btn-shimmer inline-flex justify-center items-center gap-3 bg-[#455242] text-white border border-white/20 px-8 py-5 md:px-12 md:py-6 rounded-full font-bold text-base md:text-xl hover:bg-[#364134] hover:scale-105 transition-all shadow-xl w-full sm:w-auto mt-4"
            >
              Mandar mensagem no WhatsApp <Phone size={20}/>
            </a>
          </motion.div>
        </div>
        
        <div className="relative z-10 mt-12 text-white/70 text-sm font-medium tracking-wide flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-center mb-8">
          <span className="flex items-center gap-2"><Phone size={16} /> +55 (51) 8062-5399</span>
          <span className="flex items-center gap-2"><MapPin size={16} /> Sapiranga, RS</span>
        </div>

        <div className="relative z-10 text-white/50 text-[13px] font-medium tracking-wide flex flex-col gap-2 items-center">
          <span>© {new Date().getFullYear()} Janete Terapia Capilar. Devolvendo sorrisos.</span>
          <span>Desenvolvido por Arkadigital</span>
        </div>
      </footer>
      
      {/* FLOATING WHATSAPP BUTTON */}
      <a 
        href="https://wa.me/555180625399?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20a%20terapia%20capilar"
        target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-[#25D366] text-white p-4 rounded-full shadow-[0_0_30px_rgba(37,211,102,0.4)] z-50 hover:bg-[#1ebe57] hover:scale-110 active:scale-95 transition-all outline-none flex items-center justify-center"
        aria-label="Falar no WhatsApp"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
      </a>
    </div>
  );
}
