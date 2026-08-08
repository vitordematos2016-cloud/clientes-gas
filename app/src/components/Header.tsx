import { Flame, Droplets } from 'lucide-react';
import { generateWhatsAppContactLink } from '../utils/whatsapp';
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
        
        <div className="flex items-center gap-4">
          <a 
            href={generateWhatsAppContactLink()}
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-textMuted hover:text-whatsapp transition-colors flex items-center"
            title="Chamar no WhatsApp"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </a>
          <a 
            href="https://instagram.com/gas.do_nego" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-textMuted hover:text-primary transition-colors flex items-center"
            title="Siga no Instagram"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
          </a>
          <button 
            onClick={scrollToOrder}
            className="bg-primary hover:bg-primaryHover text-background font-bold px-5 py-2 rounded-full transition-all active:scale-95"
          >
            Pedir agora
          </button>
        </div>
      </div>
    </header>
  );
}
