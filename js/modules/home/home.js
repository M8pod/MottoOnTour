// ==========================================================================
// MODULO 03: HOME - HUB PRINCIPALE E CRUSCOTTO INTERATTIVO
// ==========================================================================

const HomeModule = {
  render(container) {
    const diarioTrips = API.data[CONFIG.SHEETS.DIARIO] || [];
    const inPartenzaTrips = API.data[CONFIG.SHEETS.IN_PARTENZA] || [];
    const coords = API.data[CONFIG.SHEETS.COORDINATE] || [];

    // 1. Geographic Stats Calculation
    const visitedStatesSet = new Set();
    diarioTrips.forEach(t => {
      if (t.Stati) {
        String(t.Stati).split('\n').map(s => s.trim().toUpperCase()).filter(Boolean).forEach(s => visitedStatesSet.add(s));
      }
    });
    const visitedCount = visitedStatesSet.size;
    const worldPercentage = ((visitedCount / CONFIG.TOTAL_WORLD_COUNTRIES) * 100).toFixed(1).replace('.', ',');

    // 2. Ultimo Viaggio Calculation (ultimo viaggio completato in ordine cronologico di data di fine)
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

    // 3. Prossimo Viaggio / Sei in viaggio Calculation
    let nextTrip = null;
    let daysDiff = null;
    let isOngoing = false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (inPartenzaTrips.length > 0) {
      // Sort upcoming trips by start date
      const sortedInPartenza = [...inPartenzaTrips].sort((a, b) => {
        const dA = a.Data_Inizio_Globale ? new Date(a.Data_Inizio_Globale) : new Date(8640000000000000);
        const dB = b.Data_Inizio_Globale ? new Date(b.Data_Inizio_Globale) : new Date(8640000000000000);
        return dA - dB;
      });

      nextTrip = sortedInPartenza[0];
      if (nextTrip && nextTrip.Data_Inizio_Globale) {
        const startDate = new Date(nextTrip.Data_Inizio_Globale);
        startDate.setHours(0, 0, 0, 0);
        const endDate = nextTrip.Data_Fine_Globale ? new Date(nextTrip.Data_Fine_Globale) : new Date(startDate);
        endDate.setHours(23, 59, 59, 999);

        if (today >= startDate && today <= endDate) {
          isOngoing = true;
        } else if (startDate > today) {
          const diffTime = startDate - today;
          daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
      }
    }

    // Helper date strings for visual & VoiceOver
    let lastTripDateDisplay = "";
    let lastTripDateAria = "";
    if (lastTrip) {
      if (lastTrip.Data_Inizio_Globale && lastTrip.Data_Fine_Globale) {
        const d1 = CONFIG.formatDateDisplay(lastTrip.Data_Inizio_Globale);
        const d2 = CONFIG.formatDateDisplay(lastTrip.Data_Fine_Globale);
        lastTripDateDisplay = `DAL ${d1} AL ${d2}`;
        lastTripDateAria = `dal ${d1} al ${d2}`;
      } else if (lastTrip.Data_Inizio_Globale) {
        const d1 = CONFIG.formatDateDisplay(lastTrip.Data_Inizio_Globale);
        lastTripDateDisplay = `DATA ${d1}`;
        lastTripDateAria = `data ${d1}`;
      } else if (lastTrip.Anno_Viaggio) {
        lastTripDateDisplay = `ANNO ${lastTrip.Anno_Viaggio}`;
        lastTripDateAria = `anno ${lastTrip.Anno_Viaggio}`;
      }
    }

    let nextTripDateDisplay = "";
    let nextTripDateAria = "";
    if (nextTrip) {
      if (nextTrip.Data_Inizio_Globale) {
        const d1 = CONFIG.formatDateDisplay(nextTrip.Data_Inizio_Globale);
        nextTripDateDisplay = d1;
        nextTripDateAria = `data di partenza ${d1}`;
      } else {
        nextTripDateDisplay = "Data da definire";
        nextTripDateAria = "data da definire";
      }
    }

    container.innerHTML = `
      <div class="action-bar" style="justify-content: space-between;">
        <h1 id="screen-title" tabindex="-1">MOTTO ON TOUR</h1>
        <button id="btn-refresh-home" class="btn btn-sm btn-primary" aria-label="Aggiorna dati dal database cloud">
          🔄 AGGIORNA DATI
        </button>
      </div>

      <!-- RIQUADRO 1: STATISTICA GEOGRAFICA -->
      <section class="card" aria-labelledby="heading-stat-geo">
        <h2 id="heading-stat-geo">STATISTICA GEOGRAFICA</h2>
        
        <div id="home-world-map" class="map-container" style="height: 280px;" aria-hidden="true"></div>

        <div style="margin-top: 12px;">
          ${visitedCount > 0 ? `
            <p class="stat-value" style="font-size: 1.15rem;">
              ${worldPercentage}% - ${visitedCount} STATI VISITATI SUL TOTALE MONDIALE
            </p>
          ` : `
            <div class="empty-state">
              <p class="empty-state-text">
                0% - 0 STATI VISITATI SUL TOTALE MONDIALE<br>
                <button class="btn btn-sm btn-primary" style="margin-top: 10px;" onclick="App.navigate('diario')">
                  INIZIA AD AGGIUNGERE I TUOI VIAGGI NEL DIARIO DI BORDO!
                </button>
              </p>
            </div>
          `}
        </div>
      </section>

      <!-- RIQUADRO 2: ULTIMO VIAGGIO -->
      <section class="card" aria-labelledby="heading-last-trip">
        <h2 id="heading-last-trip">ULTIMO VIAGGIO</h2>
        ${lastTrip ? `
          <button type="button" class="card card-mint card-interactive card-btn" onclick="DiarioModule.openTripDetails('${lastTrip.ID_Viaggio}')" aria-label="Ultimo viaggio: ${lastTrip.Nome_Viaggio}. ${lastTripDateAria}. ${lastTrip.intensity ? lastTrip.intensity.ariaLabel : ''}. Tipologia: ${lastTrip.Tipologia_Viaggio || 'Standard'}. Stati: ${(lastTrip.Stati || '-').replace(/\n/g, ', ')}. Apri dettagli viaggio.">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
              <h3 style="color: var(--mint); margin: 0;">${lastTrip.Nome_Viaggio}</h3>
              ${GeoUtils.getIntensityBadgeHtml(lastTrip)}
            </div>
            <p style="color: var(--pink-light); font-weight: 700; margin-top: 4px;">
              ${lastTripDateDisplay}
            </p>
            <p style="color: #ccc; margin-top: 4px;">
              Tipologia: <strong>${lastTrip.Tipologia_Viaggio || 'Standard'}</strong> | Stati: <strong>${(lastTrip.Stati || '-').replace(/\n/g, ', ')}</strong>
            </p>
            <span class="btn btn-sm btn-primary" style="margin-top: 10px; pointer-events: none;">VEDI SCHEDA VIAGGIO ➔</span>
          </button>
        ` : `
          <div class="empty-state">
            <p class="empty-state-text">NESSUN VIAGGIO ANCORA REGISTRATO</p>
            <button class="btn btn-sm btn-primary" style="margin-top: 10px;" onclick="DiarioModule.openNewTripForm()">
              ➕ AGGIUNGI IL PRIMO VIAGGIO
            </button>
          </div>
        `}
      </section>

      <!-- RIQUADRO 3: PROSSIMO VIAGGIO -->
      <section class="card" aria-labelledby="heading-next-trip">
        <h2 id="heading-next-trip">PROSSIMO VIAGGIO</h2>
        ${nextTrip ? `
          <button type="button" class="card card-mint card-interactive card-btn" onclick="InPartenzaModule.openTripDetails('${nextTrip.ID_InPartenza}')" aria-label="Prossimo viaggio: ${nextTrip.Nome_Viaggio}. ${isOngoing ? 'Sei attualmente in viaggio!' : (daysDiff !== null ? `Mancano ${daysDiff} giorni.` : '')} ${nextTripDateAria}. Tipologia: ${nextTrip.Tipologia_Viaggio || 'Pianificato'}. Apri pianificazione.">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
              <h3 style="color: var(--mint); margin: 0;">${nextTrip.Nome_Viaggio}</h3>
              ${isOngoing ? `
                <span class="btn btn-sm" style="background-color: var(--mint); color: #000; font-weight: 800;">🎉 SEI IN VIAGGIO!</span>
              ` : (daysDiff !== null ? `
                <span class="btn btn-sm btn-pink">MANCANO ${daysDiff} GIORNI</span>
              ` : '')}
            </div>
            <p style="color: var(--pink-light); margin-top: 6px;">
              Tipologia: <strong>${nextTrip.Tipologia_Viaggio || 'Pianificato'}</strong> | Partenza: <strong>${nextTripDateDisplay}</strong>
            </p>
            <span class="btn btn-sm btn-primary" style="margin-top: 10px; pointer-events: none;">VEDI PIANIFICAZIONE ➔</span>
          </button>
        ` : `
          <div class="empty-state">
            <p class="empty-state-text">NESSUN VIAGGIO ALL'ORIZZONTE</p>
            <button class="btn btn-sm btn-primary" style="margin-top: 10px;" onclick="App.navigate('cassetto')">
              ✨ METTINE UNO NEI VIAGGI IN CASSETTO!
            </button>
          </div>
        `}
      </section>
    `;

    // Bind Refresh button
    document.getElementById('btn-refresh-home').addEventListener('click', async () => {
      App.notify("Aggiornamento dati dal cloud in corso...");
      await API.fetchAllData(true);
      SoundFX.playConfirm();
      App.notify("Dati aggiornati con successo.");
      HomeModule.render(container);
    });

    // Render Leaflet World Map
    this.drawMiniWorldMap(visitedStatesSet, coords);
  },

  drawMiniWorldMap(visitedSet, coords = []) {
    setTimeout(() => {
      GeoUtils.renderWorldMap('home-world-map', visitedSet, coords);
    }, 60);
  }
};
