import React, { useState, useMemo } from "react";
import {
  createColumnHelper,
  CellContext,
  ColumnDef,
} from "@tanstack/react-table";
import CRUDTable from "../../reusableWidgets/CRUDTable";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  activateProducts,
  deactivateProducts,
  getProducts,
} from "../../apiClient/products";
import { ProductListing } from "../../apiClient/api";
import Swal from "sweetalert2";
import ProperBadge from "../../reusableWidgets/ProperBadge";
import { ProductToolbar, ImportModal } from "./components";
import { StatusFilterValue, useStatusFilter } from "../../reusableWidgets/useStatusFilter";
import { exportFile, importFile } from "../../apiClient/excel";
import { format } from "path";
import { FileParsingOptions } from "./components/ImportModal";
import { hasPermission } from "../auth/components/PermissionGuard";

const columnHelper = createColumnHelper<ProductListing>();

const columns: ColumnDef<ProductListing, any>[] = [
  columnHelper.accessor("code", {
    header: "Mã sản phẩm",
    cell: (info: CellContext<ProductListing, string>) => info.getValue(),
  }),
  columnHelper.accessor("name", {
    header: "Tên sản phẩm",
    cell: (info: CellContext<ProductListing, string>) => info.getValue(),
  }),
  columnHelper.accessor("category", {
    header: "Danh mục",
    cell: (info: CellContext<ProductListing, string>) => info.getValue(),
  }),
  columnHelper.accessor("price", {
    header: "Giá",
    cell: (info: CellContext<ProductListing, number>) => formatter.format(info.getValue()),
  }),
  columnHelper.accessor("isDelete", {
    header: "Trạng thái",
    cell: (info: CellContext<ProductListing, boolean>) => {
      return (
        <ProperBadge variant={info.getValue() ? "danger" : "success"}>
          {info.getValue() ? "Ngừng hoạt động" : "Hoạt động"}
        </ProperBadge>
      );
    },
  }),
];

const formatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND'
})

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const ProductsPage: React.FC = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [status, setStatus] = useState<StatusFilterValue>('active');
  const [hasCreatePermission, hasUpdatePermission] = hasPermission([
    { module: 'PRODUCTS', action: 'CREATE' },
    { module: 'PRODUCTS', action: 'UPDATE' }
  ]);

  const queryClient = useQueryClient();
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", pageIndex, searchTerm, status],
    queryFn: () =>
      getProducts({
        pagination: {
          page: pageIndex + 1,
          limit: 5,
        },
        search: {
          name: searchTerm,
          status
        },
      }),
    keepPreviousData: true,
  });

  const { mutateAsync: deactivateProductMutation } = useMutation({
    mutationFn: (selectedItems: string[]) => deactivateProducts(selectedItems),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Hủy kích hoạt sản phẩm thành công",
        showConfirmButton: false,
        timer: 1500,
      });
      setSelectedItems([]);
    },
    onError: (error: Error) => {
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: error.message,
      });
    },
  });

  const { mutateAsync: activateProductMutation } = useMutation({
    mutationFn: (selectedItems: string[]) => activateProducts(selectedItems),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Kích hoạt sản phẩm thành công",
        showConfirmButton: false,
        timer: 1500,
      });
      setSelectedItems([]);
    },
    onError: (error: Error) => {
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: error.message,
      });
    },
  });

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const navigate = useNavigate();

  const actions = useMemo(
    () => [
      {
        key: "deactivate",
        label: "Hủy kích hoạt",
        onExecute: () => deactivateProductMutation(selectedItems),
      },
      {
        key: "activate",
        label: "Kích hoạt",
        onExecute: () => activateProductMutation(selectedItems),
      }
    ],
    [selectedItems, deactivateProductMutation, activateProductMutation],
  );

  if (!products || isLoading) {
    return (
      <span
        className="spinner-border spinner-border-sm"
        role="status"
        aria-hidden="true"
      ></span>
    );
  }

  return (
    <>
      <ImportModal
        onClose={() => setShowImportModal(false)}
        show={showImportModal}
        onUploadFile={async (file: File, options: FileParsingOptions) => {
          try {
            const response = await importFile({
              file,
              options
            })

            if (response.failedCount > 0) {
              const formatErrors = response.formatErrors.join('<br><br>');
              const importErrors = response.importErrors.join('<br><br>');

              let warningText = `Đã nhập ${response.successCount} sản phẩm thành công.`;
              if (formatErrors.length > 0) {
                warningText += `<br><br>Lỗi định dạng:<br>${formatErrors}`;
              }

              if (importErrors.length > 0) {
                warningText += `<br><br>Lỗi nhập dữ liệu:<br>${importErrors}`;
              }

              Swal.fire({
                icon: "warning",
                title: "Có lỗi trong quá trình nhập dữ liệu",
                html: warningText,
              });
            } else {
              Swal.fire({
                icon: "success",
                title: "Thành công!",
                text: "Nhập dữ liệu thành công",
                showConfirmButton: false,
                timer: 1500,
              });
            }

            queryClient.invalidateQueries({ queryKey: ["products"] });
          } catch (error: any) {
            Swal.fire({
              icon: "error",
              title: "Lỗi!",
              text: error.message,
            });
          }

          setShowImportModal(false);
        }}
      />

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
              onStatusChange={setStatus}
              showImport={hasCreatePermission}
              showAddProduct={hasCreatePermission}
              onExportFile={async () => {
                try {
                  await exportFile();
                } catch (error) {
                  console.error("Error exporting file:", error);
                  Swal
                    .fire({
                      icon: "error",
                      title: "Lỗi!",
                      text: "Không thể xuất file. Vui lòng thử lại sau.",
                    });
                }
              }}
              onShowImportModal={() => setShowImportModal(true)}
              onAddProduct={() => navigate("/apps/products/create")}
            />

            <div className="card-body py-4">
              <CRUDTable.SelectedItemsActions
                selectedCount={selectedItems.length}
                selectionMessage={(count) => `${count} sản phẩm đã chọn`}
                actions={actions}
              />

              <CRUDTable
                data={products.data}
                getRowId={(row) => row._id}
                isLoading={isLoading}
                columns={columns}
                selectedItems={selectedItems}
                onSelectedItemsChange={setSelectedItems}
                readOnly={!hasUpdatePermission}
                pagination={{
                  pageIndex,
                  totalPages: products.totalPages,
                  pageSize: 5,
                }}
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
