import PolicyLayout from '../components/PolicyLayout';
import PolicySection from '../components/PolicySection';
import PolicyContent from '../components/PolicyContent';

export default function TermsPage() {
  return (
    <PolicyLayout 
      title="Terms and Conditions" 
      lastUpdated="November 13, 2025"
    >
      <PolicyContent>
        <PolicySection title="About Us" id="about-us">
          <p>
            These Terms and Conditions govern your use of [Service Name] operated by 
            [Legal Company Name], registered at [Full Address], company/tax number 
            [Number if applicable]. Contact: [support email] and [phone number]. 
            By accessing or registering, you agree to these Terms.
          </p>
        </PolicySection>

        <PolicySection title="Definitions" id="definitions">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>"Service"</strong> means the [website/app name], related features, and content we provide.</li>
            <li><strong>"User," "you," or "your"</strong> means any person who visits, registers, or uses the Service.</li>
            <li><strong>"Content"</strong> means text, images, data, or materials displayed on or transmitted via the Service.</li>
          </ul>
        </PolicySection>

        <PolicySection title="Eligibility and Account Registration" id="eligibility">
          <p>
            You must be the legal age of majority in your country of residence, or have 
            valid parental consent if permitted by law. You agree to provide accurate, 
            complete information and to keep your login credentials confidential. You are 
            responsible for all activity under your account and must promptly notify us 
            of any suspected unauthorized use or security breach. We may suspend or 
            terminate accounts that violate these Terms.
          </p>
        </PolicySection>

        <PolicySection title="Service Description and Changes" id="service-description">
          <p>
            We provide fast registration, secure storage, and a personal account area 
            with features that may change over time. We may add, modify, or discontinue 
            features or the Service (in whole or part). We aim to avoid disruptions but 
            cannot guarantee continuous availability.
          </p>
        </PolicySection>

        <PolicySection title="Acceptable Use" id="acceptable-use">
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Break any applicable laws or regulations.</li>
            <li>Attempt unauthorized access, probe or bypass security, or interfere with the Service.</li>
            <li>Post or transmit unlawful, abusive, infringing, deceptive, or harmful content.</li>
            <li>Harvest or collect others' data without their explicit consent.</li>
          </ul>
          <p className="mt-3">
            We may remove violating content and suspend or terminate access for breaches.
          </p>
        </PolicySection>

        <PolicySection title="User Content and License" id="user-content">
          <p>
            You retain ownership of your content. You grant us a non‑exclusive, worldwide 
            license to host, store, reproduce, and display your content solely to operate 
            and improve the Service. We do not claim ownership of your content and will 
            process removal requests in line with applicable law.
          </p>
        </PolicySection>

        <PolicySection title="Intellectual Property" id="intellectual-property">
          <p>
            The Service, including software, design, brand, and all associated 
            intellectual property, is owned by or licensed to us. You may not copy, 
            modify, distribute, reverse engineer, or create derivative works unless 
            permitted by law or with our prior written consent.
          </p>
        </PolicySection>

        <PolicySection title="Third-Party Links and Services" id="third-party-links">
          <p>
            The Service may link to or integrate with third‑party sites or services. 
            We are not responsible for any third‑party content, policies, or practices; 
            use of such resources is at your own risk.
          </p>
        </PolicySection>

        <PolicySection title="Pricing and Payments (if applicable)" id="pricing">
          <p>
            If any paid features apply, pricing and payment terms will be shown clearly 
            before purchase. Accepted payment methods, billing cycles, taxes, and any 
            additional fees will be disclosed. Subscription terms (renewal, cancellation, 
            proration) will be stated at checkout and in your account.
          </p>
        </PolicySection>

        <PolicySection title="Shipping, Returns, and Refunds (if selling goods)" id="shipping-returns">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Shipping:</strong> regions served, delivery estimates, and costs.</li>
            <li><strong>Returns:</strong> return window, condition requirements, and process.</li>
            <li><strong>Refunds:</strong> eligibility, timeline, and method.</li>
          </ul>
          <p className="mt-3">
            Mandatory consumer rights apply and prevail over conflicting terms.
          </p>
        </PolicySection>

        <PolicySection title="Consumer Rights and Withdrawal" id="consumer-rights">
          <p>
            For distance contracts with EU consumers, you may have a 14‑day right of 
            withdrawal under national laws implementing EU rules, subject to legal 
            exceptions (e.g., after starting delivery of digital content/services with 
            your express consent and acknowledgment of losing the withdrawal right). 
            These Terms do not affect your mandatory consumer rights. Any unfair term 
            that creates a significant imbalance to the detriment of the consumer is not 
            binding. We outline how to cancel, what happens on cancellation, and any fair, 
            pre‑disclosed costs.
          </p>
        </PolicySection>

        <PolicySection title="Disclaimers and Limitation of Liability" id="disclaimers">
          <p>
            The Service is provided "as is" and "as available," without warranties of any 
            kind (express or implied) to the maximum extent permitted by law, including 
            non‑infringement, merchantability, and fitness for a particular purpose. To 
            the fullest extent permitted by law, we are not liable for indirect, incidental, 
            special, consequential, or punitive damages, or loss of profits, data, or 
            goodwill arising from or related to your use of the Service. Nothing in these 
            Terms excludes or limits liability where it would be unlawful to do so (for 
            example, liability for death or personal injury caused by negligence).
          </p>
        </PolicySection>

        <PolicySection title="Indemnification" id="indemnification">
          <p>
            You agree to indemnify and hold us harmless from claims, losses, liabilities, 
            damages, and costs (including reasonable legal fees) arising from your breach 
            of these Terms or misuse of the Service, to the extent permitted by law.
          </p>
        </PolicySection>

        <PolicySection title="Site Management and Support" id="site-management">
          <p>
            We may monitor compliance, remove or disable access to content, manage the 
            Service to protect its integrity, and perform maintenance. Support is available 
            via the channels stated on the Service or in these Terms.
          </p>
        </PolicySection>

        <PolicySection title="Suspension and Termination" id="suspension-termination">
          <p>
            We may suspend or terminate your account immediately if you breach these Terms, 
            misuse the Service, or where legally or technically required. You may close 
            your account at any time through your settings or by contacting us. 
            Sections intended to survive termination (e.g., IP, disclaimers, liability 
            limits) will continue to apply.
          </p>
        </PolicySection>

        <PolicySection title="Privacy and Data Protection" id="privacy-protection">
          <p>
            Your personal data is processed in accordance with our Privacy Policy, which 
            explains legal bases, purposes, retention periods, transfers, and your rights 
            under the GDPR. By using the Service, you agree to comply with the Privacy 
            Policy; where consent is the legal basis, you can withdraw it at any time 
            without affecting prior processing.
          </p>
        </PolicySection>

        <PolicySection title="Governing Law and Jurisdiction" id="governing-law">
          <p>
            These Terms are governed by the laws of [Member State], without prejudice to 
            mandatory consumer protection provisions of your country of residence if you 
            are an EU consumer. Disputes will be subject to the non‑exclusive jurisdiction 
            of the courts of [City, Country].
          </p>
        </PolicySection>

        <PolicySection title="Changes to These Terms" id="changes-terms">
          <p>
            We may update these Terms to reflect legal, technical, or business changes. 
            We will indicate the "Last updated" date and, where required, provide 
            reasonable notice or request renewed consent. Continued use after changes 
            constitutes acceptance.
          </p>
        </PolicySection>

        <PolicySection title="Contact" id="contact">
          <p>
            Questions about these Terms can be sent to: [Company Name], [Address], 
            [support email], [phone].
          </p>
        </PolicySection>
      </PolicyContent>
    </PolicyLayout>
  );
}