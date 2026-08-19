// ==========================================================================
// MOTTO ON TOUR - REAL PDF ENGINE & DIRECT EXPORTER (jsPDF + autoTable)
// Generazione documenti PDF binari reali con tabelle chiuse ad alta leggibilità
// Supporto salvataggio diretto su disco (File System Access API) e download
// ==========================================================================

const PDFEngine = {
  // Ottiene l'istanza globale di jsPDF
  getJsPDF() {
    if (typeof window !== "undefined") {
      if (window.jspdf && window.jspdf.jsPDF) {
        return window.jspdf.jsPDF;
      }
      if (window.jsPDF) {
        return window.jsPDF;
      }
    }
    return null;
  },

  // Salva il documento PDF su disco consentendo la scelta della cartella (Save As) o tramite download diretto
  async savePDFDocument(doc, filename) {
    App.notify(`Generazione file PDF in corso...`);
    try {
      const pdfBlob = doc.output('blob');

      // 1. File System Access API (Consente all'utente di scegliere dove salvare il file su PC / Mac)
      if (window.showSaveFilePicker) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: filename,
            types: [{
              description: 'Documento PDF (*.pdf)',
              accept: { 'application/pdf': ['.pdf'] }
            }]
          });
          const writable = await handle.createWritable();
          await writable.write(pdfBlob);
          await writable.close();
          App.notify(`File PDF salvato con successo: ${filename}`);
          if (typeof SoundFX !== 'undefined' && SoundFX.playConfirm) SoundFX.playConfirm();
          return;
        } catch (err) {
          if (err.name === 'AbortError') {
            // L'utente ha annullato la finestra di salvataggio
            return;
          }
          console.warn("showSaveFilePicker non riuscito, fallback su download diretto:", err);
        }
      }

      // 2. Fallback: Download diretto del file binario PDF nel browser
      const blobUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 250);

      App.notify(`Download file PDF completato: ${filename}`);
      if (typeof SoundFX !== 'undefined' && SoundFX.playConfirm) SoundFX.playConfirm();
    } catch (e) {
      console.error("Errore salvataggio PDF:", e);
      doc.save(filename);
      App.notify(`Download file PDF completato: ${filename}`);
    }
  },

  // Genera il PDF completo per un viaggio (Modulo In Partenza e Diario di bordo)
  async generateTripPDF(trip, options = {}) {
    const jsPDF = this.getJsPDF();
    if (!jsPDF) {
      alert("Libreria PDF non caricata. Ricarica la pagina per completare il salvataggio.");
      return;
    }

    const isHighContrast = options.isHighContrast || false;
    const includeCategories = options.includeCategories || ['dati', 'biglietti', 'hotel', 'budget', 'memorie'];
    const tripName = trip.Nome_Viaggio || "Viaggio";
    const cleanFilename = `Report_${tripName.replace(/[^a-zA-Z0-9_-]/g, '_')}_MottoOnTour.pdf`;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;

    // Palette cromatica
    const bgFill = isHighContrast ? [0, 0, 0] : [255, 255, 255];
    const textMain = isHighContrast ? [0, 255, 163] : [20, 20, 20];
    const titlePink = [255, 128, 191];
    const subHeaderColor = isHighContrast ? [255, 182, 193] : [60, 60, 60];
    const tblHeadBg = isHighContrast ? [26, 26, 26] : [235, 235, 235];
    const tblHeadText = isHighContrast ? [255, 128, 191] : [10, 10, 10];
    const tblLineColor = isHighContrast ? [255, 128, 191] : [180, 180, 180];
    const tblBodyBg = isHighContrast ? [0, 0, 0] : [255, 255, 255];
    const tblAltBg = isHighContrast ? [12, 12, 12] : [248, 248, 248];

    // Funzione colorazione sfondo pagina
    const paintPageBackground = () => {
      if (isHighContrast) {
        doc.setFillColor(bgFill[0], bgFill[1], bgFill[2]);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
      }
    };

    // Imposta sfondo prima pagina
    paintPageBackground();

    // Intestazione Ufficiale
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(titlePink[0], titlePink[1], titlePink[2]);
    doc.text("MOTTO ON TOUR", margin, 20);

    doc.setFontSize(10);
    doc.setTextColor(subHeaderColor[0], subHeaderColor[1], subHeaderColor[2]);
    doc.text("Roberto Lachin & Elena Travaini • Report Ufficiale di Viaggio", margin, 26);

    // Linea divisoria estetica
    doc.setDrawColor(titlePink[0], titlePink[1], titlePink[2]);
    doc.setLineWidth(0.8);
    doc.line(margin, 29, pageWidth - margin, 29);

    // Titolo e sottotitolo viaggio
    doc.setFontSize(13);
    doc.setTextColor(titlePink[0], titlePink[1], titlePink[2]);
    doc.text(`REPORT VIAGGIO: ${tripName.toUpperCase()}`, margin, 37);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textMain[0], textMain[1], textMain[2]);
    const datesStr = trip.Data_Inizio_Globale && trip.Data_Fine_Globale ? `Periodo: ${trip.Data_Inizio_Globale} -> ${trip.Data_Fine_Globale}` : (trip.Anno_Viaggio ? `Anno: ${trip.Anno_Viaggio}` : '');
    const typeStr = trip.Tipologia_Viaggio ? `Tipologia: ${trip.Tipologia_Viaggio}` : '';
    const infoLine = [datesStr, typeStr, `Generato il: ${new Date().toLocaleDateString('it-IT')}`].filter(Boolean).join(' | ');
    doc.text(infoLine, margin, 43);

    let startY = 49;

    // Raccolta delle sezioni / tabelle
    const sections = [];

    // 1. Dati di Massima
    if (includeCategories.includes('dati')) {
      const rows = [
        ["Nome Viaggio", trip.Nome_Viaggio || "-"],
        ["Date di Svolgimento", trip.Data_Inizio_Globale ? `${trip.Data_Inizio_Globale} -> ${trip.Data_Fine_Globale || '-'}` : (trip.Anno_Viaggio || '-')],
        ["Stati Visitati", trip.Stati || "-"],
        ["Città e Tappe", (trip.Citta || "-").replace(/\n/g, ', ')],
        ["Tipologia Viaggio", trip.Tipologia_Viaggio || "-"],
        ["Mezzi di Trasporto", (trip.Mezzi_Usati || "-").replace(/\n/g, ', ')],
        ["Compagnie / Vettori", (trip.Compagnie_Vettori || "-").replace(/\n/g, ', ')],
        ["Compagni di Viaggio", trip.Compagni_Viaggio || "Roby & Ele (Esclusivo)"],
        ["Cartella Google Drive", trip.Link_Cartella_Drive || "-"]
      ];
      sections.push({ title: "1. DATI GENERALI E LOGISTICA", headers: ["Campo", "Dettaglio"], rows, colWidths: [50, 132] });
    }

    // 2. Biglietti e Spostamenti
    if (includeCategories.includes('biglietti')) {
      let tickets = [];
      try {
        const raw = trip.Blocco_Biglietti_JSON || trip.Blocco_Biglietti_Integrale;
        if (raw) tickets = typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch (e) {}

      if (Array.isArray(tickets) && tickets.length > 0) {
        const rows = tickets.map((t, idx) => {
          let text = typeof t === 'object' ? Object.entries(t).map(([k, v]) => `${k}: ${v}`).join('\n') : String(t);
          return [`Biglietto ${idx + 1}`, text];
        });
        sections.push({ title: "2. DETTAGLIO BIGLIETTI E SPOSTAMENTI", headers: ["#", "Dati Spostamento"], rows, colWidths: [35, 147] });
      }
    }

    // 3. Strutture Ricettive e Hotel
    if (includeCategories.includes('hotel')) {
      let hotels = [];
      try {
        const raw = trip.Blocco_Hotel_JSON || trip.Blocco_Hotel_Integrale;
        if (raw) hotels = typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch (e) {}

      if (Array.isArray(hotels) && hotels.length > 0) {
        const rows = hotels.map((h, idx) => {
          let text = typeof h === 'object' ? Object.entries(h).map(([k, v]) => `${k}: ${v}`).join('\n') : String(h);
          return [`Hotel ${idx + 1}`, text];
        });
        sections.push({ title: "3. STRUTTURE RICETTIVE E HOTEL", headers: ["#", "Dettagli Alloggio"], rows, colWidths: [35, 147] });
      }
    }

    // 4. Budget Analitico
    if (includeCategories.includes('budget')) {
      const budgetRows = [];
      let totalBudget = 0;
      CONFIG.EXPENSE_CATEGORIES.forEach(cat => {
        const val = trip[cat.key];
        if (val !== undefined && val !== "" && Number(val) > 0) {
          const num = Number(val);
          totalBudget += num;
          budgetRows.push([cat.label, `€ ${num.toLocaleString('it-IT')}`]);
        }
      });
      if (budgetRows.length > 0) {
        budgetRows.push(["TOTALE SPESE VIAGGIO", `€ ${totalBudget.toLocaleString('it-IT')}`]);
        sections.push({ title: "4. DETTAGLIO ECONOMICO E BUDGET", headers: ["Categoria di Spesa", "Importo"], rows: budgetRows, colWidths: [120, 62] });
      }
    }

    // 5. Memorie ed Esperienze
    if (includeCategories.includes('memorie')) {
      const memRows = [];
      if (trip.Esperienze_Luoghi) memRows.push(["Attrazioni ed Esperienze", trip.Esperienze_Luoghi]);
      if (trip.Souvenir) memRows.push(["Souvenir Raccolti", trip.Souvenir]);
      if (trip.Momenti_Da_Ricordare) memRows.push(["Momenti da Ricordare", trip.Momenti_Da_Ricordare]);
      if (trip.Link_Podcast) memRows.push(["Episodi Podcast", trip.Link_Podcast]);
      if (trip.Note_Varie || trip.Note_Preparazione) memRows.push(["Note e Riflessioni", trip.Note_Varie || trip.Note_Preparazione]);

      if (memRows.length > 0) {
        sections.push({ title: "5. ESPERIENZE E MEMORIE DEL VIAGGIO", headers: ["Sezione", "Contenuto"], rows: memRows, colWidths: [50, 132] });
      }
    }

    // Renderizza ogni tabella con autoTable
    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];

      if (startY > pageHeight - 35) {
        doc.addPage();
        paintPageBackground();
        startY = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(titlePink[0], titlePink[1], titlePink[2]);
      doc.text(sec.title, margin, startY);
      startY += 4;

      doc.autoTable({
        startY: startY,
        margin: { left: margin, right: margin },
        head: [sec.headers],
        body: sec.rows,
        theme: 'grid',
        headStyles: {
          fillColor: tblHeadBg,
          textColor: tblHeadText,
          fontStyle: 'bold',
          lineWidth: 0.25,
          lineColor: tblLineColor,
          fontSize: 9
        },
        bodyStyles: {
          fillColor: tblBodyBg,
          textColor: textMain,
          lineWidth: 0.2,
          lineColor: tblLineColor,
          fontSize: 8.5
        },
        alternateRowStyles: {
          fillColor: tblAltBg
        },
        styles: {
          cellPadding: 2.5,
          overflow: 'linebreak'
        },
        columnStyles: sec.colWidths ? {
          0: { cellWidth: sec.colWidths[0] },
          1: { cellWidth: sec.colWidths[1] }
        } : {},
        didDrawPage: () => {
          paintPageBackground();
        }
      });

      startY = doc.lastAutoTable.finalY + 9;
    }

    // Numerazione Pagine nel Piè di Pagina
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(subHeaderColor[0], subHeaderColor[1], subHeaderColor[2]);
      doc.text(
        `MOTTO ON TOUR • Pagina ${p} di ${totalPages}`,
        pageWidth / 2,
        pageHeight - 8,
        { align: 'center' }
      );
    }

    // Salva o Scarica il file PDF reale
    await this.savePDFDocument(doc, cleanFilename);
  },

  // Genera il PDF del Report Statistico Generale del Passaporto
  async generatePassportPDF(statsData, isHighContrast = false) {
    const jsPDF = this.getJsPDF();
    if (!jsPDF) {
      alert("Libreria PDF non caricata. Ricarica la pagina e riprova.");
      return;
    }

    const cleanFilename = `Report_Passaporto_Statistiche_MottoOnTour.pdf`;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;

    const bgFill = isHighContrast ? [0, 0, 0] : [255, 255, 255];
    const textMain = isHighContrast ? [0, 255, 163] : [20, 20, 20];
    const titlePink = [255, 128, 191];
    const subHeaderColor = isHighContrast ? [255, 182, 193] : [60, 60, 60];
    const tblHeadBg = isHighContrast ? [26, 26, 26] : [235, 235, 235];
    const tblHeadText = isHighContrast ? [255, 128, 191] : [10, 10, 10];
    const tblLineColor = isHighContrast ? [255, 128, 191] : [180, 180, 180];
    const tblBodyBg = isHighContrast ? [0, 0, 0] : [255, 255, 255];
    const tblAltBg = isHighContrast ? [12, 12, 12] : [248, 248, 248];

    const paintPageBackground = () => {
      if (isHighContrast) {
        doc.setFillColor(bgFill[0], bgFill[1], bgFill[2]);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
      }
    };

    paintPageBackground();

    // Intestazione Ufficiale
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(titlePink[0], titlePink[1], titlePink[2]);
    doc.text("MOTTO ON TOUR", margin, 20);

    doc.setFontSize(10);
    doc.setTextColor(subHeaderColor[0], subHeaderColor[1], subHeaderColor[2]);
    doc.text("Roberto Lachin & Elena Travaini • Centro Statistico del Passaporto", margin, 26);

    doc.setDrawColor(titlePink[0], titlePink[1], titlePink[2]);
    doc.setLineWidth(0.8);
    doc.line(margin, 29, pageWidth - margin, 29);

    doc.setFontSize(13);
    doc.setTextColor(titlePink[0], titlePink[1], titlePink[2]);
    doc.text("REPORT STATISTICO GENERALE - IL MIO PASSAPORTO", margin, 37);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textMain[0], textMain[1], textMain[2]);
    doc.text(`Data generazione: ${new Date().toLocaleDateString('it-IT')} | Documento Riservato`, margin, 43);

    let startY = 49;

    const tables = [
      {
        title: "1. SINTESI GLOBALE VIAGGI E GEOGRAFIA",
        headers: ["Indicatore", "Valore"],
        rows: [
          ["Viaggi Conclusi Totali", String(statsData.totalTrips || "0")],
          ["Stati del Mondo Visitati", `${statsData.visitedStatesCount || 0} / 195 (${statsData.worldPercentage || '0'}%)`],
          ["Città e Tappe Esplorate", String(statsData.totalCitiesCount || "0")],
          ["Spesa Complessiva Storica", `€ ${statsData.totalSpend || '0'}`],
          ["Souvenir Raccolti nel Mondo", String(statsData.totalSouvenirs || "0")]
        ],
        colWidths: [110, 72]
      },
      {
        title: "2. RECORD GEOGRAFICI (RIFERIMENTO VENEZIA)",
        headers: ["Traguardo", "Località / Dato"],
        rows: [
          ["Città più a Nord", statsData.mostNorth ? `${statsData.mostNorth.Citta} (${statsData.mostNorth.Stato})` : "IN ATTESA DEL PRIMO VIAGGIO"],
          ["Città più a Sud", statsData.mostSouth ? `${statsData.mostSouth.Citta} (${statsData.mostSouth.Stato})` : "IN ATTESA DEL PRIMO VIAGGIO"],
          ["Città più a Est", statsData.mostEast ? `${statsData.mostEast.Citta} (${statsData.mostEast.Stato})` : "IN ATTESA DEL PRIMO VIAGGIO"],
          ["Città più a Ovest", statsData.mostWest ? `${statsData.mostWest.Citta} (${statsData.mostWest.Stato})` : "IN ATTESA DEL PRIMO VIAGGIO"],
          ["Città più Lontana da Venezia", statsData.farthest ? `${statsData.farthest.Citta} (${statsData.farthest.distFromVenice} km)` : "IN ATTESA DEL PRIMO VIAGGIO"],
          ["Città più Vicina a Venezia", statsData.closest ? `${statsData.closest.Citta} (${statsData.closest.distFromVenice} km)` : "IN ATTESA DEL PRIMO VIAGGIO"]
        ],
        colWidths: [80, 102]
      },
      {
        title: "3. RIPARTIZIONE COMPAGNI DI VIAGGIO",
        headers: ["Tipologia Uscita", "Totale Viaggi", "Percentuale"],
        rows: [
          ["Esclusivi Roby & Ele", String(statsData.robyEleCount || "0"), `${statsData.robyElePercent || '0'}%`],
          ["Viaggi con la Ciurma!", String(statsData.ciurmaCount || "0"), `${statsData.ciurmaPercent || '0'}%`]
        ],
        colWidths: [82, 50, 50]
      }
    ];

    if (statsData.budgetByCategory) {
      const budgetRows = [];
      CONFIG.EXPENSE_CATEGORIES.forEach(c => {
        const amt = statsData.budgetByCategory[c.key] || 0;
        if (amt > 0) {
          budgetRows.push([c.label, `€ ${amt.toLocaleString('it-IT')}`]);
        }
      });
      if (budgetRows.length > 0) {
        tables.push({
          title: "4. SPESA STORICA PER CATEGORIA",
          headers: ["Categoria di Spesa", "Totale Cumulativo"],
          rows: budgetRows,
          colWidths: [110, 72]
        });
      }
    }

    for (let i = 0; i < tables.length; i++) {
      const tbl = tables[i];

      if (startY > pageHeight - 35) {
        doc.addPage();
        paintPageBackground();
        startY = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(titlePink[0], titlePink[1], titlePink[2]);
      doc.text(tbl.title, margin, startY);
      startY += 4;

      doc.autoTable({
        startY: startY,
        margin: { left: margin, right: margin },
        head: [tbl.headers],
        body: tbl.rows,
        theme: 'grid',
        headStyles: {
          fillColor: tblHeadBg,
          textColor: tblHeadText,
          fontStyle: 'bold',
          lineWidth: 0.25,
          lineColor: tblLineColor,
          fontSize: 9
        },
        bodyStyles: {
          fillColor: tblBodyBg,
          textColor: textMain,
          lineWidth: 0.2,
          lineColor: tblLineColor,
          fontSize: 8.5
        },
        alternateRowStyles: {
          fillColor: tblAltBg
        },
        styles: {
          cellPadding: 2.5,
          overflow: 'linebreak'
        },
        columnStyles: tbl.colWidths ? {
          0: { cellWidth: tbl.colWidths[0] },
          1: { cellWidth: tbl.colWidths[1] },
          2: tbl.colWidths[2] ? { cellWidth: tbl.colWidths[2] } : undefined
        } : {},
        didDrawPage: () => {
          paintPageBackground();
        }
      });

      startY = doc.lastAutoTable.finalY + 9;
    }

    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(subHeaderColor[0], subHeaderColor[1], subHeaderColor[2]);
      doc.text(
        `MOTTO ON TOUR • Pagina ${p} di ${totalPages}`,
        pageWidth / 2,
        pageHeight - 8,
        { align: 'center' }
      );
    }

    await this.savePDFDocument(doc, cleanFilename);
  }
};
