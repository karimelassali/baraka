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

# Contract Agreement for BARAKA Loyalty System

| Contract Meta | Value |
| --- | --- |
| Date | ______________________________ |
| Reference | ______________________________ |

## Parties

| Role | Full Name | Address | City, Country | CF / Passport No. |
| --- | --- | --- | --- | --- |
| Client | ______________________________ | ______________________________ | ______________________________ | ______________________________ |
| Contractor | ______________________________ | ______________________________ | ______________________________ | ______________________________ |

Together, the **Parties**.

## Project Summary

| Item | Description |
| --- | --- |
| Title | BARAKA Loyalty & Marketing Web Platform |
| Summary | Multilingual web application with admin portal, customer dashboard, public pages, Supabase backend, and WhatsApp campaign integration. Provides loyalty points, vouchers, offers, reviews, analytics, and GDPR tooling. |
| Tech Stack | Next.js, React, next-intl, Supabase (PostgreSQL/Auth/Storage/RLS), Framer Motion, Tailwind/UI, WhatsApp Business API |

## Scope of Work

- **Admin Portal**: role-based access; customers, inventory and categories, offers, points, vouchers, reviews, gallery, logs, notifications, analytics dashboards.
- **Customer Portal**: dashboard overview, loyalty wallet, vouchers, exclusive offers, profile updates.
- **Public Site**: hero, about, dynamic gallery, live offers, approved reviews, contact/location, WhatsApp button.
- **APIs**: secured endpoints for admin and customer operations, cron tasks (expiration report), GDPR export/delete, login/register with magic link.
- **Database and Auth**: Supabase schema, migrations, RLS policies, models/services for entities (customers, offers, reviews, vouchers, settings).
- **Internationalization**: localized routes and messages (`en`, `it`, `ar`).
- **UI/UX**: responsive layouts, animations, glassmorphism components, accessibility-minded forms.
- **Deliverables** include configured source code, environment variable templates, deployment instructions, and seed/testing utilities.

## Representative Features

- Admin portal with role-based navigation and management modules for Customers, Inventory, Offers, Points, Vouchers, Reviews, Gallery, Logs, and Analytics.
- Offers creation and management with multi-language fields, status toggles, image support, and secure API integration.
- Customer dashboard showing active offers, vouchers, and loyalty points in a responsive, user-friendly layout.
- Supabase-backed database schema with views, triggers, and row-level security; GDPR export/delete endpoints.
- Internationalization across English, Italian, and Arabic with localized routes and messages.

<div class="page-break"></div>

## Timeline

| Milestone | Target Week | Exact Date |
| --- | --- | --- |
| Kickoff & environment setup | Week 1 | ______________________________ |
| Admin portal core features | Weeks 2–3 | ______________________________ |
| Customer portal & public site | Weeks 3–4 | ______________________________ |
| Integrations & i18n | Weeks 4–5 | ______________________________ |
| Testing, polish, handover | Week 6 | ______________________________ |

Exact dates may adjust upon written change requests.

## Fees and Payments

| Item | Amount | Due |
| --- | --- | --- |
| Total Fee | €1,800 EUR | — |
| First Payment (40%) | €720 EUR | Upon contract signing |
| Final Payment (60%) | €1,080 EUR | Upon final delivery and acceptance |

- Payments due within **7 calendar days** of invoice.
- Late payments accrue interest at **[X%] per month**.

## Change Requests

- Changes beyond the **Scope of Work** require a written change order with revised timeline and fees.
- Material scope increases may impact schedules and cost.

## Client Responsibilities

- Provide timely access to required accounts and credentials (e.g., Supabase, WhatsApp Business API).
- Supply branding assets, content, and copy.
- Review and feedback within **3 business days** for milestone deliverables.

## Intellectual Property

- Upon **full payment**, Client receives ownership of the project’s bespoke code and assets developed under this agreement, excluding:
  - Pre-existing libraries, frameworks, and third-party components retained by their original licenses.
  - Contractor’s reusable tools and templates licensed to Client for project use.
- Contractor may reference the project in portfolio materials unless Client explicitly prohibits in writing.

## Confidentiality

- Both Parties agree to keep proprietary information, credentials, customer data, and business plans **confidential** and use them solely for project execution.

## Data Protection

- The platform includes **GDPR** features (export/delete); operational compliance depends on Client policies, data sources, and correct configuration.
- Client is the **data controller**; Contractor is a **processor** only for development and integration purposes.
- Client must configure and maintain lawful basis, consents, retention policies, and **DPA** agreements with third parties (e.g., WhatsApp, Supabase).

## Warranties

- Contractor warrants the deliverables will perform materially as described for **30 days** post-acceptance, with bug fixes provided within a reasonable timeframe.
- No warranty is made for issues caused by third-party outages, misconfiguration, or changes beyond Contractor’s control.

## Acceptance

- Acceptance occurs when delivered features conform to the **Scope of Work** and pass agreed tests.
- If defects are reported within **10 business days**, Contractor will remedy and resubmit for acceptance.

## Maintenance and Support

- Included: **30 days** post-acceptance bug-fix support via email or chat.
- Ongoing maintenance, feature development, and hosting/ops are available under a separate agreement.

## Termination

- Either Party may terminate for cause upon **10 business days’** written notice if the other Party materially breaches and fails to cure.
- Upon termination, Client pays for work completed to date. IP ownership transfers **pro rata** upon payment.

## Liability

- Neither Party shall be liable for **indirect or consequential damages**.
- Aggregate liability under this agreement is limited to the **total fees paid**.

## Governing Law

- This agreement is governed by the **laws of Italy**. Courts of **______________________________ (City, Italy)** have exclusive jurisdiction, unless otherwise agreed.

## Entire Agreement

- This agreement constitutes the **entire understanding** between the Parties and supersedes prior proposals or communications. Amendments must be **in writing** and signed by both Parties.

## Signatures

| Party | Signature | Date |
| --- | --- | --- |
| Client | ______________________________ | ______________________________ |
| Contractor | ______________________________ | ______________________________ |

| Printed Name | Identifier |
| --- | --- |
| Client: ______________________________ | CF/Passport: ______________________________ |
| Contractor: ______________________________ | CF/Passport: ______________________________ |