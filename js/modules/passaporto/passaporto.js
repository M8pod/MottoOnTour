// ==========================================================================
// MODULO 06: IL MIO PASSAPORTO - CENTRO STATISTICO, RECORD E ANALISI
// ==========================================================================

const PassaportoModule = {
  currentCategory: 'main', // 'main', 'geografia', 'storico', 'compagni', 'economia'
  selectedCompanion: null,
  selectedCity: null,
  selectedCarrier: null,

  render(container) {
    if (this.currentCategory === 'geografia') {
      this.renderGeografia(container);
    } else if (this.currentCategory === 'storico') {
      this.renderStorico(container);
    } else if (this.currentCategory === 'compagni') {
      this.renderCompagni(container);
    } else if (this.currentCategory === 'economia') {
      this.renderEconomia(container);
    } else {
      this.renderMain(container);
    }
  },

  getAggregatedData() {
    const trips = API.data[CONFIG.SHEETS.DIARIO] || [];
    const coords = API.data[CONFIG.SHEETS.COORDINATE] || [];

    const totalTrips = trips.length;

    // States & Continents
    const visitedStatesMap = new Map();
    const visitedCitiesMap = new Map();
    const carriersSet = new Set();
    const companionsSet = new Set();
    let totalSpend = 0;
    let totalSouvenirs = 0;
    let mostExpensiveTrip = null;
    let maxCost = 0;
    let robyEleCount = 0;
    let ciurmaCount = 0;

    const tripsByYear = {};
    const transportCounts = {};
    const budgetByCategory = {};
    CONFIG.EXPENSE_CATEGORIES.forEach(c => budgetByCategory[c.key] = 0);

    trips.forEach(t => {
      // Year
      const y = t.Anno_Viaggio || (t.Data_Inizio_Globale ? t.Data_Inizio_Globale.split('-')[0] : 'Altro');
      tripsByYear[y] = (tripsByYear[y] || 0) + 1;

      // States
      if (t.Stati) {
        String(t.Stati).split('\n').map(s => s.trim().toUpperCase()).filter(Boolean).forEach(st => {
          visitedStatesMap.set(st, (visitedStatesMap.get(st) || 0) + 1);
        });
      }

      // Cities
      if (t.Citta) {
        String(t.Citta).split('\n').map(c => c.trim()).filter(Boolean).forEach(ct => {
          if (!visitedCitiesMap.has(ct)) visitedCitiesMap.set(ct, []);
          visitedCitiesMap.get(ct).push(t);
        });
      }

      // Transports
      if (t.Mezzi_Usati) {
        String(t.Mezzi_Usati).split(',').map(m => m.trim()).filter(Boolean).forEach(m => {
          transportCounts[m] = (transportCounts[m] || 0) + 1;
        });
      }

      // Carriers
      if (t.Compagnie_Vettori) {
        String(t.Compagnie_Vettori).split('\n').map(c => c.trim()).filter(Boolean).forEach(c => {
          carriersSet.add(c);
        });
      }

      // Companions
      const comp = String(t.Compagni_Viaggio || '').trim();
      if (!comp) {
        robyEleCount++;
      } else {
        ciurmaCount++;
        comp.split('\n').map(p => p.trim()).filter(Boolean).forEach(p => {
          companionsSet.add(p);
        });
      }

      // Budget
      let tripCost = 0;
      CONFIG.EXPENSE_CATEGORIES.forEach(c => {
        const val = Number(t[c.key] || 0);
        budgetByCategory[c.key] += val;
        tripCost += val;
      });
      totalSpend += tripCost;
      if (tripCost > maxCost) {
        maxCost = tripCost;
        mostExpensiveTrip = t;
      }

      // Souvenirs
      if (t.Souvenir) {
        const souvCount = String(t.Souvenir).split('\n').map(s => s.trim()).filter(Boolean).length;
        totalSouvenirs += souvCount;
      }
    });

    const visitedStatesCount = visitedStatesMap.size;
    const worldPercentage = ((visitedStatesCount / CONFIG.TOTAL_WORLD_COUNTRIES) * 100).toFixed(1).replace('.', ',');
    const geoStats = GeoUtils.computeGeoStats(coords);

    return {
      totalTrips,
      visitedStatesCount,
      visitedStatesMap,
      worldPercentage,
      totalCitiesCount: visitedCitiesMap.size,
      visitedCitiesMap,
      carriersSet,
      companionsSet,
      totalSpend,
      mostExpensiveTrip,
      maxCost,
      robyEleCount,
      robyElePercent: totalTrips > 0 ? ((robyEleCount / totalTrips) * 100).toFixed(0) : '0',
      ciurmaCount,
      ciurmaPercent: totalTrips > 0 ? ((ciurmaCount / totalTrips) * 100).toFixed(0) : '0',
      tripsByYear,
      transportCounts,
      budgetByCategory,
      totalSouvenirs,
      geoStats
    };
  },

  renderMain(container) {
    const stats = this.getAggregatedData();

    container.innerHTML = `
      <div class="action-bar" style="justify-content: space-between;">
        <h1 id="screen-title" tabindex="-1">IL MIO PASSAPORTO</h1>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-sm btn-primary" onclick="PassaportoModule.openPdfReport()">
            📄 GENERA PDF
          </button>
          <button class="btn btn-sm btn-pink" onclick="PassaportoModule.openChartModal()">
            📊 GENERA GRAFICO
          </button>
        </div>
      </div>

      <p style="color: var(--pink-light); margin-bottom: 16px;">
        Centro statistico, record geografici, analisi logistica ed economica.
      </p>

      ${stats.totalTrips === 0 ? `
        <div class="empty-state">
          <p class="empty-state-text">
            IL TUO PASSAPORTO È PRONTO!<br>
            REGISTRA IL TUO PRIMO VIAGGIO NEL DIARIO DI BORDO PER INIZIARE A CALCOLARE LE TUE STATISTICHE, I RECORD E I GRAFICI NEL MONDO.
          </p>
        </div>
      ` : ''}

      <!-- MENU A PULSANTI PER CATEGORIE STATISTICHE -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
        <button class="btn btn-block" style="min-height: 70px; flex-direction: column; gap: 4px;" onclick="PassaportoModule.openCategory('geografia')">
          <span style="font-size: 1.4rem;">🌍</span>
          <span>GEOGRAFIA E MONDO</span>
        </button>

        <button class="btn btn-block" style="min-height: 70px; flex-direction: column; gap: 4px;" onclick="PassaportoModule.openCategory('storico')">
          <span style="font-size: 1.4rem;">📊</span>
          <span>STORICO E LOGISTICA</span>
        </button>

        <button class="btn btn-block" style="min-height: 70px; flex-direction: column; gap: 4px;" onclick="PassaportoModule.openCategory('compagni')">
          <span style="font-size: 1.4rem;">👥</span>
          <span>COMPAGNI DI VIAGGIO</span>
        </button>

        <button class="btn btn-block" style="min-height: 70px; flex-direction: column; gap: 4px;" onclick="PassaportoModule.openCategory('economia')">
          <span style="font-size: 1.4rem;">💰</span>
          <span>ECONOMIA E SOUVENIR</span>
        </button>
      </div>

      <!-- SINTESI DEI TOTALI -->
      <section class="card">
        <h2>RIEPILOGO GENERALE</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
          <div class="stat-box">
            <div class="stat-label">VIAGGI TOTALI</div>
            <div class="stat-value">${stats.totalTrips}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">STATI NEL MONDO</div>
            <div class="stat-value">${stats.visitedStatesCount} / 195 (${stats.worldPercentage}%)</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">SPESA COMPLESSIVA</div>
            <div class="stat-value">€ ${stats.totalSpend.toLocaleString('it-IT')}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">SOUVENIR RACCOLTI</div>
            <div class="stat-value">${stats.totalSouvenirs}</div>
          </div>
        </div>
      </section>
    `;
  },

  openCategory(cat) {
    this.currentCategory = cat;
    this.selectedCompanion = null;
    this.selectedCity = null;
    this.selectedCarrier = null;
    App.render();
  },

  renderGeografia(container) {
    const stats = this.getAggregatedData();
    const geo = stats.geoStats;

    // Group visited states by continent
    const continentGroups = {};
    stats.visitedStatesMap.forEach((count, state) => {
      const info = GeoUtils.getCountryInfo(state);
      const cont = info.continent || "Europa";
      if (!continentGroups[cont]) continentGroups[cont] = [];
      continentGroups[cont].push({ state, flag: info.flag, capital: info.capital });
    });

    container.innerHTML = `
      <div class="action-bar" style="justify-content: space-between;">
        <button class="btn btn-sm btn-pink" onclick="PassaportoModule.openCategory('main')">
          ⬅️ TORNA AL PASSAPORTO
        </button>
        <button class="btn btn-sm btn-primary" onclick="PassaportoModule.openPdfReport()">
          📄 GENERA PDF
        </button>
      </div>

      <h1 id="screen-title" tabindex="-1">GEOGRAFIA E MONDO</h1>

      <!-- 1. STATISTICHE GENERALI -->
      <section class="card">
        <h2>COPERTURA MONDIALE</h2>
        <p class="stat-value" style="font-size: 1.3rem;">
          ${stats.worldPercentage}% DEL MONDO ESPLORATO (${stats.visitedStatesCount} STATI SU 195)
        </p>
      </section>

      <!-- 2. ANALISI PER CONTINENTI -->
      <section class="card">
        <h2>STATI VISITATI PER CONTINENTE</h2>
        ${Object.keys(continentGroups).length > 0 ? `
          <div class="table-responsive">
            <table class="table-closed">
              <thead><tr><th>CONTINENTE</th><th>STATI ESPLORATI</th></tr></thead>
              <tbody>
                ${Object.entries(continentGroups).map(([cont, list]) => `
                  <tr>
                    <th>${cont.toUpperCase()} (${list.length})</th>
                    <td>${list.map(s => `${s.flag} ${s.state}`).join(', ')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : `<p style="color: var(--text-muted);">In attesa del primo viaggio.</p>`}
      </section>

      <!-- 3. RECORD GEOGRAFICI DA VENEZIA -->
      <section class="card">
        <h2>RECORD GEOGRAFICI (RIFERIMENTO VENEZIA)</h2>
        <div class="table-responsive">
          <table class="table-closed">
            <tbody>
              <tr><th style="width: 40%;">CITTÀ PIÙ A NORD</th><td>${geo.mostNorth ? `📍 ${geo.mostNorth.Citta} (${geo.mostNorth.Stato}) [${geo.mostNorth.Latitudine}°]` : 'IN ATTESA DEL PRIMO VIAGGIO'}</td></tr>
              <tr><th>CITTÀ PIÙ A SUD</th><td>${geo.mostSouth ? `📍 ${geo.mostSouth.Citta} (${geo.mostSouth.Stato}) [${geo.mostSouth.Latitudine}°]` : 'IN ATTESA DEL PRIMO VIAGGIO'}</td></tr>
              <tr><th>CITTÀ PIÙ A EST</th><td>${geo.mostEast ? `📍 ${geo.mostEast.Citta} (${geo.mostEast.Stato}) [${geo.mostEast.Longitudine}°]` : 'IN ATTESA DEL PRIMO VIAGGIO'}</td></tr>
              <tr><th>CITTÀ PIÙ A OVEST</th><td>${geo.mostWest ? `📍 ${geo.mostWest.Citta} (${geo.mostWest.Stato}) [${geo.mostWest.Longitudine}°]` : 'IN ATTESA DEL PRIMO VIAGGIO'}</td></tr>
              <tr><th>PIÙ LONTANA DA VENEZIA</th><td>${geo.farthestFromVenice ? `✈️ ${geo.farthestFromVenice.Citta} (${geo.farthestFromVenice.distFromVenice} km in linea d'aria)` : 'IN ATTESA DEL PRIMO VIAGGIO'}</td></tr>
              <tr><th>PIÙ VICINA A VENEZIA</th><td>${geo.closestToVenice ? `🚤 ${geo.closestToVenice.Citta} (${geo.closestToVenice.distFromVenice} km in linea d'aria)` : 'IN ATTESA DEL PRIMO VIAGGIO'}</td></tr>
              <tr><th>PIÙ VICINE ALL'EQUATORE</th><td>${geo.closestToEquator.length > 0 ? geo.closestToEquator.map(c => `🌍 ${c.Citta} (${c.Stato})`).join('<br>') : 'IN ATTESA DEL PRIMO VIAGGIO'}</td></tr>
              <tr><th>PIÙ VICINE AI POLI</th><td>${geo.closestToPoles.length > 0 ? geo.closestToPoles.map(c => `❄️ ${c.Citta} (${c.pole})`).join('<br>') : 'IN ATTESA DEL PRIMO VIAGGIO'}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 4. LISTA CITTÀ VISITATE -->
      <section class="card">
        <h2>TUTTE LE CITTÀ VISITATE NEL MONDO (${stats.totalCitiesCount})</h2>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;">
          ${Array.from(stats.visitedCitiesMap.keys()).sort().map(c => `
            <button class="btn btn-sm ${this.selectedCity === c ? 'btn-primary' : 'btn-pink'}" onclick="PassaportoModule.selectCity('${c}')">
              📍 ${c}
            </button>
          `).join('')}
        </div>

        ${this.selectedCity ? `
          <div style="margin-top: 16px; border: 2px solid var(--mint); border-radius: 8px; padding: 12px; background-color: var(--bg-black);">
            <h3 style="color: var(--mint); margin-top: 0;">VIAGGI A: ${this.selectedCity}</h3>
            ${(stats.visitedCitiesMap.get(this.selectedCity) || []).map(t => `
              <div style="margin: 6px 0;">
                <button class="btn btn-sm btn-primary" onclick="DiarioModule.openTripDetails('${t.ID_Viaggio}')">
                  📖 ${t.Nome_Viaggio} (${t.Anno_Viaggio || t.Data_Inizio_Globale || '-'})
                </button>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </section>
    `;
  },

  selectCity(city) {
    this.selectedCity = this.selectedCity === city ? null : city;
    App.render();
  },

  renderStorico(container) {
    const stats = this.getAggregatedData();

    container.innerHTML = `
      <div class="action-bar" style="justify-content: space-between;">
        <button class="btn btn-sm btn-pink" onclick="PassaportoModule.openCategory('main')">
          ⬅️ TORNA AL PASSAPORTO
        </button>
        <button class="btn btn-sm btn-primary" onclick="PassaportoModule.openPdfReport()">
          📄 GENERA PDF
        </button>
      </div>

      <h1 id="screen-title" tabindex="-1">STORICO E LOGISTICA</h1>

      <!-- 1. FREQUENZA ANNUALE -->
      <section class="card">
        <h2>FREQUENZA DEI VIAGGI PER ANNO</h2>
        <div class="table-responsive">
          <table class="table-closed">
            <thead><tr><th>ANNO</th><th>NUMERO DI VIAGGI</th></tr></thead>
            <tbody>
              ${Object.entries(stats.tripsByYear).sort((a, b) => b[0] - a[0]).map(([yr, cnt]) => `
                <tr><th>${yr}</th><td>${cnt} viaggi</td></tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <!-- 2. MEZZI DI TRASPORTO -->
      <section class="card">
        <h2>MEZZI DI TRASPORTO UTILIZZATI</h2>
        <div class="table-responsive">
          <table class="table-closed">
            <thead><tr><th>MEZZO</th><th>UTILIZZI</th><th>PERCENTUALE</th></tr></thead>
            <tbody>
              ${Object.entries(stats.transportCounts).map(([m, cnt]) => {
                const pct = stats.totalTrips > 0 ? ((cnt / stats.totalTrips) * 100).toFixed(0) : '0';
                return `<tr><th>${m}</th><td>${cnt}</td><td>${pct}%</td></tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <!-- 3. COMPAGNIE E VETTORI -->
      <section class="card">
        <h2>COMPAGNIE E VETTORI UTILIZZATI (${stats.carriersSet.size})</h2>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;">
          ${Array.from(stats.carriersSet).sort().map(car => `
            <span class="btn btn-sm btn-pink" style="pointer-events: none;">✈️ ${car}</span>
          `).join('')}
        </div>
      </section>
    `;
  },

  renderCompagni(container) {
    const stats = this.getAggregatedData();
    const trips = API.data[CONFIG.SHEETS.DIARIO] || [];

    // Filter trips by companion
    let filteredTrips = [];
    if (this.selectedCompanion === '__roby_ele__') {
      filteredTrips = trips.filter(t => !String(t.Compagni_Viaggio || '').trim());
    } else if (this.selectedCompanion) {
      filteredTrips = trips.filter(t => String(t.Compagni_Viaggio || '').split('\n').map(p => p.trim().toLowerCase()).includes(this.selectedCompanion.toLowerCase()));
    }

    container.innerHTML = `
      <div class="action-bar" style="justify-content: space-between;">
        <button class="btn btn-sm btn-pink" onclick="PassaportoModule.openCategory('main')">
          ⬅️ TORNA AL PASSAPORTO
        </button>
        <button class="btn btn-sm btn-primary" onclick="PassaportoModule.openPdfReport()">
          📄 GENERA PDF
        </button>
      </div>

      <h1 id="screen-title" tabindex="-1">COMPAGNI DI VIAGGIO</h1>

      <!-- 1. RIPARTIZIONE -->
      <section class="card">
        <h2>RIPARTIZIONE STATISTICA</h2>
        <div class="table-responsive">
          <table class="table-closed">
            <thead><tr><th>TIPOLOGIA</th><th>NUMERO VIAGGI</th><th>PERCENTUALE</th></tr></thead>
            <tbody>
              <tr><th>ESCLUSIVI ROBY & ELE 💙</th><td>${stats.robyEleCount}</td><td>${stats.robyElePercent}%</td></tr>
              <tr><th>VIAGGI CON LA CIURMA! 👥</th><td>${stats.ciurmaCount}</td><td>${stats.ciurmaPercent}%</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 2. FILTRO COMPAGNO INTERATTIVO -->
      <section class="card">
        <h2>ESPLORA PER COMPAGNO DI VIAGGIO</h2>
        
        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
          <select id="sel-companion" class="form-control" style="flex: 1; min-width: 200px;" onchange="PassaportoModule.selectedCompanion = this.value; App.render();">
            <option value="">-- Seleziona compagno di viaggio --</option>
            <option value="__roby_ele__" ${this.selectedCompanion === '__roby_ele__' ? 'selected' : ''}>Esclusivi Roby & Ele</option>
            ${Array.from(stats.companionsSet).sort().map(comp => `
              <option value="${comp}" ${this.selectedCompanion === comp ? 'selected' : ''}>${comp}</option>
            `).join('')}
          </select>
          <button class="btn btn-sm btn-pink" onclick="PassaportoModule.selectedCompanion = null; App.render();">
            AZZERA FILTRO
          </button>
        </div>

        ${this.selectedCompanion ? `
          <div style="margin-top: 16px;">
            <h3>VIAGGI EFFETTUATI (${filteredTrips.length})</h3>
            ${filteredTrips.map(t => `
              <div style="margin: 8px 0;">
                <button class="btn btn-sm btn-primary" onclick="DiarioModule.openTripDetails('${t.ID_Viaggio}')">
                  📖 ${t.Nome_Viaggio} (${t.Anno_Viaggio || t.Data_Inizio_Globale || '-'})
                </button>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </section>
    `;
  },

  renderEconomia(container) {
    const stats = this.getAggregatedData();

    container.innerHTML = `
      <div class="action-bar" style="justify-content: space-between;">
        <button class="btn btn-sm btn-pink" onclick="PassaportoModule.openCategory('main')">
          ⬅️ TORNA AL PASSAPORTO
        </button>
        <button class="btn btn-sm btn-primary" onclick="PassaportoModule.openPdfReport()">
          📄 GENERA PDF
        </button>
      </div>

      <h1 id="screen-title" tabindex="-1">ECONOMIA E SOUVENIR</h1>

      <!-- 1. SPESA GLOBALE -->
      <section class="card">
        <h2>STATISTICHE ECONOMICHE GLOBALI</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
          <div class="stat-box">
            <div class="stat-label">TOTALE SPESO COMPLESSIVO</div>
            <div class="stat-value">€ ${stats.totalSpend.toLocaleString('it-IT')}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">VIAGGIO PIÙ COSTOSO</div>
            <div class="stat-value" style="font-size: 1.1rem;">
              ${stats.mostExpensiveTrip ? `${stats.mostExpensiveTrip.Nome_Viaggio} (€ ${stats.maxCost.toLocaleString('it-IT')})` : 'Nessuno'}
            </div>
          </div>
          <div class="stat-box">
            <div class="stat-label">SOUVENIR RACCOLTI NEL MONDO</div>
            <div class="stat-value">🛍️ ${stats.totalSouvenirs}</div>
          </div>
        </div>
      </section>

      <!-- 2. RIPARTIZIONE PER CATEGORIA -->
      <section class="card">
        <h2>RIPARTIZIONE BUDGET PER CATEGORIA</h2>
        <div class="table-responsive">
          <table class="table-closed">
            <thead><tr><th>CATEGORIA</th><th>TOTALE SPESO</th><th>PERCENTUALE</th></tr></thead>
            <tbody>
              ${CONFIG.EXPENSE_CATEGORIES.map(cat => {
                const amt = stats.budgetByCategory[cat.key] || 0;
                const pct = stats.totalSpend > 0 ? ((amt / stats.totalSpend) * 100).toFixed(1) : '0';
                return `<tr><th>${cat.label}</th><td>€ ${amt.toLocaleString('it-IT')}</td><td>${pct}%</td></tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;
  },

  openPdfReport() {
    const stats = this.getAggregatedData();
    const geo = stats.geoStats;

    App.showModal({
      title: "GENERA REPORT PDF STATISTICHE",
      bodyHtml: `
        <p style="color: var(--pink-light); margin-bottom: 8px;">Scegli il formato grafico del documento:</p>
        <div class="checkbox-group">
          <label class="checkbox-item"><input type="radio" name="pass-pdf-theme" value="print" checked><span class="checkbox-label">Layout di Stampa Classico (Sfondo Bianco)</span></label>
          <label class="checkbox-item"><input type="radio" name="pass-pdf-theme" value="dark"><span class="checkbox-label">Layout ad Alta Leggibilità (Sfondo Nero / Rosa / Verde)</span></label>
        </div>
      `,
      confirmLabel: "📄 GENERA E SALVA PDF",
      onConfirm: () => {
        const isDark = document.querySelector('input[name="pass-pdf-theme"]:checked').value === 'dark';
        PDFEngine.generatePassportPDF({
          totalTrips: stats.totalTrips,
          visitedStatesCount: stats.visitedStatesCount,
          worldPercentage: stats.worldPercentage,
          totalCitiesCount: stats.totalCitiesCount,
          totalSpend: stats.totalSpend.toLocaleString('it-IT'),
          totalSouvenirs: stats.totalSouvenirs,
          mostNorth: geo.mostNorth,
          mostSouth: geo.mostSouth,
          mostEast: geo.mostEast,
          mostWest: geo.mostWest,
          closest: geo.closestToVenice,
          farthest: geo.farthestFromVenice,
          robyEleCount: stats.robyEleCount,
          robyElePercent: stats.robyElePercent,
          ciurmaCount: stats.ciurmaCount,
          ciurmaPercent: stats.ciurmaPercent,
          budgetByCategory: stats.budgetByCategory
        }, isDark);
      }
    });
  },

  openChartModal() {
    const stats = this.getAggregatedData();
    if (stats.totalTrips === 0) {
      App.notify("Nessun dato sufficiente per generare grafici. Aggiungi il tuo primo viaggio nel Diario di bordo per sbloccare le statistiche!");
      return;
    }

    App.showModal({
      title: "GENERA GRAFICO STATISTICO",
      bodyHtml: `
        <div class="form-group">
          <label class="form-label" for="sel-chart-type">SELEZIONA TIPOLOGIA GRAFICO</label>
          <select id="sel-chart-type" class="form-control" onchange="PassaportoModule.renderGeneratedChart(this.value)">
            <option value="mezzi">1. Ripartizione Mezzi di Trasporto</option>
            <option value="budget">2. Budget per Categoria di Spesa</option>
            <option value="compagni">3. Compagni di Viaggio (Roby&Ele vs Ciurma)</option>
            <option value="continenti">4. Stati Visitati per Continente</option>
          </select>
        </div>

        <div class="canvas-frame">
          <canvas id="passport-export-chart" width="400" height="260" class="canvas-element"></canvas>
        </div>

        <div id="chart-accessible-summary" class="sr-only"></div>
      `,
      confirmLabel: "💾 SCARICA IMMAGINE (JPEG)",
      onConfirm: () => {
        const canvas = document.getElementById('passport-export-chart');
        if (canvas) {
          const link = document.createElement('a');
          link.download = `Grafico_MottoOnTour_${Date.now()}.jpg`;
          link.href = canvas.toDataURL('image/jpeg', 0.95);
          link.click();
        }
      }
    });

    setTimeout(() => this.renderGeneratedChart('mezzi'), 50);
  },

  renderGeneratedChart(type) {
    const canvas = document.getElementById('passport-export-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const stats = this.getAggregatedData();

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    let items = [];
    let title = "";

    if (type === 'mezzi') {
      title = "RIPARTIZIONE MEZZI DI TRASPORTO";
      items = Object.entries(stats.transportCounts).map(([label, count]) => ({ label, value: count }));
    } else if (type === 'budget') {
      title = "BUDGET PER CATEGORIA";
      items = CONFIG.EXPENSE_CATEGORIES.map(c => ({ label: c.label, value: stats.budgetByCategory[c.key] || 0 })).filter(i => i.value > 0);
    } else if (type === 'compagni') {
      title = "COMPAGNI DI VIAGGIO";
      items = [
        { label: "Roby & Ele", value: stats.robyEleCount },
        { label: "Con la Ciurma", value: stats.ciurmaCount }
      ].filter(i => i.value > 0);
    } else if (type === 'continenti') {
      title = "STATI PER CONTINENTE";
      const contMap = {};
      stats.visitedStatesMap.forEach((_, st) => {
        const c = GeoUtils.getContinent(st);
        contMap[c] = (contMap[c] || 0) + 1;
      });
      items = Object.entries(contMap).map(([label, value]) => ({ label, value }));
    }

    // Sort items in descending order of value
    items.sort((a, b) => b.value - a.value);

    const total = items.reduce((sum, i) => sum + i.value, 0);

    // Title
    ctx.fillStyle = '#FF80BF';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, w / 2, 20);

    if (total === 0) {
      ctx.fillStyle = '#00FFA3';
      ctx.fillText('Nessun dato disponibile', w / 2, h / 2);
      return;
    }

    const colors = CONFIG.CHART_PALETTE || ['#FF80BF', '#00FFA3', '#00BFFF', '#FAFF00', '#FF5500', '#FFFFFF', '#8D5524', '#00E5D8'];
    let startAngle = 0;
    const centerX = w * 0.30;
    const centerY = h * 0.55;
    const radius = 68;

    items.forEach((item, idx) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      ctx.fillStyle = colors[idx % colors.length];
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();

      startAngle += sliceAngle;
    });

    // Legend
    const rowHeight = items.length > 6 ? 18 : 22;
    const fontSize = items.length > 6 ? '10px sans-serif' : '11px sans-serif';
    ctx.font = fontSize;
    ctx.textAlign = 'left';
    const startY = Math.max(36, (h * 0.55) - ((items.length * rowHeight) / 2) + (rowHeight / 2));

    items.forEach((item, idx) => {
      const ly = startY + idx * rowHeight;
      const shortLabel = CONFIG.shortenChartLabel ? CONFIG.shortenChartLabel(item.label) : item.label;
      ctx.fillStyle = colors[idx % colors.length];
      ctx.fillRect(w * 0.58, ly - 8, 9, 9);
      ctx.fillStyle = '#00FFA3';
      const pct = ((item.value / total) * 100).toFixed(0);
      ctx.fillText(`${shortLabel} (${pct}%)`, w * 0.58 + 13, ly);
    });

    // Frame
    ctx.strokeStyle = '#FF80BF';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, w, h);
  }
};
