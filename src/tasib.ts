import ahs from './asabaHeirs'
import { Heirs } from './heir'
import { Madhhab } from './madhab/default'
import { unknown, nothing } from './quota'
import { Result, sumResults } from './result'
import { exists, count, distribute } from './utils'
import Fraction from 'fraction.js'

export function calculateTasib(heirs: Heirs, fardResult: Result[], madhhab: Madhhab): Result[] {
  const asabas = ahs
    .filter(ah => exists(heirs, ah.name))
    .filter(ah => {
      // Father is always eligible for tasib even if he already has a fard share
      if (ah.name === 'father') return true

      // Block paternal granddaughter in Hanafi if there's a daughter but no son or paternal grandson
      if (
        ah.name === 'paternal_grand_daughter' &&
        madhhab === 'hanafi' &&
        exists(heirs, 'daughter') &&
        !exists(heirs, 'son') &&
        !exists(heirs, 'paternal_grand_son')
      ) {
        return false
      }

      // Otherwise, only include if not already in fardResult
      return !fardResult.find(fh => fh.name === ah.name)
    })

  const qualifiedAsabas = asabas.filter(ah => asabas[0].tasibRank === ah.tasibRank)
  console.log(qualifiedAsabas, 'qualified asabas')

  const results: Result[] = qualifiedAsabas.map(ah => ({
    name: ah.name,
    count: count(heirs, ah.name),
    type: 'tasib',
    share: unknown
  }))

  const whole = new Fraction(1)
  let remaining = whole.sub(sumResults(fardResult))
  if (remaining.compare(0) < 0) {
    remaining = nothing
  }

  console.log(results.length, 'qualified asabas count')

  switch (results.length) {
    case 0:
      return results
    case 1:
      return distribute(results, remaining)
    case 2:
      return jointTasib(results, remaining)
    default:
      throw Error('qualified asaba types cannot be greater than two')
  }
}
// takes a pair of asaba result where the first one is a male and the second
// is a female and distributes it in 2:1 ratio
const jointTasib = (results: Result[], remaining: Fraction) => {
  return distribute(
    [{ ...results[0], proportion: 2 }, { ...results[1], proportion: 1 }],
    remaining
  )
}
