import fhs from './fardHeirs'
import { Heirs } from './heir'
import {
  Result,
  findFromResult,
  updateResults,
} from './result'
import { exists, count, distribute, isZero } from './utils'
import { sixth } from './quota'
import { Madhhab } from './madhab/default'

export function calculateFard(heirs: Heirs, madhhab: Madhhab): Result[] {
  const fardHiers = fhs.filter(fh => exists(heirs, fh.name))
  const results = fardHiers
    .map(fh => {
      const result: Result = {
        name: fh.name,
        count: count(heirs, fh.name),
        type: 'fard',
        share: fh.share(heirs, madhhab)  // pass madhhab here
      }
      return result
    })
    .filter(r => !isZero(r.share))

  return shareSixthBetweenGrandmothers(results)
}

function shareSixthBetweenGrandmothers(results: Result[]): Result[] {
  const mGrandMother = findFromResult(results, 'maternal_grand_mother')
  const pGrandMother = findFromResult(results, 'paternal_grand_mother')
  if(mGrandMother && pGrandMother) {
    return updateResults(
      results,
      distribute([mGrandMother, pGrandMother], sixth)
    )
  }

  return results
}
