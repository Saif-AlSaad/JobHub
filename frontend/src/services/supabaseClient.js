import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validates whether Supabase environment variables are properly configured
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('[PROJECT_REF]') &&
  !supabaseUrl.includes('your-project')
);

// Instantiate Supabase client with local session persistence and auto-refresh
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Register a user via Supabase Auth with custom user metadata.
 * Triggers verification email dispatch when email confirmation is enabled on Supabase.
 */
export async function signUpWithEmail(email, password, metadata = {}) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Falling back to local backend registration.');
  }

  // Hash-based routing redirect URL for verification confirmation
  const redirectUrl = `${window.location.origin}${window.location.pathname}#/verify-email`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: metadata.full_name || '',
        role: metadata.role || 'JOB_SEEKER',
        company_name: metadata.company_name || '',
      },
      emailRedirectTo: redirectUrl,
    },
  });

  if (error) {
    throw error;
  }

  // If email confirmation is required, session will be null
  const requiresEmailVerification = !data.session;

  return {
    user: data.user,
    session: data.session,
    requiresEmailVerification,
  };
}

/**
 * Log in an existing user with Supabase Auth credentials.
 */
export async function signInWithEmail(email, password) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return {
    user: data.user,
    session: data.session,
  };
}

/**
 * Resend verification email to the user if the initial email expired or was missed.
 */
export async function resendVerificationEmail(email) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  const redirectUrl = `${window.location.origin}${window.location.pathname}#/verify-email`;

  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: redirectUrl,
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Sign out from Supabase Auth session.
 */
export async function signOut() {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Error signing out of Supabase:', e);
    }
  }
}

/**
 * Retrieve current Supabase session.
 */
export async function getSession() {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data?.session || null;
}
