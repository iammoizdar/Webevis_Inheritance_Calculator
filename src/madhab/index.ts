import { FardHeir } from '../heir'
import { Result } from '../result'
import { applyAwl, applyRadd, applyUmariyyah } from './hanafi'
export interface MadhhabFunctions {
  applyAwl: (heirs: FardHeir[]) => FardHeir[]
  applyRadd: (heirs: FardHeir[], results: Result[]) => Result[]
  applyUmariyyah: (heirs: FardHeir[]) => FardHeir[] | null
}

export const getMadhhabFunctions = (madhhab: string): MadhhabFunctions => {
  switch (madhhab?.toLowerCase()) {
    case 'hanafi':
      return { applyAwl, applyRadd, applyUmariyyah }
    default:
      return {
        applyAwl: heirs => heirs,
        applyRadd: (_heirs, results) => results,
        applyUmariyyah: () => null,
      }
  }
}
