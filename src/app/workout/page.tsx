'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type WorkoutExercise = {
  name: string
  sets: number
  reps: string
}

export default function WorkoutPage() {
  const [exercises, setExercises] = useState<WorkoutExercise[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWorkout = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profile) return

      const workout = generateWorkout(profile.goal, profile.equipment || [])
      setExercises(workout)
      setLoading(false)
    }

    fetchWorkout()
  }, [])

  const generateWorkout = (goal: string, equipment: string[]): WorkoutExercise[] => {
    const workouts: WorkoutExercise[] = []

    const add = (name: string, sets = 3, reps = '10-12') =>
      workouts.push({ name, sets, reps })

    const has = (eq: string) => equipment.includes(eq)

    if (goal === 'Build Muscle') {
      if (has('Barbell')) add('Barbell Bench Press')
      if (has('Dumbbells')) add('Dumbbell Shoulder Press')
      if (has('Pull-Up Bar')) add('Pull-Ups')
      if (has('Cables')) add('Cable Lat Pulldown')
      add('Pushups')
    }

    if (goal === 'Burn Fat') {
      if (has('Dumbbells')) add('Dumbbell Thrusters', 4, '15')
      if (has('Bench')) add('Step Ups', 4, '20')
      add('Burpees', 3, '20')
      add('Mountain Climbers', 3, '30s')
    }

    if (goal === 'Get Toned') {
      if (has('Cables')) add('Cable Kickbacks')
      if (has('Dumbbells')) add('Dumbbell Lateral Raises')
      add('Bodyweight Lunges', 3, '20')
      add('Plank Hold', 3, '45s')
    }

    return workouts.slice(0, 5) // limit to 5 exercises
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl mb-4">Your QuickFit Session</h1>
      {loading ? (
        <p>Generating personalized workout...</p>
      ) : (
        <ul className="space-y-4">
          {exercises.map((ex, i) => (
            <li key={i} className="border p-4 rounded">
              <h2 className="font-bold text-lg">{ex.name}</h2>
              <p>
                {ex.sets} sets × {ex.reps} reps
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
