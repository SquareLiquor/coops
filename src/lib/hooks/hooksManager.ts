// TODO: HookWithMeta<T> 타입을 도입하여 hook에 priority, condition 등 메타데이터를 지원할 것
// type HookWithMeta<T> = {
//   hook: HookFn<T>
//   priority?: number
//   condition?: (context: T) => boolean
// }
type HookFn<T> = (context: T) => Promise<void> | void
type CleanupFn<T> = (context: T) => Promise<void> | void

export type HookContext<T> = {
  hook?: HookFn<T>
  cleanup?: CleanupFn<T>
}

const addIfNotExists = <F extends Function>(arr: F[], fn?: F) => {
  if (fn && !arr.includes(fn)) arr.push(fn)
}

export const createHook = <T>() => {
  const before: HookFn<T>[] = []
  const after: HookFn<T>[] = []
  const cleanup: CleanupFn<T>[] = []

  return {
    before: ({ hook: fn, cleanup: cleanupFn }: HookContext<T>) => {
      addIfNotExists(before, fn)
      addIfNotExists(cleanup, cleanupFn)
    },
    after: ({ hook: fn, cleanup: cleanupFn }: HookContext<T>) => {
      addIfNotExists(after, fn)
      addIfNotExists(cleanup, cleanupFn)
    },
    cleanup: ({ cleanup: cleanupFn }: HookContext<T>) => {
      addIfNotExists(cleanup, cleanupFn)
    },
    runBefore: async (context: T) => {
      for (const fn of before) await fn(context)
    },
    runAfter: async (context: T) => {
      for (const fn of after) await fn(context)
    },
    runCleanup: async (context: T) => {
      for (const fn of cleanup) await fn(context)
    },
  }
}
