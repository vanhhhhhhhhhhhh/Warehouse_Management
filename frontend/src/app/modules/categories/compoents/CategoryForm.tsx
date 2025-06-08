import { Formik, FormikProps } from "formik";
import { CategoryRequest, categorySchema } from "../../../schemas/categorySchema";
import React from "react";

interface CategoryFormProps {
  initialValues: CategoryRequest;
  onSubmit: (values: CategoryRequest) => void;
  isEdit?: boolean;
}

const renderForm = (formikOptions: FormikProps<CategoryRequest>, isEdit: boolean) => {
  return (
    <form onSubmit={formikOptions.handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Tên danh mục</label>
        <input
          type="text"
          name="name"
          className="form-control"
          value={formikOptions.values.name}
          onChange={formikOptions.handleChange}
          required
        />
        {formikOptions.errors.name && (
          <div className="text-danger">{formikOptions.errors.name}</div>
        )}
      </div>
      <button type="submit" className="btn btn-primary">
        {getLabel(formikOptions.isSubmitting, isEdit)}
      </button>
    </form>
  )
}

const getLabel = (isLoading: boolean, isEdit: boolean): string => {
  if (isEdit) {
    if (isLoading) {
      return 'Đang cập nhật...'
    }
    return 'Cập nhật'
  }
  if (isLoading) {
    return 'Đang tạo...'
  }
  return 'Tạo mới'
}

const CategoryForm: React.FC<CategoryFormProps> = ({ initialValues, onSubmit, isEdit }) => {
  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={categorySchema}>
      {(formikOptions) => renderForm(formikOptions, isEdit ?? false)}
    </Formik>
  )
}

export default CategoryForm