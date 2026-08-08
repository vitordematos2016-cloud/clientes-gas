export type OrderItemType = 'gas' | 'agua';

export interface OrderItem {
  tipo: OrderItemType;
  quantidade: number;
}

export type PaymentMethod = 'pix' | 'dinheiro' | 'cartao';

export interface PaymentDetails {
  metodo: PaymentMethod;
  precisaTroco: boolean;
  trocoPara?: string;
}

export type DeliveryMethod = 'entrega' | 'retirada';

export interface OrderData {
  nome: string;
  telefone?: string;
  deliveryMethod: DeliveryMethod;
  tipoLocal?: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  referencia?: string;
  locationLink?: string;
  itens: OrderItem[];
  pagamento: PaymentDetails;
  observacao?: string;
  total: number;
}
