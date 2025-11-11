# Data Model: Customer Loyalty Platform

## Entity: Customer
**Description**: Represents a registered customer with personal information and account status

**Fields**:
- `id` (UUID, Primary Key) - Unique identifier for the customer
- `auth_id` (UUID) - Reference to Supabase Auth user ID
- `first_name` (TEXT, NOT NULL) - Customer's first name
- `last_name` (TEXT, NOT NULL) - Customer's last name
- `date_of_birth` (DATE) - Customer's date of birth
- `residence` (TEXT) - Customer's place of residence
- `phone_number` (TEXT) - Customer's phone number
- `email` (TEXT, NOT NULL, UNIQUE) - Customer's email address
- `country_of_origin` (TEXT) - Customer's country of origin
- `created_at` (TIMESTAMPTZ, DEFAULT NOW()) - Account creation timestamp
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW()) - Last update timestamp
- `gdpr_consent` (BOOLEAN, NOT NULL) - GDPR consent status
- `gdpr_consent_at` (TIMESTAMPTZ, NOT NULL) - GDPR consent timestamp
- `is_active` (BOOLEAN, DEFAULT TRUE) - Account active status
- `language_preference` (TEXT, DEFAULT 'en') - Preferred language code (IT, EN, FR, ES, AR)

**Validation Rules**:
- Email must be unique and valid format
- GDPR consent must be explicitly given (true)
- First name and last name required
- Phone number format validation (may be optional based on requirements)

## Entity: Loyalty Points
**Description**: Represents points earned by customers through purchases and activities

**Fields**:
- `id` (UUID, Primary Key) - Unique identifier for the points record
- `customer_id` (UUID, Foreign Key) - Reference to the customer
- `points` (INTEGER, NOT NULL) - Number of points (positive for earned, negative for redeemed)
- `transaction_type` (TEXT, NOT NULL) - Type of transaction (EARNED, REDEEMED, ADJUSTED)
- `reference_id` (TEXT) - Reference ID for the transaction (e.g., purchase ID)
- `description` (TEXT) - Description of the transaction
- `points_formula_used` (TEXT) - The formula used for this calculation
- `created_at` (TIMESTAMPTZ, DEFAULT NOW()) - Transaction timestamp
- `admin_id` (UUID, Foreign Key) - ID of admin who created this record (if applicable)

**Validation Rules**:
- Points must be non-zero
- Transaction type must be one of: EARNED, REDEEMED, ADJUSTED
- Customer ID must reference an existing customer

## Entity: Voucher
**Description**: Represents redeemable value vouchers created from customer loyalty points

**Fields**:
- `id` (UUID, Primary Key) - Unique identifier for the voucher
- `code` (TEXT, NOT NULL, UNIQUE) - Unique voucher code
- `customer_id` (UUID, Foreign Key) - Reference to the customer who owns this voucher
- `points_redeemed` (INTEGER, NOT NULL) - Points used to generate this voucher
- `value` (DECIMAL, NOT NULL) - Monetary value of the voucher
- `currency` (TEXT, NOT NULL, DEFAULT 'EUR') - Currency code
- `is_active` (BOOLEAN, DEFAULT TRUE) - Voucher active status
- `is_used` (BOOLEAN, DEFAULT FALSE) - Whether voucher has been used
- `used_at` (TIMESTAMPTZ) - Timestamp when voucher was used
- `expires_at` (TIMESTAMPTZ, NOT NULL) - Expiration date
- `created_at` (TIMESTAMPTZ, DEFAULT NOW()) - Creation timestamp
- `admin_id` (UUID, Foreign Key) - ID of admin who created this voucher (if applicable)

**Validation Rules**:
- Code must be unique
- Value must be greater than 0
- Expires_at must be in the future
- Points_redeemed must correspond to actual points

## Entity: Offer
**Description**: Represents weekly and permanent offers displayed on the website

**Fields**:
- `id` (UUID, Primary Key) - Unique identifier for the offer
- `title` (JSONB, NOT NULL) - Multilingual title {"en": "English Title", "it": "Titolo Italiano", ...}
- `description` (JSONB) - Multilingual description {"en": "English Description", ...}
- `image_url` (TEXT) - URL to offer image
- `offer_type` (TEXT, NOT NULL) - Type of offer (WEEKLY, PERMANENT)
- `is_active` (BOOLEAN, DEFAULT TRUE) - Whether offer is currently visible
- `start_date` (DATE) - When offer becomes visible
- `end_date` (DATE) - When offer expires
- `created_at` (TIMESTAMPTZ, DEFAULT NOW()) - Creation timestamp
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW()) - Last update timestamp
- `created_by` (UUID, Foreign Key) - ID of admin who created this offer

**Validation Rules**:
- Title must contain at least the default language
- Offer type must be WEEKLY or PERMANENT
- End date must be after start date (if both specified)

## Entity: Review
**Description**: Represents customer reviews displayed on the website

**Fields**:
- `id` (UUID, Primary Key) - Unique identifier for the review
- `customer_id` (UUID, Foreign Key) - Reference to the customer who wrote the review
- `review_text` (TEXT, NOT NULL) - The review content
- `rating` (INTEGER) - Rating (1-5 stars, optional)
- `is_approved` (BOOLEAN, DEFAULT FALSE) - Whether review is approved for public display
- `is_featured` (BOOLEAN, DEFAULT FALSE) - Whether this is a featured review
- `created_at` (TIMESTAMPTZ, DEFAULT NOW()) - Creation timestamp
- `approved_at` (TIMESTAMPTZ) - Timestamp when review was approved

**Validation Rules**:
- Review text must not be empty
- Rating must be between 1 and 5 if provided

## Entity: Admin User
**Description**: Represents store managers/admins with access to the admin dashboard

**Fields**:
- `id` (UUID, Primary Key) - Unique identifier for the admin
- `auth_id` (UUID) - Reference to Supabase Auth user ID
- `full_name` (TEXT, NOT NULL) - Admin's full name
- `email` (TEXT, NOT NULL, UNIQUE) - Admin's email address
- `role` (TEXT, NOT NULL, DEFAULT 'admin') - Admin role (admin, manager)
- `is_active` (BOOLEAN, DEFAULT TRUE) - Whether admin account is active
- `created_at` (TIMESTAMPTZ, DEFAULT NOW()) - Account creation timestamp
- `last_login_at` (TIMESTAMPTZ) - Timestamp of last login

**Validation Rules**:
- Email must be unique and valid
- Role must be one of: admin, manager

## Entity: WhatsApp Message
**Description**: Represents messages sent via WhatsApp Business API

**Fields**:
- `id` (UUID, Primary Key) - Unique identifier for the message
- `customer_id` (UUID, Foreign Key) - Reference to the recipient customer
- `template_name` (TEXT, NOT NULL) - Name of the WhatsApp template used
- `message_type` (TEXT, NOT NULL) - Type of message (BIRTHDAY, PROMOTIONAL, TARGETED)
- `target_audience` (TEXT) - Description of target audience (nationality, points threshold, etc.)
- `message_content` (JSONB) - Content parameters for the template
- `status` (TEXT, DEFAULT 'sent') - Status (sent, delivered, read, failed)
- `sent_at` (TIMESTAMPTZ, DEFAULT NOW()) - When message was sent
- `delivered_at` (TIMESTAMPTZ) - When message was delivered
- `read_at` (TIMESTAMPTZ) - When message was read
- `admin_id` (UUID, Foreign Key) - ID of admin who sent the message

**Validation Rules**:
- Template name must be from approved list
- Status must be one of: sent, delivered, read, failed
- Customer ID must reference an existing customer

## Entity: Settings
**Description**: System-wide settings for the loyalty program

**Fields**:
- `id` (UUID, PRIMARY KEY) - Unique identifier
- `setting_key` (TEXT, NOT NULL, UNIQUE) - Unique key for the setting (e.g., "points_conversion_formula", "default_language")
- `setting_value` (TEXT, NOT NULL) - Value of the setting
- `description` (TEXT) - Description of what this setting controls
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW()) - Last update timestamp
- `updated_by` (UUID, Foreign Key) - ID of admin who last updated this setting

**Validation Rules**:
- Setting key must be unique
- Common settings: points_conversion_formula (e.g., {"rate": 1, "currency": "EUR", "points_per_unit": 1})

## Entity: GDPR Log
**Description**: Log of GDPR-related actions for compliance tracking

**Fields**:
- `id` (UUID, Primary Key) - Unique identifier for the log entry
- `customer_id` (UUID, Foreign Key) - Reference to the affected customer
- `action` (TEXT, NOT NULL) - GDPR action (EXPORT, DELETE, CONSENT_UPDATE)
- `description` (TEXT) - Additional details about the action
- `performed_by` (TEXT) - Who performed the action (user ID or "system")
- `performed_at` (TIMESTAMPTZ, DEFAULT NOW()) - When action was performed
- `data_snapshot` (JSONB) - Snapshot of customer data before action (for export/delete)

**Validation Rules**:
- Action must be one of: EXPORT, DELETE, CONSENT_UPDATE
- Customer ID must reference an existing customer (or be NULL for system operations)

## Relationships:

1. **Customer → Loyalty Points**: One-to-Many (customer can have many points transactions)
2. **Customer → Voucher**: One-to-Many (customer can have many vouchers)
3. **Customer → Review**: One-to-Many (customer can write many reviews)
4. **Customer → WhatsApp Message**: One-to-Many (customer can receive many messages)
5. **Admin User → Offer**: One-to-Many (admin can create many offers)
6. **Admin User → Voucher**: One-to-Many (admin can create many vouchers)
7. **Admin User → Loyalty Points**: One-to-Many (admin can create many points records)

## Views to be Created:

### customer_points_balance
- **Description**: Shows total points balance for each customer
- **Fields**: customer_id, total_points, available_points, pending_points

### approved_reviews
- **Description**: Shows only approved reviews, limited to 20 most recent
- **Fields**: id, customer_name, review_text, rating, created_at
