import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from 'react-query'
import { getCategory, updateCategory } from '../../apiClient/categories'
import { CategoryRequest } from '../../schemas/categorySchema'
import Swal from 'sweetalert2'
import { KTSVG } from '../../../_metronic/helpers'
import CategoryForm from './compoents/CategoryForm'

const EditCategoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  const navigate = useNavigate()

  const { data: category, isLoading  } = useQuery({
    queryKey: ['category', id],
    queryFn: () => getCategory(id!),
    enabled: !!id
  })

  const { mutateAsync: updateCategoryMutation } = useMutation({
    mutationFn: (data: CategoryRequest) => updateCategory(id!, data),
    onSuccess: () => {
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Cập nhật danh mục thành công',
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

  if (isLoading) {
    return (
      <div className='d-flex justify-content-center'>
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
          <div className='card'>
            <div className='card-header border-0 pt-6'>
              <div className='card-title'>
                <h3 className='fw-bold'>Chỉnh sửa danh mục</h3>
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
                initialValues={{ name: category?.name ?? '' }}
                onSubmit={(values) => updateCategoryMutation(values)}
                isEdit={true}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default EditCategoryPage
