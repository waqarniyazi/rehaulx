'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    company?: string,
    role?: string
  ) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>
  signInWithMagicLink: (email: string) => Promise<void>
  checkEmailExists: (email: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  signInWithOAuth: async () => {},
  signInWithMagicLink: async () => {},
  checkEmailExists: async () => false,
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

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    try {
      setLoading(true)
      
      // Get the proper redirect URL based on environment
      const getRedirectTo = () => {
        if (typeof window !== 'undefined') {
          const { protocol, hostname, port } = window.location
          const baseUrl = `${protocol}//${hostname}${port ? `:${port}` : ''}`
          return `${baseUrl}/auth/callback`
        }
        return process.env.NODE_ENV === 'production' 
          ? 'https://rehaulx.com/auth/callback'
          : 'http://localhost:3000/auth/callback'
      }
      
      const redirectTo = getRedirectTo()
      const providerOptions: any = { redirectTo }
      // Ensure we request proper scopes so we get name and avatar back
      if (provider === 'github') {
        providerOptions.scopes = 'read:user user:email'
      } else if (provider === 'google') {
        providerOptions.queryParams = {
          // default scopes include openid profile email; send explicitly to be safe
          access_type: 'offline',
          prompt: 'consent',
        }
        providerOptions.scopes = 'openid profile email'
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: providerOptions,
      })
      if (error) throw error
      // Redirect handled by Supabase
    } catch (error: any) {
      console.error('OAuth sign in error:', error)
      toast.error('Sign in failed', {
        description: error.message || 'Could not continue with provider.',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signInWithMagicLink = async (email: string) => {
    try {
      setLoading(true)
      
      // Get the proper redirect URL based on environment
      const getRedirectTo = () => {
        if (typeof window !== 'undefined') {
          const { protocol, hostname, port } = window.location
          const baseUrl = `${protocol}//${hostname}${port ? `:${port}` : ''}`
          return `${baseUrl}/auth/callback`
        }
        return process.env.NODE_ENV === 'production' 
          ? 'https://rehaulx.com/auth/callback'
          : 'http://localhost:3000/auth/callback'
      }
      
      const redirectTo = getRedirectTo()
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo },
      })
      if (error) throw error
      toast.success('Check your email', {
        description: 'We sent you a secure sign-in link.',
      })
    } catch (error: any) {
      console.error('Magic link error:', error)
      toast.error('Magic link failed', {
        description: error.message || 'Could not send sign-in link.',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    company?: string,
    role?: string
  ) => {
    try {
      setLoading(true)
      
      // Get the proper redirect URL based on environment
      const getRedirectTo = () => {
        if (typeof window !== 'undefined') {
          const { protocol, hostname, port } = window.location
          const baseUrl = `${protocol}//${hostname}${port ? `:${port}` : ''}`
          return `${baseUrl}/auth/callback`
        }
        return process.env.NODE_ENV === 'production' 
          ? 'https://rehaulx.com/auth/callback'
          : 'http://localhost:3000/auth/callback'
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          // Ensure confirmation links return to the correct origin
          emailRedirectTo: getRedirectTo(),
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            full_name: `${firstName.trim()} ${lastName.trim()}`,
            company: company?.trim() || undefined,
            role: role?.trim() || undefined,
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
      // Get the proper redirect URL based on environment
      const getRedirectTo = () => {
        if (typeof window !== 'undefined') {
          const { protocol, hostname, port } = window.location
          const baseUrl = `${protocol}//${hostname}${port ? `:${port}` : ''}`
          return `${baseUrl}/auth/reset-password`
        }
        return process.env.NODE_ENV === 'production' 
          ? 'https://rehaulx.com/auth/reset-password'
          : 'http://localhost:3000/auth/reset-password'
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: getRedirectTo(),
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

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const { exists, error } = await response.json()
      
      if (error) {
        throw new Error(error)
      }

      return exists
    } catch (error: any) {
      console.error('Check email error:', error)
      // If there's an error, we'll be conservative and assume the email might exist
      // to prevent accidental account creation attempts
      return false
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resetPassword, signInWithOAuth, signInWithMagicLink, checkEmailExists }}>
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
