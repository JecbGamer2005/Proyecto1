/*
  # Create admin user with simple credentials
  
  Email: admin@test.com
  Password: Test123
  Role: admin
*/

DO $$
DECLARE
  v_user_id uuid;
BEGIN
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
    'admin@test.com',
    crypt('Test123', gen_salt('bf')),
    now(),
    now(),
    now()
  )
  RETURNING id INTO v_user_id;

  INSERT INTO user_roles (auth_id, role, name, email)
  VALUES (v_user_id, 'admin', 'Admin', 'admin@test.com');
END $$;
