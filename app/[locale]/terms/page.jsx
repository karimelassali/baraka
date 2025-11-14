"use client";
import PolicyLayout from '../../components/PolicyLayout';
import PolicySection from '../../components/PolicySection';
import PolicyContent from '../../components/PolicyContent';
import { useI18n } from '../../lib/i18n';

export default function TermsPage() {
  const { t } = useI18n();
  return (
    <PolicyLayout
      title={t('terms_title')}
      lastUpdated={t('terms_last_updated')}
    >
      <PolicyContent>
        <PolicySection title={t('terms_about_us_title')} id="about-us">
          <p>
            {t('terms_about_us_text')}
          </p>
        </PolicySection>

        <PolicySection title={t('terms_definitions_title')} id="definitions">
          <ul className="list-disc pl-6 space-y-2">
            {t('terms_definitions_list').map((item, index) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        </PolicySection>

        <PolicySection title={t('terms_eligibility_title')} id="eligibility">
          <p>
            {t('terms_eligibility_text')}
          </p>
        </PolicySection>

        <PolicySection title={t('terms_service_description_title')} id="service-description">
          <p>
            {t('terms_service_description_text')}
          </p>
        </PolicySection>

        <PolicySection title={t('terms_acceptable_use_title')} id="acceptable-use">
          <p>{t('terms_acceptable_use_text')}</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            {t('terms_acceptable_use_list').map((item, index) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
          <p className="mt-3">
            {t('terms_acceptable_use_text2')}
          </p>
        </PolicySection>

        <PolicySection title={t('terms_user_content_title')} id="user-content">
          <p>
            {t('terms_user_content_text')}
          </p>
        </PolicySection>

        <PolicySection title={t('terms_intellectual_property_title')} id="intellectual-property">
          <p>
            {t('terms_intellectual_property_text')}
          </p>
        </PolicySection>

        <PolicySection title={t('terms_third_party_links_title')} id="third-party-links">
          <p>
            {t('terms_third_party_links_text')}
          </p>
        </PolicySection>

        <PolicySection title={t('terms_pricing_title')} id="pricing">
          <p>
            {t('terms_pricing_text')}
          </p>
        </PolicySection>

        <PolicySection title={t('terms_shipping_returns_title')} id="shipping-returns">
          <ul className="list-disc pl-6 space-y-2">
            {t('terms_shipping_returns_list').map((item, index) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
          <p className="mt-3">
            {t('terms_shipping_returns_text2')}
          </p>
        </PolicySection>

        <PolicySection title={t('terms_consumer_rights_title')} id="consumer-rights">
          <p>
            {t('terms_consumer_rights_text')}
          </p>
        </PolicySection>

        <PolicySection title={t('terms_disclaimers_title')} id="disclaimers">
          <p>
            {t('terms_disclaimers_text')}
          </p>
        </PolicySection>

        <PolicySection title={t('terms_indemnification_title')} id="indemnification">
          <p>
            {t('terms_indemnification_text')}
          </p>
        </PolicySection>

        <PolicySection title={t('terms_site_management_title')} id="site-management">
          <p>
            {t('terms_site_management_text')}
          </p>
        </PolicySection>

        <PolicySection title={t('terms_suspension_termination_title')} id="suspension-termination">
          <p>
            {t('terms_suspension_termination_text')}
          </p>
        </PolicySection>

        <PolicySection title={t('terms_privacy_protection_title')} id="privacy-protection">
          <p>
            {t('terms_privacy_protection_text')}
          </p>
        </PolicySection>

        <PolicySection title={t('terms_governing_law_title')} id="governing-law">
          <p>
            {t('terms_governing_law_text')}
          </p>
        </PolicySection>

        <PolicySection title={t('terms_changes_terms_title')} id="changes-terms">
          <p>
            {t('terms_changes_terms_text')}
          </p>
        </PolicySection>

        <PolicySection title={t('terms_contact_title')} id="contact">
          <p>
            {t('terms_contact_text')}
          </p>
        </PolicySection>
      </PolicyContent>
    </PolicyLayout>
  );
}
