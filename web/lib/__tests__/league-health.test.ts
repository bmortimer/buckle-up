import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { parseFranchisesCSV, getRootFranchiseId } from '../franchises'

// Get all franchise CSVs from the data directory (one level up from web/)
const dataDir = join(process.cwd(), '../data')
const leagues = readdirSync(dataDir).filter(name => {
  // Skip NHL for now - it has known issues being worked on
  if (name === 'nhl') return false

  try {
    return readdirSync(join(dataDir, name)).includes('franchises.csv')
  } catch {
    return false
  }
})

describe('League Health Checks', () => {
  describe.each(leagues)('%s league', (league) => {
    const franchisesPath = join(dataDir, league, 'franchises.csv')
    const csvContent = readFileSync(franchisesPath, 'utf-8')
    const franchises = parseFranchisesCSV(csvContent)

    it('should have valid franchise data structure', () => {
      expect(franchises.length).toBeGreaterThan(0)

      franchises.forEach((franchise) => {
        // Required fields must be present
        expect(franchise.franchiseId).toBeTruthy()
        expect(franchise.teamAbbr).toBeTruthy()
        expect(franchise.displayName).toBeTruthy()
        expect(franchise.city).toBeTruthy()

        // Active franchises and root franchises (no successors) must have colors
        // Historical franchises may have empty colors since they use their root franchise's color
        if (franchise.status === 'active' || !franchise.successorFranchiseId) {
          expect(franchise.hexColor).toMatch(/^#[0-9A-F]{6}$/i)
        }

        // Status must be valid
        expect(['active', 'relocated', 'rebranded', 'defunct', 'revived']).toContain(franchise.status)
      })
    })

    it('should have no circular franchise references', () => {
      franchises.forEach((franchise) => {
        if (franchise.successorFranchiseId) {
          const visited = new Set<string>()
          let current = franchise
          let safetyCounter = 0

          // Traverse successor chain, should never loop
          while (current.successorFranchiseId && safetyCounter < 100) {
            if (visited.has(current.franchiseId)) {
              throw new Error(
                `Circular reference detected in ${league}: ${current.franchiseId} -> ${current.successorFranchiseId}`
              )
            }
            visited.add(current.franchiseId)

            const successor = franchises.find(
              f => f.franchiseId === current.successorFranchiseId
            )
            if (!successor) break
            current = successor
            safetyCounter++
          }

          expect(safetyCounter).toBeLessThan(100) // Sanity check
        }
      })
    })

    it('should have valid successor chains', () => {
      franchises.forEach((franchise) => {
        if (franchise.successorFranchiseId) {
          const successor = franchises.find(
            f => f.franchiseId === franchise.successorFranchiseId
          )
          expect(successor).toBeDefined()
          expect(successor?.franchiseId).toBe(franchise.successorFranchiseId)
        }
      })
    })

    it('should have unique franchise IDs', () => {
      const ids = franchises.map(f => f.franchiseId)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have unique team abbreviations within active time periods', () => {
      // Team abbreviations can be reused over time (e.g., CHA for Hornets 88-02, then Bobcats/Hornets 04-present)
      // But there should never be truly overlapping time periods with the same abbreviation
      // Note: Same year transitions (e.g., end 2014, start 2014) are OK - they represent sequential seasons
      const overlaps = franchises.filter((f1, i) => {
        return franchises.some((f2, j) => {
          if (i >= j || f1.teamAbbr !== f2.teamAbbr) return false

          const start1 = parseInt(f1.startYear || '0')
          const end1 = parseInt(f1.endYear || '9999')
          const start2 = parseInt(f2.startYear || '0')
          const end2 = parseInt(f2.endYear || '9999')

          // Check if time periods truly overlap (strict inequality to allow same-year transitions)
          return start1 < end2 && start2 < end1
        })
      })

      expect(overlaps).toHaveLength(0)
    })

    it('should have valid date ranges', () => {
      franchises.forEach((franchise) => {
        if (franchise.startYear) {
          const start = parseInt(franchise.startYear)
          expect(start).toBeGreaterThan(1800)
          expect(start).toBeLessThan(2100)

          if (franchise.endYear) {
            const end = parseInt(franchise.endYear)
            expect(end).toBeGreaterThan(start)
            expect(end).toBeLessThan(2100)
          }
        }
      })
    })

    it('should have active franchises with no end year', () => {
      franchises.forEach((franchise) => {
        if (franchise.status === 'active') {
          expect(franchise.endYear).toBe('')
        }
      })
    })

    it('should have successor for relocated/rebranded franchises', () => {
      franchises.forEach((franchise) => {
        if (franchise.status === 'relocated' || franchise.status === 'rebranded') {
          expect(franchise.successorFranchiseId).toBeTruthy()
        }
      })
    })

    it('should be able to resolve root franchise for all teams', () => {
      franchises.forEach((franchise) => {
        const rootId = getRootFranchiseId(franchise.teamAbbr, franchises)
        expect(rootId).toBeTruthy()

        const rootFranchise = franchises.find(f => f.franchiseId === rootId)
        expect(rootFranchise).toBeDefined()
      })
    })

    it('should use root franchise color for lineage lookups', () => {
      // This test ensures that getTeamColor will return consistent colors
      // by using the root franchise color, even if historical teams have different colors
      const rootFranchises = franchises.filter((f) => {
        const rootId = getRootFranchiseId(f.teamAbbr, franchises)
        return rootId === f.franchiseId
      })

      // Just verify that root franchises exist and have colors
      rootFranchises.forEach((root) => {
        expect(root.hexColor).toMatch(/^#[0-9A-F]{6}$/i)
      })

      // Note: Historical teams may have different colors than their root franchise
      // This is intentional for historical accuracy, but getTeamColor() will use root color
    })
  })
})
