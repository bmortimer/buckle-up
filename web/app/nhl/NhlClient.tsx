'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { SeasonData, FranchiseInfo } from '@/lib/types'
import BeltDashboard from '@/components/BeltDashboard'

interface NhlClientProps {
  seasons: Record<string, SeasonData>
  franchises: FranchiseInfo[]
  champions: Record<string, string>
}

function NhlContent({ seasons, franchises, champions }: NhlClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for ?time=dame query parameter
    if (searchParams.get('time') !== 'dame') {
      router.push('/404')
    } else {
      setIsAuthorized(true)
      setIsLoading(false)
    }
  }, [searchParams, router])

  if (isLoading || !isAuthorized) {
    return <div className="text-center py-20 text-gray-400">Loading...</div>
  }

  return (
    <BeltDashboard
      league="nhl"
      seasons={seasons}
      franchises={franchises}
      champions={champions}
    />
  )
}

export default function NhlClient(props: NhlClientProps) {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}>
      <NhlContent {...props} />
    </Suspense>
  )
}
