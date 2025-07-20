import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  RowData,
  RowSelectionState,
  SortingState,
  Table,
  Updater,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import { useIntl } from "react-intl";
import { KTSVG } from "../../_metronic/helpers";
import clsx from "clsx";
import {
  SelectedItemsActions,
  SelectedItemsActionsProps,
} from "./SelectedItemsActions";

interface Pagination {
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

interface CRUDTableProps<TData extends RowData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  getRowId: (row: TData) => string;
  onEdit?: (item: TData) => void;
  onDelete?: (item: TData) => void;
  onSelectedItemsChange?: (items: string[]) => void;
  selectedItems?: string[];
  onPageChange?: (page: number) => void;
  showEdit?: boolean;
  showDelete?: boolean;
  isLoading?: boolean;
  pagination?: Partial<Pagination>;
}

type CRUDTableComponent = (<TData extends RowData>(
  props: CRUDTableProps<TData>,
) => React.ReactNode) & {
  SelectedItemsActions: React.FC<SelectedItemsActionsProps>;
};

const getTableBody = <TData extends RowData>(table: Table<TData>) => {
  if (table.getRowModel().rows.length === 0) {
    return (
      <tr>
        <td colSpan={table.getVisibleLeafColumns().length} className="text-center py-5">
          <span className="text-muted">
            Không có dữ liệu
          </span>
        </td>
      </tr>
    )
  }

  return table.getRowModel().rows.map((row) => (
    <tr key={row.id}>
      {row.getVisibleCells().map((cell) => (
        <td
          className={clsx([
            cell.column.getIsLastColumn() || cell.column.getIsFirstColumn()
              ? "width-min"
              : "",
            "py-4 align-middle px-0",
            cell.column.getIsFirstColumn() ? "pe-7" : "",
          ])}
          key={cell.id}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  ));
};

function withPaginationDefaults(
  pagination: Partial<Pagination> | undefined,
): Pagination {
  if (!pagination) {
    return {
      pageIndex: 0,
      pageSize: 10,
      totalPages: 0,
    };
  }

  return {
    pageIndex: pagination.pageIndex ?? 0,
    pageSize: pagination.pageSize ?? 10,
    totalPages: pagination.totalPages ?? 0,
  };
}

const convertToRowSelection = (selectedItems: string[]): RowSelectionState => {
  return selectedItems.reduce((acc, item) => {
    acc[item] = true;
    return acc;
  }, {} as RowSelectionState);
};

const CRUDTable: CRUDTableComponent = ({
  data,
  columns,
  getRowId,
  onEdit,
  onDelete,
  onSelectedItemsChange,
  showEdit = true,
  showDelete = true,
  isLoading = false,
  pagination,
  onPageChange,
  selectedItems,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const intl = useIntl();
  const paginationWithDefaults = withPaginationDefaults(pagination);

  const columnHelper = useMemo(
    () => createColumnHelper<(typeof data)[number]>(),
    [],
  );

  const colDefs = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }: { table: Table<(typeof data)[number]> }) => (
          <div className="form-check form-check-custom form-check-solid">
            <input
              className="form-check-input"
              type="checkbox"
              checked={table.getIsAllRowsSelected()}
              onChange={table.getToggleAllRowsSelectedHandler()}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="form-check form-check-custom form-check-solid">
            <input
              className="form-check-input"
              type="checkbox"
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
              disabled={!row.getCanSelect()}
            />
          </div>
        ),
      },
      ...columns,
      columnHelper.display({
        id: "actions",
        header: intl.formatMessage({ id: "TABLE.ACTIONS" }),
        cell: (info) => (
          <div>
            {showEdit && (
              <button
                className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
                onClick={() => onEdit?.(info.row.original)}
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
                onClick={() => onDelete?.(info.row.original)}
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
    [columns, showEdit, showDelete, onEdit, onDelete, intl, columnHelper],
  );

  const table = useReactTable({
    data,
    columns: colDefs,
    state: {
      sorting,
      globalFilter,
      rowSelection: convertToRowSelection(selectedItems ?? []),
      pagination: {
        pageIndex: paginationWithDefaults.pageIndex,
        pageSize: paginationWithDefaults.pageSize,
      },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: (updaterOrValue: Updater<RowSelectionState>) => {
      const state =
        typeof updaterOrValue === "function"
          ? updaterOrValue(table.getState().rowSelection)
          : updaterOrValue;
      onSelectedItemsChange?.(Object.keys(state));
    },
    pageCount: paginationWithDefaults.totalPages,
    getRowId,
    manualPagination: true,
    enableRowSelection: true,
    onPaginationChange: (updaterOrValue: Updater<PaginationState>) => {
      const state =
        typeof updaterOrValue === "function"
          ? updaterOrValue(table.getState().pagination)
          : updaterOrValue;
      onPageChange?.(state.pageIndex);
    },
  });

  const renderPaginationControls = () => {
    return (
      <div className="d-flex justify-content-end align-items-center">
        <div className="d-flex align-items-center">
          <button
            className="btn btn-sm btn-light me-2"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </button>
          <button
            className="btn btn-sm btn-light me-2"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </button>
          <span className="btn btn-sm btn-light-primary me-2">
            {intl.formatMessage(
              { id: "TABLE.PAGE_INFO" },
              {
                page: table.getState().pagination.pageIndex + 1,
                total: table.getPageCount(),
              },
            )}
          </span>
          <button
            className="btn btn-sm btn-light me-2"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {">"}
          </button>
          <button
            className="btn btn-sm btn-light"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {">>"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="table-responsive" style={{ minHeight: 400 }}>
        <table className="table gy-7 gs-7">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className={clsx(
                  "fw-bold text-uppercase fs-7 border-bottom border-gray-200",
                  "text-muted",
                )}
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={clsx(
                      "user-select-none",
                      header.column.getCanSort() ? "cursor-pointer" : null,
                      "py-4 align-middle px-0",
                    )}
                  >
                    {header.isPlaceholder ? null : (
                      <span
                        className="position-relative"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getIsSorted() ? (
                          <div
                            className="position-absolute"
                            style={{ top: "-1px", right: "-19px" }}
                          >
                            {header.column.getIsSorted() === "asc" ? "↑" : "↓"}
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
            {isLoading && (
              <tr>
                <td
                  colSpan={table.getAllColumns().length}
                  className="text-center py-5"
                >
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
            )}
            {!isLoading && getTableBody(table)}
          </tbody>
        </table>
        {(pagination?.totalPages ?? 0) > 1 && renderPaginationControls()}
      </div>
    </div>
  );
};

CRUDTable.SelectedItemsActions = SelectedItemsActions;

export default CRUDTable;
