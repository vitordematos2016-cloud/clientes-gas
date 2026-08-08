import { Flame, Droplets } from 'lucide-react';

export function Header() {
  const scrollToOrder = () => {
    document.getElementById('order-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b-0 border-white/10 shadow-md">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
          <div className="flex -space-x-1">
            <Flame className="w-6 h-6 text-primary" />
            <Droplets className="w-6 h-6 text-blue-400" />
          </div>
          <span className="text-xl font-bold tracking-tight">Gás do Nego</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-textMuted">
          <a href="#hero" className="hover:text-primary transition-colors">Início</a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">Como funciona</a>
          <a href="#benefits" className="hover:text-primary transition-colors">Vantagens</a>
        </nav>
        
        <button 
          onClick={scrollToOrder}
          className="bg-primary hover:bg-primaryHover text-background font-bold px-5 py-2 rounded-full transition-all active:scale-95"
        >
          Pedir agora
        </button>
      </div>
    </header>
  );
}
