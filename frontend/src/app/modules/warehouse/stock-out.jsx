import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KTSVG } from '../../../_metronic/helpers';
import axios from 'axios';

const StockOutPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [stockExports, setStockExports] = useState([]);
  const unitPrice = 500000;
  const quantity = 3;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:9999/export/history', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Export data:', res.data.data); // Debug log
        setStockExports(res.data.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  function formatDateOnly(isoString) {
    const date = new Date(isoString);
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const vnTime = new Date(utc + 7 * 60 * 60000);

    const year = vnTime.getFullYear();
    const month = String(vnTime.getMonth() + 1).padStart(2, '0');
    const day = String(vnTime.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  const filterExports = stockExports.filter((exp) => exp.receiptCode.toLowerCase().includes(searchTerm.toLowerCase()));

  function countTotalProduct(items) {
    return items.reduce((total, item) => total + item.quantity, 0);
  }

  function calculateTotalValue(exp) {
    if (!exp || !exp.items || exp.items.length === 0) return 0;

    return exp.items.reduce((total, item) => {
      // const quantity = item.quantity || 0;
      const unitPrice = item.unitPrice || 0;
      return total + unitPrice;
    }, 0);
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value);
  }

  return (
    <div className="d-flex flex-column gap-7">
      <div className="px-9">
        <div className="card">
          <div className="card-header border-0 pt-6 d-flex justify-content-between">
            <div className="card-title">
              <h3 className="fw-bold">Danh sách phiếu xuất kho</h3>
            </div>
          </div>

          {/* Header */}
          <div className="card-header border-0 pt-6">
            <div className="card-title">
              <div className="d-flex align-items-center position-relative my-1">
                <KTSVG path="/media/icons/duotune/general/gen021.svg" className="svg-icon-1 position-absolute ms-6" />
                <input
                  type="text"
                  className="form-control form-control-solid w-300px ps-14"
                  placeholder="Tìm kiếm theo Mã phiếu"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="card-toolbar">
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-primary" onClick={() => navigate('/apps/stockOut/create')}>
                  <i className="ki-duotone ki-plus fs-2"></i>
                  Thêm phiếu xuất
                </button>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="card-body py-4">
            <table className="table align-middle table-row-dashed fs-6 gy-5">
              <thead>
                <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                  <th className="min-w-100px text-black">Thời gian xuất</th>
                  <th className="min-w-100px text-black">Mã phiếu</th>
                  <th className="min-w-150px text-black">Kho xuất</th>
                  <th className="min-w-100px text-black">Số lượng SP</th>
                  <th className="min-w-100px text-black">Tổng giá trị</th>
                  <th className="min-w-100px text-black">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 fw-semibold">
                {filterExports.map((exp) => (
                  <tr key={exp._id}>
                    <td>{formatDateOnly(exp.exportDate)}</td>
                    <td>{exp.receiptCode}</td>
                    <td>{exp.wareId?.name}</td>
                    <td>{countTotalProduct(exp.items)}</td>
                    <td>{formatCurrency(calculateTotalValue(exp))}</td>
                    <td>
                      <button
                        onClick={() => navigate(`/apps/stockOut/print/${exp._id}`)}
                        className="btn btn-icon btn-bg-light btn-active-color-success btn-sm ms-5"
                      >
                        <i className="fas fa-print"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockOutPage;
