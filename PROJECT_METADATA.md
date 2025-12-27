# Project Metadata: Baraka Platform

## 1. Project Overview
**Name**: Baraka
**Live URL**: [www.barakasrl.it](https://www.barakasrl.it)
**Description**: A comprehensive Customer Loyalty, CRM, and Business Operations platform built with Next.js and Supabase. It features specialized modules for butchery/meat processing operations (Slaughtering, Eid al Adha reservations) alongside standard loyalty features (Points, Vouchers).

## 2. Technology Stack

### Core Framework
- **Runtime**: Node.js (v22.x)
- **Framework**: Next.js v16.0.10 (App Router)
- **Language**: TypeScript & JavaScript (Hybrid)
- **Styling**: Tailwind CSS v4, Framer Motion, Motion, Lucide React (Icons), Radix UI

### Backend & Database
- **Platform**: Supabase
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **ORM/Query**: `@supabase/supabase-js`, `pg` (direct connection where needed)

### Key Libraries
- **Internationalization**: `next-intl`
- **Visualization**: Recharts (Charts), React-Three-Fiber (3D)
- **Utilities**: `date-fns`, `xlsx`, `jspdf`, `qrcode`, `zod` (implied by typical validation patterns)
- **Communications**: `twilio` (SMS), `nodemailer`/`resend` (Email)

## 3. Project Structure

### Key Directories
- **`app/[locale]`**: Main application routes (Localized).
  - **`/admin`**: secure admin portal for business management.
  - **`/dashboard`**: client-facing loyalty dashboard.
  - **`/login`, `/register`**: Auth pages.
- **`components`**: Reusable UI components (likely shadcn/ui or custom).
- **`lib`**: Core logic and utilities.
  - **`/supabase`**: Database schemas (`.sql`) and client connection.
  - **`/actions`**: Next.js Server Actions.
  - **`/services`**: External service integrations (SMS, Email).
- **`messages`**: Localization JSON files (en, it, fr, es, ar).
- **`public`**: Static assets (`/illus` for illustrations).

## 4. Database Schema Overview

### Core Modules
- **`customers`**: Central user profile storage (linked to `auth.users`).
- **`admin_users`**: Admin profiles with specific roles/permissions.
- **`settings`**: Global system configuration key-value store.

### Loyalty & CRM
- **`loyalty_points`**: Transaction ledger for points (Earning/Redemption).
- **`vouchers`**: Generated reward codes with expiration and value.
- **`offers`**: Promotional campaigns (Weekly/Permanent) with i18n support.
- **`reviews`**: Customer feedback system with approval workflow.
- **`whatsapp_messages`**: Log of sent communication (Template-based).

### Operations Modules
- **`slaughtering_records`**: Tracking for meat processing (Live weight vs Slaughtered weight, cost calculations, supplier tracking).
- **`inventory`**: Product stock management (implied by admin route).

### Eid al Adha (Special Module)
- **`eid_reservations`**: Reservations for sheep/goats.
- **`eid_cattle_groups`**: Group-buying logic for cattle (shares management).
- **`eid_deposits`**: Financial tracking for reservations.
- **`eid_purchases`**: Farmer/Supplier purchase tracking.

## 5. Environment & Configuration
- **Env Files**: `.env`, `.env.sentry-build-plugin`.
- **Config Files**: 
  - `i18n.config.js`: Locale setup (`en`, `it`, `fr`, `es`, `ar`).
  - `next.config.mjs`: Build settings.
  - `middleware.ts`: Auth and Locale protection.

## 6. Current Status
- **Active Development**: Evidence of "Under Construction" pages and migration scripts (`run_migration_*.js`).
- **Features**: Full Admin Dashboard, Client Loyalty Portal, SMS/WhatsApp integration, detailed Reporting.
