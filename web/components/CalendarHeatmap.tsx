import type { BeltHistory, FranchiseInfo } from '@/lib/types'

interface CalendarHeatmapProps {
  history: BeltHistory
  franchises: FranchiseInfo[]
}

export default function CalendarHeatmap({ history, franchises }: CalendarHeatmapProps) {
  // Simplified placeholder for now - will enhance later
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-xl font-bold mb-6">Calendar View</h3>

      <div className="text-center py-12 text-muted-foreground">
        <div className="text-sm mb-2">Calendar heatmap visualization</div>
        <div className="text-xs">Coming soon - will show month × day grid</div>
      </div>
    </div>
  )
}
