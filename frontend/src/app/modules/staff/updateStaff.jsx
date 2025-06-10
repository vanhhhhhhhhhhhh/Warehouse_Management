import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import Select from 'react-select'
import axios from 'axios'
import { API_URL, getAxiosConfig, API_ERROR_MESSAGES } from '../../config/api.config'
import Swal from 'sweetalert2'

// Validation schema
const updateStaffSchema = Yup.object().shape({
  fullName: Yup.string()
    .required('Họ tên không được để trống')
    .min(3, 'Họ tên phải có ít nhất 3 ký tự')
    .max(50, 'Họ tên không được vượt quá 50 ký tự'),
  username: Yup.string()
    .required('Tên đăng nhập không được để trống'),
  email: Yup.string()
    .required('Email không được để trống')
    .email('Email không hợp lệ'),
  phone: Yup.string()
    .required('Số điện thoại không được để trống')
    .matches(/^[0-9]{10}$/, 'Số điện thoại phải có 10 chữ số'),
  role: Yup.object()
    .required('Vui lòng chọn vai trò')
    .nullable()
})

const UpdateStaff = () => {
  const navigate = useNavigate()
  const { staffId } = useParams()
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [roles, setRoles] = useState([])
  const [apiError, setApiError] = useState(null)

  const formik = useFormik({
    initialValues: {
      fullName: '',
      username: '',
      email: '',
      phone: '',
      role: null,
      status: true
    },
    validationSchema: updateStaffSchema,
    onSubmit: async (values) => {
      setLoading(true)
      try {
        const staffData = {
          fullName: values.fullName,
          username: values.username,
          email: values.email,
          phone: values.phone,
          roleId: values.role?.value,
          status: values.status
        }

        const response = await axios.put(
          API_URL.USERS.UPDATE(staffId),
          staffData,
          getAxiosConfig()
        )

        if (response.data.success) {
          await Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: response.data.message || 'Cập nhật thông tin nhân viên thành công',
            showConfirmButton: false,
            timer: 1500
          })
          navigate('/apps/staff')
        } else {
          throw new Error(response.data.message || 'Cập nhật thất bại')
        }
      } catch (error) {
        console.error('Update staff error:', error)
        const errorMessage = error.response?.data?.message || error.message || API_ERROR_MESSAGES.SERVER_ERROR
        setApiError(errorMessage)
        await Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: errorMessage,
          confirmButtonText: 'Đóng'
        })
      } finally {
        setLoading(false)
      }
    }
  })

  // Load staff data
  useEffect(() => {
    const loadStaffData = async () => {
      try {
        console.log('Loading staff data for ID:', staffId)
        const response = await axios.get(API_URL.USERS.DETAIL(staffId), getAxiosConfig())
        console.log('Staff data response:', response.data)

        if (response.data && response.data.success && response.data.staff) {
          const staffData = response.data.staff
          console.log('Setting form values:', staffData)
          
          formik.setValues({
            fullName: staffData.fullName || '',
            username: staffData.username || '',
            email: staffData.email || '',
            phone: staffData.phone || '',
            role: staffData.roleId ? {
              value: staffData.roleId._id,
              label: staffData.roleId.name
            } : null,
            status: staffData.status || true
          })
        }
      } catch (error) {
        console.error('Error loading staff:', error)
        const errorMessage = error.response?.data?.message || 'Không thể tải thông tin nhân viên'
        setApiError(errorMessage)
        await Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: errorMessage,
          confirmButtonText: 'Đóng'
        })
        navigate('/apps/staff')
      } finally {
        setInitializing(false)
      }
    }

    // Load roles
    const loadRoles = async () => {
      try {
        const response = await axios.get(API_URL.ROLES.LIST, getAxiosConfig())
        if (response.data) {
          const rolesData = Array.isArray(response.data) ? response.data : response.data.roles || []
          const roleOptions = rolesData
            .filter(role => role.name.toLowerCase() !== 'admin')
            .map(role => ({
              value: role._id,
              label: role.name
            }))
          setRoles(roleOptions)
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || API_ERROR_MESSAGES.SERVER_ERROR
        setApiError(`Lỗi khi tải danh sách vai trò: ${errorMessage}`)
      }
    }

    if (staffId) {
      loadStaffData()
      loadRoles()
    } else {
      setApiError('ID nhân viên không hợp lệ')
      navigate('/apps/staff')
    }
  }, [staffId])

  const selectStyles = {
    control: (base, { isFocused }) => ({
      ...base,
      minHeight: '44px',
      height: '44px',
      borderColor: formik.touched.role && formik.errors.role ? '#F1416C' : isFocused ? '#009ef7' : '#e4e6ef',
      boxShadow: 'none',
      '&:hover': {
        borderColor: formik.touched.role && formik.errors.role ? '#F1416C' : '#009ef7'
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

  if (initializing) {
    return (
      <div className='d-flex justify-content-center align-items-center min-h-350px'>
        <div className='spinner-border text-primary' role='status'>
          <span className='sr-only'>Đang tải...</span>
        </div>
      </div>
    )
  }

  return (
    <>
    <div className='d-flex flex-column gap-7'>
      <div className='px-9'>
        <Link
          to='/apps/staff'
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
              <span className='card-label fw-bold fs-3 mb-1'>Cập nhật thông tin nhân viên</span>
            </h3>
          </div>

          <div className='card-body py-4'>
            {apiError && (
              <div className='alert alert-danger d-flex align-items-center p-5 mb-10'>
                <i className='bi bi-exclamation-circle fs-2 text-danger me-4'></i>
                <div className='d-flex flex-column'>
                  <span>{apiError}</span>
                </div>
              </div>
            )}

            <form onSubmit={formik.handleSubmit}>
              <div className='row g-5 g-xl-8'>
                <div className='col-lg-6'>
                  {/* Họ tên */}
                  <div className='fv-row mb-7'>
                    <label className='form-label fw-bolder text-dark fs-6 required'>Họ tên nhân viên</label>
                    <input
                      type='text'
                      className={`form-control form-control-lg ${
                        formik.touched.fullName && formik.errors.fullName ? 'is-invalid' : ''
                      }`}
                      placeholder='VD: Nguyễn Văn A'
                      {...formik.getFieldProps('fullName')}
                    />
                    {formik.touched.fullName && formik.errors.fullName && (
                      <div className='invalid-feedback'>{formik.errors.fullName}</div>
                    )}
                  </div>

                  {/* Số điện thoại */}
                  <div className='fv-row mb-7'>
                    <label className='form-label fw-bolder text-dark fs-6 required'>Số điện thoại</label>
                    <input
                      type='text'
                      className={`form-control form-control-lg ${
                        formik.touched.phone && formik.errors.phone ? 'is-invalid' : ''
                      }`}
                      placeholder='VD: 0123456789'
                      {...formik.getFieldProps('phone')}
                    />
                    {formik.touched.phone && formik.errors.phone && (
                      <div className='invalid-feedback'>{formik.errors.phone}</div>
                    )}
                  </div>
                </div>

                <div className='col-lg-6'>
                  {/* Username */}
                  <div className='fv-row mb-7'>
                    <label className='form-label fw-bolder text-dark fs-6 required'>Tên đăng nhập</label>
                    <input
                      type='text'
                      className={`form-control form-control-lg ${
                        formik.touched.username && formik.errors.username ? 'is-invalid' : ''
                      }`}
                      placeholder='VD: nguyenvana'
                      {...formik.getFieldProps('username')}
                    />
                    {formik.touched.username && formik.errors.username && (
                      <div className='invalid-feedback'>{formik.errors.username}</div>
                    )}
                  </div>

                  {/* Role */}
                  <div className='fv-row mb-7'>
                    <label className='form-label fw-bolder text-dark fs-6 required'>Vai trò</label>
                    <Select
                      value={formik.values.role}
                      onChange={(option) => formik.setFieldValue('role', option)}
                      options={roles}
                      placeholder='-- Chọn vai trò --'
                      className={`react-select-container ${
                        formik.touched.role && formik.errors.role ? 'is-invalid' : ''
                      }`}
                      classNamePrefix='react-select'
                      styles={selectStyles}
                      noOptionsMessage={() => "Không có vai trò nào"}
                    />
                    {formik.touched.role && formik.errors.role && (
                      <div className='invalid-feedback d-block'>{formik.errors.role}</div>
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
                      className={`form-control form-control-lg ${
                        formik.touched.email && formik.errors.email ? 'is-invalid' : ''
                      }`}
                      placeholder='VD: example@gmail.com'
                      {...formik.getFieldProps('email')}
                    />
                    {formik.touched.email && formik.errors.email && (
                      <div className='invalid-feedback'>{formik.errors.email}</div>
                    )}
                  </div>
                </div>

                {/* Trạng thái */}
                <div className='col-lg-6'>
                  <div className='fv-row mb-7'>
                    <label className='form-label fw-bolder text-dark fs-6'>Trạng thái</label>
                    <div className='d-flex align-items-center mt-3'>
                      <div className='form-check form-check-solid form-switch'>
                        <input
                          type='checkbox'
                          className='form-check-input w-45px h-30px'
                          id='status'
                          checked={formik.values.status}
                          onChange={(e) => {
                            formik.setFieldValue('status', e.target.checked);
                          }}
                        />
                        <label className='form-check-label' htmlFor='status'>
                          {formik.values.status ? 'Hoạt động' : 'Ngừng hoạt động'}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className='card-footer d-flex justify-content-end py-6 px-9 border-0'>
                <button
                  type='button'
                  className='btn btn-light btn-active-light-primary me-2'
                  onClick={() => navigate('/apps/staff')}
                  disabled={loading}
                >
                  Hủy
                </button>
                <button
                  type='submit'
                  className='btn btn-primary'
                  disabled={loading || !formik.isValid || !formik.dirty}
                >
                  {loading ? (
                    <>
                      <span className='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span>
                      <span className='ms-2'>Đang xử lý...</span>
                    </>
                  ) : (
                    'Cập nhật'
                  )}
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

export default UpdateStaff
