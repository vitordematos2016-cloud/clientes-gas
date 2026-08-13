import { Flame, Droplets, Package } from 'lucide-react';
import type { ProductItem } from '../types';

export const siteConfig = {
  // Configurações do negócio
  businessName: 'Disk Gás & Água',
  whatsapp: '5545933005119', // Número para onde o pedido será enviado
  matosSolucoesWhatsapp: '5545933005119', // Número comercial da Matos Soluções (CTA)
  instagram: '@suarevenda',
  email: 'contato@suarevenda.com.br',
  phone: '(45) 93300-5119',
  address: 'Rua Exemplo, 123 - Centro, Cascavel - PR',

  // Configurações visuais (cores principais)
  colors: {
    primary: '#f97316', // Laranja
    primaryHover: '#ea580c',
    secondary: '#3b82f6', // Azul
  },

  // Mapas
  mapConfig: {
    GEO_PROVIDER: 'nominatim',
    TILE_PROVIDER: 'openstreetmap',
    TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    NOMINATIM_URL: 'https://nominatim.openstreetmap.org',
    ATTRIBUTION: '&copy; OpenStreetMap contributors'
  },


  // Produtos
  products: [
    {
      id: 'gas-p13',
      name: 'Botijão de Gás P13',
      icon: Flame,
      category: 'gas',
      priceDelivery: 130.00,
      pricePickup: 125.00,
      unit: 'un',
    },
    {
      id: 'agua-20l',
      name: 'Água Mineral 20L',
      icon: Droplets,
      category: 'agua',
      priceDelivery: 20.00,
      pricePickup: 20.00,
      unit: 'un',
    },
    {
      id: 'gelo-5kg',
      name: 'Gelo Cubo 5kg',
      icon: Package,
      category: 'outros',
      priceDelivery: 15.00,
      pricePickup: 12.00,
      unit: 'pct',
    },
    {
      id: 'carvao-4kg',
      name: 'Carvão 4kg',
      icon: Package,
      category: 'outros',
      priceDelivery: 20.00,
      pricePickup: 18.00,
      unit: 'pct',
    }
  ] as ProductItem[],

  // Métodos de Pagamento Suportados
  paymentMethods: [
    { id: 'pix', name: 'Pix', icon: 'QrCode' },
    { id: 'dinheiro', name: 'Dinheiro', icon: 'Banknote' },
    { id: 'cartao', name: 'Cartão', icon: 'CreditCard' }
  ],

  // Dúvidas Frequentes
  faq: [
    {
      question: "Quanto tempo demora a entrega?",
      answer: "Nossa média de entrega é de 15 a 30 minutos, dependendo da sua localização e do fluxo de pedidos no momento."
    },
    {
      question: "Vocês instalam o gás?",
      answer: "Sim, nossos entregadores são treinados para fazer a instalação com total segurança na sua residência, sem custo adicional."
    },
    {
      question: "Posso retirar no local?",
      answer: "Claro! Oferecemos desconto para retirada no local. Basta selecionar essa opção durante o pedido."
    },
    {
      question: "Posso agendar uma entrega?",
      answer: "Sim, na hora de fazer o pedido você pode informar o horário aproximado que deseja receber seus produtos."
    },
    {
      question: "Quais formas de pagamento vocês aceitam?",
      answer: "Aceitamos Pix, Dinheiro e Cartões de Crédito e Débito (levamos a maquininha até você)."
    }
  ]
};
