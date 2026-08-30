// ==========================================================================
// MOTTO ON TOUR - GLOBAL CONFIGURATION & DATA DICTIONARY
// ==========================================================================

const CONFIG = {
  APP_NAME: "MOTTO ON TOUR",
  VERSION: "1.8",
  SECRET_PIN: "211221",
  API_URL: "https://script.google.com/macros/s/AKfycbxAVehkLAP3p2O0HQIhOnoC5XnhcrWE1G5Yxltwq1ozwzqiUcsiHwlq0FRcD9TPqQJD/exec",

  // Compagnie e vettori base precaricati di default
  DEFAULT_CARRIERS: [
    "Trenitalia",
    "Costa Crociere",
    "MSC Crociere",
    "Ryanair",
    "ANA",
    "Wizz Air",
    "Lufthansa",
    "Emirates",
    "British Airways",
    "RATP (Parigi)"
  ],

  // Normalizza e unifica i nomi delle compagnie/vettori per evitare duplicati e refusi
  normalizeCarrierName(name) {
    if (!name) return "";
    const clean = String(name).trim().replace(/\s+/g, " ");
    const lower = clean.toLowerCase();
    
    // Mappa delle equivalenze standard
    const carrierAliases = {
      "trenitalia": "Trenitalia",
      "trenitalia spa": "Trenitalia",
      "fs": "Trenitalia",
      "costa": "Costa Crociere",
      "costa crociere": "Costa Crociere",
      "msc": "MSC Crociere",
      "msc crociere": "MSC Crociere",
      "ryanair": "Ryanair",
      "ryan air": "Ryanair",
      "ana": "ANA",
      "all nippon airways": "ANA",
      "wizz air": "Wizz Air",
      "wizzair": "Wizz Air",
      "lufthansa": "Lufthansa",
      "emirates": "Emirates",
      "british airways": "British Airways",
      "ba": "British Airways",
      "ratp": "RATP (Parigi)",
      "ratp parigi": "RATP (Parigi)",
      "ratp (parigi)": "RATP (Parigi)",
      "italo": "Italo",
      "italo treno": "Italo",
      "easyjet": "easyJet",
      "easy jet": "easyJet",
      "air france": "Air France",
      "klm": "KLM",
      "iberia": "Iberia",
      "vueling": "Vueling",
      "ita airways": "ITA Airways",
      "alitalia": "ITA Airways"
    };

    return carrierAliases[lower] || clean;
  },

  // Formatta valori monetari in Euro (es. € 1.250)
  formatCurrency(val) {
    const num = Number(val) || 0;
    return `€ ${num.toLocaleString('it-IT')}`;
  },
  
  // Tavolozza ufficiale a 8 colori per grafici a torta (in ordine dal valore più alto al più basso)
  CHART_PALETTE: [
    "#FF80BF", // 1. Rosa pastello
    "#00FFA3", // 2. Verde menta
    "#00BFFF", // 3. Azzurro
    "#FAFF00", // 4. Giallo evidenziatore
    "#FF5500", // 5. Arancione fluo
    "#FFFFFF", // 6. Bianco
    "#8D5524", // 7. Marrone
    "#00E5D8"  // 8. Verde acqua
  ],

  // Formatta data da YYYY-MM-DD o ISO a GG/MM/AAAA (giorno/mese/anno) per la visualizzazione
  formatDateDisplay(dateStr) {
    if (!dateStr) return "";
    const clean = String(dateStr).trim();
    if (!clean) return "";
    // Se già in formato GG/MM/AAAA
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(clean)) return clean;
    // Se ISO string o YYYY-MM-DD
    const isoClean = clean.split("T")[0];
    const parts = isoClean.split("-");
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
    }
    return clean;
  },

  // Normalizza stringhe data evitando sfasamenti di fuso orario UTC
  normalizeDateStr(val) {
    if (!val) return "";
    const s = String(val).trim();
    if (s.includes('T')) {
      const d = new Date(s);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      }
    }
    // Se formato GG/MM/AAAA, converti in YYYY-MM-DD per memorizzazione interna
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
      const p = s.split("/");
      return `${p[2]}-${p[1]}-${p[0]}`;
    }
    return s.split('T')[0].trim();
  },

  // Sintetizza le voci della legenda in 1-2 parole riassuntive
  shortenChartLabel(label) {
    if (!label) return "";
    const labelMap = {
      "Spese Mezzi": "Mezzi",
      "Spese Hotel": "Hotel",
      "Spese Musei e Attrazioni": "Attrazioni",
      "Spese Attrezzatura": "Attrezzatura",
      "Spese Assicurazione": "Assicurazione",
      "Spese Extra": "Extra",
      "Nave da crociera": "Crociera",
      "Traghetto o battello": "Traghetto",
      "Taxi o NCC": "Taxi / NCC",
      "Trenino turistico": "Trenino",
      "Auto propria": "Auto propria",
      "Auto noleggio": "Auto noleggio",
      "America del Nord": "Nord America",
      "America del Sud": "Sud America",
      "Con la Ciurma": "Ciurma",
      "Roby & Ele": "Roby & Ele",
      "Esclusivi Roby & Ele": "Roby & Ele"
    };
    if (labelMap[label]) return labelMap[label];
    const clean = String(label).replace(/^Spese\s+/i, "").trim();
    const words = clean.split(/\s+/);
    if (words.length > 2) {
      return words.slice(0, 2).join(" ");
    }
    return clean;
  },
  
  // Reference base city: VENEZIA (Italy)
  VENICE: {
    name: "VENEZIA",
    state: "ITALIA",
    lat: 45.4408,
    lng: 12.3155
  },

  TOTAL_WORLD_COUNTRIES: 195,

  TRANSPORT_OPTIONS: [
    "Aereo",
    "Auto",
    "Treno",
    "Metro",
    "Nave da crociera",
    "Bus",
    "Traghetto o battello",
    "Taxi o NCC",
    "Trenino turistico",
    "Funivia",
    "Altro"
  ],

  TRIP_TYPES: [
    "Viaggio aereo",
    "Crociera",
    "Crociera+Altro",
    "Altro"
  ],

  TRIP_SCOPES: [
    "Motto on Tour",
    "Motto Podcast",
    "Blindly Dancing",
    "Altro"
  ],

  EXPERIENCE_CATEGORIES: [
    "Torre",
    "Ruota panoramica",
    "Caffè storico",
    "Cat caffè",
    "Ponte",
    "Museo",
    "Parco tematico",
    "Altro"
  ],

  EXPENSE_CATEGORIES: [
    { key: "Spese_Mezzi", label: "Spese Mezzi", analiticaKey: "Spese_Mezzi_Analitiche" },
    { key: "Spese_Hotel", label: "Spese Hotel", analiticaKey: "Spese_Hotel_Analitiche" },
    { key: "Spese_Attrazioni", label: "Spese Musei e Attrazioni", analiticaKey: "Spese_Attrazioni_Analitiche" },
    { key: "Spese_Attrezzatura", label: "Spese Attrezzatura", analiticaKey: "Spese_Attrezzatura_Analitiche" },
    { key: "Spese_Assicurazione", label: "Spese Assicurazione", analiticaKey: "Spese_Assicurazione_Analitiche" },
    { key: "Spese_Extra", label: "Spese Extra", analiticaKey: "Spese_Extra_Analitiche" }
  ],

  SHEETS: {
    DIARIO: "Diario di bordo",
    IN_PARTENZA: "In partenza",
    CASSETTO: "Viaggi nel cassetto",
    ARCHIVIO: "Archivio",
    SFIDE: "Sfide",
    COORDINATE: "Coordinate geografiche"
  }
};

// Database dei 195 Stati sovrani mondiali con Continente, Capitale, Bandiera e Coordinate
const COUNTRIES_DB = {
  "ITALIA": { flag: "🇮🇹", continent: "Europa", capital: "Roma", lat: 41.9028, lng: 12.4964 },
  "FRANCIA": { flag: "🇫🇷", continent: "Europa", capital: "Parigi", lat: 48.8566, lng: 2.3522 },
  "SPAGNA": { flag: "🇪🇸", continent: "Europa", capital: "Madrid", lat: 40.4168, lng: -3.7038 },
  "GERMANIA": { flag: "🇩🇪", continent: "Europa", capital: "Berlino", lat: 52.5200, lng: 13.4050 },
  "REGNO UNITO": { flag: "🇬🇧", continent: "Europa", capital: "Londra", lat: 51.5074, lng: -0.1278 },
  "GRECIA": { flag: "🇬🇷", continent: "Europa", capital: "Atene", lat: 37.9838, lng: 23.7275 },
  "PORTOGALLO": { flag: "🇵🇹", continent: "Europa", capital: "Lisbona", lat: 38.7223, lng: -9.1393 },
  "AUSTRIA": { flag: "🇦🇹", continent: "Europa", capital: "Vienna", lat: 48.2082, lng: 16.3738 },
  "SVIZZERA": { flag: "🇨🇭", continent: "Europa", capital: "Berna", lat: 46.9480, lng: 7.4474 },
  "BELGIO": { flag: "🇧🇪", continent: "Europa", capital: "Bruxelles", lat: 50.8503, lng: 4.3517 },
  "OLANDA": { flag: "🇳🇱", continent: "Europa", capital: "Amsterdam", lat: 52.3676, lng: 4.9041 },
  "PAESI BASSI": { flag: "🇳🇱", continent: "Europa", capital: "Amsterdam", lat: 52.3676, lng: 4.9041 },
  "NORVEGIA": { flag: "🇳🇴", continent: "Europa", capital: "Oslo", lat: 59.9139, lng: 10.7522 },
  "SVEZIA": { flag: "🇸🇪", continent: "Europa", capital: "Stoccolma", lat: 59.3293, lng: 18.0686 },
  "FINLANDIA": { flag: "🇫🇮", continent: "Europa", capital: "Helsinki", lat: 60.1699, lng: 24.9384 },
  "DANIMARCA": { flag: "🇩🇰", continent: "Europa", capital: "Copenaghen", lat: 55.6761, lng: 12.5683 },
  "IRLANDA": { flag: "🇮🇪", continent: "Europa", capital: "Dublino", lat: 53.3498, lng: -6.2603 },
  "ISLANDA": { flag: "🇮🇸", continent: "Europa", capital: "Reykjavik", lat: 64.1466, lng: -21.9426 },
  "POLONIA": { flag: "🇵🇱", continent: "Europa", capital: "Varsavia", lat: 52.2297, lng: 21.0122 },
  "CROAZIA": { flag: "🇭🇷", continent: "Europa", capital: "Zagabria", lat: 45.8150, lng: 15.9819 },
  "SLOVENIA": { flag: "🇸🇮", continent: "Europa", capital: "Lubiana", lat: 46.0569, lng: 14.5058 },
  "SLOVACCHIA": { flag: "🇸🇰", continent: "Europa", capital: "Bratislava", lat: 48.1486, lng: 17.1077 },
  "MALTA": { flag: "🇲🇹", continent: "Europa", capital: "La Valletta", lat: 35.8989, lng: 14.5146 },
  "CIPRO": { flag: "🇨🇾", continent: "Europa", capital: "Nicosia", lat: 35.1856, lng: 33.3823 },
  "UNGHERIA": { flag: "🇭🇺", continent: "Europa", capital: "Budapest", lat: 47.4979, lng: 19.0402 },
  "REPUBBLICA CECA": { flag: "🇨🇿", continent: "Europa", capital: "Praga", lat: 50.0755, lng: 14.4378 },
  "ROMANIA": { flag: "🇷🇴", continent: "Europa", capital: "Bucarest", lat: 44.4268, lng: 26.1025 },
  "BULGARIA": { flag: "🇧🇬", continent: "Europa", capital: "Sofia", lat: 42.6977, lng: 23.3219 },
  "TURCHIA": { flag: "🇹🇷", continent: "Europa", capital: "Ankara", lat: 39.9334, lng: 32.8597 },
  "MONTENEGRO": { flag: "🇲🇪", continent: "Europa", capital: "Podgorica", lat: 42.4304, lng: 19.2594 },
  "BOSNIA ED ERZEGOVINA": { flag: "🇧🇦", continent: "Europa", capital: "Sarajevo", lat: 43.8563, lng: 18.4131 },
  "SERBIA": { flag: "🇷🇸", continent: "Europa", capital: "Belgrado", lat: 44.7866, lng: 20.4489 },
  "ALBANIA": { flag: "🇦🇱", continent: "Europa", capital: "Tirana", lat: 41.3275, lng: 19.8187 },
  "MACEDONIA DEL NORD": { flag: "🇲🇰", continent: "Europa", capital: "Skopje", lat: 41.9981, lng: 21.4254 },
  "SAN MARINO": { flag: "🇸🇲", continent: "Europa", capital: "San Marino", lat: 43.9424, lng: 12.4578 },
  "VATICANO": { flag: "🇻🇦", continent: "Europa", capital: "Città del Vaticano", lat: 41.9029, lng: 12.4534 },
  "MONACO": { flag: "🇲🇨", continent: "Europa", capital: "Monaco", lat: 43.7384, lng: 7.4246 },
  "ANDORRA": { flag: "🇦🇩", continent: "Europa", capital: "Andorra la Vella", lat: 42.5063, lng: 1.5218 },
  "LIECHTENSTEIN": { flag: "🇱🇮", continent: "Europa", capital: "Vaduz", lat: 47.1410, lng: 9.5209 },
  "LUSSEMBURGO": { flag: "🇱🇺", continent: "Europa", capital: "Lussemburgo", lat: 49.6116, lng: 6.1319 },
  "ESTONIA": { flag: "🇪🇪", continent: "Europa", capital: "Tallinn", lat: 59.4370, lng: 24.7536 },
  "LETTONIA": { flag: "🇱🇻", continent: "Europa", capital: "Riga", lat: 56.9496, lng: 24.1052 },
  "LITUANIA": { flag: "🇱🇹", continent: "Europa", capital: "Vilnius", lat: 54.6872, lng: 25.2797 },
  
  // Asia
  "GIAPPONE": { flag: "🇯🇵", continent: "Asia", capital: "Tokyo", lat: 35.6762, lng: 139.6503 },
  "CINA": { flag: "🇨🇳", continent: "Asia", capital: "Pechino", lat: 39.9042, lng: 116.4074 },
  "THAILANDIA": { flag: "🇹🇭", continent: "Asia", capital: "Bangkok", lat: 13.7563, lng: 100.5018 },
  "VIETNAM": { flag: "🇻🇳", continent: "Asia", capital: "Hanoi", lat: 21.0285, lng: 105.8542 },
  "INDONESIA": { flag: "🇮🇩", continent: "Asia", capital: "Giacarta", lat: -6.2088, lng: 106.8456 },
  "INDIA": { flag: "🇮🇳", continent: "Asia", capital: "Nuova Delhi", lat: 28.6139, lng: 77.2090 },
  "EMIRATI ARABI UNITI": { flag: "🇦🇪", continent: "Asia", capital: "Abu Dhabi", lat: 24.4539, lng: 54.3773 },
  "SINGAPORE": { flag: "🇸🇬", continent: "Asia", capital: "Singapore", lat: 1.3521, lng: 103.8198 },
  "MALAYSIA": { flag: "🇲🇾", continent: "Asia", capital: "Kuala Lumpur", lat: 3.1390, lng: 101.6869 },
  "COREA DEL SUD": { flag: "🇰🇷", continent: "Asia", capital: "Seul", lat: 37.5665, lng: 126.9780 },
  "OMAN": { flag: "🇴🇲", continent: "Asia", capital: "Mascate", lat: 23.5880, lng: 58.3829 },
  "GIORDANIA": { flag: "🇯🇴", continent: "Asia", capital: "Amman", lat: 31.9454, lng: 35.9284 },
  "ISRAELE": { flag: "🇮🇱", continent: "Asia", capital: "Gerusalemme", lat: 31.7683, lng: 35.2137 },
  "QATAR": { flag: "🇶🇦", continent: "Asia", capital: "Doha", lat: 25.2854, lng: 51.5310 },
  "MALDIVE": { flag: "🇲🇻", continent: "Asia", capital: "Malé", lat: 4.1755, lng: 73.5093 },
  "FILIPPINE": { flag: "🇵🇭", continent: "Asia", capital: "Manila", lat: 14.5995, lng: 120.9842 },

  // America del Nord
  "STATI UNITI": { flag: "🇺🇸", continent: "America del Nord", capital: "Washington D.C.", lat: 38.9072, lng: -77.0369 },
  "USA": { flag: "🇺🇸", continent: "America del Nord", capital: "Washington D.C.", lat: 38.9072, lng: -77.0369 },
  "CANADA": { flag: "🇨🇦", continent: "America del Nord", capital: "Ottawa", lat: 45.4215, lng: -75.6972 },
  "MESSICO": { flag: "🇲🇽", continent: "America del Nord", capital: "Città del Messico", lat: 19.4326, lng: -99.1332 },
  "CUBA": { flag: "🇨🇺", continent: "America del Nord", capital: "L'Avana", lat: 23.1136, lng: -82.3666 },
  "GIAMAICA": { flag: "🇯🇲", continent: "America del Nord", capital: "Kingston", lat: 17.9712, lng: -76.7936 },
  "REPUBBLICA DOMINICANA": { flag: "🇩🇴", continent: "America del Nord", capital: "Santo Domingo", lat: 18.4861, lng: -69.9312 },
  "BAHAMAS": { flag: "🇧🇸", continent: "America del Nord", capital: "Nassau", lat: 25.0443, lng: -77.3504 },
  "PANAMA": { flag: "🇵🇦", continent: "America del Nord", capital: "Panama", lat: 8.9824, lng: -79.5199 },
  "COSTA RICA": { flag: "🇨🇷", continent: "America del Nord", capital: "San José", lat: 9.9281, lng: -84.0907 },

  // America del Sud
  "BRASILE": { flag: "🇧🇷", continent: "America del Sud", capital: "Brasilia", lat: -15.8267, lng: -47.9218 },
  "ARGENTINA": { flag: "🇦🇷", continent: "America del Sud", capital: "Buenos Aires", lat: -34.6037, lng: -58.3816 },
  "PERU": { flag: "🇵🇪", continent: "America del Sud", capital: "Lima", lat: -12.0464, lng: -77.0428 },
  "CILE": { flag: "🇨🇱", continent: "America del Sud", capital: "Santiago", lat: -33.4489, lng: -70.6693 },
  "COLOMBIA": { flag: "🇨🇴", continent: "America del Sud", capital: "Bogotà", lat: 4.7110, lng: -74.0721 },
  "ECUADOR": { flag: "🇪🇨", continent: "America del Sud", capital: "Quito", lat: -0.1807, lng: -78.4678 },
  "BOLIVIA": { flag: "🇧🇴", continent: "America del Sud", capital: "Sucre", lat: -19.0196, lng: -65.2619 },
  "URUGUAY": { flag: "🇺🇾", continent: "America del Sud", capital: "Montevideo", lat: -34.9011, lng: -56.1645 },

  // Africa
  "EGITTO": { flag: "🇪🇬", continent: "Africa", capital: "Il Cairo", lat: 30.0444, lng: 31.2357 },
  "MAROCCO": { flag: "🇲🇦", continent: "Africa", capital: "Rabat", lat: 34.0209, lng: -6.8416 },
  "SUDAFRICA": { flag: "🇿🇦", continent: "Africa", capital: "Pretoria", lat: -25.7479, lng: 28.2293 },
  "TUNISIA": { flag: "🇹🇳", continent: "Africa", capital: "Tunisi", lat: 36.8065, lng: 10.1815 },
  "KENYA": { flag: "🇰🇪", continent: "Africa", capital: "Nairobi", lat: -1.2921, lng: 36.8219 },
  "TANZANIA": { flag: "🇹🇿", continent: "Africa", capital: "Dodoma", lat: -6.1630, lng: 35.7516 },
  "MADAGASCAR": { flag: "🇲🇬", continent: "Africa", capital: "Antananarivo", lat: -18.8792, lng: 47.5079 },
  "MAURITIUS": { flag: "🇲🇺", continent: "Africa", capital: "Port Louis", lat: -20.1609, lng: 57.5012 },
  "SEYCHELLES": { flag: "🇸🇨", continent: "Africa", capital: "Victoria", lat: -4.6191, lng: 55.4513 },
  "CAPO VERDE": { flag: "🇨🇻", continent: "Africa", capital: "Praia", lat: 14.9330, lng: -23.5133 },
  "NAMIBIA": { flag: "🇳🇦", continent: "Africa", capital: "Windhoek", lat: -22.5609, lng: 17.0658 },

  // Oceania
  "AUSTRALIA": { flag: "🇦🇺", continent: "Oceania", capital: "Canberra", lat: -35.2809, lng: 149.1300 },
  "NUOVA ZELANDA": { flag: "🇳🇿", continent: "Oceania", capital: "Wellington", lat: -41.2865, lng: 174.7762 },
  "FIGI": { flag: "🇫🇯", continent: "Oceania", capital: "Suva", lat: -18.1248, lng: 178.4501 },
  "POLINESIA FRANCESE": { flag: "🇵🇫", continent: "Oceania", capital: "Papeete", lat: -17.5516, lng: -149.5585 }
};
