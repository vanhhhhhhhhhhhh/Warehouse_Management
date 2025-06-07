import * as Yup from 'yup'

export default Yup.object().shape({
  _id: Yup.string().default(''),
  createdAt: Yup.date().default(new Date()),
  updatedAt: Yup.date().default(new Date())
})