import { useSelect } from 'downshift'
import React, { useEffect } from 'react'

interface PickerProps<T> {
  items: T[]
  placeholder: string
  itemToString: (item: T | null) => string
  itemToKey: (item: T | null) => string
  isLoading?: boolean
  onSearchChange?: (searchTerm: string) => void
  searchTerm?: string
  onPageChange?: (page: number) => void
  page?: number
  totalPages?: number
  onSelectedItemChange?: (item: T | null) => void
  selectedItem?: T
}

const Picker = <T,>({
  items,
  placeholder = '',
  itemToString,
  itemToKey,
  isLoading = false,
  onSearchChange,
  searchTerm = '',
  onPageChange,
  page = 1,
  totalPages = 1,
  onSelectedItemChange,
  selectedItem,
}: PickerProps<T>) => {
  const props = useSelect<T>({
    items,
    itemToString,
    itemToKey,
    onSelectedItemChange: ({ selectedItem }) => {
      onSelectedItemChange?.(selectedItem)
    }
  });

  useEffect(() => {
    props.selectItem(selectedItem || null)
  }, [selectedItem])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchChange?.(value);
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      onPageChange?.(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      onPageChange?.(page + 1);
    }
  };

  const renderItems = () => {
    return (
      <div
        {...props.getMenuProps()}
        style={{
          minHeight: 300,
        }}
        className="position-absolute d-flex flex-column top-100 w-100 start-0 dropdown-menu mt-2"
      >
        {props.isOpen && (
          <>
            {onSearchChange && (
              <div className="px-3 py-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            <ul className="list-unstyled mb-0 flex-grow-1">
              {items.map((item, index) => (
                <li key={itemToKey(item)} {...props.getItemProps({ item, index })} className="dropdown-item cursor-pointer">
                  {itemToString(item)}
                </li>
              ))}
            </ul>

            {onPageChange && totalPages > 1 && (
              <div className="px-3 pt-2 border-top d-flex justify-content-between align-items-center">
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className={`btn px-2 btn-sm ${page <= 1 ? 'btn-outline' : 'btn-primary'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (page > 1) {
                        handlePreviousPage();
                      }
                    }}
                  >
                    <i className="bi ms-1 mb-1 bi-chevron-left"></i>
                  </button>
                  <button
                    type="button"
                    className={`btn px-2 btn-sm ${page >= totalPages ? 'btn-outline' : 'btn-primary'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (page < totalPages) {
                        handleNextPage();
                      }
                    }}
                  >
                    <i className="bi ms-1 mb-1 bi-chevron-right"></i>
                  </button>
                  {isLoading && (
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Đang tải...</span>
                    </div>
                  )}
                </div>
                <span className="small text-muted">
                  Trang {page} / {totalPages}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="position-relative">
      <div className="form-select user-select-none cursor-pointer" {...props.getToggleButtonProps()}>
        <span>{props.selectedItem ? itemToString(props.selectedItem) : placeholder}</span>
      </div>
      {props.isOpen && renderItems()}
    </div>
  );
};

export default Picker