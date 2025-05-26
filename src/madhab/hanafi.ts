import Fraction from 'fraction.js'
import { FardHeir } from '../heir'
import { Result } from '../result'

export const applyAwl = (heirs: FardHeir[]): FardHeir[] => {
  const total = heirs.reduce((sum, h) => sum.add(h.proportion || 0), new Fraction(0))
  if (total.compare(1) <= 0) return heirs

  return heirs.map(h => ({
    ...h,
    proportion: (h.proportion || new Fraction(0)).div(total),
  }))
}

export const applyRadd = (heirs: FardHeir[], results: Result[]): Result[] => {
  const total = results.reduce((sum, r) => sum.add(r.share), new Fraction(0))
  if (total.compare(1) >= 0) return results

  const raddable = results.filter(r => r.type === 'fard')
  const remaining = new Fraction(1).sub(total)

  return results.map(r => {
    if (raddable.find(h => h.name === r.name)) {
      const original = (r.share || new Fraction(0))
      const share = original.add(original.div(total).mul(remaining))
      return { ...r, share }
    }
    return r
  })
}

export const applyUmariyyah = (heirs: FardHeir[]): FardHeir[] | null => {
  const hasMother = heirs.find(h => h.name === 'mother')
  const hasSpouse = heirs.find(h => h.name === 'husband' || h.name === 'wife')
  const hasFather = heirs.find(h => h.name === 'father')

  if (hasMother && hasFather && hasSpouse && heirs.length === 3) {
    const spouseProp = hasSpouse!.name === 'husband' ? new Fraction(1, 2) : new Fraction(1, 4)
    return [
      { ...hasSpouse!, proportion: spouseProp },
      { ...hasMother!, proportion: new Fraction(1, 3) },
      { ...hasFather!, proportion: new Fraction(1).sub(spouseProp).sub(new Fraction(1, 3)) },
    ]
  }

  return null
}
