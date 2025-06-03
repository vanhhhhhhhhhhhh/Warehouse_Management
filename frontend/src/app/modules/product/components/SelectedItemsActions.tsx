import React, { ChangeEvent } from 'react'
import { KTSVG } from '../../../../_metronic/helpers'

interface SelectedItemsActionsProps {
  selectedItems: string[]
  selectedMessage: string
  selectedAction: string
  onActionChange: (action: string) => void
  onExecuteAction: () => void
}

export const SelectedItemsActions: React.FC<SelectedItemsActionsProps> = ({
  selectedItems,
  selectedMessage,
  selectedAction,
  onActionChange,
  onExecuteAction
}) => {
  if (selectedItems.length === 0) return null

  return (
    <div className='d-flex align-items-center mb-5'>
      <div className='d-flex align-items-center'>
        <KTSVG
          path='/media/icons/duotune/general/gen043.svg'
          className='svg-icon-2 me-2 text-primary'
        />
        <span className='text-gray-600'>{selectedMessage}</span>
      </div>
      <div className='d-flex align-items-center ms-3'>
        <select
          className='form-select form-select-sm w-180px'
          value={selectedAction}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onActionChange(e.target.value)}
        >
          <option value="">-- Chọn thao tác --</option>
          <option value="delete">Xóa các mục đã chọn</option>
        </select>
        <button
          className='btn btn-sm btn-primary ms-3 w-150px'
          onClick={onExecuteAction}
          disabled={!selectedAction}
        >
          Thực hiện
        </button>
      </div>
    </div>
  )
}