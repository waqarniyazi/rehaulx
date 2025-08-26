'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
        } else {
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('Error in getSession:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event)
      setUser(session?.user ?? null)
      setLoading(false)

      if (event === 'SIGNED_IN' && session?.user) {
        toast.success('Welcome!', {
          description: `Hello, ${session.user.user_metadata?.first_name || 'Creator'}!`,
        })
      } else if (event === 'SIGNED_OUT') {
        toast.info('Signed out', {
          description: "You've been signed out successfully",
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        throw error
      }
    } catch (error: any) {
      console.error('Sign in error:', error)
      toast.error('Sign in failed', {
        description: error.message || 'Please check your credentials and try again.',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            full_name: `${firstName.trim()} ${lastName.trim()}`,
          },
        },
      })

      if (error) {
        throw error
      }

      // Handle different signup scenarios
      if (data.user && data.session) {
        // User is immediately signed in (autoconfirm enabled)
        toast.success('Welcome!', {
          description: `Account created successfully. Welcome, ${firstName}!`,
        })
      } else if (data.user && !data.session) {
        // User needs email confirmation
        toast.success('Check your email!', {
          description: 'We sent you a confirmation link to complete your signup.',
        })
      } else {
        // Something unexpected happened
        toast.info('Account created', {
          description: 'Your account has been created successfully.',
        })
      }
    } catch (error: any) {
      console.error('Sign up error:', error)
      if (error.message?.includes('already registered')) {
        toast.error('Account already exists', {
          description: 'An account with this email already exists. Try signing in instead.',
        })
      } else {
        toast.error('Sign up failed', {
          description: error.message || 'Please try again.',
        })
      }
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
    } catch (error: any) {
      console.error('Sign out error:', error)
      toast.error('Sign out failed', {
        description: error.message || 'Please try again.',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        throw error
      }

      toast.success('Check your email!', {
        description: 'We sent you a password reset link.',
      })
    } catch (error: any) {
      console.error('Reset password error:', error)
      toast.error('Reset failed', {
        description: error.message || 'Please try again.',
      })
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
