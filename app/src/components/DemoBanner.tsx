import { generateWhatsAppContactLink } from '../utils/whatsapp';
import { siteConfig } from '../config';
import { Sparkles, ArrowRight } from 'lucide-react';

export function DemoBanner() {
  const matosLink = generateWhatsAppContactLink(
    siteConfig.matosSolucoesWhatsapp,
    'Olá! Gostei da demonstração do site de Gás e Água e gostaria de um para minha empresa.'
  );

  return (
    <div className="fixed top-0 left-0 right-0 h-10 bg-gradient-to-r from-primary to-orange-400 text-white px-4 flex items-center justify-center gap-2 sm:gap-4 text-center z-[110] text-xs sm:text-sm shadow-md">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 shrink-0" />
        <span className="hidden sm:inline">
          <strong>Demonstração:</strong> Modelo personalizável para revendas de gás e água.
        </span>
        <span className="sm:hidden">
          <strong>Demo:</strong> Modelo para revendas.
        </span>
      </div>
      <a
        href={matosLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors whitespace-nowrap font-bold"
      >
        Quero um igual <ArrowRight className="w-3 h-3" />
      </a>
    </div>
  );
}
