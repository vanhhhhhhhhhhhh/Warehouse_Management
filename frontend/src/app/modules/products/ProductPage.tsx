import React, { useEffect, useMemo, useState } from 'react'
import { ToolbarWrapper } from '../../../_metronic/layout/components/toolbar'
import { Content } from '../../../_metronic/layout/components/content'
import { PageTitle, PageLink, useLayout } from '../../../_metronic/layout/core'
import { useIntl } from 'react-intl'
import { Outlet, Route, Routes } from 'react-router-dom'
import CRUDTable from '../../../_metronic/partials/widgets/tables/CRUDTable'
import { createColumnHelper } from '@tanstack/react-table'
import ProperBadge from '../../../_metronic/partials/widgets/ProperBadge'

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
}

const data: Product[] = [
  { id: '1', name: 'Product 1', price: 100, stock: 10, status: 'active' },
  { id: '2', name: 'Product 2', price: 200, stock: 20, status: 'inactive' },
  { id: '3', name: 'Product 3', price: 300, stock: 30, status: 'active' },
]

const columnHelper = createColumnHelper<Product>()

const columns = () => [
  columnHelper.accessor('id', {
    header: 'ID',
    cell: (info) => <span>{info.getValue()}</span>
  }),
  columnHelper.accessor('name', {
    header: 'Name',
    cell: (info) => <span>{info.getValue()}</span>
  }),
  columnHelper.accessor('price', {
    header: 'Price',
    cell: (info) => <span>{info.getValue()}</span>
  }),
  columnHelper.accessor('stock', {
    header: 'Stock',
    cell: (info) => <span>{info.getValue()}</span>
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => <ProperBadge bg={info.getValue() === 'active' ? 'success' : 'danger'}>{info.getValue()}</ProperBadge>
  })
]


const ProductList: React.FC = () => {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])

  return (
    <>
      <ToolbarWrapper />
      <Content>
        <CRUDTable
          data={data}
          columns={columns()}
          onEdit={(product) => {
            console.log(product)
          }}
          onDelete={(product) => {
            console.log(product)
          }}
        />
      </Content>
    </>
  )
}

const ProductPage: React.FC = () => {
  const intl = useIntl();
  const breadCrumbs: PageLink[] = [
    {
      title: intl.formatMessage({id: 'MENU.PRODUCTS_PAGE'}),
      path: '/apps/products/productsPage',
      isActive: true
    },
    {
      title: '',
      path: '',
      isSeparator: true,
      isActive: false,
    },
  ]

  return (
    <Routes>
      <Route element={
        <>
          <Outlet />
        </>
      }>
        <Route index element={
          <>
            <PageTitle breadcrumbs={breadCrumbs}>{intl.formatMessage({id: 'MENU.PRODUCTS_PAGE.PRODUCTS_LIST'})}</PageTitle>
            <ProductList />
          </>
        } />
      </Route>
    </Routes>
  )
}

export default ProductPage;