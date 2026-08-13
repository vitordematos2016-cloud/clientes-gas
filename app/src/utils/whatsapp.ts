import type { OrderData } from '../types';
import { siteConfig } from '../config';

export function formatWhatsAppMessage(data: OrderData): string {
  const itemsText = data.itens
    .map((item) => {
      const unitPrice = data.deliveryMethod === 'entrega' ? item.product.priceDelivery : item.product.pricePickup;
      const itemTotal = unitPrice * item.quantity;
      return `${item.quantity}x ${item.product.name} (R$ ${unitPrice.toFixed(2).replace('.', ',')}/${item.product.unit}) = R$ ${itemTotal.toFixed(2).replace('.', ',')}`;
    })
    .join('\n');

  const paymentText = 
    data.pagamento.metodo === 'pix' ? 'Pix' :
    data.pagamento.metodo === 'cartao' ? 'Cartão' :
    data.pagamento.metodo === 'dinheiro' ? `Dinheiro${data.pagamento.precisaTroco ? ` (Troco para R$ ${data.pagamento.trocoPara})` : ' (Sem troco)'}` :
    data.pagamento.metodo;

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
    let enderecoTexto = `\n📍 *Endereço de Entrega:*\n*Rua/Av:* ${data.endereco}, ${data.numero}\n*Bairro:* ${data.bairro}\n*Cidade:* ${data.cidade} - ${data.estado}`;
    if (data.cep) {
      enderecoTexto += `\n*CEP:* ${data.cep}`;
    }
    messageParts.push(enderecoTexto);
    
    if (data.tipoLocal) {
      messageParts.push(`🏢 *Tipo de Imóvel:* ${data.tipoLocal}`);
    }

    if (data.referencia) {
      messageParts.push(`📌 *Referência:*\n${data.referencia}`);
    }

    if (data.tempoEntrega) {
      messageParts.push(`⏰ *Quando Entregar:* ${data.tempoEntrega}`);
    }

    if (data.latitude && data.longitude) {
      const mapsLink = `https://www.openstreetmap.org/?mlat=${data.latitude}&mlon=${data.longitude}#map=18/${data.latitude}/${data.longitude}`;
      messageParts.push(`🗺️ *Abrir localização no mapa:*\n${mapsLink}`);
    } else if (data.locationLink) {
      messageParts.push(`🗺️ *Localização Exata no Mapa:*\n${data.locationLink}`);
    }
  }

  messageParts.push(`\n💰 *Total Estimado:* R$ ${data.total.toFixed(2).replace('.', ',')}`);

  messageParts.push(`\n💳 *Pagamento:*\n${paymentText}`);

  if (data.observacao) {
    messageParts.push(`\n📝 *Observação:*\n${data.observacao}`);
  }

  messageParts.push(`\n_Pedido realizado pelo site demo._`);

  return messageParts.join('\n');
}

export function generateWhatsAppLink(data: OrderData): string {
  const message = formatWhatsAppMessage(data);
  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function generateWhatsAppContactLink(number?: string, customMessage?: string): string {
  const message = customMessage || 'Olá! Vim pelo site e gostaria de atendimento.';
  const targetNumber = number || siteConfig.whatsapp;
  return `https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`;
}
