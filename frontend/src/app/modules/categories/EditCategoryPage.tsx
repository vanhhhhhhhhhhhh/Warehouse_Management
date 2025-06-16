import React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { getCategory, updateCategory } from '../../apiClient/categories'
import Swal from 'sweetalert2'
import CategoryForm, { CategoryFormRequest } from './components/CategoryForm'

const EditCategoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: category, isLoading  } = useQuery({
    queryKey: ['category', id],
    queryFn: () => getCategory(id!),
    enabled: !!id
  })


  const { mutateAsync: updateCategoryMutation } = useMutation({
    mutationFn: (data: CategoryFormRequest) => updateCategory(id!, data),
    onSuccess: () => {
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Cập nhật danh mục thành công',
        showConfirmButton: false,
        timer: 1500
      })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
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

  if (!category || isLoading) {
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
        <div className="px-9">
          <Link to="/apps/categories" className="fs-5 fw-bold text-gray-500 text-hover-dark d-flex align-items-center">
            <i className="bi bi-arrow-left fs-2 me-2"></i>
            Quay lại danh sách danh mục
          </Link>
        </div>

        <div className='px-9'>
          <div className='card'>
            <div className='card-header border-0 pt-6'>
              <div className='card-title'>
                <h3 className='fw-bold'>Chỉnh sửa danh mục</h3>
              </div>
            </div>

            <div className='card-body'>
              <CategoryForm
                initialValues={{ name: category.name  }}
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
