import { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowRight, MapPin, Loader2, Map as MapIcon, ShoppingBag, Plus, Minus, CheckCircle2, Search } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Consertando o ícone padrão do Leaflet no React
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

import type { OrderData, PaymentMethod, OrderItem } from '../types';
import { OrderSummary } from './OrderSummary';
import { siteConfig } from '../config';

// Componente auxiliar para atualizar a posição do mapa
function MapUpdater({ center }: { center: { lat: number, lng: number } }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 16);
  }, [center, map]);
  return null;
}

export function OrderForm() {
  const [step, setStep] = useState<'form' | 'summary'>('form');
  const [currentFormStep, setCurrentFormStep] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Estado do carrinho
  const [cart, setCart] = useState<Record<string, number>>({});

  // Dados do formulário
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  
  // Endereço
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cep, setCep] = useState('');
  const [referencia, setReferencia] = useState('');
  
  // OSM Map State
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [formattedAddress, setFormattedAddress] = useState<string | undefined>();
  const [mapCenter, setMapCenter] = useState({ lat: -23.5505, lng: -46.6333 });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  
  const markerRef = useRef<any>(null);

  // Outros campos
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
      const customEvent = e as CustomEvent<string>;
      const category = customEvent.detail;
      const firstProduct = siteConfig.products.find(p => p.category === category);
      if (firstProduct) {
        setCart(prev => ({ ...prev, [firstProduct.id]: (prev[firstProduct.id] || 0) + 1 }));
      }
    };

    window.addEventListener('select-product', handleSelectProduct);
    return () => window.removeEventListener('select-product', handleSelectProduct);
  }, []);

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      const current = prev[productId] || 0;
      const newVal = current + delta;
      const newCart = { ...prev };
      if (newVal <= 0) {
        delete newCart[productId];
      } else {
        newCart[productId] = newVal;
      }
      return newCart;
    });
    setErrorMsg('');
  };

  const getProductQuantity = (productId: string) => cart[productId] || 0;

  const calculateTotal = () => {
    let total = 0;
    Object.entries(cart).forEach(([productId, quantity]) => {
      const product = siteConfig.products.find(p => p.id === productId);
      if (product) {
        const price = deliveryMethod === 'entrega' ? product.priceDelivery : product.pricePickup;
        total += price * quantity;
      }
    });
    return total;
  };

  const totalPedido = calculateTotal();
  const hasItems = Object.keys(cart).length > 0;

  const validateStep1 = () => {
    if (!hasItems) {
      setErrorMsg('Selecione ao menos 1 produto para continuar.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const validateStep2 = () => {
    if (deliveryMethod === 'entrega' && (!endereco.trim() || !numero.trim() || !bairro.trim() || !cidade.trim() || !estado.trim())) {
      setErrorMsg('Preencha seu endereço completo.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const validateStep3 = () => {
    if (!nome.trim()) {
      setErrorMsg('Por favor, informe seu nome.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const handleNextStep = () => {
    if (currentFormStep === 1 && !validateStep1()) return;
    if (currentFormStep === 2 && !validateStep2()) return;
    if (currentFormStep === 3 && !validateStep3()) return;
    
    if (currentFormStep < 4) {
      setCurrentFormStep(prev => prev + 1);
      document.getElementById('order-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleReview = () => {
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

  // --- Funções de Mapa e Geocoding (Nominatim / OSM) ---

  const fillAddressFromOSM = (address: any) => {
    if (!address) return;
    
    // Road
    const route = address.road || address.pedestrian || address.street || '';
    if (route) setEndereco(route);
    
    // Number
    const houseNumber = address.house_number || '';
    if (houseNumber) setNumero(houseNumber);
    
    // Neighborhood / Suburb
    const neighborhood = address.suburb || address.neighbourhood || address.residential || address.district || '';
    if (neighborhood) setBairro(neighborhood);
    
    // City
    const city = address.city || address.town || address.village || address.municipality || '';
    if (city) setCidade(city);
    
    // State
    const state = address.state || address.region || '';
    if (state) setEstado(state);
    
    // Postcode
    const postcode = address.postcode || '';
    if (postcode) setCep(postcode);
  };

  const doReverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
      const data = await res.json();
      if (data && data.address) {
        fillAddressFromOSM(data.address);
        setFormattedAddress(data.display_name);
      }
    } catch (e) {
      console.error('Erro no reverse geocoding', e);
    }
  };

  const handleSearchAddress = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults([]);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=br&addressdetails=1&limit=5`);
      const data = await res.json();
      setSearchResults(data);
      if (data.length === 0) {
        setErrorMsg('Nenhum resultado encontrado.');
      } else {
        setErrorMsg('');
      }
    } catch (e) {
      console.error('Erro na busca', e);
      setErrorMsg('Erro ao buscar o endereço.');
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    setLatitude(lat);
    setLongitude(lng);
    setMapCenter({ lat, lng });
    setFormattedAddress(result.display_name);
    fillAddressFromOSM(result.address);
    
    setSearchResults([]);
    setSearchQuery('');
    setErrorMsg('');
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
        setLatitude(lat);
        setLongitude(lng);
        setMapCenter({ lat, lng });
        
        const acc = position.coords.accuracy;
        if (acc > 100) {
           setErrorMsg('Encontramos sua localização aproximadamente. Confirme o ponto da entrega arrastando o pino.');
        }

        await doReverseGeocode(lat, lng);
        setIsFetchingLocation(false);
      },
      (error) => {
        setIsFetchingLocation(false);
        setErrorMsg('Não foi possível obter a localização. Verifique as permissões do navegador.');
        console.error(error);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
  };

  const markerEventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const position = marker.getLatLng();
          setLatitude(position.lat);
          setLongitude(position.lng);
          setMapCenter({ lat: position.lat, lng: position.lng });
          doReverseGeocode(position.lat, position.lng);
        }
      },
    }),
    [],
  );

  const buildOrderData = (): OrderData => {
    const itens: OrderItem[] = Object.entries(cart).map(([productId, quantity]) => {
      const product = siteConfig.products.find(p => p.id === productId)!;
      return { product, quantity };
    });

    return {
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
      cep,
      latitude,
      longitude,
      formattedAddress,
      referencia,
      itens,
      pagamento: {
        metodo: paymentMethod,
        precisaTroco,
        trocoPara
      },
      observacao,
      total: totalPedido
    };
  };

  return (
    <section id="order-section" className="py-20 px-4 scroll-mt-20">
      <div className="max-w-2xl mx-auto glass-card p-6 md:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
        
        {step === 'summary' ? (
          <OrderSummary data={buildOrderData()} onEdit={() => {
            setStep('form');
            document.getElementById('order-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }} />
        ) : (
          <div className="animate-slide-up">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Faça seu Pedido</h2>
              <p className="text-textMuted">Preencha rapidamente e envie para nosso WhatsApp.</p>
            </div>

            {/* PROGRESS INDICATOR */}
            <div className="flex items-center justify-between mb-8 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 rounded-full z-0"></div>
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-500"
                style={{ width: `${((currentFormStep - 1) / 3) * 100}%` }}
              ></div>
              
              {[1, 2, 3, 4].map(num => (
                <div key={num} className="relative z-10 flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    currentFormStep >= num ? 'bg-primary text-background shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-surface border border-white/20 text-textMuted'
                  }`}>
                    {currentFormStep > num ? <CheckCircle2 className="w-5 h-5" /> : num}
                  </div>
                  <span className={`text-[10px] mt-1 font-medium hidden sm:block ${currentFormStep >= num ? 'text-primary' : 'text-textMuted'}`}>
                    {num === 1 ? 'Pedido' : num === 2 ? 'Entrega' : num === 3 ? 'Dados' : 'Pagamento'}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-8">
              
              {/* ETAPA 1: PRODUTOS */}
              {currentFormStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <label className="text-xl font-bold flex items-center gap-2 mb-4">
                    <ShoppingBag className="w-6 h-6 text-primary" />
                    Escolha seus produtos
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {siteConfig.products.map(product => {
                      const Icon = product.icon;
                      const quantity = getProductQuantity(product.id);
                      const isSelected = quantity > 0;
                      
                      return (
                        <div key={product.id} className={`rounded-2xl p-4 border transition-all ${
                          isSelected ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(249,115,22,0.15)]' : 'border-white/10 bg-surface/30'
                        }`}>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl ${isSelected ? 'bg-primary/20 text-primary' : 'bg-white/5 text-textMuted'}`}>
                                {Icon && <Icon className="w-6 h-6" />}
                              </div>
                              <div>
                                <h3 className="font-bold">{product.name}</h3>
                                <p className="text-xs text-textMuted mt-0.5">Ent: R$ {product.priceDelivery.toFixed(2)} | Ret: R$ {product.pricePickup.toFixed(2)}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex items-center justify-between">
                            {isSelected ? (
                              <div className="flex items-center justify-between w-full bg-background rounded-xl p-1 border border-white/5">
                                <button onClick={() => updateQuantity(product.id, -1)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface hover:bg-surface/80 text-white transition-colors">
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-bold w-8 text-center">{quantity}</span>
                                <button onClick={() => updateQuantity(product.id, 1)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-background hover:bg-primaryHover transition-colors">
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => updateQuantity(product.id, 1)}
                                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-colors border border-white/10 flex items-center justify-center gap-2"
                              >
                                <Plus className="w-4 h-4" /> Adicionar
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {hasItems && (
                    <div className="mt-6 bg-surface/50 rounded-xl p-4 border border-white/10">
                      <h4 className="font-bold mb-3 text-sm text-textMuted uppercase tracking-wider">Resumo Rápido</h4>
                      <div className="space-y-2 mb-3">
                        {Object.entries(cart).map(([productId, quantity]) => {
                          const product = siteConfig.products.find(p => p.id === productId)!;
                          const price = deliveryMethod === 'entrega' ? product.priceDelivery : product.pricePickup;
                          return (
                            <div key={productId} className="flex justify-between text-sm">
                              <span>{quantity}x {product.name}</span>
                              <span className="font-medium">R$ {(price * quantity).toFixed(2).replace('.', ',')}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-white/10">
                        <span className="font-bold">Total Estimado</span>
                        <span className="font-bold text-primary text-lg">R$ {totalPedido.toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ETAPA 2: ENTREGA */}
              {currentFormStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <label className="text-xl font-bold flex items-center gap-2 mb-4">
                    <MapPin className="w-6 h-6 text-primary" />
                    Entrega ou Retirada?
                  </label>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <button 
                      type="button"
                      onClick={() => setDeliveryMethod('entrega')}
                      className={`p-4 rounded-xl border-2 font-bold transition-colors ${deliveryMethod === 'entrega' ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 hover:border-white/30 text-textMuted'}`}
                    >
                      🚚 Receber em Casa
                    </button>
                    <button 
                      type="button"
                      onClick={() => setDeliveryMethod('retirada')}
                      className={`p-4 rounded-xl border-2 font-bold transition-colors ${deliveryMethod === 'retirada' ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 hover:border-white/30 text-textMuted'}`}
                    >
                      🏪 Retirar no Local
                    </button>
                  </div>

                  {deliveryMethod === 'entrega' && (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 mb-4 gap-2">
                        <label className="text-lg font-bold">
                          Endereço de Entrega
                        </label>
                        <button 
                          type="button"
                          onClick={handleGetLocation}
                          disabled={isFetchingLocation}
                          className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primaryHover transition-colors font-medium bg-primary/10 px-4 py-2 rounded-lg border border-primary/20 hover:border-primary/50 disabled:opacity-50"
                        >
                          {isFetchingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapIcon className="w-4 h-4" />}
                          Usar minha localização
                        </button>
                      </div>

                      {/* OSM Nominatim Search */}
                      <div className="mb-4 relative">
                        <div className="flex relative">
                          <input
                            type="text"
                            placeholder="Buscar endereço ou comércio (Ex: Muffato Cascavel)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearchAddress(); } }}
                            className="w-full bg-surface border-2 border-primary/30 rounded-xl px-4 py-4 pr-12 focus:outline-none focus:border-primary transition-colors text-white font-medium shadow-lg shadow-black/50"
                          />
                          <button 
                            type="button"
                            onClick={handleSearchAddress}
                            disabled={isSearching || !searchQuery}
                            className="absolute right-2 top-2 bottom-2 bg-primary/20 hover:bg-primary/40 text-primary rounded-lg px-3 transition-colors flex items-center justify-center"
                          >
                            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                          </button>
                        </div>
                        {searchResults.length > 0 && (
                          <div className="absolute z-[1000] top-full left-0 right-0 mt-2 bg-surface border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                            {searchResults.map((result) => (
                              <button
                                key={result.place_id}
                                type="button"
                                onClick={() => selectSearchResult(result)}
                                className="w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors text-sm last:border-0"
                              >
                                {result.display_name}
                              </button>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-textMuted mt-2">Você pode buscar pelo nome da rua ou do estabelecimento.</p>
                      </div>

                      {/* Mapa Interativo Leaflet */}
                      {latitude !== undefined && longitude !== undefined && (
                        <div className="mb-6 rounded-xl overflow-hidden border-2 border-white/10 shadow-lg shadow-black/50 relative z-0">
                          <div className="bg-primary/20 p-2 text-center text-sm font-bold text-primary border-b border-primary/20">
                            Confirme o local da entrega. Arraste o pino para a entrada correta.
                          </div>
                          <div className="h-[250px] w-full">
                            <MapContainer 
                              center={mapCenter} 
                              zoom={16} 
                              scrollWheelZoom={true} 
                              style={{ height: '100%', width: '100%', zIndex: 0 }}
                            >
                              <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              />
                              <MapUpdater center={mapCenter} />
                              <Marker 
                                position={{ lat: latitude, lng: longitude }}
                                draggable={true}
                                eventHandlers={markerEventHandlers}
                                ref={markerRef}
                              />
                            </MapContainer>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-4 bg-surface/30 p-4 rounded-xl border border-white/5">
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
                            placeholder="Referência (Opcional)" 
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
                            className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                          />
                          <input 
                            type="text" 
                            placeholder="Estado" 
                            value={estado}
                            onChange={e => setEstado(e.target.value.toUpperCase())}
                            maxLength={2}
                            className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                          />
                        </div>
                        
                        <div className="space-y-2 mt-6 pt-6 border-t border-white/10">
                          <label className="text-sm font-bold block mb-2">Quando deseja receber?</label>
                          <select
                            value={tempoEntrega}
                            onChange={e => setTempoEntrega(e.target.value)}
                            className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-white"
                          >
                            <option value="Assim que possível">Assim que possível</option>
                            <option value="Em aproximadamente 30 minutos">Em aproximadamente 30 minutos</option>
                            <option value="Em aproximadamente 1 hora">Em aproximadamente 1 hora</option>
                            <option value="Agendar horário">Agendar horário específico</option>
                          </select>
                          {tempoEntrega === 'Agendar horário' && (
                            <input 
                              type="text" 
                              placeholder="Ex: Hoje às 18:00, amanhã de manhã..." 
                              value={tempoEntregaPersonalizado}
                              onChange={e => setTempoEntregaPersonalizado(e.target.value)}
                              className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 mt-2 outline-none focus:border-primary transition-colors"
                            />
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {deliveryMethod === 'retirada' && (
                    <div className="bg-surface/50 border border-white/5 rounded-xl p-8 text-center space-y-4 mt-6">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <MapPin className="w-8 h-8 text-primary" />
                      </div>
                      <h4 className="font-bold text-xl text-white">Retirada no Local</h4>
                      <p className="text-textMuted">
                        O endereço exato da {siteConfig.businessName} e a localização do mapa serão enviados pelo WhatsApp assim que você confirmar o pedido.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ETAPA 3: DADOS */}
              {currentFormStep === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <label className="text-xl font-bold flex items-center gap-2 mb-4">
                    Seus dados de contato
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
                  
                  <div className="mt-6">
                    <label className="text-sm font-bold block mb-2 text-textMuted">Alguma observação para o pedido?</label>
                    <textarea 
                      placeholder="Ex.: chamar no portão, deixar com o vizinho, apartamento no térreo..." 
                      value={observacao} onChange={e => setObservacao(e.target.value)}
                      className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors min-h-[100px] resize-none"
                    />
                  </div>
                </div>
              )}

              {/* ETAPA 4: PAGAMENTO */}
              {currentFormStep === 4 && (
                <div className="space-y-4 animate-fade-in">
                  <label className="text-xl font-bold flex items-center gap-2 mb-4">
                    Como deseja pagar?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {siteConfig.paymentMethods.map(method => (
                      <button 
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${paymentMethod === method.id ? 'border-primary bg-primary/10 text-primary scale-105' : 'border-white/10 hover:border-white/30 text-textMuted hover:text-text'}`}
                      >
                        <span className="font-bold text-lg">{method.name}</span>
                      </button>
                    ))}
                  </div>
                  
                  {paymentMethod === 'dinheiro' && (
                    <div className="bg-surface/50 p-6 rounded-xl border border-white/5 animate-fade-in space-y-4 mt-6">
                      <span className="block text-lg font-bold">Precisa de troco?</span>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-3 cursor-pointer" onClick={() => setPrecisaTroco(false)}>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${!precisaTroco ? 'border-primary' : 'border-white/20'}`}>
                            {!precisaTroco && <div className="w-3 h-3 rounded-full bg-primary" />}
                          </div>
                          <span className="font-medium">Não</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer" onClick={() => setPrecisaTroco(true)}>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${precisaTroco ? 'border-primary' : 'border-white/20'}`}>
                            {precisaTroco && <div className="w-3 h-3 rounded-full bg-primary" />}
                          </div>
                          <span className="font-medium">Sim</span>
                        </label>
                      </div>
                      {precisaTroco && (
                        <input 
                          type="text" 
                          placeholder="Troco para quanto? (Ex: R$ 100)" 
                          value={trocoPara} onChange={e => setTrocoPara(e.target.value)}
                          className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors mt-2 text-lg"
                        />
                      )}
                    </div>
                  )}

                  {/* TOTAL NA ÚLTIMA ETAPA */}
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 flex justify-between items-center mt-6">
                    <div>
                      <span className="block font-medium text-primary/80 text-sm">Total Estimado</span>
                      <span className="font-bold text-3xl text-primary">R$ {totalPedido.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ERRO VISUAL */}
              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in flex items-center gap-2 mt-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  {errorMsg}
                </div>
              )}

              {/* BOTÕES DE NAVEGAÇÃO */}
              <div className="flex gap-4 pt-6 mt-6 border-t border-white/10">
                {currentFormStep > 1 && (
                  <button 
                    onClick={() => {
                      setCurrentFormStep(prev => prev - 1);
                      setErrorMsg('');
                    }}
                    className="flex-1 bg-surface hover:bg-surface/80 border border-white/10 text-white font-bold text-lg px-6 py-4 rounded-xl transition-all active:scale-95"
                  >
                    Voltar
                  </button>
                )}
                
                {currentFormStep < 4 ? (
                  <button 
                    onClick={handleNextStep}
                    className="flex-[2] bg-primary hover:bg-primaryHover text-background font-bold text-lg px-6 py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
                  >
                    Continuar
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button 
                    onClick={handleReview}
                    className="flex-[2] bg-green-500 hover:bg-green-600 text-white font-bold text-lg px-6 py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-green-500/20"
                  >
                    Revisar Pedido
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </section>
  );
}
