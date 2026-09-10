import { supabase } from './supabase';

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function subscribeAuth(callback) {
  // Fire once immediately with current session, then on every change
  supabase.auth.getSession().then(({ data }) => callback(data.session?.user ?? null));
  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return () => listener.subscription.unsubscribe();
}

// Returns 'super_admin' | 'hr' | 'content' | null (null = authenticated but no role row yet,
// which the setup guide treats as super_admin for the first account)
export async function getAdminRole(userId) {
  const { data, error } = await supabase.from('admin_roles').select('role').eq('user_id', userId).single();
  if (error) return null;
  return data?.role ?? null;
}
