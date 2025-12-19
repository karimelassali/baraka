-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
  title text NOT NULL,
  message text NOT NULL,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT notifications_pkey PRIMARY KEY (id)
);

-- Add RLS policies if needed (assuming public access for now or handled by middleware)
-- ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
