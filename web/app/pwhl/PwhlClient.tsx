'use client'

import { Suspense } from 'react'
import type { SeasonData, FranchiseInfo } from '@/lib/types'
import BeltDashboard from '@/components/BeltDashboard'

interface PwhlClientProps {
  seasons: Record<string, SeasonData>
  franchises: FranchiseInfo[]
  champions: Record<string, string>
}

export default function PwhlClient({ seasons, franchises, champions }: PwhlClientProps) {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}>
      <BeltDashboard
        league="pwhl"
        seasons={seasons}
        franchises={franchises}
        champions={champions}
      />
    </Suspense>
  )
}
