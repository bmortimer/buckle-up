import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SeasonPicker from '../SeasonPicker'

const defaultProps = {
  minYear: 2000,
  maxYear: 2026,
  value: [2000, 2026] as [number, number],
  onChange: vi.fn(),
  isAllTime: true,
  onAllTimeChange: vi.fn(),
  league: 'wnba' as const,
}

describe('SeasonPicker', () => {
  describe('availableYears filtering', () => {
    it('should show only available years when provided, not every year between min and max', () => {
      render(<SeasonPicker {...defaultProps} availableYears={[2000, 2001, 2002, 2026]} />)

      // Open the year picker modal
      fireEvent.click(screen.getByRole('button', { name: /time period/i }))

      // Years the team played in should be present
      expect(screen.getByRole('button', { name: /Select 2000/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Select 2001/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Select 2002/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Select 2026/ })).toBeInTheDocument()

      // Gap years should NOT be present
      expect(screen.queryByRole('button', { name: /Select 2003/ })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Select 2010/ })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Select 2025/ })).not.toBeInTheDocument()
    })

    it('should show all years between min and max when availableYears is not provided', () => {
      render(<SeasonPicker {...defaultProps} minYear={2020} maxYear={2023} />)

      fireEvent.click(screen.getByRole('button', { name: /time period/i }))

      expect(screen.getByRole('button', { name: /Select 2020/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Select 2021/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Select 2022/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Select 2023/ })).toBeInTheDocument()
    })

    it('should only show decades that contain available years', () => {
      render(<SeasonPicker {...defaultProps} availableYears={[2000, 2001, 2026]} />)

      fireEvent.click(screen.getByRole('button', { name: /time period/i }))

      // 2000s and 2020s decades should be present
      expect(screen.getByText('2000s')).toBeInTheDocument()
      expect(screen.getByText('2020s')).toBeInTheDocument()

      // 2010s decade should NOT be present (no available years in that range)
      expect(screen.queryByText('2010s')).not.toBeInTheDocument()
    })
  })
})
