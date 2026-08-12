import type { OrderData } from '../types';
import { Pencil, Send, CheckCircle2, MapPin } from 'lucide-react';
import { useState } from 'react';
import { generateWhatsAppLink } from '../utils/whatsapp';

interface OrderSummaryProps {
  data: OrderData;
  onEdit: () => void;
}

export function OrderSummary({ data, onEdit }: OrderSummaryProps) {
  const [isSending, setIsSending] = useState(false);



  if (isSending) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
        <CheckCircle2 className="w-20 h-20 text-whatsapp mb-4 animate-bounce-soft" />
        <h3 className="text-2xl font-bold mb-2">Pedido pronto!</h3>
        <p className="text-textMuted max-w-sm mb-6">Estamos abrindo o WhatsApp para você finalizar o envio.</p>
        
        {data.deliveryMethod === 'retirada' && (
          <div className="bg-surface border border-white/10 rounded-xl p-6 text-left w-full max-w-sm animate-slide-up">
            <h4 className="font-bold text-lg text-primary mb-2 flex items-center gap-2">
              <span className="bg-primary/20 p-1.5 rounded-lg"><MapPin className="w-5 h-5" /></span>
              Endereço para Retirada
            </h4>
            <p className="text-text mb-1">Rua Exemplo, 123 - Bairro Centro</p>
            <p className="text-textMuted text-sm mb-4">Sua Cidade - PR, 80000-000</p>
            <a 
              href="https://maps.google.com/?q=Rua+Exemplo,+123+-+Bairro+Centro,+Sua+Cidade+-+PR" 
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-center font-medium transition-colors"
            >
              Abrir no Google Maps
            </a>
          </div>
        )}
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
          <span className="text-textMuted text-sm block mb-1">Pedido ({data.deliveryMethod === 'entrega' ? 'Entrega' : 'Retirar no local'})</span>
          <div className="font-medium">
            {data.itens.map((i, idx) => {
              let unitPrice = 0;
              if (i.tipo === 'gas') {
                unitPrice = data.deliveryMethod === 'entrega' ? 130 : 125;
              } else if (i.tipo === 'agua') {
                unitPrice = 20;
              }
              const itemTotal = unitPrice * i.quantidade;
              const itemName = i.tipo === 'gas' ? 'Gás' : 'Água';
              return (
                <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
                  <span>
                    {i.quantidade}x {itemName} 
                    <span className="text-xs text-textMuted ml-2">(R$ {unitPrice.toFixed(2).replace('.', ',')}/un)</span>
                  </span>
                  <span className="text-primary font-medium">R$ {itemTotal.toFixed(2).replace('.', ',')}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        {data.deliveryMethod === 'entrega' && (
          <div>
            <span className="text-textMuted text-sm block mb-1">Endereço</span>
            <span className="font-medium block">{data.endereco}, {data.numero} - {data.bairro}</span>
            <span className="font-medium block">{data.cidade} - {data.estado}</span>
            {data.tipoLocal && <span className="text-sm text-textMuted mt-1 block">Tipo de Imóvel: {data.tipoLocal}</span>}
            {data.referencia && <span className="text-sm text-textMuted mt-1 block">Ref: {data.referencia}</span>}
            {data.tempoEntrega && <span className="text-sm text-textMuted mt-1 block text-primary">Quando entregar: {data.tempoEntrega}</span>}
            {data.locationLink && (
              <span className="text-sm text-whatsapp mt-2 flex items-center gap-1 font-medium bg-whatsapp/10 w-fit px-2 py-1 rounded-md">
                <CheckCircle2 className="w-4 h-4" /> Localização exata do mapa incluída
              </span>
            )}
          </div>
        )}
        
        <div>
          <span className="text-textMuted text-sm block mb-1">Pagamento</span>
          <span className="font-medium capitalize">
            {data.pagamento.metodo === 'dinheiro' && data.pagamento.precisaTroco 
              ? `Dinheiro (Troco para R$ ${data.pagamento.trocoPara})` 
              : data.pagamento.metodo}
          </span>
        </div>

        <div className="pt-4 border-t border-white/10 flex justify-between items-center">
          <span className="text-lg font-bold">Total Estimado</span>
          <span className="text-2xl font-bold text-primary">R$ {data.total.toFixed(2).replace('.', ',')}</span>
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
        
        <a 
          href={generateWhatsAppLink(data)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            setTimeout(() => setIsSending(true), 150);
          }}
          className="flex-[2] bg-whatsapp hover:bg-whatsappHover text-white px-6 py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 font-bold shadow-lg shadow-whatsapp/20"
        >
          <Send className="w-5 h-5" />
          Enviar pedido pelo WhatsApp
        </a>
      </div>
    </div>
  );
}
