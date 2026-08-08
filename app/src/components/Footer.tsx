import { Flame, Droplets, Mail } from 'lucide-react';
import { generateWhatsAppContactLink } from '../utils/whatsapp';

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-white/5 pt-12 pb-8 px-4 text-center mt-20">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex -space-x-1">
            <Flame className="w-6 h-6 text-primary" />
            <Droplets className="w-6 h-6 text-blue-400" />
          </div>
          <span className="text-2xl font-bold">Gás do Nego</span>
        </div>
        
        <p className="text-textMuted max-w-sm mb-6">
          Rapidez, qualidade e confiança no seu atendimento.
        </p>
        
        <div className="flex flex-col items-center gap-3 mb-10">
          <a 
            href={generateWhatsAppContactLink()} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-surface/50 px-4 py-2 rounded-full border border-white/10 text-primary font-medium tracking-wide hover:bg-surface transition-colors cursor-pointer"
          >
            45 99957-1858
          </a>
          <div className="flex items-center gap-6 text-textMuted">
            <a 
              href="mailto:gasibema@hotma.com" 
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>gasibema@hotma.com</span>
            </a>
            <a 
              href="https://instagram.com/gas.do_nego" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              <span>@gas.do_nego</span>
            </a>
          </div>
        </div>
        
        <div className="w-full border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-textMuted/60">
          <p>© {new Date().getFullYear()} Gás do Nego. Todos os direitos reservados.</p>
          <p>
            Desenvolvido por <a href="#" className="hover:text-primary transition-colors cursor-pointer">Matos Soluções</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
