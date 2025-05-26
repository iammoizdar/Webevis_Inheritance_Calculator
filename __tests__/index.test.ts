import { calculate, defaultHeirs } from '../src/index'
import { Result, findFromResult, printResults } from '../src/result'
import { Heir, Heirs } from '../src/heir';
import Fraction from 'fraction.js';

function checkResult(
  results: Result[],
  heir: Heir | { name: Heir, type?: 'fard'|'tasib'|'special_case' },
  share: Fraction
) {
  const result = (() => {
    if(typeof heir === 'string') { return findFromResult(results, heir) }

    if(heir.type) return findFromResult(results, heir.name, heir.type)
    return findFromResult(results, heir.name)
  })()

  if(!result) {
    throw Error(`${(typeof heir === 'string') ? heir: heir.name} couldn't be found in result`)
  }
  expect(result.share).toEqual(share)
}

// function checkOptionalResult(
//   results: Result[],
//   heir: Heir | { name: Heir, type?: 'fard'|'tasib'|'special_case' },
//   expectedShare: Fraction | null
// ) {
//   const result = (() => {
//     if (typeof heir === 'string') return findFromResult(results, heir)
//     if (heir.type) return findFromResult(results, heir.name, heir.type)
//     return findFromResult(results, heir.name)
//   })()

//   if (expectedShare === null) {
//     expect(result).toBeUndefined()
//   } else {
//     if (!result) throw Error(`${typeof heir === 'string' ? heir : heir.name} couldn't be found in result`)
//     expect(result.share.equals(expectedShare)).toBe(true)
//   }
// }


const f = (num: number, den: number = 1) => new Fraction(num, den)

describe('Some edge cases', () => {
  test('single spouse', () => {
    calculate({ wife: 1 })
    calculate({ husband: 1 })
  })
})

// following test cases were taken from http://inheritance.ilmsummit.org/projects/inheritance/testcasespage.aspx
function findResult(results: Result[], heirName: string): Result | undefined {
  return results.find(r => r.name === heirName)
}

function expectHeirToBeBlocked(result: any[], heir: string) {
  const match = result.find(h => h.name === heir)
  expect(match).toBeUndefined()
}


// ☑️

test('1 wife, 1 son', () => {
  const result = calculate({ wife: 1, son: 1 }, 'hanafi')
  checkResult(result, 'wife', f(1,8))
  checkResult(result, 'son', f(7,8))
})
// ☑️

test('husband, mother, 1 maternal_brother, 1 full_uncle', () => {
  const result = calculate({
    husband: 1,
    mother: 1,
    maternal_sibling: 1,
    full_paternal_uncle: 1
  }, 'hanafi')
  checkResult(result, 'husband', f(1,2))
  checkResult(result, 'mother', f(1,3))
  checkResult(result, 'maternal_sibling', f(1,6))
  checkResult(result, 'full_paternal_uncle', f(0))
})
// ☑️

test('1 daughter, 2 full_sisters', () => {
  const result = calculate({ daughter: 1, full_sister: 2 }, 'hanbali')
  console.log(result, '1 daughter, 2 full_sisters')
  checkResult(result, 'daughter', f(1,2))
  checkResult(result, 'full_sister', f(1,2))
})
// ☑️


test('2 daughters, 1 paternal_sister', () => {
  const result = calculate({ daughter: 2, paternal_sister: 1 }, 'hanafi')
  checkResult(result, 'daughter', f(2,3))
  checkResult(result, 'paternal_sister', f(1,3))
})

// ☑️

test('1 daughter, 1 paternal_grand_daughter, 2 full_sister', () => {
  const result = calculate({
    daughter: 1,
    paternal_grand_daughter: 1,
    full_sister: 2
  }, 'hanafi')
  checkResult(result, 'daughter', f(1,2))
  checkResult(result, 'paternal_grand_daughter', f(1,6))
  checkResult(result, 'full_sister', f(1,3))
})
// ☑️

test('father, 1 full_brother', () => {
  const result = calculate({ father: 1, full_brother: 1 }, 'hanafi')
  checkResult(result, 'father', f(1))
})

// ☑️

test('1 wife, 1 son, mother', () => {
  const result = calculate({ wife: 1, son: 1, mother: 1 }, 'maliki')
  checkResult(result, 'wife', f(1,8))
  checkResult(result, 'son', f(17,24))
  checkResult(result, 'mother', f(1,6))
})

// ☑️

test('husband, 2 full_sister', () => {
  const result = calculate({ husband: 1, full_sister: 2 }, 'hanafi')
  checkResult(result, 'husband', f(3,7))
  checkResult(result, 'full_sister', f(4,7))
})


// ☑️

test('husband, father, mother', () => {
  const result = calculate({ husband: 1, father: 1, mother: 1 }, 'hanafi')
  checkResult(result, 'husband', f(1,2))
  checkResult(result, 'father', f(1,3))
  checkResult(result, 'mother', f(1,6))
})

  // Test Cases Provided by ChatGpt
// ☑️

test('grandfather with full brother (hanafi)', () => {
  const result = calculate({ paternal_grand_father: 1, full_brother: 1 }, 'hanafi')
  console.log(result, 'grandfather with full brother (hanafi)')
  checkResult(result, 'paternal_grand_father', f(1, 1)) // full share
})
// ☑️

test('grandfather with full brother (shafii)', () => {
  const result = calculate({ paternal_grand_father: 1, full_brother: 1 }, 'shafii')
  console.log(result, 'grandfather with full brother (shafii)')
  checkResult(result, 'paternal_grand_father', f(2, 3))
  checkResult(result, 'full_brother', f(1, 3))
})
// ☑️

test('maternal brother with full brother (hanafi)', () => {
  const result = calculate({ maternal_sibling: 1, full_brother: 1 }, 'hanafi')
  checkResult(result, 'maternal_sibling', f(1,6))
})
// ☑️

test('maternal brother with full brother (shafii)', () => {
  const result = calculate({ maternal_sibling: 1, full_brother: 1 }, 'shafii')
  console.log(result, 'maternal brother with full brother (shafii)')

  // Check that maternal_sibling is NOT in the result
  expect(result.find(r => r.name === 'maternal_sibling')).toBeUndefined()

  // Check that full_brother got all
  checkResult(result, 'full_brother', f(1))
})

// ☑️

test('paternal grandmother exists (hanafi)', () => {
  const result = calculate({ paternal_grand_mother: 1 }, 'hanafi')
  console.log(result, 'paternal grandmother exists (hanafi)')
  checkResult(result, 'paternal_grand_mother', f(1))
})
// ☑️

test('paternal grandmother exists (shafii)', () => {
  const result = calculate({ paternal_grand_mother: 1 }, 'shafii')
  console.log(result, 'paternal grandmother exists (shafii)')
  checkResult(result, 'paternal_grand_mother', f(1)) // Full estate due to Radd
})
// ☑️

test('daughter with son’s daughter (hanafi)', () => {
  const result = calculate({ daughter: 1, paternal_grand_daughter: 1 }, 'hanafi')
  console.log(result, 'daughter with son’s daughter (hanafi)')
  checkResult(result, 'daughter', f(3,4))
  checkResult(result, 'paternal_grand_daughter', f(1,4))
})
// ☑️

test('daughter with son’s daughter (shafii)', () => {
  const result = calculate({ daughter: 1, paternal_grand_daughter: 1 }, 'shafii')
  console.log(result, 'daughter with son’s daughter (shafii)')
  checkResult(result, 'daughter', f(3,4))
  checkResult(result, 'paternal_grand_daughter', f(1,4))
})



// ☑️


test('father with maternal sibling (hanafi)', () => {
  const result = calculate({ father: 1, maternal_sibling: 1 }, 'hanafi')
  console.log(result, 'father with maternal sibling (hanafi)')
  checkResult(result, 'maternal_sibling', f(1,6))
})

// ☑️

test('father with maternal sibling (shafii)', () => {
  const result = calculate({ father: 1, maternal_sibling: 1 }, 'shafii')
  console.log(result, 'father with maternal sibling (shafii)')
  expectHeirToBeBlocked(result, 'maternal_sibling')
})
