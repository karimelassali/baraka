# Tasks: Customer Loyalty Platform

**Input**: Design documents from `/specs/001-customer-loyalty-platform/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Next.js 14+ project with App Router
- [x] T002 [P] Install core dependencies: , TailwindCSS, Supabase client
- [x] T003 Setup project structure according to plan.md in app/, components/, lib/, styles/, public/
- [x] T004 Configure environment variables setup for Supabase (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)
- [x] T005 [P] Configure TailwindCSS and globals.css with base styles

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ x] T007 Setup Supabase client configuration in lib/supabase/client.js and lib/supabase/server.js
- [ x] T008 [P] Create Supabase database schema with all tables from data-model.md
- [ x] T009 [P] Configure Supabase Row Level Security (RLS) policies for all tables
- [ x] T010 [P] Create authentication service in lib/auth/ with Supabase integration
- [ ] T011 Create middleware for authentication and role-based access control
- [ ] T013 Create base API route handlers with error handling middleware
- [ ] T014 Setup database for real-time updates

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Public Website Access (Priority: P1) 🎯 MVP

**Goal**: Enable visitors to access business information, offers, reviews, and contact options in all supported languages

**Independent Test**: The public website can be fully accessed without authentication and displays all required information including business details, photo gallery, location, contact methods, and offers. All content must be available in all supported languages.

### Implementation for User Story 1

- [x] T015 [P] [US1] Create homepage component in app/page.jsx with business info, logo, description
- [x] T016 [P] [US1] Implement photo gallery component in components/ui/Gallery.jsx with Next.js Image optimization
- [x] T018 [P] [US1] Create opening hours display component in components/ui/Hours.jsx
- [x] T019 [P] [US1] Implement WhatsApp Business button component in components/ui/WhatsAppButton.jsx
- [x] T020 [P] [US1] Create contact options component with phone, email, message form in components/ui/ContactOptions.jsx
- [x] T021 [US1] Implement weekly and permanent offers sections with GET /api/offers data in app/offers/page.jsx
- [x] T022 [US1] Create customer reviews section displaying up to 20 reviews in app/reviews/page.jsx
- [x] T023 [P] [US1] Install next-google-translate-widget package
- [x] T024 [US1] Create Privacy Policy & Cookie Policy pages in app/privacy/page.jsx and app/cookies/page.jsx
- [x] T025 [US1] Create Terms & Conditions page in app/terms/page.jsx for future e-commerce
- [x] T026 [US1] Integrate GoogleTranslate component into app/layout.js to provide multi-language support

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Customer Registration and Authentication (Priority: P2)

**Goal**: Enable visitors to register as customers with required personal information and GDPR consent, and allow login to access their account

**Independent Test**: A new visitor can complete the registration process with all required fields, receive confirmation, and then successfully log in to access their account.

### Implementation for User Story 2

- [x] T027 [P] [US2] Create customer registration form component in components/forms/RegistrationForm.jsx with all required fields validation
- [x] T028 [US2] Implement GDPR consent checkbox with validation in RegistrationForm.jsx
- [x] T029 [US2] Create API endpoint POST /api/register with Supabase Auth integration and customer profile creation
- [x] T030 [US2] Implement POST /api/register validation for all required fields and GDPR consent requirement
- [x] T031 [US2] Create customer login form component in components/forms/LoginForm.jsx with email/password and magic link options
- [x] T032 [US2] Create API endpoint POST /api/login with Supabase Auth integration
- [x] T033 [US2] Create API endpoint POST /api/logout with Supabase Auth integration
- [x] T034 [US2] Implement error handling for failed login scenarios in LoginForm.jsx
- [ ] T035 [US2] Create confirmation email/WhatsApp sending after registration in the registration API
- [x] T036 [US2] Create redirect to dashboard after successful login in LoginForm.jsx
- [x] T037 [US2] Create Customer model/service in lib/supabase/customer.js for customer data handling
- [x] T038 [P] [US2] use react-country-flag package for country flag display in RegistrationForm.jsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Customer Dashboard with Loyalty Features (Priority: P3)

**Goal**: Provide registered customers with access to their personal dashboard to view/edit profile, check loyalty points, view transaction history, and access offers and vouchers

**Independent Test**: A logged-in customer can view their complete dashboard with current points balance, transaction history, and available offers.

### Implementation for User Story 3

- [ ] T038 [P] [US3] Create customer dashboard layout in app/dashboard/page.jsx with navigation
- [ ] T039 [P] [US3] Create customer profile view/edit component in components/dashboard/Profile.jsx
- [ ] T040 [P] [US3] Create loyalty wallet component in components/loyalty/Wallet.jsx showing total points and history
- [ ] T041 [US3] Create API endpoint GET /api/customer/profile for retrieving customer profile
- [ ] T042 [US3] Create API endpoint PUT /api/customer/profile for updating customer profile
- [ ] T043 [US3] Create API endpoint GET /api/customer/points for retrieving customer points balance and history
- [ ] T044 [US3] Create active offers display component in components/dashboard/Offers.jsx showing personalized and general offers
- [ ] T045 [US3] Create vouchers display component in components/dashboard/Vouchers.jsx showing available vouchers
- [ ] T046 [US3] Create Loyalty Points model/service in lib/supabase/loyalty_points.js for points data handling
- [ ] T047 [US3] Create Voucher model/service in lib/supabase/voucher.js for voucher data handling
- [ ] T048 [US3] Create Offer model/service in lib/supabase/offer.js for offer data handling
- [ ] T049 [US3] Create customer dashboard wallet page in app/dashboard/wallet/page.jsx

**Checkpoint**: At this point, User Stories 1, 2 AND 3 should all work independently

---

## Phase 6: User Story 4 - Admin Dashboard Management (Priority: P4)

**Goal**: Enable store managers to manage customers, offers, reviews, points, and vouchers through an admin dashboard with full functionality

**Independent Test**: An admin user can log in to the admin dashboard and successfully perform core management tasks including adding points to customer accounts and creating offers.

### Implementation for User Story 4

- [ ] T050 [P] [US4] Create admin dashboard layout in app/admin/page.jsx with role-based access control
- [ ] T051 [P] [US4] Create customer management component in components/admin/CustomerManagement.jsx with search and filter capabilities
- [ ] T052 [US4] Create API endpoint GET /api/admin/customers with filtering by name, country of origin, and residence
- [ ] T053 [P] [US4] Create customer editing component in components/admin/EditCustomer.jsx with CRUD operations
- [ ] T054 [P] [US4] Create offers management component in components/admin/OfferManagement.jsx
- [ ] T055 [US4] Create API endpoint POST /api/admin/offers for creating weekly and permanent offers with multi-language fields
- [ ] T056 [P] [US4] Create reviews management component in components/admin/ReviewManagement.jsx for approving/hiding reviews
- [ ] T057 [US4] Create API endpoint for approving/hiding public reviews in lib/supabase/review.js
- [ ] T058 [P] [US4] Create loyalty points management component in components/admin/PointsManagement.jsx
- [ ] T059 [US4] Create API endpoint PUT /api/admin/customers/:id/points for adding/deducting customer points
- [ ] T060 [US4] Create voucher management component in components/admin/VoucherManagement.jsx
- [ ] T061 [US4] Create API endpoint POST /api/admin/vouchers for creating vouchers from customer points
- [ ] T062 [US4] Create WhatsApp campaign management component in components/admin/WhatsAppCampaign.jsx
- [ ] T063 [US4] Create API endpoint POST /api/admin/campaigns/send for sending WhatsApp campaigns
- [ ] T064 [US4] Create Admin User model/service in lib/supabase/admin_user.js for admin data handling
- [ ] T065 [US4] Create Review model/service in lib/supabase/review.js for review data handling
- [ ] T066 [US4] Create WhatsApp Message model/service in lib/supabase/whatsapp_message.js for tracking messages
- [ ] T067 [US4] Create Settings model/service in lib/supabase/settings.js for system-wide settings

**Checkpoint**: At this point, all user stories should be independently functional

---

## Phase 7: User Story 5 - Multi-language Support (Priority: P5)

**Goal**: Ensure all platform content is properly translated and accessible in Italian, English, French, Spanish, and Arabic with persistent language preference using next-google-translate-widget.

**Independent Test**: A user can select any of the supported languages from the Google Translate widget and see all public content properly translated in that language.

### Implementation for User Story 5

- [ ] T068 [P] [US5] Verify that all public pages are correctly translated by the Google Translate widget.
- [ ] T069 [P] [US5] Ensure the widget is configured to support IT, EN, FR, ES, AR languages.
- [ ] T070 [US5] Remove any leftover code related to next-intl or other manual translation libraries.
- [ ] T071 [US5] Ensure offer content from the API is dynamically translated by the widget.
- [ ] T072 [US5] Confirm that RTL support for Arabic is automatically handled by the widget.

**Checkpoint**: Multi-language support is fully implemented across all platform features via the Google Translate widget.

---

## Phase 8: User Story 6 - WhatsApp Business Integration (Priority: P6)

**Goal**: Enable admins to send promotional campaigns, birthday messages, and nationality-targeted offers via WhatsApp Business API with delivery tracking

**Independent Test**: An admin can compose and send a WhatsApp message to selected customer groups, and track the delivery status of sent messages.

### Implementation for User Story 6

- [ ] T075 [P] [US6] Create WhatsApp API service in lib/whatsapp/api.js for sending messages via WhatsApp Business API
- [ ] T076 [P] [US6] Create WhatsApp webhook handler for receiving delivery confirmations in app/api/whatsapp/webhook/route.js
- [ ] T077 [US6] Update WhatsApp message creation to use only approved templates as required
- [ ] T078 [US6] Create messaging logs display in admin panel to show delivery status of sent messages
- [ ] T079 [US6] Implement customer filtering by nationality, points threshold, etc. for targeted campaigns
- [ ] T080 [US6] Create birthday message automation feature in lib/whatsapp/birthday.js
- [ ] T081 [US6] Create nationality-targeted offers feature in lib/whatsapp/targeted.js

**Checkpoint**: WhatsApp Business API integration is fully functional with template validation and delivery tracking

---

## Phase 9: Security & Legal - GDPR Compliance (Priority: P7)

**Goal**: Implement GDPR-compliant data handling with consent tracking, data export/delete endpoints, and audit logs

**Independent Test**: GDPR-compliant data handling is implemented with export and delete functionality that meets regulatory requirements.

### Implementation for GDPR Compliance

- [ ] T082 [P] Create GDPR consent tracking in Customer registration and model
- [ ] T083 [P] Create data export endpoint POST /api/gdpr/export for customer data export
- [ ] T084 Create data deletion endpoint POST /api/gdpr/delete for customer data anonymization
- [ ] T085 Create GDPR Log model/service in lib/supabase/gdpr_log.js for compliance tracking
- [ ] T086 Update all data handling to ensure GDPR compliance with explicit consent
- [ ] T087 Add data retention policies for customer data in Supabase

**Checkpoint**: GDPR compliance requirements are fully implemented

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T088 [P] Performance optimization: Implement Next.js Image optimization for all images
- [ ] T089 [P] Add comprehensive error handling throughout the application
- [ ] T090 Performance optimization: Optimize database queries with proper indexing
- [ ] T091 Add loading states and skeleton screens for improved UX
- [ ] T092 Implement proper validation for all input fields and API endpoints
- [ ] T093 Add comprehensive logging for debugging and monitoring
- [ ] T094 Add unit and integration tests for critical functionality
- [ ] T095 Security hardening: Add additional security headers and input sanitization
- [ ] T096 Run full platform validation using quickstart.md guide
- [ ] T097 Create documentation for deployment on Vercel and Supabase Cloud

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5 → P6)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Depends on US2 (registration/login required) - Builds on customer authentication
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) but requires admin authentication setup
- **User Story 5 (P5)**: Can start after US1 but extends existing components with i18n
- **User Story 6 (P6)**: Depends on US4 (admin dashboard required) and requires WhatsApp API setup
- **GDPR Compliance**: Can run in parallel with other stories but critical for all user data handling

### Within Each User Story

- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all components for User Story 1 together:
T015 [P] [US1] Create homepage component in app/page.jsx with business info, logo, description
T016 [P] [US1] Implement photo gallery component in components/ui/Gallery.jsx with Next.js Image optimization
T019 [P] [US1] Implement WhatsApp Business button component in components/ui/WhatsAppButton.jsx
T020 [P] [US1] Create contact options component with phone, email, message form in components/ui/ContactOptions.jsx
T023 [P] [US1] Install next-google-translate-widget package
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Public Website)
4. Complete Phase 4: User Story 2 (Registration & Authentication)
5. **STOP and VALIDATE**: Public website and customer registration work together
6. Deploy/demo MVP if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 → Test independently → Deploy/Demo (Public Website!)
3. Add US2 → Test independently → Deploy/Demo (Registration!)
4. Add US3 → Test independently → Deploy/Demo (Customer Dashboard!)
5. Add US4 → Test independently → Deploy/Demo (Admin Dashboard!)
6. Add US5 → Test independently → Deploy/Demo (Multi-language!)
7. Add US6 → Test independently → Deploy/Demo (WhatsApp Integration!)
8. Add GDPR → Test independently → Deploy/Demo (Compliance!)
9. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T014)
2. Once Foundational is done:
   - Developer A: User Story 1 (Public Website - T015-T026)
   - Developer B: User Story 2 (Registration - T027-T037)
   - Developer C: Start User Story 3 (Customer Dashboard - T038-T049) after US2 completion
   - Developer D: User Story 4 (Admin Dashboard - T050-T067)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
