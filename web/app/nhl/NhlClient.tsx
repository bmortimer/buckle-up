'use client'

import { Suspense } from 'react'
import type { SeasonData, FranchiseInfo } from '@/lib/types'
import BeltDashboard from '@/components/BeltDashboard'

interface NhlClientProps {
  seasons: Record<string, SeasonData>
  franchises: FranchiseInfo[]
  champions: Record<string, string>
}

export default function NhlClient({ seasons, franchises, champions }: NhlClientProps) {
  return (
    <Suspense fallback={<div className="text-center py-20 text-muted-foreground">Loading...</div>}>
      <BeltDashboard league="nhl" seasons={seasons} franchises={franchises} champions={champions} />
    </Suspense>
  )
}
