import { updateSession } from "@/lib/supabase/middleware"
import { NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''
  
  // Handle subdomain routing only for specific app subdomains
  if (hostname === 'app.localhost:3000' || hostname === 'app.rehaulx.com') {
    // For app.localhost:3000 or app.rehaulx.com
    // Rewrite to /repurpose path only if accessing root
    if (url.pathname === '/') {
      url.pathname = '/repurpose'
      return NextResponse.rewrite(url)
    }
  }

  // Continue with auth middleware
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
