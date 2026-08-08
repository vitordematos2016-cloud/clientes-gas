import { Flame, Droplets } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-white/5 pt-12 pb-8 px-4 text-center mt-20">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex -space-x-1">
            <Flame className="w-6 h-6 text-primary" />
            <Droplets className="w-6 h-6 text-blue-400" />
          </div>
          <span className="text-2xl font-bold">Gás do Nego</span>
        </div>
        
        <p className="text-textMuted max-w-sm mb-6">
          Rapidez, qualidade e confiança no seu atendimento.
        </p>
        
        <div className="bg-surface/50 px-4 py-2 rounded-full border border-white/10 mb-10 text-primary font-medium tracking-wide">
          (45) 99957-1858
        </div>
        
        <div className="w-full border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-textMuted/60">
          <p>© {new Date().getFullYear()} Gás do Nego. Todos os direitos reservados.</p>
          <p>
            Desenvolvido por <a href="#" className="hover:text-primary transition-colors cursor-pointer">Matos Soluções</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
