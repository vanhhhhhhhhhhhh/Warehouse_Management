import { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import clsx from 'clsx'
import { Link, useNavigate } from 'react-router-dom'
import { toAbsoluteUrl } from '../../../../_metronic/helpers'
import axios from 'axios'

const initialValues = {
  fullname: '',
  phone: '',
  storeName: '',
  city: 'Hà Nội',
  email: '',
  password: '',
  changepassword: '',
  acceptTerms: false,
}

const registrationSchema = Yup.object().shape({
  fullname: Yup.string()
    .min(3, 'Tối thiểu 3 ký tự')
    .max(50, 'Tối đa 50 ký tự')
    .required('Vui lòng nhập họ tên'),
  phone: Yup.string()
    .matches(/^[0-9]+$/, 'Số điện thoại không hợp lệ')
    .min(9, 'Tối thiểu 9 số')
    .max(11, 'Tối đa 11 số')
    .required('Vui lòng nhập số điện thoại'),
  storeName: Yup.string()
    .min(3, 'Tối thiểu 3 ký tự')
    .max(50, 'Tối đa 50 ký tự')
    .required('Vui lòng nhập tên quán'),
  city: Yup.string()
    .required('Vui lòng chọn thành phố'),
  email: Yup.string()
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email'),
  password: Yup.string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .required('Vui lòng nhập mật khẩu'),
  changepassword: Yup.string()
    .required('Vui lòng xác nhận mật khẩu')
    .oneOf([Yup.ref('password')], 'Mật khẩu không khớp'),
  acceptTerms: Yup.bool()
    .oneOf([true], 'Bạn phải đồng ý với điều khoản sử dụng')
    .required('Bạn phải đồng ý với điều khoản sử dụng'),
})

const register = async (
  fullname: string,
  phone: string,
  storeName: string,
  city: string,
  email: string,
  password: string
) => {
  return await axios.post('http://localhost:5000/api/auth/register', {
    fullname,
    phone,
    storeName,
    city,
    email,
    password
  })
}

export function Registration() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const formik = useFormik({
    initialValues,
    validationSchema: registrationSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true)
      try {
        await register(
          values.fullname,
          values.phone,
          values.storeName,
          values.city,
          values.email,
          values.password
        )
        navigate('/auth/login')
      } catch (error) {
        console.error('Lỗi đăng ký:', error)
        setStatus('Đăng ký thất bại. Vui lòng thử lại.')
        setSubmitting(false)
        setLoading(false)
      }
    },
  })

  return (
    <div className='d-flex flex-column flex-column-fluid align-items-center justify-content-center min-vh-100 bg-light-blue p-5'>
      {/* Back button */}
      <div className='position-fixed top-0 start-0 p-5'>
        <Link
          to='/auth/login'
          className='btn btn-link text-primary fw-bold d-flex align-items-center'
        >
          <i className='fas fa-arrow-left me-2'></i>
          <span className='fs-4'>Quay lại</span>
        </Link>
      </div>

      <div className='card shadow-sm w-100 rounded-4' style={{ maxWidth: '700px', minHeight: '500px' }}>
        <div className='card-body p-8'>
          {/* Logo & Heading */}
          <div className='text-center mb-5'>
            <img
              alt='Logo'
              src={toAbsoluteUrl('/media/logos/default.svg')}
              className='h-35px mb-3'
            />
          </div>

          <form className='form w-100' onSubmit={formik.handleSubmit} noValidate>
            {/* Form Fields */}
            <div className='row g-4'>
              <div className='col-12'>
                <label className='form-label fw-bold text-dark'>Họ và tên</label>
                <input
                  placeholder='Họ tên của bạn'
                  type='text'
                  autoComplete='off'
                  {...formik.getFieldProps('fullname')}
                  className={clsx(
                    'form-control',
                    { 'is-invalid': formik.touched.fullname && formik.errors.fullname }
                  )}
                />
                {formik.touched.fullname && formik.errors.fullname && (
                  <div className='text-danger fs-8 mt-1'>{formik.errors.fullname}</div>
                )}
              </div>

              <div className='col-12'>
                <label className='form-label fw-bold text-dark'>Số điện thoại</label>
                <input
                  placeholder='Nhập số điện thoại'
                  type='text'
                  autoComplete='off'
                  {...formik.getFieldProps('phone')}
                  className={clsx(
                    'form-control',
                    { 'is-invalid': formik.touched.phone && formik.errors.phone }
                  )}
                />
                {formik.touched.phone && formik.errors.phone && (
                  <div className='text-danger fs-8 mt-1'>{formik.errors.phone}</div>
                )}
              </div>

              <div className='col-md-6'>
                <label className='form-label fw-bold text-dark'>Tên quán</label>
                <input
                  placeholder='Tên quán của bạn'
                  type='text'
                  autoComplete='off'
                  {...formik.getFieldProps('storeName')}
                  className={clsx(
                    'form-control',
                    { 'is-invalid': formik.touched.storeName && formik.errors.storeName }
                  )}
                />
                {formik.touched.storeName && formik.errors.storeName && (
                  <div className='text-danger fs-8 mt-1'>{formik.errors.storeName}</div>
                )}
              </div>

              <div className='col-md-6'>
                <label className='form-label fw-bold text-dark'>Địa điểm</label>
                <select
                  {...formik.getFieldProps('city')}
                  className={clsx(
                    'form-select',
                    { 'is-invalid': formik.touched.city && formik.errors.city }
                  )}
                >
                  <option value=''>Chọn địa điểm</option>
                  <option value='Hà Nội'>Hà Nội</option>
                  <option value='Hồ Chí Minh'>Hồ Chí Minh</option>
                  <option value='Đà Nẵng'>Đà Nẵng</option>
                  <option value='Khác'>Tỉnh/thành phố khác</option>
                </select>
                {formik.touched.city && formik.errors.city && (
                  <div className='text-danger fs-8 mt-1'>{formik.errors.city}</div>
                )}
              </div>

              <div className='col-12'>
                <label className='form-label fw-bold text-dark'>Email</label>
                <input
                  placeholder='Email của bạn'
                  type='email'
                  autoComplete='off'
                  {...formik.getFieldProps('email')}
                  className={clsx(
                    'form-control',
                    { 'is-invalid': formik.touched.email && formik.errors.email }
                  )}
                />
                {formik.touched.email && formik.errors.email && (
                  <div className='text-danger fs-8 mt-1'>{formik.errors.email}</div>
                )}
              </div>

              <div className='col-md-6'>
                <label className='form-label fw-bold text-dark'>Mật khẩu</label>
                <input
                  placeholder='Mật khẩu'
                  type='password'
                  autoComplete='off'
                  {...formik.getFieldProps('password')}
                  className={clsx(
                    'form-control',
                    { 'is-invalid': formik.touched.password && formik.errors.password }
                  )}
                />
                {formik.touched.password && formik.errors.password && (
                  <div className='text-danger fs-8 mt-1'>{formik.errors.password}</div>
                )}
              </div>

              <div className='col-md-6'>
                <label className='form-label fw-bold text-dark'>Nhập lại mật khẩu</label>
                <input
                  placeholder='Nhập lại mật khẩu'
                  type='password'
                  autoComplete='off'
                  {...formik.getFieldProps('changepassword')}
                  className={clsx(
                    'form-control',
                    { 'is-invalid': formik.touched.changepassword && formik.errors.changepassword }
                  )}
                />
                {formik.touched.changepassword && formik.errors.changepassword && (
                  <div className='text-danger fs-8 mt-1'>{formik.errors.changepassword}</div>
                )}
              </div>

              {/* Terms */}
              <div className='col-12'>
                <div className='form-check'>
                  <input
                    className={clsx(
                      'form-check-input',
                      { 'is-invalid': formik.touched.acceptTerms && formik.errors.acceptTerms }
                    )}
                    type='checkbox'
                    id='kt_login_toc_agree'
                    {...formik.getFieldProps('acceptTerms')}
                  />
                  <label className='form-check-label fs-8 text-gray-700' htmlFor='kt_login_toc_agree'>
                    Tôi đã đọc, đồng ý với <Link to="#" className='text-primary'>Chính sách bảo vệ dữ liệu cá nhân</Link> & <Link to="#" className='text-primary'>Quy định sử dụng</Link> của Group3
                  </label>
                </div>
                {formik.touched.acceptTerms && formik.errors.acceptTerms && (
                  <div className='text-danger fs-8 mt-1'>{formik.errors.acceptTerms}</div>
                )}
              </div>

              {/* Submit */}
              <div className='col-12 mt-2'>
                <button
                  type='submit'
                  className='btn w-50 d-flex align-items-center justify-content-center register-btn'
                >
                  {!loading && (
                    <>
                      <span>Đăng ký</span>
                      <i className='fas fa-arrow-right ms-2'></i>
                    </>
                  )}
                  {loading && (
                    <span className='indicator-progress'>
                      Vui lòng đợi...{' '}
                      <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                    </span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <style>
        {`
          .bg-light-blue {
            background-color: #f0f8ff;
            background-image: linear-gradient(135deg, #f0f8ff 0%, #e6f2ff 100%);
          }
          
          .form-control, .form-select {
            height: 45px;
            font-size: 0.95rem;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            border: 1px solid #e4e6ef;
            background-color: #f5f8fa;
            transition: all 0.2s ease;
          }
          
          .form-control::placeholder {
            color: #a1a5b7;
            font-size: 0.95rem;
          }
          
          .form-control:focus, .form-select:focus {
            border-color: #009ef7;
            background-color: #ffffff;
            box-shadow: none;
          }
          
          .register-btn {
            background-color: #a9a9a9;
            border-color: #a9a9a9;
            color: #ffffff;
            font-weight: 500;
            height: 45px;
            border-radius: 22.5px;
            transition: all 0.3s ease;
            font-size: 1rem;
            margin-left: auto;
            margin-right: auto;
          }
          
          .register-btn:not(:disabled) {
            background-color: #009ef7;
            border-color: #009ef7;
          }
          
          .register-btn:not(:disabled):hover {
            background-color: #0095e8;
            border-color: #0095e8;
          }
          
          .card {
            border: none;
            box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.05) !important;
          }
          
          .is-invalid {
            border-color: #f1416c !important;
          }
          
          .text-danger {
            color: #f1416c !important;
            font-size: 0.85rem;
          }
          
          .form-check-input {
            width: 1.1rem;
            height: 1.1rem;
            margin-top: 0.2rem;
          }
          
          .form-check-input:checked {
            background-color: #009ef7;
            border-color: #009ef7;
          }
          
          .form-check-label {
            font-size: 0.9rem !important;
            margin-left: -10px;
          }
          
          .col-12, .col-md-6 {
            margin-bottom: 0.5rem;
          }
          
          .btn-link {
            text-decoration: none;
            font-size: 1rem;
            padding: 0.4rem 0.8rem;
            transition: all 0.2s ease;
          }
          
          .btn-link:hover {
            transform: translateX(-5px);
          }

          .form-label {
            font-size: 0.95rem;
            margin-bottom: 0.3rem;
          }

          .fs-8 {
            font-size: 0.85rem !important;
          }

          .btn {
            transition: all 0.2s ease-in-out;
          }

          .btn-primary {
            background-color: var(--bs-primary);
            border-color: var(--bs-primary);
            color: #ffffff;
            height: 44px;
            transition: all 0.2s ease;
          }

          .btn-primary:not(:disabled) {
            cursor: pointer;
          }

          .btn-primary:hover:not(:disabled) {
            background-color: #0095e8;
            border-color: #0095e8;
          }

          .btn-primary:disabled {
            background-color: var(--bs-primary);
            border-color: var(--bs-primary);
            opacity: 0.5;
            cursor: not-allowed;
          }
        `}
      </style>
    </div>
  )
}
