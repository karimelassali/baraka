# Platform Features Documentation

This document provides a comprehensive overview of all features implemented in the Baraka platform, ranging from major modules to specific UI/UX details.

## 1. Admin Portal (`/admin`)
The command center for managing the entire business operations, customer relationships, and platform content.

### 1.1 Analytics & Dashboard (`/admin/analytics`)
*   **Comprehensive Dashboard**:
    *   **Key Metrics**: Real-time stats for Total Clients, Revenue (Est.), Active Offers, and Engagement.
    *   **Interactive Charts**:
        *   **Client Growth**: Visual trend of new registrations over time.
        *   **Voucher Status**: Donut chart showing active vs. redeemed vouchers.
        *   **Message Activity**: Bar chart tracking WhatsApp campaign performance.
        *   **Category Distribution**: Pie chart of product inventory distribution.
    *   **Top Lists**:
        *   **Top Loyal Customers**: Leaderboard of customers by points balance.
        *   **Top Countries**: (Planned) Geographic distribution of client base.
*   **Inventory Intelligence**:
    *   **Inventory Alerts**: Dedicated widget highlighting "Low Stock" and "Expiring Soon" items for immediate action.
*   **Activity Monitoring**:
    *   **Recent System Activity**: Live feed of system events (messages, updates).

### 1.2 Customer Management (`/admin/customers`)
*   **Customer Database**:
    *   **List View**: Comprehensive table of all registered customers.
    *   **Search & Filter**: Ability to find customers by name, email, or phone.
*   **CRUD Operations**:
    *   **Add Customer**: Form to manually register new clients.
    *   **Edit Customer**: Interface to update customer details.
    *   **Delete Customer**: Secure deletion with confirmation.
*   **Enhanced Management**:
    *   Advanced filtering and sorting capabilities.
    *   Detailed customer profiles.

### 1.3 Inventory & Product Management (`/admin/inventory`)
*   **Product Catalog**:
    *   **Multi-Step Creation**: Sophisticated wizard for adding new products (Details -> Pricing -> Inventory).
    *   **Product Editing**: Full control over product metadata.
    *   **Stock Tracking**: Monitor quantity levels.
*   **Category Management**:
    *   Create, edit, and delete product categories for organization.
*   **Expiration Management**:
    *   **Batch Tracking**: Monitor expiration dates for specific batches.
    *   **Automated Alerts**: Visual warnings for items nearing expiration.

### 1.4 Marketing & Loyalty
*   **Offer Management (`/admin/offers`)**:
    *   Create promotional offers with specific terms.
    *   Toggle offer visibility (Active/Inactive).
    *   **Badges**: Assign visual badges (e.g., "New", "Hot") to offers.
*   **Points System (`/admin/points`)**:
    *   Manage customer loyalty points.
    *   Manual adjustment of point balances.
*   **Voucher Management (`/admin/vouchers`)**:
    *   Issue new vouchers to customers.
    *   Track voucher redemption status.
    *   **Glassmorphism UI**: Modern card-based layout for voucher details.
*   **WhatsApp Campaigns (`/admin/campaigns`)**:
    *   Create and send bulk WhatsApp messages to customer segments.
    *   **Messaging Logs**: History of all sent messages and their status.

### 1.5 Content Management
*   **Review Moderation (`/admin/reviews`)**:
    *   **Approval Workflow**: Review customer feedback before it goes public.
    *   **Reviewer Identity**: Manage reviewer names and details.
*   **Gallery Management (`/admin/gallery`)**:
    *   **Image Upload**: Drag-and-drop interface for uploading portfolio/event images.
    *   **Gallery Grid**: Visual management of displayed images.
    *   **Delete**: Remove outdated images from the public gallery.

### 1.6 Financial Management (`/admin/revenue`, `/admin/payments`)
*   **Daily Revenue Tracking**:
    *   **Entry Management**: Add and edit daily revenue records by payment method (Cash, Card, Ticket).
    *   **Monthly Archive**: View and manage historical revenue data.
    *   **PDF Export**: Generate professional PDF reports for daily or monthly revenue.
*   **Payments & Checks**:
    *   **Payment Calendar**: Visual calendar view of upcoming payments and check due dates.
    *   **Status Tracking**: Mark payments as Pending, Paid, or Overdue.
    *   **Check Management**: Track check numbers and recipients.

### 1.7 Supply Chain Management (`/admin/order-management`)
*   **Order Management**:
    *   **Supplier Orders**: Create, edit, and track orders to suppliers.
    *   **Draft System**: Save orders as drafts before finalizing.
    *   **PDF Generation**: Auto-generate professional order PDFs to send to suppliers.
*   **Supplier Database**:
    *   Manage supplier contact details and history.

### 1.8 Collaboration & Tools
*   **Admin Board (`/admin/board`)**:
    *   **Shared Workspace**: A collaborative board for admin notes, reminders, and team announcements.
    *   **Rich Media**: Support for pinning notes, adding images, and drawings.
*   **Wishlist Manager (`/admin/wishlist`)**:
    *   **Customer Requests**: View and manage product requests from customers.
    *   **Status Workflow**: Approve or reject requests and notify customers.

### 1.9 System Administration
*   **Admin User Management (`/admin/admins`)**:
    *   **Granular Permissions**: Role-Based Access Control (RBAC) with specific permissions for every module.
    *   **Profile Management**: Admins can update their own credentials and display names.
*   **Agent Training (`/admin/agent-training`)**:
    *   **AI Knowledge Base**: Interface to feed the platform's AI agent with specific business knowledge and instructions.
*   **System Logs (`/admin/logs`)**:
    *   View system-wide activity logs for security and auditing.

---

## 2. Customer Portal (`/dashboard`)
A personalized space for customers to interact with the brand and manage their rewards.

### 2.1 Dashboard Hub
*   **Welcome Overview**: Personalized greeting and summary of account status.
*   **Quick Stats**: At-a-glance view of points and active vouchers.

### 2.2 Loyalty Wallet (`/dashboard/wallet`)
*   **Points Tracker**: Visual display of current loyalty points.
*   **Transaction History**: Record of points earned and spent.

### 2.3 Rewards & Offers
*   **My Vouchers**:
    *   Digital wallet for active and redeemed vouchers.
    *   QR code or unique code display for redemption.
*   **Exclusive Offers**:
    *   Browse available promotions tailored to the user.

### 2.4 Wishlist (`/dashboard/wishlist`)
*   **Make a Wish**: Form for customers to request specific products.
*   **Request Status**: Track the status (Pending, Approved) of their requests.

### 2.5 Profile Settings
*   **Personal Info**: Update name, email, and phone number.
*   **Account Security**: Password management.

---

## 3. Public Landing Page (`/`)
The storefront of the platform, designed for conversion and information.

*   **Hero Section**: High-impact visual introduction with call-to-actions.
*   **About Us**: Brand storytelling section.
*   **Dynamic Gallery**: Grid of images managed via the Admin Gallery module.
*   **Live Offers**: Real-time display of active offers managed by admins.
*   **Customer Reviews**: Social proof section displaying approved reviews.
*   **Contact & Location**: Business information and map.
*   **WhatsApp Integration**: Floating action button for instant communication.

---

## 4. Technical & UI/UX Features
*   **Design System**:
    *   **Glassmorphism**: Extensive use of translucent, blurred backgrounds (`GlassCard`) for a modern, premium feel.
    *   **Animations**: `Framer Motion` integration for smooth page transitions, hover effects, and list entry animations.
    *   **Responsive Layouts**: Fully optimized for Mobile, Tablet, and Desktop.
*   **Internationalization (i18n)**:
    *   **Multi-language Support**: Fully translated into English, Italian, and Arabic.
    *   **RTL Support**: Native Right-to-Left layout support for Arabic users.
*   **Authentication**:
    *   Secure Login/Register flows powered by Supabase Auth.
    *   **Route Guards**: Protected routes ensuring only authorized access to Admin/Dashboard areas based on granular permissions.
*   **Database**:
    *   Real-time data synchronization using Su pabase.
    *   Robust schema handling Users, Products, Reviews, Offers, Transactions, and Admin Logs.
