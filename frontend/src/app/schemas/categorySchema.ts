import * as Yup from 'yup'
import baseModelSchema from './common'

const baseCategorySchema = Yup.object().shape({
  name: Yup.string().required('Tên danh mục là bắt buộc')
})

export const categorySchema = baseCategorySchema.concat(baseModelSchema).concat(Yup.object().shape({
  adminId: Yup.string(),
  isDelete: Yup.boolean()
}))

export type Category = Yup.InferType<typeof categorySchema>
export type CategoryRequest = Yup.InferType<typeof baseCategorySchema>
export interface CategoryListing {
  _id: string
  name: string
  isDelete: boolean
  createdAt: string
}