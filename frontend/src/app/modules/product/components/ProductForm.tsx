import { FieldArray, Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import React, { useState } from 'react';
import AsyncPicker from '../../../reusableWidgets/AsyncPicker';
import { useQuery } from 'react-query';
import { getCategories, getCategory } from '../../../apiClient/categories';
import { useNavigate, NavigateFunction } from 'react-router-dom';

const productSchemaRequest = Yup.object().shape({
  code: Yup.string().required('Mã sản phẩm là bắt buộc'),
  name: Yup.string().required('Tên sản phẩm là bắt buộc'),
  description: Yup.string()
    .max(1000, 'Mô tả không được vượt quá 1000 ký tự')
    .default(''),
  price: Yup.number()
    .min(0, 'Giá không được nhỏ hơn 0')
    .required('Giá là bắt buộc'),
  attributes: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().required('Tên thuộc tính là bắt buộc'),
        value: Yup.string().required('Giá trị thuộc tính là bắt buộc'),
      }),
    )
    .default([]),
  isDelete: Yup.boolean().required('Trạng thái là bắt buộc'),
  image: Yup.mixed<File>().optional(),
  categoryId: Yup.string().required('Danh mục là bắt buộc'),
});

export type ProductFormRequest = Yup.InferType<typeof productSchemaRequest>;

export type ProductFormInitialValues = Omit<ProductFormRequest, 'image'>;

interface ProductFormProps {
  initialValues: ProductFormInitialValues;
  imageUrl?: string;
  onSubmit: (values: ProductFormRequest) => void;
  isEdit?: boolean;
}

const renderAttributeError = (
  formikOptions: FormikProps<ProductFormRequest>,
  index: number,
) => {
  const touched = !!formikOptions.touched.attributes;
  const errors = formikOptions.errors.attributes?.[index];

  if (!touched || !errors) return null;

  if (typeof errors === 'string') {
    return <div className='text-danger'>{errors}</div>;
  }

  return <div className='text-danger'>{Object.values(errors).join(' - ')}</div>;
};

const renderAttributes: React.FC<FormikProps<ProductFormRequest>> = (
  formikOptions,
) => {
  return (
    <FieldArray name="attributes">
      {(props) => (
        <>
          {formikOptions.values.attributes?.map(({ name, value }, index) => (
            <div key={index}>
              <div className="col-12 d-flex gap-2 align-items-start">
                <div className="input-group" style={{ maxWidth: "300px" }}>
                  <span className="input-group-text">Tên thuộc tính</span>
                  <input
                    type="text"
                    onChange={formikOptions.handleChange}
                    onBlur={formikOptions.handleBlur}
                    name={`attributes.${index}.name`}
                    value={name}
                    className="form-control"
                    placeholder="Nhập tên thuộc tính"
                  />
                </div>

                <div className="input-group" style={{ maxWidth: "400px" }}>
                  <span className="input-group-text">Giá trị</span>
                  <input
                    type="text"
                    onChange={formikOptions.handleChange}
                    onBlur={formikOptions.handleBlur}
                    name={`attributes.${index}.value`}
                    value={value}
                    className="form-control"
                    placeholder="Nhập giá trị"
                  />
                </div>

                <button
                  type="button"
                  className="btn btn-icon btn-light-danger"
                  style={{ width: "45px" }}
                  onClick={() => props.remove(index)}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>

              {renderAttributeError(formikOptions, index)}
            </div>
          ))}

          <div className="col-12">
            <button
              type="button"
              className="btn btn-light-primary"
              onClick={() => props.push({ name: "", value: "" })}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Thêm thuộc tính
            </button>
          </div>
        </>
      )}
    </FieldArray>
  );
};

const renderForm = (
  formikOptions: FormikProps<ProductFormRequest>,
  isEdit: boolean,
  navigate: NavigateFunction,
  imageUrl?: string,
) => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<{
    _id: string;
    name: string;
  } | null>(null);

  useQuery({
    queryKey: ['categories', 'detail'],
    queryFn: () => getCategory(formikOptions.values.categoryId),
    enabled: !!formikOptions.values.categoryId,
    cacheTime: 0,
    onSuccess: (data) => {
      setSelectedCategory(data);
    },
  });

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories', page, searchTerm],
    queryFn: () =>
      getCategories({
        pagination: {
          page,
          limit: 5,
        },
        search: {
          name: searchTerm,
        },
      }),
    cacheTime: 0,
    keepPreviousData: true,
  });

  return (
    <form className="form" onSubmit={formikOptions.handleSubmit}>
      <div className="row mb-3">
        <div className="col-md-6 mb-3">
          <label className="form-label required">Chọn danh mục sản phẩm</label>
          <AsyncPicker
            items={categories?.data || []}
            isLoading={isLoading}
            itemToString={(item) => item?.name || ""}
            itemToKey={(item) => item?._id || ""}
            selectedItem={selectedCategory}
            placeholder={"--- Chọn danh mục sản phẩm ---"}
            onPageChange={(page) => setPage(page)}
            page={page}
            totalPages={categories?.totalPages || 0}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSelectedItemChange={(item) => {
              formikOptions.setFieldValue("categoryId", item?._id);
              setSelectedCategory(item);
            }}
          />
          {formikOptions.touched.categoryId &&
            formikOptions.errors.categoryId && (
              <div className="text-danger">
                {formikOptions.errors.categoryId}
              </div>
            )}
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label required">Mã sản phẩm</label>
          <input
            type="text"
            onChange={formikOptions.handleChange}
            onBlur={formikOptions.handleBlur}
            value={formikOptions.values.code}
            className="form-control"
            name="code"
          />
          {formikOptions.touched.code && formikOptions.errors.code && (
            <div className="text-danger">{formikOptions.errors.code}</div>
          )}
        </div>

        <div className="col-12 mb-3">
          <label className="form-label required">Tên sản phẩm</label>
          <input
            type="text"
            onChange={formikOptions.handleChange}
            onBlur={formikOptions.handleBlur}
            value={formikOptions.values.name}
            className="form-control"
            name="name"
          />
          {formikOptions.touched.name && formikOptions.errors.name && (
            <div className="text-danger">{formikOptions.errors.name}</div>
          )}
        </div>

        <div className="col-12 mb-3">
          <label className="form-label">Ảnh sản phẩm</label>
          {imageUrl && (
            <div className="mb-3">
              <img src={imageUrl} alt="Ảnh sản phẩm" style={{ maxWidth: 200 }} />
            </div>
          )}
          <input
            type="file"
            onChange={(e) => {
              formikOptions.setFieldValue("image", e.target.files?.[0]);
            }}
            onBlur={formikOptions.handleBlur}
            className="form-control"
            name="image"
            accept="image/*"
          />
          {formikOptions.touched.image && formikOptions.errors.image && (
            <div className="text-danger">{formikOptions.errors.image}</div>
          )}
        </div>

        <div className="col-12 mb-3">
          <label className="form-label required">Thuộc tính sản phẩm</label>
          <div className="row g-3">{renderAttributes(formikOptions)}</div>
          <small className="text-muted mt-2 d-block">
            Ví dụ: size, màu sắc, hình dạng...
          </small>
        </div>

        <div className="col-12 mb-3">
          <label className="form-label">Mô tả sản phẩm</label>
          <textarea
            name="description"
            onChange={formikOptions.handleChange}
            onBlur={formikOptions.handleBlur}
            value={formikOptions.values.description}
            className="form-control"
          />
          <small className="text-muted mt-2 d-block">
            Ví dụ: sản phẩm này là...
          </small>
          {formikOptions.touched.description &&
            formikOptions.errors.description && (
              <div className="text-danger">
                {formikOptions.errors.description}
              </div>
            )}
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label required">Giá nhập</label>
          <div className="input-group">
            <input
              type="number"
              min={0}
              name="price"
              onChange={formikOptions.handleChange}
              onBlur={formikOptions.handleBlur}
              value={formikOptions.values.price}
              className="form-control"
            />
            <span className="input-group-text">VND</span>
          </div>
          {formikOptions.touched.price && formikOptions.errors.price && (
            <div className="text-danger">{formikOptions.errors.price}</div>
          )}
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label required">Trạng thái</label>
          <select
            name="isDelete"
            onChange={(e) => {
              formikOptions.setFieldValue(
                "isDelete",
                e.target.value === "true",
              );
            }}
            onBlur={formikOptions.handleBlur}
            value={formikOptions.values.isDelete ? "true" : "false"}
            className="form-select"
          >
            <option value="true">Inactive</option>
            <option value="false">Active</option>
          </select>
          {formikOptions.touched.isDelete && formikOptions.errors.isDelete && (
            <div className="text-danger">{formikOptions.errors.isDelete}</div>
          )}
        </div>
      </div>

      <div className="d-flex justify-content-end">
        <button
          type="button"
          className="btn btn-light me-3"
          disabled={formikOptions.isSubmitting}
          onClick={() => navigate('/apps/products')}
        >
          Hủy
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={formikOptions.isSubmitting}
        >
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

const ProductForm: React.FC<ProductFormProps> = ({
  initialValues,
  onSubmit,
  isEdit,
  imageUrl,
}) => {
  const navigate = useNavigate();

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={productSchemaRequest}
    >
      {(formikOptions) => renderForm(formikOptions, isEdit ?? false, navigate, imageUrl)}
    </Formik>
  );
};

export default ProductForm;
