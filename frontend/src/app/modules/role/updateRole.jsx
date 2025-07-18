import React, { useState, useEffect } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import Swal from 'sweetalert2'
import { KTSVG } from '../../../_metronic/helpers'
import { API_URL, getAxiosConfig } from '../../config/api.config'
import { API_ERROR_MESSAGES } from '../../config/api.config'

// Validation schema
const updateRoleSchema = Yup.object().shape({
  roleName: Yup.string()
    .required('Vui lòng nhập tên vai trò')
    .min(3, 'Tên vai trò phải có ít nhất 3 ký tự')
    .max(50, 'Tên vai trò không được vượt quá 50 ký tự'),
  permissions: Yup.object().test(
    'not-empty',
    'Vui lòng chọn ít nhất một quyền',
    obj => obj && Object.keys(obj).length > 0
  )
})

const permissionGroups = [
  {
    title: 'Sản phẩm',
    groups: [
      {
        name: 'Danh mục',
        module: 'CATEGORIES',
        permissions: [
          { action: 'VIEW', name: 'Xem danh sách danh mục' },
          { action: 'CREATE', name: 'Thêm danh mục mới' },
          { action: 'UPDATE', name: 'Sửa thông tin danh mục' },
          { action: 'DELETE', name: 'Xóa danh mục' }
        ]
      },
      {
        name: 'Sản phẩm',
        module: 'PRODUCTS',
        permissions: [
          { action: 'VIEW', name: 'Xem danh sách sản phẩm' },
          { action: 'CREATE', name: 'Thêm sản phẩm mới (import excel)' },
          { action: 'UPDATE', name: 'Sửa thông tin sản phẩm' },
          { action: 'DELETE', name: 'Xóa sản phẩm' }
        ]
      },
      {
        name: 'Khai báo sản phẩm',
        module: 'DEFECT_PRODUCTS',
        permissions: [
          { action: 'VIEW', name: 'Xem danh sách sản phẩm lỗi' },
          { action: 'CREATE', name: 'Khai báo sản phẩm lỗi' },
          { action: 'DELETE', name: 'Xóa khai báo lỗi' }
        ]
      }
    ]
  },
  {
    title: 'Kho',
    groups: [
      {
        name: 'Quản lý kho',
        module: 'WAREHOUSE',
        permissions: [
          { action: 'VIEW', name: 'Xem danh sách kho' },
          { action: 'STOCK_IN', name: 'Thực hiện nhập kho' },
          { action: 'STOCK_OUT', name: 'Thực hiện xuất kho' },
          { action: 'VIEW_STOCK_IN_HISTORY', name: 'Xem lịch sử nhập kho' },
          { action: 'VIEW_STOCK_OUT_HISTORY', name: 'Xem lịch sử xuất kho' },
          { action: 'VIEW_INVENTORY', name: 'Xem báo cáo tồn kho' },
          { action: 'VIEW_STOCK_REPORT', name: 'Xem báo cáo xuất nhập kho' }
        ]
      }
    ]
  }
]

const UpdateRole = () => {
  const navigate = useNavigate()
  const { roleId } = useParams()
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)

  const formik = useFormik({
    initialValues: {
      roleName: '',
      permissions: {},
      status: 'Active',
    },
    validationSchema: updateRoleSchema,
    onSubmit: async (values) => {
      setLoading(true)
      try {
        const response = await axios.put(
          API_URL.ROLES.UPDATE(roleId),
          {
            name: values.roleName,
            status: values.status === 'Active',
            permissions: values.permissions
          },
          getAxiosConfig()
        )

        if (response.data.success) {
          await Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: response.data.message || 'Cập nhật vai trò thành công',
            showConfirmButton: false,
            timer: 1500
          });
          navigate('/apps/role');
        }
      } catch (error) {
        console.error('Error:', error);
        const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật vai trò'
        
        await Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: errorMessage,
          confirmButtonText: 'Đóng',
          confirmButtonColor: '#3085d6'
        });
      } finally {
        setLoading(false)
      }
    },
  })

  // Load role data
  useEffect(() => {
    const loadRoleData = async () => {
      try {
        const response = await axios.get(
          API_URL.ROLES.LIST + `/${roleId}`,
          getAxiosConfig()
        )

        if (response.data) {
          const roleData = response.data
          formik.setValues({
            roleName: roleData.name,
            permissions: roleData.permissions || {},
            status: roleData.status ? 'Active' : 'Inactive'
          })
        }
      } catch (error) {
        console.error('Error loading role:', error)
        const errorMessage = error.response?.data?.message || 'Không thể tải thông tin vai trò'
        
        await Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: errorMessage,
          confirmButtonText: 'Đóng',
          confirmButtonColor: '#3085d6'
        });
        navigate('/apps/role')
      } finally {
        setInitializing(false)
      }
    }

    loadRoleData()
  }, [roleId])

  const handlePermissionChange = (module, action, checked) => {
    const currentPermissions = formik.values.permissions[module] || []
    
    if (checked) {
      formik.setFieldValue(`permissions.${module}`, [...currentPermissions, action])
    } else {
      formik.setFieldValue(
        `permissions.${module}`,
        currentPermissions.filter(a => a !== action)
      )
    }
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
    <div className='d-flex flex-column gap-7'>
      <div className='px-9'>
        <Link
          to='/apps/role'
          className='fs-5 fw-bold text-gray-500 text-hover-dark d-flex align-items-center'
        >
          <i className='bi bi-arrow-left fs-2 me-2'></i>
          Quay lại danh sách vai trò
        </Link>
      </div>

      <div className='px-9'>
        <form onSubmit={formik.handleSubmit} noValidate>
          {/* Thông tin vai trò */}
          <div className='card mb-5 mb-xl-10'>
            <div className='card-header border-0'>
              <div className='card-title m-0'>
                <h3 className='fw-bolder m-0'>Cập nhật vai trò</h3>
              </div>
            </div>

            <div className='card-body border-top p-9'>
              {/* Tên vai trò */}
              <div className='row mb-6'>
                <label className='col-lg-4 col-form-label required fw-bold fs-6'>Tên vai trò</label>
                <div className='col-lg-8'>
                  <input
                    type='text'
                    className={`form-control form-control-lg form-control-solid ${
                      formik.touched.roleName && formik.errors.roleName ? 'is-invalid' : ''
                    }`}
                    placeholder='Nhập tên vai trò'
                    {...formik.getFieldProps('roleName')}
                  />
                  {formik.touched.roleName && formik.errors.roleName && (
                    <div className='invalid-feedback'>{formik.errors.roleName}</div>
                  )}
                </div>
              </div>

              {/* Trạng thái */}
              <div className='row mb-6'>
                <label className='col-lg-4 col-form-label fw-bold fs-6'>Trạng thái</label>
                <div className='col-lg-8 d-flex align-items-center'>
                  <div className='form-check form-check-solid form-switch fv-row'>
                    <input
                      type='checkbox'
                      className='form-check-input w-45px h-30px'
                      id='status'
                      checked={formik.values.status === 'Active'}
                      onChange={(e) => {
                        formik.setFieldValue('status',
                          e.target.checked ? 'Active' : 'Inactive'
                        )
                      }}
                    />
                    <label className='form-check-label' htmlFor='status'>
                      {formik.values.status === 'Active' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Phân quyền */}
          <div className='card mb-5 mb-xl-10'>
            <div className='card-header border-0'>
              <div className='card-title m-0'>
                <h3 className='fw-bolder m-0'>Phân quyền chức năng</h3>
              </div>
            </div>

            <div className='card-body border-top p-9'>
              {permissionGroups.map((section, sectionIndex) => (
                <div key={sectionIndex} className='mb-10'>
                  <h4 className='fw-bold d-flex align-items-center mb-6'>
                    <span className='fs-3 text-danger fw-bolder'>{section.title}</span>
                  </h4>

                  <div className='row row-cols-1 row-cols-md-2 row-cols-xl-3 g-6'>
                    {section.groups.map((group, groupIndex) => (
                      <div key={groupIndex} className='col'>
                        <div className='card card-flush h-100'>
                          <div className='card-header'>
                            <div className='card-title'>
                              <h3 className='fw-bold mb-0'>{group.name}</h3>
                            </div>
                          </div>
                          <div className='card-body pt-3'>
                            <div className='d-flex flex-column gap-3'>
                              {group.permissions.map((perm, permIndex) => (
                                <label
                                  key={permIndex}
                                  className='form-check form-check-custom form-check-solid'
                                >
                                  <input
                                    className='form-check-input'
                                    type='checkbox'
                                    checked={
                                      (formik.values.permissions[group.module] || [])
                                        .includes(perm.action)
                                    }
                                    onChange={(e) => 
                                      handlePermissionChange(group.module, perm.action, e.target.checked)
                                    }
                                  />
                                  <span className='form-check-label ps-2'>{perm.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nút hành động */}
          <div className='card-footer d-flex justify-content-end py-6 px-9'>
            <Link
              to='/apps/role'
              className='btn btn-light btn-active-light-primary me-2'
            >
              Hủy
            </Link>
            <button
              type='submit'
              className='btn btn-primary'
              disabled={loading || !formik.isValid || !formik.dirty}
            >
              {!loading && 'Cập nhật'}
              {loading && (
                <span className='indicator-progress' style={{ display: 'block' }}>
                  Đang xử lý...{' '}
                  <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UpdateRole
