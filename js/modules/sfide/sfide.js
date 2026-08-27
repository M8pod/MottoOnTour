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

  // Estrazione e normalizzazione ultra-tollerante delle singole voci e checkbox
  getChallengeItems(ch) {
    if (!ch) return [];

    // Recupera la stringa o array da qualsiasi possibile nome di proprietà
    let raw = ch.Blocco_Voci_JSON || ch.Bloccco_Voci_JSON || ch.Blocco_voci_json || ch.blocco_voci_json || ch.voci || ch.Voci || "";
    if (!raw) {
      for (const k of Object.keys(ch)) {
        if (/voci|blocc/i.test(k) && ch[k]) {
          raw = ch[k];
          break;
        }
      }
    }

    let items = [];

    if (Array.isArray(raw)) {
      items = raw;
    } else if (typeof raw === 'object' && raw !== null) {
      items = Object.values(raw);
    } else if (typeof raw === 'string') {
      const cleanRaw = raw.trim();
      if (cleanRaw) {
        // Tentativo 1: Standard JSON parse
        try {
          let parsed = JSON.parse(cleanRaw);
          if (typeof parsed === 'string') {
            // Possibile doppio encoding JSON
            parsed = JSON.parse(parsed);
          }
          if (Array.isArray(parsed)) {
            items = parsed;
          } else if (typeof parsed === 'object' && parsed !== null) {
            items = Object.values(parsed);
          }
        } catch (e1) {
          // Tentativo 2: Parsing di testo a capo semplice (se immesso riga per riga)
          try {
            const lines = cleanRaw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
            if (lines.length > 0) {
              items = lines.map(line => {
                let isChecked = false;
                let text = line;
                if (/^-\s*\[[xX]\]\s*/.test(line)) {
                  isChecked = true;
                  text = line.replace(/^-\s*\[[xX]\]\s*/, '');
                } else if (/^-\s*\[\s*\]\s*/.test(line)) {
                  isChecked = false;
                  text = line.replace(/^-\s*\[\s*\]\s*/, '');
                }
                return { text: text.trim(), checked: isChecked };
              });
            }
          } catch (e2) {}
        }
      }
    }

    // Fallback storico per la sfida iniziale delle 7 meraviglie
    if ((!items || items.length === 0) && String(ch.Titolo_Sfida || '').toLowerCase().includes('7 meraviglie')) {
      items = [
        { text: "Grande Muraglia Cinese (Cina)", checked: false },
        { text: "Petra (Giordania)", checked: false },
        { text: "Cristo Redentore (Brasile)", checked: false },
        { text: "Machu Picchu (Perù)", checked: false },
        { text: "Chichén Itzá (Messico)", checked: false },
        { text: "Colosseo (Italia)", checked: true },
        { text: "Taj Mahal (India)", checked: false }
      ];
      const jsonStr = JSON.stringify(items);
      ch.Blocco_Voci_JSON = jsonStr;
      ch.Bloccco_Voci_JSON = jsonStr;
      API.saveRecord(CONFIG.SHEETS.SFIDE, ch, 'ID_Sfida');
    }

    if (!Array.isArray(items)) return [];

    // Normalizzazione uniforme di ogni singolo elemento in { text: string, checked: boolean }
    return items.map(item => {
      if (typeof item === 'object' && item !== null) {
        const text = item.text || item.titolo || item.title || item.name || item.label || item.voce || String(item) || "";
        const checked = Boolean(
          item.checked === true ||
          item.checked === 'true' ||
          item.checked === 'VERO' ||
          item.checked === 'vero' ||
          item.checked === 1 ||
          item.checked === '1'
        );
        return { text: String(text).trim(), checked };
      }
      return { text: String(item).trim(), checked: false };
    }).filter(i => i.text.length > 0);
  },

  calculateGlobalProgress() {
    const challenges = API.data[CONFIG.SHEETS.SFIDE] || [];
    let totalItems = 0;
    let checkedItems = 0;

    challenges.forEach(ch => {
      const items = this.getChallengeItems(ch);
      if (Array.isArray(items)) {
        totalItems += items.length;
        checkedItems += items.filter(i => i.checked === true).length;
      }
    });

    if (totalItems === 0) return 0;
    return Math.round((checkedItems / totalItems) * 100);
  },

  async refreshData() {
    App.notify("Aggiornamento sfide dal cloud...");
    await API.fetchAllData(true);
    SoundFX.playConfirm();
    App.notify("Sfide sincronizzate con successo.");
    const container = document.getElementById('app-container');
    if (container && App.currentModule === 'sfide') {
      this.render(container);
    }
  },

  renderHome(container) {
    const challenges = API.data[CONFIG.SHEETS.SFIDE] || [];
    const globalPct = this.calculateGlobalProgress();

    const mondoList = challenges.filter(c => String(c.Categoria_Sfida || '').toUpperCase().includes('MONDO'));
    const cittaList = challenges.filter(c => String(c.Categoria_Sfida || '').toUpperCase().includes('CITT'));
    const altreList = challenges.filter(c => {
      const cat = String(c.Categoria_Sfida || '').toUpperCase();
      return !cat.includes('MONDO') && !cat.includes('CITT');
    });

    container.innerHTML = `
      <div class="action-bar" style="justify-content: space-between; flex-wrap: wrap; gap: 8px;">
        <h1 id="screen-title" tabindex="-1">SFIDE</h1>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-sm btn-primary" onclick="SfideModule.refreshData()" aria-label="Sincronizza sfide con il cloud Google Drive">
            🔄 AGGIORNA SFIDE
          </button>
          <button class="btn btn-primary" onclick="SfideModule.openNewForm()">
            ➕ AGGIUNGI SFIDA
          </button>
        </div>
      </div>

      <div class="card" style="border-color: var(--mint); margin-bottom: 20px;">
        <h2 style="color: var(--mint); margin-top: 0; border: none;">COMPLETAMENTO SFIDE GLOBALE: ${globalPct}%</h2>
        <div class="progress-container">
          <div class="progress-fill" style="width: ${globalPct}%;"></div>
        </div>
      </div>

      <!-- SEZIONE 1: SFIDE NEL MONDO -->
      <section class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
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
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
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

      <!-- SEZIONE 3: ALTRE SFIDE (FALLBACK SICUREZZA) -->
      ${altreList.length > 0 ? `
        <section class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <h2 style="margin: 0; border: none;">ALTRE SFIDE (${altreList.length})</h2>
            <button class="btn btn-sm btn-pink" onclick="SfideModule.openSeeAll('ALTRE SFIDE')">
              TUTTE LE SFIDE ➔
            </button>
          </div>

          <div style="margin-top: 12px;">
            ${altreList.slice(0, 3).map(ch => this.renderChallengeCard(ch)).join('')}
          </div>
        </section>
      ` : ''}

      ${challenges.length === 0 ? `
        <div class="empty-state" style="margin-top: 20px;">
          <p class="empty-state-text">NESSUNA SFIDA ANCORA REGISTRATA</p>
          <button class="btn btn-primary" style="margin-top: 10px;" onclick="SfideModule.openNewForm()">
            ➕ CREA LA TUA PRIMA SFIDA
          </button>
        </div>
      ` : ''}
    `;
  },

  renderChallengeCard(ch) {
    const items = this.getChallengeItems(ch);
    const total = items.length;
    const completed = items.filter(i => i.checked === true).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : (Number(ch.Percentuale_Completamento) || 0);

    return `
      <button type="button" class="card card-mint card-interactive card-btn" onclick="SfideModule.openDetail('${ch.ID_Sfida}')" aria-label="Sfida: ${ch.Titolo_Sfida || 'Senza Titolo'}. Completamento: ${pct}%. ${completed} su ${total} obiettivi completati. Apri scheda sfida.">
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
      </button>
    `;
  },

  openNewForm() {
    this.activeChallengeId = null;
    this.currentView = 'form';
    App.currentModule = 'sfide';
    App.render();
  },

  openDetail(id) {
    this.activeChallengeId = id;
    this.currentView = 'detail';
    App.currentModule = 'sfide';
    App.render();
  },

  openSeeAll(cat) {
    this.activeCategory = cat;
    this.currentView = 'see_all';
    App.currentModule = 'sfide';
    App.render();
  },

  renderSeeAll(container) {
    const challenges = API.data[CONFIG.SHEETS.SFIDE] || [];
    let list = [];

    if (this.activeCategory.includes('MONDO')) {
      list = challenges.filter(c => String(c.Categoria_Sfida || '').toUpperCase().includes('MONDO'));
    } else if (this.activeCategory.includes('CITT')) {
      list = challenges.filter(c => String(c.Categoria_Sfida || '').toUpperCase().includes('CITT'));
    } else {
      list = challenges.filter(c => {
        const cat = String(c.Categoria_Sfida || '').toUpperCase();
        return !cat.includes('MONDO') && !cat.includes('CITT');
      });
      if (list.length === 0) list = challenges;
    }

    container.innerHTML = `
      <div class="action-bar" style="justify-content: space-between; flex-wrap: wrap; gap: 8px;">
        <button class="btn btn-sm btn-pink" onclick="SfideModule.currentView='home'; App.render();">
          ⬅️ TORNA A SFIDE
        </button>
        <button class="btn btn-sm btn-primary" onclick="SfideModule.refreshData()">
          🔄 AGGIORNA
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
    const ch = challenges.find(c => String(c.ID_Sfida) === String(this.activeChallengeId));

    if (!ch) {
      this.currentView = 'home';
      this.render(container);
      return;
    }

    const items = this.getChallengeItems(ch);
    const total = items.length;
    const completed = items.filter(i => i.checked === true).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    container.innerHTML = `
      <div class="action-bar" style="justify-content: space-between; flex-wrap: wrap; gap: 8px;">
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-sm btn-pink" onclick="SfideModule.currentView='home'; App.render();">
            ⬅️ INDIETRO
          </button>
          <button class="btn btn-sm btn-primary" onclick="SfideModule.refreshData()">
            🔄 AGGIORNA
          </button>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-sm btn-primary" onclick="SfideModule.currentView='form'; App.render();">
            ✏️ MODIFICA
          </button>
          <button class="btn btn-sm btn-danger" onclick="SfideModule.confirmDelete('${ch.ID_Sfida}')">
            🗑️ ELIMINA
          </button>
        </div>
      </div>

      <h1 id="screen-title" tabindex="-1" style="margin-bottom: 6px;">${ch.Titolo_Sfida || 'Sfida Senza Titolo'}</h1>
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
            const isChecked = item.checked === true;
            return `
              <label class="challenge-item ${isChecked ? 'completed' : ''}" id="item-label-${idx}">
                <input type="checkbox" class="challenge-checkbox" ${isChecked ? 'checked' : ''} aria-checked="${isChecked}" onchange="SfideModule.toggleItem(${idx}, this.checked)">
                <span class="challenge-text">${item.text}</span>
              </label>
            `;
          }).join('')}
          ${items.length === 0 ? `<p style="color: var(--text-muted);">Nessun obiettivo registrato per questa sfida.</p>` : ''}
        </div>
      </section>
    `;
  },

  toggleItem(index, isChecked) {
    const challenges = API.data[CONFIG.SHEETS.SFIDE] || [];
    const ch = challenges.find(c => String(c.ID_Sfida) === String(this.activeChallengeId));
    if (!ch) return;

    let items = this.getChallengeItems(ch);

    if (items[index]) {
      items[index].checked = isChecked;
    }

    const total = items.length;
    const completed = items.filter(i => i.checked === true).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    const jsonStr = JSON.stringify(items);
    ch.Blocco_Voci_JSON = jsonStr;
    ch.Bloccco_Voci_JSON = jsonStr;
    ch.Percentuale_Completamento = pct;
    ch.Data_Ultimo_Aggiornamento = new Date().toISOString();

    // Sound e feedback sonoro
    if (isChecked) {
      SoundFX.playChime();
    }
    App.notify(`Obiettivo ${isChecked ? 'completato' : 'deselezionato'}. Avanzamento sfida: ${pct}%`);

    // Aggiornamento DOM diretto per reattività istantanea
    const labelEl = document.getElementById(`item-label-${index}`);
    if (labelEl) {
      if (isChecked) labelEl.classList.add('completed');
      else labelEl.classList.remove('completed');
    }

    const pctDisplay = document.getElementById('challenge-pct-display');
    if (pctDisplay) pctDisplay.textContent = `COMPLETAMENTO SFIDA ${pct}% (${completed}/${total})`;

    const pBar = document.getElementById('challenge-progress-bar');
    if (pBar) pBar.style.width = `${pct}%`;

    // Sincronizzazione locale e cloud
    API.saveRecord(CONFIG.SHEETS.SFIDE, ch, 'ID_Sfida');
  },

  renderForm(container) {
    const challenges = API.data[CONFIG.SHEETS.SFIDE] || [];
    const ch = this.activeChallengeId ? (challenges.find(c => String(c.ID_Sfida) === String(this.activeChallengeId)) || {}) : {};

    let existingText = "";
    if (ch.Titolo_Sfida) {
      existingText = ch.Titolo_Sfida + "\n";
      const items = this.getChallengeItems(ch);
      if (Array.isArray(items)) {
        existingText += items.map(i => i.text).join('\n');
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
            <textarea id="sfida-testo" class="form-control" style="min-height: 220px;" required placeholder="es. Capitali Europee (Riga 1 = Titolo)&#10;Visitare Parigi (Riga 2 = Obiettivo 1)&#10;Visitare Madrid (Riga 3 = Obiettivo 2)&#10;Visitare Berlino (Riga 4 = Obiettivo 3)">${existingText}</textarea>
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
    const lines = fullText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    if (lines.length === 0) {
      alert("Inserisci almeno il titolo della sfida.");
      return;
    }

    const title = lines[0];
    const goalLines = lines.slice(1);

    // Conserva lo stato delle spunte esistenti per le voci già presenti
    const challenges = API.data[CONFIG.SHEETS.SFIDE] || [];
    const existing = this.activeChallengeId ? challenges.find(c => String(c.ID_Sfida) === String(this.activeChallengeId)) : null;
    let oldItems = existing ? this.getChallengeItems(existing) : [];

    const newItems = goalLines.map(g => {
      const match = oldItems.find(o => o.text === g);
      return { text: g, checked: match ? Boolean(match.checked) : false };
    });

    const total = newItems.length;
    const completed = newItems.filter(i => i.checked === true).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    const jsonStr = JSON.stringify(newItems);
    const challengeId = this.activeChallengeId || ("ID_SFI_" + Date.now());

    const record = {
      ID_Sfida: challengeId,
      Titolo_Sfida: title,
      Categoria_Sfida: document.getElementById('sfida-categoria').value || "SFIDA NEL MONDO",
      Blocco_Voci_JSON: jsonStr,
      Bloccco_Voci_JSON: jsonStr,
      Percentuale_Completamento: pct,
      Data_Ultimo_Aggiornamento: new Date().toISOString()
    };

    await API.saveRecord(CONFIG.SHEETS.SFIDE, record, 'ID_Sfida');
    SoundFX.playConfirm();
    App.notify("Sfida salvata e sincronizzata con successo.");

    this.activeChallengeId = challengeId;
    this.currentView = 'detail';
    App.render();
  },

  confirmDelete(id) {
    App.showModal({
      title: "ELIMINA SFIDA",
      bodyHtml: `<p style="color: var(--danger); font-size: 1.05rem;">Vuoi davvero eliminare questa sfida dal database?</p><p style="color: #ccc; margin-top: 8px;">Questa operazione cancellerà la sfida da tutti i dispositivi.</p>`,
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
