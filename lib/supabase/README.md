# Supabase Database Configuration

This directory contains the database schema and migration scripts for the Customer Loyalty Platform.

## Files

- `schema.sql` - The SQL schema definition for all tables, views, and relationships
- `migrate.js` - JavaScript migration runner that applies the schema to the database
- `database.js` - Utility functions for creating Supabase client instances

## Database Schema Overview

The database includes the following main entities:

- **Customers**: User accounts with personal information and preferences
- **Loyalty Points**: Points tracking system for rewards
- **Vouchers**: Redeemable value vouchers
- **Offers**: Weekly and permanent offers
- **Reviews**: Customer reviews of the service
- **Admin Users**: Administrative accounts
- **WhatsApp Messages**: Tracking for WhatsApp Business API messages
- **Settings**: System-wide configuration values
- **GDPR Logs**: Compliance logging for GDPR requirements

## Views

- `customer_points_balance` - Shows total points balance for each customer
- `approved_reviews` - Shows only approved reviews, limited to 20 most recent

## Running Migrations

To apply the schema to your Supabase database:

```bash
node lib/supabase/migrate.js
```

**Note**: This requires the `DATABASE_URL` environment variable to be set with direct database access credentials.