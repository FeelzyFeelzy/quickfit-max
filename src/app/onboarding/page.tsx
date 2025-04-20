'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const goals = ['Build Muscle', 'Burn Fat', 'Get Toned']
const equipmentOptions = [
  'Dumbbells', 'Barbell', 'Bench', 'Pull-Up Bar', 'Cables',
  'Kettlebell', 'Trap Bar', 'Smith Machine', 'Resistance Bands',
  'Jump Rope', 'Treadmill', 'Assault Bike', 'Stair Climber',
  'Sled', 'Landmine', 'Hip Thrust Machine', 'Glute Kickback Machine'
]

const moods = ['Low', 'Normal', 'High']

export default function OnboardingPage() {
  const [goal, setGoal] = useState('')
  const [equipment, setEquipment] = useState<string[]>([])
  const [mood, setMood] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const toggleEquipment = (item: string) => {
    setEquipment((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) {
      setError('You must be logged in.')
      return
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        goal,
        equipment,
        mood, // save mood
      })

    if (error) setError(error.message)
    else router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-gray-900 rounded-xl p-8 shadow-lg space-y-6"
      >
        <h1 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
          🎯 Personalize Your Plan
        </h1>

        <div>
          <p className="font-semibold text-green-300 mb-2">Your Goal:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {goals.map((g) => (
              <button
                type="button"
                key={g}
                className={`px-4 py-2 rounded border font-medium transition ${
                  goal === g
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700'
                }`}
                onClick={() => setGoal(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="font-semibold text-green-300 mb-2">Available Equipment:</p>
          <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto justify-center">
            {equipmentOptions.map((item) => (
              <button
                type="button"
                key={item}
                className={`px-3 py-1 text-sm rounded border transition ${
                  equipment.includes(item)
                    ? 'bg-green-500 text-black border-green-400 font-semibold'
                    : 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700'
                }`}
                onClick={() => toggleEquipment(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="font-semibold text-green-300 mb-2">Your Current Mood:</p>
          <div className="flex justify-center gap-4">
            {moods.map((m) => (
              <button
                type="button"
                key={m}
                className={`px-4 py-2 rounded-full font-medium transition text-sm ${
                  mood === m
                    ? 'bg-pink-500 text-white border-pink-400'
                    : 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700'
                }`}
                onClick={() => setMood(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 text-center">{error}</p>}

        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-green-400 hover:from-blue-400 hover:to-green-300 text-black px-6 py-2 rounded-full font-bold shadow-md transition hover:scale-105"
          >
            ✅ Save & Continue
          </button>
        </div>
      </form>
    </div>
  )
}
