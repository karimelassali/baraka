# Quickstart Guide: Customer Loyalty Platform

## Prerequisites
- Node.js 18+ installed
- Git installed
- A Supabase account with project created
- A Vercel account for deployment
- WhatsApp Business Account (with approved templates if using WhatsApp)

## Initial Setup

### 1. Clone and Initialize the Repository
```bash
# Clone the repository
git clone <repository-url>
cd <repository-name>

# Install dependencies
npm install
```

### 2. Configure Supabase
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your Project URL and API keys from the dashboard
3. Create the required database tables using the SQL script in `database/tables.sql`

### 3. Environment Variables
Create a `.env.local` file in the root directory:

```env
# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# WhatsApp Business API (if using)
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id

# SMTP for email confirmations (optional)
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
```

### 4. Run the Development Server
```bash
npm run dev
```

The application will start on `http://localhost:3000`

## Database Setup

### Run the Database Migrations
Execute the SQL scripts in the `database/` folder to create all required tables:

1. Run `database/01_create_tables.sql` to create the base tables
2. Run `database/02_create_rls_policies.sql` to set up Row Level Security
3. Run `database/03_create_functions.sql` to create utility functions

## API Endpoints

### Public Endpoints
- `GET /api/offers` - Get all active offers
- `POST /api/register` - Register a new customer
- `POST /api/login` - Authenticate a customer

### Customer Endpoints
- `GET /api/customer/profile` - Get customer profile
- `PUT /api/customer/profile` - Update customer profile
- `GET /api/customer/points` - Get customer points balance and history
- `GET /api/customer/vouchers` - Get customer vouchers

### Admin Endpoints
- `GET /api/admin/customers` - Get all customers (pagination)
- `PUT /api/admin/customers/:id/points` - Add/deduct points for a customer
- `POST /api/admin/offers` - Create a new offer
- `POST /api/admin/vouchers` - Create a new voucher
- `POST /api/admin/campaigns/send` - Send WhatsApp campaign
- `GET /api/whatsapp/webhook` - Handle WhatsApp delivery confirmations

## Adding a New Language

1. Add the language file to `public/locales/[lang].json` with all required translations
2. Update the language selector component in `components/i18n/LanguageSelector.jsx`
3. Make sure all pages properly handle the new language

## Creating an Admin Account

1. You need to manually create an admin user in Supabase Auth
2. Add a record to the `admin_users` table with the auth user ID
3. Set the role to "admin" in the database record

## Multi-language Setup

The application uses `next-intl` for internationalization. Language files are stored in `public/locales/` with the following structure:

```json
{
  "common": {
    "home": "Home",
    "about": "About",
    "contact": "Contact"
  },
  "auth": {
    "login": "Login",
    "register": "Register"
  }
}
```

## WhatsApp Business API Integration

1. Set up a WhatsApp Business Account with Meta
2. Get approval for required message templates
3. Configure the webhook endpoint `/api/whatsapp/webhook` in your WhatsApp dashboard
4. Store the access token and phone number ID in environment variables

## Testing

Run the test suite:
```bash
npm test
```

For end-to-end tests:
```bash
npm run test:e2e
```

## Deployment

### Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Set the environment variables in the Vercel dashboard
3. The site will be deployed automatically on push to main branch

### Supabase Configuration
- Ensure your production Supabase instance has the same schema as development
- Set up Row Level Security policies in production
- Configure any Edge Functions if used

## GDPR Compliance

The system includes endpoints for:
- Data export: `POST /api/gdpr/export` - Exports customer data
- Data deletion: `POST /api/gdpr/delete` - Anonymizes customer data
- These endpoints are accessible only to authenticated users and create logs in the gdpr_log table

## Troubleshooting

### Common Issues:
1. **Supabase Authentication**: Ensure the anon key is in `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. **Database Connection**: Verify your Supabase URL and service role key are correct
3. **Multi-language**: Check that language files are properly formatted and complete
4. **WhatsApp API**: Ensure you're using approved templates and have proper permissions

### Development Tips:
- Use the Supabase local development CLI for local database work: `supabase start`
- Enable Supabase Realtime for live updates of points and other data
- Check the Supabase logs for any authentication or database errors