import type { RemoteFormInput } from '@sveltejs/kit'

/**
 * Returns the formData items you request.
 *
 * @example const { email, password } = await getFormData(data, 'email', 'password')
 */
export const getFormData = async <T = string, K extends string = string>(
  data: RemoteFormInput,
  ...items: K[]
): Promise<{ [key in K]: T }> => {
  const result: { [key: string]: T } = {}

  for (const i of items.values()) {
    if (data[i] !== null) result[i] = data[i] as T
  }

  return result as { [key in K]: T }
}

/**
 * Extracts specified fields from a Request's form data.
 *
 * @param request - The Request object containing form data.
 * @param fields - The names of the fields to extract.
 * @returns An object mapping field names to their string values.
 *
 * @example
 * const { email, password } = await getRequestFormData(request, 'email', 'password');
 */
export const getRequestFormData = async <T = string, K extends string = string>(
  request: Request,
  ...items: K[]
): Promise<{ [key in K]: T }> => {
  const formData = await request.formData()

  const result: { [key: string]: T } = {}

  for (const i of items.values()) {
    const value = formData.get(i)
    if (value !== null) result[i] = formData.get(i) as T
  }

  return result as { [key in K]: T }
}
