import type { EnumItem } from '$lib/types/common/enums'

export const lookupEnum = <T extends EnumItem>(enumObj: { [key: string]: T }, code: string): T | undefined => {
  return Object.values(enumObj).find((item) => item.code === code)
}

export const equalsEnum = (a?: EnumItem | null, b?: EnumItem | null): boolean => {
  if (!a || !b) return false
  return a.code === b.code
}
