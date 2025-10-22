import type { RemoteFormInput } from '@sveltejs/kit'

// 제네릭 FormData 타입
export type FormDataObject<K extends string> = {
  [key in K]: string | undefined
}

/**
 * RemoteFormInput 데이터에서 지정된 필드들을 추출합니다.
 *
 * @template T 필드 값의 타입 (기본값: string)
 * @template K 필드 이름들의 유니온 타입
 * @param data SvelteKit RemoteFormInput 객체
 * @param items 추출할 필드 이름들의 배열
 * @returns 추출된 필드들을 포함하는 FormData 객체
 */
export const extractRemoteFormData = async <K extends string>(
  data: RemoteFormInput,
  items: K[]
): Promise<FormDataObject<K>> => {
  const result = {} as FormDataObject<K>

  for (const field of items) {
    const value = data[field]

    if (value !== undefined && value !== null) {
      result[field] = typeof value === 'string' ? value : String(value)
    } else {
      result[field] = undefined
    }
  }

  return result
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
export const extractFormData = async <K extends string>(data: FormData, items: K[]): Promise<FormDataObject<K>> => {
  const result = {} as FormDataObject<K>

  for (const item of items) {
    const value = data.get(item)

    if (value !== undefined && value !== null) {
      result[item] = typeof value === 'string' ? value : String(value)
    } else {
      result[item] = undefined
    }
  }

  return result
}
