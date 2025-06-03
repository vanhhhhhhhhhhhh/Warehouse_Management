import { Card, Form } from 'react-bootstrap'

import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowData,
  RowSelectionState,
  SortingState,
  Table,
  useReactTable
} from '@tanstack/react-table'
import { useState, useMemo } from 'react'
import { useIntl } from 'react-intl'
import { KTSVG } from '../../../helpers'
import clsx from 'clsx'

interface CRUDTableProps<TData extends RowData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  onEdit: (item: TData) => void;
  onDelete: (item: TData) => void;
  onSelect: (item: TData) => void;
  onDeselect: (item: TData) => void;
  showEdit?: boolean;
  showDelete?: boolean;
}

type CRUDTableComponent = <TData extends RowData>(props: CRUDTableProps<TData>) => React.ReactNode

const CRUDTable: CRUDTableComponent = ({ data, columns, onEdit, onDelete, showEdit = true, showDelete = true }) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState('')
  const intl = useIntl()

  const columnHelper = useMemo(() => createColumnHelper<typeof data[number]>(), [])

  const colDefs = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }: { table: Table<typeof data[number]> }) => (
          <div className='form-check form-check-custom form-check-solid'>
            <input
              className='form-check-input'
              type='checkbox'
              checked={table.getIsAllRowsSelected()}
              onChange={table.getToggleAllRowsSelectedHandler()}
              />
          </div>
        ),
        cell: ({ row }) => (
          <div className='form-check form-check-custom form-check-solid'>
              <input
              className='form-check-input'
              type='checkbox'
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
              disabled={!row.getCanSelect()}
            />
          </div>
        )
      },
      ...columns,
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => (
          <div>
            {showEdit && (
              <button
                className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
                onClick={() => onEdit(info.row.original)}
                title="Edit Product"
            >
              <KTSVG
                path="/media/icons/duotune/art/art005.svg"
                className="svg-icon-3"
                />
              </button>
            )}
            {showDelete && (
              <button
                className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
                onClick={() => onDelete(info.row.original)}
                title="Remove Product"
            >
              <KTSVG
                path="/media/icons/duotune/general/gen027.svg"
                className="svg-icon-3"
                />
              </button>
            )}
          </div>
        ),
      }),
    ],
    [columns]
  )

  const table = useReactTable({
    data,
    columns: colDefs,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <Card>
      <div className="table-responsive">
        <table className="table table-striped gy-7 gs-7">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="fw-bold fs-6 text-gray-800 border-bottom border-gray-200">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className={clsx(
                    'user-select-none',
                    header.column.getCanSort() ? 'cursor-pointer' : null,
                  )}>
                    {header.isPlaceholder ? null : (
                      <span
                        className="position-relative"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() ? (
                          <div className="position-absolute" style={{ top: '-1px', right: '-19px' }}>
                            {header.column.getIsSorted() === 'asc' ? '↑' : '↓'}
                          </div>
                        ) : null}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td className={clsx([
                    cell.column.getIsLastColumn() || cell.column.getIsFirstColumn() ? 'width-min' : '',
                  ])} key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Card.Footer className='py-2'>
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <span className="text-muted">
              {intl.formatMessage({ id: 'TABLE.PAGINATION_INFO' }, {
                from: table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1,
                to: Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                ),
                total: table.getFilteredRowModel().rows.length
              })}
            </span>
          </div>
          <div className="d-flex align-items-center">
            <button
              className="btn btn-sm btn-light me-2"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              {'<<'}
            </button>
            <button
              className="btn btn-sm btn-light me-2"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {'<'}
            </button>
            <span className="btn btn-sm btn-light-primary me-2">
              {intl.formatMessage({ id: 'TABLE.PAGE_INFO' }, {
                page: table.getState().pagination.pageIndex + 1,
                total: table.getPageCount()
              })}
            </span>
            <button
              className="btn btn-sm btn-light me-2"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {'>'}
            </button>
            <button
              className="btn btn-sm btn-light"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              {'>>'}
            </button>
          </div>
        </div>
      </Card.Footer>
    </Card>
  )
}

export default CRUDTable;