import { useState, useEffect } from 'react';
import { Flame, Droplets, ArrowRight, Banknote, CreditCard, QrCode, MapPin, Loader2, Map as MapIcon } from 'lucide-react';
import type { OrderData, OrderItemType, PaymentMethod } from '../types';
import { OrderSummary } from './OrderSummary';

export function OrderForm() {
  const [step, setStep] = useState<'form' | 'summary'>('form');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Estado do formulário
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [referencia, setReferencia] = useState('');
  
  const [locationLink, setLocationLink] = useState('');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  
  const [selectedTypes, setSelectedTypes] = useState<Record<OrderItemType, boolean>>({
    gas: false,
    agua: false
  });
  
  const [quantities, setQuantities] = useState<Record<OrderItemType, number>>({
    gas: 1,
    agua: 1
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [precisaTroco, setPrecisaTroco] = useState<boolean>(false);
  const [trocoPara, setTrocoPara] = useState('');
  
  const [observacao, setObservacao] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'entrega' | 'retirada'>('entrega');
  const [tipoLocal, setTipoLocal] = useState('Casa');
  const [tempoEntrega, setTempoEntrega] = useState('Assim que possível');
  const [tempoEntregaPersonalizado, setTempoEntregaPersonalizado] = useState('');

  // Listener para o botão do Hero
  useEffect(() => {
    const handleSelectProduct = (e: Event) => {
      const customEvent = e as CustomEvent<OrderItemType>;
      setSelectedTypes({ ...selectedTypes, [customEvent.detail]: true });
    };

    window.addEventListener('select-product', handleSelectProduct);
    return () => window.removeEventListener('select-product', handleSelectProduct);
  }, [selectedTypes]);

  const toggleType = (type: OrderItemType) => {
    setSelectedTypes(prev => ({ ...prev, [type]: !prev[type] }));
    setErrorMsg('');
  };

  const updateQuantity = (type: OrderItemType, delta: number) => {
    setQuantities(prev => {
      const newVal = prev[type] + delta;
      return { ...prev, [type]: newVal > 0 ? newVal : 1 };
    });
  };

  const handleReview = () => {
    if (!nome.trim()) {
      setErrorMsg('Por favor, informe seu nome.');
      return;
    }
    const hasItems = (Object.keys(selectedTypes) as OrderItemType[]).some(
      t => selectedTypes[t] && quantities[t] > 0
    );
    if (!hasItems) {
      setErrorMsg('Selecione ao menos 1 produto.');
      return;
    }
    if (deliveryMethod === 'entrega' && (!endereco.trim() || !numero.trim() || !bairro.trim() || !cidade.trim() || !estado.trim())) {
      setErrorMsg('Preencha seu endereço completo (Rua, Número, Bairro, Cidade e Estado).');
      return;
    }
    if (!paymentMethod) {
      setErrorMsg('Selecione uma forma de pagamento.');
      return;
    }
    if (paymentMethod === 'dinheiro' && precisaTroco && !trocoPara.trim()) {
      setErrorMsg('Informe para quanto precisa de troco.');
      return;
    }

    setErrorMsg('');
    document.getElementById('order-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setStep('summary');
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Seu navegador não suporta captura de localização.');
      return;
    }
    setIsFetchingLocation(true);
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const gmapsLink = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        setLocationLink(gmapsLink);

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            const city = addr.city || addr.town || addr.municipality || '';
            const state = addr.state || addr.province || '';

            // Não preenchemos rua e bairro automaticamente pois o mapa costuma errar no interior
            // if (street) setEndereco(String(street));
            // if (houseNumber) setNumero(String(houseNumber));
            // if (neighborhood) setBairro(String(neighborhood));
            if (city) setCidade(String(city));
            if (state) setEstado(String(state));
          }
        } catch (e) {
          console.error("Erro ao buscar endereço reverso", e);
        }
        setIsFetchingLocation(false);
      },
      (error) => {
        setIsFetchingLocation(false);
        setErrorMsg('Não foi possível obter a localização. Verifique as permissões do seu navegador.');
        console.error(error);
      },
      { enableHighAccuracy: true }
    );
  };

  const searchString = [endereco, numero, bairro, cidade, estado].filter(Boolean).join(', ');
  const finalLocationLink = locationLink || (endereco.trim() ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(searchString)}` : undefined);

  const calculateTotal = () => {
    let total = 0;
    if (selectedTypes.gas) {
      total += quantities.gas * (deliveryMethod === 'entrega' ? 130 : 125);
    }
    if (selectedTypes.agua) {
      total += quantities.agua * 20;
    }
    return total;
  };

  const totalPedido = calculateTotal();

  const orderData: OrderData = {
    nome,
    telefone,
    deliveryMethod,
    tempoEntrega: deliveryMethod === 'entrega' ? (tempoEntrega === 'Agendar horário' ? tempoEntregaPersonalizado : tempoEntrega) : undefined,
    tipoLocal,
    endereco,
    numero,
    bairro,
    cidade,
    estado,
    referencia,
    locationLink: finalLocationLink,
    itens: (['gas', 'agua'] as OrderItemType[])
      .filter(t => selectedTypes[t])
      .map(t => ({ tipo: t, quantidade: quantities[t] })),
    pagamento: {
      metodo: paymentMethod as PaymentMethod,
      precisaTroco,
      trocoPara
    },
    observacao,
    total: totalPedido
  };

  return (
    <section id="order-section" className="py-20 px-4 scroll-mt-20">
      <div className="max-w-2xl mx-auto glass-card p-6 md:p-10 relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
        
        {step === 'summary' ? (
          <OrderSummary data={orderData} onEdit={() => {
            setStep('form');
            document.getElementById('order-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }} />
        ) : (
          <div className="animate-slide-up">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Faça seu Pedido</h2>
              <p className="text-textMuted">Preencha rapidamente e envie para nosso WhatsApp.</p>
            </div>

            <div className="space-y-8">
              
              {/* O QUE DESEJA PEDIR */}
              <div className="space-y-4">
                <label className="text-lg font-bold flex items-center gap-2">
                  <span className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                  O que deseja pedir?
                </label>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Card Gás */}
                  <div 
                    onClick={() => toggleType('gas')}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all ${
                      selectedTypes.gas ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(234,179,8,0.15)]' : 'border-white/10 hover:border-white/30 bg-surface/30'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2 mb-3">
                      <Flame className={`w-8 h-8 ${selectedTypes.gas ? 'text-primary' : 'text-textMuted'}`} />
                      <span className="font-medium text-lg">Gás 13Kg</span>
                      <span className="text-xs text-textMuted text-center">Entrega: R$ 130,00<br/>Retirada: R$ 125,00</span>
                    </div>
                    {selectedTypes.gas && (
                      <div className="flex items-center justify-center gap-4 bg-background rounded-xl p-2" onClick={e => e.stopPropagation()}>
                        <button onClick={() => updateQuantity('gas', -1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface hover:bg-surface/80">-</button>
                        <span className="font-bold w-4 text-center">{quantities.gas}</span>
                        <button onClick={() => updateQuantity('gas', 1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface hover:bg-surface/80">+</button>
                      </div>
                    )}
                  </div>

                  {/* Card Água */}
                  <div 
                    onClick={() => toggleType('agua')}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all ${
                      selectedTypes.agua ? 'border-blue-400 bg-blue-400/10 shadow-[0_0_15px_rgba(96,165,250,0.15)]' : 'border-white/10 hover:border-white/30 bg-surface/30'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2 mb-3">
                      <Droplets className={`w-8 h-8 ${selectedTypes.agua ? 'text-blue-400' : 'text-textMuted'}`} />
                      <span className="font-medium text-lg">Água 20L</span>
                      <span className="text-xs text-textMuted text-center">R$ 20,00</span>
                    </div>
                    {selectedTypes.agua && (
                      <div className="flex items-center justify-center gap-4 bg-background rounded-xl p-2" onClick={e => e.stopPropagation()}>
                        <button onClick={() => updateQuantity('agua', -1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface hover:bg-surface/80">-</button>
                        <span className="font-bold w-4 text-center">{quantities.agua}</span>
                        <button onClick={() => updateQuantity('agua', 1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface hover:bg-surface/80">+</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* DADOS PESSOAIS */}
              <div className="space-y-4">
                <label className="text-lg font-bold flex items-center gap-2">
                  <span className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                  Seus dados
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="Seu nome (Obrigatório)" 
                    value={nome} onChange={e => setNome(e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                  />
                  <input 
                    type="tel" 
                    placeholder="Telefone (Opcional)" 
                    value={telefone} onChange={e => setTelefone(e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* TIPO DE ENTREGA E ENDEREÇO */}
              <div className="space-y-4">
                <label className="text-lg font-bold flex items-center gap-2">
                  <span className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
                  Retirar no local ou Entrega?
                </label>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button 
                    type="button"
                    onClick={() => setDeliveryMethod('entrega')}
                    className={`p-3 rounded-xl border font-medium transition-colors ${deliveryMethod === 'entrega' ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 hover:border-white/30 text-textMuted'}`}
                  >
                    Entrega (R$ 130 Gás)
                  </button>
                  <button 
                    type="button"
                    onClick={() => setDeliveryMethod('retirada')}
                    className={`p-3 rounded-xl border font-medium transition-colors ${deliveryMethod === 'retirada' ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 hover:border-white/30 text-textMuted'}`}
                  >
                    Retirar no local (R$ 125 Gás)
                  </button>
                </div>

                {deliveryMethod === 'entrega' && (
                  <>
                <div className="flex items-center justify-between mt-4">
                  <label className="text-lg font-bold flex items-center gap-2">
                    Endereço de Entrega
                  </label>
                  <button 
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isFetchingLocation}
                    className="flex items-center gap-2 text-sm text-primary hover:text-primaryHover transition-colors font-medium bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 hover:border-primary/50 disabled:opacity-50"
                  >
                    {isFetchingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                    Usar minha localização
                  </button>
                </div>
                
                {locationLink && (
                  <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2 rounded-xl text-sm flex items-center gap-2 animate-fade-in">
                    <MapIcon className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>GPS capturado! Por favor, digite o nome da sua rua e bairro abaixo para confirmar.</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-4">
                    <input 
                      type="text" 
                      placeholder="Rua/Avenida (Obrigatório)" 
                      value={endereco} onChange={e => setEndereco(e.target.value)}
                      className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                    />
                    <input 
                      type="text" 
                      placeholder="Nº (Obrigatório)" 
                      value={numero} onChange={e => setNumero(e.target.value)}
                      className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                      value={tipoLocal}
                      onChange={e => setTipoLocal(e.target.value)}
                      className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-white"
                    >
                      <option value="Casa">Casa</option>
                      <option value="Apartamento">Apartamento</option>
                      <option value="Comércio">Comércio/Empresa</option>
                      <option value="Outro">Outro</option>
                    </select>
                    <input 
                      type="text" 
                      placeholder="Bairro (Obrigatório)" 
                      value={bairro} onChange={e => setBairro(e.target.value)}
                      className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                    />
                    <input 
                      type="text" 
                      placeholder="Ponto de referência (Opcional)" 
                      value={referencia}
                      onChange={e => setReferencia(e.target.value)}
                      className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-4">
                    <input 
                      type="text" 
                      placeholder="Cidade (Obrigatório)" 
                      value={cidade}
                      onChange={e => setCidade(e.target.value)}
                      className="bg-transparent border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all w-full placeholder:text-white/30"
                    />
                    <input 
                      type="text" 
                      placeholder="Estado" 
                      value={estado}
                      onChange={e => setEstado(e.target.value.toUpperCase())}
                      maxLength={2}
                      className="bg-transparent border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all w-full placeholder:text-white/30"
                    />
                  </div>
                  <div className="space-y-2 mt-4 pt-4 border-t border-white/10">
                    <label className="text-sm font-bold block mb-2">Quando deseja receber?</label>
                    <select
                      value={tempoEntrega}
                      onChange={e => setTempoEntrega(e.target.value)}
                      className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-white"
                    >
                      <option value="Assim que possível">Assim que possível</option>
                      <option value="Com urgência">Com urgência</option>
                      <option value="Agendar horário">Agendar horário</option>
                    </select>
                    {tempoEntrega === 'Agendar horário' && (
                      <input 
                        type="text" 
                        placeholder="Ex: Hoje às 18:00, trazer amanhã cedo..." 
                        value={tempoEntregaPersonalizado}
                        onChange={e => setTempoEntregaPersonalizado(e.target.value)}
                        className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 mt-2 outline-none focus:border-primary transition-colors"
                      />
                    )}
                    <p className="text-xs text-textMuted mt-2 flex items-center gap-1">
                      * A preferência será anotada, mas está sujeita à disponibilidade no momento da entrega.
                    </p>
                  </div>
                </div>
                  </>
                )}
              </div>

              {/* PAGAMENTO */}
              <div className="space-y-4">
                <label className="text-lg font-bold flex items-center gap-2">
                  <span className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center text-sm">{deliveryMethod === 'entrega' ? '4' : '3'}</span>
                  Como deseja pagar?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-colors ${paymentMethod === 'pix' ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 hover:border-white/30 text-textMuted hover:text-text'}`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span className="text-sm font-medium">Pix</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('dinheiro')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-colors ${paymentMethod === 'dinheiro' ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 hover:border-white/30 text-textMuted hover:text-text'}`}
                  >
                    <Banknote className="w-5 h-5" />
                    <span className="text-sm font-medium">Dinheiro</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('cartao')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-colors ${paymentMethod === 'cartao' ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 hover:border-white/30 text-textMuted hover:text-text'}`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-sm font-medium">Cartão</span>
                  </button>
                </div>
                
                {paymentMethod === 'dinheiro' && (
                  <div className="bg-surface/50 p-4 rounded-xl border border-white/5 animate-fade-in space-y-3">
                    <span className="block text-sm font-medium">Precisa de troco?</span>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="troco" checked={!precisaTroco} onChange={() => setPrecisaTroco(false)} className="accent-primary w-4 h-4" />
                        <span>Não</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="troco" checked={precisaTroco} onChange={() => setPrecisaTroco(true)} className="accent-primary w-4 h-4" />
                        <span>Sim</span>
                      </label>
                    </div>
                    {precisaTroco && (
                      <input 
                        type="text" 
                        placeholder="Troco para quanto? (Ex: R$ 100)" 
                        value={trocoPara} onChange={e => setTrocoPara(e.target.value)}
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors mt-2"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* OBSERVAÇÃO OU ENDEREÇO DE RETIRADA */}
              <div className="space-y-4">
                <label className="text-lg font-bold flex items-center gap-2">
                  <span className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center text-sm">{deliveryMethod === 'entrega' ? '5' : '4'}</span>
                  {deliveryMethod === 'entrega' ? 'Observação (Opcional)' : 'Endereço de Retirada'}
                </label>
                
                {deliveryMethod === 'entrega' ? (
                  <textarea 
                    placeholder="Ex.: chamar no portão, deixar com o vizinho..." 
                    value={observacao} onChange={e => setObservacao(e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors min-h-[100px] resize-none"
                  />
                ) : (
                  <div className="bg-surface/50 border border-white/5 rounded-xl p-6 text-center space-y-3">
                    <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h4 className="font-bold text-lg text-white">Retirada no Local</h4>
                    <p className="text-textMuted text-sm">
                      O endereço exato para retirada e a localização do mapa serão enviados pelo vendedor no WhatsApp assim que você confirmar o pedido.
                    </p>
                  </div>
                )}
              </div>

              {/* ERRO VISUAL */}
              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  {errorMsg}
                </div>
              )}

              {/* TOTAL */}
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex justify-between items-center">
                <span className="font-bold text-lg text-primary">Total Estimado:</span>
                <span className="font-bold text-2xl text-primary">R$ {totalPedido.toFixed(2).replace('.', ',')}</span>
              </div>

              {/* BOTÃO REVISAR */}
              <button 
                onClick={handleReview}
                className="w-full bg-primary hover:bg-primaryHover text-background font-bold text-lg px-6 py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
              >
                Avançar
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
