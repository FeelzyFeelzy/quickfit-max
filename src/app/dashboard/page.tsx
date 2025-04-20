'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import { motion } from 'framer-motion'
import Image from 'next/image'

const aiTips = [
  'Try slower reps for better results.',
  'Add variety to avoid plateaus.',
  'Perfect form beats heavy weights.',
  'Stay hydrated — performance depends on it.',
  'Try supersets to boost fat burn.',
  'Track your sleep to improve recovery.',
  'Control the negative (eccentric) part of lifts.',
  'Focus on mind-muscle connection.',
  'Don’t skip warm-ups or cool-downs.',
  'Increase protein for better recovery.',
  'Stretch after every session.',
  'Log your workouts for accountability.',
  'Try unilateral exercises to fix imbalances.',
  'Slow tempo boosts time under tension.',
  'Add drop sets for a challenge.',
  'Visualize your form before lifting.',
  'Take deep breaths during reps.',
  'Don’t rush progress — trust the process.',
  'Adjust weights weekly based on progress.',
  'Rest days help you grow.',
  'Switch grips for new muscle activation.',
  'Engage your core in every lift.',
  'Use mirrors for form correction.',
  'Train smart, not just hard.',
  'Good posture = better lifts.',
  'Balance push and pull movements.',
  'Your workout starts the night before — sleep well.',
  'Fuel with carbs pre-workout.',
  'Limit distractions — focus builds gains.',
]

type Exercise = {
  name: string
  sets: number
  reps: string
  equipment: string[]
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [workout, setWorkout] = useState<Exercise[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [aiTip, setAiTip] = useState('')
  const [level, setLevel] = useState('Intermediate')
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      setUser(user)

      if (!user) return router.push('/login')

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profileData?.goal || !profileData?.equipment?.length) {
        router.push('/onboarding')
        return
      }

      setProfile(profileData)
      const newWorkout = generateWorkout(profileData.goal, profileData.equipment)
      setWorkout(newWorkout)
      await fetchHistory(user.id)
      setLoading(false)
    }

    load()
  }, [router])

  const fetchHistory = async (userId: string) => {
    const { data, error } = await supabase
      .from('completed_workouts')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })

    if (!error) setHistory(data)
  }

  const saveWorkout = async (userId: string, workout: Exercise[]) => {
    const { error } = await supabase
      .from('workouts')
      .insert([{ id: uuidv4(), user_id: userId, data: workout }])
    if (error) console.error('❌ Save error:', error)
  }

  const handleRegenerate = async () => {
    if (!user || !profile) return
    const newWorkout = generateWorkout(profile.goal, profile.equipment)
    setWorkout([...newWorkout])
    await saveWorkout(user.id, newWorkout)
  }

  const handleEditGoal = () => router.push('/onboarding')

  const handleCompleteWorkout = async () => {
    if (!user || workout.length === 0) return
    const { error } = await supabase
      .from('completed_workouts')
      .insert([{ user_id: user.id, data: workout, completed_at: new Date() }])

    if (!error) {
      alert('✅ Workout marked as completed!')
      await fetchHistory(user.id)
      const randomTip = aiTips[Math.floor(Math.random() * aiTips.length)]
      setAiTip(randomTip)
    } else {
      console.error(error)
      alert('❌ Failed to save workout')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const shuffleArray = <T,>(array: T[]): T[] =>
    array.map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)

  const adjustSetsForLevel = (sets: number): number => {
    if (level === 'Beginner') return Math.max(1, sets - 1)
    if (level === 'Advanced') return sets + 1
    return sets
  }

  const generateWorkout = (goal: string, equipment: string[]): Exercise[] => {
    const allWorkouts: { [key: string]: Exercise[] } = {
      'Build Muscle': [
        { name: 'Barbell Bench Press', sets: 4, reps: '8–10', equipment: ['barbell'] },
        { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10', equipment: ['dumbbells'] },
        { name: 'Pull-Ups', sets: 3, reps: 'Max', equipment: ['pull-up bar'] },
        { name: 'Cable Rows', sets: 4, reps: '10–12', equipment: ['cable machine'] },
        { name: 'Incline Dumbbell Press', sets: 3, reps: '10–12', equipment: ['dumbbells'] },
        { name: 'Bent Over Row', sets: 3, reps: '10', equipment: ['barbell'] },
        { name: 'Push-Ups', sets: 4, reps: 'Max', equipment: [] },
        { name: 'Deadlifts', sets: 3, reps: '6–8', equipment: ['barbell'] },
        { name: 'Chest Dips', sets: 3, reps: '12', equipment: ['dip bar'] },
        { name: 'Machine Leg Press', sets: 4, reps: '10', equipment: ['leg press machine'] },
        { name: 'Dumbbell Rows', sets: 3, reps: '10–12', equipment: ['dumbbells'] },
      ],
      'Burn Fat': [
        { name: 'Burpees', sets: 4, reps: '20', equipment: [] },
        { name: 'Jump Rope', sets: 5, reps: '1 min', equipment: ['jump rope'] },
        { name: 'Mountain Climbers', sets: 3, reps: '30 sec', equipment: [] },
        { name: 'Step Ups', sets: 3, reps: '15 each leg', equipment: [] },
        { name: 'High Knees', sets: 3, reps: '45 sec', equipment: [] },
        { name: 'Kettlebell Swings', sets: 4, reps: '15', equipment: ['kettlebell'] },
        { name: 'Battle Ropes', sets: 5, reps: '30 sec', equipment: ['battle ropes'] },
        { name: 'Jump Squats', sets: 3, reps: '20', equipment: [] },
        { name: 'Treadmill Intervals', sets: 5, reps: '1 min sprint', equipment: ['treadmill'] },
        { name: 'Rowing Machine', sets: 4, reps: '500m', equipment: ['rowing machine'] },
        { name: 'Jumping Jacks', sets: 3, reps: '60 sec', equipment: [] },
      ],
      'Get Toned': [
        { name: 'Bodyweight Lunges', sets: 3, reps: '15', equipment: [] },
        { name: 'Dumbbell Curls', sets: 3, reps: '12', equipment: ['dumbbells'] },
        { name: 'Lateral Raises', sets: 3, reps: '12', equipment: ['dumbbells'] },
        { name: 'Plank', sets: 3, reps: '45 sec', equipment: [] },
        { name: 'Russian Twists', sets: 3, reps: '20 reps', equipment: [] },
        { name: 'Resistance Band Squats', sets: 4, reps: '15', equipment: ['resistance band'] },
        { name: 'Glute Bridges', sets: 3, reps: '20', equipment: [] },
        { name: 'Tricep Dips', sets: 3, reps: '12', equipment: ['bench'] },
        { name: 'Leg Raises', sets: 3, reps: '15', equipment: [] },
        { name: 'Resistance Band Rows', sets: 3, reps: '15', equipment: ['resistance band'] },
        { name: 'Side Planks', sets: 3, reps: '30 sec each side', equipment: [] },
      ],
    }

    const selected = shuffleArray(allWorkouts[goal] || [])
    const userEquipment = equipment.map(e => e.toLowerCase())

    return selected
      .filter(ex => ex.equipment.length === 0 || ex.equipment.some(eq => userEquipment.includes(eq)))
      .slice(0, 4)
      .map(ex => ({ ...ex, sets: adjustSetsForLevel(ex.sets) }))
  }

  return (
    <div className="p-6 max-w-xl mx-auto min-h-screen bg-black text-white animate-fadeIn">
      <div className="flex justify-center mb-6">
        <Image
          src="/qf-logo.png"
          alt="QuickFit Logo"
          width={50}
          height={50}
          className="rounded-full shadow-lg animate-spin [animation-duration:3s]"
        />
      </div>

      <div className="flex justify-end gap-2 mb-4">
        <button className="bg-gradient-to-r from-slate-600 to-slate-400 text-sm px-3 py-1 rounded shadow hover:scale-105 transition" onClick={() => router.push('/dashboard')}>🏠 Dashboard</button>
        <button className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded shadow" onClick={handleLogout}>🔓 Logout</button>
      </div>

      <h1 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-500 mb-4">💪 Your QuickFit Workout</h1>

      {profile && (
        <div className="mb-6 text-center bg-gray-800 border border-cyan-500 rounded-xl px-4 py-3 shadow-inner">
          <p className="text-lg font-bold text-cyan-300">🎯 Goal: <span className="text-white font-medium">{profile.goal}</span></p>
          <div className="mt-2">
            <label className="text-cyan-400 font-bold mr-2">🔥 Your Level:</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="bg-black text-white border border-cyan-400 rounded px-3 py-1 hover:bg-cyan-950 hover:border-white transition"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-400 animate-pulse">Loading your workout...</p>
      ) : (
        <>
          <motion.ul layout className="space-y-4 mb-6">
            {workout.map((ex, i) => (
              <motion.li key={i} layout className="p-4 bg-gray-900 rounded-xl shadow-lg border border-gray-700">
                <h2 className="text-lg font-semibold text-green-400">{ex.name}</h2>
                <p className="text-gray-300">{ex.sets} sets × {ex.reps}</p>
              </motion.li>
            ))}
          </motion.ul>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
            <button className="bg-blue-700 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl shadow-lg hover:scale-105 transition-all" onClick={handleRegenerate}>🔁 Regenerate Workout</button>
            <button className="bg-gray-700 hover:bg-gray-500 text-white font-bold px-5 py-2 rounded-xl shadow-lg hover:scale-105 transition-all" onClick={handleEditGoal}>✏️ Edit Goal</button>
            <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl shadow-lg hover:scale-105 transition-all" onClick={handleCompleteWorkout}>✅ Mark Completed</button>
          </div>

          {aiTip && (
            <div className="bg-blue-900 text-blue-200 border border-blue-400 rounded p-4 text-center shadow-xl animate-pulse">
              💡 <strong>AI Coach Tip:</strong> {aiTip}
            </div>
          )}
        </>
      )}
    </div>
  )
}