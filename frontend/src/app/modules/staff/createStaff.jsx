import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Select from 'react-select'
import { Link } from 'react-router-dom'

// Mock data for roles
const mockRoles = [
  { _id: '1', name: 'Staff' },
  { _id: '2', name: 'Manager' },
  { _id: '3', name: 'Supervisor' }
]

const CreateStaff = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: null
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState(mockRoles)

  const selectStyles = {
    control: (base, { isFocused }) => ({
      ...base,
      minHeight: '44px',
      height: '44px',
      borderColor: errors.role ? '#F1416C' : isFocused ? '#009ef7' : '#e4e6ef',
      boxShadow: 'none',
      '&:hover': {
        borderColor: errors.role ? '#F1416C' : '#009ef7'
      }
    }),
    valueContainer: (base) => ({
      ...base,
      height: '44px',
      padding: '0 12px'
    }),
    input: (base) => ({
      ...base,
      margin: '0px'
    })
  }

  useEffect(() => {
    // Using mock data instead of API call
    const roleOptions = mockRoles
      .filter(role => role.name.toLowerCase() !== 'admin')
      .map(role => ({
        value: role._id,
        label: role.name
      }))
    setRoles(roleOptions)
  }, [])

  // Validate từng trường khi người dùng nhập
  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        if (!value) return 'Họ tên không được để trống'
        if (value.length < 3 || value.length > 50)
          return 'Họ tên phải từ 3-50 ký tự'
        if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value))
          return 'Họ tên chỉ được chứa chữ cái và khoảng trắng'
        break

      case 'username':
        if (!value) return 'Tên đăng nhập không được để trống'
        if (value.length < 3 || value.length > 30)
          return 'Tên đăng nhập phải từ 3-30 ký tự'
        if (!/^[a-zA-Z0-9_]+$/.test(value))
          return 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới'
        break

      case 'email':
        if (!value) return 'Email không được để trống'
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value))
          return 'Email không hợp lệ'
        break

      case 'phone':
        if (!value) return 'Số điện thoại không được để trống'
        if (!/^[0-9]{10}$/.test(value))
          return 'Số điện thoại phải có 10 chữ số'
        break

      case 'role':
        if (!value) return 'Vui lòng chọn vai trò'
        break

      case 'password':
        if (!value) return 'Mật khẩu không được để trống'
        if (value.length < 6)
          return 'Mật khẩu phải có ít nhất 6 ký tự'
        if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/.test(value))
          return 'Mật khẩu phải bao gồm cả chữ và số'
        break

      case 'confirmPassword':
        if (!value) return 'Vui lòng xác nhận mật khẩu'
        if (value !== formData.password)
          return 'Mật khẩu xác nhận không khớp'
        break
    }
  }

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Validate realtime
    const error = validateField(name, value)
    setErrors(prev => ({
      ...prev,
      [name]: error
    }))

    // Validate confirmPassword khi password thay đổi
    if (name === 'password' && formData.confirmPassword) {
      const confirmError = validateField('confirmPassword', formData.confirmPassword)
      setErrors(prev => ({
        ...prev,
        confirmPassword: confirmError
      }))
    }
  }

  // Handle role change
  const handleRoleChange = (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      role: selectedOption
    }))
    setErrors(prev => ({
      ...prev,
      role: undefined
    }))
  }

  // Validate form trước khi submit
  const validateForm = () => {
    const newErrors = {}

    // Validate all fields
    Object.keys(formData).forEach(key => {
      if (key === 'role') {
        if (!formData.role) {
          newErrors.role = 'Vui lòng chọn vai trò'
        }
      } else {
        const error = validateField(key, formData[key])
        if (error) {
          newErrors[key] = error
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      console.error('Vui lòng kiểm tra lại thông tin')
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const staffData = {
        ...formData,
        roleId: formData.role?.value
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Created staff:', staffData)
      navigate('/apps/staff/list')
    } catch (error) {
      // Log error message
      console.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <div className='d-flex flex-column gap-7'>
      <div className='px-9'>
        <Link
          to='/apps/staff/list'
          className='fs-5 fw-bold text-gray-500 text-hover-dark d-flex align-items-center'
        >
          <i className='bi bi-arrow-left fs-2 me-2'></i>
          Quay lại danh sách nhân viên
        </Link>
      </div>

      <div className='px-9'>
        <div className='card'>
          <div className='card-header border-0 pt-6'>
            <h3 className='card-title align-items-start flex-column'>
              <span className='card-label fw-bold fs-3 mb-1'>Tạo nhân viên mới</span>
            </h3>
          </div>

          <div className='card-body py-4'>
            <form onSubmit={handleSubmit}>
              <div className='row g-5 g-xl-8'>
                <div className='col-lg-6'>
                  {/* Họ tên */}
                  <div className='fv-row mb-7'>
                    <label className='form-label fw-bolder text-dark fs-6 required'>Họ tên nhân viên</label>
                    <input
                      type='text'
                      className={`form-control form-control-lg ${errors.fullName ? 'is-invalid' : ''}`}
                      name='fullName'
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder='VD: Nguyễn Văn A'
                    />
                    {errors.fullName && (
                      <div className='invalid-feedback'>{errors.fullName}</div>
                    )}
                  </div>

                  {/* Số điện thoại */}
                  <div className='fv-row mb-7'>
                    <label className='form-label fw-bolder text-dark fs-6 required'>Số điện thoại</label>
                    <input
                      type='text'
                      className={`form-control form-control-lg ${errors.phone ? 'is-invalid' : ''}`}
                      name='phone'
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder='VD: 0123456789'
                    />
                    {errors.phone && (
                      <div className='invalid-feedback'>{errors.phone}</div>
                    )}
                  </div>

                  {/* Password */}
                  <div className='fv-row mb-7'>
                    <label className='form-label fw-bolder text-dark fs-6 required'>Mật khẩu</label>
                    <input
                      type='password'
                      className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
                      name='password'
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    {errors.password && (
                      <div className='invalid-feedback'>{errors.password}</div>
                    )}
                  </div>
                </div>

                <div className='col-lg-6'>
                  {/* Username */}
                  <div className='fv-row mb-7'>
                    <label className='form-label fw-bolder text-dark fs-6 required'>Tên đăng nhập</label>
                    <input
                      type='text'
                      className={`form-control form-control-lg ${errors.username ? 'is-invalid' : ''}`}
                      name='username'
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder='VD: nguyenvana'
                    />
                    {errors.username && (
                      <div className='invalid-feedback'>{errors.username}</div>
                    )}
                  </div>

                  {/* Role */}
                  <div className='fv-row mb-7'>
                    <label className='form-label fw-bolder text-dark fs-6 required'>Vai trò</label>
                    <Select
                      value={formData.role}
                      onChange={handleRoleChange}
                      options={roles}
                      placeholder='-- Chọn vai trò --'
                      className={`react-select-container ${errors.role ? 'is-invalid' : ''}`}
                      classNamePrefix='react-select'
                      styles={selectStyles}
                    />
                    {errors.role && (
                      <div className='invalid-feedback d-block'>{errors.role}</div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className='fv-row mb-7'>
                    <label className='form-label fw-bolder text-dark fs-6 required'>Xác nhận mật khẩu</label>
                    <input
                      type='password'
                      className={`form-control form-control-lg ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      name='confirmPassword'
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                    {errors.confirmPassword && (
                      <div className='invalid-feedback'>{errors.confirmPassword}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className='row g-5 g-xl-8'>
                <div className='col-lg-6'>
                  <div className='fv-row mb-7'>
                    <label className='form-label fw-bolder text-dark fs-6 required'>Email</label>
                    <input
                      type='email'
                      className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                      name='email'
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder='VD: example@gmail.com'
                    />
                    {errors.email && (
                      <div className='invalid-feedback'>{errors.email}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className='card-footer d-flex justify-content-end py-6 px-9 border-0'>
                <button
                  type='submit'
                  className='btn btn-primary btn-active-light-primary'
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : 'Tạo nhân viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default CreateStaff
