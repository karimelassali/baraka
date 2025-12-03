-- Create agent_knowledge table
CREATE TABLE IF NOT EXISTS public.agent_knowledge (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('general', 'route', 'instruction')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.agent_knowledge ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON public.agent_knowledge
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.agent_knowledge
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON public.agent_knowledge
    FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Enable delete for authenticated users" ON public.agent_knowledge
    FOR DELETE
    TO authenticated
    USING (true);

-- Seed data
INSERT INTO public.agent_knowledge (title, content, type) VALUES
('Dashboard Route', '**Dashboard** (/admin): Overview of stats, revenue, and quick actions.', 'route'),
('Customers Route', '**Customers** (/admin/customers): List of all registered clients. You can search, view details, and manage points.', 'route'),
('Offers Route', '**Offers** (/admin/offers): Manage loyalty offers. You can create, edit, or delete offers (Percentage or Fixed amount).', 'route'),
('Campaigns Route', '**Campaigns** (/admin/campaigns): Create and manage WhatsApp/Email campaigns. Filter clients by criteria.', 'route'),
('Reviews Route', '**Reviews** (/admin/reviews): Moderate user reviews. Approve or delete reviews.', 'route'),
('Analytics Route', '**Analytics** (/admin/analytics): Detailed charts and reports on revenue and user growth.', 'route'),
('Settings Route', '**Settings** (/admin/settings): System configuration, profile settings, and business details.', 'route'),
('Board Route', '**Board** (/admin/board): A kanban-style board for managing tasks and notes.', 'route'),
('Agent Training Route', '**Agent Training** (/admin/agent-training): Manage the AI agent''s knowledge base. Add, edit, or delete lessons.', 'route');
