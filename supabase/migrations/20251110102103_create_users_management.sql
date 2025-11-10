/*
  # Create users management system
  
  1. New Tables
    - `user_roles` - Store user roles and metadata
      - `id` (uuid, primary key)
      - `auth_id` (uuid, references auth.users)
      - `role` (text: 'admin' or 'employee')
      - `name` (text)
      - `email` (text)
      - `created_at` (timestamp)
      - `created_by` (uuid, references user_roles)
  
  2. Security
    - Enable RLS on `user_roles` table
    - Only admins can view, create, update, delete users
    - Users can view their own profile
*/

CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES user_roles(id),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all users"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.auth_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Users can view own profile"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (auth_id = auth.uid());

CREATE POLICY "Only admins can create users"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.auth_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update users"
  ON user_roles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.auth_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.auth_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete users"
  ON user_roles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.auth_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE INDEX idx_user_roles_auth_id ON user_roles(auth_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
