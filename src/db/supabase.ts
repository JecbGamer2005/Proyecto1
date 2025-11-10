import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserProfile {
  id: string;
  auth_id: string;
  role: 'admin' | 'employee';
  name: string;
  email: string;
  created_at: string;
  created_by: string | null;
  updated_at: string;
}

export async function createUser(
  email: string,
  password: string,
  name: string,
  role: 'admin' | 'employee'
): Promise<{ user: UserProfile; error: string | null }> {
  try {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      return { user: null as any, error: authError?.message || 'Error creating user' };
    }

    const { data, error } = await supabase.from('user_roles').insert([
      {
        auth_id: authData.user.id,
        role,
        name,
        email,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      },
    ]).select().single();

    if (error) {
      return { user: null as any, error: error.message };
    }

    return { user: data as UserProfile, error: null };
  } catch (error) {
    return { user: null as any, error: (error as Error).message };
  }
}

export async function getAllUsers(): Promise<{ users: UserProfile[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { users: [], error: error.message };
    }

    return { users: (data || []) as UserProfile[], error: null };
  } catch (error) {
    return { users: [], error: (error as Error).message };
  }
}

export async function deleteUser(userId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data: userData, error: fetchError } = await supabase
      .from('user_roles')
      .select('auth_id')
      .eq('id', userId)
      .single();

    if (fetchError || !userData) {
      return { success: false, error: fetchError?.message || 'User not found' };
    }

    const { error: deleteError } = await supabase.auth.admin.deleteUser(userData.auth_id);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateUserPassword(userId: string, newPassword: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data: userData, error: fetchError } = await supabase
      .from('user_roles')
      .select('auth_id')
      .eq('id', userId)
      .single();

    if (fetchError || !userData) {
      return { success: false, error: fetchError?.message || 'User not found' };
    }

    const { error } = await supabase.auth.admin.updateUserById(userData.auth_id, {
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getCurrentUser(): Promise<{ user: UserProfile | null; error: string | null }> {
  try {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return { user: null, error: authError?.message || 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('auth_id', authUser.id)
      .single();

    if (error) {
      return { user: null, error: error.message };
    }

    return { user: data as UserProfile, error: null };
  } catch (error) {
    return { user: null, error: (error as Error).message };
  }
}

export async function isAdmin(): Promise<boolean> {
  const { user } = await getCurrentUser();
  return user?.role === 'admin' || false;
}
