-- 1. Drop table if exists to ensure clean slate (OPTIONAL, BE CAREFUL)
-- DROP TABLE IF EXISTS public.agent_knowledge;

-- 2. Create table
CREATE TABLE IF NOT EXISTS public.agent_knowledge (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('general', 'route', 'instruction')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS
ALTER TABLE public.agent_knowledge ENABLE ROW LEVEL SECURITY;

-- 4. Create policies (Drop first to avoid errors if they exist)
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.agent_knowledge;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.agent_knowledge;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.agent_knowledge;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.agent_knowledge;

CREATE POLICY "Enable read access for authenticated users" ON public.agent_knowledge FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.agent_knowledge FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.agent_knowledge FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete for authenticated users" ON public.agent_knowledge FOR DELETE TO authenticated USING (true);

-- 5. Seed Data (Only if empty)
INSERT INTO public.agent_knowledge (title, content, type)
SELECT 'Dashboard Route', '**Dashboard** (/admin): Overview of stats, revenue, and quick actions.', 'route'
WHERE NOT EXISTS (SELECT 1 FROM public.agent_knowledge WHERE title = 'Dashboard Route');

INSERT INTO public.agent_knowledge (title, content, type)
SELECT 'Customers Route', '**Customers** (/admin/customers): List of all registered clients. You can search, view details, and manage points.', 'route'
WHERE NOT EXISTS (SELECT 1 FROM public.agent_knowledge WHERE title = 'Customers Route');

INSERT INTO public.agent_knowledge (title, content, type)
SELECT 'Offers Route', '**Offers** (/admin/offers): Manage loyalty offers. You can create, edit, or delete offers (Percentage or Fixed amount).', 'route'
WHERE NOT EXISTS (SELECT 1 FROM public.agent_knowledge WHERE title = 'Offers Route');

INSERT INTO public.agent_knowledge (title, content, type)
SELECT 'Campaigns Route', '**Campaigns** (/admin/campaigns): Create and manage WhatsApp/Email campaigns. Filter clients by criteria.', 'route'
WHERE NOT EXISTS (SELECT 1 FROM public.agent_knowledge WHERE title = 'Campaigns Route');

INSERT INTO public.agent_knowledge (title, content, type)
SELECT 'Reviews Route', '**Reviews** (/admin/reviews): Moderate user reviews. Approve or delete reviews.', 'route'
WHERE NOT EXISTS (SELECT 1 FROM public.agent_knowledge WHERE title = 'Reviews Route');

INSERT INTO public.agent_knowledge (title, content, type)
SELECT 'Analytics Route', '**Analytics** (/admin/analytics): Detailed charts and reports on revenue and user growth.', 'route'
WHERE NOT EXISTS (SELECT 1 FROM public.agent_knowledge WHERE title = 'Analytics Route');

INSERT INTO public.agent_knowledge (title, content, type)
SELECT 'Settings Route', '**Settings** (/admin/settings): System configuration, profile settings, and business details.', 'route'
WHERE NOT EXISTS (SELECT 1 FROM public.agent_knowledge WHERE title = 'Settings Route');

INSERT INTO public.agent_knowledge (title, content, type)
SELECT 'Board Route', '**Board** (/admin/board): A kanban-style board for managing tasks and notes.', 'route'
WHERE NOT EXISTS (SELECT 1 FROM public.agent_knowledge WHERE title = 'Board Route');

INSERT INTO public.agent_knowledge (title, content, type)
SELECT 'Agent Training Route', '**Agent Training** (/admin/agent-training): Manage the AI agent''s knowledge base. Add, edit, or delete lessons.', 'route'
WHERE NOT EXISTS (SELECT 1 FROM public.agent_knowledge WHERE title = 'Agent Training Route');
