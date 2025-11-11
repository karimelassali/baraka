# Feature Specification: Customer Loyalty Platform

**Feature Branch**: `001-customer-loyalty-platform`
**Created**: 2025-11-10
**Status**: Draft
**Input**: User description: "We are building a multi-language customer loyalty platform for a physical retail shop. The platform includes a public website, a customer registration & login system, a customer dashboard, a store-admin dashboard, and a loyalty points system integrated with WhatsApp Business API for messaging. Stack will be: Next.js + Supabase + JavaScript, hosted on Vercel + Supabase. 2. Stakeholders Store Customers – register, log in, check points, view offers. Store Manager (Admin) – manages customers, offers, reviews, points, vouchers. Platform Owner – oversees system, domain, hosting, GDPR compliance. 3. Requirements (Functional) 3.1 Public Website Display business name, logo, description. Photo gallery. Address with Google Maps link. Opening hours. WhatsApp Business button. Contact options (phone, email, message form). Weekly Offers section. Permanent Offers section. Customer Reviews section (up to 20). Multi-language UI (IT, EN, FR, ES, AR). Privacy Policy & Cookie Policy pages. Terms & Conditions (future e-commerce). 3.2 Customer Registration Registration form fields: First name Last name Date of birth Residence Phone number Email Country of origin GDPR consent checkbox (required) System actions: Create customer record in Supabase. Send confirmation (email or WhatsApp). Create a linked Supabase Auth user. Redirect customer to login page. 3.3 Customer Login & Dashboard Customer logs in via email/password or magic link. Dashboard includes: Personal profile view & edit. Loyalty Wallet: Total points. Points history. Active offers (personalized + general). Available vouchers. 3.4 Admin Dashboard Admin can: Customer Management View all customers. Sort/filter by: Name Country of origin Residence Add/edit/delete customer records. Offers Management Create/edit/delete: Weekly offers Permanent offers Multi-language fields for offers. Reviews Management Approve/hide public reviews. Control display order (20 max on home page). Loyalty Points System Input purchase amount → system calculates points (formula configurable). Add or deduct points. Convert points into vouchers. Track full point history. Messaging (WhatsApp Business API) Send: Promotional campaigns Birthday messages Nationality-targeted offers Use approved WhatsApp templates. View messaging logs (delivery status). 3.5 Loyalty Program Default formula: €1 = 1 point (configurable). Real-time balance calculation. Customers can redeem points for vouchers. Only admins can assign or redeem points. Vouchers generated with unique code & expiration. 3.6 Multi-language Support Website available in: Italian English French Spanish Arabic Language selector at the top of the homepage. Translatable content: Navigation Offers Descriptions Static pages 3.7 Security & Legal GDPR-compliant data handling. Explicit consent storage (timestamp). SSL/HTTPS. Automated database backups. Data export & delete endpoints for GDPR requests. 4. User Stories ✅ 4.1 Public Visitor As a visitor, I want to read about the business, available offers, and reviews. As a visitor, I want to register as a customer to join the loyalty program. ✅ 4.2 Customer As a customer, I want to create an account, so I can earn loyalty points. As a customer, I want to log in securely to my personal dashboard. As a customer, I want to see my points balance. As a customer, I want to see offers relevant to me. As a customer, I want to edit my personal info. As a customer, I want to browse the site in my own language. ✅ 4.3 Admin (Store Manager) As an admin, I want to manage customers so I keep the database clean. As an admin, I want to add points from purchases. As an admin, I want to convert points into vouchers for customers. As an admin, I want to create offers and set visibility periods. As an admin, I want to send WhatsApp campaigns to selected customer groups. As an admin, I want to filter customers by origin or residence for targeted promotions. 5. Acceptance Criteria Customer Registration ✅ Required fields validated. ✅ GDPR checkbox must be selected. ✅ Customer appears in admin dashboard after registration. Login ✅ Authentication must use Supabase Auth. ✅ Failed login shows error message. Customer Dashboard ✅ Points display matches database. ✅ Offers display according to language. Admin Dashboard ✅ Admin-only access protected by auth. ✅ CRUD actions confirmed via success messages. ✅ Points conversion uses formula. ✅ Whatsapp sends only using approved templates. Multi-language ✅ User-chosen language persists during navigation. ✅ All public pages fully translated. 6. Non-Functional Requirements Performance Page load < 1.5 seconds on 4G. Optimized images (Next.js Image component). Security HTTPS mandatory. Row-Level Security on Supabase tables. Server-only admin operations (service role key). Scalability Able to support 10,000+ customers. Designed for multiple stores in future. Usability Simple, clean UI for low digital experience users. Mobile-first responsive design. 7. Constraints Must use Next.js + JavaScript. Must use Supabase for database, auth, and storage. WhatsApp API requires approved templates. Arabic requires RTL support."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Public Website Access (Priority: P1)

A visitor wants to access information about the business, including business name, logo, description, photo gallery, address with Google Maps link, opening hours, and available offers (weekly and permanent). The visitor should also see customer reviews and have options to contact the business via WhatsApp, phone, email, or message form.

**Why this priority**: This is the foundation of the platform - without a functional public website, visitors cannot learn about the business or be motivated to register as customers.

**Independent Test**: The public website can be fully accessed without authentication and displays all required information including business details, photo gallery, location, contact methods, and offers. All content must be available in all supported languages.

**Acceptance Scenarios**:

1. **Given** a visitor accesses the website, **When** they navigate to the homepage, **Then** they see the business name, logo, description, photo gallery, address with Google Maps link, and opening hours
2. **Given** a visitor is on the homepage, **When** they click the WhatsApp Business button, **Then** their WhatsApp app opens with a direct message to the shop
3. **Given** a visitor is browsing the homepage, **When** they look for offers, **Then** they see both weekly and permanent offers sections displayed
4. **Given** a visitor is viewing the homepage, **When** they look for customer reviews, **Then** they see between 0 and 20 customer reviews displayed

---

### User Story 2 - Customer Registration and Authentication (Priority: P2)

A visitor wants to register as a customer to join the loyalty program. They need to provide personal information including first name, last name, date of birth, residence, phone number, email, and country of origin, with explicit GDPR consent. After registration, they should be able to log in and access their personal dashboard.

**Why this priority**: Registration is the gateway to the loyalty program, enabling customers to earn and track points.

**Independent Test**: A new visitor can complete the registration process with all required fields, receive confirmation, and then successfully log in to access their account.

**Acceptance Scenarios**:

1. **Given** a visitor is on the registration page, **When** they submit the form with all required fields including GDPR consent, **Then** their account is created and they can access their customer dashboard
2. **Given** a visitor is on the registration page, **When** they try to submit without the GDPR consent checkbox selected, **Then** an error message appears requiring consent
3. **Given** a registered customer, **When** they log in with their credentials, **Then** they can access their personal dashboard with their profile and points information

---

### User Story 3 - Customer Dashboard with Loyalty Features (Priority: P3)

A registered customer wants to access their personal dashboard to view and edit their profile, check their loyalty points balance, view transaction history, see active offers (personalized and general), and access available vouchers.

**Why this priority**: Once customers are registered, they need to see the value of the loyalty program through points tracking and personalized offers.

**Independent Test**: A logged-in customer can view their complete dashboard with current points balance, transaction history, and available offers.

**Acceptance Scenarios**:

1. **Given** a logged-in customer accesses their dashboard, **When** they check their loyalty wallet, **Then** they see their current points balance updated in real-time
2. **Given** a logged-in customer is on their dashboard, **When** they view active offers, **Then** they see both general offers and any personalized offers relevant to them
3. **Given** a logged-in customer accesses their profile, **When** they edit their personal information, **Then** those changes are saved and reflected in the system

---

### User Story 4 - Admin Dashboard Management (Priority: P4)

A store manager needs to manage customers, offers, reviews, points, and vouchers through an admin dashboard. They should be able to add points to customer accounts, convert points to vouchers, manage customer records, create offers, and send targeted communications via WhatsApp.

**Why this priority**: Admin functionality is essential for the business to operate the loyalty program effectively.

**Independent Test**: An admin user can log in to the admin dashboard and successfully perform core management tasks including adding points to customer accounts and creating offers.

**Acceptance Scenarios**:

1. **Given** an admin is in the dashboard, **When** they add points to a customer account based on a purchase amount, **Then** the customer's points balance is updated according to the loyalty formula
2. **Given** an admin is managing offers, **When** they create a new weekly offer, **Then** it appears in the public offers section according to its visibility settings
3. **Given** an admin wants to send targeted messages, **When** they select customers by criteria and send a WhatsApp message, **Then** the message is sent using approved templates

---

### User Story 5 - Multi-language Support (Priority: P5)

Users of different nationalities need to access the platform in their preferred language (Italian, English, French, Spanish, Arabic). The language selector should be easily accessible and content should be properly translated.

**Why this priority**: Critical for serving the diverse customer base mentioned in the requirements, especially for customers with low digital experience.

**Independent Test**: A user can select any of the supported languages and see all public content properly translated in that language.

**Acceptance Scenarios**:

1. **Given** a user accesses the website, **When** they select a different language from the selector, **Then** all visible content appears in the selected language
2. **Given** a user has selected a language, **When** they navigate through different pages, **Then** the selected language preference persists

---

### User Story 6 - WhatsApp Business Integration (Priority: P6)

Admins need to send promotional campaigns, birthday messages, and nationality-targeted offers via WhatsApp Business API. Messages must use approved templates and delivery status should be trackable.

**Why this priority**: Direct customer communication is a key feature of the loyalty program.

**Independent Test**: An admin can compose and send a WhatsApp message to selected customer groups, and track the delivery status of sent messages.

**Acceptance Scenarios**:

1. **Given** an admin wants to send a birthday message, **When** they select customers by date of birth and send a WhatsApp message, **Then** the message is sent using an approved template
2. **Given** an admin has sent WhatsApp messages, **When** they check messaging logs, **Then** they can see the delivery status of each message

### Edge Cases

- What happens when a customer tries to redeem more points than they have available?
- How does the system handle customers who request data deletion under GDPR?
- What occurs when the WhatsApp API is unavailable for sending messages?
- How does the system handle customers with accounts in multiple languages?
- What happens if multiple admins modify the same customer record simultaneously?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display business information including name, logo, description, photo gallery, address with Google Maps link, and opening hours to public visitors
- **FR-002**: System MUST provide contact options including WhatsApp Business button, phone, email, and message form
- **FR-003**: System MUST display weekly and permanent offers sections on the public website
- **FR-004**: System MUST display up to 20 customer reviews on the public website
- **FR-005**: System MUST support registration with fields: First name, Last name, Date of birth, Residence, Phone number, Email, Country of origin
- **FR-006**: System MUST require GDPR consent checkbox to be selected during registration
- **FR-007**: System MUST create both a customer record and linked authentication account in Supabase upon registration
- **FR-008**: System MUST send confirmation via email or WhatsApp after successful registration
- **FR-009**: Users MUST be able to log in via email/password or magic link
- **FR-010**: System MUST display a customer dashboard with profile view/edit capability
- **FR-011**: System MUST show customer's loyalty wallet including total points and points history
- **FR-012**: System MUST display active offers (personalized and general) in the customer dashboard
- **FR-013**: System MUST provide voucher access in the customer dashboard
- **FR-014**: Admins MUST be able to view all registered customers
- **FR-015**: Admins MUST be able to sort and filter customers by name, country of origin, and residence
- **FR-016**: Admins MUST be able to add, edit, or delete customer records
- **FR-017**: Admins MUST be able to create, edit, or delete weekly and permanent offers with multi-language fields
- **FR-018**: Admins MUST be able to approve or hide public reviews and control display order
- **FR-019**: System MUST calculate loyalty points based on configurable formula (default: €1 = 1 point)
- **FR-020**: Admins MUST be able to add or deduct points for customers
- **FR-021**: Admins MUST be able to convert customer points into vouchers
- **FR-022**: System MUST track full point history for each customer
- **FR-023**: Admins MUST be able to send promotional campaigns, birthday messages, and nationality-targeted offers via WhatsApp Business API
- **FR-024**: System MUST use only approved WhatsApp templates for messaging
- **FR-025**: System MUST provide messaging logs with delivery status
- **FR-026**: System MUST support five languages: Italian, English, French, Spanish, and Arabic
- **FR-027**: System MUST provide language selector at the top of the homepage
- **FR-028**: System MUST store explicit GDPR consent with timestamp
- **FR-029**: System MUST provide data export and deletion endpoints for GDPR compliance

### Key Entities *(include if feature involves data)*

- **Customer**: Represents a registered customer with personal information (name, date of birth, residence, phone, email, country of origin), account status, and consent timestamp
- **Loyalty Points**: Represents points earned and history of transactions for a customer, with calculated totals and configurable conversion formula
- **Voucher**: Represents redeemable value vouchers with unique codes, expiration dates, and redemption status
- **Offer**: Represents weekly and permanent offers that can be displayed to different audiences, with multi-language support
- **Review**: Represents customer reviews that can be approved, hidden, and displayed publicly
- **WhatsApp Message**: Represents messages sent through WhatsApp Business API, with template type, target audience, and delivery status

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Visitors can access all public website content in under 1.5 seconds on 4G connection
- **SC-002**: Customers can register and create an account with all required information in under 3 minutes
- **SC-003**: Customers can log into their dashboard and view points balance within 15 seconds of authentication
- **SC-004**: Admins can add points to a customer account and see the updated balance within 5 seconds
- **SC-005**: 95% of customers successfully complete the registration process without technical issues
- **SC-006**: The platform can support 10,000+ registered customers without performance degradation
- **SC-007**: Customers can switch between all 5 supported languages and see properly translated content immediately
- **SC-008**: WhatsApp messages have a 90% successful delivery rate using approved templates
- **SC-009**: The system maintains 99.9% uptime during business hours
- **SC-010**: All customer data handling complies with GDPR requirements, with audit logs available for compliance verification
