import { generateWhatsAppContactLink } from '../utils/whatsapp';
import { siteConfig } from '../config';
import { MonitorSmartphone, MessageCircle } from 'lucide-react';

export function WhatsAppButton() {
  const matosLink = generateWhatsAppContactLink(
    siteConfig.matosSolucoesWhatsapp,
    'Olá! Gostei da demonstração do site de Gás e Água e gostaria de um para minha empresa.'
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* Botão Comercial (Matos Soluções) */}
      <a
        href={matosLink}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-primary hover:bg-primaryHover text-white p-3 rounded-2xl shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 group"
        aria-label="Quero esse site"
      >
        <MonitorSmartphone className="w-5 h-5" />
        <span className="text-sm font-bold pr-1 hidden sm:block">Quero esse site</span>
      </a>

      {/* Botão de Contato da Revenda (Demonstração) */}
      <a
        href={generateWhatsAppContactLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-whatsapp hover:bg-whatsappHover text-white p-4 rounded-full shadow-[0_0_20px_rgba(37,211,102,0.5)] hover:shadow-[0_0_30px_rgba(37,211,102,0.8)] transition-all hover:scale-110 active:scale-95 animate-bounce-soft flex items-center justify-center group relative"
        aria-label="Falar com a Revenda"
      >
        <MessageCircle className="w-7 h-7" />
        <span className="absolute right-full mr-4 bg-surface text-text px-4 py-2 rounded-xl text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-white/10">
          Falar com a Revenda (Demo)
        </span>
      </a>
    </div>
  );
}
