import { Zap, MapPin, CreditCard, Clock, Smartphone, MessageCircle } from 'lucide-react';

export function Benefits() {
  const benefits = [
    { icon: <Zap className="w-6 h-6 text-primary" />, title: "Pedido rápido", desc: "Escolha tudo sem precisar digitar." },
    { icon: <MapPin className="w-6 h-6 text-primary" />, title: "Entrega fácil", desc: "Use sua localização." },
    { icon: <CreditCard className="w-6 h-6 text-primary" />, title: "Escolha como pagar", desc: "Pix, dinheiro ou cartão." },
    { icon: <Clock className="w-6 h-6 text-primary" />, title: "Agende sua entrega", desc: "Escolha quando deseja receber." },
    { icon: <Smartphone className="w-6 h-6 text-primary" />, title: "Tudo pelo celular", desc: "Feito para smartphones." },
    { icon: <MessageCircle className="w-6 h-6 text-primary" />, title: "Fácil pelo WhatsApp", desc: "O pedido chega organizado." },
  ];

  return (
    <section id="benefits" className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {benefits.map((item, index) => (
            <div 
              key={index} 
              className="bg-surface/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 hover:bg-surface/60 transition-colors hover:border-primary/20 group"
            >
              <div className="bg-background p-3 rounded-xl shadow-inner group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <div>
                <h4 className="font-bold mb-1">{item.title}</h4>
                <p className="text-xs text-textMuted leading-tight">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
