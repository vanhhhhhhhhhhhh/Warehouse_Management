import {useState} from 'react'
import * as Yup from 'yup'
import clsx from 'clsx'
import {useFormik} from 'formik'

export function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')

  const formikEmail = useFormik({
    initialValues: {email: ''},
    validationSchema: Yup.object({
      email: Yup.string().email('Email không hợp lệ').required('Bắt buộc'),
    }),
    onSubmit: async ({email}) => {
      try {
        const res = await fetch('http://localhost:9999/auth/forgot-password', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({email}),
        })
        if (!res.ok) throw new Error('Lỗi gửi OTP')
        setEmail(email)
        setStep(2)
      } catch (error) {
        alert('Email không tồn tại hoặc lỗi hệ thống')
      }
    },
  })

  const formikOTP = useFormik({
    initialValues: {otp: ''},
    validationSchema: Yup.object({
      otp: Yup.string().length(6, 'Mã OTP gồm 6 chữ số').required('Bắt buộc'),
    }),
    onSubmit: async ({otp}) => {
      try {
        const res = await fetch('http://localhost:9999/auth/verify-otp', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({email, otp}),
        })
        if (!res.ok) throw new Error('OTP sai')
        setOtp(otp)
        setStep(3)
      } catch (error) {
        alert('OTP không đúng hoặc đã hết hạn')
      }
    },
  })

  const formikPassword = useFormik({
    initialValues: {newPassword: '', confirmPassword: ''},
    validationSchema: Yup.object({
      newPassword: Yup.string().min(6, 'Tối thiểu 6 ký tự').required('Bắt buộc'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Mật khẩu không khớp')
        .required('Bắt buộc'),
    }),
    onSubmit: async ({newPassword}) => {
      try {
        const res = await fetch('http://localhost:9999/auth/reset-password', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({email, otp, newPassword, confirmPassword: newPassword}),
        })
        if (!res.ok) throw new Error('Lỗi reset mật khẩu')
        alert('Đặt lại mật khẩu thành công')
        window.location.href = 'http://localhost:5173/group3/WarehouseManagement/auth'
      } catch (error) {
        alert('Lỗi khi đặt lại mật khẩu')
      }
    },
  })

  return (
    <div className='container mt-5'>
      {step === 1 && (
        <form onSubmit={formikEmail.handleSubmit}>
          <h3>Nhập Email</h3>
          <input
            type='email'
            placeholder='Email'
            {...formikEmail.getFieldProps('email')}
            className={clsx('form-control', {
              'is-invalid': formikEmail.touched.email && formikEmail.errors.email,
            })}
          />
          <div className='text-danger'>{formikEmail.errors.email}</div>
          <button className='btn btn-primary mt-3' type='submit'>Gửi OTP</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={formikOTP.handleSubmit}>
          <h3>Nhập mã OTP</h3>
          <input
            type='text'
            placeholder='OTP'
            {...formikOTP.getFieldProps('otp')}
            className={clsx('form-control', {
              'is-invalid': formikOTP.touched.otp && formikOTP.errors.otp,
            })}
          />
          <div className='text-danger'>{formikOTP.errors.otp}</div>
          <button className='btn btn-primary mt-3' type='submit'>Xác minh OTP</button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={formikPassword.handleSubmit}>
          <h3>Đặt lại mật khẩu</h3>
          <input
            type='password'
            placeholder='Mật khẩu mới'
            {...formikPassword.getFieldProps('newPassword')}
            className='form-control mb-2'
          />
          <input
            type='password'
            placeholder='Nhập lại mật khẩu'
            {...formikPassword.getFieldProps('confirmPassword')}
            className='form-control'
          />
          <div className='text-danger'>{formikPassword.errors.confirmPassword}</div>
          <button className='btn btn-success mt-3' type='submit'>Đặt lại</button>
        </form>
      )}
    </div>
  )
}
