# Baraka Loyalty System - Project Documentation

## Project Overview

Baraka Loyalty is a comprehensive, enterprise-grade customer loyalty and business management platform built with Next.js 16, React 19, and Supabase. The application provides an extensive suite of features including customer management, loyalty points tracking, voucher management, EID (Electronic Identification) cattle reservation system, inventory management, QR code tracking, WhatsApp marketing campaigns, financial reporting, and multilingual support with RTL capabilities.

### Key Technologies
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **Styling**: Tailwind CSS with custom design system including Glassmorphism
- **UI Components**: Radix UI, Lucide React, Tabler Icons, Framer Motion for animations
- **Internationalization**: next-intl with RTL support for Arabic
- **Analytics**: Vercel Analytics, Sentry error monitoring
- **Authentication**: Supabase Auth with role-based access control
- **Email**: Nodemailer for automated notifications, Resend for marketing emails
- **Messaging**: Twilio for WhatsApp Business API integration
- **Other**: Three.js for 3D graphics, HTML2Canvas for PDF generation, React-Three-Fiber

### Project Architecture
- **Frontend**: Next.js App Router with internationalized routes in `[locale]` directory
- **Backend**: API routes in `/app/api` and server actions in `/app/actions`
- **Database**: PostgreSQL with Supabase, with Row Level Security (RLS) enabled
- **Authentication**: Supabase Auth with middleware protection for admin routes
- **Components**: Organized in `/components` directory with domain-specific subdirectories
- **Business Logic**: Separated in `/lib` with specific modules for each domain

## Directory Structure

```
baraka/
├── app/                    # Next.js App Router pages
│   ├── [locale]/          # Internationalized routes
│   ├── api/              # API routes
│   ├── actions/          # Server actions
│   └── components/       # Page-specific components
├── components/           # Reusable UI components
│   ├── admin/           # Admin-specific components
│   ├── client/          # Customer portal components
│   ├── dashboard/       # Dashboard components
│   ├── home/            # Landing page components
│   ├── loyalty/         # Loyalty system components
│   ├── offers/          # Offer management components
│   ├── themes/          # Theme management components
│   └── ui/              # Reusable UI components
├── lib/                  # Business logic and utilities
│   ├── actions/         # Server actions
│   ├── api/             # API utilities
│   ├── auth/            # Authentication utilities
│   ├── constants/       # Constants and enums
│   ├── data/            # Data fetching utilities
│   ├── email/           # Email utilities and notifications
│   ├── reports/         # Report generation utilities
│   ├── services/        # Business service utilities
│   ├── supabase/        # Supabase client utilities
│   └── whatsapp/        # WhatsApp integration utilities
├── database/             # Database schema and migrations
├── public/               # Static assets
├── messages/             # Translation files (en, it, ar)
├── scripts/              # Utility scripts
└── specs/                # Feature specifications
```

## Detailed Platform Features

### 1. Admin Portal (`/admin`)
The command center for managing the entire business operations, customer relationships, and platform content.

#### 1.1 Analytics & Dashboard (`/admin/analytics`)
- **Comprehensive Dashboard**:
  - **Key Metrics**: Real-time stats for Total Clients, Revenue (Est.), Active Offers, and Engagement
  - **Interactive Charts**:
    - **Client Growth**: Visual trend of new registrations over time
    - **Voucher Status**: Donut chart showing active vs. redeemed vouchers
    - **Message Activity**: Bar chart tracking WhatsApp campaign performance
    - **Category Distribution**: Pie chart of product inventory distribution
  - **Top Lists**:
    - **Top Loyal Customers**: Leaderboard of customers by points balance
    - **Top Countries**: Geographic distribution of client base
- **Inventory Intelligence**:
  - **Inventory Alerts**: Dedicated widget highlighting "Low Stock" and "Expiring Soon" items for immediate action
- **Activity Monitoring**:
  - **Recent System Activity**: Live feed of system events (messages, updates)

#### 1.2 Customer Management (`/admin/customers`)
- **Customer Database**:
  - **List View**: Comprehensive table of all registered customers
  - **Search & Filter**: Ability to find customers by name, email, or phone
- **CRUD Operations**:
  - **Add Customer**: Form to manually register new clients
  - **Edit Customer**: Interface to update customer details
  - **Delete Customer**: Secure deletion with confirmation
- **Enhanced Management**:
  - Advanced filtering and sorting capabilities
  - Detailed customer profiles with verification status
  - Bulk operations for customer management
- **Verification System**:
  - Email and phone verification status tracking
  - Auth metadata synchronization for accurate verification status
  - Force password change capabilities
- **GDPR Compliance**:
  - Consent tracking with timestamps
  - Data protection and privacy controls
  - Audit logs for GDPR-related actions

#### 1.3 Inventory & Product Management (`/admin/inventory`)
- **Product Catalog**:
  - **Multi-Step Creation**: Sophisticated wizard for adding new products (Details -> Pricing -> Inventory)
  - **Product Editing**: Full control over product metadata
  - **Stock Tracking**: Monitor quantity levels with low stock alerts
- **Category Management**:
  - Create, edit, and delete product categories for organization
- **Expiration Management**:
  - **Batch Tracking**: Monitor expiration dates for specific batches
  - **Automated Alerts**: Visual warnings for items nearing expiration
  - **Expiring Soon Filter**: Advanced filtering for items expiring within 7 days
- **Supplier Management**:
  - Track supplier information and relationships
- **Advanced Search**:
  - Multi-field search across product names, descriptions, and SKUs
  - Category-based filtering
  - Expiration date range filtering
- **Unit Management**:
  - Flexible unit tracking (pcs, kg, liters, etc.)
  - Minimum stock level configuration
  - Purchase and selling price management

#### 1.4 Marketing & Loyalty
- **Offer Management (`/admin/offers`)**:
  - Create promotional offers with specific terms
  - Toggle offer visibility (Active/Inactive)
  - **Badges**: Assign visual badges (e.g., "New", "Hot") to offers
- **Points System (`/admin/points`)**:
  - Manage customer loyalty points
  - Manual adjustment of point balances
  - Track point transaction history
- **Voucher Management (`/admin/vouchers`)**:
  - Issue new vouchers to customers
  - Track voucher redemption status
  - **Glassmorphism UI**: Modern card-based layout for voucher details
  - **Points Conversion**: Automatic conversion of loyalty points to voucher value (10:1 ratio)
  - **Redemption Tracking**: Real-time status updates (active, used, expired)
  - **Value Calculation**: Automatic EUR value calculation from points
  - **Expiration Management**: 1-year expiration with configurable periods
  - **Customer Linking**: Automatic association with customer accounts
- **WhatsApp Campaigns (`/admin/campaigns`)**:
  - Create and send bulk WhatsApp messages to customer segments
  - **Messaging Logs**: History of all sent messages and their status

#### 1.5 Content Management
- **Review Moderation (`/admin/reviews`)**:
  - **Approval Workflow**: Review customer feedback before it goes public
  - **Reviewer Identity**: Manage reviewer names and details
- **Gallery Management (`/admin/gallery`)**:
  - **Image Upload**: Drag-and-drop interface for uploading portfolio/event images
  - **Gallery Grid**: Visual management of displayed images
  - **Delete**: Remove outdated images from the public gallery

#### 1.6 Financial Management (`/admin/revenue`, `/admin/payments`)
- **Daily Revenue Tracking**:
  - **Entry Management**: Add and edit daily revenue records by payment method (Cash, Card, Ticket)
  - **Monthly Archive**: View and manage historical revenue data
  - **PDF Export**: Generate professional PDF reports for daily or monthly revenue
- **Payments & Checks**:
  - **Payment Calendar**: Visual calendar view of upcoming payments and check due dates
  - **Status Tracking**: Mark payments as Pending, Paid, or Overdue
  - **Check Management**: Track check numbers and recipients

#### 1.7 Supply Chain Management (`/admin/order-management`)
- **Order Management**:
  - **Supplier Orders**: Create, edit, and track orders to suppliers
  - **Draft System**: Save orders as drafts before finalizing
  - **PDF Generation**: Auto-generate professional order PDFs to send to suppliers
- **Supplier Database**:
  - Manage supplier contact details and history

#### 1.8 Collaboration & Tools
- **Admin Board (`/admin/board`)**:
  - **Shared Workspace**: A collaborative board for admin notes, reminders, and team announcements
  - **Rich Media**: Support for pinning notes, adding images, and drawings
- **Wishlist Manager (`/admin/wishlist`)**:
  - **Customer Requests**: View and manage product requests from customers
  - **Status Workflow**: Approve or reject requests and notify customers
  - **Database Integration**: Secure storage with RLS policies and user-specific access
  - **Customer Matching**: Automatic linking of wishlist items to customer profiles
  - **Filtering System**: Advanced filtering by status, country, and search terms

#### 1.9 System Administration
- **Admin User Management (`/admin/admins`)**:
  - **Granular Permissions**: Role-Based Access Control (RBAC) with specific permissions for every module
  - **Profile Management**: Admins can update their own credentials and display names
- **Agent Training (`/admin/agent-training`)**:
  - **AI Knowledge Base**: Interface to feed the platform's AI agent with specific business knowledge and instructions
  - **Knowledge Categories**: Support for general, route, and instruction type knowledge
  - **Active/Inactive Toggle**: Control which knowledge items are active for the AI
- **System Logs (`/admin/logs`)**:
  - View system-wide activity logs for security and auditing
- **System Settings**:
  - Centralized configuration management
  - Business information and contact details
  - Platform-wide settings control

#### 1.10 EID Cattle Reservation System (`/admin/eid`)
- **Reservation Management**:
  - Create and manage cattle reservations with detailed specifications
  - Track pickup times and customer preferences
  - Support for different animal types (SHEEP, GOAT, CATTLE)
  - Weight-based reservations with requested and final weights
- **Deposit Tracking**:
  - Record and monitor customer deposits for reservations
  - Financial tracking for each reservation
  - Multiple payment methods support
  - Deposit history and transaction logs
- **Group Management**:
  - Organize cattle into groups for collective purchasing
  - Track group status (PENDING, PAID, COMPLETED, CANCELLED)
  - Group member management with individual roles and deposits
- **Purchase Management**:
  - Track individual cattle purchases with tag numbers and colors
  - Supplier and batch tracking
  - Destination management
- **Payment Integration**:
  - Automatic notifications to super admins on new reservations and deposits
  - Financial reporting and analytics

### 2. Customer Portal (`/dashboard`)
A personalized space for customers to interact with the brand and manage their rewards.

#### 2.1 Dashboard Hub
- **Welcome Overview**: Personalized greeting and summary of account status
- **Quick Stats**: At-a-glance view of points and active vouchers

#### 2.2 Loyalty Wallet (`/dashboard/wallet`)
- **Points Tracker**: Visual display of current loyalty points
- **Transaction History**: Record of points earned and spent

#### 2.3 Rewards & Offers
- **My Vouchers**:
  - Digital wallet for active and redeemed vouchers
  - QR code or unique code display for redemption
- **Exclusive Offers**:
  - Browse available promotions tailored to the user

#### 2.4 Wishlist (`/dashboard/wishlist`)
- **Make a Wish**: Form for customers to request specific products
- **Request Status**: Track the status (Pending, Approved) of their requests
- **Customer-Specific**: Individual wishlist management per customer account
- **Status Tracking**: Real-time status updates for request processing

#### 2.5 Profile Settings
- **Personal Info**: Update name, email, and phone number
- **Account Security**: Password management

### 3. Public Landing Page (`/`)
The storefront of the platform, designed for conversion and information.

- **Hero Section**: High-impact visual introduction with call-to-actions
- **About Us**: Brand storytelling section
- **Dynamic Gallery**: Grid of images managed via the Admin Gallery module
- **Live Offers**: Real-time display of active offers managed by admins
- **Customer Reviews**: Social proof section displaying approved reviews
- **Contact & Location**: Business information and map
- **WhatsApp Integration**: Floating action button for instant communication

### 4. Advanced Features

#### 4.1 Automated Notification System
- **Instant Notifications**: Real-time email alerts for:
  - New admin account creation
  - Order status updates (confirmed/completed)
  - New payment scheduling
  - Low stock inventory alerts
  - New Eid reservations and deposits
  - New cattle group creation
- **Scheduled Reports**: Automated daily and weekly business digests with:
  - New customer counts
  - Total revenue calculations from multiple sources
  - Eid reservation status tracking
  - Low stock item alerts
- **Email Configuration**: Gmail SMTP integration with app passwords
- **Super Admin Targeting**: Notifications sent only to users with 'super_admin' role
- **Template System**: Standardized email templates for consistency
- **Cron Job Integration**: Vercel cron job support for automated reports
- **Expiration Tracking**: Daily reports on items expiring within 7 days

#### 4.2 WhatsApp Business Integration
- **Twilio API**: Full WhatsApp Business API integration
- **Template-Based Messaging**: Pre-approved message templates with content variables
- **Campaign Management**: Bulk messaging to customer segments with rate limiting
- **Status Tracking**: Delivery and read receipts
- **Phone Number Formatting**: Automatic formatting to WhatsApp format (with Italian country code default)
- **Message History**: Logging of all sent messages with status tracking
- **Webhook Support**: Endpoint for receiving WhatsApp webhook events
- **Rate Limiting**: Built-in delay to respect Twilio's 1 message per second limit

#### 4.3 QR Code Tracking System
- **QR Code Generation**: System-generated QR codes with unique identifiers
- **Scan Tracking**: Detailed analytics on QR code scans with device information
- **Session Management**: Prevention of duplicate tracking within the same session
- **Web Analytics**: Collection of IP address, user agent, and device info
- **Real-time Monitoring**: Instant tracking of QR code usage and engagement
- **Database Integration**: Secure storage with RLS policies
- **Redirection System**: Custom target URLs for each QR code
- **Device Information**: JSONB storage of detailed device metadata
- **Privacy Compliance**: GDPR-compliant data collection and storage

#### 4.4 Multi-language Support
- **Full Translation**: English, Italian, and Arabic
- **RTL Support**: Native Right-to-Left layout for Arabic
- **Automatic Detection**: Locale-based content adaptation
- **Cultural Adaptation**: Date/time formats, currency, etc.

#### 4.4 Advanced UI/UX Features
- **Glassmorphism Design**: Modern translucent UI elements
- **Smooth Animations**: Framer Motion for fluid transitions
- **Responsive Design**: Mobile-first approach with tablet/desktop optimization
- **Accessibility**: WCAG compliant interfaces

#### 4.5 Security & Compliance
- **Row Level Security**: Database-level access control
- **GDPR Compliance**: Data protection and consent management
- **Role-Based Access**: Granular permissions for admin users
- **Audit Logging**: Comprehensive activity tracking with:
  - Admin action logging (CREATE, UPDATE, DELETE operations)
  - Resource and action type tracking
  - IP address and timestamp logging
  - Detailed action parameters and changes
- **Session Management**: Secure session handling with Supabase Auth
- **Access Control**: Multi-layered authentication (password + Supabase auth)
- **Data Encryption**: Secure storage of sensitive information
- **Privacy Controls**: Customer data management and consent tracking

#### 4.6 Financial Reporting
- **Daily Revenue Tracking**: Cash, card, and ticket sales
- **PDF Generation**: Professional financial reports
- **Payment Scheduling**: Calendar-based payment tracking
- **Revenue Analytics**: Trend analysis and forecasting
- **Multi-Currency Support**: EUR as default with potential for expansion
- **Revenue Streams**: Tracking from multiple sources (orders, payments, Eid deposits)
- **Financial Alerts**: Automated notifications for new payments and financial events

#### 4.7 System Administration & Operations
- **Maintenance Mode**: Configurable maintenance mode with:
  - Whitelisted routes during maintenance
  - Custom landing page during maintenance
  - Locale-aware redirects
- **System Settings**: Centralized configuration management
- **Admin Collaboration**: Shared notes and announcements board
- **Wishlist Management**: Customer request system with approval workflow
- **AI Knowledge Base**: Training interface for business rules and instructions

#### 4.8 AI Integration
- **Knowledge Base**: AI training interface for business rules
- **Automated Responses**: Intelligent customer service
- **Data Insights**: Pattern recognition and recommendations
- **AI Agent Training**: Customizable knowledge base with:
  - Route documentation for system navigation
  - Operational instructions for business processes
  - General knowledge entries for business context
- **Context Provider**: Real-time data integration for AI decision making
- **Pollinations Integration**: Advanced AI service with system context awareness
- **Autonomous Actions**: AI-powered navigation and data manipulation tools
- **System Directives**: AI follows specific protocols for data handling and operations

#### 4.9 Advanced Analytics & Reporting
- **Automated Cron Jobs**: Scheduled reports including:
  - Daily expiration reports with categorized alerts (expired, today, tomorrow, soon)
  - Weekly business digest with comprehensive metrics
  - Revenue analysis from multiple sources (orders, payments, Eid deposits)
  - Customer acquisition tracking
  - Eid reservation status monitoring
  - Low stock inventory alerts
- **Email Templates**: Professional HTML email templates for notifications
- **Customizable Reports**: Date range filtering and detailed breakdowns
- **Revenue Tracking**: Multi-source revenue aggregation and analysis

#### 4.10 Advanced Database Features
- **Row Level Security (RLS)**: Fine-grained access control at database level
- **Database Triggers**: Automated update timestamp management
- **Foreign Key Constraints**: Data integrity enforcement
- **UUID Primary Keys**: Secure and scalable identifier system
- **JSONB Support**: Flexible data storage for device information and metadata
- **Cascading Deletes**: Automatic cleanup of related records
- **Database Policies**: Role-based access control for different user types

#### 4.11 System Monitoring & Maintenance
- **Admin Activity Logging**: Comprehensive audit trail of all admin actions
- **GDPR Compliance**: Data protection and user consent tracking
- **Session Management**: Secure authentication and session handling
- **Maintenance Mode**: Configurable maintenance periods with whitelisted routes
- **System Health Checks**: Database connectivity and service availability monitoring
- **Error Handling**: Comprehensive error reporting and logging
- **Performance Monitoring**: Page load time tracking with visual indicators

## Building and Running

### Prerequisites
- Node.js 22.x
- npm, yarn, pnpm, or bun
- Supabase project with configured environment variables
- Twilio account for WhatsApp integration
- Gmail account with app password for notifications

### Environment Setup
Create a `.env.local` file with the following variables:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_MAINTENANCE_MODE=false

# Email Configuration (Gmail)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# WhatsApp Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=your_twilio_whatsapp_number

# Cron Job Security
CRON_SECRET=your-secure-secret

# Additional environment variables as needed
```

### Development Commands
```bash
# Install dependencies
npm install

# Run development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

### Database Setup
1. Set up a Supabase project
2. Apply the schema from `/database/shcema.sql`
3. Configure Row Level Security (RLS) policies
4. Set up authentication providers as needed
5. Configure database triggers and functions

## Development Conventions

### Code Style
- TypeScript for type safety
- ESLint and Prettier for code formatting
- Component-based architecture
- Server components for data fetching
- Client components for interactivity
- Consistent naming conventions

### File Organization
- Use Next.js App Router conventions
- Organize components by domain/functionality
- Keep server actions in `/app/actions`
- Place reusable utilities in `/lib`
- Separate business logic from UI components

### Internationalization
- Use `next-intl` for translations
- Store translation files in `/messages/[locale].json`
- Use locale prefixes for all routes
- Support RTL layouts for Arabic

### Database Access
- Use Supabase client for database operations
- Implement RLS policies for security
- Use server components for authenticated database access
- Follow the data access patterns in `/lib/supabase`
- Use service role keys for admin operations only

### Authentication
- Supabase Auth for user authentication
- Middleware protection for routes in `/middleware.ts`
- Role-based access control in Supabase database
- Secure session management

### API Design
- RESTful API design principles
- Consistent error handling
- Proper HTTP status codes
- Input validation and sanitization
- Rate limiting where appropriate

## Key Configuration Files

- `next.config.mjs`: Next.js configuration with Sentry integration
- `middleware.ts`: Authentication and internationalization middleware
- `i18n.ts`: Internationalization configuration
- `package.json`: Dependencies and scripts
- `database/shcema.sql`: Database schema definition
- `PLATFORM_FEATURES.md`: Comprehensive feature documentation
- `NOTIFICATIONS.md`: Email notification system documentation
- `WHATSAPP_SETUP.md`: WhatsApp integration setup guide

## API Structure

The API is organized into several domains:
- `/api/customer`: Customer management endpoints
- `/api/admin`: Administrative endpoints with role-based access
- `/api/offers`: Promotional offers management
- `/api/reviews`: Customer reviews
- `/api/qr`: QR code tracking
- `/api/whatsapp`: WhatsApp messaging integration
- `/api/eid`: EID cattle reservation system
- `/api/analytics`: Business intelligence and reporting
- `/api/cron`: Scheduled job endpoints
- `/api/gdpr`: Data protection compliance endpoints

## Testing

The project includes various utility scripts for testing:
- `test_api.js`: API testing utilities
- `seed_api.js`: Data seeding utilities
- Database migration scripts in `/database/migrations`
- Manual testing scripts for specific features

## Deployment

The application is designed for deployment on Vercel:
- Automatic builds via Git integration
- Environment variables configured in Vercel dashboard
- Database connections via Supabase
- Sentry for error monitoring in production
- Cron jobs for automated notifications and reports
- CDN for static assets optimization