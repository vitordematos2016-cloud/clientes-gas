import type { OrderData } from '../types';
import { Pencil, Send, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { generateWhatsAppLink } from '../utils/whatsapp';

interface OrderSummaryProps {
  data: OrderData;
  onEdit: () => void;
}

export function OrderSummary({ data, onEdit }: OrderSummaryProps) {
  const [isSending, setIsSending] = useState(false);

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      window.location.href = generateWhatsAppLink(data);
      // Fallback para abrir numa nova aba se a mesma janela não suportar (embora a mesma janela seja ideal para deep linking)
      // window.open(generateWhatsAppLink(data), '_blank'); 
    }, 1500);
  };

  if (isSending) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
        <CheckCircle2 className="w-20 h-20 text-whatsapp mb-4 animate-bounce-soft" />
        <h3 className="text-2xl font-bold mb-2">Pedido pronto!</h3>
        <p className="text-textMuted max-w-sm">Estamos abrindo o WhatsApp para você finalizar o envio.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h3 className="text-2xl font-bold mb-6 text-center">Confira seu pedido</h3>
      
      <div className="bg-background rounded-xl p-6 border border-white/5 space-y-4 mb-8">
        <div>
          <span className="text-textMuted text-sm block mb-1">Nome</span>
          <span className="font-medium">{data.nome}</span>
        </div>
        
        <div>
          <span className="text-textMuted text-sm block mb-1">Pedido</span>
          <div className="font-medium">
            {data.itens.map((i, idx) => (
              <div key={idx}>{i.quantidade}x {i.tipo === 'gas' ? 'Gás' : 'Água'}</div>
            ))}
          </div>
        </div>
        
        <div>
          <span className="text-textMuted text-sm block mb-1">Endereço</span>
          <span className="font-medium block">{data.endereco}, {data.numero} - {data.bairro}</span>
          <span className="font-medium block">{data.cidade} - {data.estado}</span>
          {data.referencia && <span className="text-sm text-textMuted mt-1 block">Ref: {data.referencia}</span>}
          {data.locationLink && (
            <span className="text-sm text-whatsapp mt-2 flex items-center gap-1 font-medium bg-whatsapp/10 w-fit px-2 py-1 rounded-md">
              <CheckCircle2 className="w-4 h-4" /> Localização exata do mapa incluída
            </span>
          )}
        </div>
        
        <div>
          <span className="text-textMuted text-sm block mb-1">Pagamento</span>
          <span className="font-medium capitalize">
            {data.pagamento.metodo === 'dinheiro' && data.pagamento.precisaTroco 
              ? `Dinheiro (Troco para R$ ${data.pagamento.trocoPara})` 
              : data.pagamento.metodo}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={onEdit}
          className="flex-1 px-6 py-4 rounded-xl border border-white/10 hover:bg-surface transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <Pencil className="w-5 h-5" />
          Editar informações
        </button>
        
        <button 
          onClick={handleSend}
          className="flex-[2] bg-whatsapp hover:bg-whatsappHover text-white px-6 py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 font-bold shadow-lg shadow-whatsapp/20"
        >
          <Send className="w-5 h-5" />
          Enviar pedido pelo WhatsApp
        </button>
      </div>
    </div>
  );
}
