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
    .filter(ah => !fardResult.find(fh => fh.name === ah.name) || ah.name === 'father')

  const qualifiedAsabas = asabas.filter(ah => asabas[0].tasibRank === ah.tasibRank)

  const results: Result[] = qualifiedAsabas.map(ah => ({
    name: ah.name,
    count: count(heirs, ah.name),
    type: 'tasib',  // literal type here
    share: unknown
  }))

  const whole = new Fraction(1)
  let remaining = whole.sub(sumResults(fardResult))
  if (remaining.compare(0) < 0) {
    remaining = nothing
  }

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
