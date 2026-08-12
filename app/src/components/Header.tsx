import { useState } from 'react';
import { Flame, Droplets, MoreVertical, X } from 'lucide-react';
import { generateWhatsAppContactLink } from '../utils/whatsapp';

import { createPortal } from 'react-dom';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToOrder = () => {
    document.getElementById('order-section')?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] glass border-b-0 border-white/10 shadow-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Mobile Menu Button (Left) */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 -ml-2 text-textMuted hover:text-primary transition-colors"
            >
              <MoreVertical className="w-6 h-6" />
            </button>
          </div>

          {/* Logo (Center on mobile, Left on desktop) */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { window.scrollTo(0, 0); setIsMenuOpen(false); }}>
            <div className="flex -space-x-1">
              <Flame className="w-6 h-6 text-primary" />
              <Droplets className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:block md:block">Disk Gás & Água</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-textMuted">
            <button onClick={() => scrollToSection('hero')} className="hover:text-primary transition-colors">Início</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-primary transition-colors">Como funciona</button>
            <button onClick={() => scrollToSection('benefits')} className="hover:text-primary transition-colors">Vantagens</button>
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
              href="#" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-textMuted hover:text-primary transition-colors flex items-center"
              title="Siga no Instagram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <button 
              onClick={scrollToOrder}
              className="bg-primary hover:bg-primaryHover text-background font-bold px-4 py-2 text-sm sm:text-base sm:px-5 rounded-full transition-all active:scale-95 whitespace-nowrap"
            >
              Pedir agora
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay via Portal */}
      {isMenuOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] md:hidden">
          {/* Backdrop Blur */}
          <div 
            className="absolute inset-0 bg-background/60 backdrop-blur-md transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Drawer Content */}
          <div className="absolute top-0 left-0 bottom-0 w-3/4 max-w-sm bg-surface border-r border-white/10 shadow-2xl animate-fade-in flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-primary" />
                <span className="font-bold text-lg">Disk Gás & Água</span>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-textMuted hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="flex flex-col p-4 gap-4 mt-4">
              <button onClick={() => scrollToSection('hero')} className="text-left text-lg font-medium text-textMuted hover:text-primary transition-colors">Início</button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-left text-lg font-medium text-textMuted hover:text-primary transition-colors">Como funciona</button>
              <button onClick={() => scrollToSection('benefits')} className="text-left text-lg font-medium text-textMuted hover:text-primary transition-colors">Vantagens</button>
              <button onClick={() => scrollToSection('faq')} className="text-left text-lg font-medium text-textMuted hover:text-primary transition-colors">Dúvidas Frequentes</button>
            </nav>

            <div className="mt-auto p-4 border-t border-white/5 space-y-4">
              <a 
                href={generateWhatsAppContactLink()}
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 text-textMuted hover:text-whatsapp transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>Falar no WhatsApp</span>
              </a>
              <a 
                href="#" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 text-textMuted hover:text-primary transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                <span>Siga no Instagram</span>
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
