/**
 * Supabase Admin Client
 * 
 * Uses the SERVICE_ROLE_KEY — bypasses RLS.
 * ONLY used server-side. Never expose this key to the client.
 * 
 * Used for:
 *   - File storage operations (upload, delete)
 *   - Admin auth operations (user creation, deletion)
 *   - Privileged data operations that bypass RLS
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { env } from './environment'

let supabaseAdmin: SupabaseClient | null = null

/**
 * Get the Supabase admin client (singleton).
 * Uses the service role key — full database access.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  return supabaseAdmin
}

/**
 * Anon client — for operations that should respect RLS.
 */
export function getSupabaseAnon(): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
}
