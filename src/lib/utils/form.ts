import type { FormData } from '$lib/types'
import type { RemoteFormInput } from '@sveltejs/kit'

/**
 * RemoteFormInput 데이터에서 지정된 필드들을 추출합니다.
 *
 * @template T 필드 값의 타입 (기본값: string)
 * @template K 필드 이름들의 유니온 타입
 * @param data SvelteKit RemoteFormInput 객체
 * @param items 추출할 필드 이름들의 배열
 * @returns 추출된 필드들을 포함하는 FormData 객체
 */
export const extractRemoteFormFields = async <T = string, K extends string = string>(
  data: RemoteFormInput,
  items: K[]
): Promise<FormData<T, K>> => {
  const result: { [key: string]: T } = {}

  for (const i of items.values()) {
    if (data[i] !== null) result[i] = data[i] as T
  }

  return result as FormData<T, K>
}

/**
 * HTTP Request의 FormData에서 지정된 필드들을 추출합니다.
 *
 * @template T 필드 값의 타입 (기본값: string)
 * @template K 필드 이름들의 유니온 타입
 * @param request HTTP Request 객체 (FormData 포함)
 * @param items 추출할 필드 이름들의 배열
 * @returns 추출된 필드들을 포함하는 FormData 객체
 */
export const extractFormFields = async <T = string, K extends string = string>(
  request: Request,
  items: K[]
): Promise<FormData<T, K>> => {
  const formDataRaw = await request.formData()

  const result: { [key: string]: T } = {}

  for (const item of items) {
    const value = formDataRaw.get(item)
    if (value !== null) {
      result[item] = value as T
    }
  }

  return result as FormData<T, K>
}
