import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { siteConfig } from '../config';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 px-4 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Dúvidas Frequentes</h2>
        <p className="text-textMuted">As perguntas mais comuns dos nossos clientes.</p>
      </div>

      <div className="space-y-4">
        {siteConfig.faq.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index} 
              className={`bg-surface/50 border rounded-2xl overflow-hidden transition-colors duration-300 ${isOpen ? 'border-primary' : 'border-white/5 hover:border-white/20'}`}
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <span className="font-bold text-lg">{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-textMuted transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="p-6 pt-0 text-textMuted leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
