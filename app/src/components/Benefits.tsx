import { Zap, Map, MessageSquare, Flame, Droplets, ShieldCheck } from 'lucide-react';

export function Benefits() {
  const benefits = [
    { icon: <Zap className="w-6 h-6 text-primary" />, title: "Atendimento rápido" },
    { icon: <Map className="w-6 h-6 text-primary" />, title: "Entrega na região" },
    { icon: <MessageSquare className="w-6 h-6 text-primary" />, title: "Pedido direto pelo WhatsApp" },
    { icon: <Flame className="w-6 h-6 text-primary" />, title: "Gás" },
    { icon: <Droplets className="w-6 h-6 text-blue-400" />, title: "Água" },
    { icon: <ShieldCheck className="w-6 h-6 text-primary" />, title: "Atendimento de confiança" },
  ];

  return (
    <section id="benefits" className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {benefits.map((item, index) => (
            <div 
              key={index} 
              className="bg-surface/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 hover:bg-surface/60 transition-colors hover:border-primary/20"
            >
              <div className="bg-background p-3 rounded-xl shadow-inner">
                {item.icon}
              </div>
              <span className="font-medium">{item.title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
