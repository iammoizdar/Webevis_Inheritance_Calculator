import { half, quarter, eighth, sixth, third, nothing, twoThird } from './quota'
import { FardHeir } from './heir'
import {
  count,
  exists,
  hasChild,
  hasGroupOfSiblings,
  hasPaternalMaleAncestor
} from './utils'

const Husband: FardHeir = {
  name: 'husband',
  share: function(heirs, _madhhab) {
    if (hasChild(heirs)) return quarter
    return half
  }
}

const Wife: FardHeir = {
  name: 'wife',
  share: function(heirs, _madhhab) {
    if (hasChild(heirs)) return eighth
    return quarter
  }
}

const Daughter: FardHeir = {
  name: 'daughter',
  share: function(heirs, _madhhab) {
    if (exists(heirs, 'son')) return nothing
    if (count(heirs, this.name) === 1) return half
    return twoThird
  }
}

const PaternalGrandDaughter: FardHeir = {
  name: 'paternal_grand_daughter',
  share: function(heirs, madhhab) {
    if (exists(heirs, 'son') || exists(heirs, 'paternal_grand_son')) return nothing
if (count(heirs, 'daughter') > 1) {
  if (madhhab === 'hanafi') return nothing
  return sixth // or use taʿsīb fallback in other madhhabs if applicable
}
    if (count(heirs, 'daughter') === 1) return sixth
    if (count(heirs, this.name) === 1) return half
    return twoThird
  }
}

const Father: FardHeir = {
  name: 'father',
  share: function(heirs, _madhhab) {
    if (hasChild(heirs)) return sixth
    return nothing
  }
}

const Mother: FardHeir = {
  name: 'mother',
  share: function(heirs, _madhhab) {
    if (hasChild(heirs) || hasGroupOfSiblings(heirs)) return sixth
    return third
  }
}

// const PaternalGrandFather: FardHeir = {
//   name: 'paternal_grand_father',
//   share: function(heirs, madhhab) {
//     if (exists(heirs, 'father')) return nothing
//     if (hasChild(heirs)) return sixth
//     if (madhhab === 'hanafi') {
//       if (exists(heirs, 'full_brother') || exists(heirs, 'full_sister')) return nothing
//     }
//     return nothing
//   }
// }
const PaternalGrandFather: FardHeir = {
  name: 'paternal_grand_father',
  share: function(heirs, madhhab) {
    if (exists(heirs, 'father')) return nothing
    if (hasChild(heirs)) return sixth

    if (madhhab === 'hanafi') {
      // Hanafi excludes paternal grandfather if full siblings exist
      if (exists(heirs, 'full_brother') || exists(heirs, 'full_sister')) return nothing
    }

    // If no father, no children, and no full siblings (Hanafi or others)
    return nothing
  }
}


const PaternalGrandMother: FardHeir = {
  name: 'paternal_grand_mother',
  share: function(heirs, madhhab) {
    if (exists(heirs, 'father') || exists(heirs, 'mother')) return nothing
    return sixth
  }
}

const MaternalGrandMother: FardHeir = {
  name: 'maternal_grand_mother',
  share: function(heirs, madhhab) {
    if (exists(heirs, 'mother')) return nothing
    return sixth
  }
}

const FullSister: FardHeir = {
  name: 'full_sister',
  share: function(heirs, madhhab) {
    if (hasChild(heirs) || hasPaternalMaleAncestor(heirs)) return nothing
    if (exists(heirs, 'full_brother')) return nothing
    if (count(heirs, this.name) === 1) return half
    return twoThird
  }
}

const PaternalSister: FardHeir = {
  name: 'paternal_sister',
  share: function(heirs, madhhab) {
    if (hasChild(heirs) || hasPaternalMaleAncestor(heirs)) return nothing
    if (exists(heirs, 'full_brother') || exists(heirs, 'paternal_brother')) return nothing
    if (count(heirs, 'full_sister') > 1) return nothing
    if (count(heirs, 'full_sister') === 1) {
      if (count(heirs, this.name) === 1) return sixth
      return nothing
    }
    if (count(heirs, this.name) === 1) return half
    return twoThird
  }
}

const MaternalSibling: FardHeir = {
  name: 'maternal_sibling',
  share: function(heirs, madhhab) {
    if (hasChild(heirs)) return nothing
    if (madhhab !== 'hanafi' && (exists(heirs, 'father') || exists(heirs, 'full_brother') || exists(heirs, 'full_sister'))) {
      return nothing
    }
    if (count(heirs, this.name) === 1) return sixth
    return third
  }
}

const FullBrother: FardHeir = {
  name: 'full_brother',
  share: function(heirs, madhhab) {
    if (madhhab === 'hanafi') {
      // Hanafi: full brother usually inherits only as tasib (no fixed share)
      return nothing
    } else {
      // Shafii and others:
      // If no sons/daughters, full brother may inherit 1/3 fixed share
      if (!exists(heirs, 'son') && !exists(heirs, 'daughter')) {
        return third
      }
      return nothing
    }
  }
}


const fhs: FardHeir[] = [
  Daughter,
  Father,
  FullSister,
  Husband,
  MaternalGrandMother,
  MaternalSibling,
  Mother,
  PaternalGrandDaughter,
  PaternalGrandFather,
  PaternalGrandMother,
  PaternalSister,
  Wife,
  FullBrother
]

export default fhs
