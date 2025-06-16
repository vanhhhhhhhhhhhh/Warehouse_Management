import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getWarehouse, updateWarehouse, getAllStaff } from '../../services/warehouseService'
import Swal from 'sweetalert2'
import * as Yup from 'yup'

const redBorderStyle = { borderColor: '#F1416C' }

const EditWarehouse = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    isActive: true,
    address: {
      city: '',
      district: '',
      ward: '',
      detail: ''
    },
    staffId: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [staffList, setStaffList] = useState([])
  const [staffLoading, setStaffLoading] = useState(false)
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [wards, setWards] = useState([])
  const [addressLoading, setAddressLoading] = useState(false)

  // Validation schema
  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required('Tên kho không được để trống')
      .min(2, 'Tên kho phải có ít nhất 2 ký tự')
      .max(100, 'Tên kho không được vượt quá 100 ký tự'),
    phone: Yup.string()
      .required('Số điện thoại không được để trống')
      .matches(/^[0-9]+$/, 'Số điện thoại chỉ được chứa số')
      .min(10, 'Số điện thoại phải có ít nhất 10 số')
      .max(15, 'Số điện thoại không được vượt quá 15 số'),
    address: Yup.object().shape({
      city: Yup.string().required('Vui lòng chọn tỉnh/thành phố'),
      district: Yup.string().required('Vui lòng chọn quận/huyện'),
      ward: Yup.string().required('Vui lòng chọn phường/xã'),
      detail: Yup.string().required('Địa chỉ không được để trống')
    })
  })

  // Lấy danh sách nhân viên quản lý kho
  useEffect(() => {
    const fetchStaff = async () => {
      setStaffLoading(true)
      try {
        const token = localStorage.getItem('token')
        const res = await getAllStaff(token)
        if (res.success) setStaffList(res.staff)
      } catch (err) {
        setStaffList([])
      } finally {
        setStaffLoading(false)
      }
    }
    fetchStaff()
  }, [])

  // Lấy danh sách tỉnh/thành phố
  useEffect(() => {
    const fetchProvinces = async () => {
      setAddressLoading(true)
      try {
        const res = await fetch('https://provinces.open-api.vn/api/p/')
        const data = await res.json()
        setProvinces(data)
      } catch (err) {
        setProvinces([])
      } finally {
        setAddressLoading(false)
      }
    }
    fetchProvinces()
  }, [])

  // Lấy dữ liệu kho hiện tại
  useEffect(() => {
    const fetchWarehouse = async () => {
      setLoading(true)
      try {
        const res = await getWarehouse(id)
        if (res.success && res.data) {
          // Tìm code của tỉnh/thành, quận/huyện, phường/xã dựa trên tên
          const province = provinces.find(p => p.name === res.data.address.city)
          let districtList = []
          let wardList = []
          let districtCode = ''
          let wardCode = ''
          if (province) {
            const provinceRes = await fetch(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`)
            const provinceData = await provinceRes.json()
            districtList = provinceData.districts || []
            const district = districtList.find(d => d.name === res.data.address.district)
            if (district) {
              districtCode = district.code
              const districtRes = await fetch(`https://provinces.open-api.vn/api/d/${district.code}?depth=2`)
              const districtData = await districtRes.json()
              wardList = districtData.wards || []
              const ward = wardList.find(w => w.name === res.data.address.ward)
              if (ward) wardCode = ward.code
            }
          }
          setDistricts(districtList)
          setWards(wardList)
          setFormData({
            name: res.data.name,
            phone: res.data.phone,
            isActive: res.data.isActive,
            address: {
              city: province ? province.code : '',
              district: districtCode,
              ward: wardCode,
              detail: res.data.address.detail
            },
            staffId: res.data.staffId || ''
          })
        }
      } catch (err) {
        Swal.fire({
          title: 'Lỗi!',
          text: 'Không thể tải dữ liệu kho',
          icon: 'error',
          confirmButtonText: 'OK'
        })
        navigate('/apps/warehouse/list')
      } finally {
        setLoading(false)
      }
    }
    if (provinces.length > 0 && staffList.length > 0) fetchWarehouse()
    // eslint-disable-next-line
  }, [provinces, staffList, id])

  // Fetch quận/huyện khi chọn tỉnh/thành phố
  const handleProvinceChange = async (e) => {
    const provinceCode = e.target.value
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        city: provinceCode,
        district: '',
        ward: ''
      }
    }))
    setDistricts([])
    setWards([])
    if (provinceCode) {
      setAddressLoading(true)
      try {
        const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
        const data = await res.json()
        setDistricts(data.districts || [])
      } catch (err) {
        setDistricts([])
      } finally {
        setAddressLoading(false)
      }
    }
  }

  // Fetch phường/xã khi chọn quận/huyện
  const handleDistrictChange = async (e) => {
    const districtCode = e.target.value
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        district: districtCode,
        ward: ''
      }
    }))
    setWards([])
    if (districtCode) {
      setAddressLoading(true)
      try {
        const res = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
        const data = await res.json()
        setWards(data.wards || [])
      } catch (err) {
        setWards([])
      } finally {
        setAddressLoading(false)
      }
    }
  }

  const handleWardChange = (e) => {
    const wardCode = e.target.value
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        ward: wardCode
      }
    }))
  }

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true })
  }

  // Validate toàn bộ form
  const validateForm = async () => {
    const allFields = ['name', 'phone', 'address.city', 'address.district', 'address.ward', 'address.detail']
    const newTouched = { ...touched }
    allFields.forEach(field => {
      newTouched[field] = true
    })
    setTouched(newTouched)
    try {
      await validationSchema.validate(formData, { abortEarly: false })
      setFormErrors({})
      return true
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const errors = { address: {} }
        err.inner.forEach(e => {
          if (e.path?.startsWith('address.')) {
            const field = e.path.split('.')[1]
            if (errors.address) errors.address[field] = e.message
          } else if (e.path) {
            errors[e.path] = e.message
          }
        })
        setFormErrors(errors)
      }
      return false
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }))
    } else if (name === 'isActive') {
      setFormData(prev => ({ ...prev, isActive: e.target.checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const isValid = await validateForm()
    if (!isValid) return
    setSubmitting(true)
    try {
      const selectedProvince = provinces.find(p => p.code === formData.address.city)
      const selectedDistrict = districts.find(d => d.code === formData.address.district)
      const selectedWard = wards.find(w => w.code === formData.address.ward)
      const warehouseData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: {
          city: selectedProvince?.name || '',
          district: selectedDistrict?.name || '',
          ward: selectedWard?.name || '',
          detail: formData.address.detail.trim()
        },
        isActive: formData.isActive,
        staffId: formData.staffId || undefined
      }
      const response = await updateWarehouse(id, warehouseData)
      if (response.success) {
        Swal.fire({
          title: 'Thành công!',
          text: response.message,
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          navigate('/apps/warehouse/list')
        })
      }
    } catch (error) {
      Swal.fire({
        title: 'Lỗi!',
        text: error.message || 'Có lỗi xảy ra khi cập nhật kho',
        icon: 'error',
        confirmButtonText: 'OK'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/apps/warehouse/list')
  }

  if (loading) {
    return (
      <div className='d-flex justify-content-center p-5'>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className='d-flex flex-column gap-7'>
        <div className='px-9'>
          <button className='btn btn-light mb-4' onClick={handleCancel}>&larr; Quay lại danh sách kho</button>
        </div>
        <div className='px-9'>
          <div className='card'>
            <div className='card-header border-0 pt-6'>
              <div className='card-title'>
                <h3 className='fw-bold'>Chỉnh sửa kho</h3>
              </div>
            </div>
            <div className='card-body'>
              <form onSubmit={handleSubmit} noValidate>
                <div className='mb-8'>
                  <label className='form-label fw-bolder text-dark fs-6 required'>Tên kho</label>
                  <input
                    type='text'
                    name='name'
                    className='form-control form-control-lg'
                    style={touched.name && formErrors.name ? redBorderStyle : {}}
                    placeholder='Nhập tên kho'
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('name')}
                  />
                  {touched.name && formErrors.name && (
                    <div className='text-danger fs-7 mt-2'>{formErrors.name}</div>
                  )}
                </div>
                <div className='mb-8'>
                  <label className='form-label fw-bolder text-dark fs-6 required'>Số điện thoại</label>
                  <input
                    type='tel'
                    name='phone'
                    className='form-control form-control-lg'
                    style={touched.phone && formErrors.phone ? redBorderStyle : {}}
                    placeholder='Nhập số điện thoại'
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('phone')}
                  />
                  {touched.phone && formErrors.phone && (
                    <div className='text-danger fs-7 mt-2'>{formErrors.phone}</div>
                  )}
                </div>
                <div className='mb-8'>
                  <label className='form-label fw-bolder text-dark fs-6 required'>Địa chỉ cụ thể</label>
                  <input
                    type='text'
                    name='address.detail'
                    className='form-control form-control-lg'
                    style={touched['address.detail'] && formErrors.address?.detail ? redBorderStyle : {}}
                    placeholder='Nhập số nhà, tên đường...'
                    value={formData.address.detail}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('address.detail')}
                  />
                  {touched['address.detail'] && formErrors.address?.detail && (
                    <div className='text-danger fs-7 mt-2'>{formErrors.address.detail}</div>
                  )}
                </div>
                <div className='row mb-8'>
                  <div className='col-md-4 mb-4'>
                    <label className='form-label fw-bolder text-dark fs-6 required'>Tỉnh/Thành phố</label>
                    <select
                      name='address.city'
                      className='form-select form-select-lg'
                      style={touched['address.city'] && formErrors.address?.city ? redBorderStyle : {}}
                      value={formData.address.city}
                      onChange={handleProvinceChange}
                      onBlur={() => handleBlur('address.city')}
                      disabled={addressLoading}
                    >
                      <option value=''>Chọn Tỉnh/Thành phố</option>
                      {provinces.map(province => (
                        <option key={province.code} value={province.code}>{province.name}</option>
                      ))}
                    </select>
                    {touched['address.city'] && formErrors.address?.city && (
                      <div className='text-danger fs-7 mt-2'>{formErrors.address.city}</div>
                    )}
                  </div>
                  <div className='col-md-4 mb-4'>
                    <label className='form-label fw-bolder text-dark fs-6 required'>Quận/Huyện</label>
                    <select
                      name='address.district'
                      className='form-select form-select-lg'
                      style={touched['address.district'] && formErrors.address?.district ? redBorderStyle : {}}
                      value={formData.address.district}
                      onChange={handleDistrictChange}
                      onBlur={() => handleBlur('address.district')}
                      disabled={!formData.address.city || addressLoading}
                    >
                      <option value=''>Chọn Quận/Huyện</option>
                      {districts.map(district => (
                        <option key={district.code} value={district.code}>{district.name}</option>
                      ))}
                    </select>
                    {touched['address.district'] && formErrors.address?.district && (
                      <div className='text-danger fs-7 mt-2'>{formErrors.address.district}</div>
                    )}
                  </div>
                  <div className='col-md-4 mb-4'>
                    <label className='form-label fw-bolder text-dark fs-6 required'>Phường/Xã</label>
                    <select
                      name='address.ward'
                      className='form-select form-select-lg'
                      style={touched['address.ward'] && formErrors.address?.ward ? redBorderStyle : {}}
                      value={formData.address.ward}
                      onChange={handleWardChange}
                      onBlur={() => handleBlur('address.ward')}
                      disabled={!formData.address.district || addressLoading}
                    >
                      <option value=''>Chọn Phường/Xã</option>
                      {wards.map(ward => (
                        <option key={ward.code} value={ward.code}>{ward.name}</option>
                      ))}
                    </select>
                    {touched['address.ward'] && formErrors.address?.ward && (
                      <div className='text-danger fs-7 mt-2'>{formErrors.address.ward}</div>
                    )}
                  </div>
                </div>
                <div className='mb-8'>
                  <label className='form-label fw-bolder text-dark fs-6'>Nhân viên quản lý kho</label>
                  <select
                    name='staffId'
                    className='form-select form-select-lg'
                    value={formData.staffId || ''}
                    onChange={e => setFormData(prev => ({ ...prev, staffId: e.target.value }))}
                    disabled={staffLoading}
                  >
                    <option value='' disabled={!!formData.staffId}>Chọn nhân viên quản lý</option>
                    {staffLoading ? (
                      <option value='' disabled>Đang tải danh sách nhân viên...</option>
                    ) : staffList.length === 0 ? (
                      <option value='' disabled>Không có nhân viên nào</option>
                    ) : (
                      staffList.map(staff => (
                        <option key={staff._id} value={staff._id}>
                          {staff.fullName || staff.username || staff.email || ''}
                        </option>
                      ))
                    )}
                  </select>
                  {staffLoading && (
                    <div className='text-muted fs-7 mt-2'>Đang tải danh sách nhân viên...</div>
                  )}
                </div>
                <div className='mb-8'>
                  <div className='form-check form-switch form-check-custom form-check-solid'>
                    <input
                      className='form-check-input'
                      type='checkbox'
                      name='isActive'
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      id='flexSwitchDefault'
                    />
                    <label className='form-check-label' htmlFor='flexSwitchDefault'>
                      Kích hoạt
                    </label>
                  </div>
                </div>
                <div className='d-flex justify-content-end mt-6'>
                  <button
                    type='button'
                    className='btn btn-light me-3'
                    onClick={handleCancel}
                    disabled={submitting}
                  >
                    Hủy
                  </button>
                  <button
                    type='submit'
                    className='btn btn-primary'
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span>Đang xử lý...</span>
                    ) : (
                      'Lưu thay đổi'
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

export default EditWarehouse
