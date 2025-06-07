import * as Yup from 'yup'
import baseModelSchema from './common'

const baseProductSchema = Yup.object().shape({
  code: Yup.string().required('Mã sản phẩm là bắt buộc'),
  name: Yup.string().required('Tên sản phẩm là bắt buộc'),
  description: Yup.string().max(1000, 'Mô tả không được vượt quá 1000 ký tự'),
  price: Yup.number().min(0, 'Giá không được nhỏ hơn 0').required('Giá là bắt buộc'),
  attributes: Yup.array().of(Yup.object().shape({
    name: Yup.string().required('Tên thuộc tính là bắt buộc'),
    value: Yup.string().required('Giá trị thuộc tính là bắt buộc')
  })),
  isDelete: Yup.boolean().required('Trạng thái là bắt buộc')
})

//used for response in GET /products/:id and PUT /products/:id, a whole product object is returned
const productSchema = baseProductSchema.concat(baseModelSchema).concat(Yup.object().shape({
  imageUrl: Yup.string(),
  categoryId: Yup.string(),
  adminId: Yup.string()
}))

const productSchemaRequest = baseProductSchema.concat(Yup.object().shape({
  image: Yup.mixed<File>().optional(),
  categoryId: Yup.string().required('Danh mục là bắt buộc'),
}))


export type Product = Yup.InferType<typeof productSchema>

export type ProductRequest = Yup.InferType<typeof productSchemaRequest>

//for list response, we only need to get the fields that we need
export interface ProductListing {
  _id: string
  code: string
  name: string
  category: string
  price: number,
  isDelete: boolean
}

export { productSchema, productSchemaRequest }