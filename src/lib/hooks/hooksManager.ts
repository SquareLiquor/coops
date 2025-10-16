type HookFn<T> = (context: T) => Promise<void> | void
type CleanupFn<T> = (context: T) => Promise<void> | void

export type HookContext<T> = {
  hook: HookFn<T>
  cleanup?: CleanupFn<T>
}

export const createHook = <T>() => {
  const before: HookFn<T>[] = []
  const after: HookFn<T>[] = []
  const cleanup: CleanupFn<T>[] = []

  return {
    before: ({ hook: fn, cleanup: cleanupFn }: HookContext<T>) => {
      before.push(fn)
      cleanupFn && cleanup.push(cleanupFn)
    },
    after: ({ hook: fn, cleanup: cleanupFn }: HookContext<T>) => {
      after.push(fn)
      cleanupFn && cleanup.push(cleanupFn)
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
