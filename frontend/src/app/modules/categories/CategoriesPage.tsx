import React, { useState, useMemo } from 'react'
import { createColumnHelper, CellContext, ColumnDef } from '@tanstack/react-table'
import CRUDTable from '../../reusableWidgets/CRUDTable'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { activateCategories, deactivateCategories, getCategories } from '../../apiClient/categories'
import { CategoryListing } from '../../apiClient/api'
import Swal from 'sweetalert2'
import { KTSVG } from '../../../_metronic/helpers'
import ProperBadge from '../../reusableWidgets/ProperBadge'
import { useStatusFilter } from '../../reusableWidgets/useStatusFilter'

const columnHelper = createColumnHelper<CategoryListing>()

const columns: ColumnDef<CategoryListing, any>[] = [
  columnHelper.accessor('name', {
    header: 'Tên danh mục',
    cell: (info: CellContext<CategoryListing, string>) => info.getValue(),
  }),
  columnHelper.accessor('isDelete', {
    header: 'Trạng thái',
    cell: (info: CellContext<CategoryListing, boolean>) => {
      return <ProperBadge variant={info.getValue() ? 'danger' : 'success'}>
        {info.getValue() ? 'Ngừng hoạt động' : 'Hoạt động'}
      </ProperBadge>
    }
  }),
  columnHelper.accessor('createdAt', {
    header: 'Ngày tạo',
    cell: (info: CellContext<CategoryListing, string>) =>
      new Date(info.getValue()).toLocaleDateString('vi-VN'),
  })
]

const CategoriesPage: React.FC = () => {
  const [pageIndex, setPageIndex] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const { statusFilter, statusFilterElement } = useStatusFilter()

  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories', pageIndex, searchTerm, statusFilter],
    queryFn: () => getCategories({
      pagination: {
        page: pageIndex + 1,
        limit: 5
      },
      search: {
        name: searchTerm,
        status: statusFilter
      }
    }),
    keepPreviousData: true
  })

  const { mutateAsync: deleteCategoriesMutation } = useMutation({
    mutationFn: (selectedItems: string[]) => deactivateCategories(selectedItems),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Vô hiệu hóa danh mục thành công',
        showConfirmButton: false,
        timer: 1500
      })
      setSelectedItems([])
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: error.message,
      })
    }
  })

  const { mutateAsync: activateCategoriesMutation } = useMutation({
    mutationFn: (selectedItems: string[]) => activateCategories(selectedItems),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Kích hoạt danh mục thành công',
        showConfirmButton: false,
        timer: 1500
      })
      setSelectedItems([])
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: error.message
      })
    }
  })

  const actions = useMemo(() => [
    {
      key: 'deactivate',
      label: 'Hủy kích hoạt',
      onExecute: () => deleteCategoriesMutation(selectedItems)
    },
    {
      key: 'activate',
      label: 'Kích hoạt',
      onExecute: () => activateCategoriesMutation(selectedItems)
    }
  ], [selectedItems, deleteCategoriesMutation, activateCategoriesMutation])

  if (!categories || isLoading) {
    return <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
  }

  return (
    <>
      <div className='d-flex flex-column gap-7'>
        <div className='px-9'>
          <div className='card'>
            <div className='card-header border-0 pt-6 d-flex justify-content-between'>
              <div className='card-title'>
                <h3 className='fw-bold'>Danh sách danh mục</h3>
              </div>
            </div>

            <div className='card-header border-0 pt-6'>
              <div className='card-title space-x-2'>
                <div className='d-flex align-items-center position-relative my-1'>
                  <KTSVG
                    path='/media/icons/duotune/general/gen021.svg'
                    className='svg-icon-1 position-absolute ms-6'
                  />
                  <input
                    type='text'
                    className='form-control form-control-solid w-250px ps-14'
                    placeholder='Tìm kiếm danh mục'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {statusFilterElement}
              </div>

              <div className='card-toolbar'>
                <button
                  type='button'
                  className='btn btn-primary'
                  onClick={() => navigate('/apps/categories/create')}
                >
                  <i className='ki-duotone ki-plus fs-2' />
                  Thêm danh mục
                </button>
              </div>
            </div>

            <div className='card-body py-4'>
              <CRUDTable.SelectedItemsActions
                selectedCount={selectedItems.length}
                selectionMessage={(count) => `${count} danh mục đã chọn`}
                actions={actions}
              />

              <CRUDTable
                data={categories.data}
                getRowId={(row) => row._id}
                isLoading={isLoading}
                columns={columns}
                selectedItems={selectedItems}
                onSelectedItemsChange={setSelectedItems}
                pagination={{
                  pageIndex,
                  totalPages: categories?.totalPages,
                  pageSize: 5
                }}
                onPageChange={setPageIndex}
                onEdit={(category) => navigate(`/apps/categories/${category._id}`)}
                showDelete={false}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CategoriesPage
