import { MessageCircle } from 'lucide-react';
import { generateWhatsAppContactLink } from '../utils/whatsapp';

export function WhatsAppButton() {
  return (
    <a
      href={generateWhatsAppContactLink()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-whatsapp hover:bg-whatsappHover text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95 animate-bounce-soft flex items-center justify-center group"
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle size={28} />
      <span className="absolute right-full mr-4 bg-surface text-text px-3 py-1.5 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg border border-white/10">
        Precisa de ajuda?
      </span>
    </a>
  );
}
