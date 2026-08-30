// ==========================================================================
// MODULO 06: IL MIO PASSAPORTO - CENTRO STATISTICO, RECORD E ANALISI
// ==========================================================================

const PassaportoModule = {
  currentCategory: 'main', // 'main', 'geografia', 'intensita', 'storico', 'compagni', 'economia', 'citta_dettaglio', 'galleria_ricordi', 'traguardi_esplorazioni'
  selectedCompanion: null,
  selectedCity: null,
  selectedCarrier: null,

  render(container) {
    try {
      if (this.currentCategory === 'geografia') {
        this.renderGeografia(container);
      } else if (this.currentCategory === 'citta_dettaglio') {
        this.renderCityDrillDown(container);
      } else if (this.currentCategory === 'galleria_ricordi') {
        this.renderGalleriaRicordi(container);
      } else if (this.currentCategory === 'traguardi_esplorazioni') {
        this.renderTraguardiEsplorazioni(container);
      } else if (this.currentCategory === 'intensita') {
        this.renderIntensita(container);
      } else if (this.currentCategory === 'storico') {
        this.renderStorico(container);
      } else if (this.currentCategory === 'compagni') {
        this.renderCompagni(container);
      } else if (this.currentCategory === 'economia') {
        this.renderEconomia(container);
      } else {
        this.renderMain(container);
      }
    } catch (err) {
      console.error("Errore nel modulo Passaporto:", err);
      container.innerHTML = `
        <div class="action-bar">
          <button class="btn btn-sm btn-pink" onclick="PassaportoModule.currentCategory='main'; App.render();">
            <span aria-hidden="true">⬅️ </span>TORNA AL PASSAPORTO
          </button>
        </div>
        <div class="empty-state" style="border-color: var(--danger); background: rgba(255,50,50,0.06); margin-top: 16px;">
          <h2 style="color: var(--danger); margin-top: 0;">⚠️ Si è verificato un problema nel calcolo delle statistiche</h2>
          <p style="color: #ccc; margin: 10px 0;">${err.message || 'Errore imprevisto'}</p>
          <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 14px;">
            <button class="btn btn-sm btn-primary" onclick="PassaportoModule.currentCategory='main'; App.render();">
              <span aria-hidden="true">🔄 </span>RICARICA PASSAPORTO
            </button>
            <button class="btn btn-sm btn-pink" onclick="App.navigate('home')">
              <span aria-hidden="true">🏠 </span>TORNA ALLA HOME
            </button>
          </div>
        </div>
      `;
    }
  },

  getAggregatedData() {
    if (typeof API !== 'undefined' && API.normalizeAllTripsData) {
      API.normalizeAllTripsData();
    }
    const trips = API.data[CONFIG.SHEETS.DIARIO] || [];
    const coords = API.data[CONFIG.SHEETS.COORDINATE] || [];

    const totalTrips = trips.length;

    // States & Continents
    const visitedStatesMap = new Map();
    const visitedCitiesMap = new Map();
    const cityStateMap = new Map();
    const carriersSet = new Set();
    const companionsSet = new Set();
    let totalSpend = 0;
    let totalSouvenirs = 0;
    let totalDaysTraveled = 0;
    let totalKilometersTraveled = 0;
    let mostExpensiveTrip = null;
    let maxCost = 0;
    let robyEleCount = 0;
    let ciurmaCount = 0;

    // Collezioni Souvenir ed Esperienze Strutturate
    const starbucksItems = [];
    const pandoraItems = [];
    const riproduzioniItems = [];
    const otherSouvenirs = [];

    const torriItems = [];
    const parchiItems = [];
    const ruoteItems = [];
    const catCaffeItems = [];
    const caffeStoriciItems = [];
    const otherExperiences = [];

    const tripsByYear = {};
    const transportCounts = {};
    const budgetByCategory = {};
    CONFIG.EXPENSE_CATEGORIES.forEach(c => budgetByCategory[c.key] = 0);

    const tripsWithIntensity = trips.map(t => {
      const days = GeoUtils.calculateTripDurationDays(t);
      const km = GeoUtils.calculateTripDistanceKm(t);
      const intensity = GeoUtils.calculateTripIntensityScore(t);

      totalDaysTraveled += days;
      totalKilometersTraveled += km;

      // Year
      const y = t.Anno_Viaggio || (t.Data_Inizio_Globale ? String(t.Data_Inizio_Globale).split('-')[0] : 'Altro');
      tripsByYear[y] = (tripsByYear[y] || 0) + 1;

      // States
      const tripStates = t.Stati ? String(t.Stati).split('\n').map(s => s.trim().toUpperCase()).filter(Boolean) : [];
      tripStates.forEach(st => {
        visitedStatesMap.set(st, (visitedStatesMap.get(st) || 0) + 1);
      });

      // Cities
      if (t.Citta) {
        String(t.Citta).split('\n').map(c => c.trim()).filter(Boolean).forEach((ct, idx) => {
          const parsed = GeoUtils.parseCityAndState(ct, tripStates);
          const cleanCity = parsed.city || ct;
          const resolvedState = parsed.state || tripStates[idx] || tripStates[0] || 'ITALIA';
          
          if (!visitedCitiesMap.has(cleanCity)) visitedCitiesMap.set(cleanCity, []);
          visitedCitiesMap.get(cleanCity).push(t);
          if (!cityStateMap.has(cleanCity)) cityStateMap.set(cleanCity, resolvedState);
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
        const rawVal = t[c.key];
        const val = (typeof rawVal === 'number') ? rawVal : (parseFloat(String(rawVal || 0).replace(',', '.')) || 0);
        budgetByCategory[c.key] += val;
        tripCost += val;
      });
      totalSpend += tripCost;
      if (tripCost > maxCost) {
        maxCost = tripCost;
        mostExpensiveTrip = t;
      }

      // Timestamp per ordinamento cronologico dal più recente al più vecchio (Punto 2)
      const getTripTimestamp = (tripObj) => {
        if (tripObj.Data_Fine_Globale) {
          const norm = CONFIG.normalizeDateStr(tripObj.Data_Fine_Globale);
          const p = norm.split("-");
          if (p.length === 3) return new Date(p[0], p[1] - 1, p[2], 23, 59, 59).getTime();
        }
        if (tripObj.Data_Inizio_Globale) {
          const norm = CONFIG.normalizeDateStr(tripObj.Data_Inizio_Globale);
          const p = norm.split("-");
          if (p.length === 3) return new Date(p[0], p[1] - 1, p[2], 0, 0, 0).getTime();
        }
        if (tripObj.Anno_Viaggio) {
          const y = parseInt(String(tripObj.Anno_Viaggio).match(/\d{4}/)?.[0] || '0');
          if (y > 0) return new Date(y, 11, 31, 23, 59, 59).getTime();
        }
        return 0;
      };

      const tripTime = getTripTimestamp(t);
      const dStart = CONFIG.formatDateDisplay(t.Data_Inizio_Globale);
      const dEnd = CONFIG.formatDateDisplay(t.Data_Fine_Globale);
      const dLabel = dStart && dEnd ? `${dStart} ➔ ${dEnd}` : (dStart || (t.Anno_Viaggio ? `Anno ${t.Anno_Viaggio}` : ''));

      // Raccolta Souvenir
      if (t.Souvenir_Starbucks) {
        String(t.Souvenir_Starbucks).split('\n').map(s => s.trim()).filter(Boolean).forEach(item => {
          starbucksItems.push({ item, tripName: t.Nome_Viaggio, tripId: t.ID_Viaggio, date: dLabel, timestamp: tripTime, stati: t.Stati, citta: t.Citta });
        });
      }
      if (t.Souvenir_Pandora) {
        String(t.Souvenir_Pandora).split('\n').map(s => s.trim()).filter(Boolean).forEach(item => {
          pandoraItems.push({ item, tripName: t.Nome_Viaggio, tripId: t.ID_Viaggio, date: dLabel, timestamp: tripTime, stati: t.Stati, citta: t.Citta });
        });
      }
      if (t.Souvenir_Riproduzioni) {
        String(t.Souvenir_Riproduzioni).split('\n').map(s => s.trim()).filter(Boolean).forEach(item => {
          riproduzioniItems.push({ item, tripName: t.Nome_Viaggio, tripId: t.ID_Viaggio, date: dLabel, timestamp: tripTime, stati: t.Stati, citta: t.Citta });
        });
      }
      const otherSouvText = t.Souvenir_Altri !== undefined ? t.Souvenir_Altri : (t.Souvenir || '');
      if (otherSouvText) {
        String(otherSouvText).split('\n').map(s => s.trim()).filter(Boolean).forEach(item => {
          otherSouvenirs.push({ item, tripName: t.Nome_Viaggio, tripId: t.ID_Viaggio, date: dLabel, timestamp: tripTime, stati: t.Stati, citta: t.Citta });
        });
      }

      // Raccolta Esperienze
      if (t.Esperienze_Torri) {
        String(t.Esperienze_Torri).split('\n').map(s => s.trim()).filter(Boolean).forEach(item => {
          torriItems.push({ item, tripName: t.Nome_Viaggio, tripId: t.ID_Viaggio, date: dLabel, timestamp: tripTime, stati: t.Stati, citta: t.Citta });
        });
      }
      if (t.Esperienze_Parchi) {
        String(t.Esperienze_Parchi).split('\n').map(s => s.trim()).filter(Boolean).forEach(item => {
          parchiItems.push({ item, tripName: t.Nome_Viaggio, tripId: t.ID_Viaggio, date: dLabel, timestamp: tripTime, stati: t.Stati, citta: t.Citta });
        });
      }
      if (t.Esperienze_Ruote) {
        String(t.Esperienze_Ruote).split('\n').map(s => s.trim()).filter(Boolean).forEach(item => {
          ruoteItems.push({ item, tripName: t.Nome_Viaggio, tripId: t.ID_Viaggio, date: dLabel, timestamp: tripTime, stati: t.Stati, citta: t.Citta });
        });
      }
      if (t.Esperienze_CatCaffe) {
        String(t.Esperienze_CatCaffe).split('\n').map(s => s.trim()).filter(Boolean).forEach(item => {
          catCaffeItems.push({ item, tripName: t.Nome_Viaggio, tripId: t.ID_Viaggio, date: dLabel, timestamp: tripTime, stati: t.Stati, citta: t.Citta });
        });
      }
      if (t.Esperienze_CaffeStorici) {
        String(t.Esperienze_CaffeStorici).split('\n').map(s => s.trim()).filter(Boolean).forEach(item => {
          caffeStoriciItems.push({ item, tripName: t.Nome_Viaggio, tripId: t.ID_Viaggio, date: dLabel, timestamp: tripTime, stati: t.Stati, citta: t.Citta });
        });
      }
      const otherEspText = t.Esperienze_Altri !== undefined ? t.Esperienze_Altri : (t.Esperienze_Luoghi || '');
      if (otherEspText) {
        String(otherEspText).split('\n').map(s => s.trim()).filter(Boolean).forEach(item => {
          otherExperiences.push({ item, tripName: t.Nome_Viaggio, tripId: t.ID_Viaggio, date: dLabel, timestamp: tripTime, stati: t.Stati, citta: t.Citta });
        });
      }

      totalSouvenirs = starbucksItems.length + pandoraItems.length + riproduzioniItems.length + otherSouvenirs.length;

      return {
        ...t,
        days,
        km,
        intensity
      };
    });

    // Ordinamento cronologico decrescente per tutte le liste di souvenir ed esperienze (dal più recente al più vecchio)
    const sortByRecent = (arr) => arr.sort((a, b) => b.timestamp - a.timestamp);
    sortByRecent(starbucksItems);
    sortByRecent(pandoraItems);
    sortByRecent(riproduzioniItems);
    sortByRecent(otherSouvenirs);
    sortByRecent(torriItems);
    sortByRecent(parchiItems);
    sortByRecent(ruoteItems);
    sortByRecent(catCaffeItems);
    sortByRecent(caffeStoriciItems);
    sortByRecent(otherExperiences);

    const visitedStatesCount = visitedStatesMap.size;
    const totalCitiesCount = visitedCitiesMap.size;
    const totalCountries = CONFIG.TOTAL_WORLD_COUNTRIES || 195;
    const worldPercentage = ((visitedStatesCount / totalCountries) * 100).toFixed(1).replace('.', ',');
    const geoStats = GeoUtils.computeGeoStats(coords);

    // Giri della terra (40075 km) e Distanza Terra-Luna (384400 km)
    const earthCircumference = 40075;
    const moonDistance = 384400;
    const completedEarthLaps = Math.floor(totalKilometersTraveled / earthCircumference);
    const currentEarthLapKm = totalKilometersTraveled % earthCircumference;
    const earthLapPercent = ((currentEarthLapKm / earthCircumference) * 100).toFixed(1);

    const completedMoonTrips = Math.floor(totalKilometersTraveled / moonDistance);
    const currentMoonKm = totalKilometersTraveled % moonDistance;
    const moonPercent = ((totalKilometersTraveled / moonDistance) * 100).toFixed(1);

    // Classifica di Intensità Viaggi (Bollini 1-10)
    const rankedByIntensity = [...tripsWithIntensity].sort((a, b) => ((b.intensity && b.intensity.computedScore) || 0) - ((a.intensity && a.intensity.computedScore) || 0) || (b.km || 0) - (a.km || 0));
    const top3IntenseTrips = rankedByIntensity.slice(0, 3);
    const bottom3IntenseTrips = [...rankedByIntensity].reverse().slice(0, 3);

    // Calcolo Badge Progressivi Milestone (Punto 7 & Migliorie A-B)
    // Ordine: Torri (5), Parchi (4), Ruote (5), Cat caffè (4), Caffè storici (5), Starbucks (10), Pandora (10), Riproduzioni (10)
    const computeMilestone = (count, stepSize) => {
      const level = Math.floor(count / stepSize);
      const nextMilestone = count >= 100 ? 100 : (level + 1) * stepSize;
      const progressPercent = count >= 100 ? 100 : Math.min(100, Math.round(((count % stepSize) / stepSize) * 100));
      const isSuper = count >= 100;
      return { count, level, stepSize, nextMilestone, progressPercent, isSuper };
    };

    const badges = {
      torri: computeMilestone(torriItems.length, 5),
      parchi: computeMilestone(parchiItems.length, 4),
      ruote: computeMilestone(ruoteItems.length, 5),
      catCaffe: computeMilestone(catCaffeItems.length, 4),
      caffeStorici: computeMilestone(caffeStoriciItems.length, 5),
      starbucks: computeMilestone(starbucksItems.length, 10),
      pandora: computeMilestone(pandoraItems.length, 10),
      riproduzioni: computeMilestone(riproduzioniItems.length, 10)
    };

    return {
      totalTrips,
      totalSpend,
      totalCitiesCount,
      visitedStatesCount,
      worldPercentage,
      visitedStatesMap,
      visitedCitiesMap,
      cityStateMap,
      tripsByYear,
      transportCounts,
      carriersSet,
      companionsSet,
      robyEleCount,
      robyElePercent: totalTrips > 0 ? ((robyEleCount / totalTrips) * 100).toFixed(0) : '0',
      ciurmaCount,
      ciurmaPercent: totalTrips > 0 ? ((ciurmaCount / totalTrips) * 100).toFixed(0) : '0',
      budgetByCategory,
      mostExpensiveTrip,
      maxCost,
      totalSouvenirs,
      starbucksItems,
      pandoraItems,
      riproduzioniItems,
      otherSouvenirs,
      torriItems,
      parchiItems,
      ruoteItems,
      catCaffeItems,
      caffeStoriciItems,
      otherExperiences,
      badges,
      totalDaysTraveled,
      totalKilometersTraveled,
      completedEarthLaps,
      currentEarthLapKm,
      earthLapPercent,
      completedMoonTrips,
      moonPercent,
      tripsWithIntensity,
      rankedByIntensity,
      top3IntenseTrips,
      bottom3IntenseTrips,
      geoStats
    };
  },

  openCategory(cat) {
    this.currentCategory = cat;
    this.selectedCompanion = null;
    this.selectedCity = null;
    this.selectedCarrier = null;
    App.render();
  },

  openCityDrillDown(cityName) {
    this.selectedCity = cityName;
    this.currentCategory = 'citta_dettaglio';
    App.render();
  },

  renderCityDrillDown(container) {
    const cityName = this.selectedCity;
    const trips = API.data[CONFIG.SHEETS.DIARIO] || [];
    const coords = API.data[CONFIG.SHEETS.COORDINATE] || [];
    const cityCoord = coords.find(co => co && co.Citta && co.Citta.toUpperCase() === String(cityName).toUpperCase()) || {};
    const flag = GeoUtils.getFlag(cityCoord.Stato || 'Italia');

    // Trova tutti i viaggi che contengono questa città
    const matchedTrips = trips.filter(t => {
      if (!t.Citta) return false;
      const lines = String(t.Citta).split('\n').map(c => c.trim()).filter(Boolean);
      return lines.some(line => {
        const parsed = GeoUtils.parseCityAndState(line);
        return (parsed.city || line).toUpperCase() === String(cityName).toUpperCase();
      });
    });

    // Ordina in ordine cronologico decrescente (dal più recente al più vecchio)
    matchedTrips.sort((a, b) => {
      const getEndDate = (t) => {
        if (t.Data_Fine_Globale) {
          const norm = CONFIG.normalizeDateStr(t.Data_Fine_Globale);
          const p = norm.split("-");
          if (p.length === 3) return new Date(p[0], p[1] - 1, p[2], 23, 59, 59).getTime();
        }
        if (t.Data_Inizio_Globale) {
          const norm = CONFIG.normalizeDateStr(t.Data_Inizio_Globale);
          const p = norm.split("-");
          if (p.length === 3) return new Date(p[0], p[1] - 1, p[2], 23, 59, 59).getTime();
        }
        if (t.Anno_Viaggio) {
          const y = parseInt(String(t.Anno_Viaggio).match(/\d{4}/)?.[0] || '0');
          if (y > 0) return new Date(y, 0, 1, 12, 0, 0).getTime();
        }
        return 0;
      };
      return getEndDate(b) - getEndDate(a);
    });

    container.innerHTML = `
      <div class="action-bar" style="justify-content: space-between; flex-wrap: wrap; gap: 8px;">
        <button class="btn btn-sm btn-pink" onclick="PassaportoModule.openCategory('geografia')">
          <span aria-hidden="true">⬅️ </span>TORNA A GEOGRAFIA
        </button>
      </div>

      <h1 id="screen-title" tabindex="-1" style="margin-top: 10px;">${flag} ${cityName.toUpperCase()}</h1>
      <p style="color: var(--pink-light); margin-bottom: 16px;">
        Elenco cronologico di tutti i viaggi in cui è presente la tappa <strong>${cityName}</strong> (${matchedTrips.length} ${matchedTrips.length === 1 ? 'viaggio' : 'viaggi'}).
      </p>

      ${matchedTrips.length > 0 ? `
        <div class="trips-list">
          ${matchedTrips.map(t => {
            const dStart = CONFIG.formatDateDisplay(t.Data_Inizio_Globale);
            const dEnd = CONFIG.formatDateDisplay(t.Data_Fine_Globale);
            const dateText = dStart && dEnd ? `Dal ${dStart} al ${dEnd}` : (dStart ? `Data ${dStart}` : (t.Anno_Viaggio ? `Anno ${t.Anno_Viaggio}` : ''));
            const badgeHtml = GeoUtils.getIntensityBadgeHtml(t);
            return `
              <button type="button" class="card card-mint card-interactive card-btn" onclick="DiarioModule.openTripDetails('${t.ID_Viaggio}', 'passaporto')" aria-label="${t.Nome_Viaggio}. ${dateText}. ${t.Stati ? `Stati: ${t.Stati.replace(/\n/g, ', ')}.` : ''} Tocca due volte per aprire i dettagli del viaggio nel Diario di bordo.">
                <div aria-hidden="true">
                  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
                    <h3 style="color: var(--mint); margin: 0;">${t.Nome_Viaggio}</h3>
                    <div style="display: flex; gap: 6px; align-items: center;">
                      ${badgeHtml}
                      <span class="btn btn-sm btn-pink">${t.Tipologia_Viaggio || 'Viaggio'}</span>
                    </div>
                  </div>
                  <p style="color: #ccc; font-size: 0.9rem; margin-top: 6px;">
                    📅 ${dStart && dEnd ? `${dStart} -> ${dEnd}` : (t.Anno_Viaggio || dStart || '-')}
                    ${t.Stati ? ` | 📍 ${t.Stati.replace(/\n/g, ', ')}` : ''}
                  </p>
                </div>
              </button>
            `;
          }).join('')}
        </div>
      ` : `
        <div class="empty-state">
          <p class="empty-state-text">Nessun viaggio registrato per questa città.</p>
        </div>
      `}
    `;
  },

  renderMain(container) {
    const stats = this.getAggregatedData();
    const hasYearBadge = stats.totalDaysTraveled >= 365;
    const yearsTraveledCount = Math.floor(stats.totalDaysTraveled / 365);
    const b = stats.badges;

    container.innerHTML = `
      <div class="action-bar" style="justify-content: space-between; flex-wrap: wrap; gap: 8px;">
        <h1 id="screen-title" tabindex="-1">IL MIO PASSAPORTO</h1>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-sm btn-pink" onclick="PassaportoModule.openPdfReport()">
            <span aria-hidden="true">📄 </span>GENERA PDF
          </button>
          <button class="btn btn-sm btn-primary" onclick="PassaportoModule.openChartModal()">
            <span aria-hidden="true">📊 </span>ESPORTA GRAFICI
          </button>
        </div>
      </div>

      <p style="color: var(--pink-light); margin-bottom: 16px;">
        Centro statistico, record di coppia, badge milestone e analisi dettagliata di tutte le nostre avventure nel mondo.
      </p>

      <!-- 1. SEZIONE TRAGUARDI: GIORNI VIAGGIATI (BADGE 365) & GIRI DELLA TERRA / LUNA (PUNTO 4) -->
      <section class="card" style="border: 2px solid ${hasYearBadge ? 'var(--mint)' : 'var(--pink)'}; background: ${hasYearBadge ? 'linear-gradient(135deg, rgba(255,128,191,0.12), rgba(0,255,163,0.14))' : 'rgba(255,128,191,0.06)'}; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <h2 style="margin: 0; color: ${hasYearBadge ? 'var(--mint)' : 'var(--pink)'}; border: none;">
            ${hasYearBadge ? '🏅 TRAGUARDO: 365+ GIORNI DI VITA ON THE ROAD!' : '📅 TEMPO E DISTANZE IN VIAGGIO'}
          </h2>
          ${hasYearBadge ? `
            <span style="background: var(--mint); color: #000; font-weight: 800; font-size: 0.85rem; padding: 4px 10px; border-radius: 12px;">
              ✨ ${yearsTraveledCount} ${yearsTraveledCount === 1 ? 'ANNO' : 'ANNI'} DI VIAGGIO!
            </span>
          ` : ''}
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; margin-top: 14px;">
          <!-- BOX 1: GIORNI TOTALI -->
          <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 12px;">
            <p style="color: #aaa; font-size: 0.85rem; margin: 0;">GIORNI TOTALI IN VIAGGIO</p>
            <p class="stat-value" style="font-size: 1.4rem; margin: 4px 0;">
              📅 ${stats.totalDaysTraveled} GIORNI
            </p>
            <p style="color: var(--pink-light); font-size: 0.85rem; margin: 4px 0 6px 0;">
              ${hasYearBadge ? `Traguardo 365 giorni superato con successo!` : `${stats.totalDaysTraveled} / 365 giorni verso il 1° Anno di Viaggi (${((stats.totalDaysTraveled/365)*100).toFixed(1)}%)`}
            </p>
            <div class="progress-container" style="height: 8px;">
              <div class="progress-fill" style="width: ${Math.min(100, Math.round((stats.totalDaysTraveled/365)*100))}%;"></div>
            </div>
          </div>

          <!-- BOX 2: GIRI DELLA TERRA (40075 KM) -->
          <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 12px;">
            <p style="color: #aaa; font-size: 0.85rem; margin: 0;">GIRI DELLA TERRA ALL'EQUATORE (40075 KM)</p>
            <p class="stat-value" style="font-size: 1.4rem; margin: 4px 0;">
              🌐 ${stats.completedEarthLaps} ${stats.completedEarthLaps === 1 ? 'GIRO COMPLETATO' : 'GIRI COMPLETATI'}
            </p>
            <p style="color: var(--mint); font-size: 0.85rem; margin: 4px 0 6px 0;">
              ${stats.currentEarthLapKm} / 40075 km verso il prossimo giro (${stats.earthLapPercent}%)
            </p>
            <div class="progress-container" style="height: 8px;">
              <div class="progress-fill" style="width: ${stats.earthLapPercent}%; background: var(--mint);"></div>
            </div>
          </div>

          <!-- BOX 3: DISTANZA TERRA - LUNA (384400 KM) -->
          <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 12px;">
            <p style="color: #aaa; font-size: 0.85rem; margin: 0;">DISTANZA VERSO LA LUNA (384400 KM)</p>
            <p class="stat-value" style="font-size: 1.4rem; margin: 4px 0;">
              🚀 ${stats.totalKilometersTraveled} KM PERCORSI
            </p>
            <p style="color: var(--pink-light); font-size: 0.85rem; margin: 4px 0 6px 0;">
              ${stats.moonPercent}% della distanza Terra-Luna coperta insieme!
            </p>
            <div class="progress-container" style="height: 8px;">
              <div class="progress-fill" style="width: ${Math.min(100, parseFloat(stats.moonPercent))}%; background: var(--pink);"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. SEZIONE BADGE MILESTONE PROGRESSIVI (PUNTO 7 & MIGLIORIE A-B) -->
      <section class="card" style="border: 2px solid var(--mint); background: rgba(0,255,163,0.04); margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <h2 style="margin: 0; color: var(--mint); border: none;">
            🏅 BADGE PROGRESSIVI E SUPER BADGE CENTENARI
          </h2>
          <span style="font-size: 0.85rem; color: #aaa;">Sblocco progressivo ogni 10/5/4 unità & Super Badge a 100+</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; margin-top: 14px;">
          <!-- 1. TORRI (ogni 5) -->
          <div style="background: rgba(0,0,0,0.5); border: 1.5px solid ${b.torri.isSuper ? 'var(--mint)' : (b.torri.level > 0 ? 'var(--pink)' : 'rgba(255,255,255,0.15)')}; border-radius: 8px; padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 800; color: var(--pink); font-size: 1rem;">🗼 Torri Panoramiche</span>
              <span style="background: ${b.torri.isSuper ? 'var(--mint)' : 'var(--pink)'}; color: #000; font-weight: 800; font-size: 0.75rem; padding: 2px 6px; border-radius: 6px;">
                ${b.torri.isSuper ? '🌟 SUPER BADGE' : `LIV. ${b.torri.level}`}
              </span>
            </div>
            <p class="stat-value" style="font-size: 1.3rem; margin: 6px 0;">${b.torri.count} torri</p>
            <p style="color: #ccc; font-size: 0.8rem; margin: 0 0 6px 0;">
              ${b.torri.isSuper ? 'Traguardo Centenario 100+ sbloccato!' : `Prossimo badge a ${b.torri.nextMilestone} torri (${b.torri.count % 5}/5)`}
            </p>
            <div class="progress-container" style="height: 6px;">
              <div class="progress-fill" style="width: ${b.torri.progressPercent}%; background: var(--pink);"></div>
            </div>
          </div>

          <!-- 2. PARCHI TEMATICI (ogni 4) -->
          <div style="background: rgba(0,0,0,0.5); border: 1.5px solid ${b.parchi.isSuper ? 'var(--mint)' : (b.parchi.level > 0 ? 'var(--mint)' : 'rgba(255,255,255,0.15)')}; border-radius: 8px; padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 800; color: var(--mint); font-size: 1rem;">🎢 Parchi Tematici</span>
              <span style="background: ${b.parchi.isSuper ? 'var(--mint)' : 'var(--mint)'}; color: #000; font-weight: 800; font-size: 0.75rem; padding: 2px 6px; border-radius: 6px;">
                ${b.parchi.isSuper ? '🌟 SUPER BADGE' : `LIV. ${b.parchi.level}`}
              </span>
            </div>
            <p class="stat-value" style="font-size: 1.3rem; margin: 6px 0;">${b.parchi.count} parchi</p>
            <p style="color: #ccc; font-size: 0.8rem; margin: 0 0 6px 0;">
              ${b.parchi.isSuper ? 'Traguardo Centenario 100+ sbloccato!' : `Prossimo badge a ${b.parchi.nextMilestone} parchi (${b.parchi.count % 4}/4)`}
            </p>
            <div class="progress-container" style="height: 6px;">
              <div class="progress-fill" style="width: ${b.parchi.progressPercent}%; background: var(--mint);"></div>
            </div>
          </div>

          <!-- 3. RUOTE (ogni 5) -->
          <div style="background: rgba(0,0,0,0.5); border: 1.5px solid ${b.ruote.isSuper ? 'var(--mint)' : (b.ruote.level > 0 ? 'var(--pink)' : 'rgba(255,255,255,0.15)')}; border-radius: 8px; padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 800; color: var(--mint); font-size: 1rem;">🎡 Ruote Panoramiche</span>
              <span style="background: ${b.ruote.isSuper ? 'var(--mint)' : 'var(--pink)'}; color: #000; font-weight: 800; font-size: 0.75rem; padding: 2px 6px; border-radius: 6px;">
                ${b.ruote.isSuper ? '🌟 SUPER BADGE' : `LIV. ${b.ruote.level}`}
              </span>
            </div>
            <p class="stat-value" style="font-size: 1.3rem; margin: 6px 0;">${b.ruote.count} ruote</p>
            <p style="color: #ccc; font-size: 0.8rem; margin: 0 0 6px 0;">
              ${b.ruote.isSuper ? 'Traguardo Centenario 100+ sbloccato!' : `Prossimo badge a ${b.ruote.nextMilestone} ruote (${b.ruote.count % 5}/5)`}
            </p>
            <div class="progress-container" style="height: 6px;">
              <div class="progress-fill" style="width: ${b.ruote.progressPercent}%; background: var(--mint);"></div>
            </div>
          </div>

          <!-- 4. CAT CAFFÈ (ogni 4) -->
          <div style="background: rgba(0,0,0,0.5); border: 1.5px solid ${b.catCaffe.isSuper ? 'var(--mint)' : (b.catCaffe.level > 0 ? 'var(--pink)' : 'rgba(255,255,255,0.15)')}; border-radius: 8px; padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 800; color: var(--pink); font-size: 1rem;">🐱 Cat Caffè</span>
              <span style="background: ${b.catCaffe.isSuper ? 'var(--mint)' : 'var(--pink)'}; color: #000; font-weight: 800; font-size: 0.75rem; padding: 2px 6px; border-radius: 6px;">
                ${b.catCaffe.isSuper ? '🌟 SUPER BADGE' : `LIV. ${b.catCaffe.level}`}
              </span>
            </div>
            <p class="stat-value" style="font-size: 1.3rem; margin: 6px 0;">${b.catCaffe.count} cat caffè</p>
            <p style="color: #ccc; font-size: 0.8rem; margin: 0 0 6px 0;">
              ${b.catCaffe.isSuper ? 'Traguardo Centenario 100+ sbloccato!' : `Prossimo badge a ${b.catCaffe.nextMilestone} cat caffè (${b.catCaffe.count % 4}/4)`}
            </p>
            <div class="progress-container" style="height: 6px;">
              <div class="progress-fill" style="width: ${b.catCaffe.progressPercent}%; background: var(--pink);"></div>
            </div>
          </div>

          <!-- 5. CAFFÈ STORICI (ogni 5) -->
          <div style="background: rgba(0,0,0,0.5); border: 1.5px solid ${b.caffeStorici.isSuper ? 'var(--mint)' : (b.caffeStorici.level > 0 ? 'var(--mint)' : 'rgba(255,255,255,0.15)')}; border-radius: 8px; padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 800; color: var(--mint); font-size: 1rem;">☕ Caffè Storici</span>
              <span style="background: ${b.caffeStorici.isSuper ? 'var(--mint)' : 'var(--mint)'}; color: #000; font-weight: 800; font-size: 0.75rem; padding: 2px 6px; border-radius: 6px;">
                ${b.caffeStorici.isSuper ? '🌟 SUPER BADGE' : `LIV. ${b.caffeStorici.level}`}
              </span>
            </div>
            <p class="stat-value" style="font-size: 1.3rem; margin: 6px 0;">${b.caffeStorici.count} caffè storici</p>
            <p style="color: #ccc; font-size: 0.8rem; margin: 0 0 6px 0;">
              ${b.caffeStorici.isSuper ? 'Traguardo Centenario 100+ sbloccato!' : `Prossimo badge a ${b.caffeStorici.nextMilestone} caffè (${b.caffeStorici.count % 5}/5)`}
            </p>
            <div class="progress-container" style="height: 6px;">
              <div class="progress-fill" style="width: ${b.caffeStorici.progressPercent}%; background: var(--mint);"></div>
            </div>
          </div>

          <!-- 6. STARBUCKS (ogni 10) -->
          <div style="background: rgba(0,0,0,0.5); border: 1.5px solid ${b.starbucks.isSuper ? 'var(--mint)' : (b.starbucks.level > 0 ? 'var(--pink)' : 'rgba(255,255,255,0.15)')}; border-radius: 8px; padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 800; color: var(--pink); font-size: 1rem;">☕ Tazzine Starbucks</span>
              <span style="background: ${b.starbucks.isSuper ? 'var(--mint)' : 'var(--pink)'}; color: #000; font-weight: 800; font-size: 0.75rem; padding: 2px 6px; border-radius: 6px;">
                ${b.starbucks.isSuper ? '🌟 SUPER BADGE' : `LIV. ${b.starbucks.level}`}
              </span>
            </div>
            <p class="stat-value" style="font-size: 1.3rem; margin: 6px 0;">${b.starbucks.count} tazzine</p>
            <p style="color: #ccc; font-size: 0.8rem; margin: 0 0 6px 0;">
              ${b.starbucks.isSuper ? 'Traguardo Centenario 100+ sbloccato!' : `Prossimo badge a ${b.starbucks.nextMilestone} tazzine (${b.starbucks.count % 10}/10)`}
            </p>
            <div class="progress-container" style="height: 6px;">
              <div class="progress-fill" style="width: ${b.starbucks.progressPercent}%; background: var(--pink);"></div>
            </div>
          </div>

          <!-- 7. PANDORA (ogni 10) -->
          <div style="background: rgba(0,0,0,0.5); border: 1.5px solid ${b.pandora.isSuper ? 'var(--mint)' : (b.pandora.level > 0 ? 'var(--pink)' : 'rgba(255,255,255,0.15)')}; border-radius: 8px; padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 800; color: var(--mint); font-size: 1rem;">💎 Charm Pandora</span>
              <span style="background: ${b.pandora.isSuper ? 'var(--mint)' : 'var(--pink)'}; color: #000; font-weight: 800; font-size: 0.75rem; padding: 2px 6px; border-radius: 6px;">
                ${b.pandora.isSuper ? '🌟 SUPER BADGE' : `LIV. ${b.pandora.level}`}
              </span>
            </div>
            <p class="stat-value" style="font-size: 1.3rem; margin: 6px 0;">${b.pandora.count} charm</p>
            <p style="color: #ccc; font-size: 0.8rem; margin: 0 0 6px 0;">
              ${b.pandora.isSuper ? 'Traguardo Centenario 100+ sbloccato!' : `Prossimo badge a ${b.pandora.nextMilestone} charm (${b.pandora.count % 10}/10)`}
            </p>
            <div class="progress-container" style="height: 6px;">
              <div class="progress-fill" style="width: ${b.pandora.progressPercent}%; background: var(--mint);"></div>
            </div>
          </div>

          <!-- 8. RIPRODUZIONI (ogni 10) -->
          <div style="background: rgba(0,0,0,0.5); border: 1.5px solid ${b.riproduzioni.isSuper ? 'var(--mint)' : (b.riproduzioni.level > 0 ? 'var(--pink)' : 'rgba(255,255,255,0.15)')}; border-radius: 8px; padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 800; color: var(--pink); font-size: 1rem;">🏛️ Riproduzioni Storiche</span>
              <span style="background: ${b.riproduzioni.isSuper ? 'var(--mint)' : 'var(--pink)'}; color: #000; font-weight: 800; font-size: 0.75rem; padding: 2px 6px; border-radius: 6px;">
                ${b.riproduzioni.isSuper ? '🌟 SUPER BADGE' : `LIV. ${b.riproduzioni.level}`}
              </span>
            </div>
            <p class="stat-value" style="font-size: 1.3rem; margin: 6px 0;">${b.riproduzioni.count} pezzi</p>
            <p style="color: #ccc; font-size: 0.8rem; margin: 0 0 6px 0;">
              ${b.riproduzioni.isSuper ? 'Traguardo Centenario 100+ sbloccato!' : `Prossimo badge a ${b.riproduzioni.nextMilestone} pezzi (${b.riproduzioni.count % 10}/10)`}
            </p>
            <div class="progress-container" style="height: 6px;">
              <div class="progress-fill" style="width: ${b.riproduzioni.progressPercent}%; background: var(--pink);"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- 7 MACRO AREE DI ANALISI E GALLERIE -->
      <div style="display: grid; grid-template-columns: 1fr; gap: 16px;">
        <!-- 1. GEOGRAFIA E RECORD -->
        <button type="button" class="card card-pink card-interactive card-btn" onclick="PassaportoModule.openCategory('geografia')" aria-label="Geografia e record. ${stats.visitedStatesCount} stati visitati, ${stats.totalCitiesCount} città visitate, ${stats.worldPercentage}% del mondo. Apri dettagli geografici.">
          <div aria-hidden="true">
            <h2 style="color: var(--pink); margin: 0; border: none;">🌍 GEOGRAFIA E RECORD</h2>
            <p style="color: #ccc; margin-top: 6px;">
              ${stats.visitedStatesCount} Stati esplorati | ${stats.totalCitiesCount} Città visitate (Mondo & Italia) | ${stats.worldPercentage}% del mondo | Record Polari
            </p>
          </div>
        </button>

        <!-- 2. GALLERIA DEI RICORDI (SOUVENIR) -->
        <button type="button" class="card card-mint card-interactive card-btn" onclick="PassaportoModule.openCategory('galleria_ricordi')" aria-label="La mia galleria dei ricordi. ${stats.totalSouvenirs} souvenir collezionati: Starbucks, Pandora, Modellini e ricordi. Apri galleria ricordi.">
          <div aria-hidden="true">
            <h2 style="color: var(--mint); margin: 0; border: none;">🛍️ LA MIA GALLERIA DEI RICORDI</h2>
            <p style="color: #ccc; margin-top: 6px;">
              ☕ ${stats.starbucksItems.length} Tazzine Starbucks | 💎 ${stats.pandoraItems.length} Charm Pandora | 🏛️ ${stats.riproduzioniItems.length} Modellini storici | 🛍️ ${stats.otherSouvenirs.length} Altri Souvenir
            </p>
          </div>
        </button>

        <!-- 3. TRAGUARDI ED ESPLORAZIONI (ESPERIENZE) -->
        <button type="button" class="card card-pink card-interactive card-btn" onclick="PassaportoModule.openCategory('traguardi_esplorazioni')" aria-label="Traguardi ed esplorazioni. Torri panoramiche, parchi tematici, ruote panoramiche, cat caffè, caffè storici e attrazioni nel mondo. Apri traguardi ed esplorazioni.">
          <div aria-hidden="true">
            <h2 style="color: var(--pink); margin: 0; border: none;">✨ TRAGUARDI ED ESPLORAZIONI</h2>
            <p style="color: #ccc; margin-top: 6px;">
              🗼 ${stats.torriItems.length} Torri | 🎢 ${stats.parchiItems.length} Parchi | 🎡 ${stats.ruoteItems.length} Ruote | 🐱 ${stats.catCaffeItems.length} Cat caffè | ☕ ${stats.caffeStoriciItems.length} Caffè storici | ✨ ${stats.otherExperiences.length} Altre attrazioni
            </p>
          </div>
        </button>

        <!-- 4. CLASSIFICA INTENSITÀ VIAGGI (BOLLINI 1-10) -->
        <button type="button" class="card card-mint card-interactive card-btn" onclick="PassaportoModule.openCategory('intensita')" aria-label="Classifica intensità viaggi con bollini da 1 a 10. Top 3 viaggi e indice esperienziale. Apri classifica intensità.">
          <div aria-hidden="true">
            <h2 style="color: var(--mint); margin: 0; border: none;">🏆 CLASSIFICA INTENSITÀ VIAGGI (BOLLINI 1-10)</h2>
            <p style="color: #ccc; margin-top: 6px;">
              Top 3 Viaggi più ricchi | I 3 Viaggi più essenziali | Punteggio e bollino per ogni avventura
            </p>
          </div>
        </button>

        <!-- 5. STORICO E LOGISTICA -->
        <button type="button" class="card card-pink card-interactive card-btn" onclick="PassaportoModule.openCategory('storico')" aria-label="Storico e logistica. ${stats.totalTrips} viaggi completati, frequenza annuale e mezzi usati. Apri dettagli storico.">
          <div aria-hidden="true">
            <h2 style="color: var(--pink); margin: 0; border: none;">📅 STORICO E LOGISTICA</h2>
            <p style="color: #ccc; margin-top: 6px;">
              ${stats.totalTrips} Viaggi completati | ${stats.totalDaysTraveled} Giorni on the road | Mezzi usati | Vettori
            </p>
          </div>
        </button>

        <!-- 6. COMPAGNI DI VIAGGIO -->
        <button type="button" class="card card-mint card-interactive card-btn" onclick="PassaportoModule.openCategory('compagni')" aria-label="Compagni di viaggio. Roby e Ele: ${stats.robyEleCount}, con la ciurma: ${stats.ciurmaCount}. Apri dettagli compagni.">
          <div aria-hidden="true">
            <h2 style="color: var(--mint); margin: 0; border: none;">👥 COMPAGNI DI VIAGGIO</h2>
            <p style="color: #ccc; margin-top: 6px;">
              Roby & Ele: ${stats.robyEleCount} (${stats.totalTrips > 0 ? Math.round((stats.robyEleCount/stats.totalTrips)*100) : 0}%) | Con la Ciurma: ${stats.ciurmaCount} (${stats.totalTrips > 0 ? Math.round((stats.ciurmaCount/stats.totalTrips)*100) : 0}%)
            </p>
          </div>
        </button>

        <!-- 7. ECONOMIA E BUDGET -->
        <button type="button" class="card card-pink card-interactive card-btn" onclick="PassaportoModule.openCategory('economia')" aria-label="Economia e budget. Spesa totale registrata ${CONFIG.formatCurrency(stats.totalSpend)}. Apri dettagli economici.">
          <div aria-hidden="true">
            <h2 style="color: var(--pink); margin: 0; border: none;">💰 ECONOMIA E BUDGET</h2>
            <p style="color: #ccc; margin-top: 6px;">
              Spesa totale: ${CONFIG.formatCurrency(stats.totalSpend)} | Media a viaggio | Categorie di spesa
            </p>
          </div>
        </button>
      </div>
    `;
  },

  renderIntensita(container) {
    const stats = this.getAggregatedData();
    const topTrips = stats.top3IntenseTrips || [];
    const bottomTrips = stats.bottom3IntenseTrips || [];
    const allRanked = stats.rankedByIntensity || [];

    container.innerHTML = `
      <div class="action-bar" style="justify-content: space-between;">
        <button class="btn btn-sm btn-pink" onclick="PassaportoModule.openCategory('main')">
          <span aria-hidden="true">⬅️ </span>TORNA AL PASSAPORTO
        </button>
        <button class="btn btn-sm btn-primary" onclick="PassaportoModule.openPdfReport()">
          <span aria-hidden="true">📄 </span>GENERA PDF
        </button>
      </div>

      <h1 id="screen-title" tabindex="-1">CLASSIFICA INTENSITÀ VIAGGI</h1>
      <p style="color: var(--pink-light); margin-bottom: 16px;">
        Valutazione algoritmica di ogni viaggio su una scala da <strong>1 a 10</strong> basata sulla combinazione di: <em>durata in giorni, mezzi di trasporto impiegati, stati e città esplorati, souvenir ed esperienze registrate</em>.
      </p>

      <!-- SEZIONE 1: I 3 VIAGGI PIÙ RICCHI E COMPLETI (TOP 3 ORO) -->
      <section class="card" style="border-color: var(--mint);">
        <h2 style="color: var(--mint); margin-top: 0; border: none;">👑 I 3 VIAGGI PIÙ RICCHI & TOP (PODIO ORO)</h2>
        ${topTrips.length > 0 ? `
          <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 12px;">
            ${topTrips.map((t, idx) => {
              const posEmoji = idx === 0 ? "🥇 1° POSTO" : (idx === 1 ? "🥈 2° POSTO" : "🥉 3° POSTO");
              const dStart = CONFIG.formatDateDisplay(t.Data_Inizio_Globale);
              const dEnd = CONFIG.formatDateDisplay(t.Data_Fine_Globale);
              const dateText = dStart && dEnd ? `${dStart} -> ${dEnd}` : (t.Anno_Viaggio || '-');
              const badgeLarge = GeoUtils.getIntensityBadgeHtml(t, true);

              return `
                <button type="button" class="card card-interactive card-btn" style="background: rgba(0,255,163,0.06); border: 1.5px solid var(--mint);" onclick="DiarioModule.openTripDetails('${t.ID_Viaggio}', 'passaporto')" aria-label="${posEmoji}: ${t.Nome_Viaggio}. ${t.intensity.ariaLabel}. Tocca due volte per aprire i dettagli del viaggio nel Diario di bordo.">
                  <div aria-hidden="true">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                      <span style="font-weight: 800; color: #FAFF00; font-size: 1rem;">${posEmoji}</span>
                      <span class="btn btn-sm btn-pink">${t.Tipologia_Viaggio || 'Viaggio'}</span>
                    </div>
                    <h3 style="color: #FFFFFF; margin: 6px 0 0 0; font-size: 1.2rem;">${t.Nome_Viaggio}</h3>
                    ${badgeLarge}
                    <p style="color: #ccc; font-size: 0.9rem; margin-top: 8px;">
                      📅 <strong>${t.days} giorni</strong> (${dateText}) | 📍 <strong>${(t.Stati || '-').replace(/\n/g, ', ')}</strong> | 🚗 <strong>${t.km} km</strong>
                    </p>
                    ${t.Citta ? `<p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 4px;">Tappe: ${t.Citta.replace(/\n/g, ' ➔ ')}</p>` : ''}
                  </div>
                </button>
              `;
            }).join('')}
          </div>
        ` : `<p style="color: var(--text-muted);">In attesa della registrazione dei primi viaggi.</p>`}
      </section>

      <!-- SEZIONE 2: I 3 VIAGGI PIÙ ESSENZIALI & RELAX (BASE) -->
      ${bottomTrips.length > 0 && allRanked.length > 3 ? `
        <section class="card" style="margin-top: 16px;">
          <h2 style="margin-top: 0; border: none;">🌱 I 3 VIAGGI PIÙ ESSENZIALI & RELAX (BASE)</h2>
          <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 12px;">
            ${bottomTrips.map(t => {
              const dStart = CONFIG.formatDateDisplay(t.Data_Inizio_Globale);
              const dEnd = CONFIG.formatDateDisplay(t.Data_Fine_Globale);
              const dateText = dStart && dEnd ? `${dStart} -> ${dEnd}` : (t.Anno_Viaggio || '-');
              const badgeLarge = GeoUtils.getIntensityBadgeHtml(t, true);

              return `
                <button type="button" class="card card-interactive card-btn" onclick="DiarioModule.openTripDetails('${t.ID_Viaggio}', 'passaporto')" aria-label="Viaggio Essenziale: ${t.Nome_Viaggio}. ${t.intensity.ariaLabel}. Tocca due volte per aprire i dettagli del viaggio nel Diario di bordo.">
                  <div aria-hidden="true">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                      <h3 style="color: var(--mint); margin: 0;">${t.Nome_Viaggio}</h3>
                      <span class="btn btn-sm btn-pink">${t.Tipologia_Viaggio || 'Viaggio'}</span>
                    </div>
                    ${badgeLarge}
                    <p style="color: #ccc; font-size: 0.9rem; margin-top: 8px;">
                      📅 <strong>${t.days} giorni</strong> (${dateText}) | 📍 <strong>${(t.Stati || '-').replace(/\n/g, ', ')}</strong>
                    </p>
                  </div>
                </button>
              `;
            }).join('')}
          </div>
        </section>
      ` : ''}

      <!-- SEZIONE 3: ELENCO COMPLETO DEI VIAGGI CON BOLLINO DI INTENSITÀ -->
      <section class="card" style="margin-top: 16px;">
        <h2>TUTTI I VIAGGI ORDINATI PER INTENSITÀ (${allRanked.length})</h2>
        <div class="trips-list" style="margin-top: 12px;">
          ${allRanked.map(t => {
            const dStart = CONFIG.formatDateDisplay(t.Data_Inizio_Globale);
            const dEnd = CONFIG.formatDateDisplay(t.Data_Fine_Globale);
            const dateText = dStart && dEnd ? `Dal ${dStart} al ${dEnd}` : (t.Anno_Viaggio || '-');
            const badgeHtml = GeoUtils.getIntensityBadgeHtml(t);

            return `
              <button type="button" class="card card-mint card-interactive card-btn" onclick="DiarioModule.openTripDetails('${t.ID_Viaggio}', 'passaporto')" aria-label="${t.Nome_Viaggio}. ${dateText}. ${t.intensity.ariaLabel}. Tocca due volte per aprire i dettagli del viaggio nel Diario di bordo.">
                <div aria-hidden="true">
                  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
                    <h3 style="color: var(--mint); margin: 0;">${t.Nome_Viaggio}</h3>
                    <div style="display: flex; gap: 6px; align-items: center;">
                      ${badgeHtml}
                      <span class="btn btn-sm btn-pink">${t.Tipologia_Viaggio || 'Viaggio'}</span>
                    </div>
                  </div>
                  <p style="color: #ccc; font-size: 0.9rem; margin-top: 6px;">
                    📅 ${t.days} giorni (${dateText}) | 📍 ${(t.Stati || '-').replace(/\n/g, ', ')} | 🚗 ${t.km} km
                  </p>
                  ${t.Citta ? `<p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 4px;">Tappe: ${t.Citta.replace(/\n/g, ' ➔ ')}</p>` : ''}
                </div>
              </button>
            `;
          }).join('')}
        </div>
      </section>
    `;
  },

  // LA MIA GALLERIA DEI RICORDI (Punto 2 & Punto 6)
  renderGalleriaRicordi(container) {
    const stats = this.getAggregatedData();

    container.innerHTML = `
      <div class="action-bar" style="justify-content: space-between;">
        <button class="btn btn-sm btn-pink" onclick="PassaportoModule.openCategory('main')">
          <span aria-hidden="true">⬅️ </span>TORNA AL PASSAPORTO
        </button>
        <button class="btn btn-sm btn-primary" onclick="PassaportoModule.openPdfReport()">
          <span aria-hidden="true">📄 </span>GENERA PDF
        </button>
      </div>

      <h1 id="screen-title" tabindex="-1">LA MIA GALLERIA DEI RICORDI</h1>
      <p style="color: var(--pink-light); margin-bottom: 16px;">
        Catalogo e archivio cronologico di tutti i souvenir, charm, modellini e ricordi raccolti nel mondo (ordinati dal più recente al più vecchio).
      </p>

      <!-- 1. TAZZINE STARBUCKS -->
      <section class="card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; color: var(--mint); border: none;">☕ TAZZINE STARBUCKS (${stats.starbucksItems.length})</h2>
          <span style="background: var(--mint); color: #000; font-weight: 800; font-size: 0.8rem; padding: 2px 8px; border-radius: 8px;">
            ${stats.badges.starbucks.isSuper ? '🌟 SUPER BADGE' : `LIV. ${stats.badges.starbucks.level}`}
          </span>
        </div>
        ${stats.starbucksItems.length > 0 ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px; margin-top: 12px;">
            ${stats.starbucksItems.map(it => `
              <div class="card card-interactive" style="background: rgba(0,255,163,0.06); border: 1px solid var(--mint); border-radius: 8px; padding: 12px; margin: 0;">
                <p style="font-weight: 700; color: #FFFFFF; margin: 0 0 6px 0; font-size: 1rem;">☕ ${it.item}</p>
                <p style="color: var(--pink-light); font-size: 0.85rem; margin: 0;">
                  ✈️ <a href="javascript:void(0)" onclick="DiarioModule.openTripDetails('${it.tripId}', 'passaporto')" style="color: var(--pink-light); text-decoration: underline; font-weight: 700;">${it.tripName}</a>
                </p>
                <p style="color: #aaa; font-size: 0.8rem; margin: 4px 0 0 0;">
                  📅 ${it.date || '-'}${it.stati ? ` | 📍 ${(it.stati || '').replace(/\n/g, ', ')}` : ''}
                </p>
              </div>
            `).join('')}
          </div>
        ` : `<p style="color: var(--text-muted); margin-top: 10px;">Nessuna tazzina Starbucks registrata nei viaggi.</p>`}
      </section>

      <!-- 2. CHARM PANDORA -->
      <section class="card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; color: var(--pink); border: none;">💎 CHARM PANDORA (${stats.pandoraItems.length})</h2>
          <span style="background: var(--pink); color: #000; font-weight: 800; font-size: 0.8rem; padding: 2px 8px; border-radius: 8px;">
            ${stats.badges.pandora.isSuper ? '🌟 SUPER BADGE' : `LIV. ${stats.badges.pandora.level}`}
          </span>
        </div>
        ${stats.pandoraItems.length > 0 ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px; margin-top: 12px;">
            ${stats.pandoraItems.map(it => `
              <div class="card card-interactive" style="background: rgba(255,128,191,0.06); border: 1px solid var(--pink); border-radius: 8px; padding: 12px; margin: 0;">
                <p style="font-weight: 700; color: #FFFFFF; margin: 0 0 6px 0; font-size: 1rem;">💎 ${it.item}</p>
                <p style="color: var(--mint); font-size: 0.85rem; margin: 0;">
                  ✈️ <a href="javascript:void(0)" onclick="DiarioModule.openTripDetails('${it.tripId}', 'passaporto')" style="color: var(--mint); text-decoration: underline; font-weight: 700;">${it.tripName}</a>
                </p>
                <p style="color: #aaa; font-size: 0.8rem; margin: 4px 0 0 0;">
                  📅 ${it.date || '-'}${it.stati ? ` | 📍 ${(it.stati || '').replace(/\n/g, ', ')}` : ''}
                </p>
              </div>
            `).join('')}
          </div>
        ` : `<p style="color: var(--text-muted); margin-top: 10px;">Nessun charm Pandora registrato nei viaggi.</p>`}
      </section>

      <!-- 3. RIPRODUZIONI E MODELLINI STORICI -->
      <section class="card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; color: var(--mint); border: none;">🏛️ RIPRODUZIONI E MODELLINI STORICI (${stats.riproduzioniItems.length})</h2>
          <span style="background: var(--mint); color: #000; font-weight: 800; font-size: 0.8rem; padding: 2px 8px; border-radius: 8px;">
            ${stats.badges.riproduzioni.isSuper ? '🌟 SUPER BADGE' : `LIV. ${stats.badges.riproduzioni.level}`}
          </span>
        </div>
        ${stats.riproduzioniItems.length > 0 ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px; margin-top: 12px;">
            ${stats.riproduzioniItems.map(it => `
              <div class="card card-interactive" style="background: rgba(0,255,163,0.06); border: 1px solid var(--mint); border-radius: 8px; padding: 12px; margin: 0;">
                <p style="font-weight: 700; color: #FFFFFF; margin: 0 0 6px 0; font-size: 1rem;">🏛️ ${it.item}</p>
                <p style="color: var(--pink-light); font-size: 0.85rem; margin: 0;">
                  ✈️ <a href="javascript:void(0)" onclick="DiarioModule.openTripDetails('${it.tripId}', 'passaporto')" style="color: var(--pink-light); text-decoration: underline; font-weight: 700;">${it.tripName}</a>
                </p>
                <p style="color: #aaa; font-size: 0.8rem; margin: 4px 0 0 0;">
                  📅 ${it.date || '-'}${it.stati ? ` | 📍 ${(it.stati || '').replace(/\n/g, ', ')}` : ''}
                </p>
              </div>
            `).join('')}
          </div>
        ` : `<p style="color: var(--text-muted); margin-top: 10px;">Nessuna riproduzione storica registrata nei viaggi.</p>`}
      </section>

      <!-- 4. ALTRI SOUVENIR -->
      <section class="card">
        <h2>🛍️ ALTRI SOUVENIR E MEMORIE (${stats.otherSouvenirs.length})</h2>
        ${stats.otherSouvenirs.length > 0 ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px; margin-top: 12px;">
            ${stats.otherSouvenirs.map(it => `
              <div class="card card-interactive" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 12px; margin: 0;">
                <p style="font-weight: 700; color: #FFFFFF; margin: 0 0 6px 0; font-size: 1rem;">🛍️ ${it.item}</p>
                <p style="color: #aaa; font-size: 0.85rem; margin: 0;">
                  ✈️ <a href="javascript:void(0)" onclick="DiarioModule.openTripDetails('${it.tripId}', 'passaporto')" style="color: var(--pink-light); text-decoration: underline; font-weight: 700;">${it.tripName}</a>
                </p>
                <p style="color: #888; font-size: 0.8rem; margin: 4px 0 0 0;">
                  📅 ${it.date || '-'}${it.stati ? ` | 📍 ${(it.stati || '').replace(/\n/g, ', ')}` : ''}
                </p>
              </div>
            `).join('')}
          </div>
        ` : `<p style="color: var(--text-muted); margin-top: 10px;">Nessun altro souvenir registrato.</p>`}
      </section>
    `;
  },

  // TRAGUARDI ED ESPLORAZIONI (Punto 2 & Punto 6)
  renderTraguardiEsplorazioni(container) {
    const stats = this.getAggregatedData();

    container.innerHTML = `
      <div class="action-bar" style="justify-content: space-between;">
        <button class="btn btn-sm btn-pink" onclick="PassaportoModule.openCategory('main')">
          <span aria-hidden="true">⬅️ </span>TORNA AL PASSAPORTO
        </button>
        <button class="btn btn-sm btn-primary" onclick="PassaportoModule.openPdfReport()">
          <span aria-hidden="true">📄 </span>GENERA PDF
        </button>
      </div>

      <h1 id="screen-title" tabindex="-1">TRAGUARDI ED ESPLORAZIONI</h1>
      <p style="color: var(--pink-light); margin-bottom: 16px;">
        Panoramica cronologica delle vette, delle grandi ruote panoramiche, dei cat caffè e delle attrazioni esperienziali nel mondo (ordinate dalla più recente alla più vecchia).
      </p>

      <!-- 1. TORRI PANORAMICHE -->
      <section class="card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; color: var(--pink); border: none;">🗼 TORRI PANORAMICHE (${stats.torriItems.length})</h2>
          <span style="background: var(--pink); color: #000; font-weight: 800; font-size: 0.8rem; padding: 2px 8px; border-radius: 8px;">
            ${stats.badges.torri.isSuper ? '🌟 SUPER BADGE' : `LIV. ${stats.badges.torri.level}`}
          </span>
        </div>
        ${stats.torriItems.length > 0 ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px; margin-top: 12px;">
            ${stats.torriItems.map(it => `
              <div class="card card-interactive" style="background: rgba(255,128,191,0.06); border: 1px solid var(--pink); border-radius: 8px; padding: 12px; margin: 0;">
                <p style="font-weight: 700; color: #FFFFFF; margin: 0 0 6px 0; font-size: 1rem;">🗼 ${it.item}</p>
                <p style="color: var(--mint); font-size: 0.85rem; margin: 0;">
                  ✈️ <a href="javascript:void(0)" onclick="DiarioModule.openTripDetails('${it.tripId}', 'passaporto')" style="color: var(--mint); text-decoration: underline; font-weight: 700;">${it.tripName}</a>
                </p>
                <p style="color: #aaa; font-size: 0.8rem; margin: 4px 0 0 0;">
                  📅 ${it.date || '-'}${it.stati ? ` | 📍 ${(it.stati || '').replace(/\n/g, ', ')}` : ''}
                </p>
              </div>
            `).join('')}
          </div>
        ` : `<p style="color: var(--text-muted); margin-top: 10px;">Nessuna torre panoramica registrata nei viaggi.</p>`}
      </section>

      <!-- 2. PARCHI TEMATICI -->
      <section class="card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; color: var(--mint); border: none;">🎢 PARCHI TEMATICI (${stats.parchiItems.length})</h2>
          <span style="background: var(--mint); color: #000; font-weight: 800; font-size: 0.8rem; padding: 2px 8px; border-radius: 8px;">
            ${stats.badges.parchi.isSuper ? '🌟 SUPER BADGE' : `LIV. ${stats.badges.parchi.level}`}
          </span>
        </div>
        ${stats.parchiItems.length > 0 ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px; margin-top: 12px;">
            ${stats.parchiItems.map(it => `
              <div class="card card-interactive" style="background: rgba(0,255,163,0.06); border: 1px solid var(--mint); border-radius: 8px; padding: 12px; margin: 0;">
                <p style="font-weight: 700; color: #FFFFFF; margin: 0 0 6px 0; font-size: 1rem;">🎢 ${it.item}</p>
                <p style="color: var(--pink-light); font-size: 0.85rem; margin: 0;">
                  ✈️ <a href="javascript:void(0)" onclick="DiarioModule.openTripDetails('${it.tripId}', 'passaporto')" style="color: var(--pink-light); text-decoration: underline; font-weight: 700;">${it.tripName}</a>
                </p>
                <p style="color: #aaa; font-size: 0.8rem; margin: 4px 0 0 0;">
                  📅 ${it.date || '-'}${it.stati ? ` | 📍 ${(it.stati || '').replace(/\n/g, ', ')}` : ''}
                </p>
              </div>
            `).join('')}
          </div>
        ` : `<p style="color: var(--text-muted); margin-top: 10px;">Nessun parco tematico registrato nei viaggi.</p>`}
      </section>

      <!-- 3. RUOTE PANORAMICHE -->
      <section class="card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; color: var(--pink); border: none;">🎡 RUOTE PANORAMICHE (${stats.ruoteItems.length})</h2>
          <span style="background: var(--pink); color: #000; font-weight: 800; font-size: 0.8rem; padding: 2px 8px; border-radius: 8px;">
            ${stats.badges.ruote.isSuper ? '🌟 SUPER BADGE' : `LIV. ${stats.badges.ruote.level}`}
          </span>
        </div>
        ${stats.ruoteItems.length > 0 ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px; margin-top: 12px;">
            ${stats.ruoteItems.map(it => `
              <div class="card card-interactive" style="background: rgba(255,128,191,0.06); border: 1px solid var(--pink); border-radius: 8px; padding: 12px; margin: 0;">
                <p style="font-weight: 700; color: #FFFFFF; margin: 0 0 6px 0; font-size: 1rem;">🎡 ${it.item}</p>
                <p style="color: var(--mint); font-size: 0.85rem; margin: 0;">
                  ✈️ <a href="javascript:void(0)" onclick="DiarioModule.openTripDetails('${it.tripId}', 'passaporto')" style="color: var(--mint); text-decoration: underline; font-weight: 700;">${it.tripName}</a>
                </p>
                <p style="color: #aaa; font-size: 0.8rem; margin: 4px 0 0 0;">
                  📅 ${it.date || '-'}${it.stati ? ` | 📍 ${(it.stati || '').replace(/\n/g, ', ')}` : ''}
                </p>
              </div>
            `).join('')}
          </div>
        ` : `<p style="color: var(--text-muted); margin-top: 10px;">Nessuna ruota panoramica registrata nei viaggi.</p>`}
      </section>

      <!-- 4. CAT CAFFÈ -->
      <section class="card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; color: var(--mint); border: none;">🐱 CAT CAFFÈ (${stats.catCaffeItems.length})</h2>
          <span style="background: var(--mint); color: #000; font-weight: 800; font-size: 0.8rem; padding: 2px 8px; border-radius: 8px;">
            ${stats.badges.catCaffe.isSuper ? '🌟 SUPER BADGE' : `LIV. ${stats.badges.catCaffe.level}`}
          </span>
        </div>
        ${stats.catCaffeItems.length > 0 ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px; margin-top: 12px;">
            ${stats.catCaffeItems.map(it => `
              <div class="card card-interactive" style="background: rgba(0,255,163,0.06); border: 1px solid var(--mint); border-radius: 8px; padding: 12px; margin: 0;">
                <p style="font-weight: 700; color: #FFFFFF; margin: 0 0 6px 0; font-size: 1rem;">🐱 ${it.item}</p>
                <p style="color: var(--pink-light); font-size: 0.85rem; margin: 0;">
                  ✈️ <a href="javascript:void(0)" onclick="DiarioModule.openTripDetails('${it.tripId}', 'passaporto')" style="color: var(--pink-light); text-decoration: underline; font-weight: 700;">${it.tripName}</a>
                </p>
                <p style="color: #aaa; font-size: 0.8rem; margin: 4px 0 0 0;">
                  📅 ${it.date || '-'}${it.stati ? ` | 📍 ${(it.stati || '').replace(/\n/g, ', ')}` : ''}
                </p>
              </div>
            `).join('')}
          </div>
        ` : `<p style="color: var(--text-muted); margin-top: 10px;">Nessun cat caffè registrato nei viaggi.</p>`}
      </section>

      <!-- 5. CAFFÈ STORICI -->
      <section class="card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; color: var(--pink); border: none;">☕ CAFFÈ STORICI (${stats.caffeStoriciItems.length})</h2>
          <span style="background: var(--pink); color: #000; font-weight: 800; font-size: 0.8rem; padding: 2px 8px; border-radius: 8px;">
            ${stats.badges.caffeStorici.isSuper ? '🌟 SUPER BADGE' : `LIV. ${stats.badges.caffeStorici.level}`}
          </span>
        </div>
        ${stats.caffeStoriciItems.length > 0 ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px; margin-top: 12px;">
            ${stats.caffeStoriciItems.map(it => `
              <div class="card card-interactive" style="background: rgba(255,128,191,0.06); border: 1px solid var(--pink); border-radius: 8px; padding: 12px; margin: 0;">
                <p style="font-weight: 700; color: #FFFFFF; margin: 0 0 6px 0; font-size: 1rem;">☕ ${it.item}</p>
                <p style="color: var(--mint); font-size: 0.85rem; margin: 0;">
                  ✈️ <a href="javascript:void(0)" onclick="DiarioModule.openTripDetails('${it.tripId}', 'passaporto')" style="color: var(--mint); text-decoration: underline; font-weight: 700;">${it.tripName}</a>
                </p>
                <p style="color: #aaa; font-size: 0.8rem; margin: 4px 0 0 0;">
                  📅 ${it.date || '-'}${it.stati ? ` | 📍 ${(it.stati || '').replace(/\n/g, ', ')}` : ''}
                </p>
              </div>
            `).join('')}
          </div>
        ` : `<p style="color: var(--text-muted); margin-top: 10px;">Nessun caffè storico registrato nei viaggi.</p>`}
      </section>

      <!-- 6. ALTRE ESPERIENZE E ATTRAZIONI -->
      <section class="card">
        <h2>✨ ALTRE ESPERIENZE E ATTRAZIONI (${stats.otherExperiences.length})</h2>
        ${stats.otherExperiences.length > 0 ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px; margin-top: 12px;">
            ${stats.otherExperiences.map(it => `
              <div class="card card-interactive" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 12px; margin: 0;">
                <p style="font-weight: 700; color: #FFFFFF; margin: 0 0 6px 0; font-size: 1rem;">✨ ${it.item}</p>
                <p style="color: #aaa; font-size: 0.85rem; margin: 0;">
                  ✈️ <a href="javascript:void(0)" onclick="DiarioModule.openTripDetails('${it.tripId}', 'passaporto')" style="color: var(--pink-light); text-decoration: underline; font-weight: 700;">${it.tripName}</a>
                </p>
                <p style="color: #888; font-size: 0.8rem; margin: 4px 0 0 0;">
                  📅 ${it.date || '-'}${it.stati ? ` | 📍 ${(it.stati || '').replace(/\n/g, ', ')}` : ''}
                </p>
              </div>
            `).join('')}
          </div>
        ` : `<p style="color: var(--text-muted); margin-top: 10px;">Nessun'altra attrazione registrata.</p>`}
      </section>
    `;
  },

  renderGeografia(container) {
    const stats = this.getAggregatedData();
    const coords = API.data[CONFIG.SHEETS.COORDINATE] || [];
    const geo = stats.geoStats;

    // Group states by continent
    const continentGroups = {};
    stats.visitedStatesMap.forEach((_, st) => {
      const cont = GeoUtils.getContinent(st);
      if (!continentGroups[cont]) continentGroups[cont] = [];
      continentGroups[cont].push({ state: st, flag: GeoUtils.getFlag(st) });
    });

    // Costruzione elenco città unificate
    const cityList = [];
    stats.visitedCitiesMap.forEach((tripsArr, cityName) => {
      const cityCoord = coords.find(co => co && co.Citta && co.Citta.toUpperCase() === cityName.toUpperCase()) || {};
      const stateName = (cityCoord.Stato || (stats.cityStateMap && stats.cityStateMap.get(cityName)) || 'ITALIA').toUpperCase();
      const flag = GeoUtils.getFlag(stateName);
      cityList.push({
        name: cityName,
        state: stateName,
        flag,
        tripsCount: tripsArr.length
      });
    });

    // Separazione rigorosa: Città nel Mondo (esclusa Italia) e Città in Italia (Punto 5)
    const worldCities = cityList.filter(c => c.state !== 'ITALIA');
    const italyCities = cityList.filter(c => c.state === 'ITALIA');

    // Ordinamento alfabetico A-Z conforme alla lingua italiana (Intl.Collator)
    worldCities.sort((a, b) => a.name.localeCompare(b.name, 'it', { sensitivity: 'base' }));
    italyCities.sort((a, b) => a.name.localeCompare(b.name, 'it', { sensitivity: 'base' }));

    container.innerHTML = `
      <div class="action-bar" style="justify-content: space-between;">
        <button class="btn btn-sm btn-pink" onclick="PassaportoModule.openCategory('main')">
          <span aria-hidden="true">⬅️ </span>TORNA AL PASSAPORTO
        </button>
        <button class="btn btn-sm btn-primary" onclick="PassaportoModule.openPdfReport()">
          <span aria-hidden="true">📄 </span>GENERA PDF
        </button>
      </div>

      <h1 id="screen-title" tabindex="-1">GEOGRAFIA E RECORD</h1>

      <!-- 1. COPERTURA MONDIALE -->
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
              <thead>
                <tr>
                  <th scope="col">CONTINENTE</th>
                  <th scope="col">STATI ESPLORATI</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(continentGroups).map(([cont, list]) => `
                  <tr>
                    <th scope="row">${cont.toUpperCase()} (${list.length})</th>
                    <td>${list.map(s => `${s.flag} ${s.state}`).join(', ')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : `<p style="color: var(--text-muted);">In attesa del primo viaggio.</p>`}
      </section>

      <!-- 3. RECORD GEOGRAFICI (ACCESSIBILITÀ VOICEOVER PULITA - PUNTO 3) -->
      <section class="card">
        <h2>RECORD GEOGRAFICI (RIFERIMENTO VENEZIA & POLI)</h2>
        <ul class="record-list" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px;">
          <li class="card" tabindex="0" style="padding: 12px; margin: 0; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.12);" aria-label="Città più a Nord: ${geo.mostNorth ? `${geo.mostNorth.Citta} (${geo.mostNorth.Stato}) a latitudine ${geo.mostNorth.Latitudine} gradi` : 'In attesa del primo viaggio'}.">
            <span style="color: var(--pink); font-weight: 700; font-size: 0.85rem; text-transform: uppercase; display: block;">CITTÀ PIÙ A NORD</span>
            <span style="color: #FFFFFF; font-size: 1rem; margin-top: 4px; display: block;">${geo.mostNorth ? `📍 ${geo.mostNorth.Citta} (${geo.mostNorth.Stato}) [${geo.mostNorth.Latitudine}°]` : 'IN ATTESA DEL PRIMO VIAGGIO'}</span>
          </li>
          <li class="card" tabindex="0" style="padding: 12px; margin: 0; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.12);" aria-label="Città più a Sud: ${geo.mostSouth ? `${geo.mostSouth.Citta} (${geo.mostSouth.Stato}) a latitudine ${geo.mostSouth.Latitudine} gradi` : 'In attesa del primo viaggio'}.">
            <span style="color: var(--pink); font-weight: 700; font-size: 0.85rem; text-transform: uppercase; display: block;">CITTÀ PIÙ A SUD</span>
            <span style="color: #FFFFFF; font-size: 1rem; margin-top: 4px; display: block;">${geo.mostSouth ? `📍 ${geo.mostSouth.Citta} (${geo.mostSouth.Stato}) [${geo.mostSouth.Latitudine}°]` : 'IN ATTESA DEL PRIMO VIAGGIO'}</span>
          </li>
          <li class="card" tabindex="0" style="padding: 12px; margin: 0; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.12);" aria-label="Città più a Est: ${geo.mostEast ? `${geo.mostEast.Citta} (${geo.mostEast.Stato}) a longitudine ${geo.mostEast.Longitudine} gradi` : 'In attesa del primo viaggio'}.">
            <span style="color: var(--pink); font-weight: 700; font-size: 0.85rem; text-transform: uppercase; display: block;">CITTÀ PIÙ A EST</span>
            <span style="color: #FFFFFF; font-size: 1rem; margin-top: 4px; display: block;">${geo.mostEast ? `📍 ${geo.mostEast.Citta} (${geo.mostEast.Stato}) [${geo.mostEast.Longitudine}°]` : 'IN ATTESA DEL PRIMO VIAGGIO'}</span>
          </li>
          <li class="card" tabindex="0" style="padding: 12px; margin: 0; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.12);" aria-label="Città più a Ovest: ${geo.mostWest ? `${geo.mostWest.Citta} (${geo.mostWest.Stato}) a longitudine ${geo.mostWest.Longitudine} gradi` : 'In attesa del primo viaggio'}.">
            <span style="color: var(--pink); font-weight: 700; font-size: 0.85rem; text-transform: uppercase; display: block;">CITTÀ PIÙ A OVEST</span>
            <span style="color: #FFFFFF; font-size: 1rem; margin-top: 4px; display: block;">${geo.mostWest ? `📍 ${geo.mostWest.Citta} (${geo.mostWest.Stato}) [${geo.mostWest.Longitudine}°]` : 'IN ATTESA DEL PRIMO VIAGGIO'}</span>
          </li>
          <li class="card" tabindex="0" style="padding: 12px; margin: 0; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.12);" aria-label="Città più lontana da Venezia: ${geo.farthestFromVenice ? `${geo.farthestFromVenice.Citta} (${geo.farthestFromVenice.distFromVenice} km in linea d'aria)` : 'In attesa del primo viaggio'}.">
            <span style="color: var(--pink); font-weight: 700; font-size: 0.85rem; text-transform: uppercase; display: block;">PIÙ LONTANA DA VENEZIA</span>
            <span style="color: #FFFFFF; font-size: 1rem; margin-top: 4px; display: block;">${geo.farthestFromVenice ? `✈️ ${geo.farthestFromVenice.Citta} (${geo.farthestFromVenice.distFromVenice} km in linea d'aria)` : 'IN ATTESA DEL PRIMO VIAGGIO'}</span>
          </li>
          <li class="card" tabindex="0" style="padding: 12px; margin: 0; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.12);" aria-label="Città più vicine all'Equatore: ${geo.closestToEquator.length > 0 ? geo.closestToEquator.map((c, i) => `${i + 1}. ${c.Citta} (${c.Stato}) a latitudine ${c.Latitudine} gradi`).join(', ') : 'In attesa del primo viaggio'}.">
            <span style="color: var(--pink); font-weight: 700; font-size: 0.85rem; text-transform: uppercase; display: block;">PIÙ VICINE ALL'EQUATORE</span>
            <span style="color: #FFFFFF; font-size: 1rem; margin-top: 4px; display: block;">${geo.closestToEquator.length > 0 ? geo.closestToEquator.map((c, i) => `🌍 ${i + 1}. ${c.Citta} (${c.Stato}) [${c.Latitudine}°]`).join('<br>') : 'IN ATTESA DEL PRIMO VIAGGIO'}</span>
          </li>
          <li class="card" tabindex="0" style="padding: 12px; margin: 0; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.12);" aria-label="Prime 3 città più vicine al Polo Nord: ${geo.closestToNorthPole.length > 0 ? geo.closestToNorthPole.map((c, i) => `${i + 1}. ${c.Citta} (${c.Stato}), ${c.distNorthPoleKm} km dal Polo`).join(', ') : 'In attesa del primo viaggio'}.">
            <span style="color: var(--pink); font-weight: 700; font-size: 0.85rem; text-transform: uppercase; display: block;">PRIME 3 PIÙ VICINE AL POLO NORD</span>
            <span style="color: #FFFFFF; font-size: 1rem; margin-top: 4px; display: block;">${geo.closestToNorthPole.length > 0 ? geo.closestToNorthPole.map((c, i) => `❄️ ${i + 1}. ${c.Citta} (${c.Stato}) [${c.Latitudine}°N - ${c.distNorthPoleKm} km dal Polo]`).join('<br>') : 'IN ATTESA DEL PRIMO VIAGGIO'}</span>
          </li>
          <li class="card" tabindex="0" style="padding: 12px; margin: 0; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.12);" aria-label="Prime 3 città più vicine al Polo Sud: ${geo.closestToSouthPole.length > 0 ? geo.closestToSouthPole.map((c, i) => `${i + 1}. ${c.Citta} (${c.Stato}), ${c.distSouthPoleKm} km dal Polo`).join(', ') : 'In attesa del primo viaggio'}.">
            <span style="color: var(--pink); font-weight: 700; font-size: 0.85rem; text-transform: uppercase; display: block;">PRIME 3 PIÙ VICINE AL POLO SUD</span>
            <span style="color: #FFFFFF; font-size: 1rem; margin-top: 4px; display: block;">${geo.closestToSouthPole.length > 0 ? geo.closestToSouthPole.map((c, i) => `❄️ ${i + 1}. ${c.Citta} (${c.Stato}) [${c.Latitudine}° - ${c.distSouthPoleKm} km dal Polo]`).join('<br>') : 'IN ATTESA DEL PRIMO VIAGGIO'}</span>
          </li>
        </ul>
      </section>

      <!-- 4. LISTA CITTÀ: SUDDIVISIONE MONDO (ESCLUSA ITALIA) & ITALIA (Punto 5) -->
      <section class="card">
        <h2>CITTÀ NEL MONDO (ESCLUSA ITALIA) - [${worldCities.length}]</h2>
        <p style="color: #ccc; font-size: 0.9rem; margin-top: 4px; margin-bottom: 12px;">
          Tocca una città internazionale per visualizzare tutti i relativi viaggi in ordine cronologico.
        </p>
        ${worldCities.length > 0 ? `
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px;">
            ${worldCities.map(c => `
              <button type="button" class="btn btn-sm btn-pink" data-city="${encodeURIComponent(c.name)}" onclick="PassaportoModule.openCityDrillDown(decodeURIComponent(this.getAttribute('data-city')))" aria-label="${c.name} ${c.flag}. Tocca due volte per aprire i viaggi correlati.">
                ${c.flag} ${c.name}
              </button>
            `).join('')}
          </div>
        ` : `<p style="color: var(--text-muted); margin-bottom: 20px;">Nessuna città estera registrata finora.</p>`}

        <h2 style="border-top: 1px solid rgba(255,255,255,0.15); padding-top: 16px;">CITTÀ IN ITALIA - [${italyCities.length}]</h2>
        <p style="color: #ccc; font-size: 0.9rem; margin-top: 4px; margin-bottom: 12px;">
          Tocca una città italiana per visualizzare tutti i relativi viaggi in ordine cronologico.
        </p>
        ${italyCities.length > 0 ? `
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${italyCities.map(c => `
              <button type="button" class="btn btn-sm btn-mint" data-city="${encodeURIComponent(c.name)}" onclick="PassaportoModule.openCityDrillDown(decodeURIComponent(this.getAttribute('data-city')))" aria-label="${c.name} Italia. Tocca due volte per aprire i viaggi correlati.">
                🇮🇹 ${c.name}
              </button>
            `).join('')}
          </div>
        ` : `<p style="color: var(--text-muted);">Nessuna città italiana registrata finora.</p>`}
      </section>
    `;
  },

  renderStorico(container) {
    const stats = this.getAggregatedData();

    container.innerHTML = `
      <div class="action-bar" style="justify-content: space-between;">
        <button class="btn btn-sm btn-pink" onclick="PassaportoModule.openCategory('main')">
          <span aria-hidden="true">⬅️ </span>TORNA AL PASSAPORTO
        </button>
        <button class="btn btn-sm btn-primary" onclick="PassaportoModule.openPdfReport()">
          <span aria-hidden="true">📄 </span>GENERA PDF
        </button>
      </div>

      <h1 id="screen-title" tabindex="-1">STORICO E LOGISTICA</h1>

      <!-- 1. FREQUENZA ANNUALE -->
      <section class="card">
        <h2>FREQUENZA DEI VIAGGI PER ANNO</h2>
        <div class="table-responsive">
          <table class="table-closed">
            <thead>
              <tr>
                <th scope="col">ANNO</th>
                <th scope="col">NUMERO DI VIAGGI</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(stats.tripsByYear).sort((a, b) => b[0] - a[0]).map(([yr, cnt]) => `
                <tr><th scope="row">${yr}</th><td>${cnt} viaggi</td></tr>
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
            <thead>
              <tr>
                <th scope="col">MEZZO</th>
                <th scope="col">UTILIZZI</th>
                <th scope="col">PERCENTUALE</th>
              </tr>
            </thead>
            <tbody>
              ${(() => {
                const totalUses = Object.values(stats.transportCounts).reduce((a, b) => a + b, 0);
                return Object.entries(stats.transportCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([m, cnt]) => {
                    const pct = totalUses > 0 ? ((cnt / totalUses) * 100).toFixed(0) : '0';
                    return `<tr><th scope="row">${m}</th><td>${cnt}</td><td>${pct}%</td></tr>`;
                  }).join('');
              })()}
            </tbody>
          </table>
        </div>
      </section>

      <!-- 3. COMPAGNIE E VETTORI -->
      <section class="card">
        <h2>✈️ COMPAGNIE E VETTORI UTILIZZATI (${stats.carriersSet.size})</h2>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;">
          ${Array.from(stats.carriersSet).sort().map(car => `
            <span class="btn btn-sm btn-pink" style="pointer-events: none;">${car}</span>
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

    // Sort companion trips chronologically
    const getEndDate = (t) => {
      if (t.Data_Fine_Globale) return new Date(t.Data_Fine_Globale).getTime();
      if (t.Data_Inizio_Globale) return new Date(t.Data_Inizio_Globale).getTime();
      if (t.Anno_Viaggio) {
        const y = parseInt(String(t.Anno_Viaggio).match(/\d{4}/)?.[0] || '0');
        if (y > 0) return new Date(y, 11, 31).getTime();
      }
      return 0;
    };
    filteredTrips.sort((a, b) => getEndDate(b) - getEndDate(a));

    container.innerHTML = `
      <div class="action-bar" style="justify-content: space-between;">
        <button class="btn btn-sm btn-pink" onclick="PassaportoModule.openCategory('main')">
          <span aria-hidden="true">⬅️ </span>TORNA AL PASSAPORTO
        </button>
        <button class="btn btn-sm btn-primary" onclick="PassaportoModule.openPdfReport()">
          <span aria-hidden="true">📄 </span>GENERA PDF
        </button>
      </div>

      <h1 id="screen-title" tabindex="-1">COMPAGNI DI VIAGGIO</h1>

      <!-- 1. RIPARTIZIONE -->
      <section class="card">
        <h2>RIPARTIZIONE STATISTICA</h2>
        <div class="table-responsive">
          <table class="table-closed">
            <thead>
              <tr>
                <th scope="col">TIPOLOGIA</th>
                <th scope="col">NUMERO VIAGGI</th>
                <th scope="col">PERCENTUALE</th>
              </tr>
            </thead>
            <tbody>
              <tr><th scope="row">ESCLUSIVI ROBY & ELE 💙</th><td>${stats.robyEleCount}</td><td>${stats.robyElePercent}%</td></tr>
              <tr><th scope="row">VIAGGI CON LA CIURMA! 👥</th><td>${stats.ciurmaCount}</td><td>${stats.ciurmaPercent}%</td></tr>
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
            <div class="trips-list">
              ${filteredTrips.map(t => {
                const dStart = CONFIG.formatDateDisplay(t.Data_Inizio_Globale);
                const dEnd = CONFIG.formatDateDisplay(t.Data_Fine_Globale);
                const dateText = dStart && dEnd ? `Dal ${dStart} al ${dEnd}` : (dStart ? `Data ${dStart}` : (t.Anno_Viaggio ? `Anno ${t.Anno_Viaggio}` : ''));
                return `
                  <button type="button" class="card card-mint card-interactive card-btn" onclick="DiarioModule.openTripDetails('${t.ID_Viaggio}', 'passaporto')" aria-label="${t.Nome_Viaggio}. ${dateText}. Tocca due volte per aprire i dettagli del viaggio.">
                    <h3 style="color: var(--mint); margin: 0;">${t.Nome_Viaggio}</h3>
                    <p style="color: #ccc; font-size: 0.9rem; margin-top: 4px;">
                      📅 ${dStart && dEnd ? `${dStart} -> ${dEnd}` : (t.Anno_Viaggio || dStart || '-')}
                      ${t.Stati ? ` | 📍 ${t.Stati.replace(/\n/g, ', ')}` : ''}
                    </p>
                  </button>
                `;
              }).join('')}
            </div>
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
          <span aria-hidden="true">⬅️ </span>TORNA AL PASSAPORTO
        </button>
        <button class="btn btn-sm btn-primary" onclick="PassaportoModule.openPdfReport()">
          <span aria-hidden="true">📄 </span>GENERA PDF
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
              ${stats.mostExpensiveTrip ? `${stats.mostExpensiveTrip.Nome_Viaggio} (€ ${(stats.maxCost || 0).toLocaleString('it-IT')})` : 'Nessuno'}
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
            <thead>
              <tr>
                <th scope="col">CATEGORIA</th>
                <th scope="col">TOTALE SPESO</th>
                <th scope="col">PERCENTUALE</th>
              </tr>
            </thead>
            <tbody>
              ${CONFIG.EXPENSE_CATEGORIES.map(cat => {
                const amt = stats.budgetByCategory[cat.key] || 0;
                const pct = stats.totalSpend > 0 ? ((amt / stats.totalSpend) * 100).toFixed(1) : '0';
                return `<tr><th scope="row">${cat.label}</th><td>€ ${amt.toLocaleString('it-IT')}</td><td>${pct}%</td></tr>`;
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
          totalDaysTraveled: stats.totalDaysTraveled,
          totalKilometersTraveled: String(stats.totalKilometersTraveled),
          completedEarthLaps: stats.completedEarthLaps,
          earthLapPercent: stats.earthLapPercent,
          moonPercent: stats.moonPercent,
          topTrip: stats.top3IntenseTrips && stats.top3IntenseTrips[0] ? `${stats.top3IntenseTrips[0].Nome_Viaggio} (${stats.top3IntenseTrips[0].intensity.badge} ${stats.top3IntenseTrips[0].intensity.title})` : 'N/D',
          mostNorth: geo.mostNorth,
          mostSouth: geo.mostSouth,
          mostEast: geo.mostEast,
          mostWest: geo.mostWest,
          farthest: geo.farthestFromVenice,
          closestToNorthPole: geo.closestToNorthPole,
          closestToSouthPole: geo.closestToSouthPole,
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
