import { Flame, Droplets, Mail, Clock, MapPin } from 'lucide-react';
import { generateWhatsAppContactLink } from '../utils/whatsapp';
import { siteConfig } from '../config';

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-white/5 pt-12 pb-8 px-4 text-center mt-20">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex -space-x-1">
            <Flame className="w-6 h-6 text-primary" />
            <Droplets className="w-6 h-6 text-blue-400" />
          </div>
          <span className="text-2xl font-bold">{siteConfig.businessName}</span>
        </div>
        
        <p className="text-textMuted max-w-sm mb-10">
          Rapidez, qualidade e confiança no seu atendimento.
        </p>

        {/* Informações de Atendimento */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-10 w-full max-w-2xl bg-surface/30 p-6 rounded-2xl border border-white/5">
          <div className="flex flex-col items-center text-center gap-2 flex-1">
            <Clock className="w-6 h-6 text-primary mb-1" />
            <span className="font-bold text-white">Horário de Funcionamento</span>
            <span className="text-sm text-textMuted">Seg a Sáb: 08h às 20h<br/>Dom e Feriados: 08h às 14h</span>
          </div>
          
          <div className="hidden md:block w-px h-16 bg-white/10"></div>
          
          <div className="flex flex-col items-center text-center gap-2 flex-1">
            <MapPin className="w-6 h-6 text-primary mb-1" />
            <span className="font-bold text-white">Área de Entrega</span>
            <span className="text-sm text-textMuted">Atendemos toda a cidade<br/>e bairros da região</span>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-3 mb-6">
          <h4 className="text-sm font-bold text-textMuted uppercase tracking-wider mb-2">Dados Demonstrativos</h4>
          <a 
            href={generateWhatsAppContactLink()} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-surface/50 px-4 py-2 rounded-full border border-white/10 text-primary font-medium tracking-wide hover:bg-surface transition-colors cursor-pointer"
          >
            {siteConfig.phone}
          </a>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-textMuted mt-2">
            <a 
              href={`mailto:${siteConfig.email}`} 
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>{siteConfig.email}</span>
            </a>
            <a 
              href="#" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              <span>{siteConfig.instagram}</span>
            </a>
          </div>
        </div>
        
        <p className="text-xs text-textMuted/50 max-w-md mx-auto mb-10 italic">
          * Estas informações serão substituídas pelos dados da sua empresa.
        </p>
        
        <div className="w-full border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-textMuted/60">
          <p>© {new Date().getFullYear()} {siteConfig.businessName}. Todos os direitos reservados.</p>
          <p>
            Desenvolvido por <a href={`https://wa.me/${siteConfig.matosSolucoesWhatsapp}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primaryHover transition-colors cursor-pointer font-bold">Matos Soluções</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
