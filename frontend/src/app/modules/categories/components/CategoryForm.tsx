import { Formik, FormikProps } from "formik";
import * as Yup from 'yup';
import React from "react";
import { LineController } from "chart.js";
import { Link } from "react-router-dom";

const categorySchemaRequest = Yup.object().shape({
  name: Yup.string()
    .required('Tên danh mục là bắt buộc')
    .min(3, 'Tên danh mục phải có ít nhất 3 ký tự')
    .max(255, 'Tên danh mục không được vượt quá 255 ký tự')
    .trim(),
});

export type CategoryFormRequest = Yup.InferType<typeof categorySchemaRequest>;

export type CategoryFormInitialValues = CategoryFormRequest;

interface CategoryFormProps {
  initialValues: CategoryFormInitialValues;
  onSubmit: (values: CategoryFormRequest) => void;
  isEdit?: boolean;
}

const renderForm = (formikOptions: FormikProps<CategoryFormRequest>, isEdit: boolean) => {
  return (
    <form className="form" onSubmit={formikOptions.handleSubmit}>
      <div className="row mb-3">
        <div className="col-12 mb-3">
          <label className="form-label required">Tên danh mục</label>
          <input
            type="text"
            onChange={formikOptions.handleChange}
            onBlur={formikOptions.handleBlur}
            value={formikOptions.values.name}
            className="form-control"
            name="name"
            placeholder="Nhập tên danh mục"
          />
          {formikOptions.touched.name && formikOptions.errors.name && (
            <div className="text-danger">{formikOptions.errors.name}</div>
          )}
        </div>
      </div>

      <div className="d-flex justify-content-end">
        <Link to="/apps/categories">
          <button type="button" className="btn btn-light me-3" disabled={formikOptions.isSubmitting}>
            Hủy
          </button>
        </Link>
        <button type="submit" className="btn btn-primary" disabled={formikOptions.isSubmitting}>
          {getLabel(formikOptions.isSubmitting, isEdit)}
        </button>
      </div>
    </form>
  );
};

const getLabel = (isLoading: boolean, isEdit: boolean): string => {
  if (isLoading) {
    if (isEdit) {
      return 'Đang cập nhật...';
    }
    return 'Đang tạo...';
  } else {
    if (isEdit) {
      return 'Cập nhật';
    }

    return 'Tạo';
  }
};

const CategoryForm: React.FC<CategoryFormProps> = ({ initialValues, onSubmit, isEdit }) => {
  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={categorySchemaRequest}>
      {(formikOptions) => renderForm(formikOptions, isEdit ?? false)}
    </Formik>
  );
};

export default CategoryForm;
