import { MousePointerClick, MapPin, Send } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: <MousePointerClick className="w-8 h-8 text-primary" />,
      title: "1. Escolha seu pedido",
      description: "Selecione gás, água ou outros produtos."
    },
    {
      icon: <MapPin className="w-8 h-8 text-primary" />,
      title: "2. Informe onde entregar",
      description: "Preencha seu endereço rapidamente."
    },
    {
      icon: <Send className="w-8 h-8 text-primary" />,
      title: "3. Finalize pelo WhatsApp",
      description: "Seu pedido chega organizado para a empresa."
    }
  ];

  return (
    <section id="how-it-works" className="py-24 px-4 relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 uppercase italic">Como Pedir?</h2>
          <p className="text-textMuted text-xl font-medium">É simples!</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          {steps.map((step, index) => (
            <div key={index} className="glass-card p-8 text-center relative group hover:border-primary/30 transition-colors">
              <div className="bg-surface border border-white/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-black/50 group-hover:scale-110 transition-transform duration-300">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-textMuted">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
