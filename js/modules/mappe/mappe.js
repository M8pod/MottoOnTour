// ==========================================================================
// MODULO 09: LE MIE MAPPE - MAPPE GEOGRAFICHE, ROTTE E CONDIVISIONE
// Ogni mappa ha accanto un elenco testuale equivalente, pensato per VoiceOver:
// la mappa grafica resta (aria-hidden) per chi vede e per la condivisione.
// ==========================================================================

const MappeModule = {
  CONTINENTS: ["Europa", "Asia", "Africa", "America del Nord", "America del Sud", "Oceania", "Antartide"],

  esc(str) {
    return String(str ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  },

  plural(n, one, many) {
    return `${n} ${n === 1 ? one : many}`;
  },

  contId(cont) {
    return `map-cont-${cont.replace(/\s+/g, '-').toLowerCase()}`;
  },

  // Coordinate pulite: Stato canonico, continente uniforme, nome città leggibile, una sola voce per città+Stato
  getCleanCoords() {
    const raw = API.data[CONFIG.SHEETS.COORDINATE] || [];
    const map = new Map();
    raw.forEach(c => {
      if (!c || !c.Citta) return;
      const stato = GeoUtils.canonicalCountry(c.Stato) || "ITALIA";
      const cityPure = GeoUtils.parseCityAndState(c.Citta, [stato]).city || c.Citta;
      const key = `${GeoUtils.normalizeName(cityPure)}_${stato}`;
      if (map.has(key)) return;
      const lat = Number(c.Latitudine);
      const lng = Number(c.Longitudine);
      const tripIds = String(c.ID_Viaggio_Riferimento || "").split(",").map(s => s.trim()).filter(Boolean);
      map.set(key, {
        ...c,
        Citta: GeoUtils.displayCountryName(cityPure),
        Stato: stato,
        StatoNome: GeoUtils.displayCountryName(stato),
        Continente: GeoUtils.normalizeContinent(c.Continente) || GeoUtils.normalizeContinent(GeoUtils.getContinent(stato)),
        Latitudine: lat,
        Longitudine: lng,
        Approssimata: !isNaN(lat) && GeoUtils.isCountryCenterFallback(lat, lng, stato, cityPure),
        numViaggi: Math.max(1, tripIds.length)
      });
    });
    return [...map.values()].sort((a, b) => a.Citta.localeCompare(b.Citta, "it"));
  },

  getLastTrip() {
    const trips = API.data[CONFIG.SHEETS.DIARIO] || [];
    const endTime = (t) => {
      if (t.Data_Fine_Globale) return new Date(t.Data_Fine_Globale).getTime() || 0;
      if (t.Data_Inizio_Globale) return new Date(t.Data_Inizio_Globale).getTime() || 0;
      const y = parseInt(String(t.Anno_Viaggio || '').match(/\d{4}/)?.[0] || '0');
      return y > 0 ? new Date(y, 11, 31).getTime() : 0;
    };
    return [...trips].sort((a, b) => endTime(b) - endTime(a))[0] || null;
  },

  cityLabel(c) {
    const visits = c.numViaggi > 1 ? `, ${c.numViaggi} viaggi` : "";
    const approx = c.Approssimata ? " (posizione approssimata: città non trovata, segnata al centro del Paese)" : "";
    return `${this.esc(c.Citta)}${visits}${approx}`;
  },

  render(container) {
    const diarioTrips = API.data[CONFIG.SHEETS.DIARIO] || [];
    const coords = this.getCleanCoords();
    const visited = GeoUtils.getVisitedCountries(diarioTrips, coords);
    const total = CONFIG.TOTAL_WORLD_COUNTRIES || 195;
    const lastTrip = this.getLastTrip();
    this.lastTrip = lastTrip;

    const italyCities = coords.filter(c => c.Stato === 'ITALIA');
    const showItaly = italyCities.length > 0 || visited.has('ITALIA');

    // Città per continente (Italia inclusa nell'Europa), raggruppate per Paese
    const continentCities = {};
    coords.forEach(c => {
      const cont = c.Continente || "Altro";
      (continentCities[cont] = continentCities[cont] || []).push(c);
    });
    const continentOrder = [...this.CONTINENTS, ...Object.keys(continentCities).filter(k => !this.CONTINENTS.includes(k))]
      .filter(k => continentCities[k] && continentCities[k].length > 0);

    const approxCities = coords.filter(c => c.Approssimata);
    const pct = ((visited.size / total) * 100).toFixed(1).replace('.', ',');

    const lastTripCities = lastTrip ? String(lastTrip.Citta || '').split('\n').map(c => c.trim()).filter(Boolean) : [];

    container.innerHTML = `
      <div class="action-bar" style="justify-content: space-between;">
        <h1 id="screen-title" tabindex="-1">LE MIE MAPPE</h1>
        <button class="btn btn-sm btn-primary" onclick="MappeModule.refreshMaps()">
          🔄 AGGIORNA MAPPE
        </button>
      </div>

      <p style="color: var(--pink-light); margin-bottom: 16px;">
        Le vostre esperienze trasformate in mappe condivisibili. Sotto ogni mappa trovi l'elenco completo dei luoghi.
      </p>

      ${coords.length === 0 && diarioTrips.length === 0 ? `
        <div class="empty-state">
          <p class="empty-state-text">
            NESSUNA MAPPA DISPONIBILE.<br>
            REGISTRA IL TUO PRIMO VIAGGIO NEL DIARIO DI BORDO PER INIZIARE A TRACCIARE E CONDIVIDERE LE TUE ROTTE NEL MONDO!
          </p>
        </div>
      ` : `
        <!-- 1. MAPPA GLOBALE PAESI VISITATI -->
        <section class="card" aria-labelledby="h-mappa-mondo">
          <h2 id="h-mappa-mondo">PAESI VISITATI</h2>
          <p class="stat-value" style="font-size: 1.1rem; margin: 4px 0 12px 0;">
            ${this.plural(visited.size, 'PAESE VISITATO', 'PAESI VISITATI')} SU ${total} (${pct}% DEL MONDO)
          </p>
          <div id="map-world" class="map-container" style="height: 380px;" aria-hidden="true"></div>
          <button class="btn btn-sm btn-primary" onclick="MappeModule.shareCanvas('map-world', 'Mappa_Mondo_MottoOnTour.jpg')">
            📤 CONDIVIDI MAPPA MONDO
          </button>
          <h3 style="margin-top: 16px;">Elenco dei Paesi</h3>
          <ul class="map-place-list">
            ${[...visited.values()].map(v => `
              <li>
                <span aria-hidden="true">${v.flag}</span> <strong>${this.esc(v.name)}</strong>:
                ${this.plural(v.trips.length, 'viaggio', 'viaggi')}${v.cities.length ? `. Città: ${v.cities.map(c => this.esc(c)).join(', ')}` : ''}.
              </li>`).join('')}
          </ul>
        </section>

        <!-- 2. MAPPA NAZIONALE ITALIA -->
        ${showItaly ? `
          <section class="card" aria-labelledby="h-mappa-italia">
            <h2 id="h-mappa-italia">LA NOSTRA ITALIA</h2>
            <p class="stat-value" style="font-size: 1.1rem; margin: 4px 0 12px 0;">
              ${this.plural(italyCities.length, 'CITTÀ VISITATA', 'CITTÀ VISITATE')} IN ITALIA<span id="italy-regions-count"></span>
            </p>
            <div id="map-italy" class="map-container" style="height: 380px;" aria-hidden="true"></div>
            <button class="btn btn-sm btn-primary" onclick="MappeModule.shareCanvas('map-italy', 'Mappa_Italia_MottoOnTour.jpg')">
              📤 CONDIVIDI MAPPA ITALIA
            </button>
            <h3 style="margin-top: 16px;">Elenco per regione</h3>
            <div id="italy-region-list" aria-live="polite">
              <ul class="map-place-list">
                ${italyCities.map(c => `<li>${this.cityLabel(c)}</li>`).join('')}
              </ul>
            </div>
          </section>
        ` : ''}

        <!-- 3. MAPPE CONTINENTALI -->
        ${continentOrder.map(cont => {
          const list = continentCities[cont];
          const byCountry = new Map();
          list.forEach(c => { if (!byCountry.has(c.StatoNome)) byCountry.set(c.StatoNome, []); byCountry.get(c.StatoNome).push(c); });
          const countries = [...byCountry.keys()].sort((a, b) => a.localeCompare(b, 'it'));
          const id = this.contId(cont);
          return `
          <section class="card" aria-labelledby="h-${id}">
            <h2 id="h-${id}">CITTÀ IN ${cont.toUpperCase()}</h2>
            <p class="stat-value" style="font-size: 1.1rem; margin: 4px 0 12px 0;">
              ${this.plural(list.length, 'CITTÀ VISITATA', 'CITTÀ VISITATE')} IN ${this.plural(countries.length, 'PAESE', 'PAESI')}
            </p>
            <div id="${id}" class="map-container" style="height: 360px;" aria-hidden="true"></div>
            <button class="btn btn-sm btn-primary" onclick="MappeModule.shareCanvas('${id}', 'Mappa_${cont.replace(/\s+/g, '_')}_MottoOnTour.jpg')">
              📤 CONDIVIDI MAPPA ${cont.toUpperCase()}
            </button>
            <h3 style="margin-top: 16px;">Elenco per Paese</h3>
            <ul class="map-place-list">
              ${countries.map(country => {
                const cities = byCountry.get(country);
                return `<li><span aria-hidden="true">${GeoUtils.getFlag(country)}</span> <strong>${this.esc(country)}</strong>, ${this.plural(cities.length, 'città', 'città')}: ${cities.map(c => this.cityLabel(c)).join('; ')}.</li>`;
              }).join('')}
            </ul>
          </section>`;
        }).join('')}

        <!-- 4. MAPPA ULTIMO VIAGGIO -->
        ${lastTrip ? `
          <section class="card" aria-labelledby="h-mappa-ultimo">
            <h2 id="h-mappa-ultimo">IL NOSTRO ULTIMO VIAGGIO: ${this.esc(lastTrip.Nome_Viaggio)}</h2>
            <p class="stat-value" style="font-size: 1.1rem; margin: 4px 0 12px 0;" aria-hidden="true">
              TAPPE: ${lastTripCities.map(c => this.esc(GeoUtils.parseCityAndState(c).city)).join(' ➔ ')}
            </p>
            <div id="map-last-trip" class="map-container" style="height: 360px;" aria-hidden="true"></div>
            <button class="btn btn-sm btn-primary" onclick="MappeModule.shareCanvas('map-last-trip', 'Mappa_UltimoViaggio_MottoOnTour.jpg')">
              📤 CONDIVIDI ULTIMO VIAGGIO
            </button>
            <h3 style="margin-top: 16px;">Tappe in ordine</h3>
            <ol class="map-place-list">
              ${lastTripCities.map(c => `<li>${this.esc(GeoUtils.parseCityAndState(c).city)}</li>`).join('')}
            </ol>
          </section>
        ` : ''}

        <!-- 5. CITTÀ DA CORREGGERE -->
        ${approxCities.length > 0 ? `
          <section class="card" aria-labelledby="h-mappa-approx">
            <h2 id="h-mappa-approx">CITTÀ DA CONTROLLARE</h2>
            <p>Queste città non sono state trovate e sulle mappe sono segnate al centro del Paese. Controlla come sono scritte nel Diario di bordo, oppure aggiungi il Paese tra parentesi, ad esempio "Palma (Spagna)".</p>
            <ul class="map-place-list">
              ${approxCities.map(c => `<li>${this.esc(c.Citta)}, ${this.esc(c.StatoNome)}</li>`).join('')}
            </ul>
          </section>
        ` : ''}
      `}
    `;

    if (coords.length > 0 || diarioTrips.length > 0) {
      setTimeout(() => {
        GeoUtils.renderWorldMap('map-world', new Set(visited.keys()), coords);
        if (showItaly) {
          GeoUtils.renderItalyMap('map-italy', italyCities);
          this.fillItalyRegions(italyCities);
        }
        continentOrder.forEach(cont => {
          GeoUtils.renderContinentMap(this.contId(cont), cont, continentCities[cont]);
        });
        if (lastTrip) {
          const tripType = String(lastTrip.Tipologia_Viaggio || '');
          const isCruise = tripType.toLowerCase().includes('crociera');
          const tripStates = String(lastTrip.Stati || '').split('\n').map(s => s.trim()).filter(Boolean);
          GeoUtils.renderTripRouteMap('map-last-trip', lastTripCities, isCruise, tripType, tripStates);
        }
      }, 60);
    }
  },

  // Raggruppa le città italiane per regione (dato recuperato online una volta e poi tenuto in cache)
  async fillItalyRegions(italyCities) {
    const groups = new Map();
    for (const c of italyCities) {
      const region = await GeoUtils.getItalianRegion(c.Citta, c.Latitudine, c.Longitudine);
      const key = region || "Regione non disponibile";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(c);
    }
    const target = document.getElementById('italy-region-list');
    if (!target) return; // l'utente ha cambiato schermata
    const regions = [...groups.keys()].sort((a, b) => {
      if (a === "Regione non disponibile") return 1;
      if (b === "Regione non disponibile") return -1;
      return a.localeCompare(b, 'it');
    });
    const realRegions = regions.filter(r => r !== "Regione non disponibile").length;
    target.innerHTML = `
      <ul class="map-place-list">
        ${regions.map(r => {
          const list = groups.get(r);
          return `<li><strong>${this.esc(r)}</strong>, ${this.plural(list.length, 'città', 'città')}: ${list.map(c => this.cityLabel(c)).join('; ')}.</li>`;
        }).join('')}
      </ul>`;
    const countEl = document.getElementById('italy-regions-count');
    if (countEl && realRegions > 0) countEl.textContent = ` IN ${realRegions} ${realRegions === 1 ? 'REGIONE' : 'REGIONI'} SU 20`;
  },

  async refreshMaps() {
    App.notify("Aggiornamento mappe dal cloud...");
    await API.fetchAllData(true);
    SoundFX.playConfirm();
    App.notify("Mappe aggiornate con successo.");
    MappeModule.render(document.getElementById('app-container'));
  },

  shareCanvas(canvasId, filename) {
    let title = "";
    if (canvasId === 'map-world') title = "PAESI VISITATI NEL MONDO";
    else if (canvasId === 'map-italy') title = "LA NOSTRA ITALIA - CITTÀ VISITATE";
    else if (String(canvasId).startsWith('map-cont-')) {
      const cont = String(canvasId).replace('map-cont-', '').replace(/-/g, ' ').toUpperCase();
      title = `CITTÀ VISITATE IN ${cont}`;
    } else if (canvasId === 'map-last-trip') {
      // Stesso viaggio mostrato sulla mappa (il più recente per data, non l'ultima riga del foglio)
      const lastTrip = this.lastTrip || this.getLastTrip();
      title = lastTrip ? `ULTIMO VIAGGIO: ${lastTrip.Nome_Viaggio}` : "ULTIMO VIAGGIO";
    }
    GeoUtils.exportMapImage(canvasId, filename, title);
  }
};
