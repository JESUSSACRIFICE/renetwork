-- Add admin role to existing enum (must be in separate transaction)
ALTER TYPE professional_role ADD VALUE IF NOT EXISTS 'admin';