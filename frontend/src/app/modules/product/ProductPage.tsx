import React, { useState, useMemo, useEffect } from 'react';
import { createColumnHelper, CellContext, ColumnDef } from '@tanstack/react-table';
import CRUDTable from '../../reusableWidgets/CRUDTable';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { activateProducts, deactivateProducts, getProducts } from '../../apiClient/products';
import { ProductListing } from '../../schemas/productSchema';
import Swal from 'sweetalert2';
import ProperBadge from '../../reusableWidgets/ProperBadge';
import { ProductToolbar } from './components';

const columnHelper = createColumnHelper<ProductListing>();

const columns: ColumnDef<ProductListing, any>[] = [
  columnHelper.accessor('code', {
    header: 'Mã sản phẩm',
    cell: (info: CellContext<ProductListing, string>) => info.getValue(),
  }),
  columnHelper.accessor('name', {
    header: 'Tên sản phẩm',
    cell: (info: CellContext<ProductListing, string>) => info.getValue(),
  }),
  columnHelper.accessor('category', {
    header: 'Danh mục',
    cell: (info: CellContext<ProductListing, string>) => info.getValue(),
  }),
  columnHelper.accessor('price', {
    header: 'Giá',
    cell: (info: CellContext<ProductListing, number>) => info.getValue(),
  }),
  columnHelper.accessor('isDelete', {
    header: 'Trạng thái',
    cell: (info: CellContext<ProductListing, boolean>) => {
      return <ProperBadge variant={info.getValue() ? 'danger' : 'success'}>
        {info.getValue() ? 'Inactive' : 'Active'}
      </ProperBadge>
    }
  })
];

const noop = () => {};

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const ProductsPage: React.FC = () => {
  const [pageIndex, setPageIndex] = useState(0);

  const queryClient = useQueryClient();
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', pageIndex],
    queryFn: () => getProducts({
      page: pageIndex + 1,
      limit: 5
    }),
    keepPreviousData: true
  });

  const { mutateAsync: deactivateProductMutation } = useMutation({
    mutationFn: (selectedItems: string[]) => deactivateProducts(selectedItems),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Hủy kích hoạt sản phẩm thành công',
        showConfirmButton: false,
        timer: 1500
      });
      setSelectedItems([]);
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: error.message,
      });
    }
  })

  const { mutateAsync: activateProductMutation } = useMutation({
    mutationFn: (selectedItems: string[]) => activateProducts(selectedItems),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Kích hoạt sản phẩm thành công',
        showConfirmButton: false,
        timer: 1500
      });
      setSelectedItems([]);
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: error.message,
      });
    }
  })

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const navigate = useNavigate();

  const actions = useMemo(() => [
    {
      key: 'deactivate',
      label: 'Hủy kích hoạt',
      onExecute: () => deactivateProductMutation(selectedItems)
    },
    {
      key: 'activate',
      label: 'Kích hoạt',
      onExecute: () => activateProductMutation(selectedItems)
    },
    {
      key: 'import_to_warehouse',
      label: 'Nhập kho',
      onExecute: () => wait(1000).then(() => {
        console.log('Nhập kho sản phẩm', selectedItems);
      }),
    },
  ], [selectedItems]);

  useEffect(() => {
    console.log('pageIndex', pageIndex + 1);
  }, [pageIndex]);

  return (
    <>
      <div className="d-flex flex-column gap-7">
        <div className="px-9">
          <div className="card">
            <div className="card-header border-0 pt-6 d-flex justify-content-between">
              <div className="card-title">
                <h3 className="fw-bold">Danh sách sản phẩm</h3>
              </div>
            </div>

            <ProductToolbar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onDownloadTemplate={noop}
              onShowImportModal={noop}
              onAddProduct={() => navigate('/apps/products/create')}
            />

            <div className="card-body py-4">
              <CRUDTable.SelectedItemsActions
                selectedCount={selectedItems.length}
                selectionMessage={(count) => `${count} sản phẩm đã chọn`}
                actions={actions}
              />

              <CRUDTable
                data={products?.data ?? []}
                getRowId={(row) => row._id}
                isLoading={isLoading}
                columns={columns}
                selectedItems={selectedItems}
                onSelectedItemsChange={setSelectedItems}
                pagination={
                  {
                    pageIndex,
                    totalPages: products?.totalPages,
                    pageSize: 5
                  }
                }
                onPageChange={setPageIndex}
                onEdit={(product) => navigate(`/apps/products/${product._id}`)}
                showDelete={false}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductsPage;
