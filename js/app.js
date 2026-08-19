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
      API.fetchAllData().then(() => this.render());
    } else {
      this.render();
    }

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
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
      API.fetchAllData().then(() => this.render());
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
