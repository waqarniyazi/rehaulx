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
    const normalizedEmail = email.trim().toLowerCase()
    
    // First try to use the RPC function
    const { data, error } = await supabase.rpc('check_email_exists', {
      email_input: normalizedEmail
    })

    if (error) {
      console.error('RPC check_email_exists failed:', error)
      
      // Fallback: Try to get user by email using admin privileges
      // This won't work from client but might work server-side
      const { data: users, error: listError } = await supabase.auth.admin.listUsers()
      
      if (!listError && users?.users) {
        const userExists = users.users.some(user => 
          user.email?.toLowerCase() === normalizedEmail
        )
        return NextResponse.json({ exists: userExists })
      }
      
      // If all else fails, do a careful sign-in attempt
      // Use a unique dummy password to avoid actual login
      const dummyPassword = `__temp_check_${Date.now()}__`
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: dummyPassword,
      })

      if (signInError) {
        // Check specific error messages
        const errorMsg = signInError.message.toLowerCase()
        
        if (errorMsg.includes('invalid login credentials') || 
            errorMsg.includes('email not confirmed') ||
            errorMsg.includes('too many requests')) {
          // User likely exists but wrong password or email not confirmed
          return NextResponse.json({ exists: true })
        } else if (errorMsg.includes('user not found') || 
                   errorMsg.includes('signup disabled')) {
          // User doesn't exist
          return NextResponse.json({ exists: false })
        }
      }
      
      // Default to user might exist (safer for UX)
      return NextResponse.json({ exists: true })
    }

    return NextResponse.json({ exists: Boolean(data) })
  } catch (error) {
    console.error('Check email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
