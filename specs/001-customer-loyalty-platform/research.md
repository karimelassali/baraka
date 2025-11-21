# Research: Customer Loyalty Platform

## Decision: Technology Stack Selection
**Rationale**: Based on project requirements, selected Next.js 14+ with App Router for frontend, Supabase for backend services (database, auth, storage), and WhatsApp Business API for messaging. This stack provides a full-featured web application with authentication, real-time capabilities, and multilingual support.

## Alternatives Considered:
- **Frontend**: React with Create React App vs Next.js - Chose Next.js for built-in SSR/SSG, file-based routing, and better performance
- **Backend**: Node.js/Express vs Supabase - Chose Supabase for built-in auth, RLS, and integrated database solution
- **Database**: MongoDB vs PostgreSQL - Chose PostgreSQL via Supabase for better relational data handling needed for loyalty system
- **i18n**: next-i18next vs next-intl - Chose next-intl for better integration with Next.js App Router

## Decision: Architecture Pattern
**Rationale**: Server Components for data-heavy pages (admin dashboards) paired with Client Components for interactive elements (forms, modals) provides optimal performance while maintaining good UX.

## Decision: Authentication and Authorization
**Rationale**: Using Supabase Auth for user authentication with role-based access control. Customer and admin authentication handled with RLS policies to ensure data security and privacy.

## Decision: Multi-language Implementation
**Rationale**: Using next-intl with locale-based routing [locale]/ for URLs to support Italian, English, French, Spanish, and Arabic.

## Decision: WhatsApp Business API Integration
**Rationale**: Using WhatsApp Business API through a Business Solution Provider (BSP) like Twilio or 360dialog for reliable messaging capabilities with template-based message structure.

## Decision: Data Storage and Security
**Rationale**: Supabase PostgreSQL with Row Level Security (RLS) to ensure customers only access their data while admins can access all data through secure server-side operations using service role keys.

## Decision: Deployment and Hosting
**Rationale**: Vercel for frontend hosting (optimized for Next.js) and Supabase Cloud for backend services provides a seamless, scalable, and cost-effective solution.

## Unknowns Resolved:

### 1. WhatsApp Business API Implementation
**Original Unknown**: Best approach for WhatsApp integration
**Resolution**: Use WhatsApp Business API through BSP like Twilio or 360dialog. Implement webhook for receiving delivery confirmations and store logs in Supabase.

### 2. Multi-language RTL Support
**Original Unknown**: How to handle Arabic RTL layout
**Resolution**: Use next-intl for translations and implement RTL support through Tailwind CSS utilities and CSS direction properties.

### 3. Loyalty Points Calculation
**Original Unknown**: Real-time points calculation approach
**Resolution**: Use Supabase database functions for calculation and real-time updates through Supabase Realtime or server actions.

### 4. GDPR Compliance Implementation
**Original Unknown**: How to handle data export/delete requirements
**Resolution**: Implement dedicated API endpoints that anonymize user data while maintaining referential integrity for business analytics.

## Best Practices Applied:

### Security
- Row Level Security (RLS) on all Supabase tables
- Server-side operations for sensitive admin functions
- Secure environment variables for API keys
- Input validation and sanitization

### Performance
- Next.js Image optimization for all images
- Server components for data-heavy admin pages
- Client components for interactive elements
- Dynamic imports for code splitting

### Usability
- Mobile-first responsive design
- Intuitive navigation for users with low digital experience
- Clear error messaging and validation feedback
- Persistent language preference

### Scalability
- Supabase for horizontal scaling
- CDN for static assets
- Optimized database queries with proper indexing
- Caching strategies

## Integration Patterns:

### Supabase Authentication Flow
1. User registers via Supabase Auth
2. Profile created in customers table
3. GDPR consent timestamp stored
4. User redirected to dashboard

### WhatsApp Message Flow
1. Admin composes message in admin dashboard
2. Message validated against approved templates
3. Sent via WhatsApp Business API
4. Delivery status tracked via webhook

### Points Calculation Flow
1. Admin enters purchase amount
2. Formula applied (default: €1 = 1 point)
3. Points added to customer account
4. History updated in loyalty_points table
5. Real-time balance updated