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

test('1 wife, 1 son', () => {
  const result = calculate({ wife: 1, son: 1 }, 'hanafi')
  // ✅ All madhhabs agree:
  // - Wife receives 1/8 (due to child)
  // - Son takes the remainder (7/8) as residuary

  console.log(result, '1 wife, 1 son')
  checkResult(result, 'wife', f(1,8))
  checkResult(result, 'son', f(7,8))
})

test('husband, mother, 1 maternal_brother, 1 full_uncle', () => {
  const result = calculate({
    husband: 1,
    mother: 1,
    maternal_sibling: 1,
    full_paternal_uncle: 1
  }, 'hanafi')
  console.log(result, 'husband, mother, 1 maternal_brother, 1 full_uncle')

  // ✅ All madhhabs generally agree:
  // - Husband gets 1/2 (no children)
  // - Mother gets 1/3 (no children, only 1 sibling)
  // - Maternal brother gets 1/6 (fixed share in Qur’an 4:12)
  // - Full uncle is blocked (no residuary share left)
  checkResult(result, 'husband', f(1,2))
  checkResult(result, 'mother', f(1,3))
  checkResult(result, 'maternal_sibling', f(1,6))
  checkResult(result, 'full_paternal_uncle', f(0))
})


test('1 daughter, 2 full_sisters', () => {
  const result = calculate({ daughter: 1, full_sister: 2 }, 'hanbali')
  console.log(result, '1 daughter, 2 full_sisters')
  // ✅ All madhhabs:
  // - Daughter gets 1/2
  // - Full sisters become ʿaṣaba (residuary) with a daughter
  // - They take the remainder (1/2) together
  checkResult(result, 'daughter', f(1,2))
  checkResult(result, 'full_sister', f(1,2))
})


test('2 daughters, 1 paternal_sister', () => {
  const result = calculate({ daughter: 2, paternal_sister: 1 }, 'hanafi')
  // ✅ All madhhabs:
  // - 2 daughters share 2/3 (Qur’an 4:11)
  // - Paternal sister takes remaining 1/3 as residuary with daughters
  checkResult(result, 'daughter', f(2,3))
  checkResult(result, 'paternal_sister', f(1,3))
})

test('1 daughter, 1 paternal_grand_daughter, 2 full_sister', () => {
  const result = calculate({
    daughter: 1,
    paternal_grand_daughter: 1,
    full_sister: 2
  }, 'hanafi')
  console.log(result, '1 daughter, 1 paternal_grand_daughter, 2 full_sister')
  // ✅ All madhhabs:
  // - Daughter gets 1/2 (Qur’an 4:11)
  // - Granddaughter gets 1/6 (with daughter present)
  // - Full sisters take remaining 1/3 as residuary
  checkResult(result, 'daughter', f(1,2))
  checkResult(result, 'paternal_grand_daughter', f(1,6))
  checkResult(result, 'full_sister', f(1,3))
})

test('father, 1 full_brother', () => {
  const result = calculate({ father: 1, full_brother: 1 }, 'hanafi')
  console.log(result, 'father, 1 full_brother')
  // ✅ All madhhabs:
  // - Father blocks full brother (closer male ancestor blocks siblings)
  checkResult(result, 'father', f(1))
})


test('1 wife, 1 son, mother', () => {
  const result = calculate({ wife: 1, son: 1, mother: 1 }, 'maliki')
  console.log(result, '1 wife, 1 son, mother')
  // ✅ All madhhabs:
  // - Wife gets 1/8
  // - Mother gets 1/6
  // - Son takes remainder
  checkResult(result, 'wife', f(1,8))
  checkResult(result, 'son', f(17,24))
  checkResult(result, 'mother', f(1,6))
})


test('husband, 2 full_sister', () => {
  const result = calculate({ husband: 1, full_sister: 2 }, 'hanafi')
  console.log(result, 'husband, 2 full_sister')
  // 🔁 This is an ‘awl case:
  // - Husband gets 1/2
  // - 2 sisters get 2/3
  // Total = 7/6 → reduced proportionally
  // - Hanafi applies ‘awl by adjusting: husband → 3/7, sisters → 4/7
  checkResult(result, 'husband', f(3,7))
  checkResult(result, 'full_sister', f(4,7))
})


test('husband, father, mother', () => {
  const result = calculate({ husband: 1, father: 1, mother: 1 }, 'hanafi')
  console.log(result, 'husband, father, mother')
  // ✅ All madhhabs:
  // - Husband: 1/2
  // - Mother: 1/6 (due to father)
  // - Father: takes remainder
  checkResult(result, 'husband', f(1,2))
  checkResult(result, 'father', f(1,3))
  checkResult(result, 'mother', f(1,6))
})


test('grandfather with full brother (hanafi)', () => {
  const result = calculate({ paternal_grand_father: 1, full_brother: 1 }, 'hanafi')
  console.log(result, 'grandfather with full brother (hanafi)')
  // 📛 Hanafi: Grandfather blocks full brother entirely (he replaces father)
  checkResult(result, 'paternal_grand_father', f(1, 1))
})
test('grandfather with full brother (shafii)', () => {
  const result = calculate({ paternal_grand_father: 1, full_brother: 1 }, 'shafii')
  console.log(result, 'grandfather with full brother (shafii)')
  // ✅ Other madhhabs: grandfather does NOT block full brother
  // Grandfather → 2/3, full brother → 1/3
  checkResult(result, 'paternal_grand_father', f(2, 3))
  checkResult(result, 'full_brother', f(1, 3))
})


test('maternal brother with full brother (hanafi)', () => {
  const result = calculate({ maternal_sibling: 1, full_brother: 1 }, 'hanafi')
  console.log(result, 'maternal brother with full brother (hanafi)')
  // ✅ Hanafi: maternal sibling gets 1/6 (Qur’an 4:12), not blocked by full brother
  checkResult(result, 'maternal_sibling', f(1,6))
})
test('maternal brother with full brother (shafii)', () => {
  const result = calculate({ maternal_sibling: 1, full_brother: 1 }, 'shafii')
  console.log(result, 'maternal brother with full brother (shafii)')
  // ❌ Shafi’i: full brother blocks maternal sibling
  expect(result.find(r => r.name === 'maternal_sibling')).toBeUndefined()
  checkResult(result, 'full_brother', f(1))
})

test('paternal grandmother exists (hanafi)', () => {
  const result = calculate({ paternal_grand_mother: 1 }, 'hanafi')
  console.log(result, 'paternal grandmother exists (hanafi)')
  // ✅ Hanafi: if no other heirs, she gets whole estate via Radd
  checkResult(result, 'paternal_grand_mother', f(1))
})
test('paternal grandmother exists (shafii)', () => {
  const result = calculate({ paternal_grand_mother: 1 }, 'shafii')
  console.log(result, 'paternal grandmother exists (shafii)')
  // ✅ All madhhabs: same here, takes entire estate due to Radd
  checkResult(result, 'paternal_grand_mother', f(1))
})


// test('daughter with son’s daughter (hanafi)', () => {
//   const result = calculate({ daughter: 1, paternal_grand_daughter: 1 }, 'hanafi')
//   console.log(result, 'daughter with son’s daughter (hanafi)')
//   // ❌ Hanafi: granddaughter gets only 1/4 (not 1/2), no taʿsīb
//   checkResult(result, 'daughter', f(3,4))
//   checkResult(result, 'paternal_grand_daughter', f(1,4))
// })

test('daughter with son’s daughter (hanafi)', () => {  /// ISSUE NEED TO FIXXXXXXX
  const result = calculate({ daughter: 1, paternal_grand_daughter: 1 }, 'hanafi')
  console.log(result, 'daughter with son’s daughter (hanafi) below the other start')
  // ❌ Hanafi: Daughter blocks granddaughter entirely.
  checkResult(result, 'daughter', f(1/2))
  expectHeirToBeBlocked(result, 'paternal_grand_daughter')
})


test('daughter with son’s daughter (shafii)', () => {
  const result = calculate({ daughter: 1, paternal_grand_daughter: 1 }, 'shafii')
  console.log(result, 'daughter with son’s daughter (shafii)')
  // ✅ Others: daughter 3/4, granddaughter 1/4, based on hadith of Hafsah (RA)
  checkResult(result, 'daughter', f(3,4))
  checkResult(result, 'paternal_grand_daughter', f(1,4))
})




test('father with maternal sibling (hanafi)', () => {
  const result = calculate({ father: 1, maternal_sibling: 1 }, 'hanafi')
  console.log(result, 'father with maternal sibling (hanafi)')
  // ✅ Hanafi: father does NOT block uterine sibling completely
  checkResult(result, 'maternal_sibling', f(1,6))
})
test('father with maternal sibling (shafii)', () => {
  const result = calculate({ father: 1, maternal_sibling: 1 }, 'shafii')
  console.log(result, 'father with maternal sibling (shafii)')
  // ❌ Others: father blocks maternal sibling fully
  expectHeirToBeBlocked(result, 'maternal_sibling')
})

// More FROM DEEPSEEK
// test('full_sister with no brothers (hanafi)', () => {
//   const result = calculate({ full_sister: 1 }, 'hanafi');
//   checkResult(result, 'full_sister', f(1/2)); // Fixed share only (no ta’sīb)
// });
// test('full_sister with no brothers (shafii)', () => {
//   const result = calculate({ full_sister: 1 }, 'shafii');
//   checkResult(result, 'full_sister', f(1)); // Inherits entire estate as ʿaṣaba
// });


// test('complex awl (3 wives, 2 daughters, mother)', () => {
//   const result = calculate({ wife: 3, daughter: 2, mother: 1 }, 'hanafi');
//   // Total shares: 3/24 (wives) + 2/3 (daughters) + 1/6 (mother) = 25/24 → apply awl
//   checkResult(result, 'wife', f(3,25)); 
//   checkResult(result, 'daughter', f(16,25));
//   checkResult(result, 'mother', f(4,25));
// });