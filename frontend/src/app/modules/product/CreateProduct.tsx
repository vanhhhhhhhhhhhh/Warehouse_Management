import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Select from 'react-select';

// Mock data for categories
const mockCategories = [
  { _id: '1', name: 'Điện tử' },
  { _id: '2', name: 'Gia dụng' },
  { _id: '3', name: 'Thời trang' },
  { _id: '4', name: 'Mỹ phẩm' },
  { _id: '5', name: 'Thực phẩm' },
];

const CreateProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(mockCategories);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const initialValues = {
    category: '',
    name: '',
    code: '',
    image: null,
    attributes: [],
    unit: '',
    costPrice: '',
    price: '',
    weight: '',
    expiryDate: '',
    status: 'Active',
    priceLevels: [],
  };

  const validationSchema = Yup.object().shape({
    category: Yup.string().required('Vui lòng chọn danh mục'),
    name: Yup.string()
      .required('Vui lòng nhập tên sản phẩm')
      .min(3, 'Tên sản phẩm phải có ít nhất 3 ký tự')
      .max(100, 'Tên sản phẩm không được vượt quá 100 ký tự'),
    code: Yup.string()
      .required('Vui lòng nhập mã sản phẩm')
      .min(3, 'Mã sản phẩm phải có ít nhất 3 ký tự')
      .max(20, 'Mã sản phẩm không được vượt quá 20 ký tự'),
    unit: Yup.string()
      .required('Vui lòng nhập đơn vị tính')
      .max(20, 'Đơn vị tính không được vượt quá 20 ký tự'),
    image: Yup.mixed()
      .required('Vui lòng chọn ảnh sản phẩm')
      .test('fileSize', 'Kích thước file không được vượt quá 5MB', (value) => {
        if (!value) return true;
        return value.size <= 5 * 1024 * 1024;
      }),
    costPrice: Yup.number()
      .transform((value) => (isNaN(value) ? undefined : value))
      .nullable(),
    weight: Yup.number()
      .required('Vui lòng nhập trọng lượng')
      .min(0, 'Trọng lượng không được âm'),
    expiryDate: Yup.number()
      .required('Vui lòng nhập vòng đời sử dụng')
      .min(0, 'Vòng đời sử dụng không được âm'),
    status: Yup.string()
      .required('Vui lòng chọn trạng thái')
      .oneOf(['Active', 'Inactive'], 'Trạng thái không hợp lệ'),
    priceLevels: Yup.array()
      .min(1, 'Vui lòng thêm ít nhất một mức giá')
      .test(
        'valid-quantities',
        'Số lượng phải lớn hơn hoặc bằng 1',
        (value) => {
          return value?.every((level) => level.quantity >= 1);
        }
      )
      .test('valid-prices', 'Giá bán không được âm', (value) => {
        return value?.every((level) => level.price >= 0);
      })
      .test(
        'required-fields',
        'Vui lòng điền đầy đủ thông tin cho mức giá',
        (value) => {
          return value?.every(
            (level) => level.quantity && level.price !== undefined
          );
        }
      ),
    attributes: Yup.array()
      .min(1, 'Vui lòng thêm ít nhất một thuộc tính')
      .test(
        'valid-attributes',
        'Vui lòng điền đầy đủ thông tin thuộc tính',
        function (value) {
          if (!value || value.length === 0) return true;
          return !value.some(
            (attr) => (!attr.name && attr.value) || (attr.name && !attr.value)
          );
        }
      ),
  });

  const getSelectStyles = (hasError) => ({
    control: (base, { isFocused }) => ({
      ...base,
      minHeight: '44px',
      height: '44px',
      borderColor: hasError ? '#F1416C' : isFocused ? '#009ef7' : '#e4e6ef',
      boxShadow: 'none',
      '&:hover': {
        borderColor: hasError ? '#F1416C' : '#009ef7',
      },
    }),
    valueContainer: (base) => ({
      ...base,
      height: '44px',
      padding: '0 12px',
    }),
    input: (base) => ({
      ...base,
      margin: '0px',
    }),
  });

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      setLoading(true);

      // Validate form trước khi submit
      let hasError = false;

      // Kiểm tra các trường bắt buộc
      const requiredFields = [
        'category',
        'name',
        'code',
        'unit',
        'image',
        'weight',
        'expiryDate',
      ];
      requiredFields.forEach((field) => {
        if (!values[field]) {
          setFieldError(field, `Vui lòng nhập ${field}`);
          hasError = true;
        }
      });

      // Kiểm tra thuộc tính
      if (!values.attributes.length) {
        setFieldError('attributes', 'Vui lòng thêm ít nhất một thuộc tính');
        hasError = true;
      } else {
        const hasInvalidAttribute = values.attributes.some(
          (attr) => !attr.name || !attr.value
        );
        if (hasInvalidAttribute) {
          setFieldError(
            'attributes',
            'Vui lòng điền đầy đủ thông tin thuộc tính'
          );
          hasError = true;
        }
      }

      // Kiểm tra bảng giá
      if (!values.priceLevels.length) {
        setFieldError('priceLevels', 'Vui lòng thêm ít nhất một mức giá');
        hasError = true;
      } else {
        const hasInvalidPriceLevel = values.priceLevels.some(
          (level) =>
            !level.quantity ||
            !level.price ||
            level.quantity < 1 ||
            level.price < 0
        );
        if (hasInvalidPriceLevel) {
          setFieldError(
            'priceLevels',
            'Vui lòng điền đầy đủ thông tin số lượng và giá'
          );
          hasError = true;
        }
      }

      if (hasError) {
        console.error('Vui lòng kiểm tra lại thông tin');
        setSubmitting(false);
        setLoading(false);
        return;
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Tạo sản phẩm thành công:', values);
      navigate('/apps/products');
    } catch (error) {
      console.error('Error creating product:', error);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const formikProps = {
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
  };

  return (
    <div className="d-flex flex-column gap-7">
      <div className="px-9">
        <Link
          to="/apps/products"
          className="fs-5 fw-bold text-gray-500 text-hover-dark d-flex align-items-center"
        >
          <i className="bi bi-arrow-left fs-2 me-2"></i>
          Quay lại danh sách sản phẩm
        </Link>
      </div>

      <div className="px-9">
        <div className="card">
          <div className="card-header border-0 pt-6">
            <h3 className="card-title align-items-start flex-column">
              <span className="card-label fw-bold fs-3 mb-1">
                Thêm sản phẩm
              </span>
            </h3>
          </div>

          <div className="card-body">
            <Formik {...formikProps}>
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                setFieldValue,
                setFieldTouched,
                validateForm,
                isSubmitting,
              }) => (
                <form
                  className="form"
                  onSubmit={async (e) => {
                    e.preventDefault();

                    // Đánh dấu tất cả các trường là đã touched
                    const requiredFields = [
                      'category',
                      'name',
                      'code',
                      'unit',
                      'image',
                      'weight',
                      'expiryDate',
                    ];
                    requiredFields.forEach((field) => {
                      setFieldTouched(field, true);
                    });

                    // Validate form
                    const formErrors = await validateForm();
                    const hasFormErrors = Object.keys(formErrors).length > 0;

                    // Custom validation cho attributes và priceLevels
                    if (
                      !values.attributes.length ||
                      values.attributes.some(
                        (attr) => !attr.name || !attr.value
                      )
                    ) {
                      setFieldTouched('attributes', true);
                    }

                    if (
                      !values.priceLevels.length ||
                      values.priceLevels.some(
                        (level) =>
                          !level.quantity ||
                          !level.price ||
                          level.quantity < 1 ||
                          level.price < 0
                      )
                    ) {
                      setFieldTouched('priceLevels', true);
                    }

                    // Nếu có lỗi, hiển thị toast và dừng submit
                    if (
                      hasFormErrors ||
                      !values.attributes.length ||
                      !values.priceLevels.length
                    ) {
                      toast.error('Vui lòng kiểm tra lại thông tin');
                      return;
                    }

                    // Nếu không có lỗi, tiếp tục submit form
                    handleSubmit(values, {
                      setSubmitting: () => {},
                      setFieldError: () => {},
                    });
                  }}
                >
                  <div className="row mb-3">
                    <div className="col-md-6 mb-3">
                      <label className="form-label required">
                        Chọn danh mục sản phẩm
                      </label>
                      <Select
                        value={
                          categories.find((cat) => cat._id === values.category)
                            ? {
                                value: values.category,
                                label:
                                  categories.find(
                                    (cat) => cat._id === values.category
                                  )?.name || '',
                              }
                            : null
                        }
                        onChange={(selectedOption) => {
                          setFieldValue(
                            'category',
                            selectedOption?.value || ''
                          );
                        }}
                        options={categories.map((cat) => ({
                          value: cat._id,
                          label: cat.name,
                        }))}
                        placeholder="-- Chọn danh mục --"
                        className={`react-select-container ${
                          touched.category && errors.category
                            ? 'is-invalid'
                            : ''
                        }`}
                        classNamePrefix="react-select"
                        styles={getSelectStyles(
                          !!(touched.category && errors.category)
                        )}
                      />
                      {touched.category && errors.category && (
                        <div className="invalid-feedback d-block">
                          {errors.category}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label required">Mã sản phẩm</label>
                      <input
                        type="text"
                        className={`form-control ${
                          touched.code && errors.code ? 'is-invalid' : ''
                        }`}
                        name="code"
                        value={values.code}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {touched.code && errors.code && (
                        <div className="text-danger">{errors.code}</div>
                      )}
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label required">
                        Tên sản phẩm
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          touched.name && errors.name ? 'is-invalid' : ''
                        }`}
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {touched.name && errors.name && (
                        <div className="text-danger">{errors.name}</div>
                      )}
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label required">
                        Ảnh sản phẩm
                      </label>
                      {previewImage && (
                        <div className="mb-3">
                          <img
                            src={previewImage}
                            alt="Preview"
                            style={{ maxWidth: '200px', maxHeight: '200px' }}
                            onError={(e) => {
                              console.error('Error loading image');
                              e.currentTarget.src =
                                'https://via.placeholder.com/200x200?text=Image+Not+Found';
                            }}
                          />
                        </div>
                      )}
                      <input
                        type="file"
                        className={`form-control ${
                          touched.image && errors.image ? 'is-invalid' : ''
                        }`}
                        name="image"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.currentTarget.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error(
                                'Kích thước file không được vượt quá 5MB'
                              );
                              e.currentTarget.value = '';
                              setPreviewImage(null);
                              return;
                            }
                            setFieldValue('image', file);
                            // Create preview URL
                            const previewUrl = URL.createObjectURL(file);
                            setPreviewImage(previewUrl);
                          } else {
                            setPreviewImage(null);
                          }
                        }}
                      />
                      {touched.image && errors.image && (
                        <div className="text-danger">{errors.image}</div>
                      )}
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label required">
                        Thuộc tính sản phẩm
                      </label>
                      <div className="row g-3">
                        {values.attributes.map((attr, index) => (
                          <div
                            key={index}
                            className="col-12 d-flex gap-2 align-items-start"
                          >
                            <div
                              className="input-group"
                              style={{ maxWidth: '300px' }}
                            >
                              <span className="input-group-text">
                                Tên thuộc tính
                              </span>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Nhập tên thuộc tính"
                                value={attr.name}
                                onChange={(e) => {
                                  const newAttributes = [...values.attributes];
                                  newAttributes[index].name = e.target.value;
                                  setFieldValue('attributes', newAttributes);
                                }}
                              />
                            </div>

                            <div
                              className="input-group"
                              style={{ maxWidth: '400px' }}
                            >
                              <span className="input-group-text">Giá trị</span>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Nhập giá trị"
                                value={attr.value}
                                onChange={(e) => {
                                  const newAttributes = [...values.attributes];
                                  newAttributes[index].value = e.target.value;
                                  setFieldValue('attributes', newAttributes);
                                }}
                              />
                            </div>

                            <button
                              type="button"
                              className="btn btn-icon btn-light-danger"
                              style={{ width: '45px' }}
                              onClick={() => {
                                const newAttributes = values.attributes.filter(
                                  (_, i) => i !== index
                                );
                                setFieldValue('attributes', newAttributes);
                              }}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        ))}

                        <div className="col-12">
                          <button
                            type="button"
                            className="btn btn-light-primary"
                            onClick={() => {
                              setFieldValue('attributes', [
                                ...values.attributes,
                                { name: '', value: '' },
                              ]);
                            }}
                          >
                            <i className="bi bi-plus-circle me-2"></i>
                            Thêm thuộc tính
                          </button>
                        </div>
                      </div>
                      {touched.attributes &&
                        (errors.attributes ||
                          values.attributes.length === 0) && (
                          <div className="text-danger mt-2">
                            {errors.attributes ||
                              'Vui lòng thêm ít nhất một thuộc tính'}
                          </div>
                        )}
                      <small className="text-muted mt-2 d-block">
                        Ví dụ: size, màu sắc, hình dạng...
                      </small>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label required">Đơn vị tính</label>
                      <input
                        type="text"
                        className={`form-control ${
                          touched.unit && errors.unit ? 'is-invalid' : ''
                        }`}
                        name="unit"
                        placeholder="Nhập đơn vị tính"
                        value={values.unit}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {touched.unit && errors.unit && (
                        <div className="text-danger">{errors.unit}</div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Giá nhập</label>
                      <input
                        type="text"
                        className="form-control"
                        name="costPrice"
                        value={values.costPrice}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label required">
                        Bảng giá theo số lượng
                      </label>
                      <div className="row g-3">
                        {values.priceLevels.map((level, index) => (
                          <div
                            key={index}
                            className="col-12 d-flex gap-2 align-items-start"
                          >
                            <div
                              className="input-group"
                              style={{ maxWidth: '300px' }}
                            >
                              <span className="input-group-text">Số lượng</span>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                className="form-control"
                                placeholder="Nhập số lượng"
                                value={
                                  level.quantity === 0 &&
                                  index === values.priceLevels.length - 1
                                    ? ''
                                    : level.quantity
                                }
                                onChange={(e) => {
                                  const newPriceLevels = [
                                    ...values.priceLevels,
                                  ];
                                  newPriceLevels[index].quantity =
                                    e.target.value === ''
                                      ? 0
                                      : Number(e.target.value);
                                  setFieldValue('priceLevels', newPriceLevels);
                                }}
                              />
                            </div>

                            <div
                              className="input-group"
                              style={{ maxWidth: '400px' }}
                            >
                              <span className="input-group-text">Giá</span>
                              <input
                                type="number"
                                min="0"
                                step="1000"
                                className="form-control"
                                placeholder="Nhập giá bán"
                                value={
                                  level.price === 0 &&
                                  index === values.priceLevels.length - 1
                                    ? ''
                                    : level.price
                                }
                                onChange={(e) => {
                                  const newPriceLevels = [
                                    ...values.priceLevels,
                                  ];
                                  newPriceLevels[index].price =
                                    e.target.value === ''
                                      ? 0
                                      : Number(e.target.value);
                                  setFieldValue('priceLevels', newPriceLevels);
                                }}
                              />
                              <span className="input-group-text">
                                vnđ/đơn vị tính
                              </span>
                            </div>

                            <button
                              type="button"
                              className="btn btn-icon btn-light-danger"
                              style={{ width: '45px' }}
                              onClick={() => {
                                const newPriceLevels =
                                  values.priceLevels.filter(
                                    (_, i) => i !== index
                                  );
                                setFieldValue('priceLevels', newPriceLevels);
                              }}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        ))}

                        <div className="col-12">
                          <button
                            type="button"
                            className="btn btn-light-primary"
                            onClick={() => {
                              setFieldValue('priceLevels', [
                                ...values.priceLevels,
                                { quantity: 0, price: 0 },
                              ]);
                            }}
                          >
                            <i className="bi bi-plus-circle me-2"></i>
                            Thêm mức giá
                          </button>
                        </div>
                      </div>

                      {touched.priceLevels &&
                        (errors.priceLevels ||
                          values.priceLevels.length === 0) && (
                          <div className="text-danger mt-2">
                            {errors.priceLevels ||
                              'Vui lòng thêm ít nhất một mức giá'}
                          </div>
                        )}

                      <small className="text-muted mt-2 d-block">
                        Ví dụ: số lượng 1 cái: 10,000. số lượng 2 cái:
                        18,000....
                      </small>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label required">
                        Trọng lượng (g)
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          touched.weight && errors.weight ? 'is-invalid' : ''
                        }`}
                        name="weight"
                        value={values.weight}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {touched.weight && errors.weight && (
                        <div className="text-danger">{errors.weight}</div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label required">
                        Vòng đời sử dụng
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          touched.expiryDate && errors.expiryDate
                            ? 'is-invalid'
                            : ''
                        }`}
                        name="expiryDate"
                        value={values.expiryDate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Số ngày"
                      />
                      {touched.expiryDate && errors.expiryDate && (
                        <div className="text-danger">{errors.expiryDate}</div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label required">Trạng thái</label>
                      <select
                        name="status"
                        className="form-select"
                        value={values.status}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-light me-3"
                      onClick={() => navigate('/apps/products')}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading || isSubmitting}
                    >
                      {loading ? 'Đang tạo...' : 'Tạo'}
                    </button>
                  </div>
                </form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CreateProduct;
