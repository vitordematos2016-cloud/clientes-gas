export type PaymentMethod = 'pix' | 'dinheiro' | 'cartao' | string;

export interface PaymentDetails {
  metodo: PaymentMethod;
  precisaTroco: boolean;
  trocoPara?: string;
}

export type DeliveryMethod = 'entrega' | 'retirada';

export interface ProductItem {
  id: string;
  name: string;
  icon?: any; // Para armazenar referência do ícone Lucide
  imageUrl?: string;
  category: 'gas' | 'agua' | 'outros';
  priceDelivery: number;
  pricePickup: number;
  unit: string;
}

export interface OrderItem {
  product: ProductItem;
  quantity: number;
}

export interface OrderData {
  nome: string;
  telefone?: string;
  deliveryMethod: DeliveryMethod;
  tempoEntrega?: string;
  tipoLocal?: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  formattedAddress?: string;
  referencia?: string;
  locationLink?: string;
  itens: OrderItem[];
  pagamento: PaymentDetails;
  observacao?: string;
  total: number;
}
