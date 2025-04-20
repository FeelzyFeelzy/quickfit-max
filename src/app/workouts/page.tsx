'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadWorkouts = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user

      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('goal, equipment')
        .eq('id', user.id)
        .single()

      if (error || !data) {
        console.error('Error fetching profile:', error)
        return
      }

      const generated = generateWorkouts(data.goal, data.equipment)
      setWorkouts(generated)
      setLoading(false)
    }

    loadWorkouts()
  }, [])

  const generateWorkouts = (goal: string, equipment: string[]): string[] => {
    const base = {
      'Build Muscle': ['Bench Press', 'Deadlifts', 'Pull-Ups'],
      'Burn Fat': ['Burpees', 'Jump Rope', 'Mountain Climbers'],
      'Get Toned': ['Lunges', 'Dumbbell Rows', 'Planks'],
    }

    const match = base[goal] || []
    return match.filter((exercise) => equipment.some(eq => exercise.includes(eq) || true))
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl mb-4">🔥 Your Custom Workout</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="list-disc ml-6 space-y-2">
          {workouts.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
