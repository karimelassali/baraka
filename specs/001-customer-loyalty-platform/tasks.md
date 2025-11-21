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

- [x] T007 Setup Supabase client configuration in lib/supabase/client.js and lib/supabase/server.js
- [x] T008 [P] Create Supabase database schema with all tables from data-model.md
- [x] T009 [P] Configure Supabase Row Level Security (RLS) policies for all tables
- [x] T010 [P] Create authentication service in lib/auth/ with Supabase integration
- [x] T011 Create middleware for authentication and role-based access control
- [x] T013 Create base API route handlers with error handling middleware
- [x] T014 Setup database for real-time updates

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
- [x] T035 [US2] Create confirmation email/WhatsApp sending after registration in the registration API
- [x] T036 [US2] Create redirect to dashboard after successful login in LoginForm.jsx
- [x] T037 [US2] Create Customer model/service in lib/supabase/customer.js for customer data handling
- [x] T038 [P] [US2] use react-country-flag package for country flag display in RegistrationForm.jsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Customer Dashboard with Loyalty Features (Priority: P3)

**Goal**: Provide registered customers with access to their personal dashboard to view/edit profile, check loyalty points, view transaction history, and access offers and vouchers

**Independent Test**: A logged-in customer can view their complete dashboard with current points balance, transaction history, and available offers.

### Implementation for User Story 3

- [x] T038 [P] [US3] Create customer dashboard layout in app/dashboard/page.jsx with navigation
- [x] T039 [P] [US3] Create customer profile view/edit component in components/dashboard/Profile.jsx
- [x] T040 [P] [US3] Create loyalty wallet component in components/loyalty/Wallet.jsx showing total points and history
- [x] T041 [US3] Create API endpoint GET /api/customer/profile for retrieving customer profile
- [x] T042 [US3] Create API endpoint PUT /api/customer/profile for updating customer profile
- [x] T043 [US3] Create API endpoint GET /api/customer/points for retrieving customer points balance and history
- [x] T044 [US3] Create active offers display component in components/dashboard/Offers.jsx showing personalized and general offers
- [x] T045 [US3] Create vouchers display component in components/dashboard/Vouchers.jsx showing available vouchers
- [x] T046 [US3] Create Loyalty Points model/service in lib/supabase/loyalty_points.js for points data handling
- [x] T047 [US3] Create Voucher model/service in lib/supabase/voucher.js for voucher data handling
- [x] T048 [US3] Create Offer model/service in lib/supabase/offer.js for offer data handling
- [x] T049 [US3] Create customer dashboard wallet page in app/dashboard/wallet/page.jsx

**Checkpoint**: At this point, User Stories 1, 2 AND 3 should all work independently

---

## Phase 6: User Story 4 - Admin Dashboard Management (Priority: P4)

**Goal**: Enable store managers to manage customers, offers, reviews, points, and vouchers through an admin dashboard with full functionality

**Independent Test**: An admin user can log in to the admin dashboard and successfully perform core management tasks including adding points to customer accounts and creating offers.

### Implementation for User Story 4

- [x] T050 [P] [US4] Create admin dashboard layout in app/admin/page.jsx with role-based access control
- [x] T051 [P] [US4] Create customer management component in components/admin/CustomerManagement.jsx with search and filter capabilities
- [x] T052 [US4] Create API endpoint GET /api/admin/customers with filtering by name, country of origin, and residence
- [x] T053 [P] [US4] Create customer editing component in components/admin/EditCustomer.jsx with CRUD operations
- [x] T054 [P] [US4] Create offers management component in components/admin/OfferManagement.jsx
- [x] T055 [US4] Create API endpoint POST /api/admin/offers for creating weekly and permanent offers with multi-language fields
- [x] T056 [P] [US4] Create reviews management component in components/admin/ReviewManagement.jsx for approving/hiding reviews
- [x] T057 [US4] Create API endpoint for approving/hiding public reviews in lib/supabase/review.js
- [x] T058 [P] [US4] Create loyalty points management component in components/admin/PointsManagement.jsx
- [x] T059 [US4] Create API endpoint PUT /api/admin/customers/:id/points for adding/deducting customer points
- [x] T060 [US4] Create voucher management component in components/admin/VoucherManagement.jsx
- [x] T061 [US4] Create API endpoint POST /api/admin/vouchers for creating vouchers from customer points
- [ ] T062 [US4] Create WhatsApp campaign management component in components/admin/WhatsAppCampaign.jsx
- [ ] T063 [US4] Create API endpoint POST /api/admin/campaigns/send for sending WhatsApp campaigns
- [x] T064 [US4] Create Admin User model/service in lib/supabase/admin_user.js for admin data handling
- [x] T065 [US4] Create Review model/service in lib/supabase/review.js for review data handling
- [x] T066 [US4] Create WhatsApp Message model/service in lib/supabase/whatsapp_message.js for tracking messages
- [x] T067 [US4] Create Settings model/service in lib/supabase/settings.js for system-wide settings

**Checkpoint**: At this point, all user stories should be independently functional

---

## Phase 7: User Story 5 - Multi-language Support (Priority: P5)

**Goal**: Ensure all platform content is properly translated and accessible in Italian, English, French, Spanish, and Arabic with persistent language preference using next-google-translate-widget.

**Independent Test**: A user can select any of the supported languages from the Google Translate widget and see all public content properly translated in that language.

### Implementation for User Story 5

- [x] T068 [P] [US5] Verify that all public pages are correctly translated by the Google Translate widget.
- [x] T069 [P] [US5] Ensure the widget is configured to support IT, EN, FR, ES, AR languages.
- [x] T070 [US5] Remove any leftover code related to next-intl or other manual translation libraries.
- [x] T071 [US5] Ensure offer content from the API is dynamically translated by the widget.
- [x] T072 [US5] Confirm that RTL support for Arabic is automatically handled by the widget.

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

- [x] T082 [P] Create GDPR consent tracking in Customer registration and model
- [x] T083 [P] Create data export endpoint POST /api/gdpr/export for customer data export
- [x] T084 Create data deletion endpoint POST /api/gdpr/delete for customer data anonymization
- [x] T085 Create GDPR Log model/service in lib/supabase/gdpr_log.js for compliance tracking
- [x] T086 Update all data handling to ensure GDPR compliance with explicit consent
- [x] T087 Add data retention policies for customer data in Supabase

**Checkpoint**: GDPR compliance requirements are fully implemented

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T088 [P] Performance optimization: Implement Next.js Image optimization for all images
- [x] T089 [P] Add comprehensive error handling throughout the application
- [x] T090 Performance optimization: Optimize database queries with proper indexing
- [x] T091 Add loading states and skeleton screens for improved UX
- [x] T092 Implement proper validation for all input fields and API endpoints
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

---

# Tasks: Admin Panel Enhancement

**Input**: Design documents from `/specs/001-admin-panel-enhancement/`
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

- [ ] T001 Create project structure per implementation plan in src/
- [ ] T002 Initialize Next.js project with required dependencies in package.json
- [ ] T003 [P] Configure linting and formatting tools (ESLint, Prettier)
- [ ] T004 [P] Set up TypeScript configuration in tsconfig.json
- [ ] T005 [P] Configure TailwindCSS for styling
- [ ] T006 [P] Set up internationalization configuration with next-intl

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T007 Setup database schema and migrations framework for Supabase
- [ ] T008 [P] Implement authentication/authorization framework with Supabase Auth
- [ ] T009 [P] Create role-based access control (RBAC) middleware in src/middleware/auth.ts
- [ ] T010 [P] Setup Next.js API routes structure in src/app/api/
- [ ] T011 Create base models/entities that all stories depend on in src/types/
- [ ] T012 Configure error handling and logging infrastructure in src/lib/
- [ ] T013 Setup environment configuration management in src/lib/
- [ ] T014 [P] Integrate Supabase client configuration in src/lib/
- [ ] T015 Set up database tables for users, products, inventory, and other entities

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Multi-Level Admin Access (Priority: P1) 🎯 MVP

**Goal**: Admins with different roles can access only the features relevant to their permissions. As an inventory manager, I want to manage products without seeing customer data. As a loyalty manager, I want to manage customer loyalty points without accessing inventory. As a super admin, I want full access to all features.

**Independent Test**: An inventory manager can log in and successfully add/edit products and update inventory quantities but cannot access customer profiles or loyalty points. A loyalty manager can access customer profiles and assign points but cannot see inventory details.

### Implementation for User Story 1

- [ ] T016 [P] [US1] Create AdminUser model and role types in src/types/admin.ts
- [ ] T017 [P] [US1] Create admin user permissions model in src/types/permissions.ts
- [ ] T018 [US1] Implement UserService for admin management in src/services/users/adminService.ts
- [ ] T019 [US1] Create role-based permissions utility in src/lib/permissions/adminPermissions.ts
- [ ] T020 [US1] Implement Super Admin role with full access in src/services/users/roles/superAdmin.ts
- [ ] T021 [US1] Implement Inventory Manager role with product access in src/services/users/roles/inventoryManager.ts
- [ ] T022 [US1] Implement Loyalty Manager role with customer access in src/services/users/roles/loyaltyManager.ts
- [ ] T023 [US1] Implement Marketing Manager role with offer access in src/services/users/roles/marketingManager.ts
- [ ] T024 [US1] Create admin authentication page in src/app/admin/login/page.tsx
- [ ] T025 [US1] Create admin dashboard layout with role-based navigation in src/app/admin/layout.tsx
- [ ] T026 [US1] Implement role-based access middleware in src/middleware/roleMiddleware.ts
- [ ] T027 [US1] Add admin user management UI in src/app/admin/users/page.tsx
- [ ] T028 [US1] Add user role assignment functionality in src/components/admin/UserRoleManagement.tsx
- [ ] T029 [US1] Add admin session management utilities in src/lib/auth/session.ts
- [ ] T030 [US1] Add role verification for UI elements in src/components/admin/RoleProtectedComponent.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Product Catalog & Inventory Management (Priority: P1)

**Goal**: As an admin, I need to add, edit, and manage product information including name, category, pricing, stock levels, and expiration dates. I also need to view all products and filter them by various criteria.

**Independent Test**: An admin can successfully add a new product with all required fields, view the product in the inventory list, and update its quantity. An admin can also filter products by category, quantity, or price.

### Implementation for User Story 2

- [ ] T031 [P] [US2] Create Product model in src/types/product.ts
- [ ] T032 [P] [US2] Create Inventory model in src/types/inventory.ts
- [ ] T033 [US2] Create ProductService in src/services/products/productService.ts
- [ ] T034 [US2] Create InventoryService in src/services/inventory/inventoryService.ts
- [ ] T035 [US2] Implement product CRUD operations in src/app/api/admin/products/route.ts
- [ ] T036 [US2] Implement inventory quantity update in src/app/api/admin/inventory/route.ts
- [ ] T037 [US2] Create product management UI in src/app/admin/products/page.tsx
- [ ] T038 [US2] Create product form component in src/components/admin/ProductForm.tsx
- [ ] T039 [US2] Create product list component with filtering in src/components/admin/ProductList.tsx
- [ ] T040 [US2] Implement category filtering functionality in src/components/admin/CategoryFilter.tsx
- [ ] T041 [US2] Implement quantity-based filtering in src/components/admin/QuantityFilter.tsx
- [ ] T042 [US2] Implement price-based filtering in src/components/admin/PriceFilter.tsx
- [ ] T043 [US2] Implement expiration date filtering in src/components/admin/ExpirationFilter.tsx
- [ ] T044 [US2] Add product image upload functionality using Supabase Storage
- [ ] T045 [US2] Add minimum stock threshold tracking in src/lib/inventory/stockThreshold.ts
- [ ] T046 [US2] Create inventory management UI in src/app/admin/inventory/page.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Internal Notifications (Priority: P2)

**Goal**: As an admin, I need to receive alerts in the admin panel for important events like products nearing expiration, loyalty points expiring, offers needing updates, and system alerts.

**Independent Test**: Admins receive notifications in the admin panel for products approaching expiration dates, loyalty points about to expire, and offers needing renewal.

### Implementation for User Story 3

- [ ] T047 [P] [US3] Create Notification model in src/types/notification.ts
- [ ] T048 [US3] Create NotificationService in src/services/notifications/notificationService.ts
- [ ] T049 [US3] Implement notification API routes in src/app/api/admin/notifications/route.ts
- [ ] T050 [US3] Create notification system for expiring products in src/lib/notifications/productExpiration.ts
- [ ] T051 [US3] Create notification system for expiring loyalty points in src/lib/notifications/loyaltyExpiration.ts
- [ ] T052 [US3] Create notification system for expiring offers in src/lib/notifications/offerExpiration.ts
- [ ] T053 [US3] Create notification system for low stock alerts in src/lib/notifications/stockAlerts.ts
- [ ] T054 [US3] Create notification badge component in src/components/admin/NotificationBadge.tsx
- [ ] T055 [US3] Create notification dropdown UI in src/components/admin/NotificationDropdown.tsx
- [ ] T056 [US3] Implement notification scheduling system for recurring checks
- [ ] T057 [US3] Add notification filtering by type in src/components/admin/NotificationFilters.tsx
- [ ] T058 [US3] Add notification read/unread tracking in src/services/notifications/readStateService.ts

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: User Story 4 - Dashboard Analytics & Reports (Priority: P2)

**Goal**: As an admin, I need to view visual analytics and reports showing customer growth, popular offers, loyalty point activity, and product trends to make informed business decisions.

**Independent Test**: An admin can view the dashboard and see accurate statistics about customer growth, popular offers, and loyalty points. Charts and graphs display meaningful data.

### Implementation for User Story 4

- [ ] T059 [P] [US4] Create Analytics model in src/types/analytics.ts
- [ ] T060 [US4] Create AnalyticsService in src/services/analytics/analyticsService.ts
- [ ] T061 [US4] Implement analytics API routes in src/app/api/admin/analytics/route.ts
- [ ] T062 [US4] Create customer growth chart component in src/components/admin/CustomerGrowthChart.tsx
- [ ] T063 [US4] Create customer distribution chart component in src/components/admin/CustomerDistributionChart.tsx
- [ ] T064 [US4] Create popular offers chart component in src/components/admin/PopularOffersChart.tsx
- [ ] T065 [US4] Create loyalty points chart component in src/components/admin/LoyaltyPointsChart.tsx
- [ ] T066 [US4] Create product trends chart component in src/components/admin/ProductTrendsChart.tsx
- [ ] T067 [US4] Implement data aggregation functions for analytics in src/lib/analytics/dataAggregation.ts
- [ ] T068 [US4] Create dashboard layout in src/app/admin/dashboard/page.tsx
- [ ] T069 [US4] Add date range selector for analytics in src/components/admin/DateRangeSelector.tsx
- [ ] T070 [US4] Implement real-time data updates using Supabase Realtime in src/hooks/useRealtimeAnalytics.ts

**Checkpoint**: At this point, User Stories 1, 2, 3, AND 4 should all work independently

---

## Phase 7: User Story 5 - Coupon & Bonus Management (Priority: P3)

**Goal**: As an admin, I need to create coupons and bonus points for specific customers or groups with expiry dates and track their usage.

**Independent Test**: An admin can create a coupon with an expiry date, assign bonus points to specific customers, and track usage of coupons and bonuses.

### Implementation for User Story 5

- [ ] T071 [P] [US5] Create Coupon model in src/types/coupon.ts
- [ ] T072 [P] [US5] Create Bonus model in src/types/bonus.ts
- [ ] T073 [US5] Create CouponService in src/services/coupons/couponService.ts
- [ ] T074 [US5] Create BonusService in src/services/bonuses/bonusService.ts
- [ ] T075 [US5] Implement coupon API routes in src/app/api/admin/coupons/route.ts
- [ ] T076 [US5] Implement bonus API routes in src/app/api/admin/bonuses/route.ts
- [ ] T077 [US5] Create coupon management UI in src/app/admin/coupons/page.tsx
- [ ] T078 [US5] Create bonus management UI in src/app/admin/bonuses/page.tsx
- [ ] T079 [US5] Create coupon creation form in src/components/admin/CouponForm.tsx
- [ ] T080 [US5] Create bonus assignment form in src/components/admin/BonusForm.tsx
- [ ] T081 [US5] Create coupon usage tracking in src/services/coupons/usageTracking.ts
- [ ] T082 [US5] Create bonus tracking functionality in src/services/bonuses/bonusTracking.ts
- [ ] T083 [US5] Implement expiration date handling for coupons in src/lib/coupons/couponExpiration.ts
- [ ] T084 [US5] Add customer targeting functionality for coupons in src/components/admin/CustomerTargeting.tsx

**Checkpoint**: At this point, User Stories 1-5 should all work independently

---

## Phase 8: User Story 6 - Review Approval System (Priority: P3)

**Goal**: As an admin, I need to approve, edit, or reject customer reviews before they become visible on the site to maintain quality control.

**Independent Test**: An admin can review pending customer reviews, approve them for public display, edit inappropriate content, or reject reviews entirely.

### Implementation for User Story 6

- [ ] T085 [P] [US6] Create Review model in src/types/review.ts
- [ ] T086 [US6] Create ReviewService in src/services/reviews/reviewService.ts
- [ ] T087 [US6] Implement review API routes in src/app/api/admin/reviews/route.ts
- [ ] T088 [US6] Create review management UI in src/app/admin/reviews/page.tsx
- [ ] T089 [US6] Create review approval component in src/components/admin/ReviewApproval.tsx
- [ ] T090 [US6] Implement review editing functionality in src/components/admin/ReviewEditor.tsx
- [ ] T091 [US6] Create customer review list in src/components/admin/CustomerReviewList.tsx
- [ ] T092 [US6] Add review status tracking (pending, approved, rejected) in src/lib/reviews/reviewStatus.ts
- [ ] T093 [US6] Implement review notification system for pending reviews in src/lib/notifications/reviewNotifications.ts

**Checkpoint**: At this point, User Stories 1-6 should all work independently

---

## Phase 9: User Story 7 - Automatic Data Backup (Priority: P2)

**Goal**: As an admin, I need the system to automatically back up critical data (customers, loyalty points, offers, inventory) with a restore option to protect against data loss.

**Independent Test**: The system automatically creates backups on the configured schedule (daily/weekly) and provides a restore option in case of data loss.

### Implementation for User Story 7

- [ ] T094 [P] [US7] Create Backup model in src/types/backup.ts
- [ ] T095 [US7] Create BackupService in src/services/backup/backupService.ts
- [ ] T096 [US7] Implement backup API routes in src/app/api/admin/backup/route.ts
- [ ] T097 [US7] Create backup scheduling system in src/lib/backup/backupScheduler.ts
- [ ] T098 [US7] Implement backup creation functionality for critical data in src/lib/backup/createBackup.ts
- [ ] T099 [US7] Implement backup restoration functionality in src/lib/backup/restoreBackup.ts
- [ ] T100 [US7] Create backup management UI in src/app/admin/backup/page.tsx
- [ ] T101 [US7] Add backup configuration panel in src/components/admin/BackupConfiguration.tsx
- [ ] T102 [US7] Add backup history display in src/components/admin/BackupHistory.tsx
- [ ] T103 [US7] Implement backup notification system for backup success/failure in src/lib/notifications/backupNotifications.ts
- [ ] T104 [US7] Create automated backup cron job implementation using Supabase Edge Functions in src/edge-functions/automatic-backup.ts

**Checkpoint**: All user stories should now be independently functional

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T105 [P] Update documentation in docs/admin-panel-enhancement.md
- [ ] T106 [P] Add comprehensive error handling across all admin features
- [ ] T107 [P] Add audit logging functionality for admin actions in src/lib/logging/adminAudit.ts
- [ ] T108 [P] Add input validation and sanitization throughout the admin panel
- [ ] T109 [P] Add performance optimization for large datasets in tables and filters
- [ ] T110 [P] Add responsive design improvements for mobile admin use
- [ ] T111 [P] Add accessibility improvements following WCAG guidelines
- [ ] T112 Add security hardening measures for admin panel
- [ ] T113 [P] UI/UX enhancements and consistency fixes across all admin pages
- [ ] T114 Run quickstart validation and end-to-end tests
- [ ] T115 Add additional unit tests for critical business logic

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 6 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 7 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all models for User Story 1 together:
Task: "Create AdminUser model and role types in src/types/admin.ts"
Task: "Create admin user permissions model in src/types/permissions.ts"

# Launch all services for User Story 1 together:
Task: "Implement UserService for admin management in src/services/users/adminService.ts"
Task: "Create role-based permissions utility in src/lib/permissions/adminPermissions.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
