import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session, AuthError, PostgrestError } from '@supabase/supabase-js'
import { supabase, UserProfile } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signInWithPhone: (phone: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: AuthError | PostgrestError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching profile:', error)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
          }
        }
      })

      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive"
        })
        return { error }
      }

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: data.user.id,
            full_name: fullName,
            phone: phone,
            country: 'Singapore', // Default country
            occupation: 'Migrant Worker', // Default occupation
          })

        if (profileError) {
          console.error('Error creating profile:', profileError)
        }

        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account.",
        })
      }

      return { error: null }
    } catch (error) {
      const authError = error as AuthError
      toast({
        title: "Sign Up Failed",
        description: authError.message || "An unexpected error occurred",
        variant: "destructive"
      })
      return { error: authError }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive"
        })
        return { error }
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      })

      return { error: null }
    } catch (error) {
      const authError = error as AuthError
      toast({
        title: "Sign In Failed",
        description: authError.message || "An unexpected error occurred",
        variant: "destructive"
      })
      return { error: authError }
    }
  }

  const signInWithPhone = async (phone: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone,
      })

      if (error) {
        toast({
          title: "Phone Sign In Failed",
          description: error.message,
          variant: "destructive"
        })
        return { error }
      }

      toast({
        title: "OTP Sent!",
        description: "Please check your phone for the verification code.",
      })

      return { error: null }
    } catch (error) {
      const authError = error as AuthError
      toast({
        title: "Phone Sign In Failed",
        description: authError.message || "An unexpected error occurred",
        variant: "destructive"
      })
      return { error: authError }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        toast({
          title: "Sign Out Failed",
          description: error.message,
          variant: "destructive"
        })
        return
      }

      setUser(null)
      setProfile(null)
      setSession(null)

      // Navigate to home page after sign out
      window.location.href = '/'

      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      })
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        title: "Sign Out Failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: { message: 'No user logged in' } as AuthError }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', user.id)

      if (error) {
        toast({
          title: "Update Failed",
          description: error.message,
          variant: "destructive"
        })
        return { error }
      }

      // Refresh profile data
      await fetchUserProfile(user.id)

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })

      return { error: null }
    } catch (error) {
      const authError = error as AuthError
      toast({
        title: "Update Failed",
        description: authError.message || "An unexpected error occurred",
        variant: "destructive"
      })
      return { error: authError }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        toast({
          title: "Reset Failed",
          description: error.message,
          variant: "destructive"
        })
        return { error }
      }

      toast({
        title: "Reset Email Sent",
        description: "Please check your email for password reset instructions.",
      })

      return { error: null }
    } catch (error) {
      const authError = error as AuthError
      toast({
        title: "Reset Failed",
        description: authError.message || "An unexpected error occurred",
        variant: "destructive"
      })
      return { error: authError }
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signInWithPhone,
    signOut,
    updateProfile,
    resetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
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
