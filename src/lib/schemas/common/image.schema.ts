import * as v from 'valibot'

export const ImageSchema = v.pipe(
  v.object({
    id: v.optional(v.string()),
    url: v.string(),
    path: v.string(),
    representative: v.boolean(),
    sortOrder: v.number(),
    new: v.boolean(),
    use: v.boolean(),
  })
)

export type ImageInput = v.InferInput<typeof ImageSchema>
