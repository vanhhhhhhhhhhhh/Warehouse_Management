import { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import clsx from 'clsx'
import { Link, useNavigate } from 'react-router-dom'
import { toAbsoluteUrl } from '../../../../_metronic/helpers'
import axios from 'axios'

const initialValues = {
  fullName: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
}

const registrationSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(3, 'Tối thiểu 3 ký tự')
    .max(50, 'Tối đa 50 ký tự')
    .required('Vui lòng nhập họ tên'),
  phone: Yup.string()
    .matches(/^[0-9]+$/, 'Số điện thoại không hợp lệ')
    .min(9, 'Tối thiểu 9 số')
    .max(11, 'Tối đa 11 số')
    .required('Vui lòng nhập số điện thoại'),
  email: Yup.string()
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email'),
  password: Yup.string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .required('Vui lòng nhập mật khẩu'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Mật khẩu không khớp')
    .required('Vui lòng xác nhận mật khẩu'),
})

const register = async (
  fullName: string,
  phone: string,
  email: string,
  password: string,
  confirmPassword: string
) => {
  return await axios.post('http://localhost:9999/auth/register', {
    fullName,
    phone,
    email,
    password,
    confirmPassword,
  })
}

export function Registration() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const formik = useFormik({
    initialValues,
    validationSchema: registrationSchema,
    onSubmit: async (values, { setStatus, resetForm }) => {
      setLoading(true)
      try {
        await register(
          values.fullName,
          values.phone,
          values.email,
          values.password,
          values.confirmPassword
        )

        setStatus('Đăng ký thành công!')

        setTimeout(() => {
          navigate('/auth/login')
          resetForm()
        }, 2000)
      } catch (error) {
        let msg = 'Đăng ký thất bại. Vui lòng thử lại.'
        if (axios.isAxiosError(error)) {
          const responseMsg = error.response?.data?.message
          msg = typeof responseMsg === 'string' ? responseMsg : msg
        }
        setStatus(msg)
      } finally {
        setLoading(false)
      }
    }


    ,
  })

  return (
    <div className='d-flex flex-column flex-column-fluid align-items-center justify-content-center min-vh-100 bg-light-blue p-5'>
      <div className='position-fixed top-0 start-0 p-5'>
        <Link to='/auth/login' className='btn btn-link text-primary fw-bold d-flex align-items-center'>
          <i className='fas fa-arrow-left me-2'></i>
          <span className='fs-4'>Quay lại</span>
        </Link>
      </div>

      <div className='card shadow-sm w-100 rounded-4' style={{ maxWidth: '700px', minHeight: '500px' }}>
        <div className='card-body p-8'>
          <div className='text-center mb-5'>
            <img
              alt='Logo'
              src={toAbsoluteUrl('/media/logos/default.svg')}
              className='h-35px mb-3'
            />
          </div>

          <form className='form w-100' onSubmit={formik.handleSubmit} noValidate>
            <div className='row g-4'>

              {formik.status && (
                <div className='col-12'>
                  <div
                    className={`alert text-center py-2 ${formik.status.includes('thành công') ? 'alert-success' : 'alert-danger'
                      }`}
                  >
                    {formik.status}
                  </div>
                </div>
              )}

              {/* fullName */}
              <div className='col-12'>
                <label className='form-label fw-bold text-dark'>Họ và tên</label>
                <input
                  type='text'
                  placeholder='Họ tên của bạn'
                  {...formik.getFieldProps('fullName')}
                  className={clsx('form-control', {
                    'is-invalid': formik.touched.fullName && formik.errors.fullName,
                  })}
                />
                {formik.touched.fullName && formik.errors.fullName && (
                  <div className='text-danger fs-8 mt-1'>{formik.errors.fullName}</div>
                )}
              </div>

              {/* Phone */}
              <div className='col-12'>
                <label className='form-label fw-bold text-dark'>Số điện thoại</label>
                <input
                  type='text'
                  placeholder='Nhập số điện thoại'
                  {...formik.getFieldProps('phone')}
                  className={clsx('form-control', {
                    'is-invalid': formik.touched.phone && formik.errors.phone,
                  })}
                />
                {formik.touched.phone && formik.errors.phone && (
                  <div className='text-danger fs-8 mt-1'>{formik.errors.phone}</div>
                )}
              </div>

              {/* Email */}
              <div className='col-12'>
                <label className='form-label fw-bold text-dark'>Email</label>
                <input
                  type='email'
                  placeholder='Email của bạn'
                  {...formik.getFieldProps('email')}
                  className={clsx('form-control', {
                    'is-invalid': formik.touched.email && formik.errors.email,
                  })}
                />
                {formik.touched.email && formik.errors.email && (
                  <div className='text-danger fs-8 mt-1'>{formik.errors.email}</div>
                )}
              </div>

              {/* Password */}
              <div className='col-md-6'>
                <label className='form-label fw-bold text-dark'>Mật khẩu</label>
                <input
                  type='password'
                  placeholder='Mật khẩu'
                  {...formik.getFieldProps('password')}
                  className={clsx('form-control', {
                    'is-invalid': formik.touched.password && formik.errors.password,
                  })}
                />
                {formik.touched.password && formik.errors.password && (
                  <div className='text-danger fs-8 mt-1'>{formik.errors.password}</div>
                )}
              </div>

              {/* Confirm Password */}
              <div className='col-md-6'>
                <label className='form-label fw-bold text-dark'>Nhập lại mật khẩu</label>
                <input
                  type='password'
                  placeholder='Nhập lại mật khẩu'
                  {...formik.getFieldProps('confirmPassword')}
                  className={clsx('form-control', {
                    'is-invalid': formik.touched.confirmPassword && formik.errors.confirmPassword,
                  })}
                />
                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                  <div className='text-danger fs-8 mt-1'>{formik.errors.confirmPassword}</div>
                )}
              </div>


              {/* Submit Button */}
              <div className='col-12 mt-2'>
                <button
                  type='submit'
                  className='btn w-50 d-flex align-items-center justify-content-center register-btn'
                >
                  {!loading ? (
                    <>
                      <span>Đăng ký</span>
                      <i className='fas fa-arrow-right ms-2'></i>
                    </>
                  ) : (
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
