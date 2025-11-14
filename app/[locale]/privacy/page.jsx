"use client";
import PolicyLayout from '../../components/PolicyLayout';
import PolicySection from '../../components/PolicySection';
import PolicyContent from '../../components/PolicyContent';
import { useI18n } from '../../lib/i18n';

export default function PrivacyPage() {
  const { t } = useI18n();
  return (
    <PolicyLayout
      title={t('privacy_title')}
      lastUpdated={t('privacy_last_updated')}
    >
      <PolicyContent>
        <PolicySection title={t('privacy_who_we_are_title')} id="who-we-are">
          <p>
            {t('privacy_who_we_are_text')}
          </p>
        </PolicySection>

        <PolicySection title={t('privacy_what_policy_covers_title')} id="what-this-policy-covers">
          <p>
            {t('privacy_what_policy_covers_text')}
          </p>
        </PolicySection>

        <PolicySection title={t('privacy_data_we_collect_title')} id="data-we-collect">
          <ul className="list-disc pl-6 space-y-2">
            {t('privacy_data_we_collect_list').map((item, index) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
          <p className="mt-3">
            {t('privacy_data_we_collect_text')}
          </p>
        </PolicySection>

        <PolicySection title={t('privacy_why_we_process_data_title')} id="why-we-process-data">
          <p>{t('privacy_why_we_process_data_text')}</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            {t('privacy_why_we_process_data_list').map((item, index) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
          <p className="mt-3">
            {t('privacy_why_we_process_data_text2')}
          </p>
        </PolicySection>

        <PolicySection title={t('privacy_when_you_must_provide_data_title')} id="when-you-must-provide-data">
          <p>
            {t('privacy_when_you_must_provide_data_text')}
          </p>
        </PolicySection>

        <PolicySection title={t('privacy_who_receives_your_data_title')} id="who-receives-your-data">
          <p>{t('privacy_who_receives_your_data_text')}</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            {t('privacy_who_receives_your_data_list').map((item, index) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
          <p className="mt-3">
            {t('privacy_who_receives_your_data_text2')}
          </p>
        </PolicySection>

        <PolicySection title={t('privacy_international_data_transfers_title')} id="international-data-transfers">
          <p>
            {t('privacy_international_data_transfers_text')}
          </p>
        </PolicySection>

        <PolicySection title={t('privacy_data_retention_title')} id="data-retention">
          <p>
            {t('privacy_data_retention_text')}
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            {t('privacy_data_retention_list').map((item, index) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
          <p className="mt-3">
            {t('privacy_data_retention_text2')}
          </p>
        </PolicySection>

        <PolicySection title={t('privacy_privacy_rights_title')} id="privacy-rights">
          <p>{t('privacy_privacy_rights_text')}</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            {t('privacy_privacy_rights_list').map((item, index) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
          <p className="mt-3">
            {t('privacy_privacy_rights_text2')}
          </p>
        </PolicySection>

        <PolicySection title={t('privacy_consent_withdrawal_title')} id="consent-withdrawal">
          <p>
            {t('privacy_consent_withdrawal_text')}
          </p>
        </PolicySection>

        <PolicySection title={t('privacy_cookies_title')} id="cookies">
          <p>{t('privacy_cookies_text')}</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            {t('privacy_cookies_list').map((item, index) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
          <p className="mt-3">
            {t('privacy_cookies_text2')}
          </p>
        </PolicySection>

        <PolicySection title={t('privacy_children_data_title')} id="children-data">
          <p>
            {t('privacy_children_data_text')}
          </p>
        </PolicySection>

        <PolicySection title={t('privacy_security_title')} id="security">
          <p>
            {t('privacy_security_text')}
          </p>
        </PolicySection>

        <PolicySection title={t('privacy_automated_decision_making_title')} id="automated-decision-making">
          <p>
            {t('privacy_automated_decision_making_text')}
          </p>
        </PolicySection>

        <PolicySection title={t('privacy_third_party_sites_title')} id="third-party-sites">
          <p>
            {t('privacy_third_party_sites_text')}
          </p>
        </PolicySection>

        <PolicySection title={t('privacy_changes_to_policy_title')} id="changes-to-policy">
          <p>
            {t('privacy_changes_to_policy_text')}
          </p>
        </PolicySection>

        <PolicySection title={t('privacy_contact_complaints_title')} id="contact-complaints">
          <p>
            {t('privacy_contact_complaints_text')}
          </p>
        </PolicySection>
      </PolicyContent>
    </PolicyLayout>
  );
}
