# API Contracts: Customer Loyalty Platform

## Customer Registration API

### POST /api/register
**Description**: Register a new customer and create their profile

**Request**:
```
Content-Type: application/json
{
  "first_name": "string (required)",
  "last_name": "string (required)",
  "date_of_birth": "date (optional)",
  "residence": "string (optional)",
  "phone_number": "string (optional)",
  "email": "string (required, valid email format)",
  "country_of_origin": "string (optional)",
  "gdpr_consent": "boolean (required, must be true)",
  "password": "string (required, min 8 chars)"
}
```

**Responses**:
- 201 Created: `{ "success": true, "message": "Registration successful", "user_id": "uuid" }`
- 400 Bad Request: `{ "error": "Validation error", "details": ["field-specific errors"] }`
- 409 Conflict: `{ "error": "Email already exists" }`
- 422 Unprocessable Entity: `{ "error": "GDPR consent is required" }`

**Authentication**: None (public endpoint)

---

## Authentication APIs

### POST /api/login
**Description**: Authenticate a customer

**Request**:
```
Content-Type: application/json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Responses**:
- 200 OK: `{ "success": true, "session": { "access_token": "string", "user": { "id": "uuid", "email": "string" } } }`
- 401 Unauthorized: `{ "error": "Invalid credentials" }`

### POST /api/logout
**Description**: Logout customer

**Request**:
```
Authorization: Bearer {access_token}
```

**Responses**:
- 200 OK: `{ "success": true, "message": "Logged out successfully" }`
- 401 Unauthorized: `{ "error": "Not authenticated" }`

---

## Customer Profile APIs

### GET /api/customer/profile
**Description**: Get customer profile information

**Request**:
```
Authorization: Bearer {access_token}
```

**Responses**:
- 200 OK: `{ "id": "uuid", "first_name": "string", "last_name": "string", "date_of_birth": "date", "residence": "string", "phone_number": "string", "email": "string", "country_of_origin": "string", "created_at": "timestamp", "language_preference": "string" }`
- 401 Unauthorized: `{ "error": "Not authenticated" }`
- 403 Forbidden: `{ "error": "Not authorized to access this profile" }`

### PUT /api/customer/profile
**Description**: Update customer profile information

**Request**:
```
Authorization: Bearer {access_token}
Content-Type: application/json
{
  "first_name": "string (optional)",
  "last_name": "string (optional)",
  "date_of_birth": "date (optional)",
  "residence": "string (optional)",
  "phone_number": "string (optional)",
  "country_of_origin": "string (optional)",
  "language_preference": "string (optional)"
}
```

**Responses**:
- 200 OK: `{ "success": true, "message": "Profile updated successfully" }`
- 400 Bad Request: `{ "error": "Validation error" }`
- 401 Unauthorized: `{ "error": "Not authenticated" }`
- 403 Forbidden: `{ "error": "Not authorized to update this profile" }`

---

## Loyalty Points APIs

### GET /api/customer/points
**Description**: Get customer's loyalty points balance and history

**Request**:
```
Authorization: Bearer {access_token}
```

**Responses**:
- 200 OK: 
```
{
  "total_points": 1250,
  "available_points": 1000,
  "pending_points": 250,
  "points_history": [
    {
      "id": "uuid",
      "points": 100,
      "transaction_type": "EARNED|REDEEMED|ADJUSTED",
      "description": "string",
      "reference_id": "string",
      "created_at": "timestamp"
    }
  ]
}
```
- 401 Unauthorized: `{ "error": "Not authenticated" }`
- 403 Forbidden: `{ "error": "Not authorized to access this data" }`

---

## Voucher APIs

### GET /api/customer/vouchers
**Description**: Get customer's available vouchers

**Request**:
```
Authorization: Bearer {access_token}
```

**Responses**:
- 200 OK:
```
{
  "vouchers": [
    {
      "id": "uuid",
      "code": "string",
      "value": "decimal",
      "currency": "string",
      "is_active": true,
      "is_used": false,
      "expires_at": "timestamp",
      "created_at": "timestamp"
    }
  ]
}
```
- 401 Unauthorized: `{ "error": "Not authenticated" }`

---

## Public Offers API

### GET /api/offers
**Description**: Get all active offers (for public display)

**Request**: No authentication required

**Query Parameters**:
- `locale` (string, optional): Language code for translations (default: en)
- `type` (string, optional): Offer type (WEEKLY, PERMANENT)

**Responses**:
- 200 OK:
```
{
  "offers": [
    {
      "id": "uuid",
      "title": "string (in requested locale)",
      "description": "string (in requested locale)",
      "image_url": "string (optional)",
      "offer_type": "WEEKLY|PERMANENT",
      "start_date": "date (optional)",
      "end_date": "date (optional)",
      "created_at": "timestamp"
    }
  ]
}
```

---

## Admin APIs

### GET /api/admin/customers
**Description**: Get all customers with filtering and pagination

**Request**:
```
Authorization: Bearer {admin_access_token}
```

**Query Parameters**:
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `search` (string, optional): Search term for name, email
- `sort_by` (string, optional): Field to sort by (name, email, created_at)
- `sort_order` (string, optional): Sort order (asc, desc)
- `country_of_origin` (string, optional): Filter by country of origin
- `residence` (string, optional): Filter by residence

**Responses**:
- 200 OK:
```
{
  "customers": [
    {
      "id": "uuid",
      "first_name": "string",
      "last_name": "string",
      "email": "string",
      "country_of_origin": "string",
      "residence": "string",
      "created_at": "timestamp",
      "total_points": 1250
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```
- 401 Unauthorized: `{ "error": "Not authenticated" }`
- 403 Forbidden: `{ "error": "Admin access required" }`

### PUT /api/admin/customers/:id/points
**Description**: Add or deduct points for a customer

**Request**:
```
Authorization: Bearer {admin_access_token}
Content-Type: application/json
{
  "points": "integer (positive to add, negative to deduct)",
  "reason": "string (reason for the adjustment)",
  "reference_id": "string (optional reference, like purchase ID)"
}
```

**Responses**:
- 200 OK: `{ "success": true, "message": "Points updated successfully", "new_balance": 1500 }`
- 400 Bad Request: `{ "error": "Invalid points value" }`
- 401 Unauthorized: `{ "error": "Not authenticated" }`
- 403 Forbidden: `{ "error": "Admin access required" }`
- 404 Not Found: `{ "error": "Customer not found" }`

### POST /api/admin/offers
**Description**: Create a new offer

**Request**:
```
Authorization: Bearer {admin_access_token}
Content-Type: application/json
{
  "title": {
    "en": "English title",
    "it": "Titolo in italiano",
    "fr": "Titre en français",
    "es": "Título en español",
    "ar": "العنوان بالعربية"
  },
  "description": {
    "en": "English description",
    "it": "Descrizione in italiano",
    "fr": "Description en français",
    "es": "Descripción en español",
    "ar": "الوصف بالعربية"
  },
  "image_url": "string (optional)",
  "offer_type": "WEEKLY|PERMANENT",
  "is_active": "boolean (default: true)",
  "start_date": "date (optional)",
  "end_date": "date (optional)"
}
```

**Responses**:
- 201 Created: `{ "success": true, "message": "Offer created successfully", "offer_id": "uuid" }`
- 400 Bad Request: `{ "error": "Validation error" }`
- 401 Unauthorized: `{ "error": "Not authenticated" }`
- 403 Forbidden: `{ "error": "Admin access required" }`

### POST /api/admin/vouchers
**Description**: Create a new voucher from customer points

**Request**:
```
Authorization: Bearer {admin_access_token}
Content-Type: application/json
{
  "customer_id": "uuid (customer to create voucher for)",
  "points_to_convert": "integer (points to convert to voucher value)",
  "voucher_value": "decimal (monetary value of voucher)",
  "expires_at": "timestamp (when voucher expires)"
}
```

**Responses**:
- 201 Created: `{ "success": true, "message": "Voucher created successfully", "voucher_code": "string" }`
- 400 Bad Request: `{ "error": "Invalid points or conversion value" }`
- 401 Unauthorized: `{ "error": "Not authenticated" }`
- 403 Forbidden: `{ "error": "Admin access required" }`
- 404 Not Found: `{ "error": "Customer not found" }`

---

## WhatsApp Campaign API

### POST /api/admin/campaigns/send
**Description**: Send a WhatsApp message campaign to selected customers

**Request**:
```
Authorization: Bearer {admin_access_token}
Content-Type: application/json
{
  "template_name": "string (approved WhatsApp template name)",
  "customer_filters": {
    "country_of_origin": ["string", "..."] (optional, list of countries),
    "min_points": "integer (optional, min points threshold)",
    "max_points": "integer (optional, max points threshold)",
    "customer_ids": ["uuid", "..."] (optional, specific customer IDs)
  },
  "message_params": {
    "param1": "string",
    "param2": "string"
  },
  "message_type": "BIRTHDAY|PROMOTIONAL|TARGETED"
}
```

**Responses**:
- 200 OK: `{ "success": true, "message": "Campaign sent successfully", "sent_count": 120, "failed_count": 5 }`
- 400 Bad Request: `{ "error": "Invalid template or parameters" }`
- 401 Unauthorized: `{ "error": "Not authenticated" }`
- 403 Forbidden: `{ "error": "Admin access required" }`

### POST /api/whatsapp/webhook
**Description**: Webhook receiver for WhatsApp message status updates

**Request**:
```
Content-Type: application/json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "string (account ID)",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "string",
              "phone_number_id": "string"
            },
            "statuses": [
              {
                "id": "string (message ID)",
                "status": "sent|delivered|read|failed",
                "timestamp": "string (unix timestamp)",
                "recipient_id": "string (customer phone number)"
              }
            ]
          },
          "field": "message_status"
        }
      ]
    }
  ]
}
```

**Responses**:
- 200 OK: `{ "success": true }`
- 400 Bad Request: `{ "error": "Invalid webhook data" }`

---

## GDPR Compliance APIs

### POST /api/gdpr/export
**Description**: Export customer data as per GDPR requirements

**Request**:
```
Authorization: Bearer {access_token}
```

**Responses**:
- 200 OK: JSON object containing all customer data
- 401 Unauthorized: `{ "error": "Not authenticated" }`
- 404 Not Found: `{ "error": "Customer data not found" }`

### POST /api/gdpr/delete
**Description**: Delete/Anonymize customer data as per GDPR requirements

**Request**:
```
Authorization: Bearer {access_token}
```

**Responses**:
- 200 OK: `{ "success": true, "message": "Customer data anonymized successfully" }`
- 401 Unauthorized: `{ "error": "Not authenticated" }`
- 404 Not Found: `{ "error": "Customer not found" }`