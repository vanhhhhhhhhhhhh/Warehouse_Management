import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from 'react-query'
import { createCategory } from '../../apiClient/categories'
import Swal from 'sweetalert2'
import CategoryForm, { CategoryFormRequest } from './components/CategoryForm'

const CreateCategoryPage: React.FC = () => {
  const navigate = useNavigate()

  const { mutateAsync: createCategoryMutation } = useMutation({
    mutationFn: (data: CategoryFormRequest) => createCategory(data),
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
      <div className="d-flex flex-column gap-7">
        <div className="px-9">
          <Link to="/apps/categories" className="fs-5 fw-bold text-gray-500 text-hover-dark d-flex align-items-center">
            <i className="bi bi-arrow-left fs-2 me-2"></i>
            Quay lại danh sách danh mục
          </Link>
        </div>

        <div className="px-9">
          <div className="card">
            <div className="card-header border-0 pt-6">
              <div className="card-title">
                <h3 className="fw-bold">Tạo danh mục mới</h3>
              </div>
            </div>

            <div className="card-body">
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
  );
}

export default CreateCategoryPage
