// ==========================================================================
// MODULO 05: DIARIO DI BORDO - STORICO E MEMORIE DEI VIAGGI CONCLUSI
// ==========================================================================

const DiarioModule = {
  currentView: 'home', // 'home', 'see_all', 'detail', 'form'
  activeTripId: null,
  activeCategory: 'Viaggio aereo',
  activeFilter: 'all', // 'all', 'year', 'roby_ele', 'ciurma', 'budget'
  previousModule: 'diario',

  render(container) {
    if (this.currentView === 'detail') {
      this.renderDetail(container);
    } else if (this.currentView === 'form') {
      this.renderForm(container);
    } else if (this.currentView === 'see_all') {
      this.renderSeeAll(container);
    } else {
      this.renderHome(container);
    }
  },

  renderHome(container) {
    const trips = API.data[CONFIG.SHEETS.DIARIO] || [];

    container.innerHTML = `
      <div class="action-bar" style="justify-content: space-between;">
        <h1 id="screen-title" tabindex="-1">DIARIO DI BORDO</h1>
        <button class="btn btn-primary" onclick="DiarioModule.openNewTripForm()">
          <span aria-hidden="true">➕ </span>AGGIUNGI VIAGGIO
        </button>
      </div>

      <p style="color: var(--pink-light); margin-bottom: 16px;">
        Storico definitivo, ricordi, mappe di rotta e memorie di viaggio.
      </p>

      ${CONFIG.TRIP_TYPES.map(cat => {
        const catTrips = trips.filter(t => (t.Tipologia_Viaggio || 'Altro').toLowerCase() === cat.toLowerCase());
        // Sort most recent first
        const sorted = [...catTrips].sort((a, b) => {
          const yearA = parseInt(a.Anno_Viaggio || (a.Data_Inizio_Globale ? a.Data_Inizio_Globale.split('-')[0] : '0')) || 0;
          const yearB = parseInt(b.Anno_Viaggio || (b.Data_Inizio_Globale ? b.Data_Inizio_Globale.split('-')[0] : '0')) || 0;
          return yearB - yearA;
        });
        const preview = sorted.slice(0, 3);

        return `
          <section class="card" aria-labelledby="heading-cat-${cat.replace(/\s+/g, '-')}">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h2 id="heading-cat-${cat.replace(/\s+/g, '-')}" style="margin: 0; border: none;">${cat} (${catTrips.length})</h2>
              ${catTrips.length > 0 ? `
                <button class="btn btn-sm btn-pink" onclick="DiarioModule.openSeeAll('${cat}')">
                  VEDI TUTTI <span aria-hidden="true">➔</span>
                </button>
              ` : ''}
            </div>

            <div style="margin-top: 12px;">
              ${preview.length > 0 ? `
                <div class="trips-list">
                  ${preview.map(t => {
                    const dStart = CONFIG.formatDateDisplay(t.Data_Inizio_Globale);
                    const dEnd = CONFIG.formatDateDisplay(t.Data_Fine_Globale);
                    const dateText = dStart && dEnd ? `Dal ${dStart} al ${dEnd}` : (dStart ? `Data ${dStart}` : (t.Anno_Viaggio ? `Anno ${t.Anno_Viaggio}` : ''));
                    const badgeHtml = GeoUtils.getIntensityBadgeHtml(t);
                    const intensityAria = GeoUtils.getIntensityAriaLabel(t);
                    return `
                      <button type="button" class="card card-mint card-interactive card-btn" onclick="DiarioModule.openTripDetails('${t.ID_Viaggio}', 'diario')" aria-label="Scheda viaggio: ${t.Nome_Viaggio}. ${dateText}. ${intensityAria}. ${t.Stati ? `Stati: ${t.Stati.replace(/\n/g, ', ')}.` : ''} Tocca due volte per aprire i dettagli del viaggio.">
                        <div aria-hidden="true">
                          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
                            <h3 style="color: var(--mint); margin: 0;">${t.Nome_Viaggio}</h3>
                            ${badgeHtml}
                          </div>
                          <p style="color: #ccc; font-size: 0.9rem; margin-top: 4px;">
                            📅 ${dStart && dEnd ? `${dStart} -> ${dEnd}` : (t.Anno_Viaggio || dStart || '')}
                            ${t.Stati ? ` | 📍 ${t.Stati.replace(/\n/g, ', ')}` : ''}
                          </p>
                        </div>
                      </button>
                    `;
                  }).join('')}
                </div>
              ` : `
                <p style="color: var(--text-muted); font-size: 0.9rem;">Nessun viaggio registrato in questa categoria.</p>
              `}
            </div>
          </section>
        `;
      }).join('')}
    `;
  },

  openNewTripForm() {
    this.activeTripId = null;
    this.currentView = 'form';
    App.currentModule = 'diario';
    App.render();
  },

  openTripDetails(tripId, previousModule = 'diario') {
    this.activeTripId = tripId;
    this.previousModule = previousModule;
    this.currentView = 'detail';
    App.currentModule = 'diario';
    App.render();
  },

  openSeeAll(category) {
    this.activeCategory = category;
    this.activeFilter = 'all';
    this.currentView = 'see_all';
    App.currentModule = 'diario';
    App.render();
  },

  renderSeeAll(container) {
    const trips = API.data[CONFIG.SHEETS.DIARIO] || [];
    let catTrips = trips.filter(t => (t.Tipologia_Viaggio || 'Altro').toLowerCase() === this.activeCategory.toLowerCase());

    // Apply Filter
    if (this.activeFilter === 'year') {
      catTrips.sort((a, b) => {
        const yearA = parseInt(a.Anno_Viaggio || (a.Data_Inizio_Globale ? a.Data_Inizio_Globale.split('-')[0] : '0')) || 0;
        const yearB = parseInt(b.Anno_Viaggio || (b.Data_Inizio_Globale ? b.Data_Inizio_Globale.split('-')[0] : '0')) || 0;
        return yearB - yearA;
      });
    } else if (this.activeFilter === 'roby_ele') {
      catTrips = catTrips.filter(t => !String(t.Compagni_Viaggio || '').trim());
    } else if (this.activeFilter === 'ciurma') {
      catTrips = catTrips.filter(t => String(t.Compagni_Viaggio || '').trim().length > 0);
    } else if (this.activeFilter === 'budget') {
      catTrips.sort((a, b) => {
        let sumA = 0, sumB = 0;
        CONFIG.EXPENSE_CATEGORIES.forEach(c => {
          sumA += Number(a[c.key] || 0);
          sumB += Number(b[c.key] || 0);
        });
        return sumB - sumA;
      });
    }

    container.innerHTML = `
      <div class="action-bar">
        <button class="btn btn-sm btn-pink" onclick="DiarioModule.currentView='home'; App.render();">
          <span aria-hidden="true">⬅️ </span>TORNA AL DIARIO
        </button>
      </div>

      <h1 id="screen-title" tabindex="-1">${this.activeCategory.toUpperCase()} - TUTTI I VIAGGI</h1>

      <div class="filter-bar" role="toolbar" aria-label="Filtri categoria viaggi">
        <button class="filter-btn ${this.activeFilter === 'all' ? 'active' : ''}" onclick="DiarioModule.setFilter('all')">TUTTI</button>
        <button class="filter-btn ${this.activeFilter === 'year' ? 'active' : ''}" onclick="DiarioModule.setFilter('year')">PER ANNO</button>
        <button class="filter-btn ${this.activeFilter === 'roby_ele' ? 'active' : ''}" onclick="DiarioModule.setFilter('roby_ele')">ROBY & ELE</button>
        <button class="filter-btn ${this.activeFilter === 'ciurma' ? 'active' : ''}" onclick="DiarioModule.setFilter('ciurma')">CON LA CIURMA!</button>
        <button class="filter-btn ${this.activeFilter === 'budget' ? 'active' : ''}" onclick="DiarioModule.setFilter('budget')">PER BUDGET</button>
      </div>

      ${catTrips.length > 0 ? `
        <div class="trips-list">
          ${catTrips.map(t => {
            let totalBudget = 0;
            CONFIG.EXPENSE_CATEGORIES.forEach(c => totalBudget += Number(t[c.key] || 0));
            const dStart = CONFIG.formatDateDisplay(t.Data_Inizio_Globale);
            const dEnd = CONFIG.formatDateDisplay(t.Data_Fine_Globale);
            const dateText = dStart && dEnd ? `Dal ${dStart} al ${dEnd}` : (dStart ? `Data ${dStart}` : (t.Anno_Viaggio || '-'));
            const badgeHtml = GeoUtils.getIntensityBadgeHtml(t);
            const intensityAria = GeoUtils.getIntensityAriaLabel(t);
            return `
              <button type="button" class="card card-mint card-interactive card-btn" onclick="DiarioModule.openTripDetails('${t.ID_Viaggio}', 'diario')" aria-label="Scheda viaggio: ${t.Nome_Viaggio}. ${dateText}. ${intensityAria}. ${totalBudget > 0 ? `Spesa: ${totalBudget} Euro.` : ''} Tocca due volte per aprire i dettagli del viaggio.">
                <div aria-hidden="true">
                  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
                    <h2 style="color: var(--mint); margin: 0; border: none;">${t.Nome_Viaggio}</h2>
                    <div style="display: flex; gap: 6px; align-items: center;">
                      ${badgeHtml}
                      ${totalBudget > 0 ? `<span class="stat-value" style="font-size: 0.95rem;">€ ${totalBudget.toLocaleString('it-IT')}</span>` : ''}
                    </div>
                  </div>
                  <p style="color: #ccc; margin-top: 6px;">
                    📅 ${dStart && dEnd ? `Dal ${dStart} al ${dEnd}` : (t.Anno_Viaggio || dStart || '-')}
                    ${t.Stati ? ` | 📍 ${t.Stati.replace(/\n/g, ', ')}` : ''}
                    ${t.Compagni_Viaggio ? ` | 👥 ${t.Compagni_Viaggio.replace(/\n/g, ', ')}` : ''}
                  </p>
                </div>
              </button>
            `;
          }).join('')}
        </div>
      ` : `
        <div class="empty-state">
          <p class="empty-state-text">Nessun viaggio corrisponde al filtro selezionato.</p>
        </div>
      `}
    `;
  },

  setFilter(filter) {
    this.activeFilter = filter;
    App.render();
  },

  renderDetail(container) {
    const trips = API.data[CONFIG.SHEETS.DIARIO] || [];
    const trip = trips.find(t => t.ID_Viaggio === this.activeTripId);

    if (!trip) {
      this.currentView = 'home';
      this.render(container);
      return;
    }

    // Check budget expenses count
    const activeExpenses = [];
    CONFIG.EXPENSE_CATEGORIES.forEach(cat => {
      const val = Number(trip[cat.key] || 0);
      if (val > 0) activeExpenses.push({ label: cat.label, amount: val });
    });

    const isCruise = String(trip.Tipologia_Viaggio || '').toLowerCase().includes('crociera');
    const citiesList = String(trip.Citta || '').split('\n').map(c => c.trim()).filter(Boolean);

    const dStart = CONFIG.formatDateDisplay(trip.Data_Inizio_Globale);
    const dEnd = CONFIG.formatDateDisplay(trip.Data_Fine_Globale);
    const datesHeading = dStart && dEnd ? `DAL ${dStart} AL ${dEnd}` : (dStart ? `DATA ${dStart}` : (trip.Anno_Viaggio ? `ANNO ${trip.Anno_Viaggio}` : ''));
    const badgeLarge = GeoUtils.getIntensityBadgeHtml(trip, true);

    const backButtonHtml = this.previousModule === 'passaporto'
      ? `<button class="btn btn-sm btn-pink" onclick="PassaportoModule.openCategory('geografia'); App.navigate('passaporto');"><span aria-hidden="true">⬅️ </span>TORNA A GEOGRAFIA</button>`
      : (this.previousModule === 'home'
        ? `<button class="btn btn-sm btn-pink" onclick="App.navigate('home');"><span aria-hidden="true">⬅️ </span>TORNA ALLA HOME</button>`
        : `<button class="btn btn-sm btn-pink" onclick="DiarioModule.currentView='home'; App.render();"><span aria-hidden="true">⬅️ </span>INDIETRO</button>`);

    // Strutturazione Souvenir
    const starbucksList = String(trip.Souvenir_Starbucks || '').split('\n').map(s => s.trim()).filter(Boolean);
    const pandoraList = String(trip.Souvenir_Pandora || '').split('\n').map(s => s.trim()).filter(Boolean);
    const riproduzioniList = String(trip.Souvenir_Riproduzioni || '').split('\n').map(s => s.trim()).filter(Boolean);
    const genericSouvenirList = String(trip.Souvenir || '').split('\n').map(s => s.trim()).filter(Boolean);

    // Strutturazione Esperienze
    const torriList = String(trip.Esperienze_Torri || '').split('\n').map(s => s.trim()).filter(Boolean);
    const ruoteList = String(trip.Esperienze_Ruote || '').split('\n').map(s => s.trim()).filter(Boolean);
    const catCaffeList = String(trip.Esperienze_CatCaffe || '').split('\n').map(s => s.trim()).filter(Boolean);
    const genericEspList = String(trip.Esperienze_Luoghi || '').split('\n').map(s => s.trim()).filter(Boolean);

    container.innerHTML = `
      <div class="action-bar">
        ${backButtonHtml}
        <button class="btn btn-sm btn-primary" onclick="DiarioModule.currentView='form'; App.render();">
          <span aria-hidden="true">✏️ </span>MODIFICA
        </button>
        <button class="btn btn-sm btn-danger" onclick="DiarioModule.confirmDeleteTrip('${trip.ID_Viaggio}')">
          <span aria-hidden="true">🗑️ </span>ELIMINA
        </button>
        <button class="btn btn-sm btn-primary" onclick="DiarioModule.openPdfModal()">
          <span aria-hidden="true">📄 </span>GENERA PDF
        </button>
      </div>

      <h1 id="screen-title" tabindex="-1" style="margin-bottom: 4px;">${trip.Nome_Viaggio}</h1>
      <p style="color: var(--pink-light); font-weight: 700; margin-bottom: 8px;">
        ${datesHeading}
      </p>

      <!-- BOLLINO INTENSITÀ VIAGGIO (SCALA 1-10) -->
      <div style="margin-bottom: 16px;">
        ${badgeLarge}
      </div>

      <!-- MAPPA DINAMICA DEL VIAGGIO -->
      <section class="card">
        <h2>MAPPA DEL VIAGGIO</h2>
        <div id="trip-route-map" class="map-container" style="height: 340px;" aria-hidden="true"></div>
        <p style="color: var(--mint); font-size: 0.9rem;">
          ${(isCruise && (trip.Tipologia_Viaggio || '').toLowerCase() === 'crociera') ? '🚢 Rotta Crociera con linea rosa tratteggiata tra le tappe' : '📍 Spilli verde menta sulle città visitate'}
        </p>
        <div class="sr-only">
          Tappe visitate: ${citiesList.join(', ')}
        </div>
      </section>

      <!-- GRUPPO 1 & 2: DATI GENERALI E LOGISTICA -->
      <section class="card">
        <h2>DATI GENERALI E LOGISTICA</h2>
        <div class="table-responsive">
          <table class="table-closed">
            <tbody>
              <tr><th scope="row" style="width: 35%;">STATI VISITATI</th><td>${(trip.Stati || '-').replace(/\n/g, '<br>')}</td></tr>
              <tr><th scope="row">CITTÀ / TAPPE</th><td>${(trip.Citta || '-').replace(/\n/g, '<br>')}</td></tr>
              <tr><th scope="row">DATE VIAGGIO</th><td>${dStart && dEnd ? `${dStart} -> ${dEnd}` : (dStart || trip.Anno_Viaggio || '-')}</td></tr>
              <tr><th scope="row">TIPOLOGIA VIAGGIO</th><td>${trip.Tipologia_Viaggio || '-'}</td></tr>
              <tr><th scope="row">MEZZI UTILIZZATI</th><td>${trip.Mezzi_Usati || '-'} ${trip.Specifiche_Mezzo_Altro ? `(${trip.Specifiche_Mezzo_Altro})` : ''}</td></tr>
              <tr><th scope="row">COMPAGNIE / VETTORI</th><td>${(trip.Compagnie_Vettori || '-').replace(/\n/g, '<br>')}</td></tr>
              <tr><th scope="row">SCOPO DEL VIAGGIO</th><td>${trip.Scopo_Viaggio || '-'} ${trip.Specifiche_Scopo_Altro ? `(${trip.Specifiche_Scopo_Altro})` : ''}</td></tr>
              <tr><th scope="row">COMPAGNI DI VIAGGIO</th><td>${(trip.Compagni_Viaggio || '-').replace(/\n/g, '<br>')}</td></tr>
              <tr><th scope="row">CARTELLA DRIVE</th><td>${trip.Link_Cartella_Drive ? `<a href="${trip.Link_Cartella_Drive}" target="_blank" rel="noopener" style="color: var(--mint); word-break: break-all;">${trip.Link_Cartella_Drive}</a>` : '-'}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- GRUPPO 3: DETTAGLIO BUDGET -->
      <section class="card">
        <h2>DETTAGLIO BUDGET E SPESE</h2>
        ${activeExpenses.length > 0 ? `
          <div class="table-responsive">
            <table class="table-closed">
              <tbody>
                ${activeExpenses.map(e => `<tr><th scope="row" style="width: 50%;">${e.label}</th><td>€ ${e.amount.toLocaleString('it-IT')}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>

          ${activeExpenses.length >= 2 ? `
            <h3>GRAFICO SPESE</h3>
            <div class="canvas-frame">
              <canvas id="trip-budget-pie" width="360" height="240" class="canvas-element" aria-label="Grafico a torta delle spese di viaggio"></canvas>
            </div>
            <div class="sr-only">
              ${activeExpenses.map(e => `${e.label}: € ${e.amount}`).join(', ')}
            </div>
          ` : ''}
        ` : `
          <p style="color: var(--text-muted);">Nessuna spesa archiviata per questo viaggio.</p>
        `}
      </section>

      <!-- GRUPPO 4: ESPERIENZE E MEMORIE -->
      <section class="card">
        <h2>ESPERIENZE E MEMORIE DEL VIAGGIO</h2>
        <div class="table-responsive">
          <table class="table-closed">
            <tbody>
              ${starbucksList.length > 0 ? `<tr><th scope="row" style="width: 35%;">☕ TAZZINE STARBUCKS</th><td>${starbucksList.join('<br>')}</td></tr>` : ''}
              ${pandoraList.length > 0 ? `<tr><th scope="row">💎 CHARM PANDORA</th><td>${pandoraList.join('<br>')}</td></tr>` : ''}
              ${riproduzioniList.length > 0 ? `<tr><th scope="row">🏛️ RIPRODUZIONI STORICHE</th><td>${riproduzioniList.join('<br>')}</td></tr>` : ''}
              ${genericSouvenirList.length > 0 ? `<tr><th scope="row">🛍️ ALTRI SOUVENIR</th><td>${genericSouvenirList.join('<br>')}</td></tr>` : ''}
              ${torriList.length > 0 ? `<tr><th scope="row">🗼 TORRI PANORAMICHE</th><td>${torriList.join('<br>')}</td></tr>` : ''}
              ${ruoteList.length > 0 ? `<tr><th scope="row">🎡 RUOTE PANORAMICHE</th><td>${ruoteList.join('<br>')}</td></tr>` : ''}
              ${catCaffeList.length > 0 ? `<tr><th scope="row">🐱 CAT CAFFÈ</th><td>${catCaffeList.join('<br>')}</td></tr>` : ''}
              ${genericEspList.length > 0 ? `<tr><th scope="row">✨ ALTRE ESPERIENZE</th><td>${genericEspList.join('<br>')}</td></tr>` : ''}
              <tr><th scope="row">MOMENTI DA RICORDARE</th><td>${(trip.Momenti_Da_Ricordare || '-').replace(/\n/g, '<br>')}</td></tr>
              <tr><th scope="row">LINK PODCAST</th><td>${(trip.Link_Podcast || '-').replace(/\n/g, '<br>')}</td></tr>
              <tr><th scope="row">NOTE VARIE</th><td>${(trip.Note_Varie || '-').replace(/\n/g, '<br>')}</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    `;

    // Draw route map and pie chart
    setTimeout(() => {
      this.drawTripMap(citiesList, isCruise, trip.Tipologia_Viaggio);
      if (activeExpenses.length >= 2) {
        this.drawBudgetPie(activeExpenses);
      }
    }, 50);
  },

  drawTripMap(cities, isCruise, tripType = '') {
    GeoUtils.renderTripRouteMap('trip-route-map', cities, isCruise, tripType);
  },

  drawBudgetPie(expenses) {
    const canvas = document.getElementById('trip-budget-pie');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    const sortedExpenses = [...expenses].sort((a, b) => b.amount - a.amount);
    const total = sortedExpenses.reduce((sum, e) => sum + e.amount, 0);
    if (total === 0) return;

    const colors = CONFIG.CHART_PALETTE || ['#FF80BF', '#00FFA3', '#00BFFF', '#FAFF00', '#FF5500', '#FFFFFF', '#8D5524', '#00E5D8'];
    let startAngle = 0;
    const centerX = w * 0.32;
    const centerY = h * 0.5;
    const radius = Math.min(centerX, centerY) - 15;

    sortedExpenses.forEach((e, idx) => {
      const sliceAngle = (e.amount / total) * 2 * Math.PI;
      ctx.fillStyle = colors[idx % colors.length];
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();

      startAngle += sliceAngle;
    });

    // Draw Legend
    const rowHeight = sortedExpenses.length > 5 ? 18 : 22;
    const fontSize = sortedExpenses.length > 5 ? '10px sans-serif' : '11px sans-serif';
    ctx.font = fontSize;
    ctx.textAlign = 'left';
    const startY = Math.max(25, (h / 2) - ((sortedExpenses.length * rowHeight) / 2) + (rowHeight / 2));

    sortedExpenses.forEach((e, idx) => {
      const legendY = startY + idx * rowHeight;
      const shortLabel = CONFIG.shortenChartLabel ? CONFIG.shortenChartLabel(e.label) : e.label;
      ctx.fillStyle = colors[idx % colors.length];
      ctx.fillRect(w * 0.62, legendY - 8, 9, 9);
      ctx.fillStyle = '#00FFA3';
      const pct = ((e.amount / total) * 100).toFixed(0);
      ctx.fillText(`${shortLabel} (${pct}%)`, w * 0.62 + 14, legendY);
    });
  },

  // Raccoglie l'elenco completo e unificato di tutte le compagnie salvate nel database
  getAllAvailableCarriers() {
    const defaultList = [...(CONFIG.DEFAULT_CARRIERS || [])];
    const carrierSet = new Set(defaultList);

    const trips = API.data[CONFIG.SHEETS.DIARIO] || [];
    trips.forEach(t => {
      if (t.Compagnie_Vettori) {
        String(t.Compagnie_Vettori).split('\n').map(c => c.trim()).filter(Boolean).forEach(c => {
          const norm = CONFIG.normalizeCarrierName(c);
          if (norm) carrierSet.add(norm);
        });
      }
    });

    return Array.from(carrierSet).sort((a, b) => a.localeCompare(b, 'it', { sensitivity: 'base' }));
  },

  // Selezione assistita compagnia con inserimento automatico linea per linea
  selectCompanyFromDropdown(val) {
    if (!val) return;
    const normalized = CONFIG.normalizeCarrierName(val);
    const textarea = document.getElementById('dia-compagnie');
    if (!textarea) return;

    const currentLines = textarea.value.split('\n').map(l => l.trim()).filter(Boolean);
    if (!currentLines.some(l => l.toLowerCase() === normalized.toLowerCase())) {
      currentLines.push(normalized);
      textarea.value = currentLines.join('\n');
      SoundFX.playClick();
      App.notify(`Compagnia "${normalized}" aggiunta.`);
    } else {
      App.notify(`La compagnia "${normalized}" è già presente nella lista.`);
    }

    // Reset del menu a tendina
    const select = document.getElementById('dia-compagnia-select');
    if (select) select.value = '';
  },

  renderForm(container) {
    const trips = API.data[CONFIG.SHEETS.DIARIO] || [];
    const trip = this.activeTripId ? (trips.find(t => t.ID_Viaggio === this.activeTripId) || {}) : {};
    const carriersList = this.getAllAvailableCarriers();

    container.innerHTML = `
      <form id="form-diario" onsubmit="DiarioModule.handleSave(event)">
        <div class="action-bar" style="justify-content: space-between;">
          <button type="button" class="btn btn-sm btn-pink" onclick="DiarioModule.currentView = DiarioModule.activeTripId ? 'detail' : 'home'; App.render();">
            <span aria-hidden="true">⬅️ </span>ANNULLA
          </button>
          <button type="submit" class="btn btn-sm btn-primary">
            <span aria-hidden="true">💾 </span>SALVA VIAGGIO
          </button>
        </div>

        <h1 id="screen-title" tabindex="-1">${this.activeTripId ? 'MODIFICA VIAGGIO' : 'AGGIUNGI VIAGGIO NEL DIARIO'}</h1>

        <!-- GRUPPO 1: DATI GENERALI -->
        <fieldset class="card">
          <legend><h2>GRUPPO 1: DATI GENERALI E IDENTIFICATIVI</h2></legend>

          <div class="form-group">
            <label class="form-label" for="dia-nome">NOME VIAGGIO *</label>
            <input type="text" id="dia-nome" class="form-control" value="${trip.Nome_Viaggio || ''}" required placeholder="es. Crociera Fiordi Norvegesi">
          </div>

          <div class="form-group">
            <label class="form-label" for="dia-anno">ANNO VIAGGIO</label>
            <input type="text" id="dia-anno" class="form-control" value="${trip.Anno_Viaggio || new Date().getFullYear()}" placeholder="es. 2026 o 2025/2026">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label" for="dia-data-inizio">DATA INIZIO</label>
              <input type="date" id="dia-data-inizio" class="form-control" value="${trip.Data_Inizio_Globale || ''}" ${trip.Data_Fine_Globale ? `max="${trip.Data_Fine_Globale}"` : ''} onchange="DiarioModule.handleDateChange()" aria-label="Data inizio viaggio">
            </div>
            <div class="form-group">
              <label class="form-label" for="dia-data-fine">DATA RITORNO</label>
              <input type="date" id="dia-data-fine" class="form-control" value="${trip.Data_Fine_Globale || ''}" ${trip.Data_Inizio_Globale ? `min="${trip.Data_Inizio_Globale}"` : ''} onchange="DiarioModule.handleDateChange()" aria-label="Data ritorno viaggio">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="dia-stati">STATI (UNO PER RIGA)</label>
            <textarea id="dia-stati" class="form-control" placeholder="es. Norvegia&#10;Danimarca">${trip.Stati || ''}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label" for="dia-citta">CITTÀ / TAPPE (UNA PER RIGA)</label>
            <p style="color: var(--pink-light); font-size: 0.85rem; margin-top: 2px; margin-bottom: 6px;">
              💡 <em>Per crociere o tour multi-stato, puoi specificare lo stato a fianco tra parentesi (es. Savona, Marsiglia, Cadice (Spagna), Las Palmas (Spagna)).</em>
            </p>
            <textarea id="dia-citta" class="form-control" placeholder="es. Savona&#10;Marsiglia&#10;Barcellona&#10;Cadice (Spagna)&#10;Las Palmas (Spagna)">${trip.Citta || ''}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label" for="dia-drive">LINK CARTELLA DRIVE</label>
            <input type="url" id="dia-drive" class="form-control raw-case" value="${trip.Link_Cartella_Drive || ''}" placeholder="es. https://drive.google.com/drive/folders/...">
          </div>
        </fieldset>

        <!-- GRUPPO 2: LOGISTICA E TIPOLOGIA -->
        <fieldset class="card">
          <legend><h2>GRUPPO 2: LOGISTICA E TIPOLOGIA</h2></legend>

          <div class="form-group">
            <label class="form-label">PRINCIPALI MEZZI USATI</label>
            <div class="checkbox-group">
              ${CONFIG.TRANSPORT_OPTIONS.map(opt => `
                <label class="checkbox-item">
                  <input type="checkbox" name="dia-mezzi" value="${opt}" ${(trip.Mezzi_Usati || '').includes(opt) ? 'checked' : ''} onchange="DiarioModule.toggleMezziAltro()">
                  <span class="checkbox-label">${opt}</span>
                </label>
              `).join('')}
            </div>
            <div id="grp-mezzi-altro" style="display: ${(trip.Mezzi_Usati || '').includes('Altro') || (trip.Mezzi_Usati || '').includes('Nave') ? 'block' : 'none'}; margin-top: 8px;">
              <label class="form-label" for="dia-mezzi-altro">SPECIFICHE MEZZI / ALTRO (UNO PER RIGA)</label>
              <textarea id="dia-mezzi-altro" class="form-control" placeholder="es. Mezzo insolito&#10;Altro mezzo (uno per riga)">${trip.Specifiche_Mezzo_Altro || ''}</textarea>
            </div>
          </div>

          <!-- GESTIONE COMPAGNIE E VETTORI CON MENU A TENDINA E TEXTAREA -->
          <div class="form-group">
            <label class="form-label" for="dia-compagnia-select">SELEZIONA COMPAGNIA PRECARICATA</label>
            <select id="dia-compagnia-select" class="form-control" onchange="DiarioModule.selectCompanyFromDropdown(this.value)">
              <option value="">➕ Scegli una compagnia da aggiungere alla lista...</option>
              ${carriersList.map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>
            
            <label class="form-label" for="dia-compagnie" style="margin-top: 10px;">COMPAGNIE E VETTORI DEL VIAGGIO (UNA PER RIGA)</label>
            <textarea id="dia-compagnie" class="form-control" placeholder="es. Costa Crociere&#10;Trenitalia&#10;Ryanair">${trip.Compagnie_Vettori || ''}</textarea>
            <small style="color: var(--pink-light); display: block; margin-top: 4px;">Puoi selezionare le compagnie dal menu o scriverle liberamente una per riga.</small>
          </div>

          <div class="form-group">
            <label class="form-label" for="dia-tipo">TIPOLOGIA VIAGGIO</label>
            <select id="dia-tipo" class="form-control" aria-label="Tipologia viaggio">
              ${CONFIG.TRIP_TYPES.map(t => `<option value="${t}" ${trip.Tipologia_Viaggio === t ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">SCOPO DEL VIAGGIO</label>
            <div class="checkbox-group">
              ${CONFIG.TRIP_SCOPES.map(sc => `
                <label class="checkbox-item">
                  <input type="checkbox" name="dia-scopo" value="${sc}" ${(trip.Scopo_Viaggio || '').includes(sc) ? 'checked' : ''} onchange="DiarioModule.toggleScopoAltro()">
                  <span class="checkbox-label">${sc}</span>
                </label>
              `).join('')}
            </div>
            <input type="text" id="dia-scopo-altro" class="form-control" style="margin-top: 8px; display: ${(trip.Scopo_Viaggio || '').includes('Altro') ? 'block' : 'none'};" value="${trip.Specifiche_Scopo_Altro || ''}" placeholder="es. Anniversario o Evento speciale">
          </div>

          <div class="form-group">
            <label class="form-label" for="dia-compagni">COMPAGNI DI VIAGGIO (UNO PER RIGA)</label>
            <textarea id="dia-compagni" class="form-control" placeholder="es. Marco&#10;Chiara">${trip.Compagni_Viaggio || ''}</textarea>
            <small style="color: var(--pink-light); display: block; margin-top: 4px;">Lascia vuoto se il viaggio è stato effettuato esclusivamente da Roberto ed Elena.</small>
          </div>
        </fieldset>

        <!-- GRUPPO 3: DETTAGLIO BUDGET -->
        <fieldset class="card">
          <legend><h2>GRUPPO 3: DETTAGLIO BUDGET</h2></legend>
          ${CONFIG.EXPENSE_CATEGORIES.map(cat => `
            <div class="form-group">
              <label class="form-label" for="dia-budget-${cat.key}">${cat.label} (€)</label>
              <input type="number" id="dia-budget-${cat.key}" class="form-control" min="0" step="any" value="${trip[cat.key] || ''}" placeholder="es. 0">
            </div>
          `).join('')}
        </fieldset>

        <!-- GRUPPO 4: ESPERIENZE E SOUVENIR DINAMICI -->
        <fieldset class="card">
          <legend><h2>GRUPPO 4: ESPERIENZE E MEMORIE DEL VIAGGIO</h2></legend>

          <!-- SEZIONE SOUVENIR SPECIALI -->
          <div class="form-group">
            <label class="form-label">SOUVENIR SPECIALI COLLEZIONATI</label>
            <div class="checkbox-group">
              <label class="checkbox-item">
                <input type="checkbox" id="chk-souv-starbucks" onchange="DiarioModule.toggleSouvenirSections()" ${Boolean(trip.Souvenir_Starbucks) ? 'checked' : ''}>
                <span class="checkbox-label"><span aria-hidden="true">☕ </span>Starbucks</span>
              </label>
              <label class="checkbox-item">
                <input type="checkbox" id="chk-souv-pandora" onchange="DiarioModule.toggleSouvenirSections()" ${Boolean(trip.Souvenir_Pandora) ? 'checked' : ''}>
                <span class="checkbox-label"><span aria-hidden="true">💎 </span>Pandora</span>
              </label>
              <label class="checkbox-item">
                <input type="checkbox" id="chk-souv-riproduzioni" onchange="DiarioModule.toggleSouvenirSections()" ${Boolean(trip.Souvenir_Riproduzioni) ? 'checked' : ''}>
                <span class="checkbox-label"><span aria-hidden="true">🏛️ </span>Riproduzioni e Modellini</span>
              </label>
            </div>
          </div>

          <div id="grp-souv-starbucks" class="form-group" style="display: ${Boolean(trip.Souvenir_Starbucks) ? 'block' : 'none'};">
            <label class="form-label" for="dia-souv-starbucks">TAZZINE STARBUCKS (UNA PER RIGA)</label>
            <textarea id="dia-souv-starbucks" class="form-control" placeholder="es. Tazza Been There New York&#10;Tazza You Are Here Parigi">${trip.Souvenir_Starbucks || ''}</textarea>
          </div>

          <div id="grp-souv-pandora" class="form-group" style="display: ${Boolean(trip.Souvenir_Pandora) ? 'block' : 'none'};">
            <label class="form-label" for="dia-souv-pandora">CHARM PANDORA (UNO PER RIGA)</label>
            <textarea id="dia-souv-pandora" class="form-control" placeholder="es. Charm Torre Eiffel&#10;Charm Colosseo">${trip.Souvenir_Pandora || ''}</textarea>
          </div>

          <div id="grp-souv-riproduzioni" class="form-group" style="display: ${Boolean(trip.Souvenir_Riproduzioni) ? 'block' : 'none'};">
            <label class="form-label" for="dia-souv-riproduzioni">RIPRODUZIONI E MODELLINI STORICI (UNO PER RIGA)</label>
            <textarea id="dia-souv-riproduzioni" class="form-control" placeholder="es. Modellino Sagrada Familia&#10;Riproduzione Gondola">${trip.Souvenir_Riproduzioni || ''}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label" for="dia-souvenir">ALTRI SOUVENIR RACCOLTI (UNO PER RIGA)</label>
            <textarea id="dia-souvenir" class="form-control" placeholder="es. Calamita Oslo&#10;Poster">${trip.Souvenir || ''}</textarea>
          </div>

          <!-- SEZIONE ESPERIENZE SPECIALI -->
          <div class="form-group" style="margin-top: 18px;">
            <label class="form-label">ATTRAZIONI ED ESPERIENZE SPECIALI</label>
            <div class="checkbox-group">
              <label class="checkbox-item">
                <input type="checkbox" id="chk-esp-torri" onchange="DiarioModule.toggleExperienceSections()" ${Boolean(trip.Esperienze_Torri) ? 'checked' : ''}>
                <span class="checkbox-label"><span aria-hidden="true">🗼 </span>Torri panoramiche</span>
              </label>
              <label class="checkbox-item">
                <input type="checkbox" id="chk-esp-ruote" onchange="DiarioModule.toggleExperienceSections()" ${Boolean(trip.Esperienze_Ruote) ? 'checked' : ''}>
                <span class="checkbox-label"><span aria-hidden="true">🎡 </span>Ruote panoramiche</span>
              </label>
              <label class="checkbox-item">
                <input type="checkbox" id="chk-esp-catcaffe" onchange="DiarioModule.toggleExperienceSections()" ${Boolean(trip.Esperienze_CatCaffe) ? 'checked' : ''}>
                <span class="checkbox-label"><span aria-hidden="true">🐱 </span>Cat caffè</span>
              </label>
            </div>
          </div>

          <div id="grp-esp-torri" class="form-group" style="display: ${Boolean(trip.Esperienze_Torri) ? 'block' : 'none'};">
            <label class="form-label" for="dia-esp-torri">TORRI PANORAMICHE VISITATE (UNA PER RIGA)</label>
            <textarea id="dia-esp-torri" class="form-control" placeholder="es. Torre Eiffel (Parigi)&#10;Tokyo Tower&#10;Torre di Pisa">${trip.Esperienze_Torri || ''}</textarea>
          </div>

          <div id="grp-esp-ruote" class="form-group" style="display: ${Boolean(trip.Esperienze_Ruote) ? 'block' : 'none'};">
            <label class="form-label" for="dia-esp-ruote">RUOTE PANORAMICHE VISITATE (UNA PER RIGA)</label>
            <textarea id="dia-esp-ruote" class="form-control" placeholder="es. London Eye (Londra)&#10;High Roller (Las Vegas)">${trip.Esperienze_Ruote || ''}</textarea>
          </div>

          <div id="grp-esp-catcaffe" class="form-group" style="display: ${Boolean(trip.Esperienze_CatCaffe) ? 'block' : 'none'};">
            <label class="form-label" for="dia-esp-catcaffe">CAT CAFFÈ VISITATI (UNO PER RIGA)</label>
            <textarea id="dia-esp-catcaffe" class="form-control" placeholder="es. Cat Café Neko (Tokyo)&#10;Café des Chats (Parigi)">${trip.Esperienze_CatCaffe || ''}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label" for="dia-esperienze">ALTRE ESPERIENZE E LUOGHI VISITATI</label>
            <textarea id="dia-esperienze" class="form-control" placeholder="es. Museo del Louvre, Parco Tematico...">${trip.Esperienze_Luoghi || ''}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label" for="dia-momenti">MOMENTI DA RICORDARE (RIGA PER RIGA)</label>
            <textarea id="dia-momenti" class="form-control" placeholder="es. Tramonto sul fiordo di Geiranger&#10;Serata di gala">${trip.Momenti_Da_Ricordare || ''}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label" for="dia-podcast">LINK PODCAST (UNO PER RIGA)</label>
            <textarea id="dia-podcast" class="form-control raw-case" placeholder="es. https://open.spotify.com/episode/...">${trip.Link_Podcast || ''}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label" for="dia-note">NOTE VARIE E RIFLESSIONI</label>
            <textarea id="dia-note" class="form-control" placeholder="es. Appunti, impressioni ed emozioni generali...">${trip.Note_Varie || ''}</textarea>
          </div>
        </fieldset>

        <div class="action-bar" style="justify-content: flex-end; margin-top: 16px;">
          <button type="submit" class="btn btn-primary btn-block">
            <span aria-hidden="true">💾 </span>CONFERMA E SALVA NEL DIARIO
          </button>
        </div>
      </form>
    `;
  },

  toggleMezziAltro() {
    const checked = Array.from(document.querySelectorAll('input[name="dia-mezzi"]:checked')).map(el => el.value);
    const grp = document.getElementById('grp-mezzi-altro');
    const input = document.getElementById('dia-mezzi-altro');
    if (!grp) return;
    const needsInput = checked.some(v => v.includes('Nave') || v.includes('Altro'));
    if (needsInput) {
      grp.style.display = 'block';
    } else {
      grp.style.display = 'none';
      if (input) input.value = '';
    }
  },

  toggleScopoAltro() {
    const checked = Array.from(document.querySelectorAll('input[name="dia-scopo"]:checked')).map(el => el.value);
    const input = document.getElementById('dia-scopo-altro');
    if (!input) return;
    if (checked.some(v => v.includes('Altro'))) {
      input.style.display = 'block';
    } else {
      input.style.display = 'none';
      input.value = '';
    }
  },

  toggleSouvenirSections() {
    const chkStarbucks = document.getElementById('chk-souv-starbucks');
    const grpStarbucks = document.getElementById('grp-souv-starbucks');
    if (grpStarbucks && chkStarbucks) {
      grpStarbucks.style.display = chkStarbucks.checked ? 'block' : 'none';
    }

    const chkPandora = document.getElementById('chk-souv-pandora');
    const grpPandora = document.getElementById('grp-souv-pandora');
    if (grpPandora && chkPandora) {
      grpPandora.style.display = chkPandora.checked ? 'block' : 'none';
    }

    const chkRipr = document.getElementById('chk-souv-riproduzioni');
    const grpRipr = document.getElementById('grp-souv-riproduzioni');
    if (grpRipr && chkRipr) {
      grpRipr.style.display = chkRipr.checked ? 'block' : 'none';
    }
  },

  toggleExperienceSections() {
    const chkTorri = document.getElementById('chk-esp-torri');
    const grpTorri = document.getElementById('grp-esp-torri');
    if (grpTorri && chkTorri) {
      grpTorri.style.display = chkTorri.checked ? 'block' : 'none';
    }

    const chkRuote = document.getElementById('chk-esp-ruote');
    const grpRuote = document.getElementById('grp-esp-ruote');
    if (grpRuote && chkRuote) {
      grpRuote.style.display = chkRuote.checked ? 'block' : 'none';
    }

    const chkCat = document.getElementById('chk-esp-catcaffe');
    const grpCat = document.getElementById('grp-esp-catcaffe');
    if (grpCat && chkCat) {
      grpCat.style.display = chkCat.checked ? 'block' : 'none';
    }
  },

  handleDateChange() {
    const startInput = document.getElementById('dia-data-inizio');
    const endInput = document.getElementById('dia-data-fine');
    if (!startInput || !endInput) return;

    if (startInput.value) {
      endInput.min = startInput.value;
      if (endInput.value && endInput.value < startInput.value) {
        endInput.value = startInput.value;
      }
    } else {
      endInput.removeAttribute('min');
    }

    if (endInput.value) {
      startInput.max = endInput.value;
      if (startInput.value && startInput.value > endInput.value) {
        startInput.value = endInput.value;
      }
    } else {
      startInput.removeAttribute('max');
    }
  },

  async handleSave(e) {
    e.preventDefault();

    try {
      const dataInizio = document.getElementById('dia-data-inizio').value;
      const dataFine = document.getElementById('dia-data-fine').value;
      if (dataInizio && dataFine && dataFine < dataInizio) {
        App.notify("La data di ritorno non può essere antecedente alla data di inizio!");
        return;
      }

      App.notify("Salvataggio nel Diario di bordo in corso...");

      const mezziChecked = Array.from(document.querySelectorAll('input[name="dia-mezzi"]:checked')).map(el => el.value).join(', ');
      const scopoChecked = Array.from(document.querySelectorAll('input[name="dia-scopo"]:checked')).map(el => el.value).join(', ');

      const hasMezziAltro = Array.from(document.querySelectorAll('input[name="dia-mezzi"]:checked')).some(el => el.value.includes('Nave') || el.value.includes('Altro'));
      const hasScopoAltro = Array.from(document.querySelectorAll('input[name="dia-scopo"]:checked')).some(el => el.value.includes('Altro'));

      // Normalizzazione e pulizia compagnie inserite
      const rawCarriers = document.getElementById('dia-compagnie').value.trim();
      const normalizedCarriers = rawCarriers.split('\n')
        .map(c => CONFIG.normalizeCarrierName(c.trim()))
        .filter(Boolean)
        .filter((val, idx, arr) => arr.indexOf(val) === idx)
        .join('\n');

      const record = {
        ID_Viaggio: this.activeTripId || ("ID_DIA_" + Date.now()),
        Nome_Viaggio: document.getElementById('dia-nome').value.trim(),
        Anno_Viaggio: document.getElementById('dia-anno').value.trim(),
        Data_Inizio_Globale: CONFIG.normalizeDateStr(document.getElementById('dia-data-inizio').value),
        Data_Fine_Globale: CONFIG.normalizeDateStr(document.getElementById('dia-data-fine').value),
        Stati: document.getElementById('dia-stati').value.trim(),
        Citta: document.getElementById('dia-citta').value.trim(),
        Link_Cartella_Drive: document.getElementById('dia-drive').value.trim(),
        Mezzi_Usati: mezziChecked,
        Specifiche_Mezzo_Altro: hasMezziAltro && document.getElementById('dia-mezzi-altro') ? document.getElementById('dia-mezzi-altro').value.trim() : "",
        Compagnie_Vettori: normalizedCarriers,
        Tipologia_Viaggio: document.getElementById('dia-tipo').value,
        Scopo_Viaggio: scopoChecked,
        Specifiche_Scopo_Altro: hasScopoAltro && document.getElementById('dia-scopo-altro') ? document.getElementById('dia-scopo-altro').value.trim() : "",
        Compagni_Viaggio: document.getElementById('dia-compagni').value.trim(),
        
        // Nuovi campi strutturati Souvenir
        Souvenir_Starbucks: document.getElementById('dia-souv-starbucks') ? document.getElementById('dia-souv-starbucks').value.trim() : "",
        Souvenir_Pandora: document.getElementById('dia-souv-pandora') ? document.getElementById('dia-souv-pandora').value.trim() : "",
        Souvenir_Riproduzioni: document.getElementById('dia-souv-riproduzioni') ? document.getElementById('dia-souv-riproduzioni').value.trim() : "",
        Souvenir: document.getElementById('dia-souvenir').value.trim(),

        // Nuovi campi strutturati Esperienze
        Esperienze_Torri: document.getElementById('dia-esp-torri') ? document.getElementById('dia-esp-torri').value.trim() : "",
        Esperienze_Ruote: document.getElementById('dia-esp-ruote') ? document.getElementById('dia-esp-ruote').value.trim() : "",
        Esperienze_CatCaffe: document.getElementById('dia-esp-catcaffe') ? document.getElementById('dia-esp-catcaffe').value.trim() : "",
        Esperienze_Luoghi: document.getElementById('dia-esperienze').value.trim(),

        Momenti_Da_Ricordare: document.getElementById('dia-momenti').value.trim(),
        Link_Podcast: document.getElementById('dia-podcast').value.trim(),
        Note_Varie: document.getElementById('dia-note').value.trim()
      };

      CONFIG.EXPENSE_CATEGORIES.forEach(cat => {
        const inputEl = document.getElementById(`dia-budget-${cat.key}`);
        const val = inputEl ? inputEl.value : "";
        record[cat.key] = val ? Number(val) : "";
      });

      await API.saveRecord(CONFIG.SHEETS.DIARIO, record, 'ID_Viaggio');
      SoundFX.playConfirm();
      App.notify("Viaggio salvato con successo nello storico.");

      this.activeTripId = record.ID_Viaggio;
      this.currentView = 'detail';
      App.render();
    } catch (err) {
      console.error("Errore durante il salvataggio del viaggio:", err);
      SoundFX.playAlert();
      App.notify("Attenzione: salvataggio completato localmente.");
      this.currentView = 'detail';
      App.render();
    }
  },

  confirmDeleteTrip(tripId) {
    App.showModal({
      title: "ELIMINA VIAGGIO DAL DIARIO",
      bodyHtml: `
        <p style="color: var(--danger); font-size: 1.05rem;">
          Sei sicuro di voler eliminare definitivamente questo viaggio dallo storico?
        </p>
        <p style="color: #ccc; margin-top: 8px;">Questa operazione cancellerà la scheda dal database.</p>
      `,
      confirmLabel: "ELIMINA DEFINITIVAMENTE",
      onConfirm: async () => {
        SoundFX.playAlert();
        await API.deleteRecord(CONFIG.SHEETS.DIARIO, 'ID_Viaggio', tripId);
        App.notify("Viaggio eliminato con successo.");
        DiarioModule.currentView = 'home';
        App.render();
      }
    });
  },

  openPdfModal() {
    const trips = API.data[CONFIG.SHEETS.DIARIO] || [];
    const trip = trips.find(t => t.ID_Viaggio === this.activeTripId);
    if (!trip) return;

    App.showModal({
      title: "GENERA REPORT PDF VIAGGIO",
      bodyHtml: `
        <p style="color: var(--pink-light); margin-bottom: 8px;">Scegli il formato grafico del documento:</p>
        <div class="checkbox-group">
          <label class="checkbox-item"><input type="radio" name="dia-pdf-theme" value="print" checked><span class="checkbox-label">Layout di Stampa Classico (Sfondo Bianco)</span></label>
          <label class="checkbox-item"><input type="radio" name="dia-pdf-theme" value="dark"><span class="checkbox-label">Layout ad Alta Leggibilità (Sfondo Nero / Rosa / Verde)</span></label>
        </div>
      `,
      confirmLabel: "GENERA E SALVA PDF",
      onConfirm: () => {
        const isDark = document.querySelector('input[name="dia-pdf-theme"]:checked').value === 'dark';
        PDFEngine.generateTripPDF(trip, { isHighContrast: isDark });
      }
    });
  }
};
