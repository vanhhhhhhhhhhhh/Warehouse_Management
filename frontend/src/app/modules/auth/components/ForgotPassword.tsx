import { useState, useEffect } from 'react'
import * as Yup from 'yup'
import clsx from 'clsx'
import { useFormik } from 'formik'

export function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('')
        setMessageType('')
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const formikEmail = useFormik({
    initialValues: { email: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Email không hợp lệ').required('Bắt buộc'),
    }),
    onSubmit: async ({ email }) => {
      try {
        const res = await fetch('http://localhost:9999/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        if (!res.ok) throw new Error()
        setEmail(email)
        setStep(2)
        setMessage('✅ OTP đã được gửi tới email của bạn')
        setMessageType('success')
      } catch (error) {
        setMessage('❌ Email không tồn tại hoặc lỗi hệ thống')
        setMessageType('error')
      }
    },
  })

  const formikOTP = useFormik({
    initialValues: { otp: '' },
    validationSchema: Yup.object({
      otp: Yup.string().length(6, 'Mã OTP gồm 6 chữ số').required('Bắt buộc'),
    }),
    onSubmit: async ({ otp }) => {
      try {
        const res = await fetch('http://localhost:9999/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp }),
        })
        if (!res.ok) throw new Error()
        setOtp(otp)
        setStep(3)
        setMessage('✅ Mã OTP hợp lệ. Vui lòng đặt lại mật khẩu.')
        setMessageType('success')
      } catch (error) {
        setMessage('❌ OTP không đúng hoặc đã hết hạn')
        setMessageType('error')
      }
    },
  })

  const formikPassword = useFormik({
    initialValues: { newPassword: '', confirmPassword: '' },
    validationSchema: Yup.object({
      newPassword: Yup.string().min(6, 'Tối thiểu 6 ký tự').required('Bắt buộc'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Mật khẩu không khớp')
        .required('Bắt buộc'),
    }),
    onSubmit: async ({ newPassword }) => {
      try {
        const res = await fetch('http://localhost:9999/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp, newPassword, confirmPassword: newPassword }),
        })
        if (!res.ok) throw new Error()
        setMessage('🎉 Đặt lại mật khẩu thành công. Đang chuyển hướng...')
        setMessageType('success')
        setTimeout(() => {
          window.location.href = 'http://localhost:5173/group3/WarehouseManagement/auth'
        }, 2000)
      } catch (error) {
        setMessage('❌ Lỗi khi đặt lại mật khẩu')
        setMessageType('error')
      }
    },
  })

  return (
    <div className='container mt-5' style={{ maxWidth: '480px' }}>
      <h3 className='text-center mb-4'>Quên mật khẩu</h3>

      {message && (
        <div
          className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-danger'} text-center`}
          role='alert'
        >
          {message}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={formikEmail.handleSubmit}>
          <label className='form-label'>Email</label>
          <input
            type='email'
            placeholder='Nhập email'
            {...formikEmail.getFieldProps('email')}
            className={clsx('form-control', {
              'is-invalid': formikEmail.touched.email && formikEmail.errors.email,
            })}
          />
          <div className='text-danger mt-1'>{formikEmail.errors.email}</div>
          <button className='btn btn-primary w-100 mt-3' type='submit'>
            Gửi OTP
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={formikOTP.handleSubmit}>
          <label className='form-label'>Mã OTP</label>
          <input
            type='text'
            placeholder='Nhập mã OTP'
            {...formikOTP.getFieldProps('otp')}
            className={clsx('form-control', {
              'is-invalid': formikOTP.touched.otp && formikOTP.errors.otp,
            })}
          />
          <div className='text-danger mt-1'>{formikOTP.errors.otp}</div>
          <button className='btn btn-success w-100 mt-3' type='submit'>
            Xác minh OTP
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={formikPassword.handleSubmit}>
          <label className='form-label'>Mật khẩu mới</label>
          <input
            type='password'
            placeholder='Nhập mật khẩu mới'
            {...formikPassword.getFieldProps('newPassword')}
            className={clsx('form-control mb-2', {
              'is-invalid': formikPassword.touched.newPassword && formikPassword.errors.newPassword,
            })}
          />
          <label className='form-label'>Nhập lại mật khẩu</label>
          <input
            type='password'
            placeholder='Nhập lại mật khẩu'
            {...formikPassword.getFieldProps('confirmPassword')}
            className={clsx('form-control', {
              'is-invalid':
                formikPassword.touched.confirmPassword && formikPassword.errors.confirmPassword,
            })}
          />
          <div className='text-danger mt-1'>{formikPassword.errors.confirmPassword}</div>
          <button className='btn btn-success w-100 mt-3' type='submit'>
            Đặt lại mật khẩu
          </button>
        </form>
      )}
    </div>
  )
}
