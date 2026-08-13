import { generateWhatsAppContactLink } from '../utils/whatsapp';
import { siteConfig } from '../config';
import { ArrowRight, MonitorSmartphone } from 'lucide-react';

export function CommercialCTA() {
  const matosLink = generateWhatsAppContactLink(
    siteConfig.matosSolucoesWhatsapp,
    'Olá! Gostei da demonstração do site de Gás e Água e gostaria de um para minha empresa.'
  );

  return (
    <section className="py-12 px-4 border-t border-white/5 bg-surface/30">
      <div className="max-w-4xl mx-auto glass-card p-8 md:p-12 rounded-3xl text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
            <MonitorSmartphone className="w-8 h-8 text-primary" />
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Gostou dessa experiência?</h2>
          <p className="text-textMuted text-lg max-w-2xl mx-auto mb-8">
            Este modelo foi criado pela <strong>Matos Soluções</strong> e pode ser totalmente personalizado para a sua revenda: suas cores, sua logo, seus produtos e preços. Seu cliente pede rápido, e você recebe tudo organizado no WhatsApp.
          </p>
          
          <a
            href={matosLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-background font-bold text-lg px-8 py-4 rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-xl shadow-white/10"
          >
            Quero um site assim para minha empresa
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
