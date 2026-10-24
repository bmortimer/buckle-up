import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Last5BeltChanges from '../Last5BeltChanges'
import type { BeltChange, BeltHistory } from '@/lib/types'

const change = (date: string, fromTeam: string, toTeam: string): BeltChange => ({
  game: { date, homeTeam: fromTeam, awayTeam: toTeam, homeScore: 100, awayScore: 106 },
  fromTeam,
  toTeam,
  reason: 'loss',
})

const history = (changes: BeltChange[]): BeltHistory => ({
  season: '2026-27',
  league: 'NBA',
  startingTeam: changes[0]?.fromTeam ?? '',
  changes,
  summary: { totalGames: 0, totalChanges: changes.length, teams: [], currentHolder: '' },
})

const teamCodes = () =>
  screen.getAllByText(/^[A-Z]{3}$/).map((el) => el.textContent)

describe('Last5BeltChanges', () => {
  it('shows the starting holder before the first change', () => {
    render(
      <Last5BeltChanges league="nba" franchises={[]} history={history([change('2026-10-20', 'NYK', 'PHI')])} />
    )
    expect(teamCodes()).toEqual(['NYK', 'PHI'])
    expect(screen.getByText('Start')).toBeInTheDocument()
  })

  it('shows only the last 5 winners once there are 5 or more changes', () => {
    const teams = ['NYK', 'PHI', 'BOS', 'MIA', 'CHI', 'DEN', 'LAL']
    const changes = teams.slice(1).map((t, i) => change(`2026-11-0${i + 1}`, teams[i], t))
    render(<Last5BeltChanges league="nba" franchises={[]} history={history(changes)} />)
    expect(teamCodes()).toEqual(['BOS', 'MIA', 'CHI', 'DEN', 'LAL'])
    expect(screen.queryByText('Start')).not.toBeInTheDocument()
  })
})
