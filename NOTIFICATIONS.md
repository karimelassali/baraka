# 📧 Baraka Notification System Documentation

This document outlines the logic, configuration, and calculation methods for the automated email notification system in the Baraka Admin Panel.

## ⚙️ Configuration

The notification system relies on **Nodemailer** for sending emails and **Supabase** for fetching admin users.

### Required Environment Variables
Ensure the following variables are set in your `.env` file:

```env
# Email Provider (Gmail)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Application URL (for links in emails)
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Security for Cron Jobs
CRON_SECRET=your-secure-secret
```

---

## 🔔 Instant Notifications

These emails are triggered immediately when specific actions occur in the system. They are sent to **all users with the `super_admin` role**.

### 1. New Admin Account
*   **Trigger:** When a Super Admin creates a new admin user via the "Admins" page.
*   **Content:** Name, Email, Role, and who created the account.
*   **Logic:** `POST /api/admin/admins`

### 2. Order Status Update
*   **Trigger:** When an order's status is updated to **'confirmed'** or **'completed'**.
*   **Content:** Supplier Name, Total Amount (formatted in EUR), and Internal Notes.
*   **Logic:** `updateOrder` function in `lib/actions/orders.js`

### 3. New Payment Scheduled
*   **Trigger:** When a new payment record is created in the "Payments" section.
*   **Content:** Recipient, Amount, Due Date, Payment Type, and Check Number.
*   **Logic:** `POST /api/admin/payments`

### 4. Inventory: Low Stock Alert
*   **Trigger:** When a product is updated and its `quantity` falls to or below its `minimum_stock_level`.
*   **Content:** Product Name, Current Quantity, Minimum Level, SKU, and Location.
*   **Logic:** `PUT /api/admin/inventory/products/[id]`

### 5. Eid: New Reservation
*   **Trigger:** When a new Eid reservation is created.
*   **Content:** Customer Name, Animal Type, Requested Weight, Deposit Amount, and Pickup Time.
*   **Logic:** `POST /api/admin/eid/reservations`

### 6. Eid: New Deposit
*   **Trigger:** When a payment (deposit) is added to an existing Eid reservation.
*   **Content:** Customer Name, Amount, Payment Method, and Reservation ID.
*   **Logic:** `POST /api/admin/eid/deposits`

### 7. Eid: New Cattle Group
*   **Trigger:** When a new cattle group is created.
*   **Content:** Group Name, Weight, Price, and Total Deposit.
*   **Logic:** `POST /api/admin/eid/cattle`

---

## 📅 Scheduled Reports (Cron Jobs)

These reports are designed to be triggered automatically (e.g., via Vercel Cron) at specific intervals.

### 1. Daily Expiration Report
*   **Endpoint:** `GET /api/cron/expiration-report?secret=YOUR_SECRET`
*   **Frequency:** Daily (e.g., at 08:00 AM)
*   **Logic:**
    *   Scans `inventory_products` for items expiring within the **next 7 days**.
    *   Groups items into: **Expired**, **Today**, **Tomorrow**, and **Soon (7 days)**.
    *   Sends an email only if items are found.

### 2. Weekly Business Digest
*   **Endpoint:** `GET /api/cron/weekly-digest?secret=YOUR_SECRET`
*   **Frequency:** Weekly (e.g., Monday at 09:00 AM)
*   **Logic:** Aggregates data from the **last 7 days**.

#### 📊 Calculation Logic

**A. New Customers**
*   **Source:** `customers` table.
*   **Calculation:** Count of rows where `created_at` is within the last 7 days.

**B. Total Revenue**
The "Entrate Totali" figure is a sum of three distinct revenue streams from the last 7 days:

1.  **Completed Orders:**
    *   Source: `orders` table.
    *   Filter: `status = 'completed'` AND `updated_at` is within last 7 days.
    *   Value: Sum of `total_amount`.

2.  **Payments:**
    *   Source: `payments` table.
    *   Filter: `due_date` is within last 7 days.
    *   Value: Sum of `amount`.

3.  **Eid Deposits:**
    *   Source: `eid_deposits` table.
    *   Filter: `created_at` is within last 7 days.
    *   Value: Sum of `amount`.

**C. Eid Reservations Status**
*   **Source:** `eid_reservations` table (All time, not just last 7 days, to show current standing).
*   **Metrics:**
    *   **Total:** Total count of reservations.
    *   **Pending:** Count where `status = 'PENDING'`.
    *   **Confirmed:** Count where `status = 'CONFIRMED'`.
    *   **Fully Paid:** Count where `is_paid = true`.

**D. Low Stock Alert**
*   **Source:** `inventory_products` table.
*   **Filter:** `is_active = true` AND `quantity <= minimum_stock_level`.
*   **Display:** Lists the top 5 items; shows a count for the rest.

---

## 🛠️ Technical Details

*   **Central Utility:** `lib/email/notifications.js`
    *   Function `notifySuperAdmins({ subject, html, level, useTemplate })` handles fetching super admins and sending the emails.
    *   It supports a standard wrapper template (`useTemplate: true`) or raw HTML (`useTemplate: false`) for custom designs like the Weekly Digest.
*   **Transporter:** `lib/email/transporter.js`
    *   Configures the Nodemailer transport using Gmail SMTP.
