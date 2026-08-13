import { siteConfig } from '../config';

export interface AddressDetails {
  road?: string;
  houseNumber?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  postcode?: string;
}

export interface GeocodingResult {
  placeId: string;
  lat: number;
  lng: number;
  displayName: string;
  address: AddressDetails;
  /** Distância em km até o ponto de referência (quando disponível) */
  distanceKm?: number;
  /** Texto formatado da distância para exibição */
  distanceLabel?: string;
  /** Tipo do resultado (para diferenciação visual) */
  type?: 'address' | 'poi';
  /** Provedor que encontrou o resultado */
  provider?: 'tomtom' | 'nominatim';
}

/** Contexto local que o chamador envia para priorizar a busca */
export interface LocalSearchContext {
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
}

// ---------------------------------------------------------------------------
// Constantes internas
// ---------------------------------------------------------------------------

/** 1 grau de latitude ≈ 111 km */
const KM_PER_DEG_LAT = 111.0;

/** Raio da busca local principal em km */
const LOCAL_RADIUS_KM = 30;

/** Raio do fallback ampliado em km */
const FALLBACK_RADIUS_KM = 80;

/** Distância máxima absoluta para exibir resultado (km) */
const MAX_DISPLAY_DISTANCE_KM = 80;

/**
 * Palavras-chave que indicam busca de comércio / POI (point of interest).
 * A lista é case-insensitive. Se a query contiver alguma dessas palavras,
 * tratamos como busca de estabelecimento.
 */
const POI_KEYWORDS = [
  'supermercado', 'mercado', 'mercadinho', 'minimercado',
  'farmácia', 'farmacia', 'drogaria',
  'posto', 'gasolina', 'combustível', 'combustivel',
  'hospital', 'upa', 'clínica', 'clinica',
  'restaurante', 'lanchonete', 'pizzaria', 'hamburgueria', 'padaria', 'bar',
  'escola', 'colégio', 'colegio', 'faculdade', 'universidade',
  'igreja', 'paróquia', 'paroquia',
  'academia', 'loja', 'shopping', 'mall', 'centro comercial',
  'banco', 'caixa econômica', 'caixa economica', 'lotérica', 'loterica',
  'hotel', 'pousada', 'motel',
  'muffato', 'condor', 'atacadão', 'atacadao', 'assaí', 'assai',
  'havan', 'shell', 'ipiranga', 'petrobras',
  'são joão', 'sao joao', 'panvel', 'nissei',
  'cartório', 'cartorio', 'fórum', 'forum', 'prefeitura',
  'rodoviária', 'rodoviaria', 'aeroporto', 'terminal',
];

// ---------------------------------------------------------------------------
// Classe principal
// ---------------------------------------------------------------------------

class GeocodingService {
  private cache = new Map<string, any>();
  private lastRequestTime = 0;
  private readonly MIN_DELAY_MS = 1100; // Respeita a taxa de 1 req/s do Nominatim
  private readonly IDENTIFIER_EMAIL = 'demonstracao@matossolucoes.com.br';

  // ---- Rate limit & fetch ------------------------------------------------

  private async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLast = now - this.lastRequestTime;
    if (timeSinceLast < this.MIN_DELAY_MS) {
      await new Promise(resolve => setTimeout(resolve, this.MIN_DELAY_MS - timeSinceLast));
    }
    this.lastRequestTime = Date.now();
  }

  private async fetchProvider(url: string) {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    await this.enforceRateLimit();

    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'pt-BR,pt;q=0.9'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro na API de Geocoding: ${response.status}`);
    }

    const data = await response.json();
    this.cache.set(url, data);
    return data;
  }

  // ---- Helpers de parse ---------------------------------------------------

  private parseAddressOSM(osmAddress: any): AddressDetails {
    if (!osmAddress) return {};
    return {
      road: osmAddress.road || osmAddress.pedestrian || osmAddress.street || '',
      houseNumber: osmAddress.house_number || '',
      neighborhood: osmAddress.suburb || osmAddress.neighbourhood || osmAddress.residential || osmAddress.district || '',
      city: osmAddress.city || osmAddress.town || osmAddress.village || osmAddress.municipality || '',
      state: osmAddress.state || osmAddress.region || '',
      postcode: osmAddress.postcode || ''
    };
  }

  // ---- Haversine ----------------------------------------------------------

  /**
   * Calcula a distância em km entre dois pontos usando a fórmula de Haversine.
   */
  private haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // raio da Terra em km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Formata a distância em texto legível.
   */
  private formatDistance(km: number): string {
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1).replace('.', ',')} km`;
  }

  // ---- Detecção de tipo de busca ------------------------------------------

  /**
   * Verifica se a query parece ser busca de comércio/POI ou de endereço.
   * Público para permitir ao chamador decidir qual provedor usar.
   */
  public isPOIQuery(query: string): boolean {
    const lower = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const normalizedKeywords = POI_KEYWORDS.map(k =>
      k.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    );

    // Se a query contiver qualquer keyword de POI, é POI
    if (normalizedKeywords.some(kw => lower.includes(kw))) return true;

    // Se NÃO contiver número ou palavras típicas de endereço, provavelmente é POI
    // (ex: "Muffato" vs "Rua Paraná 123")
    const addressIndicators = /\b(rua|avenida|av|alameda|travessa|rodovia|br-|pr-|estrada|lote|quadra|qd|r\.)\b/i;
    const hasNumber = /\d{1,5}/.test(query);

    if (!addressIndicators.test(query) && !hasNumber) {
      // Query sem indicadores de endereço e sem números — pode ser POI
      // Mas só tratamos como POI se tiver pelo menos 3 caracteres
      return query.trim().length >= 3;
    }

    return false;
  }

  // ---- Viewbox ------------------------------------------------------------

  /**
   * Gera a string viewbox para o Nominatim a partir de um ponto central e raio em km.
   */
  private buildViewbox(lat: number, lng: number, radiusKm: number): string {
    const dLat = radiusKm / KM_PER_DEG_LAT;
    const dLng = radiusKm / (KM_PER_DEG_LAT * Math.cos(this.deg2rad(lat)));

    const south = lat - dLat;
    const north = lat + dLat;
    const west = lng - dLng;
    const east = lng + dLng;

    // Nominatim viewbox: west,south,east,north
    return `${west.toFixed(6)},${south.toFixed(6)},${east.toFixed(6)},${north.toFixed(6)}`;
  }

  // ---- Construção de URL --------------------------------------------------

  /**
   * Monta a URL de busca do Nominatim com os parâmetros corretos.
   */
  private buildSearchUrl(params: {
    query: string;
    viewbox?: string;
    bounded?: boolean;
    isPOI?: boolean;
    limit?: number;
  }): string {
    const { query, viewbox, bounded, isPOI, limit = 8 } = params;
    const encodedQuery = encodeURIComponent(query);

    let url = `${siteConfig.mapConfig.NOMINATIM_URL}/search?format=json`
      + `&q=${encodedQuery}`
      + `&countrycodes=br`
      + `&addressdetails=1`
      + `&limit=${limit}`
      + `&email=${encodeURIComponent(this.IDENTIFIER_EMAIL)}`;

    if (viewbox) {
      url += `&viewbox=${viewbox}`;
      if (bounded) {
        url += `&bounded=1`;
      }
    }

    // Para POIs, usar layer=poi para priorizar estabelecimentos
    // Nota: layer é suportado a partir do Nominatim 4.2+
    // Como fallback seguro, adicionamos apenas se é claramente POI
    if (isPOI) {
      // Não usamos layer=poi pois pode não estar disponível no servidor público.
      // Em vez disso, confiamos na viewbox + query enriquecida.
    }

    return url;
  }

  // ---- Enriquecer query com contexto local --------------------------------

  /**
   * Adiciona cidade/estado/Brasil à query quando faz sentido.
   */
  private enrichQuery(query: string, ctx?: LocalSearchContext): string {
    if (!ctx) return query;

    const lower = query.toLowerCase();

    // Se a query já menciona a cidade ou "brasil", não duplicar
    const cityMentioned = ctx.city && lower.includes(ctx.city.toLowerCase());
    const stateMentioned = ctx.state && lower.includes(ctx.state.toLowerCase());

    let enriched = query;

    if (ctx.city && !cityMentioned) {
      enriched += `, ${ctx.city}`;
    }
    if (ctx.state && !stateMentioned) {
      enriched += `, ${ctx.state}`;
    }
    if (!lower.includes('brasil')) {
      enriched += ', Brasil';
    }

    return enriched;
  }

  // ---- Parse de resultados brutos -----------------------------------------

  private parseResults(data: any[], refLat?: number, refLng?: number): GeocodingResult[] {
    if (!Array.isArray(data)) return [];

    return data.map((item: any) => {
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lon);
      const address = this.parseAddressOSM(item.address);

      let distanceKm: number | undefined;
      let distanceLabel: string | undefined;

      if (refLat !== undefined && refLng !== undefined) {
        distanceKm = this.haversineKm(refLat, refLng, lat, lng);
        distanceLabel = this.formatDistance(distanceKm);
      }

      // Determinar tipo
      const category = item.category || '';
      const osmType = item.type || '';
      const isPOI = !['highway', 'place', 'boundary'].includes(category) &&
                    !['house', 'residential', 'street'].includes(osmType);

      return {
        placeId: item.place_id?.toString() || Math.random().toString(),
        lat,
        lng,
        displayName: item.display_name,
        address,
        distanceKm,
        distanceLabel,
        type: isPOI ? 'poi' as const : 'address' as const,
      };
    });
  }

  // ---- Ordenação inteligente ----------------------------------------------

  /**
   * Ordena resultados priorizando:
   * 1. Mesma cidade
   * 2. Menor distância
   */
  private sortResults(results: GeocodingResult[], preferredCity?: string): GeocodingResult[] {
    return [...results].sort((a, b) => {
      // 1. Mesma cidade tem prioridade
      if (preferredCity) {
        const prefLower = preferredCity.toLowerCase();
        const aIsLocal = a.address.city?.toLowerCase() === prefLower;
        const bIsLocal = b.address.city?.toLowerCase() === prefLower;
        if (aIsLocal && !bIsLocal) return -1;
        if (!aIsLocal && bIsLocal) return 1;
      }

      // 2. Menor distância
      if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
        return a.distanceKm - b.distanceKm;
      }

      return 0;
    });
  }

  // ---- Filtrar por distância máxima ---------------------------------------

  private filterByDistance(results: GeocodingResult[], maxKm: number): GeocodingResult[] {
    return results.filter(r => r.distanceKm === undefined || r.distanceKm <= maxKm);
  }

  // ========================================================================
  // API PÚBLICA
  // ========================================================================

  /**
   * Busca inteligente de endereço ou comércio com priorização local.
   *
   * Estratégia em duas etapas:
   *   ETAPA 1 — Busca local (viewbox + cidade na query + bounded)
   *   ETAPA 2 — Fallback ampliado (viewbox maior, sem bounded)
   *
   * @param query - Texto digitado pelo usuário
   * @param context - Contexto local (cidade, estado, coordenadas GPS)
   */
  public async searchAddress(query: string, context?: LocalSearchContext): Promise<GeocodingResult[]> {
    if (!query.trim()) return [];

    const isPOI = this.isPOIQuery(query);
    const refLat = context?.latitude;
    const refLng = context?.longitude;
    const hasGPS = refLat !== undefined && refLng !== undefined;
    const hasCity = !!context?.city?.trim();

    // --- ETAPA 1: Busca local ---

    let enrichedQuery = query;
    if (isPOI || hasCity) {
      enrichedQuery = this.enrichQuery(query, context);
    }

    let viewbox: string | undefined;
    let bounded = false;

    if (hasGPS) {
      viewbox = this.buildViewbox(refLat!, refLng!, LOCAL_RADIUS_KM);
      bounded = true;
    }

    const url1 = this.buildSearchUrl({
      query: enrichedQuery,
      viewbox,
      bounded,
      isPOI,
      limit: 8,
    });

    try {
      const data1 = await this.fetchProvider(url1);
      let results1 = this.parseResults(data1, refLat, refLng);

      // Se temos GPS, filtrar por distância máxima do raio local
      if (hasGPS) {
        results1 = this.filterByDistance(results1, LOCAL_RADIUS_KM);
      }

      // Ordenar
      results1 = this.sortResults(results1, context?.city);

      if (results1.length > 0) {
        return results1;
      }

      // --- ETAPA 2: Fallback ampliado ---

      // Ampliar viewbox e remover bounded
      let viewbox2: string | undefined;
      if (hasGPS) {
        viewbox2 = this.buildViewbox(refLat!, refLng!, FALLBACK_RADIUS_KM);
      }

      // Tentar também com a query sem enriquecimento local tão restrito
      // mas mantendo countrycodes=br e viewbox ampliado
      const fallbackQuery = hasCity
        ? `${query}, ${context!.state || ''}, Brasil`.replace(/,\s*,/g, ',').replace(/^,|,$/g, '')
        : `${query}, Brasil`;

      const url2 = this.buildSearchUrl({
        query: fallbackQuery,
        viewbox: viewbox2,
        bounded: false,
        isPOI,
        limit: 8,
      });

      const data2 = await this.fetchProvider(url2);
      let results2 = this.parseResults(data2, refLat, refLng);

      // Filtrar por distância máxima de fallback
      if (hasGPS) {
        results2 = this.filterByDistance(results2, MAX_DISPLAY_DISTANCE_KM);
      }

      results2 = this.sortResults(results2, context?.city);

      return results2;
    } catch (e) {
      console.error('Falha em searchAddress:', e);
      return [];
    }
  }

  /**
   * Geocodificação reversa (coordenadas → endereço). Sem alterações funcionais.
   */
  public async reverseGeocode(lat: number, lng: number): Promise<GeocodingResult | null> {
    const url = `${siteConfig.mapConfig.NOMINATIM_URL}/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&email=${encodeURIComponent(this.IDENTIFIER_EMAIL)}`;

    try {
      const data = await this.fetchProvider(url);
      if (!data || data.error) return null;

      return {
        placeId: data.place_id?.toString() || Math.random().toString(),
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lon),
        displayName: data.display_name,
        address: this.parseAddressOSM(data.address)
      };
    } catch (e) {
      console.error('Falha em reverseGeocode:', e);
      return null;
    }
  }
}

export const geocodingService = new GeocodingService();
