/**
 * placeSearchService.ts
 * 
 * Serviço dedicado à busca de comércios, empresas e POIs usando TomTom Search API.
 * Responsabilidade exclusiva: encontrar estabelecimentos comerciais próximos.
 * 
 * Arquitetura:
 *   - TomTom Fuzzy Search para POIs
 *   - Busca em camadas: 10km → 25km → 50km
 *   - Fallback para Nominatim quando TomTom indisponível
 *   - Cache em memória por query+região
 *   - Sem autocomplete agressivo — busca sob demanda (Enter / botão)
 */

import { siteConfig } from '../config';

// ---------------------------------------------------------------------------
// Tipos públicos
// ---------------------------------------------------------------------------

export interface PlaceResult {
  id: string;
  name: string;
  category?: string;
  address: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  /** Distância em metros retornada pela API */
  distance?: number;
  /** Distância em km calculada */
  distanceKm?: number;
  /** Texto formatado da distância */
  distanceLabel?: string;
  /** Provedor que encontrou o resultado */
  provider: 'tomtom' | 'nominatim';
}

export interface PlaceSearchContext {
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const TOMTOM_BASE_URL = 'https://api.tomtom.com/search/2';

/** Raios de busca em camadas (metros) */
const SEARCH_RADII = [
  siteConfig.tomTomConfig.initialRadius,   // 10 km
  siteConfig.tomTomConfig.expandedRadius,   // 25 km
  siteConfig.tomTomConfig.maxRadius,        // 50 km
];

// ---------------------------------------------------------------------------
// Classe principal
// ---------------------------------------------------------------------------

class PlaceSearchService {
  private cache = new Map<string, PlaceResult[]>();

  // ---- Helpers ------------------------------------------------------------

  private get apiKey(): string {
    return siteConfig.tomTomConfig.apiKey;
  }

  private get isAvailable(): boolean {
    return !!this.apiKey;
  }

  /**
   * Haversine — distância em km entre dois pontos.
   */
  private haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private formatDistance(km: number): string {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1).replace('.', ',')} km`;
  }

  /**
   * Gera chave de cache compacta.
   */
  private cacheKey(query: string, lat?: number, lng?: number, radius?: number): string {
    const q = query.toLowerCase().trim();
    const latR = lat !== undefined ? lat.toFixed(2) : 'x';
    const lngR = lng !== undefined ? lng.toFixed(2) : 'x';
    return `tomtom:${q}:${latR}:${lngR}:${radius ?? 0}`;
  }

  // ---- TomTom API ---------------------------------------------------------

  /**
   * Faz uma chamada ao TomTom Fuzzy Search.
   * Docs: https://developer.tomtom.com/search-api/documentation/search-service/fuzzy-search
   */
  private async searchTomTom(
    query: string,
    lat: number,
    lng: number,
    radiusMeters: number,
  ): Promise<PlaceResult[]> {
    const key = this.cacheKey(query, lat, lng, radiusMeters);
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const { countrySet, language, limit } = siteConfig.tomTomConfig;

    const params = new URLSearchParams({
      key: this.apiKey,
      query,
      lat: lat.toString(),
      lon: lng.toString(),
      radius: radiusMeters.toString(),
      countrySet,
      language,
      limit: limit.toString(),
      idxSet: 'POI',            // Apenas POIs
      typeahead: 'false',       // Não queremos typeahead, busca completa
    });

    const url = `${TOMTOM_BASE_URL}/search/${encodeURIComponent(query)}.json?${params.toString()}`;

    console.log(`[Places] Provider: TomTom`);
    console.log(`[Places] Query: ${query}`);
    console.log(`[Places] Center: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    console.log(`[Places] Radius: ${radiusMeters}m`);

    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        console.warn(`[Places] TomTom HTTP ${response.status}`);
        return [];
      }

      const data = await response.json();
      const results = this.parseTomTomResults(data, lat, lng);
      
      console.log(`[Places] Results: ${results.length}`);
      
      this.cache.set(key, results);
      return results;
    } catch (e) {
      console.error('[Places] TomTom fetch error:', e);
      return [];
    }
  }

  /**
   * Normaliza resultados brutos do TomTom para PlaceResult[].
   */
  private parseTomTomResults(data: any, refLat: number, refLng: number): PlaceResult[] {
    if (!data?.results || !Array.isArray(data.results)) return [];

    return data.results.map((item: any) => {
      const pos = item.position || {};
      const addr = item.address || {};
      const poi = item.poi || {};
      const lat = pos.lat ?? 0;
      const lng = pos.lon ?? 0;

      // Distância
      const distMeters = item.dist;
      const distKm = distMeters !== undefined
        ? distMeters / 1000
        : this.haversineKm(refLat, refLng, lat, lng);

      // Categorias
      const categories = poi.categories || [];
      const categoryName = categories.length > 0 ? categories[0] : undefined;

      // Montar endereço textual
      const addressParts = [
        addr.streetName,
        addr.streetNumber ? `nº ${addr.streetNumber}` : null,
        addr.municipalitySubdivision,
        addr.municipality,
        addr.countrySubdivision,
      ].filter(Boolean);

      return {
        id: item.id || `tt-${Math.random().toString(36).slice(2)}`,
        name: poi.name || addr.freeformAddress || 'Local',
        category: categoryName,
        address: addr.freeformAddress || addressParts.join(', '),
        street: addr.streetName || '',
        number: addr.streetNumber || '',
        neighborhood: addr.municipalitySubdivision || '',
        city: addr.municipality || '',
        state: addr.countrySubdivision || '',
        postalCode: addr.postalCode || '',
        latitude: lat,
        longitude: lng,
        distance: distMeters,
        distanceKm: distKm,
        distanceLabel: this.formatDistance(distKm),
        provider: 'tomtom' as const,
      };
    });
  }

  // ---- Busca em camadas ---------------------------------------------------

  /**
   * Executa busca progressiva: primeiro no raio menor, depois expande.
   * Para assim que encontrar resultados.
   */
  private async searchLayered(
    query: string,
    lat: number,
    lng: number,
  ): Promise<PlaceResult[]> {
    for (const radius of SEARCH_RADII) {
      const results = await this.searchTomTom(query, lat, lng, radius);
      if (results.length > 0) {
        return this.sortByDistance(results);
      }
      console.log(`[Places] Nenhum resultado em ${radius}m. Ampliando...`);
    }
    return [];
  }

  // ---- Ordenação ----------------------------------------------------------

  private sortByDistance(results: PlaceResult[]): PlaceResult[] {
    return [...results].sort((a, b) => {
      const da = a.distanceKm ?? Infinity;
      const db = b.distanceKm ?? Infinity;
      return da - db;
    });
  }

  // ---- Resolver coordenadas da cidade ------------------------------------

  /**
   * Quando não há GPS, descobre coordenadas da cidade via Nominatim.
   * Usa o Nominatim já existente para isso.
   */
  private async resolveCityCoords(city: string, state?: string): Promise<{ lat: number; lng: number } | null> {
    const query = [city, state, 'Brasil'].filter(Boolean).join(', ');
    const email = 'demonstracao@matossolucoes.com.br';
    const url = `${siteConfig.mapConfig.NOMINATIM_URL}/search?format=json&q=${encodeURIComponent(query)}&countrycodes=br&limit=1&email=${encodeURIComponent(email)}`;

    try {
      const response = await fetch(url, {
        headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' }
      });
      if (!response.ok) return null;
      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) return null;
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    } catch {
      return null;
    }
  }

  // ========================================================================
  // API PÚBLICA
  // ========================================================================

  /**
   * Busca de comércios/POIs com priorização local.
   * 
   * Fluxo:
   * 1. Se TomTom indisponível → retorna [] (chamador cuidará do fallback)
   * 2. Se há GPS → busca direta em camadas
   * 3. Se não há GPS mas há cidade → resolve coordenadas, depois busca
   * 4. Se nada → retorna flag pedindo contexto
   * 
   * @returns { results, needsContext }
   */
  public async searchPlaces(
    query: string,
    context?: PlaceSearchContext,
  ): Promise<{ results: PlaceResult[]; needsContext: boolean }> {
    if (!query.trim()) return { results: [], needsContext: false };

    // Sem chave TomTom configurada
    if (!this.isAvailable) {
      console.warn('[Places] TomTom API Key não configurada. Utilizando fallback Nominatim.');
      return { results: [], needsContext: false };
    }

    const hasGPS = context?.latitude !== undefined && context?.longitude !== undefined;
    const hasCity = !!context?.city?.trim();

    // --- Cenário 1: Tem GPS ---
    if (hasGPS) {
      const results = await this.searchLayered(query, context!.latitude!, context!.longitude!);
      return { results, needsContext: false };
    }

    // --- Cenário 2: Sem GPS, mas tem cidade ---
    if (hasCity) {
      console.log(`[Places] Sem GPS. Resolvendo coordenadas de: ${context!.city}, ${context!.state || ''}`);
      const coords = await this.resolveCityCoords(context!.city!, context!.state);
      if (coords) {
        const results = await this.searchLayered(query, coords.lat, coords.lng);
        return { results, needsContext: false };
      }
      console.warn(`[Places] Não foi possível resolver coordenadas da cidade: ${context!.city}`);
      return { results: [], needsContext: false };
    }

    // --- Cenário 3: Sem GPS e sem cidade ---
    console.log('[Places] Sem GPS e sem cidade. Solicitando contexto ao usuário.');
    return { results: [], needsContext: true };
  }
}

export const placeSearchService = new PlaceSearchService();
