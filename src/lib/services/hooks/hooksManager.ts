/**
 * Hook Manager - 비즈니스 로직의 생명주기 관리
 *
 * = 기본 개념 =
 * 1. before: 메인 로직 실행 전 처리 (데이터 준비, 검증 등)
 * 2. after: 메인 로직 실행 후 처리 (후속 작업, 알림 등)
 * 3. cleanup: 에러 발생 시 롤백 처리 (생성된 데이터 삭제, 상태 복원)
 *
 * = 공유 상태 (SharedState) =
 * - hook 간 데이터 공유를 위한 전역 Map
 * - shared.set('key', value): 데이터 저장
 * - shared.get('key'): 데이터 조회
 * - hook 인스턴스 레벨에서 유지되어 어느 메소드에서든 접근 가능
 *
 * = Cleanup 실패 시 복원 전략 =
 * 1. Retry 메커니즘: 지수 백오프로 재시도
 * 2. Dead Letter Queue: 실패한 작업을 별도 저장 후 나중에 재처리
 * 3. Circuit Breaker: 연속 실패 시 일시 중단
 * 4. Idempotent Design: cleanup을 멱등성 있게 설계
 * 5. Compensation Transaction: cleanup 대신 보상 트랜잭션으로 일관성 복구
 * 6. Manual Intervention: 완전 실패 시 관리자 개입 알림
 * 7. Monitoring & Alerting: 실패 상황 모니터링 및 알림 시스템
 */

// TODO: HookWithMeta<T> 타입을 도입하여 hook에 priority, condition 등 메타데이터를 지원할 것
// type HookWithMeta<T> = {
//   hook: HookFn<T>
//   priority?: number
//   condition?: (context: T) => boolean
// }
type SharedState = Map<string, any>

type HookFn<T, R = any> = (context: T, shared: SharedState) => Promise<R> | R
type CleanupFn<T> = (context: T, shared: SharedState) => Promise<void> | void

export type HookContext<T, R = any> = {
  hook?: HookFn<T, R>
  cleanup?: CleanupFn<T>
}

const addIfNotExists = <F extends Function>(arr: F[], fn?: F) => {
  if (fn && !arr.includes(fn)) arr.push(fn)
}

export const createHook = <T, R = any>() => {
  const before: HookFn<T, R>[] = []
  const after: HookFn<T, R>[] = []
  const cleanup: CleanupFn<T>[] = []

  // 전역 shared state - 이 hook 인스턴스 내에서 지속됨
  let globalShared: SharedState = new Map()

  return {
    before: ({ hook: fn, cleanup: cleanupFn }: HookContext<T, R>) => {
      addIfNotExists(before, fn)
      addIfNotExists(cleanup, cleanupFn)
    },
    after: ({ hook: fn, cleanup: cleanupFn }: HookContext<T, R>) => {
      addIfNotExists(after, fn)
      addIfNotExists(cleanup, cleanupFn)
    },
    cleanup: ({ cleanup: cleanupFn }: HookContext<T>) => {
      addIfNotExists(cleanup, cleanupFn)
    },
    runBefore: async (context: T): Promise<{ results: R[]; shared: SharedState }> => {
      const results: R[] = []

      // 초기 context를 shared state에 저장
      globalShared.set('initialContext', context)

      for (const fn of before) {
        const result = await fn(context, globalShared)
        results.push(result)
      }

      return { results, shared: globalShared }
    },
    runAfter: async (context: T): Promise<{ results: R[]; shared: SharedState }> => {
      const results: R[] = []

      // 초기 context를 shared state에 저장 (없을 경우)
      if (!globalShared.has('initialContext')) {
        globalShared.set('initialContext', context)
      }

      for (const fn of after) {
        const result = await fn(context, globalShared)
        results.push(result)
      }

      return { results, shared: globalShared }
    },
    runCleanup: async (context: T) => {
      if (!globalShared.has('initialContext')) {
        globalShared.set('initialContext', context)
      }

      for (const fn of cleanup) {
        await fn(context, globalShared)
      }
    },

    // shared state 초기화 메소드 추가
    resetShared: () => {
      globalShared.clear()
    },

    // shared state 접근 메소드 추가
    getShared: () => globalShared,
  }
}
