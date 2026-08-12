import type { OrderData } from '../types';

export const WHATSAPP_NUMBER = '5545933005119';

export function formatWhatsAppMessage(data: OrderData): string {
  const itemsText = data.itens
    .map((item) => `${item.quantidade}x ${item.tipo === 'gas' ? 'Gás' : 'Água'}`)
    .join('\n');

  const paymentText = 
    data.pagamento.metodo === 'pix' ? 'Pix' :
    data.pagamento.metodo === 'cartao' ? 'Cartão' :
    `Dinheiro${data.pagamento.precisaTroco ? ` (Troco para R$ ${data.pagamento.trocoPara})` : ' (Sem troco)'}`;

  const messageParts = [
    `🔥 *NOVO PEDIDO*`,
    `Olá! Gostaria de fazer um pedido.`,
    `\n👤 *Nome:* ${data.nome}`
  ];

  if (data.telefone) {
    messageParts.push(`📱 *Telefone:* ${data.telefone}`);
  }

  messageParts.push(
    `\n📦 *Pedido (${data.deliveryMethod === 'entrega' ? 'Entrega' : 'Retirar no local'}):*\n${itemsText}`
  );

  if (data.deliveryMethod === 'entrega') {
    messageParts.push(
      `\n📍 *Endereço:*\n${data.endereco}, ${data.numero}\nBairro: ${data.bairro}\nCidade: ${data.cidade} - ${data.estado}`
    );
    
    if (data.tipoLocal) {
      messageParts.push(`🏢 *Tipo de Imóvel:* ${data.tipoLocal}`);
    }

    if (data.referencia) {
      messageParts.push(`📌 *Referência:*\n${data.referencia}`);
    }

    if (data.tempoEntrega) {
      messageParts.push(`⏰ *Quando Entregar:* ${data.tempoEntrega}`);
    }

    if (data.locationLink) {
      messageParts.push(`🗺️ *Localização Exata no Mapa:*\n${data.locationLink}`);
    }
  }

  messageParts.push(`\n💰 *Total Estimado:* R$ ${data.total.toFixed(2).replace('.', ',')}`);

  messageParts.push(`\n💳 *Pagamento:*\n${paymentText}`);

  if (data.observacao) {
    messageParts.push(`\n📝 *Observação:*\n${data.observacao}`);
  }

  messageParts.push(`\n_Pedido realizado pelo site._`);

  return messageParts.join('\n');
}

export function generateWhatsAppLink(data: OrderData): string {
  const message = formatWhatsAppMessage(data);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function generateWhatsAppContactLink(): string {
  const message = 'Olá! Vim pelo site e gostaria de atendimento.';
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
