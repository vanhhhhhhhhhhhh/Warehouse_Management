import React, { useState, useMemo } from 'react';
import { createColumnHelper, CellContext, ColumnDef } from '@tanstack/react-table';
import CRUDTable from '../../../_metronic/partials/widgets/tables/CRUDTable';
import { DeleteModal, ProductToolbar } from './components';
import ProperBadge from '../../../_metronic/partials/widgets/ProperBadge';
import { useNavigate } from 'react-router-dom';

interface Product {
  _id: string;
  code: string;
  name: string;
  category: { name: string };
  status: 'Active' | 'Inactive';
}

const mockProducts: Product[] = [
  {
    _id: '1',
    code: '1234567890',
    name: 'Sản phẩm 1',
    category: { name: 'Danh mục 1' },
    status: 'Active',
  },
];

const columnHelper = createColumnHelper<Product>();

const columns: ColumnDef<Product, any>[] = [
  columnHelper.accessor('code', {
    header: 'Mã sản phẩm',
    cell: (info: CellContext<Product, string>) => info.getValue(),
  }),
  columnHelper.accessor('name', {
    header: 'Tên sản phẩm',
    cell: (info: CellContext<Product, string>) => info.getValue(),
  }),
  columnHelper.accessor('category.name', {
    header: 'Danh mục',
    cell: (info: CellContext<Product, string>) => info.getValue(),
  }),
  columnHelper.accessor('status', {
    header: 'Trạng thái',
    cell: (info: CellContext<Product, 'Active' | 'Inactive'>) => (
      <ProperBadge variant={info.getValue() === 'Active' ? 'success' : 'danger'}>{info.getValue()}</ProperBadge>
    ),
  }),
];

const noop = () => {};

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const ProductsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<Product[]>([]);
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
                data={mockProducts}
                columns={columns}
                onSelectedItemsChange={setSelectedItems}
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
