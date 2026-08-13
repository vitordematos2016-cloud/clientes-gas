/**
 * Script de teste para comparar TomTom vs Nominatim em Guaraniaçu-PR e Cascavel-PR.
 * 
 * USO:
 *   node test_tomtom.js SUA_CHAVE_TOMTOM
 * 
 * O script executa buscas em ambos os provedores e compara resultados.
 */

const TOMTOM_BASE = 'https://api.tomtom.com/search/2';
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

// Coordenadas das cidades de teste
const CITIES = {
  'Guaraniaçu-PR': { lat: -25.0989, lng: -52.8756 },
  'Cascavel-PR':   { lat: -24.9555, lng: -53.4552 },
};

const QUERIES = ['Mercado', 'Supermercado', 'Farmácia', 'Posto', 'Restaurante', 'Padaria', 'Hospital', 'Oficina'];

// Helper: aguardar
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ---- TomTom ----
async function searchTomTom(apiKey, query, lat, lng, radius = 20000) {
  const params = new URLSearchParams({
    key: apiKey,
    lat: lat.toString(),
    lon: lng.toString(),
    radius: radius.toString(),
    countrySet: 'BR',
    language: 'pt-BR',
    limit: '10',
    idxSet: 'POI',
    typeahead: 'false',
  });
  const url = `${TOMTOM_BASE}/search/${encodeURIComponent(query)}.json?${params}`;
  const res = await fetch(url);
  if (!res.ok) return { error: res.status, results: [] };
  const data = await res.json();
  const results = (data.results || []).map(item => ({
    name: item.poi?.name || item.address?.freeformAddress || '?',
    address: item.address?.freeformAddress || '',
    city: item.address?.municipality || '',
    dist: item.dist ? `${(item.dist / 1000).toFixed(1)} km` : '?',
  }));
  return { error: null, results };
}

// ---- Nominatim ----
async function searchNominatim(query, lat, lng) {
  // Viewbox ~20km
  const d = 0.18;
  const viewbox = `${lng - d},${lat - d},${lng + d},${lat + d}`;
  const url = `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(query)}&countrycodes=br&viewbox=${viewbox}&bounded=1&addressdetails=1&limit=10&email=test@test.com`;
  await sleep(1100); // Rate limit
  const res = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } });
  if (!res.ok) return { error: res.status, results: [] };
  const data = await res.json();
  const results = data.map(item => ({
    name: item.display_name?.split(',')[0] || '?',
    address: item.display_name || '',
    city: item.address?.city || item.address?.town || item.address?.village || '',
    dist: '?',
  }));
  return { error: null, results };
}

// ---- Main ----
async function main() {
  const apiKey = process.argv[2];
  if (!apiKey) {
    console.error('USO: node test_tomtom.js SUA_CHAVE_TOMTOM');
    process.exit(1);
  }

  console.log('='.repeat(70));
  console.log('COMPARAÇÃO TOMTOM vs NOMINATIM — Busca de Comércios');
  console.log('='.repeat(70));

  for (const [cityName, coords] of Object.entries(CITIES)) {
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`📍 CIDADE: ${cityName} (${coords.lat}, ${coords.lng})`);
    console.log('─'.repeat(70));

    for (const query of QUERIES) {
      console.log(`\n🔍 Query: "${query}"`);
      
      // TomTom
      const tt = await searchTomTom(apiKey, query, coords.lat, coords.lng);
      console.log(`  TomTom: ${tt.error ? `ERRO ${tt.error}` : `${tt.results.length} resultados`}`);
      tt.results.slice(0, 3).forEach((r, i) => {
        console.log(`    ${i + 1}. ${r.name} | ${r.city} | ${r.dist}`);
      });

      // Nominatim
      const nm = await searchNominatim(query, coords.lat, coords.lng);
      console.log(`  Nominatim: ${nm.error ? `ERRO ${nm.error}` : `${nm.results.length} resultados`}`);
      nm.results.slice(0, 3).forEach((r, i) => {
        console.log(`    ${i + 1}. ${r.name} | ${r.city}`);
      });
    }
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log('Teste finalizado.');
}

main().catch(console.error);
