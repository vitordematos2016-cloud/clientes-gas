import { generateWhatsAppContactLink } from '../utils/whatsapp';

export function WhatsAppButton() {
  return (
    <a
      href={generateWhatsAppContactLink()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-whatsapp hover:bg-whatsappHover text-white p-4 rounded-full shadow-[0_0_20px_rgba(37,211,102,0.5)] hover:shadow-[0_0_30px_rgba(37,211,102,0.8)] transition-all hover:scale-110 active:scale-95 animate-bounce-soft flex items-center justify-center group"
      aria-label="Falar no WhatsApp"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      <span className="absolute right-full mr-4 bg-surface text-text px-4 py-2 rounded-xl text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-white/10">
        Fale conosco pelo WhatsApp!
      </span>
    </a>
  );
}
