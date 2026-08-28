// ==========================================================================
// MODULO 04: IN PARTENZA - ORGANIZZAZIONE LOGISTICA E VIAGGI IMMINENTI
// ==========================================================================

const InPartenzaModule = {
  currentView: 'list', // 'list', 'detail', 'form', 'archive'
  activeTripId: null,

  render(container) {
    if (this.currentView === 'detail') {
      this.renderDetail(container);
    } else if (this.currentView === 'form') {
      this.renderForm(container);
    } else if (this.currentView === 'archive') {
      this.renderArchive(container);
    } else {
      this.renderList(container);
    }
  },

  calculateTripBudget(trip) {
    let total = 0;
    CONFIG.EXPENSE_CATEGORIES.forEach(cat => {
      // Direct numeric field
      if (trip[cat.key] && !isNaN(Number(trip[cat.key]))) {
        total += Number(trip[cat.key]);
      }
      // Analytical array if available
      if (trip[cat.analiticaKey]) {
        try {
          const arr = typeof trip[cat.analiticaKey] === 'string' ? JSON.parse(trip[cat.analiticaKey]) : trip[cat.analiticaKey];
          if (Array.isArray(arr)) {
            arr.forEach(item => {
              const val = typeof item === 'object' ? (item.amount || item.valore || 0) : item;
              if (!isNaN(Number(val))) total += Number(val);
            });
          }
        } catch (e) {}
      }
    });
    return total;
  },

  renderList(container) {
    const trips = API.data[CONFIG.SHEETS.IN_PARTENZA] || [];

    container.innerHTML = `
      <div class="action-bar" style="justify-content: space-between;">
        <h1 id="screen-title" tabindex="-1">IN PARTENZA</h1>
        <button class="btn btn-primary" onclick="InPartenzaModule.openNewTripForm()">
          ➕ INIZIA UN NUOVO VIAGGIO
        </button>
      </div>

      <p style="color: var(--pink-light); margin-bottom: 16px;">
        Pianificazione operativa, logistica e budget dei viaggi in preparazione.
      </p>

      ${trips.length > 0 ? `
        <div class="trips-list">
          ${trips.map(trip => {
            const budget = this.calculateTripBudget(trip);
            const dStart = CONFIG.formatDateDisplay(trip.Data_Inizio_Globale);
            const dEnd = CONFIG.formatDateDisplay(trip.Data_Fine_Globale);
            const dateText = dStart && dEnd ? `Dal ${dStart} al ${dEnd}` : (dStart ? `Partenza ${dStart}` : 'Date in fase di definizione');
            return `
              <button type="button" class="card card-mint card-interactive card-btn" onclick="InPartenzaModule.openTripDetails('${trip.ID_InPartenza}')" aria-label="Scheda partenza: ${trip.Nome_Viaggio}. ${dateText}. Budget previsto ${budget} Euro. Tipologia: ${trip.Tipologia_Viaggio || 'Pianificato'}. Apri dettagli partenza.">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                  <h2 style="color: var(--mint); margin: 0; border: none;">${trip.Nome_Viaggio}</h2>
                  <span class="btn btn-sm btn-pink">${trip.Tipologia_Viaggio || 'Pianificato'}</span>
                </div>
                <p class="stat-value" style="font-size: 1.1rem; margin: 8px 0;">
                  BUDGET PREVISTO EURO ${budget.toLocaleString('it-IT')}
                </p>
                <p style="color: #ccc; font-size: 0.9rem;">
                  📅 ${dStart && dEnd ? `Dal ${dStart} al ${dEnd}` : (dStart || 'Date in fase di definizione')}
                  ${trip.Stati ? ` | 📍 ${trip.Stati.replace(/\n/g, ', ')}` : ''}
                </p>
              </button>
            `;
          }).join('')}
        </div>
      ` : `
        <div class="empty-state">
          <p class="empty-state-text">NESSUN VIAGGIO ATTUALMENTE IN PARTENZA</p>
          <button class="btn btn-primary" style="margin-top: 12px;" onclick="InPartenzaModule.openNewTripForm()">
            INIZIA IL TUO PRIMO VIAGGIO
          </button>
        </div>
      `}

      <div style="margin-top: 24px; border-top: 2px solid var(--pink); padding-top: 16px;">
        <button class="btn btn-block btn-pink" onclick="InPartenzaModule.openArchiveView()">
          📁 CONSULTA ARCHIVIO COMPLETO VIAGGI CONCLUSI (${(API.data[CONFIG.SHEETS.ARCHIVIO] || []).length})
        </button>
      </div>
    `;
  },

  openNewTripForm() {
    this.activeTripId = null;
    this.currentView = 'form';
    App.currentModule = 'in-partenza';
    App.render();
  },

  openTripDetails(tripId) {
    this.activeTripId = tripId;
    this.currentView = 'detail';
    App.currentModule = 'in-partenza';
    App.render();
  },

  openArchiveView() {
    this.currentView = 'archive';
    App.currentModule = 'in-partenza';
    App.render();
  },

  renderDetail(container) {
    const trips = API.data[CONFIG.SHEETS.IN_PARTENZA] || [];
    const trip = trips.find(t => t.ID_InPartenza === this.activeTripId);

    if (!trip) {
      this.currentView = 'list';
      this.render(container);
      return;
    }

    const budget = this.calculateTripBudget(trip);
    const dStart = CONFIG.formatDateDisplay(trip.Data_Inizio_Globale);
    const dEnd = CONFIG.formatDateDisplay(trip.Data_Fine_Globale);

    // Parse Tickets and Hotels
    let tickets = [];
    try {
      if (trip.Blocco_Biglietti_JSON) tickets = typeof trip.Blocco_Biglietti_JSON === 'string' ? JSON.parse(trip.Blocco_Biglietti_JSON) : trip.Blocco_Biglietti_JSON;
    } catch (e) {}

    let hotels = [];
    try {
      if (trip.Blocco_Hotel_JSON) hotels = typeof trip.Blocco_Hotel_JSON === 'string' ? JSON.parse(trip.Blocco_Hotel_JSON) : trip.Blocco_Hotel_JSON;
    } catch (e) {}

    container.innerHTML = `
      <div class="action-bar">
        <button class="btn btn-sm btn-pink" onclick="InPartenzaModule.currentView='list'; App.render();" aria-label="Torna alla lista partenze">
          ⬅️ INDIETRO
        </button>
        <button class="btn btn-sm btn-primary" onclick="InPartenzaModule.currentView='form'; App.render();" aria-label="Modifica dati viaggio">
          ✏️ MODIFICA
        </button>
        <button class="btn btn-sm btn-danger" onclick="InPartenzaModule.confirmDeleteTrip('${trip.ID_InPartenza}')" aria-label="Elimina partenza">
          🗑️ ELIMINA
        </button>
        <button class="btn btn-sm btn-primary" onclick="InPartenzaModule.openPdfModal()" aria-label="Esporta PDF viaggio">
          📄 GENERA PDF
        </button>
        <button class="btn btn-sm" style="background-color: var(--mint); color: #000; font-weight: 800;" onclick="InPartenzaModule.confirmConcludeTrip('${trip.ID_InPartenza}')" aria-label="Concludi e archivia viaggio">
          🏁 VIAGGIO CONCLUSO!
        </button>
      </div>

      <h1 id="screen-title" tabindex="-1" style="margin-bottom: 4px;">${trip.Nome_Viaggio}</h1>
      <p class="stat-value" style="font-size: 1.2rem; margin-bottom: 16px;">
        BUDGET PREVISTO EURO ${budget.toLocaleString('it-IT')}
      </p>

      <!-- SEZIONE 1: DATI DI MASSIMA -->
      <section class="card">
        <h2>DATI DI MASSIMA</h2>
        <div class="table-responsive">
          <table class="table-closed">
            <thead>
              <tr>
                <th scope="col" style="width: 35%;">CAMPO</th>
                <th scope="col">DETTAGLIO</th>
              </tr>
            </thead>
            <tbody>
              <tr><th scope="row">STATI PREVISTI</th><td>${(trip.Stati || '-').replace(/\n/g, '<br>')}</td></tr>
              <tr><th scope="row">CITTÀ / TAPPE</th><td>${(trip.Citta || '-').replace(/\n/g, '<br>')}</td></tr>
              <tr><th scope="row">DATA PARTENZA</th><td>${dStart || '-'}</td></tr>
              <tr><th scope="row">DATA RIENTRO</th><td>${dEnd || '-'}</td></tr>
              <tr><th scope="row">TIPOLOGIA VIAGGIO</th><td>${trip.Tipologia_Viaggio || '-'}</td></tr>
              <tr><th scope="row">MEZZI UTILIZZATI</th><td>${trip.Mezzi_Usati || '-'} ${trip.Specifiche_Mezzo_Altro ? `(${trip.Specifiche_Mezzo_Altro})` : ''}</td></tr>
              <tr><th scope="row">SCOPO DEL VIAGGIO</th><td>${trip.Scopo_Viaggio || '-'} ${trip.Specifiche_Scopo_Altro ? `(${trip.Specifiche_Scopo_Altro})` : ''}</td></tr>
              <tr><th scope="row">CARTELLA GOOGLE DRIVE</th><td>${trip.Link_Cartella_Drive ? `<a href="${trip.Link_Cartella_Drive}" target="_blank" rel="noopener" style="color: var(--mint); word-break: break-all;">${trip.Link_Cartella_Drive}</a>` : '-'}</td></tr>
              <tr><th scope="row">NOTE E PREPARAZIONE</th><td>${(trip.Note_Preparazione || '-').replace(/\n/g, '<br>')}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- SEZIONE 2: BIGLIETTI -->
      <section class="card">
        <h2>BIGLIETTI E SPOSTAMENTI</h2>
        ${Array.isArray(tickets) && tickets.length > 0 ? `
          <div class="table-responsive">
            <table class="table-closed">
              <thead>
                <tr>
                  <th scope="col" style="width: 25%;">#</th>
                  <th scope="col">DETTAGLI BIGLIETTO</th>
                </tr>
              </thead>
              <tbody>
                ${tickets.map((t, idx) => `<tr><th scope="row">BIGLIETTO ${idx + 1}</th><td>${String(t).replace(/\n/g, '<br>')}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        ` : `<p style="color: var(--text-muted);">Nessun biglietto registrato.</p>`}
      </section>

      <!-- SEZIONE 3: HOTEL -->
      <section class="card">
        <h2>STRUTTURE RICETTIVE E HOTEL</h2>
        ${Array.isArray(hotels) && hotels.length > 0 ? `
          <div class="table-responsive">
            <table class="table-closed">
              <thead>
                <tr>
                  <th scope="col" style="width: 25%;">#</th>
                  <th scope="col">DETTAGLI HOTEL</th>
                </tr>
              </thead>
              <tbody>
                ${hotels.map((h, idx) => `<tr><th scope="row">HOTEL ${idx + 1}</th><td>${String(h).replace(/\n/g, '<br>')}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        ` : `<p style="color: var(--text-muted);">Nessun hotel registrato.</p>`}
      </section>

      <!-- SEZIONE 4: BUDGET -->
      <section class="card">
        <h2>DETTAGLIO BUDGET ANALITICO</h2>
        <div class="table-responsive">
          <table class="table-closed">
            <thead>
              <tr>
                <th scope="col">CATEGORIA SPESA</th>
                <th scope="col">IMPORTO PREVISTO</th>
              </tr>
            </thead>
            <tbody>
              ${CONFIG.EXPENSE_CATEGORIES.map(cat => {
                const val = trip[cat.key] || 0;
                return `<tr><th scope="row">${cat.label}</th><td>€ ${Number(val).toLocaleString('it-IT')}</td></tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;
  },

  renderForm(container) {
    const trips = API.data[CONFIG.SHEETS.IN_PARTENZA] || [];
    const trip = this.activeTripId ? (trips.find(t => t.ID_InPartenza === this.activeTripId) || {}) : {};

    // Parse existing tickets & hotels or provide 1 default
    let tickets = [''];
    try {
      if (trip.Blocco_Biglietti_JSON) {
        const parsed = typeof trip.Blocco_Biglietti_JSON === 'string' ? JSON.parse(trip.Blocco_Biglietti_JSON) : trip.Blocco_Biglietti_JSON;
        if (Array.isArray(parsed) && parsed.length > 0) tickets = parsed;
      }
    } catch (e) {}

    let hotels = [''];
    try {
      if (trip.Blocco_Hotel_JSON) {
        const parsed = typeof trip.Blocco_Hotel_JSON === 'string' ? JSON.parse(trip.Blocco_Hotel_JSON) : trip.Blocco_Hotel_JSON;
        if (Array.isArray(parsed) && parsed.length > 0) hotels = parsed;
      }
    } catch (e) {}

    container.innerHTML = `
      <form id="form-in-partenza" onsubmit="InPartenzaModule.handleSave(event)">
        <div class="action-bar" style="justify-content: space-between;">
          <button type="button" class="btn btn-sm btn-pink" onclick="InPartenzaModule.cancelForm()">
            ⬅️ ANNULLA
          </button>
          <button type="submit" class="btn btn-sm btn-primary">
            💾 SALVA PARTENZA
          </button>
        </div>

        <h1 id="screen-title" tabindex="-1">
          ${this.activeTripId ? 'MODIFICA PARTENZA' : 'NUOVA PARTENZA'}
        </h1>

        <!-- CATEGORIA 1: DATI DI MASSIMA -->
        <fieldset class="card">
          <legend><h2>CATEGORIA 1: DATI DI MASSIMA</h2></legend>

          <div class="form-group">
            <label class="form-label" for="inp-nome">NOME VIAGGIO *</label>
            <input type="text" id="inp-nome" class="form-control" value="${trip.Nome_Viaggio || ''}" required placeholder="es. Parigi Motto on Tour">
          </div>

          <div class="form-group">
            <label class="form-label" for="inp-stati">STATI (UNO PER RIGA)</label>
            <textarea id="inp-stati" class="form-control" placeholder="es. Francia&#10;Spagna">${trip.Stati || ''}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label" for="inp-citta">CITTÀ / LOCALITÀ (UNA PER RIGA)</label>
            <p style="color: var(--pink-light); font-size: 0.85rem; margin-top: 2px; margin-bottom: 6px;">
              💡 <em>Per crociere o tour multi-stato, puoi specificare lo stato a fianco tra parentesi (es. Savona, Marsiglia, Cadice (Spagna), Las Palmas (Spagna)).</em>
            </p>
            <textarea id="inp-citta" class="form-control" placeholder="es. Savona&#10;Marsiglia&#10;Barcellona&#10;Cadice (Spagna)&#10;Las Palmas (Spagna)">${trip.Citta || ''}</textarea>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label" for="inp-data-inizio">DATA INIZIO</label>
              <input type="date" id="inp-data-inizio" class="form-control" value="${trip.Data_Inizio_Globale || ''}" ${trip.Data_Fine_Globale ? `max="${trip.Data_Fine_Globale}"` : ''} onchange="InPartenzaModule.handleDateChange()" aria-label="Data inizio viaggio">
            </div>
            <div class="form-group">
              <label class="form-label" for="inp-data-fine">DATA RIENTRO</label>
              <input type="date" id="inp-data-fine" class="form-control" value="${trip.Data_Fine_Globale || ''}" ${trip.Data_Inizio_Globale ? `min="${trip.Data_Inizio_Globale}"` : ''} onchange="InPartenzaModule.handleDateChange()" aria-label="Data rientro viaggio">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="inp-drive">LINK CARTELLA GOOGLE DRIVE</label>
            <input type="url" id="inp-drive" class="form-control raw-case" value="${trip.Link_Cartella_Drive || ''}" placeholder="es. https://drive.google.com/drive/folders/...">
          </div>

          <div class="form-group">
            <label class="form-label">MEZZI USATI</label>
            <div class="checkbox-group">
              ${CONFIG.TRANSPORT_OPTIONS.map(opt => `
                <label class="checkbox-item">
                  <input type="checkbox" name="mezzi" value="${opt}" ${(trip.Mezzi_Usati || '').includes(opt) ? 'checked' : ''} onchange="InPartenzaModule.toggleMezziAltro()">
                  <span class="checkbox-label">${opt}</span>
                </label>
              `).join('')}
            </div>
            <input type="text" id="inp-mezzi-altro" class="form-control" style="margin-top: 8px; display: ${(trip.Mezzi_Usati || '').includes('Nave') || (trip.Mezzi_Usati || '').includes('Altro') ? 'block' : 'none'};" value="${trip.Specifiche_Mezzo_Altro || ''}" placeholder="es. Specificare nave da crociera o mezzo">
          </div>

          <div class="form-group">
            <label class="form-label" for="inp-tipo">TIPOLOGIA VIAGGIO</label>
            <select id="inp-tipo" class="form-control" aria-label="Tipologia viaggio">
              ${CONFIG.TRIP_TYPES.map(t => `<option value="${t}" ${trip.Tipologia_Viaggio === t ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">SCOPO DEL VIAGGIO</label>
            <div class="checkbox-group">
              ${CONFIG.TRIP_SCOPES.map(sc => `
                <label class="checkbox-item">
                  <input type="checkbox" name="scopo" value="${sc}" ${(trip.Scopo_Viaggio || '').includes(sc) ? 'checked' : ''} onchange="InPartenzaModule.toggleScopoAltro()">
                  <span class="checkbox-label">${sc}</span>
                </label>
              `).join('')}
            </div>
            <input type="text" id="inp-scopo-altro" class="form-control" style="margin-top: 8px; display: ${(trip.Scopo_Viaggio || '').includes('Altro') ? 'block' : 'none'};" value="${trip.Specifiche_Scopo_Altro || ''}" placeholder="es. Specificare scopo">
          </div>

          <div class="form-group">
            <label class="form-label" for="inp-note">NOTE E PREPARAZIONE</label>
            <textarea id="inp-note" class="form-control" placeholder="es. Checklist cose da fare, documenti da portare...">${trip.Note_Preparazione || ''}</textarea>
          </div>
        </fieldset>

        <!-- CATEGORIA 2: BIGLIETTI -->
        <fieldset class="card">
          <legend><h2>CATEGORIA 2: BIGLIETTI</h2></legend>
          <div id="tickets-container">
            ${tickets.map((t, idx) => `
              <div class="form-group ticket-row">
                <label class="form-label" for="ticket-${idx}">BIGLIETTO ${idx + 1}</label>
                <textarea id="ticket-${idx}" class="form-control ticket-input" placeholder="es. Volo / Treno, orario, PNR, dettagli spostamento">${t}</textarea>
              </div>
            `).join('')}
          </div>
          <button type="button" class="btn btn-sm btn-pink" onclick="InPartenzaModule.addTicketRow()">
            ➕ AGGIUNGI ALTRO BIGLIETTO
          </button>
        </fieldset>

        <!-- CATEGORIA 3: HOTEL -->
        <fieldset class="card">
          <legend><h2>CATEGORIA 3: HOTEL</h2></legend>
          <div id="hotels-container">
            ${hotels.map((h, idx) => `
              <div class="form-group hotel-row">
                <label class="form-label" for="hotel-${idx}">HOTEL ${idx + 1}</label>
                <textarea id="hotel-${idx}" class="form-control hotel-input" placeholder="es. Nome struttura, indirizzo, check-in, contatti">${h}</textarea>
              </div>
            `).join('')}
          </div>
          <button type="button" class="btn btn-sm btn-pink" onclick="InPartenzaModule.addHotelRow()">
            ➕ AGGIUNGI ALTRO HOTEL
          </button>
        </fieldset>

        <!-- CATEGORIA 4: BUDGET -->
        <fieldset class="card">
          <legend><h2>CATEGORIA 4: BUDGET PREVISTO</h2></legend>
          ${CONFIG.EXPENSE_CATEGORIES.map(cat => `
            <div class="form-group">
              <label class="form-label" for="budget-${cat.key}">${cat.label} (€)</label>
              <input type="number" id="budget-${cat.key}" class="form-control" min="0" step="any" value="${trip[cat.key] || ''}" placeholder="es. 0">
            </div>
          `).join('')}
        </fieldset>

        <div class="action-bar" style="justify-content: flex-end; margin-top: 16px;">
          <button type="submit" class="btn btn-primary btn-block">
            💾 SALVA PIANIFICAZIONE VIAGGIO
          </button>
        </div>
      </form>
    `;
  },

  addTicketRow() {
    const container = document.getElementById('tickets-container');
    const idx = container.querySelectorAll('.ticket-row').length;
    const div = document.createElement('div');
    div.className = 'form-group ticket-row';
    div.innerHTML = `
      <label class="form-label" for="ticket-${idx}">BIGLIETTO ${idx + 1}</label>
      <textarea id="ticket-${idx}" class="form-control ticket-input" placeholder="Volo / Treno, orario, PNR, dettagli spostamento"></textarea>
    `;
    container.appendChild(div);
    div.querySelector('textarea').focus();
  },

  addHotelRow() {
    const container = document.getElementById('hotels-container');
    const idx = container.querySelectorAll('.hotel-row').length;
    const div = document.createElement('div');
    div.className = 'form-group hotel-row';
    div.innerHTML = `
      <label class="form-label" for="hotel-${idx}">HOTEL ${idx + 1}</label>
      <textarea id="hotel-${idx}" class="form-control hotel-input" placeholder="Nome struttura, indirizzo, check-in, contatti"></textarea>
    `;
    container.appendChild(div);
    div.querySelector('textarea').focus();
  },

  toggleMezziAltro() {
    const checked = Array.from(document.querySelectorAll('input[name="mezzi"]:checked')).map(el => el.value);
    const input = document.getElementById('inp-mezzi-altro');
    if (!input) return;
    const needsInput = checked.some(v => v.includes('Nave') || v.includes('Altro'));
    if (needsInput) {
      input.style.display = 'block';
    } else {
      input.style.display = 'none';
      input.value = '';
    }
  },

  toggleScopoAltro() {
    const checked = Array.from(document.querySelectorAll('input[name="scopo"]:checked')).map(el => el.value);
    const input = document.getElementById('inp-scopo-altro');
    if (!input) return;
    if (checked.some(v => v.includes('Altro'))) {
      input.style.display = 'block';
    } else {
      input.style.display = 'none';
      input.value = '';
    }
  },

  cancelForm() {
    this.currentView = this.activeTripId ? 'detail' : 'list';
    App.render();
  },

  handleDateChange() {
    const startInput = document.getElementById('inp-data-inizio');
    const endInput = document.getElementById('inp-data-fine');
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

    const dataInizio = document.getElementById('inp-data-inizio').value;
    const dataFine = document.getElementById('inp-data-fine').value;
    if (dataInizio && dataFine && dataFine < dataInizio) {
      App.notify("La data di rientro non può essere antecedente alla data di inizio!");
      return;
    }

    App.notify("Salvataggio viaggio in corso...");

    const mezziChecked = Array.from(document.querySelectorAll('input[name="mezzi"]:checked')).map(el => el.value).join(', ');
    const scopoChecked = Array.from(document.querySelectorAll('input[name="scopo"]:checked')).map(el => el.value).join(', ');

    const hasMezziAltro = Array.from(document.querySelectorAll('input[name="mezzi"]:checked')).some(el => el.value.includes('Nave') || el.value.includes('Altro'));
    const hasScopoAltro = Array.from(document.querySelectorAll('input[name="scopo"]:checked')).some(el => el.value.includes('Altro'));

    // Collect cleaned non-empty tickets
    const ticketInputs = Array.from(document.querySelectorAll('.ticket-input')).map(el => el.value.trim()).filter(Boolean);
    const hotelInputs = Array.from(document.querySelectorAll('.hotel-input')).map(el => el.value.trim()).filter(Boolean);

    const record = {
      ID_InPartenza: this.activeTripId || ("ID_INP_" + Date.now()),
      Nome_Viaggio: document.getElementById('inp-nome').value.trim(),
      Stati: document.getElementById('inp-stati').value.trim(),
      Citta: document.getElementById('inp-citta').value.trim(),
      Data_Inizio_Globale: CONFIG.normalizeDateStr(document.getElementById('inp-data-inizio').value),
      Data_Fine_Globale: CONFIG.normalizeDateStr(document.getElementById('inp-data-fine').value),
      Link_Cartella_Drive: document.getElementById('inp-drive').value.trim(),
      Mezzi_Usati: mezziChecked,
      Specifiche_Mezzo_Altro: hasMezziAltro ? document.getElementById('inp-mezzi-altro').value.trim() : "",
      Tipologia_Viaggio: document.getElementById('inp-tipo').value,
      Scopo_Viaggio: scopoChecked,
      Specifiche_Scopo_Altro: hasScopoAltro ? document.getElementById('inp-scopo-altro').value.trim() : "",
      Note_Preparazione: document.getElementById('inp-note').value.trim(),
      Blocco_Biglietti_JSON: JSON.stringify(ticketInputs),
      Blocco_Hotel_JSON: JSON.stringify(hotelInputs)
    };

    CONFIG.EXPENSE_CATEGORIES.forEach(cat => {
      const val = document.getElementById(`budget-${cat.key}`).value;
      record[cat.key] = val ? Number(val) : "";
    });

    await API.saveRecord(CONFIG.SHEETS.IN_PARTENZA, record, 'ID_InPartenza');
    SoundFX.playConfirm();
    App.notify("Pianificazione viaggio salvata con successo.");

    this.activeTripId = record.ID_InPartenza;
    this.currentView = 'detail';
    App.render();
  },

  confirmDeleteTrip(tripId) {
    App.showModal({
      title: "ELIMINA VIAGGIO IN PARTENZA",
      bodyHtml: `
        <p style="color: var(--danger); font-size: 1.05rem;">
          Sei sicuro di voler eliminare questo viaggio in preparazione?
        </p>
        <p style="color: #ccc; margin-top: 8px;">Tutti i dati e la pianificazione associata saranno rimossi.</p>
      `,
      confirmLabel: "🗑️ ELIMINA",
      onConfirm: async () => {
        SoundFX.playAlert();
        await API.deleteRecord(CONFIG.SHEETS.IN_PARTENZA, 'ID_InPartenza', tripId);
        App.notify("Viaggio in partenza eliminato con successo.");
        InPartenzaModule.currentView = 'list';
        App.render();
      }
    });
  },

  confirmConcludeTrip(tripId) {
    const trips = API.data[CONFIG.SHEETS.IN_PARTENZA] || [];
    const trip = trips.find(t => t.ID_InPartenza === tripId);
    if (!trip) return;

    App.showModal({
      title: "CONCLUDI VIAGGIO E ARCHIVIA",
      bodyHtml: `
        <p style="color: var(--mint); font-size: 1.05rem;">
          Confermi di voler concludere il viaggio <strong>${trip.Nome_Viaggio}</strong>?
        </p>
        <p style="color: #ccc; margin-top: 10px;">
          L'operazione salverà il viaggio nello storico definitivo del <strong>Diario di Bordo</strong>, aggiornerà le statistiche del <strong>Passaporto</strong> e copierà tutti i dettagli analitici nella scheda <strong>Archivio</strong>.
        </p>
      `,
      confirmLabel: "🏁 CONFERMA E ARCHIVIA",
      onConfirm: async () => {
        App.notify("Archiviazione del viaggio in corso...");
        
        // Build Diario record
        const year = trip.Data_Inizio_Globale ? trip.Data_Inizio_Globale.split('-')[0] : String(new Date().getFullYear());
        const diarioRecord = {
          ID_Viaggio: "ID_DIA_" + Date.now(),
          Nome_Viaggio: trip.Nome_Viaggio,
          Anno_Viaggio: year,
          Data_Inizio_Globale: trip.Data_Inizio_Globale,
          Data_Fine_Globale: trip.Data_Fine_Globale,
          Stati: trip.Stati,
          Citta: trip.Citta,
          Link_Cartella_Drive: trip.Link_Cartella_Drive,
          Mezzi_Usati: trip.Mezzi_Usati,
          Specifiche_Mezzo_Altro: trip.Specifiche_Mezzo_Altro,
          Tipologia_Viaggio: trip.Tipologia_Viaggio,
          Scopo_Viaggio: trip.Scopo_Viaggio,
          Specifiche_Scopo_Altro: trip.Specifiche_Scopo_Altro,
          Compagni_Viaggio: trip.Compagni_Viaggio || "",
          Note_Varie: trip.Note_Preparazione
        };

        CONFIG.EXPENSE_CATEGORIES.forEach(cat => {
          diarioRecord[cat.key] = trip[cat.key] || "";
        });

        // Build Archivio record
        const archivioRecord = {
          ID_Archivio: "ID_ARC_" + Date.now(),
          Nome_Viaggio: trip.Nome_Viaggio,
          Data_Inizio_Globale: trip.Data_Inizio_Globale,
          Data_Fine_Globale: trip.Data_Fine_Globale,
          Link_Cartella_Drive: trip.Link_Cartella_Drive,
          Stati: trip.Stati,
          Citta: trip.Citta,
          Mezzi_Usati: trip.Mezzi_Usati,
          Specifiche_Mezzo_Altro: trip.Specifiche_Mezzo_Altro,
          Tipologia_Viaggio: trip.Tipologia_Viaggio,
          Scopo_Viaggio: trip.Scopo_Viaggio,
          Specifiche_Scopo_Altro: trip.Specifiche_Scopo_Altro,
          Note_Preparazione: trip.Note_Preparazione,
          Blocco_Biglietti_Integrale: trip.Blocco_Biglietti_JSON,
          Blocco_Hotel_Integrale: trip.Blocco_Hotel_JSON,
          Data_Archiviazione: new Date().toISOString()
        };

        await API.concludeTrip(trip, diarioRecord, archivioRecord);
        SoundFX.playConfirm();
        App.notify("Viaggio concluso ed archiviato con successo!");
        InPartenzaModule.currentView = 'list';
        App.render();
      }
    });
  },

  openPdfModal() {
    const trips = API.data[CONFIG.SHEETS.IN_PARTENZA] || [];
    const trip = trips.find(t => t.ID_InPartenza === this.activeTripId);
    if (!trip) return;

    App.showModal({
      title: "ESPORTAZIONE REPORT PDF",
      bodyHtml: `
        <p style="color: var(--pink-light); margin-bottom: 12px;">Seleziona le sezioni da includere nel documento:</p>
        <div class="checkbox-group">
          <label class="checkbox-item"><input type="checkbox" id="pdf-cat-dati" checked><span class="checkbox-label">Dati di Massima</span></label>
          <label class="checkbox-item"><input type="checkbox" id="pdf-cat-biglietti" checked><span class="checkbox-label">Biglietti e Spostamenti</span></label>
          <label class="checkbox-item"><input type="checkbox" id="pdf-cat-hotel" checked><span class="checkbox-label">Hotel e Strutture</span></label>
          <label class="checkbox-item"><input type="checkbox" id="pdf-cat-budget" checked><span class="checkbox-label">Budget Analitico</span></label>
        </div>
        <p style="color: var(--pink-light); margin-top: 14px; margin-bottom: 8px;">Stile grafico:</p>
        <div class="checkbox-group">
          <label class="checkbox-item"><input type="radio" name="pdf-theme" value="print" checked><span class="checkbox-label">Layout di Stampa Classico (Sfondo Bianco)</span></label>
          <label class="checkbox-item"><input type="radio" name="pdf-theme" value="dark"><span class="checkbox-label">Layout ad Alta Leggibilità (Sfondo Nero / Rosa / Verde)</span></label>
        </div>
      `,
      confirmLabel: "📄 GENERA E SALVA PDF",
      onConfirm: () => {
        const includeCategories = [];
        if (document.getElementById('pdf-cat-dati').checked) includeCategories.push('dati');
        if (document.getElementById('pdf-cat-biglietti').checked) includeCategories.push('biglietti');
        if (document.getElementById('pdf-cat-hotel').checked) includeCategories.push('hotel');
        if (document.getElementById('pdf-cat-budget').checked) includeCategories.push('budget');

        const isDark = document.querySelector('input[name="pdf-theme"]:checked').value === 'dark';
        PDFEngine.generateTripPDF(trip, { isHighContrast: isDark, includeCategories });
      }
    });
  },

  renderArchive(container) {
    const archiveTrips = API.data[CONFIG.SHEETS.ARCHIVIO] || [];

    container.innerHTML = `
      <div class="action-bar">
        <button class="btn btn-sm btn-pink" onclick="InPartenzaModule.currentView='list'; App.render();">
          ⬅️ TORNA A IN PARTENZA
        </button>
      </div>

      <h1 id="screen-title" tabindex="-1">ARCHIVIO LOGISTICO VIAGGI CONCLUSI</h1>
      <p style="color: var(--pink-light); margin-bottom: 16px;">
        Registro completo di tutti i dettagli operativi dei viaggi conclusi.
      </p>

      ${archiveTrips.length > 0 ? `
        <div class="trips-list">
          ${archiveTrips.map(trip => {
            const dStart = CONFIG.formatDateDisplay(trip.Data_Inizio_Globale);
            const dEnd = CONFIG.formatDateDisplay(trip.Data_Fine_Globale);
            return `
              <div class="card card-mint">
                <h2 style="color: var(--mint); margin-top: 0; border: none;">${trip.Nome_Viaggio}</h2>
                <p style="color: #ccc;">
                  📅 Svolto: <strong>${dStart && dEnd ? `${dStart} -> ${dEnd}` : (dStart || '-')}</strong> | 📍 Stati: <strong>${trip.Stati || '-'}</strong>
                </p>
                <button class="btn btn-sm btn-primary" style="margin-top: 10px;" onclick="InPartenzaModule.openArchivePdf('${trip.ID_Archivio}')">
                  📄 GENERA REPORT PDF ARCHIVIO
                </button>
              </div>
            `;
          }).join('')}
        </div>
      ` : `
        <div class="empty-state">
          <p class="empty-state-text">NESSUN VIAGGIO ANCORA ARCHIVIATO</p>
        </div>
      `}
    `;
  },

  openArchivePdf(idArchivio) {
    const trips = API.data[CONFIG.SHEETS.ARCHIVIO] || [];
    const trip = trips.find(t => t.ID_Archivio === idArchivio);
    if (trip) {
      PDFEngine.generateTripPDF(trip, { isHighContrast: false });
    }
  }
};
