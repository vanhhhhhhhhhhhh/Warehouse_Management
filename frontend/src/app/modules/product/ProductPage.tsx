import React, { useState, useMemo, useEffect } from 'react';
import { createColumnHelper, CellContext, ColumnDef } from '@tanstack/react-table';
import CRUDTable from '../../reusableWidgets/CRUDTable';
import { DeleteModal, ProductToolbar } from './components';
import ProperBadge from '../../reusableWidgets/ProperBadge';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { getProducts } from '../../apiClient/products';
import { ProductListing } from '../../apiClient/products';

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
  })
];

const noop = () => {};

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const ProductsPage: React.FC = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['products', pageIndex],
    queryFn: () => getProducts({
      page: pageIndex + 1,
      limit: 5
    }),
  });

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<ProductListing[]>([]);
  const navigate = useNavigate();

  const actions = useMemo(() => [
    {
      key: 'delete',
      label: 'Xóa',
      onExecute: () => wait(1000).then(() => {
        console.log('Xóa sản phẩm', selectedItems);
      }),
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
                isLoading={isLoading}
                columns={columns}
                onSelectedItemsChange={setSelectedItems}
                pagination={
                  {
                    pageIndex,
                    totalPages: products?.totalPages ?? 0,
                    pageSize: 5
                  }
                }
                onPageChange={setPageIndex}
                onEdit={noop}
                onDelete={noop}
              />
            </div>
          </div>
        </div>
      </div>

      <DeleteModal show={false} onClose={noop} onConfirm={noop} loading={false} />
    </>
  );
};

export default ProductsPage;
