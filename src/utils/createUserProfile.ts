import { supabase } from '@/integrations/supabase/client'
import type { User } from '@supabase/supabase-js'

export const createUserProfile = async (user: User) => {
  const userData = user.user_metadata || {}
  
  const profileData = {
    user_id: user.id,
    full_name: userData.full_name || user.email?.split('@')[0] || 'User',
    phone: userData.phone || null,
    country: userData.country || 'Singapore',
    occupation: userData.occupation || 'Migrant Worker',
    monthly_income: userData.monthly_income || null,
    financial_goals: userData.financial_goals || []
  }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(profileData, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating/updating profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in createUserProfile:', error)
    return null
  }
}