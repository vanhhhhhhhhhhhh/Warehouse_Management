import React, { useState, useEffect } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Link, useNavigate } from 'react-router-dom'
import { KTSVG } from '../../../_metronic/helpers'

// Validation schema
const createRoleSchema = Yup.object().shape({
  roleName: Yup.string()
    .required('Vui lòng nhập tên vai trò')
    .min(3, 'Tên vai trò phải có ít nhất 3 ký tự')
    .max(50, 'Tên vai trò không được vượt quá 50 ký tự'),
  description: Yup.string()
    .required('Vui lòng nhập mô tả')
    .min(10, 'Mô tả phải có ít nhất 10 ký tự'),
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
        name: 'Sản phẩm',
        module: 'PRODUCTS',
        permissions: [
          { action: 'VIEW', name: 'Xem danh sách sản phẩm' },
          { action: 'CREATE', name: 'Thêm sản phẩm mới' },
          { action: 'UPDATE', name: 'Sửa thông tin sản phẩm' },
          { action: 'DELETE', name: 'Xóa sản phẩm' }
        ]
      },
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
        name: 'Combo',
        module: 'COMBOS',
        permissions: [
          { action: 'VIEW', name: 'Xem danh sách combo' },
          { action: 'CREATE', name: 'Tạo combo mới' },
          { action: 'UPDATE', name: 'Sửa thông tin combo' },
          { action: 'DELETE', name: 'Xóa combo' }
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
        name: 'Kho',
        module: 'WAREHOUSE',
        permissions: [
          { action: 'VIEW', name: 'Xem danh sách kho' },
          { action: 'CREATE', name: 'Thêm kho mới' },
          { action: 'UPDATE', name: 'Sửa thông tin kho' },
          { action: 'DELETE', name: 'Xóa kho' }
        ]
      },
      {
        name: 'Quản lý kho',
        module: 'STOCK',
        permissions: [
          { action: 'STOCK_IN', name: 'Thực hiện nhập kho' },
          { action: 'STOCK_OUT', name: 'Thực hiện xuất kho' },
          { action: 'VIEW_STOCK_IN_HISTORY', name: 'Xem lịch sử nhập kho' },
          { action: 'VIEW_STOCK_OUT_HISTORY', name: 'Xem lịch sử xuất kho' },
          { action: 'VIEW_INVENTORY', name: 'Xem báo cáo tồn kho' },
          { action: 'VIEW_STOCK_REPORT', name: 'Xem báo cáo xuất nhập kho' }
        ]
      }
    ]
  },
  {
    title: 'Marketing',
    groups: [
      {
        name: 'Landing Page',
        module: 'LANDING_PAGE',
        permissions: [
          { action: 'VIEW', name: 'Xem danh sách Landing Page' },
          { action: 'CREATE', name: 'Thêm Landing Page mới' },
          { action: 'UPDATE', name: 'Sửa thông tin Landing Page' },
          { action: 'DELETE', name: 'Xóa Landing Page' }
        ]
      },
      {
        name: 'Fanpage',
        module: 'FANPAGE',
        permissions: [
          { action: 'VIEW', name: 'Xem danh sách Fanpage' },
          { action: 'CREATE', name: 'Thêm Fanpage mới' },
          { action: 'UPDATE', name: 'Sửa thông tin Fanpage' },
          { action: 'DELETE', name: 'Xóa Fanpage' }
        ]
      },
      {
        name: 'Báo cáo Marketing',
        module: 'MARKETING_REPORT',
        permissions: [
          { action: 'VIEW', name: 'Xem báo cáo tổng quan' },
          { action: 'CREATE', name: 'Tạo báo cáo mới' },
          { action: 'UPDATE', name: 'Sửa báo cáo' },
          { action: 'DELETE', name: 'Xóa báo cáo' }
        ]
      },
      {
        name: 'Chi phí Marketing',
        module: 'MARKETING_COST',
        permissions: [
          { action: 'VIEW', name: 'Xem danh sách chi phí' },
          { action: 'CREATE', name: 'Khai báo chi phí mới' },
          { action: 'UPDATE', name: 'Sửa khai báo chi phí' },
          { action: 'DELETE', name: 'Xóa khai báo chi phí' }
        ]
      }
    ]
  },
  {
    title: 'Khách hàng',
    groups: [
      {
        name: 'Danh sách khách hàng',
        module: 'CUSTOMERS',
        permissions: [
          { action: 'VIEW', name: 'Xem danh sách khách hàng' },
          { action: 'IMPORT', name: 'Nhập file khách hàng' },
          { action: 'CREATE', name: 'Thêm khách hàng mới' },
          { action: 'ASSIGN', name: 'Phân bổ khách hàng' }
        ]
      },
      {
        name: 'Quản lý nhân viên CSKH',
        module: 'CSKH_STAFF',
        permissions: [
          { action: 'VIEW', name: 'Xem danh sách nhân viên CSKH' },
          { action: 'UPDATE_STATUS', name: 'Cập nhật trạng thái nhân viên CSKH' },
          { action: 'VIEW_DETAILS', name: 'Xem chi tiết nhân viên CSKH' }
        ]
      },
      {
        name: 'Phân bổ khách hàng',
        module: 'CUSTOMER_ASSIGNMENT',
        permissions: [
          { action: 'VIEW', name: 'Xem danh sách phân bổ khách hàng' },
          { action: 'UPDATE_RESULTS', name: 'Cập nhật kết quả tác nghiệp' },
          { action: 'VIEW_INFO', name: 'Xem thông tin khách hàng' }
        ]
      }
    ]
  },
  {
    title: 'Đơn hàng',
    groups: [
      {
        name: 'Đơn hàng',
        module: 'ORDERS',
        permissions: [
          { action: 'VIEW', name: 'Xem danh sách đơn hàng' },
          { action: 'CREATE', name: 'Tạo đơn hàng mới' },
          { action: 'UPDATE', name: 'Sửa đơn hàng' },
          { action: 'VIEW_DETAILS', name: 'Xem chi tiết đơn hàng' }
        ]
      },
      {
        name: 'Tổng quan vận chuyển',
        module: 'SHIPPING_OVERVIEW',
        permissions: [
          { action: 'VIEW', name: 'Xem báo cáo tổng quan' }
        ]
      },
      {
        name: 'Vận đơn',
        module: 'SHIPPING_ORDERS',
        permissions: [
          { action: 'VIEW', name: 'Xem danh sách vận đơn' },
          { action: 'APPROVE', name: 'Duyệt đơn' },
          { action: 'CANCEL', name: 'Hủy duyệt đơn' },
          { action: 'UPDATE_STATUS', name: 'Cập nhật trạng thái' },
          { action: 'UPDATE_CODE', name: 'Cập nhật mã vận đơn' }
        ]
      },
      {
        name: 'Đối soát',
        module: 'RECONCILIATION',
        permissions: [
          { action: 'EXECUTE', name: 'Thực hiện đối soát' }
        ]
      }
    ]
  }
]

const CreateEmployeeRole = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const formik = useFormik({
    initialValues: {
      roleName: '',
      description: '',
      permissions: {},
      status: 'Active',
    },
    validationSchema: createRoleSchema,
    onSubmit: async (values) => {
      setLoading(true)
      try {
        const response = await roleService.createRole({
          roleName: values.roleName,
          description: values.description,
          permissions: values.permissions,
          status: values.status
        })

        if (response.success) {
          toast.success('Tạo vai trò mới thành công!', {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          })
          
          navigate('/apps/staff/role')
        }
      } catch (error) {
        toast.error(error.message, {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })
      } finally {
        setLoading(false)
      }
    },
  })

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
                <h3 className='fw-bolder m-0'>Thông tin vai trò</h3>
              </div>
            </div>

            <div className='card-body border-top p-9'>
              {/* Tên vai trò */}
              <div className='row mb-6'>
                <label className='col-lg-4 col-form-label required fw-bold fs-6'>Tên vai trò</label>
                <div className='col-lg-8'>
                  <input
                    type='text'
                    className={`form-control form-control-lg form-control-solid ${formik.touched.roleName && formik.errors.roleName ? 'is-invalid' : ''
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
              to='/apps/staff/role'
              className='btn btn-light btn-active-light-primary me-2'
            >
              Hủy
            </Link>
            <button
              type='submit'
              className='btn btn-primary'
              disabled={loading || !formik.isValid || !formik.dirty}
            >
              {!loading && 'Tạo vai trò'}
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

export default CreateEmployeeRole