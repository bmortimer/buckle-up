import { describe, it, expect } from 'vitest'
import { getScheduleBreaks, findBreakInRange, isDateInBreak } from '../scheduleBreaks'

describe('getScheduleBreaks', () => {
  it('should return NBA COVID-19 break for 2019-20 season', () => {
    const breaks = getScheduleBreaks('nba', '2019-20')

    expect(breaks).toHaveLength(1)
    expect(breaks[0].reason).toBe('COVID-19 Pandemic Pause')
    expect(breaks[0].startDate).toBe('2020-03-11')
    expect(breaks[0].emoji).toBe('🦠')
  })

  it('should return NHL Olympic breaks for Olympic years', () => {
    const breaks1998 = getScheduleBreaks('nhl', '1997-98')
    expect(breaks1998).toHaveLength(1)
    expect(breaks1998[0].reason).toBe('1998 Nagano Winter Olympics')
    expect(breaks1998[0].startDate).toBe('1998-02-07')
    expect(breaks1998[0].endDate).toBe('1998-02-22')

    const breaks2026 = getScheduleBreaks('nhl', '2025-26')
    expect(breaks2026).toHaveLength(1)
    expect(breaks2026[0].reason).toBe('2026 Milano Cortina Winter Olympics')
    expect(breaks2026[0].startDate).toBe('2026-02-06')
    expect(breaks2026[0].endDate).toBe('2026-02-22')
  })

  it('should return WNBA Olympic breaks for Olympic years', () => {
    const breaks2004 = getScheduleBreaks('wnba', '2004')
    expect(breaks2004).toHaveLength(1)
    expect(breaks2004[0].reason).toBe('2004 Athens Summer Olympics')
    expect(breaks2004[0].startDate).toBe('2004-08-13')
    expect(breaks2004[0].endDate).toBe('2004-08-29')

    const breaks2024 = getScheduleBreaks('wnba', '2024')
    expect(breaks2024).toHaveLength(1)
    expect(breaks2024[0].reason).toBe('2024 Paris Summer Olympics')
    expect(breaks2024[0].startDate).toBe('2024-07-26')
    expect(breaks2024[0].endDate).toBe('2024-08-11')
  })

  it('should return PWHL breaks for World Championship years', () => {
    const breaks2024 = getScheduleBreaks('pwhl', '2023-24')
    expect(breaks2024).toHaveLength(1)
    expect(breaks2024[0].reason).toBe('2024 IIHF Women\'s World Championship')
    expect(breaks2024[0].startDate).toBe('2024-04-03')
    expect(breaks2024[0].endDate).toBe('2024-04-14')

    const breaks2026 = getScheduleBreaks('pwhl', '2025-26')
    expect(breaks2026).toHaveLength(1)
    expect(breaks2026[0].reason).toBe('2026 Milano Cortina Winter Olympics')
  })

  it('should return empty array for seasons without breaks', () => {
    const breaks = getScheduleBreaks('nba', '2021-22')
    expect(breaks).toHaveLength(0)
  })

  it('should return empty array for invalid league/season', () => {
    const breaks = getScheduleBreaks('nba', 'invalid-season')
    expect(breaks).toHaveLength(0)
  })
})

describe('findBreakInRange', () => {
  it('should find break when date range overlaps with break', () => {
    // 2004 Athens Olympics: Aug 13-29
    const breakInfo = findBreakInRange('wnba', '2004', '2004-08-01', '2004-08-15')

    expect(breakInfo).not.toBeNull()
    expect(breakInfo?.reason).toBe('2004 Athens Summer Olympics')
  })

  it('should find break when range completely contains break', () => {
    const breakInfo = findBreakInRange('wnba', '2004', '2004-07-01', '2004-09-30')

    expect(breakInfo).not.toBeNull()
    expect(breakInfo?.reason).toBe('2004 Athens Summer Olympics')
  })

  it('should find break when break completely contains range', () => {
    const breakInfo = findBreakInRange('wnba', '2004', '2004-08-15', '2004-08-20')

    expect(breakInfo).not.toBeNull()
    expect(breakInfo?.reason).toBe('2004 Athens Summer Olympics')
  })

  it('should NOT find break when ranges do not overlap', () => {
    const breakInfo = findBreakInRange('wnba', '2004', '2004-09-01', '2004-09-15')

    expect(breakInfo).toBeNull()
  })

  it('should NOT find break for season without breaks', () => {
    const breakInfo = findBreakInRange('wnba', '2022', '2022-07-01', '2022-08-31')

    expect(breakInfo).toBeNull()
  })
})

describe('isDateInBreak', () => {
  it('should return break info when date falls within break', () => {
    // 2024 Paris Olympics: Jul 26 - Aug 11
    const breakInfo = isDateInBreak('wnba', '2024', '2024-08-01')

    expect(breakInfo).not.toBeNull()
    expect(breakInfo?.reason).toBe('2024 Paris Summer Olympics')
  })

  it('should return break info for start date of break', () => {
    const breakInfo = isDateInBreak('wnba', '2024', '2024-07-26')

    expect(breakInfo).not.toBeNull()
  })

  it('should return break info for end date of break', () => {
    const breakInfo = isDateInBreak('wnba', '2024', '2024-08-11')

    expect(breakInfo).not.toBeNull()
  })

  it('should return null when date is before break', () => {
    const breakInfo = isDateInBreak('wnba', '2024', '2024-07-20')

    expect(breakInfo).toBeNull()
  })

  it('should return null when date is after break', () => {
    const breakInfo = isDateInBreak('wnba', '2024', '2024-08-20')

    expect(breakInfo).toBeNull()
  })

  it('should return null for season without breaks', () => {
    const breakInfo = isDateInBreak('wnba', '2022', '2022-08-01')

    expect(breakInfo).toBeNull()
  })
})

describe('Schedule break edge cases', () => {
  it('should handle WNBA 2004 Olympics break (key test case)', () => {
    // WNBA 2004: Games on Aug 1, then Olympics Aug 13-29, then games resume Sept 1
    const breaks = getScheduleBreaks('wnba', '2004')

    expect(breaks).toHaveLength(1)
    expect(breaks[0].startDate).toBe('2004-08-13')
    expect(breaks[0].endDate).toBe('2004-08-29')

    // Aug 1 should NOT be in break (games were played)
    expect(isDateInBreak('wnba', '2004', '2004-08-01')).toBeNull()

    // Aug 13-29 should be in break
    expect(isDateInBreak('wnba', '2004', '2004-08-15')).not.toBeNull()

    // Sept 1 should NOT be in break (games resumed)
    expect(isDateInBreak('wnba', '2004', '2004-09-01')).toBeNull()
  })

  it('should handle NBA 2019-20 COVID pause correctly', () => {
    const breaks = getScheduleBreaks('nba', '2019-20')

    expect(breaks).toHaveLength(1)
    expect(breaks[0].startDate).toBe('2020-03-11')

    // March 11 is the start of the break
    expect(isDateInBreak('nba', '2019-20', '2020-03-11')).not.toBeNull()

    // Games resumed July 30
    expect(isDateInBreak('nba', '2019-20', '2020-07-30')).not.toBeNull()
  })

  it('should handle 2026 Winter Olympics across all leagues', () => {
    // Feb 6-22, 2026
    const nhlBreaks = getScheduleBreaks('nhl', '2025-26')
    const pwhlBreaks = getScheduleBreaks('pwhl', '2025-26')

    expect(nhlBreaks[0].startDate).toBe('2026-02-06')
    expect(nhlBreaks[0].endDate).toBe('2026-02-22')
    expect(pwhlBreaks[0].startDate).toBe('2026-02-06')
    expect(pwhlBreaks[0].endDate).toBe('2026-02-22')

    // Both should show in February (month with most event days)
    expect(nhlBreaks[0].startDate.substring(0, 7)).toBe('2026-02')
    expect(pwhlBreaks[0].startDate.substring(0, 7)).toBe('2026-02')
  })
})
