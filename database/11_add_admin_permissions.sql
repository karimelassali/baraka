-- 11_add_admin_permissions.sql

-- Add permissions column to admin_users
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES admin_users(id);

-- Comment on columns
COMMENT ON COLUMN admin_users.permissions IS 'List of specific permissions granted to the admin';
COMMENT ON COLUMN admin_users.created_by IS 'The admin who created this user';

-- Update existing admins to have full permissions (assuming 'super_admin' role implies full access, but explicit permissions help)
-- For now, we just initialize it as empty array or specific permissions if we knew them.
-- Let's assume existing admins are super admins and give them a special permission or just rely on the role 'admin' being super for now.
-- We'll keep the default as empty array.
