import { heirs as defaultHeirs, Heirs } from './heir'
import { calculateFard } from './fard'
import { calculateTasib } from './tasib'
import { calculateSpecialCases } from './specialCases'
import { Madhhab } from './madhab'

const calculate = (heirs: Partial<Heirs>, madhhab: Madhhab = 'shafii') => {
  if (heirs.husband && heirs.wife) {
    throw Error('heirs cannot contain both husband and wife')
  }

  const allHeirs: Heirs = { ...defaultHeirs, ...heirs }

  // Pass madhhab to these calculation functions
  const fardResult = calculateFard(allHeirs, madhhab)
  const tasibResult = calculateTasib(allHeirs, fardResult, madhhab)
  const results = calculateSpecialCases(fardResult, tasibResult, madhhab)

  return results
}

export { defaultHeirs }
export { calculate }
