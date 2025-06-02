import { useState } from 'react'
import * as Yup from 'yup'
import clsx from 'clsx'
import { Link, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import { toAbsoluteUrl } from '../../../../_metronic/helpers'
import { useAuth } from '../core/Auth'

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email'),
  username: Yup.string()
    .when('activeTab', {
      is: (activeTab: string) => activeTab === 'employee',
      then: () => Yup.string().required('Vui lòng nhập tên đăng nhập'),
    }),
  password: Yup.string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .required('Vui lòng nhập mật khẩu'),
})

const initialValues = {
  email: '',
  username: '',
  password: '',
}

/*
  Formik+YUP+Typescript:
  https://jaredpalmer.com/formik/docs/tutorial#getfieldprops
  https://medium.com/@maurice.de.beijer/yup-validation-and-typescript-and-formik-6c342578a20e
*/

export function Login() {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('owner')
  const { saveAuth, setCurrentUser } = useAuth()

  const navigate = useNavigate()

   const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, {setStatus, setSubmitting}) => {
      setLoading(true)
      try {
        const response = await fetch('http://localhost:9999/auth/login', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(values),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Đăng nhập thất bại')
        }

        saveAuth({api_token: data.accessToken})
        setCurrentUser(data.user)
        navigate('/dashboard')
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : typeof error === 'string'
            ? error
            : 'Đã xảy ra lỗi khi đăng nhập'
        setStatus(errorMessage)
        saveAuth(undefined)
        setSubmitting(false)
      } finally {
        setLoading(false)
      }
    },
  })

  return (
    <div className='d-flex flex-column flex-column-fluid align-items-center justify-content-center min-vh-100 bg-light-blue p-5'>
      <div className='card shadow-sm w-100 rounded-4' style={{ maxWidth: '500px', minHeight: '600px' }}>
        {/* Logo */}
        <div className='text-center p-10 pb-0'>
          <img
            alt='Logo'
            src={toAbsoluteUrl('/media/logos/default.svg')}
            className='h-40px mb-5'
          />
        </div>

        {/* Tabs */}
        <div className='card-header border-0 p-0'>
          <div className='d-flex w-100'>
            <div
              onClick={() => setActiveTab('owner')}
              className={`tab-item flex-fill text-center cursor-pointer ${activeTab === 'owner' ? 'active-tab' : ''
                }`}
            >
              Chủ nhà hàng / Quản lý
            </div>
            <div
              onClick={() => setActiveTab('employee')}
              className={`tab-item flex-fill text-center cursor-pointer ${activeTab === 'employee' ? 'active-tab' : ''
                }`}
            >
              Nhân viên
            </div>
          </div>
        </div>

        <div className='card-body p-10 pt-5'>
          <form
            className='form-container'
            onSubmit={formik.handleSubmit}
            noValidate
          >
            {formik.status && (
              <div className='alert alert-danger d-flex align-items-center p-3 mb-4'>
                <i className='bi bi-exclamation-circle fs-5 text-danger me-2'></i>
                <div className='d-flex flex-column'>
                  <span>{formik.status}</span>
                </div>
              </div>
            )}

            {/* Email Input */}
            <div className='mb-4'>
              <label className='form-label fw-bold text-dark'>Email</label>
              <input
                type='email'
                className={clsx(
                  'form-control bg-light',
                  { 'is-invalid': formik.touched.email && formik.errors.email }
                )}
                placeholder={activeTab === 'employee' ? 'Email chủ cửa hàng' : 'Nhập địa chỉ email'}
                {...formik.getFieldProps('email')}
              />
              {formik.touched.email && formik.errors.email && (
                <div className='text-danger fs-7 mt-1'>{formik.errors.email}</div>
              )}
            </div>

            {/* Username - Only for Employee */}
            {activeTab === 'employee' && (
              <div className='mb-4'>
                <label className='form-label fw-bold text-dark'>Tên đăng nhập</label>
                <input
                  type='text'
                  className={clsx(
                    'form-control bg-light',
                    { 'is-invalid': formik.touched.username && formik.errors.username }
                  )}
                  placeholder='Nhập tên đăng nhập'
                  {...formik.getFieldProps('username')}
                />
                {formik.touched.username && formik.errors.username && (
                  <div className='text-danger fs-7 mt-1'>{formik.errors.username}</div>
                )}
              </div>
            )}

            {/* Password Input */}
            <div className='mb-4'>
              <div className='d-flex justify-content-between align-items-center'>
                <label className='form-label fw-bold text-dark'>Mật khẩu</label>
                <Link to='/auth/forgot-password' className='text-primary fs-7'>
                  Quên mật khẩu?
                </Link>
              </div>
              <input
                type='password'
                className={clsx(
                  'form-control bg-light',
                  { 'is-invalid': formik.touched.password && formik.errors.password }
                )}
                placeholder='Nhập mật khẩu'
                {...formik.getFieldProps('password')}
              />
              {formik.touched.password && formik.errors.password && (
                <div className='text-danger fs-7 mt-1'>{formik.errors.password}</div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              className='btn btn-primary w-100 mb-4'
              disabled={formik.isSubmitting || !formik.isValid}
            >
              {!loading && <span>Đăng nhập</span>}
              {loading && (
                <span className='d-flex align-items-center justify-content-center'>
                  <span className='spinner-border spinner-border-sm me-2'></span>
                  Đang xử lý...
                </span>
              )}
            </button>

            {/* Alternative Login */}
            <div className='text-center mb-4'>
              <button type='button' className='btn btn-light-primary w-100'>
                Đăng nhập bằng phương thức khác
              </button>
            </div>

            {/* Trial Registration */}
            <div className='text-center'>
              <span className='text-gray-500'>Chưa có tài khoản? </span>
              <Link to='/auth/registration' className='text-primary fw-bold'>
                Đăng ký dùng thử
              </Link>
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

        .border-danger {
          border-color: #dc3545 !important;
        }

        .bg-danger-light {
          background-color: #fff5f5 !important;
        }

        .is-invalid .input-group-text,
        .is-invalid .form-control {
          border-color: #dc3545;
        }

        .tab-item {
          padding: 10px 0;
          position: relative;
          transition: all 0.3s ease;
        }

        .active-tab {
          color: var(--bs-primary);
          font-weight: bold;
        }

        .active-tab::after {
          content: '';
          position: absolute;
          top: 35px;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: var(--bs-primary);
          transition: all 0.3s ease;
        }

        .card-header {
          border-bottom: 1px solid #eee;
        }

        .form-container {
          min-height: 450px;
          transition: all 0.3s ease;
        }

        .card {
          transition: all 0.3s ease;
        }
        
        .card-body {
          margin-top: -30px;
        }

        /* Animation cho các elements trong form */
        .form-control,
        .input-group,
        .btn {
          transition: all 0.2s ease-in-out;
        }
      `}
      </style>
    </div>
  )
}
