import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from 'react-query'
import { createCategory } from '../../apiClient/categories'
import Swal from 'sweetalert2'
import { KTSVG } from '../../../_metronic/helpers'
import CategoryForm from './compoents/CategoryForm'
import { CategoryRequest } from '../../schemas/categorySchema'

const CreateCategoryPage: React.FC = () => {
  const navigate = useNavigate()

  const { mutateAsync: createCategoryMutation } = useMutation({
    mutationFn: (data: CategoryRequest) => createCategory(data),
    onSuccess: () => {
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Tạo danh mục thành công',
        showConfirmButton: false,
        timer: 1500
      })
      navigate('/apps/categories')
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: error.message,
      })
    }
  })

  return (
    <>
      <div className='d-flex flex-column gap-7'>
        <div className='px-9'>
          <div className='card'>
            <div className='card-header border-0 pt-6'>
              <div className='card-title'>
                <h3 className='fw-bold'>Tạo danh mục mới</h3>
              </div>
              <div className='card-toolbar'>
                <button
                  type='button'
                  className='btn btn-light me-3'
                  onClick={() => navigate('/apps/categories')}
                >
                  <KTSVG
                    path='/media/icons/duotune/arrows/arr063.svg'
                    className='svg-icon-2 me-1'
                  />
                  Quay lại
                </button>
              </div>
            </div>

            <div className='card-body'>
              <CategoryForm
                initialValues={{ name: '' }}
                onSubmit={(values) => createCategoryMutation(values)}
                isEdit={false}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CreateCategoryPage
