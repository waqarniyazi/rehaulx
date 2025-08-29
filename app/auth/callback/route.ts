import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const redirect = searchParams.get('redirect')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // After successful OAuth, normalize and persist basic profile fields into user metadata
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const md: Record<string, any> = (user.user_metadata as any) || {}
          const identities = (user as any).identities as Array<any> | undefined
          const idData = identities?.[0]?.identity_data || {}
          // Common identity_data keys across providers
          // Google: name, picture, email, given_name, family_name
          // GitHub: name, avatar_url, email, user_name/login
          // Fallbacks from common provider payloads
          // Google tends to send: name, picture
          // GitHub tends to send: user_name/login, name, avatar_url
          let fullName: string | undefined = md.full_name || md.name || idData.name
          let firstName: string | undefined = md.first_name || idData.given_name
          let lastName: string | undefined = md.last_name || idData.family_name
          let avatarUrl: string | undefined = md.avatar_url || md.picture || md.avatar || idData.avatar_url || idData.picture

          // If full name missing but name present, use it
          if (!fullName && typeof md.name === 'string') fullName = md.name
          if (!fullName && typeof idData.name === 'string') fullName = idData.name

          // Derive first/last from full name if needed
          if ((!firstName || !lastName) && typeof fullName === 'string' && fullName.trim().length > 0) {
            const parts = fullName.trim().split(/\s+/)
            if (!firstName) firstName = parts[0]
            if (!lastName) lastName = parts.slice(1).join(' ')
          }

          // If avatar missing, try other common keys
          if (!avatarUrl && typeof (md as any).avatar_url === 'string') avatarUrl = (md as any).avatar_url
          if (!avatarUrl && typeof (md as any).picture === 'string') avatarUrl = (md as any).picture
          if (!avatarUrl && typeof (idData as any).avatar_url === 'string') avatarUrl = (idData as any).avatar_url
          if (!avatarUrl && typeof (idData as any).picture === 'string') avatarUrl = (idData as any).picture

          // Prepare updates only for fields that are missing
          const updates: Record<string, string> = {}
          if (fullName && !md.full_name) updates.full_name = fullName
          if (firstName && !md.first_name) updates.first_name = firstName
          if (typeof lastName === 'string' && lastName.length > 0 && !md.last_name) updates.last_name = lastName
          if (avatarUrl && !md.avatar_url) updates.avatar_url = avatarUrl
          if (user.email && !md.email) updates.email = user.email

          if (Object.keys(updates).length > 0) {
            await supabase.auth.updateUser({ data: updates })
          }
        }
      } catch (e) {
        console.error('OAuth profile mapping failed:', e)
        // Non-fatal: continue redirect
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      // Determine the correct base URL
      let baseUrl = origin
      if (!isLocalEnv && forwardedHost) {
        baseUrl = `https://${forwardedHost}`
      } else if (!isLocalEnv && !baseUrl.includes('localhost')) {
        // Production fallback
        baseUrl = 'https://rehaulx.com'
      }

      // If explicit redirect to repurpose, send there on the correct host
      if (redirect === '/repurpose') {
        return NextResponse.redirect(`${baseUrl}/repurpose`)
      }

      // Redirect to the intended destination
      const redirectUrl = `${baseUrl}${next}`
      console.log('Auth callback redirecting to:', redirectUrl)
      return NextResponse.redirect(redirectUrl)
    } else {
      console.error('Auth callback error:', error)
    }
  }

  // return the user to an error page with instructions
  const errorUrl = `${origin}/auth/auth-code-error`
  return NextResponse.redirect(errorUrl)
}
