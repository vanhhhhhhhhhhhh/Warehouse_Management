import * as Yup from 'yup'
import { BaseModel } from './common'

const productSchema = Yup.object().shape({
  code: Yup.string().required('Mã sản phẩm là bắt buộc'),
  name: Yup.string().required('Tên sản phẩm là bắt buộc'),
  category: Yup.string().required('Danh mục là bắt buộc'),
  description: Yup.string().max(1000, 'Mô tả không được vượt quá 1000 ký tự').default(''),
  price: Yup.number().min(0, 'Giá không được nhỏ hơn 0').required('Giá là bắt buộc'),
  attributes: Yup.array().of(Yup.object().shape({
    name: Yup.string().required('Tên thuộc tính là bắt buộc'),
    value: Yup.string().required('Giá trị thuộc tính là bắt buộc')
  })).default([]),
  imageUrl: Yup.string().url('URL ảnh không hợp lệ').optional(),
  isDelete: Yup.boolean().default(false)
})

export type Product = Yup.InferType<typeof productSchema> & BaseModel & {
  adminId: string
}

export default productSchema