import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          const isProd = process.env.NODE_ENV === 'production'
          const host = request.headers.get('host') || ''
          const isRehaulxDomain = host.includes('rehaulx.com')
          
          cookiesToSet.forEach(({ name, value, options }) => {
            const merged: CookieOptions = {
              ...options,
              domain: isProd && isRehaulxDomain ? '.rehaulx.com' : options?.domain,
              sameSite: 'lax',
              secure: isProd,
              path: '/',
            }
            request.cookies.set(name, value)
          })
          
          supabaseResponse = NextResponse.next({
            request,
          })
          
          cookiesToSet.forEach(({ name, value, options }) => {
            const merged: CookieOptions = {
              ...options,
              domain: isProd && isRehaulxDomain ? '.rehaulx.com' : options?.domain,
              sameSite: 'lax',
              secure: isProd,
              path: '/',
            }
            supabaseResponse.cookies.set(name, value, merged)
          })
        },
      },
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        detectSessionInUrl: false,
        persistSession: true,
      },
    }
  )

  // refreshing the auth token
  await supabase.auth.getUser()

  return supabaseResponse
}
