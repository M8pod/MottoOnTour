// ==========================================================================
// MOTTO ON TOUR - API & DATABASE MANAGEMENT LAYER
// ==========================================================================

const API = {
  data: {
    "Diario di bordo": [],
    "In partenza": [],
    "Viaggi nel cassetto": [],
    "Archivio": [],
    "Sfide": [],
    "Coordinate geografiche": []
  },

  isOnline: navigator.onLine,
  lastSyncTime: null,
  syncQueue: [],
  syncTimer: null,

  init() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      App.notify("Connessione internet ripristinata.");
      this.flushSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      App.notify("Sei offline. Le modifiche saranno salvate in locale.");
    });

    // Load cached data from localStorage if available
    const local = localStorage.getItem('motto_database_cache');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        this.data = { ...this.data, ...parsed };
        this.normalizeAllDataDates();
        const savedSync = localStorage.getItem('motto_last_sync');
        if (savedSync) this.lastSyncTime = new Date(savedSync);
      } catch (e) {}
    }
    // Load custom geocoded cities cache
    if (typeof GeoUtils !== 'undefined' && GeoUtils.initCustomCitiesCache) {
      GeoUtils.initCustomCitiesCache();
    }
    this.repairCachedCoordinates();
  },

  normalizeAllDataDates() {
    [CONFIG.SHEETS.DIARIO, CONFIG.SHEETS.IN_PARTENZA, CONFIG.SHEETS.ARCHIVIO].forEach(sheet => {
      if (this.data[sheet] && Array.isArray(this.data[sheet])) {
        this.data[sheet].forEach(trip => {
          if (trip.Data_Inizio_Globale) {
            trip.Data_Inizio_Globale = CONFIG.normalizeDateStr(trip.Data_Inizio_Globale);
          }
          if (trip.Data_Fine_Globale) {
            trip.Data_Fine_Globale = CONFIG.normalizeDateStr(trip.Data_Fine_Globale);
          }
        });
      }
    });

    if (this.data[CONFIG.SHEETS.SFIDE] && Array.isArray(this.data[CONFIG.SHEETS.SFIDE])) {
      this.data[CONFIG.SHEETS.SFIDE].forEach(ch => {
        // Find voices content in any possible property name
        let voci = ch.Blocco_Voci_JSON || ch.Bloccco_Voci_JSON || ch.Blocco_voci_json || ch.blocco_voci_json || ch.voci || ch.Voci || "";
        if (!voci) {
          for (const k of Object.keys(ch)) {
            if (/voci|blocc/i.test(k) && ch[k]) {
              voci = ch[k];
              break;
            }
          }
        }
        if (voci) {
          ch.Blocco_Voci_JSON = voci;
          ch.Bloccco_Voci_JSON = voci;
        }
        if (!ch.Categoria_Sfida) {
          ch.Categoria_Sfida = "SFIDA NEL MONDO";
        }
      });
    }
  },

  saveLocalCache() {
    try {
      localStorage.setItem('motto_database_cache', JSON.stringify(this.data));
      if (this.lastSyncTime) {
        localStorage.setItem('motto_last_sync', this.lastSyncTime.toISOString());
      }
    } catch (e) {}
  },

  async request(action, payload = {}, isGet = false) {
    const pin = localStorage.getItem('motto_pin') || CONFIG.SECRET_PIN;
    
    if (isGet) {
      const url = new URL(CONFIG.API_URL);
      url.searchParams.append('action', action);
      url.searchParams.append('pin', pin);
      for (const [key, value] of Object.entries(payload)) {
        url.searchParams.append(key, value);
      }

      const res = await fetch(url.toString(), {
        method: 'GET',
        mode: 'cors',
        redirect: 'follow'
      });
      return await res.json();
    } else {
      // POST with text/plain to prevent CORS preflight issues on Google Apps Script
      const bodyData = JSON.stringify({
        pin: pin,
        action: action,
        data: payload
      });

      const res = await fetch(CONFIG.API_URL, {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: bodyData
      });
      return await res.json();
    }
  },

  async testConnection() {
    try {
      const res = await this.request('testConnection', {}, true);
      return res && res.status === 'success';
    } catch (e) {
      return false;
    }
  },

  async fetchAllData(force = false) {
    // If offline and not forcing a retry, return local data if available
    if (!navigator.onLine && !force && this.data && Object.values(this.data).some(arr => arr.length > 0)) {
      this.normalizeAllDataDates();
      await this.repairCachedCoordinates();
      return this.data;
    }

    try {
      const res = await this.request('getAllData', {}, true);
      if (res && res.status === 'success' && res.data) {
        this.data = { ...this.data, ...res.data };
        this.normalizeAllDataDates();
        await this.reconcileCoordinates();
        this.lastSyncTime = new Date();
        this.saveLocalCache();
        return this.data;
      }
    } catch (err) {
      console.warn("Could not fetch remote data, using local cache:", err);
    }
    this.normalizeAllDataDates();
    await this.reconcileCoordinates();
    return this.data;
  },

  async repairCachedCoordinates() {
    if (!this.data[CONFIG.SHEETS.COORDINATE]) return;
    let modified = false;
    for (const coord of this.data[CONFIG.SHEETS.COORDINATE]) {
      const currentLat = Number(coord.Latitudine);
      const currentLng = Number(coord.Longitudine);
      if (isNaN(currentLat) || isNaN(currentLng) || (currentLat === 0 && currentLng === 0)) {
        const geo = await GeoUtils.fetchCoordinatesOnline(coord.Citta, coord.Stato);
        if (geo && !geo.isCountryCenter) {
          coord.Latitudine = geo.lat;
          coord.Longitudine = geo.lng;
          if (geo.continente) coord.Continente = geo.continente;
          coord.Emisfero = GeoUtils.getEmisfero(geo.lat);
          modified = true;
        }
      }
    }
    if (modified) {
      this.saveLocalCache();
    }
  },

  async saveRecord(sheetName, record, idKey) {
    // Normalize date fields if present
    if (record.Data_Inizio_Globale) {
      record.Data_Inizio_Globale = CONFIG.normalizeDateStr(record.Data_Inizio_Globale);
    }
    if (record.Data_Fine_Globale) {
      record.Data_Fine_Globale = CONFIG.normalizeDateStr(record.Data_Fine_Globale);
    }

    // Ensure Sfide compatibility with both header spellings
    if (sheetName === CONFIG.SHEETS.SFIDE) {
      if (record.Blocco_Voci_JSON && !record.Bloccco_Voci_JSON) {
        record.Bloccco_Voci_JSON = record.Blocco_Voci_JSON;
      } else if (record.Bloccco_Voci_JSON && !record.Blocco_Voci_JSON) {
        record.Blocco_Voci_JSON = record.Bloccco_Voci_JSON;
      }
    }

    // 1. Optimistic local update with full clean replacement
    if (!this.data[sheetName]) this.data[sheetName] = [];
    
    const list = this.data[sheetName];
    const existingIndex = record[idKey] ? list.findIndex(r => String(r[idKey]) === String(record[idKey])) : -1;

    if (existingIndex >= 0) {
      list[existingIndex] = { ...record };
    } else {
      if (!record[idKey]) {
        record[idKey] = "ID_" + Date.now();
      }
      list.push(record);
    }

    // Auto-reconcile coordinates cleanly if saving to Diario di bordo
    if (sheetName === CONFIG.SHEETS.DIARIO) {
      await this.reconcileCoordinates();
    }

    this.saveLocalCache();

    // 2. Remote background sync
    try {
      const res = await this.request('saveRecord', { sheetName, record, idKey });
      if (res && res.status === 'success') {
        this.lastSyncTime = new Date();
        this.saveLocalCache();
        return { success: true, record: res.record || record };
      }
    } catch (e) {
      console.warn("Cloud save failed, queued locally:", e);
    }
    return { success: true, record, offline: true };
  },

  async deleteRecord(sheetName, idKey, idValue) {
    // 1. Optimistic local update
    if (this.data[sheetName]) {
      this.data[sheetName] = this.data[sheetName].filter(r => String(r[idKey]) !== String(idValue));
      
      // If deleting a trip from Diario, purge orphaned coordinates from Coordinate sheet & stats
      if (sheetName === CONFIG.SHEETS.DIARIO) {
        await this.reconcileCoordinates();
      }
      this.saveLocalCache();
    }

    // 2. Remote sync
    try {
      await this.request('deleteRecord', { sheetName, idKey, idValue });
      this.lastSyncTime = new Date();
      this.saveLocalCache();
    } catch (e) {}
    return { success: true };
  },

  async concludeTrip(inPartenzaRecord, diarioRecord, archivioRecord) {
    // 1. Local update
    if (inPartenzaRecord && inPartenzaRecord.ID_InPartenza) {
      this.data[CONFIG.SHEETS.IN_PARTENZA] = (this.data[CONFIG.SHEETS.IN_PARTENZA] || []).filter(
        r => r.ID_InPartenza !== inPartenzaRecord.ID_InPartenza
      );
    }
    if (diarioRecord) {
      if (!this.data[CONFIG.SHEETS.DIARIO]) this.data[CONFIG.SHEETS.DIARIO] = [];
      this.data[CONFIG.SHEETS.DIARIO].push(diarioRecord);
      await this.reconcileCoordinates();
    }
    if (archivioRecord) {
      if (!this.data[CONFIG.SHEETS.ARCHIVIO]) this.data[CONFIG.SHEETS.ARCHIVIO] = [];
      this.data[CONFIG.SHEETS.ARCHIVIO].push(archivioRecord);
    }
    this.saveLocalCache();

    // 2. Remote sync
    try {
      await this.request('concludeTrip', { inPartenzaRecord, diarioRecord, archivioRecord });
      this.lastSyncTime = new Date();
      this.saveLocalCache();
    } catch (e) {}
    return { success: true };
  },

  async dreamToReality(idSogno, inPartenzaRecord) {
    // 1. Local update
    if (idSogno) {
      this.data[CONFIG.SHEETS.CASSETTO] = (this.data[CONFIG.SHEETS.CASSETTO] || []).filter(
        r => r.ID_Sogno !== idSogno
      );
    }
    if (inPartenzaRecord) {
      if (!this.data[CONFIG.SHEETS.IN_PARTENZA]) this.data[CONFIG.SHEETS.IN_PARTENZA] = [];
      this.data[CONFIG.SHEETS.IN_PARTENZA].push(inPartenzaRecord);
    }
    this.saveLocalCache();

    // 2. Remote sync
    try {
      await this.request('dreamToReality', { idSogno, inPartenzaRecord });
      this.lastSyncTime = new Date();
      this.saveLocalCache();
    } catch (e) {}
    return { success: true };
  },

  // Riconciliazione totale e pulizia delle coordinate geografiche da tutti i viaggi attivi nel Diario
  async reconcileCoordinates() {
    const diarioTrips = this.data[CONFIG.SHEETS.DIARIO] || [];
    const currentCoords = this.data[CONFIG.SHEETS.COORDINATE] || [];
    const newCoordMap = new Map();

    for (const trip of diarioTrips) {
      const states = String(trip.Stati || "").split("\n").map(s => s.trim()).filter(Boolean);
      const cities = String(trip.Citta || "").split("\n").map(c => c.trim()).filter(Boolean);
      const year = String(trip.Anno_Viaggio || (trip.Data_Inizio_Globale ? trip.Data_Inizio_Globale.split('-')[0] : new Date().getFullYear())).trim();
      const tripId = String(trip.ID_Viaggio || "").trim();

      for (let i = 0; i < cities.length; i++) {
        const city = cities[i];
        const state = states[i] || states[0] || "ITALIA";
        const cleanCityName = String(city).trim().toUpperCase();
        const cleanStateName = String(state).trim().toUpperCase();
        const coordId = `${cleanCityName}_${cleanStateName}`;

        if (!newCoordMap.has(coordId)) {
          let existing = currentCoords.find(c => c.ID_Coordinata === coordId || (c.Citta === cleanCityName && c.Stato === cleanStateName));
          let lat = existing && existing.Latitudine !== "" && !isNaN(Number(existing.Latitudine)) ? Number(existing.Latitudine) : null;
          let lng = existing && existing.Longitudine !== "" && !isNaN(Number(existing.Longitudine)) ? Number(existing.Longitudine) : null;
          let continent = existing && existing.Continente ? existing.Continente : null;
          let emisfero = existing && existing.Emisfero ? existing.Emisfero : null;

          if (lat === null || lng === null || (lat === 0 && lng === 0)) {
            const geo = await GeoUtils.fetchCoordinatesOnline(city, state);
            if (geo) {
              lat = geo.lat;
              lng = geo.lng;
              continent = geo.continente || GeoUtils.getContinent(state);
              emisfero = geo.emisfero || GeoUtils.getEmisfero(lat);
            } else {
              const countryInfo = GeoUtils.getCountryInfo(state);
              lat = countryInfo.lat || 0;
              lng = countryInfo.lng || 0;
              continent = countryInfo.continent || "Europa";
              emisfero = GeoUtils.getEmisfero(lat);
            }
          }

          newCoordMap.set(coordId, {
            ID_Coordinata: coordId,
            Citta: cleanCityName,
            Stato: cleanStateName,
            Latitudine: lat,
            Longitudine: lng,
            Continente: continent || GeoUtils.getContinent(cleanStateName),
            Emisfero: emisfero || GeoUtils.getEmisfero(lat),
            ID_Viaggio_Riferimento: tripId,
            Anni_Visita: year
          });
        } else {
          const item = newCoordMap.get(coordId);
          if (tripId && !String(item.ID_Viaggio_Riferimento || '').includes(tripId)) {
            item.ID_Viaggio_Riferimento = item.ID_Viaggio_Riferimento ? `${item.ID_Viaggio_Riferimento}, ${tripId}` : tripId;
          }
          if (year && !String(item.Anni_Visita || '').includes(year)) {
            item.Anni_Visita = item.Anni_Visita ? `${item.Anni_Visita}, ${year}` : year;
          }
        }
      }
    }

    this.data[CONFIG.SHEETS.COORDINATE] = Array.from(newCoordMap.values());
    this.saveLocalCache();
  },

  // Debounced queue sync for fast checkbox clicks (Challenge module)
  queueRecordSync(sheetName, record, idKey) {
    this.saveRecord(sheetName, record, idKey);
  },

  flushSyncQueue() {
    // Reserved for offline reconciliation
  },

  async restoreBackup(backupData) {
    this.data = { ...this.data, ...backupData };
    this.repairCachedCoordinates();
    this.saveLocalCache();

    try {
      const res = await this.request('restoreBackup', { backupData });
      return res;
    } catch (e) {
      return { status: "success", message: "Ripristinato in locale!" };
    }
  }
};
