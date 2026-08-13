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
}

class GeocodingService {
  private cache = new Map<string, any>();
  private lastRequestTime = 0;
  private readonly MIN_DELAY_MS = 1100; // Respeita a taxa de 1 req/s do Nominatim
  private readonly IDENTIFIER_EMAIL = 'demonstracao@matossolucoes.com.br';

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
    
    // Removido User-Agent direto do JS pois Browsers bloqueiam a manipulação deste Header.
    // Em vez disso, usaremos parâmetros de URL (email) quando aplicável no Nominatim.
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

  public async searchAddress(query: string): Promise<GeocodingResult[]> {
    if (!query.trim()) return [];
    
    const encodedQuery = encodeURIComponent(query);
    const url = `${siteConfig.mapConfig.NOMINATIM_URL}/search?format=json&q=${encodedQuery}&countrycodes=br&addressdetails=1&limit=5&email=${encodeURIComponent(this.IDENTIFIER_EMAIL)}`;
    
    try {
      const data = await this.fetchProvider(url);
      if (!Array.isArray(data)) return [];
      
      return data.map((item: any) => ({
        placeId: item.place_id?.toString() || Math.random().toString(),
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        displayName: item.display_name,
        address: this.parseAddressOSM(item.address)
      }));
    } catch (e) {
      console.error('Falha em searchAddress:', e);
      return [];
    }
  }

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
