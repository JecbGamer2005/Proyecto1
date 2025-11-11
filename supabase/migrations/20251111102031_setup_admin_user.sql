/*
  # Setup initial admin user
  
  Creates an admin user account for El Paradero system
  Email: admin@elparadero.com
  Password: AdminParadero2024!
*/

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Create the auth user if it doesn't exist
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@elparadero.com',
    crypt('AdminParadero2024!', gen_salt('bf')),
    now(),
    now(),
    now()
  )
  RETURNING id INTO v_user_id;

  -- Insert into user_roles table
  INSERT INTO user_roles (auth_id, role, name, email)
  VALUES (v_user_id, 'admin', 'Administrador El Paradero', 'admin@elparadero.com')
  ON CONFLICT (auth_id) DO NOTHING;
END $$;
