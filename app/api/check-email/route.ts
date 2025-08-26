import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Query the auth.users table to check if email exists
    const { data, error } = await supabase.rpc('check_email_exists', {
      email_input: email.trim().toLowerCase()
    })

    if (error) {
      console.error('Error checking email:', error)
      // If RPC doesn't exist, fall back to a sign-in attempt approach
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: '__dummy_password_check__',
      })

      // If error message indicates user doesn't exist
      if (signInError?.message?.includes('Invalid login credentials')) {
        // This could mean either wrong password OR user doesn't exist
        // For better UX, we'll assume user might exist
        return NextResponse.json({ exists: true })
      }
      
      return NextResponse.json({ exists: false })
    }

    return NextResponse.json({ exists: data })
  } catch (error) {
    console.error('Check email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
