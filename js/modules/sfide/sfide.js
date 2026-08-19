// ==========================================================================
// MODULO 07: SFIDE - GAMIFICATION E TRAGUARDI DI VIAGGIO
// ==========================================================================

const SfideModule = {
  currentView: 'home', // 'home', 'see_all', 'detail', 'form'
  activeChallengeId: null,
  activeCategory: 'SFIDA NEL MONDO',

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

  calculateGlobalProgress() {
    const challenges = API.data[CONFIG.SHEETS.SFIDE] || [];
    let totalItems = 0;
    let checkedItems = 0;

    challenges.forEach(ch => {
      let items = [];
      try {
        if (ch.Blocco_Voci_JSON) {
          items = typeof ch.Blocco_Voci_JSON === 'string' ? JSON.parse(ch.Blocco_Voci_JSON) : ch.Blocco_Voci_JSON;
        }
      } catch (e) {}

      if (Array.isArray(items)) {
        totalItems += items.length;
        checkedItems += items.filter(i => i.checked === true || i.checked === 'true' || i.checked === 'VERO').length;
      }
    });

    if (totalItems === 0) return 0;
    return Math.round((checkedItems / totalItems) * 100);
  },

  renderHome(container) {
    const challenges = API.data[CONFIG.SHEETS.SFIDE] || [];
    const globalPct = this.calculateGlobalProgress();

    const mondoList = challenges.filter(c => String(c.Categoria_Sfida || '').toUpperCase().includes('MONDO'));
    const cittaList = challenges.filter(c => String(c.Categoria_Sfida || '').toUpperCase().includes('CITT'));

    container.innerHTML = `
      <div class="action-bar" style="justify-content: space-between;">
        <h1 id="screen-title" tabindex="-1">SFIDE</h1>
        <button class="btn btn-primary" onclick="SfideModule.openNewForm()">
          ➕ AGGIUNGI SFIDA
        </button>
      </div>

      <div class="card" style="border-color: var(--mint); margin-bottom: 20px;">
        <h2 style="color: var(--mint); margin-top: 0; border: none;">COMPLETAMENTO SFIDE GLOBALE: ${globalPct}%</h2>
        <div class="progress-container">
          <div class="progress-fill" style="width: ${globalPct}%;"></div>
        </div>
      </div>

      <!-- SEZIONE 1: SFIDE NEL MONDO -->
      <section class="card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; border: none;">SFIDE NEL MONDO (${mondoList.length})</h2>
          ${mondoList.length > 0 ? `
            <button class="btn btn-sm btn-pink" onclick="SfideModule.openSeeAll('SFIDA NEL MONDO')">
              TUTTE LE SFIDE ➔
            </button>
          ` : ''}
        </div>

        <div style="margin-top: 12px;">
          ${mondoList.slice(0, 3).map(ch => this.renderChallengeCard(ch)).join('')}
          ${mondoList.length === 0 ? `<p style="color: var(--text-muted);">Nessuna sfida creata per questa categoria.</p>` : ''}
        </div>
      </section>

      <!-- SEZIONE 2: SFIDE PER CITTÀ -->
      <section class="card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; border: none;">SFIDE PER CITTÀ (${cittaList.length})</h2>
          ${cittaList.length > 0 ? `
            <button class="btn btn-sm btn-pink" onclick="SfideModule.openSeeAll('SFIDA PER CITTÀ')">
              TUTTE LE SFIDE ➔
            </button>
          ` : ''}
        </div>

        <div style="margin-top: 12px;">
          ${cittaList.slice(0, 3).map(ch => this.renderChallengeCard(ch)).join('')}
          ${cittaList.length === 0 ? `<p style="color: var(--text-muted);">Nessuna sfida creata per questa categoria.</p>` : ''}
        </div>
      </section>
    `;
  },

  renderChallengeCard(ch) {
    let items = [];
    try {
      if (ch.Blocco_Voci_JSON) {
        items = typeof ch.Blocco_Voci_JSON === 'string' ? JSON.parse(ch.Blocco_Voci_JSON) : ch.Blocco_Voci_JSON;
      }
    } catch (e) {}

    const total = items.length;
    const completed = items.filter(i => i.checked === true || i.checked === 'true' || i.checked === 'VERO').length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : (ch.Percentuale_Completamento || 0);

    return `
      <div class="card card-mint card-interactive" tabindex="0" onclick="SfideModule.openDetail('${ch.ID_Sfida}')" onkeydown="if(event.key==='Enter') SfideModule.openDetail('${ch.ID_Sfida}')" aria-label="Sfida ${ch.Titolo_Sfida}, completata al ${pct}%">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
          <h3 style="color: var(--mint); margin: 0;">${ch.Titolo_Sfida || 'Senza Titolo'}</h3>
          <span class="stat-value" style="font-size: 1rem;">${pct}%</span>
        </div>
        <p style="color: #ccc; font-size: 0.9rem; margin-top: 6px;">
          ${completed} su ${total} obiettivi completati
        </p>
        <div class="progress-container" style="height: 8px; margin: 8px 0 0 0;">
          <div class="progress-fill" style="width: ${pct}%;"></div>
        </div>
      </div>
    `;
  },

  openNewForm() {
    this.activeChallengeId = null;
    this.currentView = 'form';
    App.render();
  },

  openDetail(id) {
    this.activeChallengeId = id;
    this.currentView = 'detail';
    App.render();
  },

  openSeeAll(cat) {
    this.activeCategory = cat;
    this.currentView = 'see_all';
    App.render();
  },

  renderSeeAll(container) {
    const challenges = API.data[CONFIG.SHEETS.SFIDE] || [];
    const isMondo = this.activeCategory.includes('MONDO');
    const list = challenges.filter(c => isMondo ? String(c.Categoria_Sfida || '').toUpperCase().includes('MONDO') : String(c.Categoria_Sfida || '').toUpperCase().includes('CITT'));

    container.innerHTML = `
      <div class="action-bar">
        <button class="btn btn-sm btn-pink" onclick="SfideModule.currentView='home'; App.render();">
          ⬅️ TORNA A SFIDE
        </button>
      </div>

      <h1 id="screen-title" tabindex="-1">${this.activeCategory} - TUTTE LE SFIDE</h1>

      ${list.length > 0 ? `
        <div class="trips-list">
          ${list.map(ch => this.renderChallengeCard(ch)).join('')}
        </div>
      ` : `
        <div class="empty-state">
          <p class="empty-state-text">Nessuna sfida presente in questo elenco.</p>
        </div>
      `}
    `;
  },

  renderDetail(container) {
    const challenges = API.data[CONFIG.SHEETS.SFIDE] || [];
    const ch = challenges.find(c => c.ID_Sfida === this.activeChallengeId);

    if (!ch) {
      this.currentView = 'home';
      this.render(container);
      return;
    }

    let items = [];
    try {
      if (ch.Blocco_Voci_JSON) {
        items = typeof ch.Blocco_Voci_JSON === 'string' ? JSON.parse(ch.Blocco_Voci_JSON) : ch.Blocco_Voci_JSON;
      }
    } catch (e) {}

    const total = items.length;
    const completed = items.filter(i => i.checked === true || i.checked === 'true' || i.checked === 'VERO').length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    container.innerHTML = `
      <div class="action-bar">
        <button class="btn btn-sm btn-pink" onclick="SfideModule.currentView='home'; App.render();">
          ⬅️ INDIETRO
        </button>
        <button class="btn btn-sm btn-primary" onclick="SfideModule.currentView='form'; App.render();">
          ✏️ MODIFICA
        </button>
        <button class="btn btn-sm btn-danger" onclick="SfideModule.confirmDelete('${ch.ID_Sfida}')">
          🗑️ ELIMINA
        </button>
      </div>

      <h1 id="screen-title" tabindex="-1" style="margin-bottom: 6px;">${ch.Titolo_Sfida}</h1>
      <p class="stat-value" id="challenge-pct-display" style="font-size: 1.25rem; margin-bottom: 12px;">
        COMPLETAMENTO SFIDA ${pct}% (${completed}/${total})
      </p>

      <div class="progress-container">
        <div id="challenge-progress-bar" class="progress-fill" style="width: ${pct}%;"></div>
      </div>

      <section class="card" style="margin-top: 16px;">
        <h2>OBIETTIVI DA RAGGIUNGERE</h2>
        <div id="challenge-items-list">
          ${items.map((item, idx) => {
            const isChecked = item.checked === true || item.checked === 'true' || item.checked === 'VERO';
            return `
              <label class="challenge-item ${isChecked ? 'completed' : ''}" id="item-label-${idx}">
                <input type="checkbox" class="challenge-checkbox" ${isChecked ? 'checked' : ''} aria-checked="${isChecked}" onchange="SfideModule.toggleItem(${idx}, this.checked)">
                <span class="challenge-text">${item.text || item}</span>
              </label>
            `;
          }).join('')}
        </div>
      </section>
    `;
  },

  toggleItem(index, isChecked) {
    const challenges = API.data[CONFIG.SHEETS.SFIDE] || [];
    const ch = challenges.find(c => c.ID_Sfida === this.activeChallengeId);
    if (!ch) return;

    let items = [];
    try {
      if (ch.Blocco_Voci_JSON) {
        items = typeof ch.Blocco_Voci_JSON === 'string' ? JSON.parse(ch.Blocco_Voci_JSON) : ch.Blocco_Voci_JSON;
      }
    } catch (e) {}

    if (items[index]) {
      if (typeof items[index] === 'object') {
        items[index].checked = isChecked;
      } else {
        items[index] = { text: items[index], checked: isChecked };
      }
    }

    const total = items.length;
    const completed = items.filter(i => i.checked === true || i.checked === 'true' || i.checked === 'VERO').length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    ch.Blocco_Voci_JSON = JSON.stringify(items);
    ch.Percentuale_Completamento = pct;
    ch.Data_Ultimo_Aggiornamento = new Date().toISOString();

    // Sound and UI update
    if (isChecked) {
      SoundFX.playChime();
    }
    App.notify(`Obiettivo aggiornato. Avanzamento sfida: ${pct}%`);

    // Update DOM directly for instant responsive feedback
    const labelEl = document.getElementById(`item-label-${index}`);
    if (labelEl) {
      if (isChecked) labelEl.classList.add('completed');
      else labelEl.classList.remove('completed');
    }

    const pctDisplay = document.getElementById('challenge-pct-display');
    if (pctDisplay) pctDisplay.textContent = `COMPLETAMENTO SFIDA ${pct}% (${completed}/${total})`;

    const pBar = document.getElementById('challenge-progress-bar');
    if (pBar) pBar.style.width = `${pct}%`;

    // Queue sync to Google Apps Script in background
    API.saveRecord(CONFIG.SHEETS.SFIDE, ch, 'ID_Sfida');
  },

  renderForm(container) {
    const challenges = API.data[CONFIG.SHEETS.SFIDE] || [];
    const ch = this.activeChallengeId ? (challenges.find(c => c.ID_Sfida === this.activeChallengeId) || {}) : {};

    let existingText = "";
    if (ch.Titolo_Sfida) {
      existingText = ch.Titolo_Sfida + "\n";
      let items = [];
      try {
        if (ch.Blocco_Voci_JSON) items = typeof ch.Blocco_Voci_JSON === 'string' ? JSON.parse(ch.Blocco_Voci_JSON) : ch.Blocco_Voci_JSON;
      } catch (e) {}
      if (Array.isArray(items)) {
        existingText += items.map(i => typeof i === 'object' ? i.text : i).join('\n');
      }
    }

    container.innerHTML = `
      <form id="form-sfida" onsubmit="SfideModule.handleSave(event)">
        <div class="action-bar" style="justify-content: space-between;">
          <button type="button" class="btn btn-sm btn-pink" onclick="SfideModule.currentView = SfideModule.activeChallengeId ? 'detail' : 'home'; App.render();">
            ⬅️ ANNULLA
          </button>
          <button type="submit" class="btn btn-sm btn-primary">
            💾 SALVA SFIDA
          </button>
        </div>

        <h1 id="screen-title" tabindex="-1">${this.activeChallengeId ? 'MODIFICA SFIDA' : 'NUOVA SFIDA'}</h1>

        <div class="card">
          <div class="form-group">
            <label class="form-label" for="sfida-categoria">CATEGORIA DELLA SFIDA</label>
            <select id="sfida-categoria" class="form-control">
              <option value="SFIDA NEL MONDO" ${(ch.Categoria_Sfida || '').includes('MONDO') ? 'selected' : ''}>SFIDA NEL MONDO</option>
              <option value="SFIDA PER CITTÀ" ${(ch.Categoria_Sfida || '').includes('CITT') ? 'selected' : ''}>SFIDA PER CITTÀ</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="sfida-testo">TESTO SFIDA ED ELENCO OBIETTIVI</label>
            <p style="color: var(--pink-light); font-size: 0.85rem; margin-bottom: 8px;">
              💡 <strong>Regola di compilazione:</strong> La 1ª riga sarà il Titolo della Sfida. Ogni riga successiva sarà un obiettivo con casella di spunta.
            </p>
            <textarea id="sfida-testo" class="form-control" style="min-height: 200px;" required placeholder="es. Capitali Europee (Riga 1 = Titolo)&#10;Visitare Parigi (Riga 2 = Obiettivo 1)&#10;Visitare Madrid (Riga 3 = Obiettivo 2)&#10;Visitare Berlino (Riga 4 = Obiettivo 3)">${existingText}</textarea>
          </div>
        </div>

        <div class="action-bar" style="justify-content: flex-end; margin-top: 16px;">
          <button type="submit" class="btn btn-primary btn-block">
            💾 SALVA SFIDA
          </button>
        </div>
      </form>
    `;
  },

  async handleSave(e) {
    e.preventDefault();
    App.notify("Salvataggio sfida in corso...");

    const fullText = document.getElementById('sfida-testo').value;
    const lines = fullText.split('\n').map(l => l.trim()).filter(Boolean);

    if (lines.length === 0) {
      alert("Inserisci almeno il titolo e un obiettivo.");
      return;
    }

    const title = lines[0];
    const goalLines = lines.slice(1);

    // Keep existing check state if updating
    const challenges = API.data[CONFIG.SHEETS.SFIDE] || [];
    const existing = this.activeChallengeId ? challenges.find(c => c.ID_Sfida === this.activeChallengeId) : null;
    let oldItems = [];
    try {
      if (existing && existing.Blocco_Voci_JSON) {
        oldItems = typeof existing.Blocco_Voci_JSON === 'string' ? JSON.parse(existing.Blocco_Voci_JSON) : existing.Blocco_Voci_JSON;
      }
    } catch (e) {}

    const newItems = goalLines.map(g => {
      const match = oldItems.find(o => (typeof o === 'object' ? o.text : o) === g);
      return { text: g, checked: match ? Boolean(match.checked) : false };
    });

    const total = newItems.length;
    const completed = newItems.filter(i => i.checked).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    const record = {
      ID_Sfida: this.activeChallengeId || ("ID_SFI_" + Date.now()),
      Titolo_Sfida: title,
      Categoria_Sfida: document.getElementById('sfida-categoria').value,
      Blocco_Voci_JSON: JSON.stringify(newItems),
      Percentuale_Completamento: pct,
      Data_Ultimo_Aggiornamento: new Date().toISOString()
    };

    await API.saveRecord(CONFIG.SHEETS.SFIDE, record, 'ID_Sfida');
    SoundFX.playConfirm();
    App.notify("Sfida salvata con successo.");

    this.activeChallengeId = record.ID_Sfida;
    this.currentView = 'detail';
    App.render();
  },

  confirmDelete(id) {
    App.showModal({
      title: "ELIMINA SFIDA",
      bodyHtml: `<p style="color: var(--danger);">Vuoi davvero eliminare questa sfida?</p>`,
      confirmLabel: "🗑️ ELIMINA",
      onConfirm: async () => {
        SoundFX.playAlert();
        await API.deleteRecord(CONFIG.SHEETS.SFIDE, 'ID_Sfida', id);
        App.notify("Sfida eliminata.");
        SfideModule.currentView = 'home';
        App.render();
      }
    });
  }
};
