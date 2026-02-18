-- Add admin role to existing enum
ALTER TYPE professional_role ADD VALUE IF NOT EXISTS 'admin';