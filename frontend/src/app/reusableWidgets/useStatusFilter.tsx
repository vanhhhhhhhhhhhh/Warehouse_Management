import { useEffect, useState } from 'react';

export type StatusFilterValue = 'active' | 'inactive';

export const useStatusFilter = () => {
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('active');

  const statusFilterElement = (
    <select
      className="form-select form-select-solid"
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value as StatusFilterValue)}
    >
      <option value={'active'}>Đang hoạt động</option>
      <option value={'inactive'}>Ngừng hoạt động</option>
    </select>
  );

  return {
    statusFilterElement,
    statusFilter
  }
}
