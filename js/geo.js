// ==========================================================================
// MOTTO ON TOUR - GEOGRAPHIC DATABASE, CALCULATIONS & VECTOR MAP ENGINE
// ==========================================================================

// Database esteso delle città italiane e mondiali con coordinate precise
const CITIES_DB = {
  // --- VENETO & NORD-EST ITALIA ---
  "CAORLE": { lat: 45.6027, lng: 12.8872, stato: "ITALIA", continente: "Europa" },
  "VENEZIA": { lat: 45.4408, lng: 12.3155, stato: "ITALIA", continente: "Europa" },
  "JESOLO": { lat: 45.5053, lng: 12.6427, stato: "ITALIA", continente: "Europa" },
  "LIDO DI JESOLO": { lat: 45.5053, lng: 12.6427, stato: "ITALIA", continente: "Europa" },
  "CHIOGGIA": { lat: 45.2178, lng: 12.2789, stato: "ITALIA", continente: "Europa" },
  "BIBIONE": { lat: 45.6358, lng: 13.0526, stato: "ITALIA", continente: "Europa" },
  "LIGNANO": { lat: 45.6931, lng: 13.1386, stato: "ITALIA", continente: "Europa" },
  "LIGNANO SABBIADORO": { lat: 45.6931, lng: 13.1386, stato: "ITALIA", continente: "Europa" },
  "GRADO": { lat: 45.6794, lng: 13.3995, stato: "ITALIA", continente: "Europa" },
  "TREVISO": { lat: 45.6669, lng: 12.2430, stato: "ITALIA", continente: "Europa" },
  "PADOVA": { lat: 45.4064, lng: 11.8768, stato: "ITALIA", continente: "Europa" },
  "VICENZA": { lat: 45.5455, lng: 11.5354, stato: "ITALIA", continente: "Europa" },
  "VERONA": { lat: 45.4384, lng: 10.9916, stato: "ITALIA", continente: "Europa" },
  "BELLUNO": { lat: 46.1425, lng: 12.2167, stato: "ITALIA", continente: "Europa" },
  "CORTINA": { lat: 46.5405, lng: 12.1357, stato: "ITALIA", continente: "Europa" },
  "CORTINA D'AMPEZZO": { lat: 46.5405, lng: 12.1357, stato: "ITALIA", continente: "Europa" },
  "ROVIGO": { lat: 45.0703, lng: 11.7906, stato: "ITALIA", continente: "Europa" },
  "BASSANO DEL GRAPPA": { lat: 45.7667, lng: 11.7333, stato: "ITALIA", continente: "Europa" },
  "CASTELFRANCO VENETO": { lat: 45.6711, lng: 11.9281, stato: "ITALIA", continente: "Europa" },
  "CONEGLIANO": { lat: 45.8858, lng: 12.2961, stato: "ITALIA", continente: "Europa" },
  "VITTORIO VENETO": { lat: 45.9833, lng: 12.3000, stato: "ITALIA", continente: "Europa" },
  "PORTOGRUARO": { lat: 45.7769, lng: 12.8375, stato: "ITALIA", continente: "Europa" },
  "SAN DONA DI PIAVE": { lat: 45.6308, lng: 12.5636, stato: "ITALIA", continente: "Europa" },
  "MESTRE": { lat: 45.4908, lng: 12.2422, stato: "ITALIA", continente: "Europa" },
  "BURANO": { lat: 45.4854, lng: 12.4167, stato: "ITALIA", continente: "Europa" },
  "MURANO": { lat: 45.4578, lng: 12.3533, stato: "ITALIA", continente: "Europa" },
  "ERACLEA": { lat: 45.5819, lng: 12.6842, stato: "ITALIA", continente: "Europa" },
  "TRIESTE": { lat: 45.6495, lng: 13.7768, stato: "ITALIA", continente: "Europa" },
  "UDINE": { lat: 46.0711, lng: 13.2346, stato: "ITALIA", continente: "Europa" },
  "PORDENONE": { lat: 45.9567, lng: 12.6605, stato: "ITALIA", continente: "Europa" },
  "GORIZIA": { lat: 45.9408, lng: 13.6217, stato: "ITALIA", continente: "Europa" },
  "TRENTO": { lat: 46.0748, lng: 11.1217, stato: "ITALIA", continente: "Europa" },
  "BOLZANO": { lat: 46.4983, lng: 11.3548, stato: "ITALIA", continente: "Europa" },
  "MERANO": { lat: 46.6682, lng: 11.1595, stato: "ITALIA", continente: "Europa" },
  "RIVA DEL GARDA": { lat: 45.8858, lng: 10.8411, stato: "ITALIA", continente: "Europa" },

  // --- NORD-OVEST ITALIA ---
  "MILANO": { lat: 45.4642, lng: 9.1900, stato: "ITALIA", continente: "Europa" },
  "BERGAMO": { lat: 45.6983, lng: 9.6773, stato: "ITALIA", continente: "Europa" },
  "BRESCIA": { lat: 45.5416, lng: 10.2118, stato: "ITALIA", continente: "Europa" },
  "COMO": { lat: 45.8081, lng: 9.0852, stato: "ITALIA", continente: "Europa" },
  "LECCO": { lat: 45.8566, lng: 9.3977, stato: "ITALIA", continente: "Europa" },
  "MONZA": { lat: 45.5845, lng: 9.2744, stato: "ITALIA", continente: "Europa" },
  "VARESE": { lat: 45.8206, lng: 8.8251, stato: "ITALIA", continente: "Europa" },
  "PAVIA": { lat: 45.1847, lng: 9.1582, stato: "ITALIA", continente: "Europa" },
  "MANTOVA": { lat: 45.1564, lng: 10.7914, stato: "ITALIA", continente: "Europa" },
  "CREMONA": { lat: 45.1333, lng: 10.0333, stato: "ITALIA", continente: "Europa" },
  "TORINO": { lat: 45.0703, lng: 7.6869, stato: "ITALIA", continente: "Europa" },
  "NOVARA": { lat: 45.4469, lng: 8.6212, stato: "ITALIA", continente: "Europa" },
  "ASTI": { lat: 44.9008, lng: 8.2069, stato: "ITALIA", continente: "Europa" },
  "ALESSANDRIA": { lat: 44.9125, lng: 8.6153, stato: "ITALIA", continente: "Europa" },
  "CUNEO": { lat: 44.3845, lng: 7.5427, stato: "ITALIA", continente: "Europa" },
  "AOSTA": { lat: 45.7373, lng: 7.3197, stato: "ITALIA", continente: "Europa" },
  "GENOVA": { lat: 44.4056, lng: 8.9463, stato: "ITALIA", continente: "Europa" },
  "SAVONA": { lat: 44.3080, lng: 8.4810, stato: "ITALIA", continente: "Europa" },
  "LA SPEZIA": { lat: 44.1070, lng: 9.8282, stato: "ITALIA", continente: "Europa" },
  "SANREMO": { lat: 43.8160, lng: 7.7766, stato: "ITALIA", continente: "Europa" },
  "CINQUE TERRE": { lat: 44.1461, lng: 9.6544, stato: "ITALIA", continente: "Europa" },
  "PORTOFINO": { lat: 44.3039, lng: 9.2092, stato: "ITALIA", continente: "Europa" },

  // --- CENTRO ITALIA & EMILIA ROMAGNA ---
  "BOLOGNA": { lat: 44.4949, lng: 11.3426, stato: "ITALIA", continente: "Europa" },
  "MODENA": { lat: 44.6471, lng: 10.9252, stato: "ITALIA", continente: "Europa" },
  "PARMA": { lat: 44.8015, lng: 10.3279, stato: "ITALIA", continente: "Europa" },
  "REGGIO EMILIA": { lat: 44.6983, lng: 10.6312, stato: "ITALIA", continente: "Europa" },
  "PIACENZA": { lat: 45.0526, lng: 9.6934, stato: "ITALIA", continente: "Europa" },
  "FERRARA": { lat: 44.8381, lng: 11.6198, stato: "ITALIA", continente: "Europa" },
  "RAVENNA": { lat: 44.4184, lng: 12.2035, stato: "ITALIA", continente: "Europa" },
  "FORLI": { lat: 44.2227, lng: 12.0407, stato: "ITALIA", continente: "Europa" },
  "CESENA": { lat: 44.1391, lng: 12.2431, stato: "ITALIA", continente: "Europa" },
  "RIMINI": { lat: 44.0678, lng: 12.5695, stato: "ITALIA", continente: "Europa" },
  "RICCIONE": { lat: 43.9992, lng: 12.6559, stato: "ITALIA", continente: "Europa" },
  "FIRENZE": { lat: 43.7696, lng: 11.2558, stato: "ITALIA", continente: "Europa" },
  "PISA": { lat: 43.7228, lng: 10.4017, stato: "ITALIA", continente: "Europa" },
  "SIENA": { lat: 43.3188, lng: 11.3308, stato: "ITALIA", continente: "Europa" },
  "LUCCA": { lat: 43.8430, lng: 10.5080, stato: "ITALIA", continente: "Europa" },
  "LIVORNO": { lat: 43.5485, lng: 10.3106, stato: "ITALIA", continente: "Europa" },
  "AREZZO": { lat: 43.4632, lng: 11.8796, stato: "ITALIA", continente: "Europa" },
  "GROSSETO": { lat: 42.7634, lng: 11.1116, stato: "ITALIA", continente: "Europa" },
  "PERUGIA": { lat: 43.1107, lng: 12.3908, stato: "ITALIA", continente: "Europa" },
  "ASSISI": { lat: 43.0707, lng: 12.6196, stato: "ITALIA", continente: "Europa" },
  "TERNI": { lat: 42.5641, lng: 12.6406, stato: "ITALIA", continente: "Europa" },
  "ANCONA": { lat: 43.6158, lng: 13.5189, stato: "ITALIA", continente: "Europa" },
  "PESARO": { lat: 43.9125, lng: 12.9155, stato: "ITALIA", continente: "Europa" },
  "URBINO": { lat: 43.7262, lng: 12.6366, stato: "ITALIA", continente: "Europa" },
  "MACERATA": { lat: 43.3002, lng: 13.4531, stato: "ITALIA", continente: "Europa" },
  "ASCOLI PICENO": { lat: 42.8546, lng: 13.5758, stato: "ITALIA", continente: "Europa" },
  "ROMA": { lat: 41.9028, lng: 12.4964, stato: "ITALIA", continente: "Europa" },
  "CIVITAVECCHIA": { lat: 42.0924, lng: 11.7954, stato: "ITALIA", continente: "Europa" },
  "TIVOLI": { lat: 41.9606, lng: 12.7989, stato: "ITALIA", continente: "Europa" },
  "VITERBO": { lat: 42.4174, lng: 12.1047, stato: "ITALIA", continente: "Europa" },
  "LATINA": { lat: 41.4676, lng: 12.9037, stato: "ITALIA", continente: "Europa" },
  "FROSINONE": { lat: 41.6404, lng: 13.3496, stato: "ITALIA", continente: "Europa" },
  "L'AQUILA": { lat: 42.3498, lng: 13.3995, stato: "ITALIA", continente: "Europa" },
  "PESCARA": { lat: 42.4618, lng: 14.2160, stato: "ITALIA", continente: "Europa" },
  "CHIETI": { lat: 42.3510, lng: 14.1675, stato: "ITALIA", continente: "Europa" },
  "CAMPOBASSO": { lat: 41.5603, lng: 14.6627, stato: "ITALIA", continente: "Europa" },
  "SAN MARINO": { lat: 43.9424, lng: 12.4578, stato: "SAN MARINO", continente: "Europa" },
  "CITTA DEL VATICANO": { lat: 41.9029, lng: 12.4534, stato: "VATICANO", continente: "Europa" },

  // --- SUD ITALIA & ISOLE ---
  "NAPOLI": { lat: 40.8518, lng: 14.2681, stato: "ITALIA", continente: "Europa" },
  "SALERNO": { lat: 40.6824, lng: 14.7681, stato: "ITALIA", continente: "Europa" },
  "SORRENTO": { lat: 40.6263, lng: 14.3758, stato: "ITALIA", continente: "Europa" },
  "CAPRI": { lat: 40.5507, lng: 14.2426, stato: "ITALIA", continente: "Europa" },
  "ISCHIA": { lat: 40.7410, lng: 13.9489, stato: "ITALIA", continente: "Europa" },
  "AMALFI": { lat: 40.6340, lng: 14.6027, stato: "ITALIA", continente: "Europa" },
  "POSITANO": { lat: 40.6281, lng: 14.4850, stato: "ITALIA", continente: "Europa" },
  "POMPEI": { lat: 40.7508, lng: 14.4869, stato: "ITALIA", continente: "Europa" },
  "CASERTA": { lat: 41.0719, lng: 14.3323, stato: "ITALIA", continente: "Europa" },
  "BARI": { lat: 41.1171, lng: 16.8719, stato: "ITALIA", continente: "Europa" },
  "BRINDISI": { lat: 40.6327, lng: 17.9418, stato: "ITALIA", continente: "Europa" },
  "LECCE": { lat: 40.3515, lng: 18.1750, stato: "ITALIA", continente: "Europa" },
  "TARANTO": { lat: 40.4644, lng: 17.2470, stato: "ITALIA", continente: "Europa" },
  "FOGGIA": { lat: 41.4622, lng: 15.5446, stato: "ITALIA", continente: "Europa" },
  "OTRANTO": { lat: 40.1444, lng: 18.4900, stato: "ITALIA", continente: "Europa" },
  "GALLIPOLI": { lat: 40.0558, lng: 17.9926, stato: "ITALIA", continente: "Europa" },
  "ALBEROBELLO": { lat: 40.7838, lng: 17.2372, stato: "ITALIA", continente: "Europa" },
  "MATERA": { lat: 40.6664, lng: 16.6043, stato: "ITALIA", continente: "Europa" },
  "POTENZA": { lat: 40.6404, lng: 15.8056, stato: "ITALIA", continente: "Europa" },
  "COSENZA": { lat: 39.3088, lng: 16.2519, stato: "ITALIA", continente: "Europa" },
  "CATANZARO": { lat: 38.9100, lng: 16.5877, stato: "ITALIA", continente: "Europa" },
  "REGGIO CALABRIA": { lat: 38.1113, lng: 15.6473, stato: "ITALIA", continente: "Europa" },
  "TROPEA": { lat: 38.6775, lng: 15.8978, stato: "ITALIA", continente: "Europa" },
  "PALERMO": { lat: 38.1157, lng: 13.3615, stato: "ITALIA", continente: "Europa" },
  "CATANIA": { lat: 37.5079, lng: 15.0873, stato: "ITALIA", continente: "Europa" },
  "MESSINA": { lat: 38.1938, lng: 15.5540, stato: "ITALIA", continente: "Europa" },
  "SIRACUSA": { lat: 37.0755, lng: 15.2866, stato: "ITALIA", continente: "Europa" },
  "TAORMINA": { lat: 37.8516, lng: 15.2853, stato: "ITALIA", continente: "Europa" },
  "AGRIGENTO": { lat: 37.3090, lng: 13.5847, stato: "ITALIA", continente: "Europa" },
  "TRAPANI": { lat: 38.0176, lng: 12.5365, stato: "ITALIA", continente: "Europa" },
  "RAGUSA": { lat: 36.9269, lng: 14.7306, stato: "ITALIA", continente: "Europa" },
  "CEFALU": { lat: 38.0386, lng: 14.0229, stato: "ITALIA", continente: "Europa" },
  "CAGLIARI": { lat: 39.2238, lng: 9.1217, stato: "ITALIA", continente: "Europa" },
  "OLBIA": { lat: 40.9234, lng: 9.4984, stato: "ITALIA", continente: "Europa" },
  "SASSARI": { lat: 40.7259, lng: 8.5556, stato: "ITALIA", continente: "Europa" },
  "ALGHERO": { lat: 40.5580, lng: 8.3193, stato: "ITALIA", continente: "Europa" },
  "NUORO": { lat: 40.3204, lng: 9.3285, stato: "ITALIA", continente: "Europa" },

  // --- EUROPA & DESTINAZIONI CROCIERA ---
  "PARIGI": { lat: 48.8566, lng: 2.3522, stato: "FRANCIA", continente: "Europa" },
  "NIZZA": { lat: 43.7102, lng: 7.2620, stato: "FRANCIA", continente: "Europa" },
  "MARSIGLIA": { lat: 43.2965, lng: 5.3698, stato: "FRANCIA", continente: "Europa" },
  "LIONE": { lat: 45.7640, lng: 4.8357, stato: "FRANCIA", continente: "Europa" },
  "BORDEAUX": { lat: 44.8378, lng: -0.5792, stato: "FRANCIA", continente: "Europa" },
  "STRASBURGO": { lat: 48.5734, lng: 7.7521, stato: "FRANCIA", continente: "Europa" },
  "AJACCIO": { lat: 41.9271, lng: 8.7369, stato: "FRANCIA", continente: "Europa" },
  "MONACO": { lat: 43.7384, lng: 7.4246, stato: "MONACO", continente: "Europa" },
  "MONTE CARLO": { lat: 43.7384, lng: 7.4246, stato: "MONACO", continente: "Europa" },
  "MADRID": { lat: 40.4168, lng: -3.7038, stato: "SPAGNA", continente: "Europa" },
  "BARCELLONA": { lat: 41.3874, lng: 2.1686, stato: "SPAGNA", continente: "Europa" },
  "VALENCIA": { lat: 39.4699, lng: -0.3763, stato: "SPAGNA", continente: "Europa" },
  "SIVIGLIA": { lat: 37.3891, lng: -5.9845, stato: "SPAGNA", continente: "Europa" },
  "MALAGA": { lat: 36.7213, lng: -4.4214, stato: "SPAGNA", continente: "Europa" },
  "CADICE": { lat: 36.5271, lng: -6.2886, stato: "SPAGNA", continente: "Europa" },
  "CADIZ": { lat: 36.5271, lng: -6.2886, stato: "SPAGNA", continente: "Europa" },
  "LAS PALMAS": { lat: 28.1235, lng: -15.4363, stato: "SPAGNA", continente: "Europa" },
  "LAS PALMAS DE GRAN CANARIA": { lat: 28.1235, lng: -15.4363, stato: "SPAGNA", continente: "Europa" },
  "SANTA CRUZ DE TENERIFE": { lat: 28.4636, lng: -16.2518, stato: "SPAGNA", continente: "Europa" },
  "ARRECIFE": { lat: 28.9630, lng: -13.5477, stato: "SPAGNA", continente: "Europa" },
  "PUERTO DEL ROSARIO": { lat: 28.5004, lng: -13.8627, stato: "SPAGNA", continente: "Europa" },
  "PALMA DI MAIORCA": { lat: 39.5696, lng: 2.6502, stato: "SPAGNA", continente: "Europa" },
  "IBIZA": { lat: 38.9067, lng: 1.4206, stato: "SPAGNA", continente: "Europa" },
  "TENERIFE": { lat: 28.2916, lng: -16.6291, stato: "SPAGNA", continente: "Europa" },
  "GRAN CANARIA": { lat: 27.9202, lng: -15.5474, stato: "SPAGNA", continente: "Europa" },
  "ALICANTE": { lat: 38.3452, lng: -0.4810, stato: "SPAGNA", continente: "Europa" },
  "CORDOBA": { lat: 37.8882, lng: -4.7794, stato: "SPAGNA", continente: "Europa" },
  "GRANADA": { lat: 37.1773, lng: -3.5986, stato: "SPAGNA", continente: "Europa" },
  "BILBAO": { lat: 43.2630, lng: -2.9350, stato: "SPAGNA", continente: "Europa" },
  "GIBILTERRA": { lat: 36.1408, lng: -5.3536, stato: "REGNO UNITO", continente: "Europa" },
  "GIBRALTAR": { lat: 36.1408, lng: -5.3536, stato: "REGNO UNITO", continente: "Europa" },
  "KOTOR": { lat: 42.4247, lng: 18.7712, stato: "MONTENEGRO", continente: "Europa" },
  "CATTARO": { lat: 42.4247, lng: 18.7712, stato: "MONTENEGRO", continente: "Europa" },
  "LONDRA": { lat: 51.5074, lng: -0.1278, stato: "REGNO UNITO", continente: "Europa" },
  "EDIMBURGO": { lat: 55.9533, lng: -3.1883, stato: "REGNO UNITO", continente: "Europa" },
  "MANCHESTER": { lat: 53.4808, lng: -2.2426, stato: "REGNO UNITO", continente: "Europa" },
  "LIVERPOOL": { lat: 53.4084, lng: -2.9916, stato: "REGNO UNITO", continente: "Europa" },
  "DUBLINO": { lat: 53.3498, lng: -6.2603, stato: "IRLANDA", continente: "Europa" },
  "BERLINO": { lat: 52.5200, lng: 13.4050, stato: "GERMANIA", continente: "Europa" },
  "MONACO DI BAVIERA": { lat: 48.1351, lng: 11.5820, stato: "GERMANIA", continente: "Europa" },
  "FRANCOFORTE": { lat: 50.1109, lng: 8.6821, stato: "GERMANIA", continente: "Europa" },
  "AMBURGO": { lat: 53.5511, lng: 9.9937, stato: "GERMANIA", continente: "Europa" },
  "COLONIA": { lat: 50.9375, lng: 6.9603, stato: "GERMANIA", continente: "Europa" },
  "VIENNA": { lat: 48.2082, lng: 16.3738, stato: "AUSTRIA", continente: "Europa" },
  "SALISBURGO": { lat: 47.8095, lng: 13.0550, stato: "AUSTRIA", continente: "Europa" },
  "INNSBRUCK": { lat: 47.2692, lng: 11.4041, stato: "AUSTRIA", continente: "Europa" },
  "ZURIGO": { lat: 47.3769, lng: 8.5417, stato: "SVIZZERA", continente: "Europa" },
  "GINEVRA": { lat: 46.2044, lng: 6.1432, stato: "SVIZZERA", continente: "Europa" },
  "BERNA": { lat: 46.9480, lng: 7.4474, stato: "SVIZZERA", continente: "Europa" },
  "LUGANO": { lat: 46.0037, lng: 8.9511, stato: "SVIZZERA", continente: "Europa" },
  "BASILEA": { lat: 47.5596, lng: 7.5886, stato: "SVIZZERA", continente: "Europa" },
  "BRUXELLES": { lat: 50.8503, lng: 4.3517, stato: "BELGIO", continente: "Europa" },
  "BRUGES": { lat: 51.2093, lng: 3.2247, stato: "BELGIO", continente: "Europa" },
  "ANVERSA": { lat: 51.2194, lng: 4.4025, stato: "BELGIO", continente: "Europa" },
  "AMSTERDAM": { lat: 52.3676, lng: 4.9041, stato: "OLANDA", continente: "Europa" },
  "ROTTERDAM": { lat: 51.9244, lng: 4.4777, stato: "OLANDA", continente: "Europa" },
  "LISBONA": { lat: 38.7223, lng: -9.1393, stato: "PORTOGALLO", continente: "Europa" },
  "PORTO": { lat: 41.1579, lng: -8.6291, stato: "PORTOGALLO", continente: "Europa" },
  "FUNCHAL": { lat: 32.6669, lng: -16.9241, stato: "PORTOGALLO", continente: "Europa" },
  "OSLO": { lat: 59.9139, lng: 10.7522, stato: "NORVEGIA", continente: "Europa" },
  "BERGEN": { lat: 60.3913, lng: 5.3221, stato: "NORVEGIA", continente: "Europa" },
  "STAVANGER": { lat: 58.9700, lng: 5.7331, stato: "NORVEGIA", continente: "Europa" },
  "TROMSO": { lat: 69.6492, lng: 18.9553, stato: "NORVEGIA", continente: "Europa" },
  "GEIRANGER": { lat: 62.1008, lng: 7.2059, stato: "NORVEGIA", continente: "Europa" },
  "FLAM": { lat: 60.8608, lng: 7.1147, stato: "NORVEGIA", continente: "Europa" },
  "ALESUND": { lat: 62.4722, lng: 6.1495, stato: "NORVEGIA", continente: "Europa" },
  "STOCCOLMA": { lat: 59.3293, lng: 18.0686, stato: "SVEZIA", continente: "Europa" },
  "GOTEBORG": { lat: 57.7089, lng: 11.9746, stato: "SVEZIA", continente: "Europa" },
  "MALMO": { lat: 55.6050, lng: 13.0038, stato: "SVEZIA", continente: "Europa" },
  "HELSINKI": { lat: 60.1699, lng: 24.9384, stato: "FINLANDIA", continente: "Europa" },
  "ROVANIEMI": { lat: 66.5039, lng: 25.7294, stato: "FINLANDIA", continente: "Europa" },
  "COPENAGHEN": { lat: 55.6761, lng: 12.5683, stato: "DANIMARCA", continente: "Europa" },
  "REYKJAVIK": { lat: 64.1466, lng: -21.9426, stato: "ISLANDA", continente: "Europa" },
  "ATENE": { lat: 37.9838, lng: 23.7275, stato: "GRECIA", continente: "Europa" },
  "SANTORINI": { lat: 36.3932, lng: 25.4615, stato: "GRECIA", continente: "Europa" },
  "MYKONOS": { lat: 37.4467, lng: 25.3289, stato: "GRECIA", continente: "Europa" },
  "RODI": { lat: 36.4341, lng: 28.2176, stato: "GRECIA", continente: "Europa" },
  "CRETA": { lat: 35.3387, lng: 25.1442, stato: "GRECIA", continente: "Europa" },
  "HERAKLION": { lat: 35.3387, lng: 25.1442, stato: "GRECIA", continente: "Europa" },
  "CORFU": { lat: 39.6243, lng: 19.9217, stato: "GRECIA", continente: "Europa" },
  "ZACINTO": { lat: 37.7870, lng: 20.8999, stato: "GRECIA", continente: "Europa" },
  "DUBROVNIK": { lat: 42.6507, lng: 18.0944, stato: "CROAZIA", continente: "Europa" },
  "SPALATO": { lat: 43.5081, lng: 16.4402, stato: "CROAZIA", continente: "Europa" },
  "ZARA": { lat: 44.1194, lng: 15.2314, stato: "CROAZIA", continente: "Europa" },
  "ZAGABRIA": { lat: 45.8150, lng: 15.9819, stato: "CROAZIA", continente: "Europa" },
  "LUBIANA": { lat: 46.0569, lng: 14.5058, stato: "SLOVENIA", continente: "Europa" },
  "BLED": { lat: 46.3683, lng: 14.1146, stato: "SLOVENIA", continente: "Europa" },
  "LA VALLETTA": { lat: 35.8989, lng: 14.5146, stato: "MALTA", continente: "Europa" },
  "BUDAPEST": { lat: 47.4979, lng: 19.0402, stato: "UNGHERIA", continente: "Europa" },
  "PRAGA": { lat: 50.0755, lng: 14.4378, stato: "REPUBBLICA CECA", continente: "Europa" },
  "VARSAVIA": { lat: 52.2297, lng: 21.0122, stato: "POLONIA", continente: "Europa" },
  "CRACOVIA": { lat: 50.0647, lng: 19.9450, stato: "POLONIA", continente: "Europa" },
  "BUCAREST": { lat: 44.4268, lng: 26.1025, stato: "ROMANIA", continente: "Europa" },
  "SOFIA": { lat: 42.6977, lng: 23.3219, stato: "BULGARIA", continente: "Europa" },
  "ISTANBUL": { lat: 41.0082, lng: 28.9784, stato: "TURCHIA", continente: "Europa" },
  "KUSADASI": { lat: 37.8579, lng: 27.2610, stato: "TURCHIA", continente: "Europa" },
  "ANTALYA": { lat: 36.8969, lng: 30.7133, stato: "TURCHIA", continente: "Europa" },

  // --- MONDO (AMERICA, ASIA, AFRICA, OCEANIA) ---
  "NEW YORK": { lat: 40.7128, lng: -74.0060, stato: "STATI UNITI", continente: "America del Nord" },
  "WASHINGTON": { lat: 38.9072, lng: -77.0369, stato: "STATI UNITI", continente: "America del Nord" },
  "WASHINGTON D.C.": { lat: 38.9072, lng: -77.0369, stato: "STATI UNITI", continente: "America del Nord" },
  "MIAMI": { lat: 25.7617, lng: -80.1918, stato: "STATI UNITI", continente: "America del Nord" },
  "ORLANDO": { lat: 28.5383, lng: -81.3792, stato: "STATI UNITI", continente: "America del Nord" },
  "LOS ANGELES": { lat: 34.0522, lng: -118.2437, stato: "STATI UNITI", continente: "America del Nord" },
  "SAN FRANCISCO": { lat: 37.7749, lng: -122.4194, stato: "STATI UNITI", continente: "America del Nord" },
  "LAS VEGAS": { lat: 36.1699, lng: -115.1398, stato: "STATI UNITI", continente: "America del Nord" },
  "CHICAGO": { lat: 41.8781, lng: -87.6298, stato: "STATI UNITI", continente: "America del Nord" },
  "BOSTON": { lat: 42.3601, lng: -71.0589, stato: "STATI UNITI", continente: "America del Nord" },
  "TORONTO": { lat: 43.6532, lng: -79.3832, stato: "CANADA", continente: "America del Nord" },
  "VANCOUVER": { lat: 49.2827, lng: -123.1207, stato: "CANADA", continente: "America del Nord" },
  "MONTREAL": { lat: 45.5017, lng: -73.5673, stato: "CANADA", continente: "America del Nord" },
  "CITTA DEL MESSICO": { lat: 19.4326, lng: -99.1332, stato: "MESSICO", continente: "America del Nord" },
  "CANCUN": { lat: 21.1619, lng: -86.8515, stato: "MESSICO", continente: "America del Nord" },
  "L'AVANA": { lat: 23.1136, lng: -82.3666, stato: "CUBA", continente: "America del Nord" },
  "NASSAU": { lat: 25.0443, lng: -77.3504, stato: "BAHAMAS", continente: "America del Nord" },
  "SAN JUAN": { lat: 18.4655, lng: -66.1057, stato: "STATI UNITI", continente: "America del Nord" },
  "RIO DE JANEIRO": { lat: -22.9068, lng: -43.1729, stato: "BRASILE", continente: "America del Sud" },
  "SAN PAOLO": { lat: -23.5505, lng: -46.6333, stato: "BRASILE", continente: "America del Sud" },
  "BUENOS AIRES": { lat: -34.6037, lng: -58.3816, stato: "ARGENTINA", continente: "America del Sud" },
  "SANTIAGO": { lat: -33.4489, lng: -70.6693, stato: "CILE", continente: "America del Sud" },
  "LIMA": { lat: -12.0464, lng: -77.0428, stato: "PERU", continente: "America del Sud" },
  "CUSCO": { lat: -13.5319, lng: -71.9675, stato: "PERU", continente: "America del Sud" },
  "IL CAIRO": { lat: 30.0444, lng: 31.2357, stato: "EGITTO", continente: "Africa" },
  "LUXOR": { lat: 25.6872, lng: 32.6396, stato: "EGITTO", continente: "Africa" },
  "SHARM EL SHEIKH": { lat: 27.9158, lng: 34.3299, stato: "EGITTO", continente: "Africa" },
  "MARRAKECH": { lat: 31.6295, lng: -7.9811, stato: "MAROCCO", continente: "Africa" },
  "CASABLANCA": { lat: 33.5731, lng: -7.5898, stato: "MAROCCO", continente: "Africa" },
  "CITTA DEL CAPO": { lat: -33.9249, lng: 18.4241, stato: "SUDAFRICA", continente: "Africa" },
  "DUBAI": { lat: 25.2048, lng: 55.2708, stato: "EMIRATI ARABI UNITI", continente: "Asia" },
  "ABU DHABI": { lat: 24.4539, lng: 54.3773, stato: "EMIRATI ARABI UNITI", continente: "Asia" },
  "DOHA": { lat: 25.2854, lng: 51.5310, stato: "QATAR", continente: "Asia" },
  "MASCATE": { lat: 23.5880, lng: 58.3829, stato: "OMAN", continente: "Asia" },
  "AMMAN": { lat: 31.9454, lng: 35.9284, stato: "GIORDANIA", continente: "Asia" },
  "PETRA": { lat: 30.3285, lng: 35.4444, stato: "GIORDANIA", continente: "Asia" },
  "GERUSALEMME": { lat: 31.7683, lng: 35.2137, stato: "ISRAELE", continente: "Asia" },
  "TEL AVIV": { lat: 32.0853, lng: 34.7818, stato: "ISRAELE", continente: "Asia" },
  "TOKYO": { lat: 35.6762, lng: 139.6503, stato: "GIAPPONE", continente: "Asia" },
  "KYOTO": { lat: 35.0116, lng: 135.7681, stato: "GIAPPONE", continente: "Asia" },
  "OSAKA": { lat: 34.6937, lng: 135.5023, stato: "GIAPPONE", continente: "Asia" },
  "HIROSHIMA": { lat: 34.3853, lng: 132.4553, stato: "GIAPPONE", continente: "Asia" },
  "PECHINO": { lat: 39.9042, lng: 116.4074, stato: "CINA", continente: "Asia" },
  "SHANGHAI": { lat: 31.2304, lng: 121.4737, stato: "CINA", continente: "Asia" },
  "HONG KONG": { lat: 22.3193, lng: 114.1694, stato: "CINA", continente: "Asia" },
  "BANGKOK": { lat: 13.7563, lng: 100.5018, stato: "THAILANDIA", continente: "Asia" },
  "PHUKET": { lat: 7.8804, lng: 98.3923, stato: "THAILANDIA", continente: "Asia" },
  "SINGAPORE": { lat: 1.3521, lng: 103.8198, stato: "SINGAPORE", continente: "Asia" },
  "BALI": { lat: -8.4095, lng: 115.1889, stato: "INDONESIA", continente: "Asia" },
  "SYDNEY": { lat: -33.8688, lng: 151.2093, stato: "AUSTRALIA", continente: "Oceania" },
  "MELBOURNE": { lat: -37.8136, lng: 144.9631, stato: "AUSTRALIA", continente: "Oceania" },
  "AUCKLAND": { lat: -36.8485, lng: 174.7633, stato: "NUOVA ZELANDA", continente: "Oceania" }
};

// ==========================================================================
// VECTOR MAP OUTLINES DATA (LANDMASSES & COUNTRIES)
// ==========================================================================

const MAP_VECTORS = {
  // Poligoni standard per le masse continentali mondiali (coordinate lat/lon)
  CONTINENTS: {
    "Europa": [
      [36.0, -5.5], [37.0, -9.0], [43.5, -9.3], [43.8, -1.8], [47.5, -3.0], [49.5, -1.5], [51.0, 2.0], [53.5, 7.0],
      [55.0, 8.5], [57.5, 10.5], [55.5, 12.5], [54.0, 19.0], [59.0, 25.0], [60.0, 30.0], [65.0, 25.0], [70.0, 28.0],
      [71.0, 25.0], [68.0, 15.0], [62.0, 5.0], [58.0, 6.0], [54.0, 9.0], [53.0, 6.0], [51.0, 3.0], [48.0, -4.5],
      [46.0, -1.2], [43.5, -2.0], [42.0, 3.0], [43.5, 7.0], [44.0, 10.0], [41.0, 16.0], [38.0, 15.5], [37.0, 15.0],
      [40.0, 18.5], [41.5, 19.5], [39.0, 21.0], [36.5, 23.0], [37.5, 24.0], [40.5, 23.0], [41.0, 29.0], [45.0, 30.0],
      [46.0, 35.0], [45.0, 37.0], [42.0, 29.0], [40.0, 26.0], [36.0, 28.0], [35.0, 25.0], [36.0, 22.0], [38.0, 20.5],
      [38.0, 15.5], [36.5, -4.5]
    ],
    "Asia": [
      [70.0, 35.0], [77.0, 100.0], [70.0, 170.0], [60.0, 165.0], [52.0, 142.0], [43.0, 132.0], [38.0, 128.0],
      [35.0, 129.0], [30.0, 122.0], [22.0, 114.0], [21.0, 108.0], [10.0, 104.0], [1.3, 104.0], [8.0, 98.0],
      [15.0, 96.0], [22.0, 90.0], [13.0, 80.0], [8.0, 77.0], [19.0, 73.0], [24.0, 68.0], [25.0, 60.0],
      [13.0, 45.0], [28.0, 35.0], [31.0, 35.0], [36.0, 36.0], [41.0, 29.0], [46.0, 48.0], [55.0, 60.0], [68.0, 65.0]
    ],
    "Africa": [
      [37.0, 10.0], [32.0, 32.0], [28.0, 34.0], [12.0, 44.0], [12.0, 51.0], [-5.0, 40.0], [-26.0, 33.0],
      [-34.5, 20.0], [-30.0, 17.0], [-15.0, 12.0], [4.0, 9.0], [5.0, 0.0], [4.0, -7.0], [12.0, -17.0],
      [21.0, -17.0], [32.0, -9.0], [36.0, -5.5], [37.0, 4.0]
    ],
    "America del Nord": [
      [72.0, -160.0], [70.0, -130.0], [60.0, -65.0], [47.0, -53.0], [44.0, -66.0], [35.0, -75.0], [25.0, -80.0],
      [30.0, -84.0], [29.0, -95.0], [26.0, -97.0], [19.0, -96.0], [15.0, -88.0], [9.0, -79.0], [16.0, -95.0],
      [23.0, -107.0], [32.0, -117.0], [48.0, -125.0], [58.0, -136.0], [60.0, -145.0], [65.0, -168.0]
    ],
    "America del Sud": [
      [12.0, -72.0], [10.0, -62.0], [5.0, -52.0], [-5.0, -35.0], [-13.0, -39.0], [-23.0, -42.0], [-34.0, -53.0],
      [-53.0, -68.0], [-55.0, -67.0], [-45.0, -74.0], [-33.0, -72.0], [-18.0, -71.0], [-5.0, -81.0], [5.0, -77.0], [9.0, -78.0]
    ],
    "Oceania": [
      [-11.0, 142.0], [-18.0, 146.0], [-25.0, 153.0], [-37.0, 150.0], [-38.0, 141.0], [-35.0, 136.0],
      [-32.0, 125.0], [-34.0, 115.0], [-22.0, 114.0], [-15.0, 125.0], [-12.0, 135.0]
    ]
  },

  // Coordinate dettagliate dei confini dei principali Paesi per la Mappa Mondiale
  COUNTRIES_POLYGONS: {
    "ITALIA": [
      // Alpi e Confine Nord
      [45.8, 6.8], [45.9, 7.5], [46.2, 8.5], [46.5, 10.4], [47.0, 12.1], [46.6, 13.7], [45.7, 13.8],
      // Costa Adriatica
      [45.7, 13.1], [45.6, 12.9], [45.4, 12.3], [45.2, 12.3], [44.8, 12.3], [44.4, 12.2], [44.1, 12.6],
      [43.6, 13.5], [42.4, 14.2], [41.9, 15.4], [41.8, 16.2], [41.1, 16.9], [40.6, 17.9], [40.1, 18.5],
      // Salento & Ionio
      [39.8, 18.3], [40.3, 17.9], [40.5, 17.1], [39.8, 16.5], [39.1, 17.2], [38.3, 16.2], [38.0, 16.0],
      // Calabria & Tirreno
      [38.2, 15.6], [38.7, 15.9], [39.3, 16.1], [40.0, 15.3], [40.6, 14.4], [40.8, 14.0], [41.3, 13.0],
      [41.7, 12.2], [42.1, 11.8], [42.4, 11.1], [43.5, 10.3], [43.8, 10.3], [44.1, 9.8], [44.4, 8.9],
      // Liguria verso Alpi
      [43.8, 7.5], [44.2, 7.1], [45.1, 6.7]
    ],
    "FRANCIA": [
      [51.0, 2.5], [49.5, 0.5], [48.6, -4.5], [46.0, -1.2], [43.4, -1.8], [42.5, 3.1],
      [43.5, 7.2], [45.8, 6.8], [47.5, 7.5], [49.0, 8.2], [49.5, 6.0], [50.5, 4.0]
    ],
    "SPAGNA": [
      [43.4, -1.8], [43.8, -8.0], [42.0, -8.8], [37.0, -9.0], [36.0, -5.5], [36.7, -2.0],
      [38.0, -0.5], [41.0, 1.0], [42.4, 3.1]
    ],
    "GERMANIA": [
      [55.0, 8.5], [54.5, 10.0], [54.0, 14.0], [51.0, 15.0], [48.5, 13.5], [47.5, 13.0],
      [47.5, 9.5], [47.5, 7.5], [49.0, 8.2], [50.5, 6.0], [53.5, 7.0]
    ],
    "REGNO UNITO": [
      [58.6, -3.0], [57.5, -2.0], [53.0, 0.5], [51.0, 1.4], [50.0, -5.0], [52.0, -5.0],
      [55.0, -5.0], [58.0, -5.0]
    ],
    "GRECIA": [
      [41.5, 26.0], [40.5, 23.0], [39.0, 21.0], [36.5, 23.0], [37.5, 24.0], [38.5, 24.0],
      [40.0, 24.0], [41.2, 23.0]
    ],
    "NORVEGIA": [
      [71.0, 25.0], [70.0, 31.0], [69.0, 29.0], [64.0, 14.0], [61.0, 12.0], [59.0, 11.0],
      [58.0, 7.0], [60.5, 5.0], [62.5, 6.0], [68.0, 15.0]
    ],
    "SVEZIA": [
      [69.0, 21.0], [66.0, 24.0], [60.0, 18.0], [56.0, 16.0], [55.5, 13.0], [58.0, 11.5],
      [63.0, 13.0], [68.0, 18.0]
    ],
    "STATI UNITI": [
      [49.0, -124.0], [49.0, -95.0], [45.0, -75.0], [44.0, -67.0], [35.0, -75.0], [25.0, -80.0],
      [29.0, -95.0], [26.0, -97.0], [32.0, -117.0], [38.0, -123.0], [48.0, -125.0]
    ],
    "GIAPPONE": [
      [45.5, 142.0], [43.0, 145.0], [42.0, 141.0], [38.0, 141.0], [35.0, 140.0], [33.5, 135.0],
      [31.5, 131.0], [33.0, 130.0], [35.5, 133.0], [37.0, 137.0], [40.5, 140.0]
    ],
    "BRASILE": [
      [4.0, -51.0], [-5.0, -35.0], [-13.0, -39.0], [-23.0, -42.0], [-30.0, -50.0], [-33.5, -53.0],
      [-22.0, -58.0], [-10.0, -70.0], [0.0, -67.0], [4.0, -60.0]
    ],
    "EGITTO": [
      [31.5, 25.0], [31.5, 34.0], [28.0, 34.5], [22.0, 36.5], [22.0, 25.0]
    ],
    "AUSTRALIA": [
      [-11.0, 142.0], [-18.0, 146.0], [-25.0, 153.0], [-37.0, 150.0], [-38.0, 141.0], [-35.0, 136.0],
      [-32.0, 125.0], [-34.0, 115.0], [-22.0, 114.0], [-15.0, 125.0], [-12.0, 135.0]
    ]
  },

  // Isole principali (Sicilia, Sardegna, Gran Bretagna, Giappone, Madagascar...)
  ISLANDS: {
    "SICILIA": [
      [38.2, 15.6], [37.5, 15.1], [36.7, 15.1], [37.0, 14.2], [37.3, 13.6],
      [37.7, 12.4], [38.0, 12.5], [38.1, 13.4], [38.0, 14.1]
    ],
    "SARDEGNA": [
      [41.2, 9.2], [40.9, 9.5], [40.3, 9.7], [39.1, 9.5], [39.2, 9.1],
      [38.9, 8.8], [39.9, 8.4], [40.5, 8.3], [40.9, 8.2], [41.0, 8.8]
    ],
    "CORSICA": [
      [43.0, 9.4], [42.0, 9.5], [41.4, 9.2], [41.9, 8.6], [42.6, 8.7]
    ],
    "CRETA": [
      [35.7, 24.0], [35.3, 26.0], [35.0, 25.5], [35.2, 23.6]
    ],
    "ISLANDA": [
      [66.5, -23.0], [66.0, -14.0], [64.0, -14.0], [63.5, -19.0], [65.0, -24.0]
    ]
  }
};

// ==========================================================================
// UTILITY GEOGRAFICHE PRINCIPALI
// ==========================================================================

const GeoUtils = {
  // Calcolo distanza ortodromica in KM con formula dell'emisenoverso (Haversine)
  calculateDistance(lat1, lon1, lat2, lon2) {
    if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return null;
    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return null;

    const R = 6371; // Raggio terrestre medio in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  },

  // Dizionario ufficiale dei 10 Bollini di Intensità di Viaggio (Scala da 1 a 10 con titoli e styling ad alto contrasto)
  INTENSITY_BADGES: {
    10: {
      level: 10,
      badge: "👑 10/10",
      title: "ODYSSEY SUPREME",
      subtitle: "Viaggio Leggendario Ultra-Completo",
      tagColor: "#FAFF00",
      bgColor: "rgba(250, 255, 0, 0.15)",
      borderColor: "#FAFF00",
      ariaLabel: "Bollino 10 su 10: Odyssey Supreme, Viaggio Leggendario Ultra-Completo"
    },
    9: {
      level: 9,
      badge: "⭐ 9/10",
      title: "GRAND TOUR EXPLORER",
      subtitle: "Grande Avventura Transnazionale",
      tagColor: "#FF80BF",
      bgColor: "rgba(255, 128, 191, 0.15)",
      borderColor: "#FF80BF",
      ariaLabel: "Bollino 9 su 10: Grand Tour Explorer, Grande Avventura Transnazionale"
    },
    8: {
      level: 8,
      badge: "🚀 8/10",
      title: "EXPEDITION MASTER",
      subtitle: "Spedizione Intensa Multi-Tappa",
      tagColor: "#00FFA3",
      bgColor: "rgba(0, 255, 163, 0.15)",
      borderColor: "#00FFA3",
      ariaLabel: "Bollino 8 su 10: Expedition Master, Spedizione Intensa Multi-Tappa"
    },
    7: {
      level: 7,
      badge: "💎 7/10",
      title: "VOYAGE PRESTIGE",
      subtitle: "Viaggio Ricco ed Esperienziale",
      tagColor: "#00BFFF",
      bgColor: "rgba(0, 191, 255, 0.15)",
      borderColor: "#00BFFF",
      ariaLabel: "Bollino 7 su 10: Voyage Prestige, Viaggio Ricco ed Esperienziale"
    },
    6: {
      level: 6,
      badge: "🧭 6/10",
      title: "GLOBETROTTER GOLD",
      subtitle: "Itinerario Dinamico e Poliedrico",
      tagColor: "#00E5D8",
      bgColor: "rgba(0, 229, 216, 0.15)",
      borderColor: "#00E5D8",
      ariaLabel: "Bollino 6 su 10: Globetrotter Gold, Itinerario Dinamico e Poliedrico"
    },
    5: {
      level: 5,
      badge: "🌟 5/10",
      title: "DISCOVERY PLUS",
      subtitle: "Viaggio Equilibrato e Coinvolgente",
      tagColor: "#FF5500",
      bgColor: "rgba(255, 85, 0, 0.15)",
      borderColor: "#FF5500",
      ariaLabel: "Bollino 5 su 10: Discovery Plus, Viaggio Equilibrato e Coinvolgente"
    },
    4: {
      level: 4,
      badge: "🎒 4/10",
      title: "ROAD TRIPPER",
      subtitle: "Escursione Attiva Fuoriporta",
      tagColor: "#FF80BF",
      bgColor: "rgba(255, 128, 191, 0.12)",
      borderColor: "#FF80BF",
      ariaLabel: "Bollino 4 su 10: Road Tripper, Escursione Attiva Fuoriporta"
    },
    3: {
      level: 3,
      badge: "⛵ 3/10",
      title: "GETAWAY RELAX",
      subtitle: "Fuga Rilassante e Piacevole",
      tagColor: "#00FFA3",
      bgColor: "rgba(0, 255, 163, 0.12)",
      borderColor: "#00FFA3",
      ariaLabel: "Bollino 3 su 10: Getaway Relax, Fuga Rilassante e Piacevole"
    },
    2: {
      level: 2,
      badge: "🌱 2/10",
      title: "WEEKEND BREAK",
      subtitle: "Soggiorno Breve e Intimo",
      tagColor: "#888888",
      bgColor: "rgba(136, 136, 136, 0.12)",
      borderColor: "#888888",
      ariaLabel: "Bollino 2 su 10: Weekend Break, Soggiorno Breve e Intimo"
    },
    1: {
      level: 1,
      badge: "📍 1/10",
      title: "MINI ESCAPE BASIC",
      subtitle: "Gita di Giornata Essenziale",
      tagColor: "#666666",
      bgColor: "rgba(102, 102, 102, 0.12)",
      borderColor: "#666666",
      ariaLabel: "Bollino 1 su 10: Mini Escape Basic, Gita di Giornata Essenziale"
    }
  },

  // Calcolo durata effettiva del viaggio in giorni
  calculateTripDurationDays(trip) {
    if (!trip) return 1;
    if (trip.Data_Inizio_Globale && trip.Data_Fine_Globale) {
      const startNorm = CONFIG.normalizeDateStr(trip.Data_Inizio_Globale);
      const endNorm = CONFIG.normalizeDateStr(trip.Data_Fine_Globale);
      const p1 = startNorm.split('-');
      const p2 = endNorm.split('-');
      if (p1.length === 3 && p2.length === 3) {
        const d1 = new Date(p1[0], p1[1] - 1, p1[2]);
        const d2 = new Date(p2[0], p2[1] - 1, p2[2]);
        const diffDays = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        if (diffDays > 0) return diffDays;
      }
    }
    if (trip.Durata_Giorni && !isNaN(Number(trip.Durata_Giorni)) && Number(trip.Durata_Giorni) > 0) {
      return Number(trip.Durata_Giorni);
    }
    return 1;
  },

  // Calcolo distanza chilometrica cumulativa percorsa per un viaggio (con base Venezia e tragitto completo tappe)
  calculateTripDistanceKm(trip) {
    if (!trip) return 0;
    const vLat = CONFIG.VENICE ? CONFIG.VENICE.lat : 45.4408;
    const vLng = CONFIG.VENICE ? CONFIG.VENICE.lng : 12.3155;

    const cities = String(trip.Citta || '').split('\n').map(c => c.trim()).filter(Boolean);
    const states = String(trip.Stati || '').split('\n').map(s => s.trim()).filter(Boolean);

    const coords = [];
    cities.forEach(rawCity => {
      const parsed = this.parseCityAndState(rawCity, states);
      const c = this.getCityCoordinates(parsed.city, parsed.state);
      if (c && c.lat && c.lng) {
        coords.push({ lat: c.lat, lng: c.lng });
      }
    });

    if (coords.length === 0) {
      if (states.length > 0) {
        const cInfo = this.getCountryInfo(states[0]);
        if (cInfo && cInfo.lat && cInfo.lng) {
          const d = this.calculateDistance(vLat, vLng, cInfo.lat, cInfo.lng);
          return (d || 0) * 2;
        }
      }
      return 0;
    }

    let totalKm = 0;
    // Partenza da Venezia verso la prima tappa
    totalKm += this.calculateDistance(vLat, vLng, coords[0].lat, coords[0].lng) || 0;

    // Tragitto tra le varie tappe del viaggio
    for (let i = 0; i < coords.length - 1; i++) {
      totalKm += this.calculateDistance(coords[i].lat, coords[i].lng, coords[i + 1].lat, coords[i + 1].lng) || 0;
    }

    // Rientro a Venezia dall'ultima tappa
    totalKm += this.calculateDistance(coords[coords.length - 1].lat, coords[coords.length - 1].lng, vLat, vLng) || 0;

    return Math.round(totalKm);
  },

  // Algoritmo di punteggio e attribuzione del Bollino di Intensità da 1 a 10
  calculateTripIntensityScore(trip) {
    if (!trip) return this.INTENSITY_BADGES[1];
    let score = 0;

    // 1. Durata in giorni (max 2.5 punti)
    const days = this.calculateTripDurationDays(trip);
    if (days >= 15) score += 2.5;
    else if (days >= 8) score += 2.0;
    else if (days >= 4) score += 1.5;
    else if (days >= 2) score += 1.0;
    else score += 0.5;

    // 2. Stati e Città visitate (max 2.5 punti)
    const cities = String(trip.Citta || '').split('\n').map(c => c.trim()).filter(Boolean);
    const states = String(trip.Stati || '').split('\n').map(s => s.trim()).filter(Boolean);
    if (states.length >= 3 || cities.length >= 6) score += 2.5;
    else if (states.length >= 2 || cities.length >= 4) score += 2.0;
    else if (cities.length >= 2) score += 1.5;
    else score += 1.0;

    // 3. Varietà Mezzi di Trasporto e Tipologia (max 2.0 punti)
    const transports = String(trip.Mezzi_Usati || '').split(',').map(m => m.trim()).filter(Boolean);
    const tripType = String(trip.Tipologia_Viaggio || '').toLowerCase();
    const isCruise = transports.some(t => t.toLowerCase().includes('crociera') || t.toLowerCase().includes('nave')) || tripType.includes('crociera');
    if (isCruise || transports.length >= 3) score += 2.0;
    else if (transports.length === 2) score += 1.5;
    else score += 1.0;

    // 4. Souvenir e Memorie/Esperienze registrate (max 2.0 punti)
    const souvenirs = String(trip.Souvenir || '').split('\n').map(s => s.trim()).filter(Boolean);
    const hasDrive = Boolean(trip.Link_Cartella_Drive && trip.Link_Cartella_Drive.trim().length > 5);
    const hasNotes = Boolean(trip.Attivita_Esperienze || trip.Note_Personali || trip.Note_Consigli);
    if (souvenirs.length >= 4) score += 1.0;
    else if (souvenirs.length >= 1) score += 0.5;
    if (hasDrive) score += 0.5;
    if (hasNotes) score += 0.5;

    // 5. Distanza chilometrica percorsa e Budget (max 1.0 punto)
    const km = this.calculateTripDistanceKm(trip);
    let totalCost = 0;
    if (CONFIG.EXPENSE_CATEGORIES) {
      CONFIG.EXPENSE_CATEGORIES.forEach(cat => {
        totalCost += Number(trip[cat.key] || 0);
      });
    }
    if (km > 4000 || totalCost > 2500) score += 1.0;
    else if (km > 1500 || totalCost > 1000) score += 0.5;

    const level = Math.max(1, Math.min(10, Math.round(score)));
    const badgeInfo = this.INTENSITY_BADGES[level] || this.INTENSITY_BADGES[1];

    return {
      ...badgeInfo,
      computedScore: score,
      level,
      days,
      km
    };
  },

  // Generatore di template HTML per il Bollino di Intensità (versione badge pill o grande)
  getIntensityBadgeHtml(trip, isLarge = false) {
    if (!trip) return "";
    const info = this.calculateTripIntensityScore(trip);
    if (isLarge) {
      return `
        <div class="intensity-badge-large" style="display: inline-flex; align-items: center; gap: 8px; background: ${info.bgColor}; border: 1.5px solid ${info.borderColor}; border-radius: 8px; padding: 6px 12px; margin-top: 8px; flex-wrap: wrap;" aria-label="${info.ariaLabel}">
          <span style="font-size: 1.1rem; font-weight: 800; color: ${info.tagColor};">${info.badge}</span>
          <span style="font-size: 0.95rem; font-weight: 700; color: #FFFFFF;">${info.title}</span>
          <span style="font-size: 0.8rem; color: #CCCCCC; border-left: 1px solid rgba(255,255,255,0.25); padding-left: 8px;">${info.subtitle}</span>
        </div>
      `;
    }
    return `
      <span class="intensity-badge-pill" style="display: inline-flex; align-items: center; gap: 4px; background: ${info.bgColor}; border: 1px solid ${info.borderColor}; color: ${info.tagColor}; font-size: 0.75rem; font-weight: 700; border-radius: 6px; padding: 2px 8px; margin-left: 6px;" aria-label="${info.ariaLabel}">
        ${info.badge} ${info.title}
      </span>
    `;
  },

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  },

  // Normalizza stringhe per confronto insensibile a maiuscole, accenti e punteggiatura
  normalizeName(str) {
    if (!str) return "";
    return String(str)
      .trim()
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  },

  // Risolve e normalizza il nome ufficiale dello Stato
  resolveStateName(stateInput) {
    if (!stateInput) return "ITALIA";
    const clean = this.normalizeName(stateInput);
    for (const [key, aliases] of Object.entries(this.IT_COUNTRY_ALIASES)) {
      if (clean === key || (aliases && aliases.some(a => this.normalizeName(a) === clean))) {
        return key;
      }
    }
    if (COUNTRIES_DB[clean]) return clean;
    return clean;
  },

  // Parsing avanzato di città e stato opzionale tra parentesi (es. "Cadice (Spagna)" -> { city: "Cadice", state: "SPAGNA", explicit: true })
  parseCityAndState(rawCityLine, tripStates = []) {
    if (!rawCityLine) return { city: "", state: "ITALIA", explicit: false };
    const str = String(rawCityLine).trim();
    const match = str.match(/^(.*?)\s*\((.*?)\)\s*$/);
    
    if (match) {
      const pureCity = match[1].trim();
      const rawState = match[2].trim();
      const resolvedState = this.resolveStateName(rawState) || rawState.toUpperCase();
      return {
        city: pureCity,
        state: resolvedState,
        explicit: true
      };
    }

    const pureCity = str;
    const cleanCityUpper = pureCity.toUpperCase();
    
    // 1. Controlla nel database statico locale CITIES_DB
    if (CITIES_DB[cleanCityUpper] && CITIES_DB[cleanCityUpper].stato) {
      const dbState = CITIES_DB[cleanCityUpper].stato.toUpperCase();
      return { city: pureCity, state: dbState, explicit: false };
    }

    // 2. Se il viaggio ha 1 solo stato
    if (tripStates && tripStates.length === 1 && tripStates[0]) {
      return { city: pureCity, state: this.resolveStateName(tripStates[0]), explicit: false };
    }

    // 3. Se ci sono più stati nel viaggio, controlla la cache personalizzata per ogni stato
    if (tripStates && tripStates.length > 1) {
      try {
        const localCache = JSON.parse(localStorage.getItem("motto_custom_cities_cache") || "{}");
        for (const st of tripStates) {
          const normSt = this.resolveStateName(st);
          const cacheKey = `${cleanCityUpper}_${normSt}`;
          if (localCache[cacheKey] && localCache[cacheKey].stato) {
            return { city: pureCity, state: normSt, explicit: false };
          }
        }
      } catch (e) {}
      return { city: pureCity, state: this.resolveStateName(tripStates[0]), explicit: false };
    }

    return { city: pureCity, state: "ITALIA", explicit: false };
  },

  // Risolve le coordinate esatte di una specifica città
  getCityCoordinates(cityName, stateName = "") {
    if (!cityName) return null;
    const parsed = this.parseCityAndState(cityName, stateName ? [stateName] : []);
    const cleanCity = this.normalizeName(parsed.city);
    const cleanState = this.normalizeName(parsed.state || stateName);

    // 1. Corrispondenza esatta nella banca dati città
    if (CITIES_DB[cleanCity]) {
      return CITIES_DB[cleanCity];
    }

    // 2. Ricerca per corrispondenza parziale (es. "Caorle (VE)" -> "CAORLE")
    for (const [key, val] of Object.entries(CITIES_DB)) {
      if (cleanCity === key || cleanCity.startsWith(key + " ") || cleanCity.endsWith(" " + key) || cleanCity.includes(key)) {
        if (!cleanState || !val.stato || this.normalizeName(val.stato).includes(cleanState) || cleanState.includes(this.normalizeName(val.stato))) {
          return val;
        }
      }
    }

    // 3. Fallback sul centroide o capitale dello Stato di riferimento
    if (cleanState) {
      const countryInfo = this.getCountryInfo(cleanState);
      if (countryInfo && countryInfo.lat) {
        return {
          lat: countryInfo.lat,
          lng: countryInfo.lng,
          stato: cleanState,
          continente: countryInfo.continent || "Europa",
          isCountryCenter: true
        };
      }
    }

    return null;
  },

  getCountryInfo(countryName) {
    if (!countryName) return { flag: "🌐", continent: "Europa", capital: "", lat: 41.9, lng: 12.5 };
    const clean = this.normalizeName(countryName);

    if (COUNTRIES_DB[clean]) {
      return COUNTRIES_DB[clean];
    }
    // Partial match search
    for (const [key, val] of Object.entries(COUNTRIES_DB)) {
      const normKey = this.normalizeName(key);
      if (clean === normKey || clean.includes(normKey) || normKey.includes(clean)) {
        return val;
      }
    }
    return { flag: "🌍", continent: "Europa", capital: "", lat: 45.0, lng: 12.0 };
  },

  getContinent(countryName) {
    return this.getCountryInfo(countryName).continent || "Europa";
  },

  getFlag(countryName) {
    return this.getCountryInfo(countryName).flag || "📍";
  },

  getEmisfero(lat) {
    if (lat === null || lat === undefined || isNaN(lat)) return "EMISFERO NORD";
    return Number(lat) >= 0 ? "EMISFERO NORD" : "EMISFERO SUD";
  },

  // Calcolo statistiche geografiche con riferimento ufficiale VENEZIA e Poli Nord/Sud
  computeGeoStats(coordinatesList) {
    const validCoords = (coordinatesList || []).filter(c => c.Latitudine !== "" && !isNaN(Number(c.Latitudine)));
    
    if (validCoords.length === 0) {
      return {
        isEmpty: true,
        mostNorth: null,
        mostSouth: null,
        mostEast: null,
        mostWest: null,
        farthestFromVenice: null,
        closestToEquator: [],
        closestToNorthPole: [],
        closestToSouthPole: []
      };
    }

    const vLat = CONFIG.VENICE.lat;
    const vLng = CONFIG.VENICE.lng;

    // Distanze da Venezia e dai Poli
    const withDist = validCoords.map(c => {
      const lat = Number(c.Latitudine);
      const lng = Number(c.Longitudine);
      const dist = this.calculateDistance(vLat, vLng, lat, lng);
      const distEquator = Math.abs(lat);
      const distNorthPoleKm = Math.round((90 - lat) * 111.139);
      const distSouthPoleKm = Math.round((lat - (-90)) * 111.139);

      // Pulisci eventuale stato tra parentesi nel nome città
      const parsed = this.parseCityAndState(c.Citta);
      const pureCityName = parsed.city || c.Citta;

      return {
        ...c,
        Citta: pureCityName,
        lat,
        lng,
        distFromVenice: dist,
        distFromEquator: distEquator,
        distNorthPoleKm,
        distSouthPoleKm
      };
    });

    // Rimuovi duplicati di città per le statistiche
    const uniqueCitiesMap = new Map();
    withDist.forEach(item => {
      const key = `${item.Citta}_${item.Stato}`.toUpperCase();
      if (!uniqueCitiesMap.has(key)) {
        uniqueCitiesMap.set(key, item);
      }
    });
    const uniqueCities = Array.from(uniqueCitiesMap.values());

    // Punti cardinali estremi
    const mostNorth = [...uniqueCities].sort((a, b) => b.lat - a.lat)[0];
    const mostSouth = [...uniqueCities].sort((a, b) => a.lat - b.lat)[0];
    const mostEast = [...uniqueCities].sort((a, b) => b.lng - a.lng)[0];
    const mostWest = [...uniqueCities].sort((a, b) => a.lng - b.lng)[0];

    // Distanza massima da Venezia
    const sortedByVeniceDist = [...uniqueCities].sort((a, b) => b.distFromVenice - a.distFromVenice);
    const farthestFromVenice = sortedByVeniceDist[0];

    // Più vicine all'Equatore (top 3)
    const closestToEquator = [...uniqueCities].sort((a, b) => a.distFromEquator - b.distFromEquator).slice(0, 3);

    // Prime 3 città più vicine al Polo Nord (latitudine più alta decrescente)
    const closestToNorthPole = [...uniqueCities].sort((a, b) => b.lat - a.lat).slice(0, 3);

    // Prime 3 città più vicine al Polo Sud (latitudine più bassa crescente)
    const closestToSouthPole = [...uniqueCities].sort((a, b) => a.lat - b.lat).slice(0, 3);

    return {
      isEmpty: false,
      mostNorth,
      mostSouth,
      mostEast,
      mostWest,
      farthestFromVenice,
      closestToEquator,
      closestToNorthPole,
      closestToSouthPole
    };
  },

  // ==========================================================================
  // MOTORE DI RENDERING MAPPE INTERATTIVE AD ALTO CONTRASTO (LEAFLET + TILES + GEOJSON)
  // Tema: Dark Matter (#000000) | Paesi Visitati: Rosa Pastello (#FF80BF) | Pin: Verde Menta (#00FFA3)
  // Supporta: Zoom interattivo (+/- e gesture), Pan, Dettagli geografici reali, Esportazione/Condivisione
  // ==========================================================================

  activeMaps: {},

  // Inizializza la cache locale delle città geocodificate
  initCustomCitiesCache() {
    try {
      const localCache = JSON.parse(localStorage.getItem("motto_custom_cities_cache") || "{}");
      Object.entries(localCache).forEach(([key, val]) => {
        if (val && val.lat && val.lng) {
          const normKey = this.normalizeName(key);
          CITIES_DB[normKey] = val;
        }
      });
    } catch (e) {}
  },

  // Scarica in automatico da internet le coordinate geografiche di qualsiasi città del mondo
  async fetchCoordinatesOnline(cityName, stateName = "") {
    if (!cityName) return null;
    const cleanCity = this.normalizeName(cityName);
    const cleanState = this.normalizeName(stateName);

    // 1. Corrispondenza in memoria o cache locale
    if (CITIES_DB[cleanCity] && !CITIES_DB[cleanCity].isCountryCenter) {
      return CITIES_DB[cleanCity];
    }

    // 2. Controllo cache persistente in localStorage
    try {
      const localCache = JSON.parse(localStorage.getItem("motto_custom_cities_cache") || "{}");
      const cacheKey = cleanState ? `${cleanCity}_${cleanState}` : cleanCity;
      if (localCache[cacheKey] && !localCache[cacheKey].isCountryCenter) {
        CITIES_DB[cleanCity] = localCache[cacheKey];
        return localCache[cacheKey];
      }
      if (localCache[cleanCity] && !localCache[cleanCity].isCountryCenter) {
        CITIES_DB[cleanCity] = localCache[cleanCity];
        return localCache[cleanCity];
      }
    } catch (e) {}

    // 3. Download da internet con Open-Meteo Geocoding API (Fast, Free, CORS, no-key)
    try {
      const searchUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=10&language=it&format=json`;
      const response = await fetch(searchUrl);
      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.results) && data.results.length > 0) {
          let match = data.results[0];
          if (cleanState) {
            const stateMatch = data.results.find(r => {
              const countryNorm = GeoUtils.normalizeName(r.country || "");
              const codeNorm = GeoUtils.normalizeName(r.country_code || "");
              return countryNorm.includes(cleanState) || cleanState.includes(countryNorm) || codeNorm === cleanState;
            });
            if (stateMatch) match = stateMatch;
          }

          const resolvedState = match.country ? match.country.toUpperCase() : (stateName ? stateName.toUpperCase() : "ITALIA");
          const continent = GeoUtils.getContinent(resolvedState);
          const emisfero = GeoUtils.getEmisfero(match.latitude);

          const resultObj = {
            lat: Number(match.latitude),
            lng: Number(match.longitude),
            stato: resolvedState,
            continente: continent,
            emisfero: emisfero,
            isOnlineGeocoded: true
          };

          CITIES_DB[cleanCity] = resultObj;
          try {
            const localCache = JSON.parse(localStorage.getItem("motto_custom_cities_cache") || "{}");
            const cacheKey = cleanState ? `${cleanCity}_${cleanState}` : cleanCity;
            localCache[cacheKey] = resultObj;
            localCache[cleanCity] = resultObj;
            localStorage.setItem("motto_custom_cities_cache", JSON.stringify(localCache));
          } catch (e) {}

          return resultObj;
        }
      }
    } catch (err) {
      console.warn("Open-Meteo Geocoding online error:", err);
    }

    // 4. Fallback online con OpenStreetMap Nominatim API
    try {
      const query = stateName ? `${cityName}, ${stateName}` : cityName;
      const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
      const nomRes = await fetch(nomUrl);
      if (nomRes.ok) {
        const nomData = await nomRes.json();
        if (Array.isArray(nomData) && nomData.length > 0) {
          const lat = parseFloat(nomData[0].lat);
          const lng = parseFloat(nomData[0].lon);
          const resolvedState = stateName ? stateName.toUpperCase() : "ITALIA";
          const continent = GeoUtils.getContinent(resolvedState);
          const emisfero = GeoUtils.getEmisfero(lat);

          const resultObj = {
            lat,
            lng,
            stato: resolvedState,
            continente: continent,
            emisfero: emisfero,
            isOnlineGeocoded: true
          };

          CITIES_DB[cleanCity] = resultObj;
          try {
            const localCache = JSON.parse(localStorage.getItem("motto_custom_cities_cache") || "{}");
            const cacheKey = cleanState ? `${cleanCity}_${cleanState}` : cleanCity;
            localCache[cacheKey] = resultObj;
            localCache[cleanCity] = resultObj;
            localStorage.setItem("motto_custom_cities_cache", JSON.stringify(localCache));
          } catch (e) {}

          return resultObj;
        }
      }
    } catch (err) {
      console.warn("Nominatim Geocoding online error:", err);
    }

    // 5. Fallback locale
    return this.getCityCoordinates(cityName, stateName);
  },

  // Mappa di corrispondenza nomi italiani -> GeoJSON properties (name, admin, ISO codes)
  IT_COUNTRY_ALIASES: {
    "ITALIA": ["Italy", "IT", "ITA", "Italia"],
    "FRANCIA": ["France", "FR", "FRA", "Francia"],
    "SPAGNA": ["Spain", "ES", "ESP", "Spagna"],
    "GERMANIA": ["Germany", "DE", "DEU", "Germania", "Deutschland"],
    "REGNO UNITO": ["United Kingdom", "GB", "GBR", "UK", "England", "Scotland", "Wales", "Regno Unito", "Gran Bretagna", "Inghilterra"],
    "GRAN BRETAGNA": ["United Kingdom", "GB", "GBR", "UK", "England", "Scotland", "Wales", "Regno Unito", "Gran Bretagna", "Inghilterra"],
    "INGHILTERRA": ["United Kingdom", "GB", "GBR", "UK", "England", "Scotland", "Wales", "Regno Unito", "Gran Bretagna", "Inghilterra"],
    "GRECIA": ["Greece", "GR", "GRC", "Grecia"],
    "PORTOGALLO": ["Portugal", "PT", "PRT", "Portogallo"],
    "AUSTRIA": ["Austria", "AT", "AUT"],
    "SVIZZERA": ["Switzerland", "CH", "CHE", "Svizzera", "Schweiz", "Suisse"],
    "BELGIO": ["Belgium", "BE", "BEL", "Belgio", "Belgique"],
    "OLANDA": ["Netherlands", "NL", "NLD", "Olanda", "Paesi Bassi", "Holland"],
    "PAESI BASSI": ["Netherlands", "NL", "NLD", "Olanda", "Paesi Bassi", "Holland"],
    "NORVEGIA": ["Norway", "NO", "NOR", "Norvegia", "Norge"],
    "SVEZIA": ["Sweden", "SE", "SWE", "Svezia", "Sverige"],
    "FINLANDIA": ["Finland", "FI", "FIN", "Finlandia", "Suomi"],
    "DANIMARCA": ["Denmark", "DK", "DNK", "Danimarca", "Danmark"],
    "IRLANDA": ["Ireland", "IE", "IRL", "Irlanda"],
    "ISLANDA": ["Iceland", "IS", "ISL", "Islanda"],
    "POLONIA": ["Poland", "PL", "POL", "Polonia", "Polska"],
    "CROAZIA": ["Croatia", "HR", "HRV", "Croazia", "Hrvatska"],
    "SLOVENIA": ["Slovenia", "SI", "SVN", "Slovenia"],
    "MALTA": ["Malta", "MT", "MLT"],
    "CIPRO": ["Cyprus", "CY", "CYP", "Cipro"],
    "UNGHERIA": ["Hungary", "HU", "HUN", "Ungheria", "Magyarorszag"],
    "REPUBBLICA CECA": ["Czech Republic", "Czechia", "CZ", "CZE", "Repubblica Ceca", "Cechia"],
    "CECHIA": ["Czech Republic", "Czechia", "CZ", "CZE", "Repubblica Ceca", "Cechia"],
    "SLOVACCHIA": ["Slovakia", "SK", "SVK", "Slovacchia"],
    "ROMANIA": ["Romania", "RO", "ROU"],
    "BULGARIA": ["Bulgaria", "BG", "BGR"],
    "TURCHIA": ["Turkey", "Turkiye", "TR", "TUR", "Turchia"],
    "SAN MARINO": ["San Marino", "SM", "SMR"],
    "VATICANO": ["Vatican", "Holy See", "VA", "VAT", "Citta del Vaticano"],
    "CITTA DEL VATICANO": ["Vatican", "Holy See", "VA", "VAT", "Citta del Vaticano"],
    "MONACO": ["Monaco", "MC", "MCO"],
    "ANDORRA": ["Andorra", "AD", "AND"],
    "LIECHTENSTEIN": ["Liechtenstein", "LI", "LIE"],
    "LUSSEMBURGO": ["Luxembourg", "LU", "LUX", "Lussemburgo"],
    "ESTONIA": ["Estonia", "EE", "EST"],
    "LETTONIA": ["Latvia", "LV", "LVA", "Lettonia"],
    "LITUANIA": ["Lithuania", "LT", "LTU", "Lituania"],
    "RUSSIA": ["Russia", "Russian Federation", "RU", "RUS"],
    "UCRAINA": ["Ukraine", "UA", "UKR", "Ucraina"],
    "BIELORUSSIA": ["Belarus", "BY", "BLR", "Bielorussia"],
    "BOSNIA ED ERZEGOVINA": ["Bosnia and Herz.", "Bosnia and Herzegovina", "BA", "BIH", "Bosnia"],
    "BOSNIA": ["Bosnia and Herz.", "Bosnia and Herzegovina", "BA", "BIH", "Bosnia"],
    "SERBIA": ["Serbia", "RS", "SRB"],
    "MONTENEGRO": ["Montenegro", "ME", "MNE"],
    "ALBANIA": ["Albania", "AL", "ALB"],
    "MACEDONIA DEL NORD": ["Macedonia", "North Macedonia", "MK", "MKD"],
    "MACEDONIA": ["Macedonia", "North Macedonia", "MK", "MKD"],
    "GIAPPONE": ["Japan", "JP", "JPN", "Giappone"],
    "CINA": ["China", "CN", "CHN", "Cina"],
    "THAILANDIA": ["Thailand", "TH", "THA", "Thailandia"],
    "VIETNAM": ["Vietnam", "VN", "VNM"],
    "INDONESIA": ["Indonesia", "ID", "IDN"],
    "INDIA": ["India", "IN", "IND"],
    "EMIRATI ARABI UNITI": ["United Arab Emirates", "AE", "ARE", "Emirati Arabi Uniti", "UAE", "Dubai", "Abu Dhabi"],
    "EMIRATI ARABI": ["United Arab Emirates", "AE", "ARE", "Emirati Arabi Uniti", "UAE"],
    "DUBAI": ["United Arab Emirates", "AE", "ARE", "Emirati Arabi Uniti", "UAE"],
    "ABU DHABI": ["United Arab Emirates", "AE", "ARE", "Emirati Arabi Uniti", "UAE"],
    "SINGAPORE": ["Singapore", "SG", "SGP"],
    "MALAYSIA": ["Malaysia", "MY", "MYS"],
    "COREA DEL SUD": ["South Korea", "Korea", "Republic of Korea", "KR", "KOR", "Corea del Sud"],
    "OMAN": ["Oman", "OM", "OMN"],
    "GIORDANIA": ["Jordan", "JO", "JOR", "Giordania"],
    "ISRAELE": ["Israel", "IL", "ISR", "Israele"],
    "QATAR": ["Qatar", "QA", "QAT"],
    "MALDIVE": ["Maldives", "MV", "MDV", "Maldive"],
    "FILIPPINE": ["Philippines", "PH", "PHL", "Filippine"],
    "STATI UNITI": ["United States of America", "United States", "US", "USA", "Stati Uniti", "Stati Uniti d'America", "America"],
    "STATI UNITI D'AMERICA": ["United States of America", "United States", "US", "USA", "Stati Uniti", "Stati Uniti d'America", "America"],
    "USA": ["United States of America", "United States", "US", "USA", "Stati Uniti"],
    "CANADA": ["Canada", "CA", "CAN"],
    "MESSICO": ["Mexico", "MX", "MEX", "Messico"],
    "CUBA": ["Cuba", "CU", "CUB"],
    "GIAMAICA": ["Jamaica", "JM", "JAM", "Giamaica"],
    "REPUBBLICA DOMINICANA": ["Dominican Republic", "Dominican Rep.", "DO", "DOM", "Repubblica Dominicana"],
    "BAHAMAS": ["Bahamas", "BS", "BHS"],
    "PANAMA": ["Panama", "PA", "PAN"],
    "COSTA RICA": ["Costa Rica", "CR", "CRI"],
    "BRASILE": ["Brazil", "BR", "BRA", "Brasile"],
    "ARGENTINA": ["Argentina", "AR", "ARG"],
    "PERU": ["Peru", "PE", "PER"],
    "CILE": ["Chile", "CL", "CHL", "Cile"],
    "COLOMBIA": ["Colombia", "CO", "COL"],
    "ECUADOR": ["Ecuador", "EC", "ECU"],
    "BOLIVIA": ["Bolivia", "BO", "BOL"],
    "URUGUAY": ["Uruguay", "UY", "URY"],
    "EGITTO": ["Egypt", "EG", "EGY", "Egitto"],
    "MAROCCO": ["Morocco", "MA", "MAR", "Marocco"],
    "TUNISIA": ["Tunisia", "TN", "TUN"],
    "SUDAFRICA": ["South Africa", "ZA", "ZAF", "Sudafrica"],
    "KENYA": ["Kenya", "KE", "KEN"],
    "TANZANIA": ["Tanzania", "United Republic of Tanzania", "TZ", "TZA"],
    "MADAGASCAR": ["Madagascar", "MG", "MDG"],
    "MAURITIUS": ["Mauritius", "MU", "MUS"],
    "SEYCHELLES": ["Seychelles", "SC", "SYC"],
    "CAPO VERDE": ["Cape Verde", "CV", "CPV", "Capo Verde"],
    "NAMIBIA": ["Namibia", "NA", "NAM"],
    "AUSTRALIA": ["Australia", "AU", "AUS"],
    "NUOVA ZELANDA": ["New Zealand", "NZ", "NZL", "Nuova Zelanda"],
    "FIGI": ["Fiji", "FJ", "FJI", "Figi"],
    "POLINESIA FRANCESE": ["French Polynesia", "PF", "PYF", "Polinesia Francese"]
  },

  // Verifica rigorosa e senza falsi positivi dei Paesi visitati
  isCountryVisited(props, visitedArray) {
    if (!props || !visitedArray || visitedArray.length === 0) return false;
    const nameNorm = this.normalizeName(props.name || "");
    const adminNorm = this.normalizeName(props.admin || "");
    const iso2Norm = this.normalizeName(props.iso2 || "");
    const iso3Norm = this.normalizeName(props.iso3 || "");

    for (const v of visitedArray) {
      const cleanV = this.normalizeName(v);
      if (!cleanV) continue;

      // 1. Corrispondenza diretta esatta
      if (cleanV === nameNorm || cleanV === adminNorm || cleanV === iso2Norm || cleanV === iso3Norm) {
        return true;
      }

      // 2. Controllo alias esatti
      const aliases = this.IT_COUNTRY_ALIASES[cleanV];
      if (aliases) {
        for (const a of aliases) {
          const aNorm = this.normalizeName(a);
          if (aNorm === nameNorm || aNorm === adminNorm || aNorm === iso2Norm || aNorm === iso3Norm) {
            return true;
          }
        }
      }
    }
    return false;
  },

  // Inizializza istanza Leaflet pulendo eventuali istanze precedenti
  initLeafletMap(containerInput, center = [42, 12], zoom = 5, minZoom = 1, maxZoom = 18) {
    if (typeof L === "undefined") {
      console.warn("Leaflet library is not loaded.");
      return null;
    }

    const container = typeof containerInput === "string" ? document.getElementById(containerInput) : containerInput;
    if (!container) return null;
    const id = container.id || ("map_" + Math.random().toString(36).substr(2, 9));
    container.id = id;

    // Rimuove mappa esistente su questo container
    if (this.activeMaps[id]) {
      try {
        this.activeMaps[id].remove();
      } catch (e) {
        console.warn("Map remove error:", e);
      }
      delete this.activeMaps[id];
    }

    container.innerHTML = "";

    const map = L.map(container, {
      center: center,
      zoom: zoom,
      minZoom: minZoom,
      maxZoom: maxZoom,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
      touchZoom: true,
      tap: true
    });

    // Basemap Dark Matter di CARTO con supporto CORS
    const darkTileLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
      crossOrigin: true
    });
    darkTileLayer.addTo(map);

    this.activeMaps[id] = map;

    setTimeout(() => {
      try {
        map.invalidateSize();
      } catch (err) {}
    }, 120);

    return map;
  },

  createCityPinIcon(isPink = false) {
    const html = `<div class="pin-circle ${isPink ? 'pin-circle-pink' : ''}"></div>`;
    return L.divIcon({
      className: "custom-leaflet-div-icon",
      html: html,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
  },

  createStepPinIcon(stepNumber) {
    const html = `<div class="pin-circle pin-circle-pink" style="width: 20px; height: 20px; font-size: 11px; font-weight: 900; line-height: 20px;">${stepNumber}</div>`;
    return L.divIcon({
      className: "custom-leaflet-div-icon",
      html: html,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  },

  // 1. MAPPA MONDIALE PAESI VISITATI
  renderWorldMap(containerInput, visitedStatesSet = new Set(), cityPoints = []) {
    const map = this.initLeafletMap(containerInput, [24.0, 10.0], 2, 1, 10);
    if (!map) return;

    const visitedNorm = Array.from(visitedStatesSet || []).map(s => this.normalizeName(s)).filter(Boolean);

    // Poligoni dettagliati dei Paesi del Mondo con evidenziazione rosa pastello
    if (typeof WORLD_GEOJSON !== "undefined" && WORLD_GEOJSON.features) {
      const visitedFeatures = WORLD_GEOJSON.features.filter(f => {
        return this.isCountryVisited(f.properties, visitedNorm);
      });

      if (visitedFeatures.length > 0) {
        L.geoJSON({
          type: "FeatureCollection",
          features: visitedFeatures
        }, {
          style: {
            fillColor: "#FF80BF",
            weight: 1.5,
            opacity: 1,
            color: "#FFB6C1",
            fillOpacity: 0.55
          },
          onEachFeature: (feature, layer) => {
            const name = feature.properties.name || feature.properties.admin || "";
            layer.bindTooltip(`📍 ${name}`, {
              className: "custom-map-tooltip",
              direction: "top",
              sticky: true
            });
          }
        }).addTo(map);
      }
    }

    // Microstati e isole che possono non essere rappresentati dai poligoni principali a bassa risoluzione
    const smallStates = ["SAN MARINO", "VATICANO", "CITTA DEL VATICANO", "MONACO", "MALTA", "SINGAPORE", "MALDIVE", "ANDORRA", "LIECHTENSTEIN", "BAHAMAS", "BARBADOS", "CIPRO", "SEYCHELLES", "MAURITIUS", "CAPO VERDE", "FIGI", "LUSSEMBURGO"];
    visitedNorm.forEach(st => {
      if (smallStates.includes(st)) {
        const info = this.getCountryInfo(st);
        if (info && info.lat && info.lng) {
          L.circleMarker([info.lat, info.lng], {
            radius: 5,
            fillColor: "#FF80BF",
            color: "#FFB6C1",
            weight: 1.5,
            fillOpacity: 0.85
          }).addTo(map).bindTooltip(`${info.flag || '📍'} ${st}`, {
            className: "custom-map-tooltip",
            direction: "top"
          });
        }
      }
    });

    // NOTA: Segnalibri verdi delle città rimossi dalla Mappa Mondo per richiesta utente (Punto 1).
    // Gli stati visitati sono colorati in tutta la loro forma in rosa pastello, il resto del mondo normale.
  },

  // 2. MAPPA NAZIONALE ITALIA
  renderItalyMap(containerInput, italyCities = []) {
    const map = this.initLeafletMap(containerInput, [42.2, 12.8], 6, 4, 15);
    if (!map) return;

    // Evidenzia contorno Italia da GeoJSON
    if (typeof WORLD_GEOJSON !== "undefined" && WORLD_GEOJSON.features) {
      const italyFeature = WORLD_GEOJSON.features.find(f => {
        const name = (f.properties.name || "").toLowerCase();
        const admin = (f.properties.admin || "").toLowerCase();
        return name === "italy" || admin === "italy" || f.properties.iso2 === "IT";
      });
      if (italyFeature) {
        L.geoJSON(italyFeature, {
          style: {
            fillColor: "#FF80BF",
            weight: 2,
            opacity: 0.9,
            color: "#FF80BF",
            fillOpacity: 0.15
          }
        }).addTo(map);
      }
    }

    const latLngs = [];
    (italyCities || []).forEach(c => {
      let lat = Number(c.Latitudine);
      let lng = Number(c.Longitudine);
      if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
        const resolved = this.getCityCoordinates(c.Citta, "ITALIA");
        if (resolved) { lat = resolved.lat; lng = resolved.lng; }
      }
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        latLngs.push([lat, lng]);
        const marker = L.marker([lat, lng], {
          icon: this.createCityPinIcon(true)
        }).addTo(map);
        marker.bindTooltip(`📍 ${c.Citta}`, {
          className: "custom-map-tooltip",
          direction: "top",
          offset: [0, -8]
        });
        marker.bindPopup(`<strong>📍 ${c.Citta}</strong><br><span style="color: var(--pink-light);">Italia</span>`);
      }
    });

    if (latLngs.length > 1) {
      try {
        map.fitBounds(L.latLngBounds(latLngs), { padding: [35, 35], maxZoom: 10 });
      } catch (err) {}
    } else if (latLngs.length === 1) {
      map.setView(latLngs[0], 8);
    }
  },

  // 3. MAPPE REGIONALI E CONTINENTALI
  renderContinentMap(containerInput, continentName, citiesList = []) {
    const continentConfigs = {
      "Europa": { center: [50.0, 15.0], zoom: 4 },
      "Asia": { center: [34.0, 85.0], zoom: 3 },
      "Africa": { center: [3.0, 20.0], zoom: 3 },
      "America del Nord": { center: [40.0, -98.0], zoom: 3 },
      "America del Sud": { center: [-20.0, -60.0], zoom: 3 },
      "Oceania": { center: [-25.0, 135.0], zoom: 4 }
    };

    const cfg = continentConfigs[continentName] || { center: [30.0, 10.0], zoom: 3 };
    const map = this.initLeafletMap(containerInput, cfg.center, cfg.zoom, 2, 16);
    if (!map) return;

    const latLngs = [];
    (citiesList || []).forEach(c => {
      let lat = Number(c.Latitudine);
      let lng = Number(c.Longitudine);
      if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
        const resolved = this.getCityCoordinates(c.Citta, c.Stato);
        if (resolved) { lat = resolved.lat; lng = resolved.lng; }
      }
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        latLngs.push([lat, lng]);
        const marker = L.marker([lat, lng], {
          icon: this.createCityPinIcon(false)
        }).addTo(map);
        marker.bindTooltip(`📍 ${c.Citta}`, {
          className: "custom-map-tooltip",
          direction: "top",
          offset: [0, -8]
        });
        marker.bindPopup(`<strong>📍 ${c.Citta}</strong><br><span style="color: var(--pink-light);">${c.Stato || ''} (${continentName})</span>`);
      }
    });

    if (latLngs.length > 1) {
      try {
        map.fitBounds(L.latLngBounds(latLngs), { padding: [40, 40], maxZoom: 8 });
      } catch (err) {}
    } else if (latLngs.length === 1) {
      map.setView(latLngs[0], 7);
    }
  },

  // Generatore di rotte marittime realistiche con curvature in mare aperto e passaggi obbligati negli stretti navali
  generateMaritimeCruiseRoute(ports) {
    if (!ports || ports.length < 2) return [];
    const fullPath = [];

    for (let i = 0; i < ports.length - 1; i++) {
      const pA = ports[i];
      const pB = ports[i + 1];

      // Riconoscimento passaggi navali obbligati (es. Gibilterra per passaggio Mediterraneo <-> Atlantico/Canarie/Cadice)
      const isMedToAtl = (pA.lng > -5.3 && pB.lng < -5.5 && pA.lat > 25 && pB.lat > 25);
      const isAtlToMed = (pB.lng > -5.3 && pA.lng < -5.5 && pB.lat > 25 && pA.lat > 25);
      
      let waypoints = [pA, pB];
      if (isMedToAtl || isAtlToMed) {
        const gibraltar = { lat: 35.95, lng: -5.60, name: "Stretto di Gibilterra" };
        waypoints = isMedToAtl ? [pA, gibraltar, pB] : [pA, gibraltar, pB];
      }

      for (let w = 0; w < waypoints.length - 1; w++) {
        const wA = waypoints[w];
        const wB = waypoints[w + 1];

        const dLat = wB.lat - wA.lat;
        const dLng = wB.lng - wA.lng;
        const distDeg = Math.sqrt(dLat * dLat + dLng * dLng);

        const midLat = (wA.lat + wB.lat) / 2.0;
        const midLng = (wA.lng + wB.lng) / 2.0;

        // Vettore normale perpendicolare alla rotta (-dLng, dLat)
        let normLat = -dLng;
        let normLng = dLat;
        const normLen = Math.sqrt(normLat * normLat + normLng * normLng);
        if (normLen > 0) {
          normLat /= normLen;
          normLng /= normLen;
        }

        // Orientamento verso il mare aperto (nel Mediterraneo ed Europa la terraferma è prevalentemente a nord, il mare a sud)
        if (normLat > 0 && wA.lat > 35 && wB.lat > 35) {
          normLat = -normLat;
          normLng = -normLng;
        }

        // Calcolo punto di controllo in mare aperto
        const bendFactor = Math.min(distDeg * 0.22, 1.25);
        const controlLat = midLat + normLat * bendFactor;
        const controlLng = midLng + normLng * bendFactor;

        // Campionamento Bézier quadratico fluido
        const steps = 14;
        const isLastSegment = (i === ports.length - 2 && w === waypoints.length - 2);
        for (let s = 0; s < (isLastSegment ? steps + 1 : steps); s++) {
          const t = s / steps;
          const lat = (1 - t) * (1 - t) * wA.lat + 2 * (1 - t) * t * controlLat + t * t * wB.lat;
          const lng = (1 - t) * (1 - t) * wA.lng + 2 * (1 - t) * t * controlLng + t * t * wB.lng;
          fullPath.push([Number(lat.toFixed(5)), Number(lng.toFixed(5))]);
        }
      }
    }

    return fullPath;
  },

  // 4. MAPPA DINAMICA DI VIAGGIO (CON ROTTE CROCIERA)
  renderTripRouteMap(containerInput, citiesNames = [], isCruise = false) {
    const container = typeof containerInput === "string" ? document.getElementById(containerInput) : containerInput;
    if (!container) return;

    if (!citiesNames || citiesNames.length === 0) {
      container.innerHTML = `
        <div style="height: 100%; display: flex; align-items: center; justify-content: center; color: var(--mint); font-weight: 700;">
          NESSUNA TAPPA SPECIFICATA PER QUESTO VIAGGIO
        </div>
      `;
      return;
    }

    const map = this.initLeafletMap(container, [45.0, 12.0], 5, 2, 18);
    if (!map) return;

    const points = [];
    (citiesNames || []).forEach((cityName, idx) => {
      const clean = String(cityName).trim();
      if (!clean) return;
      const parsed = this.parseCityAndState(clean);
      const coords = this.getCityCoordinates(parsed.city, parsed.state);
      if (coords && coords.lat && coords.lng) {
        points.push({ name: parsed.city, lat: coords.lat, lng: coords.lng, step: idx + 1 });
      }
    });

    if (points.length === 0) {
      container.innerHTML = `
        <div style="height: 100%; display: flex; align-items: center; justify-content: center; color: var(--mint); font-weight: 700;">
          COORDINATE GEOGRAFICHE NON DISPONIBILI PER LE TAPPE INDICATE
        </div>
      `;
      return;
    }

    const latLngs = [];
    points.forEach(p => {
      latLngs.push([p.lat, p.lng]);
      const marker = L.marker([p.lat, p.lng], {
        icon: isCruise ? this.createStepPinIcon(p.step) : this.createCityPinIcon(true)
      }).addTo(map);
      marker.bindTooltip(`📍 ${p.step}. ${p.name}`, {
        className: "custom-map-tooltip",
        direction: "top",
        offset: [0, -10]
      });
      marker.bindPopup(`<strong>Tappa ${p.step}: ${p.name}</strong>${isCruise ? '<br><span style="color: var(--pink);">🚢 Scalo di Rotta Crociera</span>' : ''}`);
    });

    // Se Crociera, disegna traiettoria marittima curva tratteggiata Rosa Pastello
    if (isCruise && points.length > 1) {
      const maritimePath = this.generateMaritimeCruiseRoute(points);
      L.polyline(maritimePath.length > 0 ? maritimePath : latLngs, {
        color: "#FF80BF",
        weight: 4,
        opacity: 0.95,
        dashArray: "8, 8",
        lineCap: "round",
        lineJoin: "round"
      }).addTo(map);
    } else if (latLngs.length > 1) {
      L.polyline(latLngs, {
        color: "#00FFA3",
        weight: 3,
        opacity: 0.85,
        dashArray: "6, 6"
      }).addTo(map);
    }

    if (latLngs.length > 1) {
      try {
        map.fitBounds(L.latLngBounds(latLngs), { padding: [45, 45], maxZoom: 12 });
      } catch (err) {}
    } else if (latLngs.length === 1) {
      map.setView(latLngs[0], 8);
    }
  },

  // ESPORTAZIONE E CONDIVISIONE IMMAGINE DELLA MAPPA AD ALTA RISOLUZIONE
  // Cattura fedelmente tessere basemap, poligoni GeoJSON colorati, cerchi microstati, rotte e segnaposti/spilli
  async exportMapImage(containerId, filename = "Mappa_MottoOnTour.jpg", mapTitle = "") {
    const map = this.activeMaps[containerId];
    const container = typeof containerId === "string" ? document.getElementById(containerId) : containerId;
    if (!map || !container) {
      App.notify("Mappa in fase di caricamento...");
      return;
    }

    App.notify("Generazione immagine mappa in corso...");

    try {
      const mapSize = map.getSize();
      const width = mapSize.x;
      const height = mapSize.y;
      if (!width || !height) {
        App.notify("Impossibile catturare la mappa: dimensioni non valide.");
        return;
      }

      // Scala 2x per nitidezza HD Retina
      const scale = 2;
      const headerH = 48;
      const footerH = 26;
      const totalWidth = width * scale;
      const totalHeight = (height + headerH + footerH) * scale;

      const canvas = document.createElement("canvas");
      canvas.width = totalWidth;
      canvas.height = totalHeight;
      const ctx = canvas.getContext("2d");
      ctx.scale(scale, scale);

      // 1. Sfondo globale scuro
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height + headerH + footerH);

      // 2. Barra di Intestazione Ufficiale
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, width, headerH);
      ctx.strokeStyle = "#FF80BF";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, headerH);
      ctx.lineTo(width, headerH);
      ctx.stroke();

      let resolvedTitle = mapTitle;
      if (!resolvedTitle) {
        if (containerId === 'map-world') resolvedTitle = "PAESI VISITATI NEL MONDO";
        else if (containerId === 'map-italy') resolvedTitle = "LA NOSTRA ITALIA - CITTÀ VISITATE";
        else if (String(containerId).startsWith('map-cont-')) {
          const contPart = String(containerId).replace('map-cont-', '').replace(/-/g, ' ').toUpperCase();
          resolvedTitle = `CITTÀ VISITATE IN ${contPart}`;
        } else if (containerId === 'map-last-trip') resolvedTitle = "ROTTA DELL'ULTIMO VIAGGIO";
        else resolvedTitle = "MAPPA GEOGRAFICA DEI VIAGGI";
      }

      ctx.fillStyle = "#FF80BF";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("MOTTO ON TOUR", 14, 20);

      ctx.fillStyle = "#00FFA3";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(resolvedTitle.toUpperCase(), 14, 36);

      ctx.fillStyle = "#FFB6C1";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("Roberto & Elena", width - 14, 20);
      ctx.fillStyle = "#888888";
      ctx.fillText(new Date().toLocaleDateString('it-IT'), width - 14, 36);

      const mapOffsetY = headerH;
      const mapRect = container.getBoundingClientRect();

      // 3. Disegna le tessere della mappa (TileLayer)
      const tileImages = container.querySelectorAll('.leaflet-tile-pane img');
      const tilePromises = Array.from(tileImages).map(img => {
        return new Promise((resolve) => {
          const r = img.getBoundingClientRect();
          const x = r.left - mapRect.left;
          const y = r.top - mapRect.top;
          const w = r.width;
          const h = r.height;

          // Se l'immagine è già caricata
          if (img.complete && img.naturalWidth > 0) {
            try {
              ctx.drawImage(img, x, y + mapOffsetY, w, h);
              resolve();
              return;
            } catch (drawErr) {
              // Se fallisce per CORS, ricarica con crossOrigin anonimo
            }
          }

          const crossImg = new Image();
          crossImg.crossOrigin = "anonymous";
          crossImg.onload = () => {
            try {
              ctx.drawImage(crossImg, x, y + mapOffsetY, w, h);
            } catch (e) {}
            resolve();
          };
          crossImg.onerror = () => resolve();
          crossImg.src = img.src;
        });
      });
      await Promise.all(tilePromises);

      // 4. Disegna il livello vettoriale (Overlay Pane: Canvas e SVG)
      const overlayPane = container.querySelector('.leaflet-overlay-pane');
      if (overlayPane) {
        // Eventuali canvas renderizzati
        const overlayCanvases = overlayPane.querySelectorAll('canvas');
        overlayCanvases.forEach(c => {
          try {
            const r = c.getBoundingClientRect();
            const x = r.left - mapRect.left;
            const y = r.top - mapRect.top;
            ctx.drawImage(c, x, y + mapOffsetY, r.width, r.height);
          } catch (e) {}
        });

        // Layer SVG (Poligoni GeoJSON rosa, linee di rotta crociera, cerchi microstati)
        const svgEl = overlayPane.querySelector('svg');
        if (svgEl) {
          try {
            const svgClone = svgEl.cloneNode(true);
            const svgRect = svgEl.getBoundingClientRect();
            const sx = svgRect.left - mapRect.left;
            const sy = svgRect.top - mapRect.top;
            const sw = svgRect.width;
            const sh = svgRect.height;

            svgClone.setAttribute("width", sw);
            svgClone.setAttribute("height", sh);
            svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svgClone);
            const svgDataUri = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);

            await new Promise((resolve) => {
              const svgImg = new Image();
              svgImg.onload = () => {
                try {
                  ctx.drawImage(svgImg, sx, sy + mapOffsetY, sw, sh);
                } catch (e) {}
                resolve();
              };
              svgImg.onerror = () => resolve();
              svgImg.src = svgDataUri;
            });
          } catch (svgErr) {
            console.warn("SVG overlay capture error:", svgErr);
          }
        }
      }

      // 5. Disegna tutti i segnaposti e le puntine numerate (Markers / DivIcons)
      map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
          const latLng = layer.getLatLng();
          const pt = map.latLngToContainerPoint(latLng);
          if (pt.x >= -30 && pt.x <= width + 30 && pt.y >= -30 && pt.y <= height + 30) {
            const iconEl = layer.getElement ? layer.getElement() : layer._icon;
            
            const pinCircle = iconEl ? (iconEl.classList?.contains('pin-circle') ? iconEl : iconEl.querySelector('.pin-circle')) : null;
            const isPink = iconEl?.classList?.contains('pin-circle-pink') || pinCircle?.classList?.contains('pin-circle-pink');
            const stepText = pinCircle ? pinCircle.textContent.trim() : (iconEl ? iconEl.textContent.trim() : "");

            const px = pt.x;
            const py = pt.y + mapOffsetY;

            if (stepText && !isNaN(Number(stepText))) {
              // Spillo numerato per tappe Crociera (20px, rosa con bordo bianco e numero nero)
              ctx.save();
              ctx.beginPath();
              ctx.arc(px, py, 10, 0, 2 * Math.PI);
              ctx.fillStyle = "#FF80BF";
              ctx.shadowColor = "rgba(255, 128, 191, 0.9)";
              ctx.shadowBlur = 8;
              ctx.fill();
              ctx.lineWidth = 2;
              ctx.strokeStyle = "#FFFFFF";
              ctx.stroke();
              ctx.shadowBlur = 0;
              ctx.fillStyle = "#000000";
              ctx.font = "bold 11px sans-serif";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(stepText, px, py + 0.5);
              ctx.restore();
            } else if (isPink) {
              // Spillo città rosa pastello (14px, raggio 7px)
              ctx.save();
              ctx.beginPath();
              ctx.arc(px, py, 7, 0, 2 * Math.PI);
              ctx.fillStyle = "#FF80BF";
              ctx.shadowColor = "rgba(255, 128, 191, 0.9)";
              ctx.shadowBlur = 7;
              ctx.fill();
              ctx.lineWidth = 2;
              ctx.strokeStyle = "#FFFFFF";
              ctx.stroke();
              ctx.restore();
            } else {
              // Spillo città verde menta (14px, raggio 7px)
              ctx.save();
              ctx.beginPath();
              ctx.arc(px, py, 7, 0, 2 * Math.PI);
              ctx.fillStyle = "#00FFA3";
              ctx.shadowColor = "rgba(0, 255, 163, 0.9)";
              ctx.shadowBlur = 7;
              ctx.fill();
              ctx.lineWidth = 2;
              ctx.strokeStyle = "#FFFFFF";
              ctx.stroke();
              ctx.restore();
            }
          }
        }
      });

      // 6. Barra a piè di pagina e filigrana
      const footerY = headerH + height;
      ctx.fillStyle = "#080808";
      ctx.fillRect(0, footerY, width, footerH);
      ctx.strokeStyle = "#222222";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, footerY);
      ctx.lineTo(width, footerY);
      ctx.stroke();

      ctx.fillStyle = "#666666";
      ctx.font = "9px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("MOTTO ON TOUR • Roberto Lachin & Elena Travaini", 14, footerY + 16);
      ctx.textAlign = "right";
      ctx.fillText("Mappe Ufficiali di Viaggio", width - 14, footerY + 16);

      // Cornice perimetrale Rosa Pastello
      ctx.strokeStyle = "#FF80BF";
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, width - 2, height + headerH + footerH - 2);

      // 7. Esportazione, Salvataggio o Condivisione
      await this.triggerDownloadOrShare(canvas, filename);

    } catch (err) {
      console.error("Map export error:", err);
      this.fallbackExportMap(containerId, filename);
    }
  },

  fallbackExportMap(containerId, filename) {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 360;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#FF80BF";
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#FF80BF";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("MOTTO ON TOUR", canvas.width / 2, 40);

    ctx.fillStyle = "#00FFA3";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("MAPPA GEOGRAFICA DEI VIAGGI", canvas.width / 2, 70);

    this.triggerDownloadOrShare(canvas, filename);
  },

  async triggerDownloadOrShare(canvas, filename) {
    try {
      const blob = await new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.95);
      });

      if (!blob) {
        throw new Error("Blob non generato");
      }

      // 1. File System Access API (Salva con nome da desktop)
      if (window.showSaveFilePicker) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: filename,
            types: [{
              description: 'Immagine JPEG (*.jpg)',
              accept: { 'image/jpeg': ['.jpg', '.jpeg'] }
            }]
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          App.notify(`Immagine mappa salvata con successo: ${filename}`);
          if (typeof SoundFX !== 'undefined' && SoundFX.playConfirm) SoundFX.playConfirm();
          return;
        } catch (pickerErr) {
          if (pickerErr.name === 'AbortError') {
            return;
          }
          console.warn("showSaveFilePicker error, fallback:", pickerErr);
        }
      }

      // 2. Web Share API su dispositivi mobili (AirDrop, WhatsApp, Salva su File)
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], filename, { type: "image/jpeg" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Mappa di Viaggio - MOTTO ON TOUR",
            text: "Guarda la nostra mappa di viaggio!",
            files: [file]
          });
          App.notify("Mappa condivisa con successo.");
          if (typeof SoundFX !== 'undefined' && SoundFX.playConfirm) SoundFX.playConfirm();
          return;
        }
      }

      // 3. Fallback download diretto nel browser
      const dataUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(dataUrl);
      }, 250);

      App.notify("Immagine della mappa scaricata con successo.");
      if (typeof SoundFX !== 'undefined' && SoundFX.playConfirm) SoundFX.playConfirm();
    } catch (e) {
      console.warn("Share download fallback error:", e);
      const link = document.createElement("a");
      link.download = filename;
      link.href = canvas.toDataURL("image/jpeg", 0.95);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 250);
      App.notify("Immagine scaricata con successo.");
    }
  }
};
