import { Flame, Droplets, ArrowRight } from 'lucide-react';

export function Hero() {
  const scrollToOrder = (type: 'gas' | 'agua') => {
    // We will set this in the global state or dispatch an event, but for now we just scroll to the form
    // The actual form will handle the auto-selection by listening to a custom event
    window.dispatchEvent(new CustomEvent('select-product', { detail: type }));
    document.getElementById('order-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-4 pt-20 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
      
      {/* Floating decorative elements */}
      <div className="absolute top-1/3 left-[10%] text-primary/30 animate-float pointer-events-none">
        <Flame className="w-24 h-24 blur-[2px]" />
      </div>
      <div className="absolute bottom-1/3 right-[10%] text-blue-400/30 animate-float-delayed pointer-events-none">
        <Droplets className="w-20 h-20 blur-[2px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center animate-fade-in">
        
        <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-surface border border-white/10 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-sm font-medium text-textMuted">Atendimento Imediato</span>
        </div>

        <h1 className="text-[clamp(2rem,8vw,4.5rem)] font-extrabold tracking-tight mb-6 leading-tight drop-shadow-2xl">
          Ficou sem gás ou água? <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
            Peça agora e receba com rapidez.
          </span>
        </h1>
        
        <p className="text-[clamp(1rem,4vw,1.25rem)] text-textMuted max-w-2xl mb-12">
          Não deixe sua rotina parar. Faça seu pedido em poucos cliques e garanta a entrega mais rápida e segura da região diretamente na sua casa.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <button 
            onClick={() => scrollToOrder('gas')}
            className="w-full max-w-full min-w-0 sm:w-auto group relative glass hover:bg-surface/90 border-primary/30 px-6 py-3 sm:px-8 sm:py-4 rounded-2xl flex flex-wrap sm:flex-nowrap items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 text-[clamp(0.9rem,3.5vw,1.125rem)]"
          >
            <div className="bg-primary/20 p-2 rounded-full group-hover:bg-primary/30 transition-colors">
              <Flame className="w-6 h-6 text-primary" />
            </div>
            <span className="font-bold">Pedir Gás</span>
            <ArrowRight className="w-5 h-5 text-textMuted group-hover:text-text transition-colors opacity-0 group-hover:opacity-100 sm:-ml-2 sm:group-hover:ml-0" />
          </button>
          
          <button 
            onClick={() => scrollToOrder('agua')}
            className="w-full max-w-full min-w-0 sm:w-auto group relative glass hover:bg-surface/90 border-blue-400/30 px-6 py-3 sm:px-8 sm:py-4 rounded-2xl flex flex-wrap sm:flex-nowrap items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 text-[clamp(0.9rem,3.5vw,1.125rem)]"
          >
            <div className="bg-blue-400/20 p-2 rounded-full group-hover:bg-blue-400/30 transition-colors">
              <Droplets className="w-6 h-6 text-blue-400" />
            </div>
            <span className="font-bold">Pedir Água</span>
            <ArrowRight className="w-5 h-5 text-textMuted group-hover:text-text transition-colors opacity-0 group-hover:opacity-100 sm:-ml-2 sm:group-hover:ml-0" />
          </button>
        </div>
      </div>
    </section>
  );
}
