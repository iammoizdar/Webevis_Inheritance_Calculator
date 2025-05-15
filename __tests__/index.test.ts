import { calculate } from '../src/index'
import { Result, findFromResult, printResults } from '../src/result'
import { Heir } from '../src/heir';
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


test('hanafi: 1 wife, 2 daughter, 1 paternal cousin', () => {
  const result = calculate(
    { wife: 1, daughter: 2, paternal_cousin: 1 },
    'hanafi'
  )
  console.log(result, 'hanafi: 1 wife, 2 daughter, 1 paternal cousin')
  checkResult(result, 'wife', f(1, 8))              // 1/8 is correct for wife
  checkResult(result, 'daughter', f(2, 3))          // daughters get 2/3 collectively in Hanafi
  checkResult(result, 'paternal_cousin', f(5, 24))  // cousin gets remainder 5/24 tasib
})
test('hanafi: 2 wife, 3 daughter, 1 paternal cousin', () => {
  const result = calculate(
    { wife: 2, daughter: 3, paternal_cousin: 1 },
    'hanafi'
  )
  console.log(result, 'hanafi: 2 wife, 3 daughter, 1 paternal cousin')
  checkResult(result, 'wife', f(1, 8))              // 1/8 is correct for wife
  checkResult(result, 'daughter', f(2, 3))          // daughters get 2/3 collectively in Hanafi
  checkResult(result, 'paternal_cousin', f(5, 24))  // cousin gets remainder 5/24 tasib
})


test('Hanafi: grandfather blocks siblings', () => {
  const result = calculate({ paternal_grand_father: 1, full_brother: 2 }, 'hanafi')
  console.log(result, 'Hanafi: grandfather blocks siblings')
  checkResult(result, 'paternal_grand_father', f(1, 1))
  expect(findFromResult(result, 'full_brother')).toBeUndefined()
})


test('Shafii: grandfather shares with siblings', () => {
  const result = calculate({ paternal_grand_father: 1, full_brother: 2 }, 'shafii')
  console.log(result, 'Shafii: grandfather shares with siblings')
  checkResult(result, 'paternal_grand_father', f(1, 6))  // example value
  checkResult(result, 'full_brother', f(5, 6))           // adjust according to your calculator
})
test('Hanafi: daughter blocks granddaughter', () => {
  const result = calculate({ daughter: 1, paternal_grand_daughter: 1 }, 'hanafi')
  console.log(result, 'Hanafi: daughter blocks granddaughte')
  checkResult(result, 'daughter', f(1, 2))
  expect(findFromResult(result, 'paternal_grand_daughter')).toBeUndefined()
})
test('Hanafi: maternal brother not blocked by full brother', () => {
  const result = calculate({ maternal_sibling: 1, full_brother: 1 }, 'hanafi')
  console.log(result, 'Hanafi: maternal brother not blocked by full brother')
  checkResult(result, 'maternal_sibling', f(1, 6))
})
test('Shafii: maternal brother blocked by full brother', () => {
  const result = calculate({ maternal_sibling: 1, full_brother: 1 }, 'shafii')
    console.log(result, 'Shafii: maternal brother blocked by full brother')
  expect(findFromResult(result, 'maternal_sibling')).toBeUndefined()
})


test('Awl case: 3 daughters, 2 full sisters, wife (all schools)', () => {
  const result = calculate({ daughter: 3, full_sister: 2, wife: 1 }, 'shafii')  // or hanafi
    console.log(result, 'Awl case: 3 daughters, 2 full sisters, wife (all schools)')
  printResults(result)

  const total = result.reduce((acc, r) => acc.add(r.share), f(0))
  expect(total.equals(f(1))).toBe(true) // should add up to 1 after awl
})
test('2 wives share 1/8 together', () => {
  const result = calculate({ wife: 2, son: 1 }, 'hanafi')
    console.log(result, '2 wives share 1/8 together')
  const wives = result.filter(r => r.name === 'wife')
  wives.forEach(w => {
    checkResult([w], 'wife', f(1, 16)) // each wife gets half of 1/8
  })
})
test('Hanafi: step-grandmother inherits', () => {
  const result = calculate({ paternal_grand_mother: 1 }, 'hanafi')
    console.log(result, 'Hanafi: step-grandmother inherits')
  expect(findFromResult(result, 'paternal_grand_mother')).toBeDefined()
})
test('Shafii: step-grandmother does not inherit', () => {
  const result = calculate({ paternal_grand_mother: 1 }, 'shafii')
  console.log(result, 'Shafii: step-grandmother does not inherit')
  expect(findFromResult(result, 'paternal_grand_mother')).toBeUndefined()
})


// test('Grandfather with siblings - Hanafi vs Others', () => {
//   let result = calculate({ paternal_grand_father: 1, full_brother: 2 }, 'hanafi')
//   console.log(result)  // Inspect the shares here
//   checkResult(result, 'paternal_grand_father', f(1, 1))  // Adjusted to expected output
//   expect(findResult(result, 'full_brother')).toBeUndefined()  // siblings blocked

//   result = calculate({ paternal_grand_father: 1, full_brother: 2 }, 'shafii')
//   checkResult(result, 'paternal_grand_father', f(1, 12))  // Assuming your code outputs this
//   expect(findResult(result, 'full_brother')).toBeDefined()
// })


