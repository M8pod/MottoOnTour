// ==========================================================================
// MODULO 010: IMPOSTAZIONI E SICUREZZA - CONTROLLO, BACKUP E ACCESSIBILITÀ
// ==========================================================================

const ImpostazioniModule = {
  render(container) {
    const isOnline = navigator.onLine;
    const lastSync = API.lastSyncTime ? API.lastSyncTime.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : 'Mai';
    const pendingSync = (API.syncQueue && API.syncQueue.length) || 0;
    const requirePinAlways = localStorage.getItem('motto_require_pin_always') === 'true';
    const autoSyncOnStart = localStorage.getItem('motto_auto_sync') !== 'false';
    const soundEnabled = localStorage.getItem('motto_sound_enabled') !== 'false';

    container.innerHTML = `
      <div class="action-bar">
        <button class="btn btn-sm btn-pink" onclick="App.navigate('home')">
          <span aria-hidden="true">⬅️ </span>TORNA ALLA HOME
        </button>
      </div>

      <h1 id="screen-title" tabindex="-1">IMPOSTAZIONI E SICUREZZA</h1>

      <!-- GRUPPO 1: SICUREZZA E PIN -->
      <section class="card">
        <h2>GRUPPO 1: SICUREZZA E CONTROLLO PIN UNICO</h2>
        <p style="color: #ccc; margin-bottom: 12px;">
          L'accesso all'applicazione è protetto dal codice PIN segreto condiviso (<strong>211221</strong>).
        </p>

        <div class="checkbox-group">
          <label class="checkbox-item">
            <input type="checkbox" id="chk-pin-always" ${requirePinAlways ? 'checked' : ''} onchange="ImpostazioniModule.toggleRequirePin(this.checked)">
            <span class="checkbox-label">Richiedi PIN ad ogni avvio dell'applicazione</span>
          </label>
        </div>

        <button class="btn btn-sm btn-danger" style="margin-top: 10px;" onclick="App.lockApp()">
          <span aria-hidden="true">🔒 </span>BLOCCA APPLICAZIONE ADESSO
        </button>
      </section>

      <!-- GESTIONE & NORMALIZZAZIONE COMPAGNIE E VETTORI (PUNTO 3) -->
      <section class="card">
        <h2>GESTIONE & NORMALIZZAZIONE COMPAGNIE</h2>
        <p style="color: #ccc; margin-bottom: 12px;">
          Rinomina o unifica retroattivamente le compagnie salvate nei viaggi passati (ad es. per correggere refusi o unificare doppioni).
        </p>
        <button class="btn btn-sm btn-primary" onclick="ImpostazioniModule.openCompanyManagerModal()">
          <span aria-hidden="true">✈️ </span>GESTISCI E RINOMINA COMPAGNIE
        </button>
      </section>

      <!-- GRUPPO 2: BACKUP E RIPRISTINO -->
      <section class="card">
        <h2>GRUPPO 2: COPIA DI SICUREZZA LOCALE E RIPRISTINO</h2>
        <p style="color: #ccc; margin-bottom: 12px;">
          Esporta o ripristina la totalità dei dati del database in formato JSON di sicurezza.
        </p>

        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button class="btn btn-sm btn-primary" onclick="ImpostazioniModule.downloadBackup()">
            <span aria-hidden="true">💾 </span>ESEGUI BACKUP LOCALE (JSON)
          </button>

          <label class="btn btn-sm btn-pink" style="cursor: pointer;">
            <span aria-hidden="true">📥 </span>RIPRISTINA DA BACKUP
            <input type="file" id="file-restore" accept=".json" style="display: none;" onchange="ImpostazioniModule.handleRestoreFile(event)">
          </label>
        </div>
      </section>

      <!-- GRUPPO 3: SINCRONIZZAZIONE E CLOUD -->
      <section class="card">
        <h2>GRUPPO 3: SINCRONIZZAZIONE E CONNESSIONE CLOUD</h2>
        <p style="color: #ccc;">
          Stato Connessione: <strong style="color: ${isOnline ? 'var(--mint)' : 'var(--danger)'};">${isOnline ? 'ONLINE' : 'OFFLINE'}</strong> |
          Ultima Sincronizzazione: <strong style="color: var(--mint);">${lastSync}</strong>
        </p>

        ${pendingSync > 0 ? `
        <p role="status" style="color: var(--pink-light); background: rgba(255,128,191,0.08); border: 1px solid var(--pink); border-radius: 6px; padding: 8px 10px; margin-top: 10px;">
          <span aria-hidden="true">⏳ </span>${pendingSync} modifica${pendingSync === 1 ? '' : 'he'} non ancora sincronizzata${pendingSync === 1 ? '' : 'e'} con Google Drive. Verrà${pendingSync === 1 ? '' : 'anno'} ritentata${pendingSync === 1 ? '' : 'e'} automaticamente, oppure puoi forzarla subito qui sotto.
        </p>
        ` : ''}

        <div class="checkbox-group" style="margin: 12px 0;">
          <label class="checkbox-item">
            <input type="checkbox" id="chk-auto-sync" ${autoSyncOnStart ? 'checked' : ''} onchange="localStorage.setItem('motto_auto_sync', this.checked)">
            <span class="checkbox-label">Aggiornamento automatico dati all'avvio</span>
          </label>
        </div>

        <div style="margin-top: 10px; display: flex; gap: 10px; flex-wrap: wrap;">
          ${pendingSync > 0 ? `
          <button class="btn btn-sm btn-pink" onclick="ImpostazioniModule.retryPendingSync()">
            <span aria-hidden="true">🔁 </span>RIPROVA SINCRONIZZAZIONE (${pendingSync})
          </button>
          ` : ''}
          <button class="btn btn-sm btn-primary" onclick="ImpostazioniModule.forceSyncDiarioToCloud()">
            <span aria-hidden="true">☁️ </span>FORZA CARICAMENTO DIARIO SU GOOGLE DRIVE
          </button>
          <button class="btn btn-sm btn-primary" onclick="ImpostazioniModule.testDriveConnection()">
            <span aria-hidden="true">⚡ </span>TEST CONNESSIONE GOOGLE DRIVE
          </button>
          <button class="btn btn-sm btn-pink" onclick="App.forceRefreshApp()">
            <span aria-hidden="true">🔄 </span>SVUOTA CACHE & AGGIORNA APP
          </button>
        </div>

        <div style="margin-top: 14px; padding: 10px; border: 1px solid #333; border-radius: 6px; background-color: #050505;">
          <p style="color: var(--pink-light); font-size: 0.8rem; margin-bottom: 4px;">ENDPOINT CLOUD CONFIGURATO:</p>
          <p style="color: #888; font-size: 0.75rem; word-break: break-all;" class="raw-case">${CONFIG.API_URL}</p>
        </div>
      </section>

      <!-- GRUPPO 4: MINI MANUALE OPERATIVO -->
      <section class="card">
        <h2>GRUPPO 4: MINI MANUALE OPERATIVO</h2>
        <p style="color: #ccc; margin-bottom: 12px;">
          Guida rapida e regole per una compilazione ottimale dei dati accessibili con VoiceOver.
        </p>
        <button class="btn btn-sm btn-primary" onclick="ImpostazioniModule.openMiniManuale()">
          <span aria-hidden="true">📖 </span>CONSULTA MINI MANUALE
        </button>
      </section>

      <!-- GRUPPO 5: INFORMAZIONI, ACCESSIBILITÀ E CREDITI -->
      <section class="card">
        <h2>GRUPPO 5: INFORMAZIONI APP E ACCESSIBILITÀ</h2>
        
        <div class="checkbox-group">
          <label class="checkbox-item">
            <input type="checkbox" id="chk-sound" ${soundEnabled ? 'checked' : ''} onchange="ImpostazioniModule.toggleSound(this.checked)">
            <span class="checkbox-label">Attiva Effetti Sonori Accessibili (Chime / Feedback)</span>
          </label>
        </div>

        <div style="display: flex; align-items: center; gap: 16px; margin: 20px 0;">
          <img src="app-logo.png" alt="Logo Ufficiale Motto On Tour" style="width: 64px; height: 64px; border-radius: 12px; border: 2px solid var(--pink);">
          <div>
            <h3 style="color: var(--pink); margin: 0;">MOTTO ON TOUR</h3>
            <p style="color: var(--mint); font-size: 0.9rem;">Versione ${CONFIG.VERSION} (High Contrast AAA)</p>
          </div>
        </div>

        <div style="border-top: 1px solid #333; padding-top: 14px; margin-top: 14px;">
          <p style="color: #ddd; font-style: italic; line-height: 1.6;">
            "Web App ideata da Roberto Lachin per organizzare e conservare le memorie dei viaggi insieme ad Elena Travaini nel mondo. 💙"
          </p>
        </div>
      </section>
    `;
  },

  // Strumento di gestione e rinomina retroattiva delle compagnie (Punto 3)
  openCompanyManagerModal() {
    const trips = API.data[CONFIG.SHEETS.DIARIO] || [];
    const carrierCountMap = new Map();

    trips.forEach(t => {
      if (t.Compagnie_Vettori) {
        String(t.Compagnie_Vettori).split('\n').map(c => c.trim()).filter(Boolean).forEach(c => {
          carrierCountMap.set(c, (carrierCountMap.get(c) || 0) + 1);
        });
      }
    });

    const carriersList = Array.from(carrierCountMap.entries()).sort((a, b) => a[0].localeCompare(b[0], 'it', { sensitivity: 'base' }));

    const bodyContent = carriersList.length > 0 ? `
      <p style="color: var(--pink-light); margin-bottom: 12px; font-size: 0.9rem;">
        Seleziona una compagnia per rinominarla o unificarla in tutti i viaggi del Diario di bordo:
      </p>
      <div style="max-height: 320px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
        ${carriersList.map(([name, count]) => `
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15);">
            <div>
              <span style="font-weight: 700; color: #FFFFFF;">${name}</span>
              <span style="color: var(--mint); font-size: 0.8rem; margin-left: 8px;">(${count} ${count === 1 ? 'viaggio' : 'viaggi'})</span>
            </div>
            <button class="btn btn-sm btn-pink" onclick="ImpostazioniModule.promptRenameCompany('${name.replace(/'/g, "\\'")}')">
              ✏️ Rinomina
            </button>
          </div>
        `).join('')}
      </div>
    ` : `<p style="color: var(--text-muted);">Nessuna compagnia attualmente registrata nei viaggi.</p>`;

    App.showModal({
      title: "GESTIONE COMPAGNIE E VETTORI",
      bodyHtml: bodyContent,
      confirmLabel: "CHIUDI",
      onConfirm: () => {}
    });
  },

  promptRenameCompany(oldName) {
    const newName = prompt(`Inserisci il nuovo nome corretto per la compagnia "${oldName}":`, oldName);
    if (!newName || newName.trim() === oldName.trim()) return;

    const normalized = CONFIG.normalizeCarrierName(newName.trim());

    API.updateCarrierNameRetroactively(oldName, normalized).then(res => {
      SoundFX.playConfirm();
      App.notify(`Compagnia aggiornata in ${res.count} viaggi con successo!`);
      App.hideModal();
      setTimeout(() => ImpostazioniModule.openCompanyManagerModal(), 200);
    });
  },

  toggleRequirePin(checked) {
    localStorage.setItem('motto_require_pin_always', checked);
    App.notify(`Richiesta PIN ad ogni avvio: ${checked ? 'ATTIVATA' : 'DISATTIVATA'}`);
  },

  toggleSound(checked) {
    localStorage.setItem('motto_sound_enabled', checked);
    if (checked) SoundFX.playConfirm();
    App.notify(`Effetti sonori: ${checked ? 'ABILITATI' : 'DISABILITATI'}`);
  },

  async retryPendingSync() {
    const before = (API.syncQueue && API.syncQueue.length) || 0;
    App.notify("Ritento la sincronizzazione delle modifiche in sospeso...");
    await API.flushSyncQueue();
    const after = (API.syncQueue && API.syncQueue.length) || 0;
    if (after === 0) {
      SoundFX.playConfirm();
      App.notify("Tutte le modifiche in sospeso sono state sincronizzate con Google Drive!");
    } else if (after < before) {
      SoundFX.playConfirm();
      App.notify(`Sincronizzate ${before - after} modifiche. ${after} restano in attesa: riprova più tardi.`);
    } else {
      SoundFX.playAlert();
      App.notify("Impossibile sincronizzare al momento. Verrà ritentato automaticamente più tardi.");
    }
    App.render();
  },

  async testDriveConnection() {
    App.notify("Verifica connessione con Google Drive...");
    const ok = await API.testConnection();
    if (ok) {
      SoundFX.playConfirm();
      App.notify("Connessione a Google Drive attiva e perfettamente funzionante!");
    } else {
      SoundFX.playAlert();
      App.notify("Errore: impossibile comunicare con Google Drive. Verifica la connessione.");
    }
  },

  downloadBackup() {
    const backupData = API.data;
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
    const filename = `Backup_${dateStr}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    SoundFX.playConfirm();
    App.notify(`Backup scaricato con successo: ${filename}`);
  },

  handleRestoreFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const backupData = JSON.parse(e.target.result);
        if (typeof backupData !== 'object') throw new Error("Formato backup non valido");

        App.showModal({
          title: "CONFERMA RIPRISTINO DATABASE",
          bodyHtml: `
            <p style="color: var(--danger); font-size: 1.05rem;">
              Attenzione: il ripristino sovrascriverà tutti i dati attuali nel database con quelli del file di backup.
            </p>
            <p style="color: #ccc; margin-top: 8px;">Confermi di voler procedere?</p>
          `,
          confirmLabel: "CONFERMA RIPRISTINO",
          onConfirm: async () => {
            App.notify("Ripristino del database in corso...");
            await API.restoreBackup(backupData);
            SoundFX.playConfirm();
            App.notify("Database ripristinato con successo!");
            App.render();
          }
        });
      } catch (err) {
        SoundFX.playAlert();
        alert("File di backup non valido o danneggiato.");
      }
    };
    reader.readAsText(file);
  },

  async forceSyncDiarioToCloud() {
    App.notify("Sincronizzazione di tutti i viaggi su Google Drive in corso...");
    try {
      const res = await API.syncAllLocalTripsToCloud();
      if (res && res.success) {
        SoundFX.playConfirm();
        App.notify(`Sincronizzazione completata! ${res.count} viaggi aggiornati su Google Drive.`);
      } else {
        SoundFX.playAlert();
        App.notify("Errore durante la sincronizzazione su Google Drive.");
      }
    } catch (e) {
      SoundFX.playAlert();
      App.notify("Errore di connessione a Google Drive.");
    }
  },

  openMiniManuale() {
    App.showModal({
      title: "MINI MANUALE OPERATIVO",
      bodyHtml: `
        <div style="color: #eee; font-size: 0.95rem; line-height: 1.6;">
          <h3 style="color: var(--mint);">1. Regola Modulo Sfide</h3>
          <p>Nel campo testo della sfida, la <strong>prima riga</strong> viene registrata come <strong>Titolo della Sfida</strong>. Ogni riga successiva genera un singolo obiettivo interattivo con casella di spunta.</p>
          
          <h3 style="color: var(--mint); margin-top: 14px;">2. Regola Punti e Liste a Capo</h3>
          <p>Nei campi Città, Stati, Compagnie, Compagni e Souvenir, inserisci ogni singola voce andando a capo (tasto Invio). Questo consente al sistema di mappare correttamente tappe e coordinate.</p>
          
          <h3 style="color: var(--mint); margin-top: 14px;">3. Inserimento Link</h3>
          <p>I link di Google Drive o del podcast mantengono il formato minuscolo/esatto per garantire il funzionamento dei collegamenti web diretti.</p>

          <h3 style="color: var(--mint); margin-top: 14px;">4. Accessibilità VoiceOver</h3>
          <p>Tutti i testi a video appaiono in MAIUSCOLO per agevolare la vista, ma il lettore di schermo li vocalizza in modo fluido come parole intere.</p>
        </div>
      `,
      confirmLabel: "CHIUDI MANUALE",
      onConfirm: () => {}
    });
  }
};
