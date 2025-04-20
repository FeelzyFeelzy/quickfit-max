'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const redirect = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user

      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('goal')
        .eq('id', user.id)
        .single()

      if (error || !profile || !profile.goal) {
        router.push('/onboarding') // User hasn't completed onboarding
      } else {
        router.push('/dashboard') // User is fully set up
      }
    }

    redirect()
  }, [])

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500 text-sm">Redirecting...</p>
    </div>
  )
}
