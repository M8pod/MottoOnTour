// ==========================================================================
// MODULO 08: VIAGGI NEL CASSETTO - LISTA DEI DESIDERI E IDEE DI VIAGGIO
// ==========================================================================

const CassettoModule = {
  currentView: 'list', // 'list', 'detail', 'form'
  activeDreamId: null,

  render(container) {
    if (this.currentView === 'detail') {
      this.renderDetail(container);
    } else if (this.currentView === 'form') {
      this.renderForm(container);
    } else {
      this.renderList(container);
    }
  },

  renderList(container) {
    const dreams = API.data[CONFIG.SHEETS.CASSETTO] || [];

    container.innerHTML = `
      <div class="action-bar" style="justify-content: space-between;">
        <h1 id="screen-title" tabindex="-1">VIAGGI NEL CASSETTO</h1>
        <button class="btn btn-primary" onclick="CassettoModule.openNewDreamForm()">
          ➕ AGGIUNGI SOGNO
        </button>
      </div>

      <p style="color: var(--pink-light); margin-bottom: 16px;">
        Lista dei desideri, idee di viaggio, consigli e ispirazioni future.
      </p>

      ${dreams.length > 0 ? `
        <div class="trips-list">
          ${dreams.map(d => `
            <div class="card card-mint card-interactive" tabindex="0" onclick="CassettoModule.openDreamDetail('${d.ID_Sogno}')" onkeydown="if(event.key==='Enter') CassettoModule.openDreamDetail('${d.ID_Sogno}')" aria-label="Sogno ${d.Nome_Viaggio}">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                <h2 style="color: var(--mint); margin: 0; border: none;">${d.Nome_Viaggio}</h2>
                <span class="btn btn-sm btn-pink">${d.Tipologia_Viaggio || 'Idea'}</span>
              </div>
              <p style="color: #ccc; margin-top: 8px;">
                ${d.Stati ? `📍 Stati: <strong>${d.Stati.replace(/\n/g, ', ')}</strong>` : ''}
                ${d.Citta ? ` | 🏙️ Zone: <strong>${d.Citta.replace(/\n/g, ', ')}</strong>` : ''}
              </p>
              ${d.Note_Ispirazione ? `<p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 6px; font-style: italic;">"${d.Note_Ispirazione.slice(0, 90)}..."</p>` : ''}
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="empty-state">
          <p class="empty-state-text">IL CASSETTO DEI SOGNI È ANCORA VUOTO</p>
          <button class="btn btn-primary" style="margin-top: 12px;" onclick="CassettoModule.openNewDreamForm()">
            ✨ AGGIUNGI IL TUO PRIMO SOGNO
          </button>
        </div>
      `}
    `;
  },

  openNewDreamForm() {
    this.activeDreamId = null;
    this.currentView = 'form';
    App.render();
  },

  openDreamDetail(id) {
    this.activeDreamId = id;
    this.currentView = 'detail';
    App.render();
  },

  renderDetail(container) {
    const dreams = API.data[CONFIG.SHEETS.CASSETTO] || [];
    const dream = dreams.find(d => d.ID_Sogno === this.activeDreamId);

    if (!dream) {
      this.currentView = 'list';
      this.render(container);
      return;
    }

    container.innerHTML = `
      <div class="action-bar">
        <button class="btn btn-sm btn-pink" onclick="CassettoModule.currentView='list'; App.render();">
          ⬅️ INDIETRO
        </button>
        <button class="btn btn-sm btn-primary" onclick="CassettoModule.currentView='form'; App.render();">
          ✏️ MODIFICA
        </button>
        <button class="btn btn-sm btn-danger" onclick="CassettoModule.confirmDelete('${dream.ID_Sogno}')">
          🗑️ ELIMINA
        </button>
        <button class="btn btn-sm" style="background-color: var(--mint); color: #000; font-weight: 800;" onclick="CassettoModule.confirmDreamToReality('${dream.ID_Sogno}')">
          🚀 DA SOGNO A REALTÀ!
        </button>
      </div>

      <h1 id="screen-title" tabindex="-1" style="margin-bottom: 6px;">${dream.Nome_Viaggio}</h1>

      <section class="card" style="margin-top: 14px;">
        <h2>DETTAGLI DEL SOGNO DI VIAGGIO</h2>
        <div class="table-responsive">
          <table class="table-closed">
            <tbody>
              <tr><th style="width: 35%;">STATI IPOTIZZATI</th><td>${(dream.Stati || '-').replace(/\n/g, '<br>')}</td></tr>
              <tr><th>CITTÀ O ZONE IPOTIZZATE</th><td>${(dream.Citta || '-').replace(/\n/g, '<br>')}</td></tr>
              <tr><th>TIPOLOGIA VIAGGIO</th><td>${dream.Tipologia_Viaggio || '-'}</td></tr>
              <tr><th>NOTE E ISPIRAZIONI</th><td>${(dream.Note_Ispirazione || '-').replace(/\n/g, '<br>')}</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    `;
  },

  confirmDreamToReality(dreamId) {
    const dreams = API.data[CONFIG.SHEETS.CASSETTO] || [];
    const dream = dreams.find(d => d.ID_Sogno === dreamId);
    if (!dream) return;

    App.showModal({
      title: "DA SOGNO A REALTÀ! ✈️",
      bodyHtml: `
        <p style="color: var(--mint); font-size: 1.05rem;">
          Confermi di voler trasformare il sogno <strong>${dream.Nome_Viaggio}</strong> in una partenza imminente?
        </p>
        <p style="color: #ccc; margin-top: 10px;">
          Il progetto verrà inserito nel modulo <strong>In Partenza</strong> (trasferendo note e luoghi desiderati) e rimosso dalla lista dei sogni.
        </p>
      `,
      confirmLabel: "🚀 TRASFORMA IN PARTENZA",
      onConfirm: async () => {
        App.notify("Trasferimento del sogno in In partenza...");

        const inPartenzaRecord = {
          ID_InPartenza: "ID_INP_" + Date.now(),
          Nome_Viaggio: dream.Nome_Viaggio,
          Stati: dream.Stati,
          Citta: dream.Citta,
          Tipologia_Viaggio: dream.Tipologia_Viaggio,
          Note_Preparazione: dream.Note_Ispirazione
        };

        await API.dreamToReality(dream.ID_Sogno, inPartenzaRecord);
        SoundFX.playConfirm();
        App.notify("Sogno trasformato in partenza imminente!");

        // Switch to In Partenza Module and open new trip
        InPartenzaModule.activeTripId = inPartenzaRecord.ID_InPartenza;
        InPartenzaModule.currentView = 'detail';
        App.navigate('in-partenza');
      }
    });
  },

  renderForm(container) {
    const dreams = API.data[CONFIG.SHEETS.CASSETTO] || [];
    const dream = this.activeDreamId ? (dreams.find(d => d.ID_Sogno === this.activeDreamId) || {}) : {};

    container.innerHTML = `
      <form id="form-sogno" onsubmit="CassettoModule.handleSave(event)">
        <div class="action-bar" style="justify-content: space-between;">
          <button type="button" class="btn btn-sm btn-pink" onclick="CassettoModule.currentView = CassettoModule.activeDreamId ? 'detail' : 'list'; App.render();">
            ⬅️ ANNULLA
          </button>
          <button type="submit" class="btn btn-sm btn-primary">
            💾 SALVA SOGNO
          </button>
        </div>

        <h1 id="screen-title" tabindex="-1">${this.activeDreamId ? 'MODIFICA SOGNO' : 'NUOVO SOGNO DI VIAGGIO'}</h1>

        <div class="card">
          <div class="form-group">
            <label class="form-label" for="sogno-nome">NOME DEL VIAGGIO *</label>
            <input type="text" id="sogno-nome" class="form-control" value="${dream.Nome_Viaggio || ''}" required placeholder="es. Viaggio in Islanda tra ghiaccio e aurore">
          </div>

          <div class="form-group">
            <label class="form-label" for="sogno-stati">STATI IPOTIZZATI (UNO PER RIGA)</label>
            <textarea id="sogno-stati" class="form-control" placeholder="es. Islanda">${dream.Stati || ''}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label" for="sogno-citta">CITTÀ O ZONE IPOTIZZATE (UNA PER RIGA)</label>
            <textarea id="sogno-citta" class="form-control" placeholder="es. Reykjavik&#10;Circolo d'Oro&#10;Laguna Blu">${dream.Citta || ''}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label" for="sogno-tipo">TIPOLOGIA VIAGGIO</label>
            <select id="sogno-tipo" class="form-control">
              ${CONFIG.TRIP_TYPES.map(t => `<option value="${t}" ${dream.Tipologia_Viaggio === t ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="sogno-note">NOTE E ISPIRAZIONI</label>
            <textarea id="sogno-note" class="form-control" style="min-height: 140px;" placeholder="es. Idee, consigli da amici, video visti, itinerari consigliati...">${dream.Note_Ispirazione || ''}</textarea>
          </div>
        </div>

        <div class="action-bar" style="justify-content: flex-end; margin-top: 16px;">
          <button type="submit" class="btn btn-primary btn-block">
            💾 SALVA SOGNO NEL CASSETTO
          </button>
        </div>
      </form>
    `;
  },

  async handleSave(e) {
    e.preventDefault();
    App.notify("Salvataggio sogno in corso...");

    const record = {
      ID_Sogno: this.activeDreamId || ("ID_SOG_" + Date.now()),
      Nome_Viaggio: document.getElementById('sogno-nome').value.trim(),
      Stati: document.getElementById('sogno-stati').value.trim(),
      Citta: document.getElementById('sogno-citta').value.trim(),
      Tipologia_Viaggio: document.getElementById('sogno-tipo').value,
      Note_Ispirazione: document.getElementById('sogno-note').value.trim(),
      Data_Inserimento: new Date().toISOString()
    };

    await API.saveRecord(CONFIG.SHEETS.CASSETTO, record, 'ID_Sogno');
    SoundFX.playConfirm();
    App.notify("Sogno salvato con successo nel cassetto.");

    this.activeDreamId = record.ID_Sogno;
    this.currentView = 'detail';
    App.render();
  },

  confirmDelete(id) {
    App.showModal({
      title: "ELIMINA SOGNO DAL CASSETTO",
      bodyHtml: `<p style="color: var(--danger);">Sei sicuro di voler rimuovere questo sogno dal cassetto?</p>`,
      confirmLabel: "🗑️ ELIMINA",
      onConfirm: async () => {
        SoundFX.playAlert();
        await API.deleteRecord(CONFIG.SHEETS.CASSETTO, 'ID_Sogno', id);
        App.notify("Sogno rimosso con successo.");
        CassettoModule.currentView = 'list';
        App.render();
      }
    });
  }
};
