import PolicyLayout from '../components/PolicyLayout';
import PolicySection from '../components/PolicySection';
import PolicyContent from '../components/PolicyContent';

export default function PrivacyPage() {
  return (
    <PolicyLayout 
      title="Privacy Policy" 
      lastUpdated="November 13, 2025"
    >
      <PolicyContent>
        <PolicySection title="Who We Are" id="who-we-are">
          <p>
            We are [Legal Company Name] ("we", "us", "our"), registered at [Full Address], 
            company/tax number [Number if applicable]. You can contact us at [privacy email] 
            or [phone], or by post to the address above. If appointed, our Data Protection 
            Officer (DPO) can be reached at [DPO email]. If we are not established in the 
            EU, our EU Representative is [Name, Address, Email].
          </p>
        </PolicySection>

        <PolicySection title="What This Policy Covers" id="what-this-policy-covers">
          <p>
            This policy explains how we collect, use, share, store, secure, and delete 
            your personal data when you visit, register, or use [Service Name] (the 
            "Service"), and describes your rights under the GDPR.
          </p>
        </PolicySection>

        <PolicySection title="The Data We Collect" id="data-we-collect">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Identification and contact data:</strong> first name, last name, email, phone.</li>
            <li><strong>Account data:</strong> password (stored hashed), language preferences, account settings.</li>
            <li><strong>Demographic and profile data:</strong> date of birth, residence, country of origin.</li>
            <li><strong>Technical data:</strong> IP address, device identifiers, browser type, pages viewed, and timestamps.</li>
            <li><strong>Cookies/SDK data:</strong> necessary and, with consent, analytics/marketing cookies. See "Cookies and similar technologies."</li>
            <li><strong>Optional data</strong> you provide to support, surveys, or feature requests.</li>
          </ul>
          <p className="mt-3">
            Do not provide special categories of data (e.g., health, biometric, political 
            opinions) unless specifically requested and lawfully justified; otherwise we 
            will not knowingly process them.
          </p>
        </PolicySection>

        <PolicySection title="Why We Process Your Data" id="why-we-process-data">
          <p>We process personal data only where a valid legal basis applies:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li><strong>Account creation and administration:</strong> to register you, authenticate you, and provide the Service (contract).</li>
            <li><strong>Service operation and security:</strong> to operate, maintain, troubleshoot, prevent fraud/abuse (legitimate interests; where needed, legal obligation).</li>
            <li><strong>Communications:</strong> service emails about changes, security, or account notices (contract/legal obligation); optional marketing with your consent and an opt‑out.</li>
            <li><strong>Analytics and improvement:</strong> to understand usage, improve performance and features (legitimate interests; analytics cookies only with consent).</li>
            <li><strong>Compliance:</strong> to meet legal obligations (tax, accounting, regulatory requests), enforce terms, protect rights.</li>
          </ul>
          <p className="mt-3">
            Where we rely on legitimate interests, we balance our interests against your rights 
            and freedoms and can provide details upon request. You may object to processing 
            based on legitimate interests.
          </p>
        </PolicySection>

        <PolicySection title="If You Must Provide Data" id="when-you-must-provide-data">
          <p>
            Where data are necessary to create an account or provide the Service, failure to 
            provide them may prevent registration or access. Mandatory fields are marked at 
            registration.
          </p>
        </PolicySection>

        <PolicySection title="Who Receives Your Data" id="who-receives-your-data">
          <p>We share data only as needed:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li><strong>Service providers (processors):</strong> hosting, analytics, customer support, communications, payments. They act on our instructions and under data protection agreements.</li>
            <li><strong>Legal and compliance:</strong> authorities or third parties when required by law or to protect rights and safety.</li>
            <li><strong>Business transfers:</strong> in a merger, acquisition, or asset sale, subject to safeguards and notice.</li>
          </ul>
          <p className="mt-3">
            We do not sell your personal data.
          </p>
        </PolicySection>

        <PolicySection title="International Data Transfers" id="international-data-transfers">
          <p>
            If we transfer your data outside the EEA/UK, we use approved safeguards such as 
            European Commission adequacy decisions or Standard Contractual Clauses, and, 
            where needed, supplementary measures. You can request a copy of relevant 
            safeguards.
          </p>
        </PolicySection>

        <PolicySection title="How Long We Keep Your Data" id="data-retention">
          <p>
            We keep personal data only as long as necessary for the purposes in this policy:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li><strong>Account data:</strong> for the life of your account and a reasonable period thereafter for record‑keeping, security, and legal obligations.</li>
            <li><strong>Transactional/technical logs:</strong> for shorter periods aligned with security and audit needs.</li>
          </ul>
          <p className="mt-3">
            We apply criteria such as legal limitation periods, regulatory requirements, 
            and operational needs. When no longer needed, we delete or irreversibly 
            anonymize data.
          </p>
        </PolicySection>

        <PolicySection title="Your Privacy Rights" id="privacy-rights">
          <p>Under the GDPR, you have:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li><strong>Right of access:</strong> get a copy of your personal data.</li>
            <li><strong>Right to rectification:</strong> correct inaccurate or incomplete data.</li>
            <li><strong>Right to erasure:</strong> request deletion in certain cases (e.g., consent withdrawal, no longer needed).</li>
            <li><strong>Right to restriction:</strong> limit processing in specific circumstances.</li>
            <li><strong>Right to portability:</strong> receive your data in a machine‑readable format and have it transmitted to another controller where technically feasible.</li>
            <li><strong>Right to object:</strong> object to processing based on legitimate interests or direct marketing.</li>
            <li><strong>Rights related to automated decision‑making:</strong> request human review and contest decisions where applicable.</li>
          </ul>
          <p className="mt-3">
            To exercise these rights, contact us at [privacy email]. We may need to verify 
            your identity. You also have the right to lodge a complaint with your local 
            supervisory authority.
          </p>
        </PolicySection>

        <PolicySection title="Consent and Withdrawal" id="consent-withdrawal">
          <p>
            Where processing relies on your consent (e.g., marketing or non‑essential 
            cookies), you may withdraw consent at any time via account settings, cookie 
            banner, unsubscribe links, or by contacting us, without affecting processing 
            before withdrawal.
          </p>
        </PolicySection>

        <PolicySection title="Cookies and Similar Technologies" id="cookies">
          <p>We use:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li><strong>Strictly necessary cookies:</strong> required for login, security, and core functions (no consent needed).</li>
            <li><strong>With your consent:</strong> analytics and, if used, marketing cookies. You can manage preferences in the cookie banner or browser settings at any time.</li>
          </ul>
          <p className="mt-3">
            See our Cookie Policy for details on categories, purposes, lifetimes, and providers.
          </p>
        </PolicySection>

        <PolicySection title="Children's Data" id="children-data">
          <p>
            Our Service is not directed to children under the age required by local law. 
            If we learn we processed a child's data without appropriate consent, we will 
            delete it. Additional parental consent obligations apply for children's consent 
            in some jurisdictions.
          </p>
        </PolicySection>

        <PolicySection title="Security" id="security">
          <p>
            We implement appropriate technical and organizational measures to protect 
            personal data, including encryption in transit, access controls, secure 
            development practices, and vendor due diligence. No system is 100% secure; 
            we maintain and improve safeguards over time.
          </p>
        </PolicySection>

        <PolicySection title="Automated Decision-Making" id="automated-decision-making">
          <p>
            We do not use automated decision-making that produces legal or similarly 
            significant effects without appropriate safeguards. If we introduce such 
            processing, we will provide required notices and enable your rights.
          </p>
        </PolicySection>

        <PolicySection title="Third-Party Sites" id="third-party-sites">
          <p>
            The Service may link to third-party websites or services. Their privacy 
            practices are governed by their own policies; review them before providing data.
          </p>
        </PolicySection>

        <PolicySection title="Changes to This Policy" id="changes-to-policy">
          <p>
            We may update this policy to reflect changes in law, technology, or our 
            practices. We will update the "Last updated" date and, where required, 
            provide prominent notice or request renewed consent.
          </p>
        </PolicySection>

        <PolicySection title="Contact and Complaints" id="contact-complaints">
          <p>
            Questions or requests: [privacy email], [postal address], [phone]. You have 
            the right to lodge a complaint with a data protection authority, such as 
            the authority in your habitual residence, place of work, or place of the 
            alleged infringement.
          </p>
        </PolicySection>
      </PolicyContent>
    </PolicyLayout>
  );
}