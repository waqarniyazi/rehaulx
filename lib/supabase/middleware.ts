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
          const parentDomain = isProd ? '.rehaulx.com' : undefined
          cookiesToSet.forEach(({ name, value, options }) => {
            const merged: CookieOptions = {
              ...options,
              domain: parentDomain ?? options?.domain,
              sameSite: 'lax',
            }
            request.cookies.set(name, value)
            // create a response placeholder so we can attach cookies with domain
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            const merged: CookieOptions = {
              ...options,
              domain: parentDomain ?? options?.domain,
              sameSite: 'lax',
            }
            supabaseResponse.cookies.set(name, value, merged)
          })
        },
      },
    }
  )

  // refreshing the auth token
  await supabase.auth.getUser()

  return supabaseResponse
}
