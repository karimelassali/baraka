import PolicyLayout from '../../components/PolicyLayout';
import PolicySection from '../../components/PolicySection';
import PolicyContent from '../../components/PolicyContent';

export default function PrivacyPage() {
  return (
    <PolicyLayout
      title="Informativa sulla Privacy"
      lastUpdated="12 Dicembre 2025"
    >
      <PolicyContent>
        <PolicySection title="Titolare del Trattamento dei Dati" id="data-controller">
          <p>
            <strong>Baraka S.R.L.</strong><br />
            Sede legale: [Inserire Indirizzo Completo]<br />
            Partita IVA / Codice Fiscale: [Inserire P.IVA]<br />
            Indirizzo email del Titolare: [Inserire Email Privacy]<br />
          </p>
        </PolicySection>

        <PolicySection title="Tipologie di Dati raccolti" id="types-of-data">
          <p>
            Fra i Dati Personali raccolti da questa Applicazione, in modo autonomo o tramite terze parti, ci sono:
            Cookie; Dati di utilizzo; email; nome; cognome; numero di telefono; indirizzo; nazione; provincia; CAP; città.
          </p>
          <p className="mt-3">
            Dettagli completi su ciascuna tipologia di dati raccolti sono forniti nelle sezioni dedicate di questa privacy policy
            o mediante specifici testi informativi visualizzati prima della raccolta dei dati stessi.
            I Dati Personali possono essere liberamente forniti dall'Utente o, nel caso di Dati di Utilizzo, raccolti automaticamente
            durante l'uso di questa Applicazione.
          </p>
        </PolicySection>

        <PolicySection title="Modalità e luogo del trattamento dei Dati raccolti" id="methods-and-place">
          <h3 className="text-lg font-semibold mb-2">Modalità di trattamento</h3>
          <p>
            Il Titolare adotta le opportune misure di sicurezza volte ad impedire l’accesso, la divulgazione, la modifica o la
            distruzione non autorizzate dei Dati Personali.
            Il trattamento viene effettuato mediante strumenti informatici e/o telematici, con modalità organizzative e con
            logiche strettamente correlate alle finalità indicate.
          </p>

          <h3 className="text-lg font-semibold mt-4 mb-2">Base giuridica del trattamento</h3>
          <p>
            Il Titolare tratta Dati Personali relativi all’Utente in caso sussista una delle seguenti condizioni:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>l’Utente ha prestato il consenso per una o più finalità specifiche;</li>
            <li>il trattamento è necessario all'esecuzione di un contratto con l’Utente e/o all'esecuzione di misure precontrattuali;</li>
            <li>il trattamento è necessario per adempiere un obbligo legale al quale è soggetto il Titolare;</li>
            <li>il trattamento è necessario per il perseguimento del legittimo interesse del Titolare o di terzi.</li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-2">Luogo</h3>
          <p>
            I Dati sono trattati presso le sedi operative del Titolare ed in ogni altro luogo in cui le parti coinvolte nel
            trattamento siano localizzate. Per ulteriori informazioni, contatta il Titolare.
            I Dati Personali dell’Utente potrebbero essere trasferiti in un paese diverso da quello in cui l’Utente si trova.
          </p>

          <h3 className="text-lg font-semibold mt-4 mb-2">Periodo di conservazione</h3>
          <p>
            I Dati sono trattati e conservati per il tempo richiesto dalle finalità per le quali sono stati raccolti.
            Pertanto:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>I Dati Personali raccolti per scopi collegati all’esecuzione di un contratto tra il Titolare e l’Utente saranno trattenuti sino a quando sia completata l’esecuzione di tale contratto.</li>
            <li>I Dati Personali raccolti per finalità riconducibili all’interesse legittimo del Titolare saranno trattenuti sino al soddisfacimento di tale interesse.</li>
          </ul>
        </PolicySection>

        <PolicySection title="Finalità del Trattamento dei Dati raccolti" id="purpose-of-processing">
          <p>
            I Dati dell’Utente sono raccolti per consentire al Titolare di fornire il Servizio, adempiere agli obblighi di legge,
            rispondere a richieste o azioni esecutive, tutelare i propri diritti ed interessi (o quelli di Utenti o di terze parti),
            individuare eventuali attività dolose o fraudolente, nonché per le seguenti finalità:
            Statistica, Contattare l'Utente, Gestione contatti e invio di messaggi, Registrazione ed autenticazione,
            Gestione dei pagamenti e Visualizzazione di contenuti da piattaforme esterne.
          </p>
        </PolicySection>

        <PolicySection title="Diritti dell’Utente" id="user-rights">
          <p>
            Gli Utenti possono esercitare determinati diritti con riferimento ai Dati trattati dal Titolare.
            In particolare, l’Utente ha il diritto di:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li><strong>Revocare il consenso in ogni momento.</strong> L’Utente può revocare il consenso al trattamento dei propri Dati Personali precedentemente espresso.</li>
            <li><strong>Opporsi al trattamento dei propri Dati.</strong> L’Utente può opporsi al trattamento dei propri Dati quando esso avviene su una base giuridica diversa dal consenso.</li>
            <li><strong>Accedere ai propri Dati.</strong> L’Utente ha diritto ad ottenere informazioni sui Dati trattati dal Titolare, su determinati aspetti del trattamento ed a ricevere una copia dei Dati trattati.</li>
            <li><strong>Verificare e chiedere la rettificazione.</strong> L’Utente può verificare la correttezza dei propri Dati e richiederne l’aggiornamento o la correzione.</li>
            <li><strong>Ottenere la limitazione del trattamento.</strong> Quando ricorrono determinate condizioni, l’Utente può richiedere la limitazione del trattamento dei propri Dati.</li>
            <li><strong>Ottenere la cancellazione o rimozione dei propri Dati Personali.</strong> Quando ricorrono determinate condizioni, l’Utente può richiedere la cancellazione dei propri Dati da parte del Titolare.</li>
            <li><strong>Ricevere i propri Dati o farli trasferire ad altro titolare.</strong> L’Utente ha diritto di ricevere i propri Dati in formato strutturato, di uso comune e leggibile da dispositivo automatico e, ove tecnicamente fattibile, di ottenerne il trasferimento senza ostacoli ad un altro titolare.</li>
            <li><strong>Proporre reclamo.</strong> L’Utente può proporre un reclamo all’autorità di controllo della protezione dei dati personali competente o agire in sede giudiziale.</li>
          </ul>
        </PolicySection>

        <PolicySection title="Cookie Policy" id="cookie-policy">
          <p>
            Questa Applicazione fa utilizzo di Strumenti di Tracciamento. Per saperne di più, l’Utente può consultare la
            <a href="#" className="text-blue-600 hover:underline ml-1">Cookie Policy</a>.
          </p>
        </PolicySection>

        <PolicySection title="Ulteriori informazioni sul trattamento" id="additional-info">
          <h3 className="text-lg font-semibold mb-2">Difesa in giudizio</h3>
          <p>
            I Dati Personali dell’Utente possono essere utilizzati da parte del Titolare in giudizio o nelle fasi preparatorie
            alla sua eventuale instaurazione per la difesa da abusi nell'utilizzo di questa Applicazione o dei Servizi connessi
            da parte dell’Utente.
            L’Utente dichiara di essere consapevole che il Titolare potrebbe essere obbligato a rivelare i Dati per ordine
            delle autorità pubbliche.
          </p>

          <h3 className="text-lg font-semibold mt-4 mb-2">Informative specifiche</h3>
          <p>
            Su richiesta dell’Utente, in aggiunta alle informazioni contenute in questa privacy policy, questa Applicazione
            potrebbe fornire all'Utente delle informative aggiuntive e contestuali riguardanti Servizi specifici, o la raccolta
            ed il trattamento di Dati Personali.
          </p>

          <h3 className="text-lg font-semibold mt-4 mb-2">Log di sistema e manutenzione</h3>
          <p>
            Per necessità legate al funzionamento ed alla manutenzione, questa Applicazione e gli eventuali servizi terzi
            da essa utilizzati potrebbero raccogliere log di sistema, ossia file che registrano le interazioni e che possono
            contenere anche Dati Personali, quali l’indirizzo IP Utente.
          </p>
        </PolicySection>

        <PolicySection title="Modifiche a questa privacy policy" id="changes">
          <p>
            Il Titolare del Trattamento si riserva il diritto di apportare modifiche alla presente privacy policy in qualunque
            momento notificandolo agli Utenti su questa pagina e, se possibile, su questa Applicazione nonché, qualora tecnicamente
            e legalmente fattibile, inviando una notifica agli Utenti attraverso uno degli estremi di contatto di cui è in possesso.
            Si prega dunque di consultare con frequenza questa pagina, facendo riferimento alla data di ultima modifica indicata in fondo.
          </p>
        </PolicySection>
      </PolicyContent>
    </PolicyLayout>
  );
}