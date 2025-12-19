import PolicyLayout from '../../components/PolicyLayout';
import PolicySection from '../../components/PolicySection';
import PolicyContent from '../../components/PolicyContent';

export default function TermsPage() {
  return (
    <PolicyLayout
      title="Termini e Condizioni"
      lastUpdated="12 Dicembre 2025"
    >
      <PolicyContent>
        <PolicySection title="Introduzione" id="introduction">
          <p>
            I presenti Termini e Condizioni disciplinano l'uso di questa Applicazione e dei Servizi forniti da <strong>Baraka S.R.L.</strong>.
            L'Utente è pregato di leggere attentamente questo documento prima di utilizzare l'Applicazione.
          </p>
          <p className="mt-2">
            Utilizzando l'Applicazione, l'Utente accetta di essere vincolato da questi Termini. Se l'Utente non accetta i Termini,
            non deve utilizzare l'Applicazione.
          </p>
        </PolicySection>

        <PolicySection title="Definizioni" id="definitions">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Applicazione:</strong> il sito web, l'app e i servizi correlati forniti da Baraka S.R.L.</li>
            <li><strong>Utente:</strong> la persona fisica o giuridica che utilizza l'Applicazione.</li>
            <li><strong>Servizio:</strong> il servizio offerto tramite l'Applicazione come descritto nei presenti Termini.</li>
            <li><strong>Titolare:</strong> Baraka S.R.L., P.IVA 02696700182.</li>
          </ul>
        </PolicySection>

        <PolicySection title="Requisiti di Età" id="age-requirements">
          <p>
            Per utilizzare questa Applicazione, l'Utente deve avere almeno 18 anni. Utilizzando l'Applicazione, l'Utente dichiara
            e garantisce di avere almeno 18 anni e di avere la capacità legale di stipulare un contratto vincolante.
          </p>
        </PolicySection>

        <PolicySection title="Registrazione Account" id="account-registration">
          <p>
            Per utilizzare alcune funzionalità dell'Applicazione, l'Utente potrebbe dover registrarsi creando un account.
            L'Utente è responsabile di mantenere la riservatezza delle proprie credenziali di accesso e di tutte le attività
            che si verificano sotto il proprio account.
          </p>
          <p className="mt-2">
            L'Utente si impegna a fornire informazioni veritiere, accurate e complete durante la registrazione e ad aggiornarle
            tempestivamente in caso di modifiche. Il Titolare si riserva il diritto di sospendere o chiudere l'account in caso
            di violazione dei presenti Termini.
          </p>
        </PolicySection>

        <PolicySection title="Prodotti e Servizi" id="products-services">
          <p>
            I prodotti e servizi disponibili sull'Applicazione sono descritti nelle rispettive pagine. Il Titolare si impegna
            a presentare le caratteristiche dei prodotti col maggior grado di dettaglio possibile. Tuttavia, le immagini ed i colori
            dei prodotti offerti in vendita potrebbero differire da quelli reali a causa di molti fattori, tra cui le impostazioni
            del monitor dell'Utente.
          </p>
        </PolicySection>

        <PolicySection title="Ordini e Pagamenti" id="orders-payments">
          <p>
            L'invio dell'ordine comporta l'accettazione dei prezzi, delle descrizioni dei prodotti e delle presenti condizioni di vendita.
            Il Titolare si riserva il diritto di rifiutare o cancellare ordini a propria discrezione (es. indisponibilità prodotti,
            errori di prezzo, sospetta frode).
          </p>
          <p className="mt-2">
            I metodi di pagamento accettati sono indicati durante la procedura di acquisto. I pagamenti sono gestiti da fornitori
            terzi sicuri; il Titolare non raccoglie né memorizza i dati completi delle carte di pagamento.
          </p>
        </PolicySection>

        <PolicySection title="Diritto di Recesso" id="withdrawal-right">
          <p>
            L'Utente Consumatore ha il diritto di recedere dal contratto entro 14 giorni senza dover fornire alcuna motivazione.
            Il periodo di recesso scade dopo 14 giorni dal giorno in cui l'Utente o un terzo acquisisce il possesso fisico dei beni.
          </p>
          <p className="mt-2">
            Per esercitare il diritto di recesso, l'Utente deve informare il Titolare della sua decisione tramite una dichiarazione esplicita
            (es. lettera inviata per posta o email).
            In caso di recesso, saranno rimborsati tutti i pagamenti effettuati, compresi i costi di consegna (ad eccezione dei costi supplementari),
            senza indebito ritardo e in ogni caso non oltre 14 giorni dal giorno in cui siamo informati della decisione di recedere.
          </p>
        </PolicySection>

        <PolicySection title="Proprietà Intellettuale" id="intellectual-property">
          <p>
            Tutti i contenuti dell'Applicazione, inclusi testi, grafica, loghi, immagini, clip audio, download digitali e software,
            sono di proprietà del Titolare o dei suoi fornitori di contenuti e sono protetti dalle leggi internazionali sul copyright.
            È vietata la riproduzione, duplicazione, copia, vendita o sfruttamento per fini commerciali senza espresso consenso scritto.
          </p>
        </PolicySection>

        <PolicySection title="Limitazione di Responsabilità" id="limitation-liability">
          <p>
            L'Applicazione viene fornita "così com'è" e "come disponibile". Il Titolare non rilascia alcuna garanzia, esplicita o implicita,
            in relazione all'operatività dell'Applicazione o alle informazioni, contenuti, materiali o prodotti in essa inclusi.
          </p>
          <p className="mt-2">
            Nella misura massima consentita dalla legge applicabile, il Titolare non sarà responsabile per danni di qualsiasi natura
            derivanti dall'uso dell'Applicazione, inclusi, a titolo esemplificativo, danni diretti, indiretti, incidentali, punitivi e consequenziali.
          </p>
        </PolicySection>

        <PolicySection title="Legge Applicabile e Foro Competente" id="governing-law">
          <p>
            I presenti Termini e tutte le controversie in merito ad esecuzione, interpretazione e validità del presente contratto
            sono soggette alla legge italiana.
            Foro competente esclusivo per qualsiasi controversia è quello del luogo in cui ha sede legale il Titolare, fatta eccezione
            per il foro obbligatorio del consumatore, ove applicabile.
          </p>
        </PolicySection>

        <PolicySection title="Modifiche ai Termini" id="changes-terms">
          <p>
            Il Titolare si riserva il diritto di modificare i presenti Termini in qualsiasi momento. Le modifiche saranno efficaci
            dal momento della pubblicazione sull'Applicazione. L'uso continuato dell'Applicazione dopo la pubblicazione delle modifiche
            costituirà accettazione dei nuovi Termini.
          </p>
        </PolicySection>

        <PolicySection title="Contatti" id="contact">
          <p>
            Per qualsiasi domanda riguardante i presenti Termini, si prega di contattarci a:<br />
            <strong>Baraka S.R.L.</strong><br />
            Email: baraka.csg@gmail.com<br />
            Indirizzo: Via Borgonovo 1, 29015 Castel San Giovanni PC
          </p>
        </PolicySection>
      </PolicyContent>
    </PolicyLayout>
  );
}