// ==========================================================================
// MODULO 09: LE MIE MAPPE - MAPPE GEOGRAFICHE, ROTTE E CONDIVISIONE
// ==========================================================================

const MappeModule = {
  render(container) {
    const coords = API.data[CONFIG.SHEETS.COORDINATE] || [];
    const diarioTrips = API.data[CONFIG.SHEETS.DIARIO] || [];
    
    // Sort completed trips chronologically by end date (latest first)
    const sortedDiario = [...diarioTrips].sort((a, b) => {
      const getEndDate = (t) => {
        if (t.Data_Fine_Globale) return new Date(t.Data_Fine_Globale).getTime();
        if (t.Data_Inizio_Globale) return new Date(t.Data_Inizio_Globale).getTime();
        if (t.Anno_Viaggio) {
          const y = parseInt(String(t.Anno_Viaggio).match(/\d{4}/)?.[0] || '0');
          if (y > 0) return new Date(y, 11, 31).getTime();
        }
        return 0;
      };
      return getEndDate(b) - getEndDate(a);
    });
    const lastTrip = sortedDiario.length > 0 ? sortedDiario[0] : null;

    // Filter cities by location
    const italyCities = coords.filter(c => String(c.Stato || '').toUpperCase() === 'ITALIA');
    
    // Group cities by continent
    const continentCities = {
      "Europa": coords.filter(c => c.Continente === 'Europa'),
      "Asia": coords.filter(c => c.Continente === 'Asia'),
      "Africa": coords.filter(c => c.Continente === 'Africa'),
      "America del Nord": coords.filter(c => c.Continente === 'America del Nord'),
      "America del Sud": coords.filter(c => c.Continente === 'America del Sud'),
      "Oceania": coords.filter(c => c.Continente === 'Oceania')
    };

    // Visited states from both coordinates and trips
    const visitedStates = new Set();
    coords.forEach(c => { if (c.Stato) visitedStates.add(c.Stato.trim()); });
    diarioTrips.forEach(t => {
      if (t.Stati) {
        String(t.Stati).split('\n').map(s => s.trim()).filter(Boolean).forEach(s => visitedStates.add(s));
      }
    });

    container.innerHTML = `
      <div class="action-bar" style="justify-content: space-between;">
        <h1 id="screen-title" tabindex="-1">LE MIE MAPPE</h1>
        <button class="btn btn-sm btn-primary" onclick="MappeModule.refreshMaps()">
          🔄 AGGIORNA MAPPE
        </button>
      </div>

      <p style="color: var(--pink-light); margin-bottom: 16px;">
        Trasformazione visiva e dinamica delle tue esperienze in mappe geografiche condivisibili.
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
        <section class="card">
          <h2>PAESI VISITATI</h2>
          <p class="stat-value" style="font-size: 1.1rem; margin: 4px 0 12px 0;">
            ${visitedStates.size} PAESI VISITATI SUL TOTALE MONDIALE (195 STATI)
          </p>
          <div id="map-world" class="map-container" style="height: 380px;" aria-hidden="true"></div>
          <button class="btn btn-sm btn-primary" onclick="MappeModule.shareCanvas('map-world', 'Mappa_Mondo_MottoOnTour.jpg')">
            📤 CONDIVIDI MAPPA MONDO
          </button>
          <div class="sr-only">Paesi rappresentati: ${Array.from(visitedStates).join(', ')}</div>
        </section>

        <!-- 2. MAPPA NAZIONALE ITALIA -->
        ${italyCities.length > 0 || Array.from(visitedStates).some(s => s.toUpperCase().includes('ITALIA')) ? `
          <section class="card">
            <h2>LA NOSTRA ITALIA</h2>
            <p class="stat-value" style="font-size: 1.1rem; margin: 4px 0 12px 0;">
              ${italyCities.length} CITTÀ VISITATE IN ITALIA
            </p>
            <div id="map-italy" class="map-container" style="height: 380px;" aria-hidden="true"></div>
            <button class="btn btn-sm btn-primary" onclick="MappeModule.shareCanvas('map-italy', 'Mappa_Italia_MottoOnTour.jpg')">
              📤 CONDIVIDI MAPPA ITALIA
            </button>
            <div class="sr-only">Città italiane visitate: ${italyCities.map(c => c.Citta).join(', ')}</div>
          </section>
        ` : ''}

        <!-- 3. MAPPE CONTINENTALI -->
        ${Object.entries(continentCities).filter(([_, list]) => list.length > 0).map(([cont, list]) => `
          <section class="card">
            <h2>CITTÀ IN ${cont.toUpperCase()}</h2>
            <p class="stat-value" style="font-size: 1.1rem; margin: 4px 0 12px 0;">
              ${list.length} CITTÀ VISITATE
            </p>
            <div id="map-cont-${cont.replace(/\s+/g, '-').toLowerCase()}" class="map-container" style="height: 360px;" aria-hidden="true"></div>
            <button class="btn btn-sm btn-primary" onclick="MappeModule.shareCanvas('map-cont-${cont.replace(/\s+/g, '-').toLowerCase()}', 'Mappa_${cont}_MottoOnTour.jpg')">
              📤 CONDIVIDI MAPPA ${cont.toUpperCase()}
            </button>
            <div class="sr-only">Città in ${cont}: ${list.map(c => c.Citta).join(', ')}</div>
          </section>
        `).join('')}

        <!-- 4. MAPPA ULTIMO VIAGGIO -->
        ${lastTrip ? `
          <section class="card">
            <h2>IL NOSTRO ULTIMO VIAGGIO: ${lastTrip.Nome_Viaggio}</h2>
            <p class="stat-value" style="font-size: 1.1rem; margin: 4px 0 12px 0;">
              TAPPE: ${(lastTrip.Citta || '').replace(/\n/g, ' ➔ ')}
            </p>
            <div id="map-last-trip" class="map-container" style="height: 360px;" aria-hidden="true"></div>
            <button class="btn btn-sm btn-primary" onclick="MappeModule.shareCanvas('map-last-trip', 'Mappa_UltimoViaggio_MottoOnTour.jpg')">
              📤 CONDIVIDI ULTIMO VIAGGIO
            </button>
          </section>
        ` : ''}
      `}
    `;

    if (coords.length > 0 || diarioTrips.length > 0) {
      setTimeout(() => {
        this.drawWorldMap(coords, visitedStates);
        if (italyCities.length > 0 || Array.from(visitedStates).some(s => s.toUpperCase().includes('ITALIA'))) {
          this.drawRegionalMap('map-italy', italyCities, 'ITALIA');
        }

        Object.entries(continentCities).forEach(([cont, list]) => {
          if (list.length > 0) {
            this.drawRegionalMap(`map-cont-${cont.replace(/\s+/g, '-').toLowerCase()}`, list, cont);
          }
        });

        if (lastTrip) {
          const cities = String(lastTrip.Citta || '').split('\n').map(c => c.trim()).filter(Boolean);
          const isCruise = String(lastTrip.Tipologia_Viaggio || '').toLowerCase().includes('crociera');
          GeoUtils.renderTripRouteMap('map-last-trip', cities, isCruise);
        }
      }, 60);
    }
  },

  async refreshMaps() {
    App.notify("Aggiornamento mappe dal cloud...");
    await API.fetchAllData(true);
    SoundFX.playConfirm();
    App.notify("Mappe aggiornate con successo.");
    MappeModule.render(document.getElementById('app-container'));
  },

  drawWorldMap(coords, visitedStates) {
    GeoUtils.renderWorldMap('map-world', visitedStates, coords);
  },

  drawRegionalMap(canvasId, citiesList, regionName) {
    if (regionName === 'ITALIA') {
      GeoUtils.renderItalyMap(canvasId, citiesList);
    } else {
      GeoUtils.renderContinentMap(canvasId, regionName, citiesList);
    }
  },

  shareCanvas(canvasId, filename) {
    let title = "";
    if (canvasId === 'map-world') title = "PAESI VISITATI NEL MONDO";
    else if (canvasId === 'map-italy') title = "LA NOSTRA ITALIA - CITTÀ VISITATE";
    else if (String(canvasId).startsWith('map-cont-')) {
      const cont = String(canvasId).replace('map-cont-', '').replace(/-/g, ' ').toUpperCase();
      title = `CITTÀ VISITATE IN ${cont}`;
    } else if (canvasId === 'map-last-trip') {
      const trips = API.data[CONFIG.SHEETS.DIARIO] || [];
      const lastTrip = trips.length > 0 ? trips[trips.length - 1] : null;
      title = lastTrip ? `ULTIMO VIAGGIO: ${lastTrip.Nome_Viaggio}` : "ULTIMO VIAGGIO";
    }
    GeoUtils.exportMapImage(canvasId, filename, title);
  }
};
