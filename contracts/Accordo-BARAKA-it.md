---
stylesheet:
  - contracts/pdf.css
body_class:
  - markdown-body
pdf_options:
  format: A4
  margin: 15mm
  printBackground: true
---

# Contratto per il Sistema di Fidelizzazione BARAKA

| Metadati | Valore |
| --- | --- |
| Data | ______________________________ |
| Riferimento | ______________________________ |

## Parti

| Ruolo | Nome completo | Indirizzo | Città, Paese | Codice Fiscale / N. Passaporto |
| --- | --- | --- | --- | --- |
| Cliente | ______________________________ | ______________________________ | ______________________________ | ______________________________ |
| Fornitore | ______________________________ | ______________________________ | ______________________________ | ______________________________ |

Insieme, le **Parti**.

## Sommario Progetto

| Voce | Descrizione |
| --- | --- |
| Titolo | BARAKA Loyalty & Marketing Web Platform |
| Sommario | Applicazione web multilingua con portale amministrativo, dashboard clienti, pagine pubbliche, backend Supabase e integrazione campagne WhatsApp. Fornisce gestione punti fedeltà, voucher, offerte, recensioni, analitiche e strumenti GDPR. |
| Stack Tecnologico | Next.js, React, next-intl, Supabase (PostgreSQL/Auth/Storage/RLS), Framer Motion, Tailwind/UI, WhatsApp Business API |

## Ambito di Lavoro

- **Portale Amministrativo**: accesso basato su ruoli; moduli per Clienti, Inventario e Categorie, Offerte, Punti, Voucher, Recensioni, Galleria, Log, Notifiche, Analitiche.
- **Portale Clienti**: panoramica, wallet punti, voucher, offerte esclusive, aggiornamento profilo.
- **Sito Pubblico**: hero, chi siamo, galleria dinamica, offerte live, recensioni approvate, contatti/posizione, pulsante WhatsApp.
- **API**: endpoint sicuri per operazioni amministrative e clienti, cron (report scadenze), GDPR export/delete, login/register (magic link).
- **Database & Autenticazione**: schema Supabase, migrazioni, RLS, servizi per entità (clienti, offerte, recensioni, voucher, impostazioni).
- **Internazionalizzazione**: rotte e messaggi localizzati (`en`, `it`, `ar`).
- **UI/UX**: layout responsive, animazioni, componenti in glassmorphism, form orientati all’accessibilità.
- **Consegne**: codice sorgente configurato, template variabili d’ambiente, istruzioni di deploy, utility di seed/test.

## Caratteristiche Rappresentative

- Portale admin con navigazione basata su ruoli e moduli gestionali per tutte le aree operative.
- Gestione offerte con campi multilingua, stato, immagini e integrazione API sicura.
- Dashboard cliente con offerte attive, voucher e punti fedeltà in interfaccia responsiva.
- Schema dati Supabase con viste, trigger e sicurezza a livello di riga; endpoint GDPR per esportazione/eliminazione dati.
- Internazionalizzazione per inglese, italiano e arabo con rotte e messaggi localizzati.

<div class="page-break"></div>

## Cronoprogramma

| Milestone | Settimana | Data esatta |
| --- | --- | --- |
| Avvio & setup ambiente | Settimana 1 | ______________________________ |
| Funzionalità core portale admin | Settimane 2–3 | ______________________________ |
| Portale clienti & sito pubblico | Settimane 3–4 | ______________________________ |
| Integrazioni & i18n | Settimane 4–5 | ______________________________ |
| Test, rifinitura, handover | Settimana 6 | ______________________________ |

Le date possono variare a seguito di richieste di variazione scritte.

## Corrispettivi e Pagamenti

| Voce | Importo | Scadenza |
| --- | --- | --- |
| Corrispettivo Totale | €1.800 EUR | — |
| Primo Pagamento (40%) | €720 EUR | Alla firma del contratto |
| Saldo (60%) | €1.080 EUR | Alla consegna finale e accettazione |

- I pagamenti sono dovuti entro **7 giorni** dal ricevimento fattura.
- Ritardi di pagamento: interessi di mora **[X%] al mese**.

## Variazioni

- Modifiche oltre l’**Ambito di Lavoro** richiedono ordine di variazione scritto con tempi e costi aggiornati.
- Incrementi sostanziali dell’ambito possono impattare tempi e costi.

## Responsabilità del Cliente

- Fornire accessi e credenziali necessari (es. Supabase, WhatsApp Business API).
- Fornire asset di brand, contenuti e testi.
- Feedback e approvazioni entro **3 giorni lavorativi** sulle consegne di milestone.

## Proprietà Intellettuale

- Al **pagamento integrale**, il Cliente acquisisce la titolarità degli asset e del codice sviluppati in questo progetto, con le seguenti eccezioni:
  - Librerie/framework/terze parti restano soggetti alle licenze originali.
  - Strumenti e template riutilizzabili del Fornitore sono concessi in licenza per l’uso nel progetto.
- Il Fornitore può citare il progetto nel proprio portfolio salvo divieto scritto del Cliente.

## Riservatezza

- Le Parti manterranno **confidenziali** informazioni proprietarie, credenziali, dati clienti e piani di business e le useranno solo per l’esecuzione del progetto.

## Protezione Dati

- La piattaforma include funzionalità **GDPR** (export/delete); la conformità operativa dipende da politiche del Cliente, fonti dati e corretta configurazione.
- Il Cliente è il **Titolare del trattamento**; il Fornitore è **Responsabile** solo per sviluppo e integrazione.
- Il Cliente deve garantire basi giuridiche, consensi, politiche di conservazione e accordi **DPA** con terze parti (es. WhatsApp, Supabase).

## Garanzie

- Il Fornitore garantisce che i deliverable funzioneranno in modo conforme per **30 giorni** dall’accettazione; correzioni di bug verranno fornite in tempi ragionevoli.
- Nessuna garanzia per problemi causati da terze parti, misconfigurazioni o cambiamenti fuori controllo.

## Accettazione

- L’accettazione avviene quando le funzionalità consegnate rispettano l’**Ambito di Lavoro** e superano i test concordati.
- Difetti segnalati entro **10 giorni lavorativi** saranno corretti e ripresentati per accettazione.

## Manutenzione e Supporto

- Inclusi: **30 giorni** di supporto post-accettazione per bug fix (email/chat).
- Manutenzione evolutiva, nuove funzionalità e hosting/ops disponibili con accordo separato.

## Risoluzione

- Ciascuna Parte può risolvere per inadempimento con **preavviso di 10 giorni lavorativi** se l’altra Parte non rimedia.
- In caso di risoluzione, il Cliente paga il lavoro svolto fino a quella data; i diritti IP trasferiscono **pro rata** al pagamento.

## Responsabilità

- Esclusione di **danni indiretti o consequenziali**.
- Responsabilità complessiva limitata ai **corrispettivi pagati**.

## Legge Applicabile e Foro Competente

- Il presente accordo è regolato dalla **legge italiana**. Foro competente: **______________________________ (Città, Italia)**, salvo diverso accordo.

## Intero Accordo

- Il presente documento costituisce l’**intero accordo** tra le Parti e sostituisce comunicazioni/accordi precedenti. Le modifiche devono essere **per iscritto** e firmate da entrambe le Parti.

## Firme

| Parte | Firma | Data |
| --- | --- | --- |
| Cliente | ______________________________ | ______________________________ |
| Fornitore | ______________________________ | ______________________________ |

| Nome stampatello | Identificativo |
| --- | --- |
| Cliente: ______________________________ | CF/Passaporto: ______________________________ |
| Fornitore: ______________________________ | CF/Passaporto: ______________________________ |