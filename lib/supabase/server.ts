import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  // Create a server's supabase client with newly configured cookie,
  // which could be used to maintain user's session
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            const isProd = process.env.NODE_ENV === 'production'
            cookiesToSet.forEach(({ name, value, options }) => {
              const merged: CookieOptions = {
                ...options,
                domain: isProd ? '.rehaulx.com' : options?.domain,
                sameSite: 'lax',
                secure: isProd,
                httpOnly: options?.httpOnly ?? true,
                path: '/',
              }
              cookieStore.set(name, value, merged)
            })
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        detectSessionInUrl: false, // Server should not detect URL sessions
        persistSession: true,
      },
    }
  )
}
