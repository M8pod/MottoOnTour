// ==========================================================================
// MOTTO ON TOUR - MAIN APPLICATION CONTROLLER & ROUTER
// ==========================================================================

const App = {
  currentModule: 'home',
  isUnlocked: false,
  modalCallback: null,

  async init() {
    API.init();
    SoundFX.init();

    // Check PIN session
    const savedToken = localStorage.getItem('motto_session_token');
    const requirePinAlways = localStorage.getItem('motto_require_pin_always') === 'true';

    if (savedToken === 'AUTH_OK' && !requirePinAlways) {
      this.isUnlocked = true;
      this.hidePinScreen();
    } else {
      this.showPinScreen();
    }

    // Auto-sync on startup if enabled
    if (localStorage.getItem('motto_auto_sync') !== 'false' && this.isUnlocked) {
      API.fetchAllData(true).then(() => this.render());
    } else {
      this.render();
    }

    // Auto-sync on app resume / tab visibility change (iOS Safari / PWA / Mac / Android)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isUnlocked && navigator.onLine) {
        API.fetchAllData(true).then(() => this.render());
      }
    });

    window.addEventListener('focus', () => {
      if (this.isUnlocked && navigator.onLine) {
        API.fetchAllData(true).then(() => this.render());
      }
    });

    // Register Service Worker and check updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').then((reg) => {
        reg.update().catch(() => {});
      }).catch(() => {});

      let isRefreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!isRefreshing) {
          isRefreshing = true;
          window.location.reload();
        }
      });
    }
  },

  showPinScreen() {
    document.getElementById('pin-screen').style.display = 'flex';
    document.getElementById('app-shell').style.display = 'none';
    setTimeout(() => {
      const pinInput = document.getElementById('input-pin');
      if (pinInput) pinInput.focus();
    }, 100);
  },

  hidePinScreen() {
    document.getElementById('pin-screen').style.display = 'none';
    document.getElementById('app-shell').style.display = 'block';
  },

  handlePinSubmit(e) {
    e.preventDefault();
    const pinVal = document.getElementById('input-pin').value.trim();

    if (pinVal === CONFIG.SECRET_PIN) {
      this.isUnlocked = true;
      localStorage.setItem('motto_session_token', 'AUTH_OK');
      localStorage.setItem('motto_pin', pinVal);
      SoundFX.playConfirm();
      this.notify("PIN corretto. Benvenuti in Motto on Tour!");
      this.hidePinScreen();
      this.navigate('home');
      // Always force a full remote sync on unlock to pull latest challenges and trips from other devices
      API.fetchAllData(true).then(() => this.render());
    } else {
      SoundFX.playAlert();
      this.notify("PIN errato. Riprova.");
      document.getElementById('pin-error').style.display = 'block';
      document.getElementById('input-pin').value = '';
      document.getElementById('input-pin').focus();
    }
  },

  lockApp() {
    this.isUnlocked = false;
    localStorage.removeItem('motto_session_token');
    this.showPinScreen();
    this.notify("Applicazione bloccata.");
  },

  navigate(moduleName) {
    if (!this.isUnlocked) return;

    this.currentModule = moduleName;
    this.render();

    // Move focus to H1 for VoiceOver
    setTimeout(() => {
      const h1 = document.getElementById('screen-title');
      if (h1) {
        h1.focus();
      }
    }, 60);
  },

  render() {
    if (!this.isUnlocked) return;

    const container = document.getElementById('app-container');
    if (!container) return;

    // Update Footer Active Tab
    const footerButtons = document.querySelectorAll('.footer-nav .nav-item');
    footerButtons.forEach(btn => {
      if (btn.dataset.module === this.currentModule) {
        btn.setAttribute('aria-current', 'page');
      } else {
        btn.removeAttribute('aria-current');
      }
    });

    // Render Module View
    try {
      switch (this.currentModule) {
        case 'home':
          HomeModule.render(container);
          break;
        case 'diario':
          DiarioModule.render(container);
          break;
        case 'passaporto':
          PassaportoModule.render(container);
          break;
        case 'sfide':
          SfideModule.render(container);
          break;
        case 'mappe':
          MappeModule.render(container);
          break;
        case 'in-partenza':
          InPartenzaModule.render(container);
          break;
        case 'cassetto':
          CassettoModule.render(container);
          break;
        case 'impostazioni':
          ImpostazioniModule.render(container);
          break;
        default:
          HomeModule.render(container);
      }
    } catch (err) {
      console.error(`Errore nel rendering del modulo ${this.currentModule}:`, err);
      container.innerHTML = `
        <div class="empty-state" style="border-color: var(--danger); background: rgba(255,50,50,0.06); margin-top: 20px;">
          <h2 style="color: var(--danger); margin-top: 0;">⚠️ Si è verificato un errore nel caricamento della schermata</h2>
          <p style="color: #ccc; margin: 10px 0;">${err.message || 'Errore imprevisto'}</p>
          <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 14px;">
            <button class="btn btn-sm btn-primary" onclick="App.navigate('home')">🏠 TORNA ALLA HOME</button>
            <button class="btn btn-sm btn-pink" onclick="App.forceRefreshApp()">🔄 AGGIORNA APPLICAZIONE</button>
          </div>
        </div>
      `;
    }
  },

  // Forza lo svuotamento di tutte le cache locali e service worker per aggiornare l'app
  async forceRefreshApp() {
    this.notify("Svuotamento cache e riavvio dell'applicazione in corso...");
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
    } catch (e) {}
    localStorage.removeItem('motto_database_cache');
    localStorage.removeItem('motto_custom_cities_cache');
    window.location.reload(true);
  },

  // ARIA Live Polite Screen Reader Announcer
  notify(message) {
    const announcer = document.getElementById('aria-live-announcer');
    if (announcer) {
      announcer.textContent = "";
      setTimeout(() => {
        announcer.textContent = message;
      }, 50);
    }
  },

  // Accessible Modal Manager
  showModal({ title, bodyHtml, confirmLabel = "CONFERMA", onConfirm = null }) {
    this.modalCallback = onConfirm;
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body-content').innerHTML = bodyHtml;
    document.getElementById('modal-confirm-btn').textContent = confirmLabel;
    
    const modal = document.getElementById('app-modal');
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');

    setTimeout(() => {
      document.getElementById('modal-title').focus();
    }, 50);
  },

  closeModal() {
    const modal = document.getElementById('app-modal');
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    this.modalCallback = null;
  },

  confirmModalAction() {
    if (typeof this.modalCallback === 'function') {
      this.modalCallback();
    }
    this.closeModal();
  }
};

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
