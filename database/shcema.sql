-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.admin_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  admin_id uuid,
  action text NOT NULL,
  resource text NOT NULL,
  resource_id text,
  details jsonb,
  ip_address text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT admin_logs_pkey PRIMARY KEY (id),
  CONSTRAINT admin_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admin_users(id)
);
CREATE TABLE public.admin_notes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text,
  message text NOT NULL,
  author_id uuid NOT NULL,
  is_pinned boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  images jsonb DEFAULT '[]'::jsonb,
  drawing text,
  links jsonb DEFAULT '[]'::jsonb,
  CONSTRAINT admin_notes_pkey PRIMARY KEY (id),
  CONSTRAINT admin_notes_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.admin_users(id)
);
CREATE TABLE public.admin_users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_id uuid,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'admin'::text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  last_login_at timestamp with time zone,
  permissions jsonb DEFAULT '[]'::jsonb,
  created_by uuid,
  phone numeric,
  CONSTRAINT admin_users_pkey PRIMARY KEY (id),
  CONSTRAINT admin_users_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admin_users(id)
);
CREATE TABLE public.agent_knowledge (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['general'::text, 'route'::text, 'instruction'::text])),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT agent_knowledge_pkey PRIMARY KEY (id)
);
CREATE TABLE public.customers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_id uuid,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date,
  residence text,
  phone_number text,
  email text NOT NULL UNIQUE,
  country_of_origin text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  gdpr_consent boolean NOT NULL,
  gdpr_consent_at timestamp with time zone NOT NULL,
  is_active boolean DEFAULT true,
  language_preference text DEFAULT 'en'::text,
  CONSTRAINT customers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.daily_revenue (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  total_revenue numeric NOT NULL DEFAULT 0,
  cash numeric NOT NULL DEFAULT 0,
  card numeric NOT NULL DEFAULT 0,
  ticket numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  revenue_annule numeric DEFAULT 0,
  CONSTRAINT daily_revenue_pkey PRIMARY KEY (id)
);
CREATE TABLE public.eid_cattle_groups (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  group_name text NOT NULL,
  cattle_weight numeric,
  total_deposit numeric DEFAULT 0,
  status text DEFAULT 'PENDING'::text CHECK (status = ANY (ARRAY['PENDING'::text, 'PAID'::text, 'COMPLETED'::text, 'CANCELLED'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  price numeric,
  CONSTRAINT eid_cattle_groups_pkey PRIMARY KEY (id)
);
CREATE TABLE public.eid_cattle_members (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  group_id uuid NOT NULL,
  customer_id uuid,
  member_number integer CHECK (member_number >= 1 AND member_number <= 15),
  role text DEFAULT 'MEMBER'::text,
  deposit_amount numeric DEFAULT 0,
  is_paid boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT eid_cattle_members_pkey PRIMARY KEY (id),
  CONSTRAINT eid_cattle_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.eid_cattle_groups(id),
  CONSTRAINT eid_cattle_members_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id)
);
CREATE TABLE public.eid_deposits (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  reservation_id uuid NOT NULL,
  amount numeric NOT NULL,
  payment_method text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  CONSTRAINT eid_deposits_pkey PRIMARY KEY (id),
  CONSTRAINT eid_deposits_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.eid_reservations(id)
);
CREATE TABLE public.eid_destinations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  location text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT eid_destinations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.eid_purchase_batches (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  supplier_id uuid,
  batch_number text NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  is_pinned boolean DEFAULT false,
  CONSTRAINT eid_purchase_batches_pkey PRIMARY KEY (id),
  CONSTRAINT eid_purchase_batches_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.eid_suppliers(id)
);
CREATE TABLE public.eid_purchases (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  tag_number text NOT NULL UNIQUE,
  tag_color text,
  weight numeric NOT NULL,
  animal_type text NOT NULL CHECK (animal_type = ANY (ARRAY['SHEEP'::text, 'GOAT'::text, 'CATTLE'::text])),
  purchase_price numeric,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  supplier text,
  batch_id uuid,
  destination text,
  CONSTRAINT eid_purchases_pkey PRIMARY KEY (id),
  CONSTRAINT eid_purchases_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.eid_purchase_batches(id)
);
CREATE TABLE public.eid_reservations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_number integer NOT NULL DEFAULT nextval('eid_reservations_order_number_seq'::regclass),
  customer_id uuid NOT NULL,
  animal_type text NOT NULL CHECK (animal_type = ANY (ARRAY['SHEEP'::text, 'GOAT'::text])),
  requested_weight text NOT NULL,
  pickup_time text,
  notes text,
  final_weight numeric,
  tag_number text,
  is_paid boolean DEFAULT false,
  status text DEFAULT 'PENDING'::text CHECK (status = ANY (ARRAY['PENDING'::text, 'CONFIRMED'::text, 'COLLECTED'::text, 'CANCELLED'::text])),
  collected_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  final_price numeric,
  destination text,
  CONSTRAINT eid_reservations_pkey PRIMARY KEY (id),
  CONSTRAINT eid_reservations_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id)
);
CREATE TABLE public.eid_suppliers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  contact_info text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT eid_suppliers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.gallery (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  category text DEFAULT 'general'::text,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  CONSTRAINT gallery_pkey PRIMARY KEY (id)
);
CREATE TABLE public.gdpr_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  customer_id uuid,
  action text NOT NULL,
  description text,
  performed_by text,
  performed_at timestamp with time zone DEFAULT now(),
  data_snapshot jsonb,
  CONSTRAINT gdpr_logs_pkey PRIMARY KEY (id),
  CONSTRAINT gdpr_logs_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id)
);
CREATE TABLE public.inventory_products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_id uuid,
  name text NOT NULL,
  description text,
  quantity numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'pcs'::text,
  minimum_stock_level numeric DEFAULT 0,
  purchase_price numeric,
  selling_price numeric,
  currency text DEFAULT 'EUR'::text,
  supplier_name text,
  supplier_contact text,
  sku text,
  barcode text,
  location_in_shop text,
  expiration_date date NOT NULL,
  batch_number text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  CONSTRAINT inventory_products_pkey PRIMARY KEY (id),
  CONSTRAINT inventory_products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.product_categories(id),
  CONSTRAINT inventory_products_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admin_users(id),
  CONSTRAINT inventory_products_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.admin_users(id)
);
CREATE TABLE public.loyalty_points (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  customer_id uuid,
  points integer NOT NULL,
  transaction_type text NOT NULL,
  reference_id text,
  description text,
  points_formula_used text,
  created_at timestamp with time zone DEFAULT now(),
  admin_id uuid,
  CONSTRAINT loyalty_points_pkey PRIMARY KEY (id),
  CONSTRAINT loyalty_points_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id)
);
CREATE TABLE public.offer_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name jsonb NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT offer_categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.offers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title jsonb NOT NULL,
  description jsonb,
  image_url text,
  offer_type text NOT NULL,
  is_active boolean DEFAULT true,
  start_date date,
  end_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  badge_text text,
  category_id uuid,
  is_popup boolean DEFAULT false,
  CONSTRAINT offers_pkey PRIMARY KEY (id),
  CONSTRAINT offers_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.offer_categories(id)
);
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_number integer NOT NULL DEFAULT nextval('orders_order_number_seq'::regclass),
  supplier_id uuid,
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'completed'::text])),
  internal_note text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id)
);
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  due_date date NOT NULL,
  recipient text NOT NULL,
  amount numeric NOT NULL,
  payment_type text NOT NULL,
  check_number text,
  status text DEFAULT 'Pending'::text CHECK (status = ANY (ARRAY['Pending'::text, 'Paid'::text])),
  notes text,
  paid_at timestamp with time zone,
  paid_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_paid_by_fkey FOREIGN KEY (paid_by) REFERENCES auth.users(id)
);
CREATE TABLE public.product_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  color text DEFAULT '#8B5CF6'::text,
  icon text DEFAULT 'package'::text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  CONSTRAINT product_categories_pkey PRIMARY KEY (id),
  CONSTRAINT product_categories_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admin_users(id),
  CONSTRAINT product_categories_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.admin_users(id)
);
CREATE TABLE public.qr_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  target_url text NOT NULL DEFAULT '/'::text,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  image_url text,
  CONSTRAINT qr_codes_pkey PRIMARY KEY (id),
  CONSTRAINT qr_codes_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.qr_scans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  qr_code_id uuid,
  scanned_at timestamp with time zone DEFAULT now(),
  ip_address text,
  user_agent text,
  device_info jsonb,
  CONSTRAINT qr_scans_pkey PRIMARY KEY (id),
  CONSTRAINT qr_scans_qr_code_id_fkey FOREIGN KEY (qr_code_id) REFERENCES public.qr_codes(id)
);
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  customer_id uuid,
  review_text text NOT NULL,
  rating integer,
  is_approved boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  approved_at timestamp with time zone,
  reviewer_name text,
  approved text,
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id)
);
CREATE TABLE public.settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value text NOT NULL,
  description text,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid,
  CONSTRAINT settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.suppliers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  email text,
  phone text,
  vat_number text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT suppliers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.system_settings (
  key text NOT NULL,
  value jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT system_settings_pkey PRIMARY KEY (key)
);
CREATE TABLE public.vouchers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  customer_id uuid,
  points_redeemed integer NOT NULL,
  value numeric NOT NULL,
  currency text NOT NULL DEFAULT 'EUR'::text,
  is_active boolean DEFAULT true,
  is_used boolean DEFAULT false,
  used_at timestamp with time zone,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  admin_id uuid,
  description text,
  CONSTRAINT vouchers_pkey PRIMARY KEY (id),
  CONSTRAINT vouchers_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id)
);
CREATE TABLE public.waitlist (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone_number text NOT NULL UNIQUE,
  email text,
  country text NOT NULL,
  city text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  CONSTRAINT waitlist_pkey PRIMARY KEY (id)
);
CREATE TABLE public.whatsapp_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  customer_id uuid,
  template_name text NOT NULL,
  message_type text NOT NULL,
  target_audience text,
  message_content jsonb,
  status text DEFAULT 'sent'::text,
  sent_at timestamp with time zone DEFAULT now(),
  delivered_at timestamp with time zone,
  read_at timestamp with time zone,
  admin_id uuid,
  error_message text,
  CONSTRAINT whatsapp_messages_pkey PRIMARY KEY (id),
  CONSTRAINT whatsapp_messages_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id)
);
CREATE TABLE public.wishlists (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  product_name text NOT NULL,
  description text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT wishlists_pkey PRIMARY KEY (id),
  CONSTRAINT wishlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);