import ahs from './asabaHeirs'
import { Heirs, Heir } from './heir'
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

  // For non-Hanafi madhhabs, handle special asaba logic for grandfather and full brothers
  let qualifiedAsabas: (typeof ahs[number] | Result)[];
  if (madhhab !== 'hanafi') {
    const hasGrandfather = asabas.some(ah => ah.name === 'paternal_grand_father');
    const fullBrothers = asabas.filter(ah => ah.name === 'full_brother');
    if (hasGrandfather && fullBrothers.length === 1 && asabas.length === 2) {
      // Special case: exactly one grandfather and one full brother
      qualifiedAsabas = asabas.filter(
        ah => ah.name === 'paternal_grand_father' || ah.name === 'full_brother'
      );
      // The special-case split will be handled below
    } else if (hasGrandfather && fullBrothers.length > 0 && asabas.length === 1 + fullBrothers.length) {
      // General case: grandfather and multiple full brothers, treat grandfather as a brother
      // Grandfather: count 1, full brothers: count = number of full brothers
      qualifiedAsabas = [
        {
          name: 'paternal_grand_father' as Heir,
          type: 'tasib',
          count: 1,
          share: unknown,
          proportion: 2
        },
        {
          name: 'full_brother' as Heir,
          type: 'tasib',
          count: count(heirs, 'full_brother'),
          share: unknown,
          proportion: 2
        }
      ];
      // All get male share (2), distribute among all
    } else {
      qualifiedAsabas = asabas.filter(ah => asabas[0].tasibRank === ah.tasibRank);
    }
  } else {
    qualifiedAsabas = asabas.filter(ah => asabas[0].tasibRank === ah.tasibRank);
  }
  console.log(qualifiedAsabas, 'qualified asabas')

  const results: Result[] = qualifiedAsabas.map((ah: any) => ({
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

  // Special case: Shafii (and other non-Hanafi) - grandfather with full brother
  if (
    qualifiedAsabas.length === 2 &&
    qualifiedAsabas.some((ah: any) => ah.name === 'paternal_grand_father') &&
    qualifiedAsabas.some((ah: any) => ah.name === 'full_brother') &&
    madhhab !== 'hanafi'
  ) {
    // Assign 2/3 to grandfather, 1/3 to full brother
    const grandFatherIdx = qualifiedAsabas.findIndex((ah: any) => ah.name === 'paternal_grand_father');
    const fullBrotherIdx = qualifiedAsabas.findIndex((ah: any) => ah.name === 'full_brother');
    return distribute(
      [
        { ...results[grandFatherIdx], proportion: 2 },
        { ...results[fullBrotherIdx], proportion: 1 }
      ],
      remaining
    );
  }

  // General case: grandfather and multiple full brothers (non-Hanafi)
  if (
    madhhab !== 'hanafi' &&
    qualifiedAsabas.length > 2 &&
    qualifiedAsabas.some((ah: any) => ah.name === 'paternal_grand_father') &&
    qualifiedAsabas.every((ah: any) => ah.name === 'paternal_grand_father' || ah.name === 'full_brother')
  ) {
    // All get male share (2), distribute among all
    // If qualifiedAsabas is not already in Result shape, convert it
    const asabaResults = qualifiedAsabas.map((ah: any) => {
      if ('type' in ah && (ah.type === 'tasib' || ah.type === 'fard' || ah.type === 'special_case') && 'count' in ah && 'share' in ah) {
        return ah;
      } else {
        return {
          name: ah.name as Heir,
          type: 'tasib',
          count: count(heirs, ah.name as Heir),
          share: unknown,
          proportion: 2
        };
      }
    }) as Result[];
    return distribute(
      asabaResults,
      remaining
    );
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
