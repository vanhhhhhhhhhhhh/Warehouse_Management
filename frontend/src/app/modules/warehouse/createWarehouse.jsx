import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ToolbarWrapper } from '../../../_metronic/layout/components/toolbar'
import { Content } from '../../../_metronic/layout/components/content'
import { Link } from 'react-router-dom'
import * as Yup from 'yup'

// Custom CSS for validation styling
const redBorderStyle = {
  borderColor: '#F1416C'
}

const CreateWarehouse = () => {
  const navigate = useNavigate()

  // State cho form data
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    isActive: true,
    address: {
      city: '',
      district: '',
      ward: '',
      detail: ''
    }
  })

  // Thêm state để lưu trữ lỗi form
  const [formErrors, setFormErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // State cho danh sách địa chỉ
  const [cities, setCities] = useState([])
  const [districts, setDistricts] = useState([])
  const [wards, setWards] = useState([])
  const [loading, setLoading] = useState(false)

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

  // Mock data cho API calls
  const mockCities = [
    { code: '01', name: 'Hà Nội' },
    { code: '79', name: 'TP Hồ Chí Minh' },
    { code: '48', name: 'Đà Nẵng' }
  ]

  const mockDistricts = {
    '01': [
      { code: '001', name: 'Quận Ba Đình' },
      { code: '002', name: 'Quận Hoàn Kiếm' }
    ],
    '79': [
      { code: '760', name: 'Quận 1' },
      { code: '761', name: 'Quận 12' }
    ],
    '48': [
      { code: '490', name: 'Quận Hải Châu' },
      { code: '491', name: 'Quận Thanh Khê' }
    ]
  }

  const mockWards = {
    '001': [
      { code: '00001', name: 'Phường Phúc Xá' },
      { code: '00004', name: 'Phường Trúc Bạch' }
    ],
    '760': [
      { code: '26734', name: 'Phường Bến Nghé' },
      { code: '26737', name: 'Phường Bến Thành' }
    ],
    '490': [
      { code: '20194', name: 'Phường Hải Châu 1' },
      { code: '20195', name: 'Phường Hải Châu 2' }
    ]
  }

  // Fetch tỉnh/thành phố khi component mount
  useEffect(() => {
    setCities(mockCities)
  }, [])

  // Fetch quận/huyện khi chọn tỉnh/thành phố
  const fetchDistricts = (cityCode) => {
    setDistricts(mockDistricts[cityCode] || [])
    setWards([])
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        district: '',
        ward: ''
      }
    }))
    
    // Validate district field
    if (touched['address.district']) {
      validateField('address.district', '')
    }

    // Validate ward field
    if (touched['address.ward']) {
      validateField('address.ward', '')
    }
  }

  // Fetch phường/xã khi chọn quận/huyện
  const fetchWards = (districtCode) => {
    setWards(mockWards[districtCode] || [])
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        ward: ''
      }
    }))
    
    // Validate ward field
    if (touched['address.ward']) {
      validateField('address.ward', '')
    }
  }

  // Đánh dấu field đã được chạm vào
  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true })
    
    // Get the current value for validation
    let value
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1]
      value = formData.address[addressField]
    } else {
      value = formData[field]
    }
    
    // Validate the field
    validateField(field, value)
  }

  // Validate một field cụ thể
  const validateField = async (field, value) => {
    try {
      // Handle address fields differently
      if (field.startsWith('address.')) {
        const addressField = field.split('.')[1]
        const addressSchema = Yup.object().shape({
          [addressField]: Yup.string().required(`Vui lòng nhập ${addressField === 'city' ? 'tỉnh/thành phố' : addressField === 'district' ? 'quận/huyện' : addressField === 'ward' ? 'phường/xã' : 'địa chỉ cụ thể'}`)
        })
        
        await addressSchema.validate({ [addressField]: value }, { abortEarly: false })
        
        // Clear error for this field
        setFormErrors(prev => {
          const newErrors = { ...prev }
          if (newErrors.address) {
            newErrors.address = { ...newErrors.address, [addressField]: undefined }
          }
          return newErrors
        })
      } else {
        // Handle regular fields
        const fieldSchema = Yup.object().shape({
          [field]: field === 'name' 
            ? Yup.string().required('Tên kho không được để trống').min(2, 'Tên kho phải có ít nhất 2 ký tự').max(100, 'Tên kho không được vượt quá 100 ký tự')
            : Yup.string().required('Số điện thoại không được để trống').matches(/^[0-9]+$/, 'Số điện thoại chỉ được chứa số').min(10, 'Số điện thoại phải có ít nhất 10 số').max(15, 'Số điện thoại không được vượt quá 15 số')
        })
        
        await fieldSchema.validate({ [field]: value }, { abortEarly: false })
        
        // Clear error for this field
        setFormErrors(prev => ({ ...prev, [field]: undefined }))
      }
      return true
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const error = err.inner[0]
        
        if (field.startsWith('address.')) {
          const addressField = field.split('.')[1]
          setFormErrors(prev => ({
            ...prev,
            address: {
              ...(prev.address || {}),
              [addressField]: error.message
            }
          }))
        } else {
          setFormErrors(prev => ({ ...prev, [field]: error.message }))
        }
      }
      return false
    }
  }

  // Validate toàn bộ form
  const validateForm = async () => {
    // Đánh dấu tất cả các trường là đã chạm vào
    const allFields = ['name', 'phone', 'address.city', 'address.district', 'address.ward', 'address.detail']
    const newTouched = { ...touched }
    allFields.forEach(field => {
      newTouched[field] = true
    })
    setTouched(newTouched)
    
    try {
      // Prepare data for validation
      const validationData = {
        ...formData,
        address: { ...formData.address }
      }
      
      // Validate
      await validationSchema.validate(validationData, { abortEarly: false })
      setFormErrors({})
      return true
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const errors = {
          address: {}
        }
        
        err.inner.forEach(e => {
          if (e.path?.startsWith('address.')) {
            const field = e.path.split('.')[1]
            if (errors.address) {
              errors.address[field] = e.message
            }
          } else if (e.path) {
            errors[e.path] = e.message
          }
        })
        
        setFormErrors(errors)
        console.error('Vui lòng kiểm tra lại thông tin')
      }
      return false
    }
  }

  // Handle input changes
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

      // Fetch related data when selecting city or district
      if (name === 'address.city' && value) {
        fetchDistricts(value)
      } else if (name === 'address.district' && value) {
        fetchWards(value)
      }
      
      // Validate if touched
      if (touched[name]) {
        validateField(name, value)
      }
    } else if (name === 'isActive') {
      const checkbox = e.target
      setFormData(prev => ({
        ...prev,
        isActive: checkbox.checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
      
      // Validate if touched
      if (touched[name]) {
        validateField(name, value)
      }
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    const isValid = await validateForm()
    if (!isValid) {
      return
    }
    
    setSubmitting(true)
    setLoading(true)

    try {
      // Lấy tên địa chỉ từ mã
      const selectedCity = cities.find(city => city.code.toString() === formData.address.city)
      const selectedDistrict = districts.find(district => district.code.toString() === formData.address.district)
      const selectedWard = wards.find(ward => ward.code.toString() === formData.address.ward)

      // Validate that we found all location names
      if (!selectedCity?.name || !selectedDistrict?.name || !selectedWard?.name) {
        console.error('Có lỗi khi xử lý thông tin địa chỉ')
        return
      }

      const warehouseData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: {
          city: selectedCity.name,
          district: selectedDistrict.name,
          ward: selectedWard.name,
          detail: formData.address.detail.trim()
        },
        isActive: formData.isActive
      }

      console.log('Warehouse created:', warehouseData)
      navigate('/apps/warehouse/list')
      
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/apps/warehouse/list')
  }

  return (
    <>
      <div className='d-flex flex-column gap-7'>
        <div className='px-9'>
          <Link
            to='/apps/warehouse/list'
            className='fs-5 fw-bold text-gray-500 text-hover-dark d-flex align-items-center'
          >
            <i className='bi bi-arrow-left fs-2 me-2'></i>
            Quay lại danh sách kho
          </Link>
        </div>

        <div className='px-9'>
          <div className='card'>
            <div className='card-header border-0 pt-6'>
              <div className='card-title'>
                <h3 className='fw-bold'>Tạo kho mới</h3>
              </div>
            </div>

            <div className='card-body'>
              {loading ? (
                <div className='d-flex justify-content-center p-5'>
                  <div className='spinner-border text-primary' role='status'>
                    <span className='visually-hidden'>Loading...</span>
                  </div>
                </div>
              ) : (
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
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('address.city')}
                      >
                        <option value=''>Chọn Tỉnh/Thành phố</option>
                        {cities.map(city => (
                          <option key={city.code} value={city.code}>
                            {city.name}
                          </option>
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
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('address.district')}
                        disabled={!formData.address.city}
                      >
                        <option value=''>Chọn Quận/Huyện</option>
                        {districts.map(district => (
                          <option key={district.code} value={district.code}>
                            {district.name}
                          </option>
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
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('address.ward')}
                        disabled={!formData.address.district}
                      >
                        <option value=''>Chọn Phường/Xã</option>
                        {wards.map(ward => (
                          <option key={ward.code} value={ward.code}>
                            {ward.name}
                          </option>
                        ))}
                      </select>
                      {touched['address.ward'] && formErrors.address?.ward && (
                        <div className='text-danger fs-7 mt-2'>{formErrors.address.ward}</div>
                      )}
                    </div>
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

                  {/* Buttons */}
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
                      disabled={loading || submitting}
                    >
                      {submitting ? (
                        <span>Đang xử lý...</span>
                      ) : (
                        'Lưu'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CreateWarehouse
