import { useState, useEffect } from 'react';
import { Content } from '../../../_metronic/layout/components/content';
import { API_URL } from '../../config/api.config';
import { KTSVG } from '../../../_metronic/helpers';
import Swal from 'sweetalert2';
import client from '../../apiClient/client';

const StockOverview = () => {
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inventoryData, setInventoryData] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState({
    totalImport: 0,
    totalExport: 0,
    totalError: 0,
    totalStock: 0,
    totalValue: 0,
  });

  // Lấy thông tin user từ localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // Fetch danh sách kho
  const fetchWarehouses = async () => {
    try {
      if (!user?.id) {
        console.error('No user ID found');
        return;
      }

      setLoading(true);
      const response = await client.get(API_URL.WAREHOUSE.LIST, {
        params: {
          roleName: user.roleName,
          ...(user.roleName === 'Admin' ? { adminId: user.id } : { staffId: user.id }),
        },
      });

      console.log('Warehouse response:', response.data);
      if (response.data.success) {
        setWarehouses(response.data.data);
      } else {
        throw new Error(response.data.message || 'Không thể tải danh sách kho');
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: error.message || 'Lỗi khi tải danh sách kho',
        confirmButtonText: 'OK',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch danh sách danh mục
  const fetchCategories = async () => {
    try {
      if (!user?.id) {
        console.error('No user ID found');
        return;
      }

      setLoading(true);
      const response = await client.get(API_URL.CATEGORIES.LIST, {
        params: {
          page: 1,
          limit: 100,
          name: searchTerm || '',
          status: 'active',
        },
      });

      console.log('Category response:', response);
      if (response.data && Array.isArray(response.data.data)) {
        setCategories(response.data.data);
      } else {
        console.error('Invalid categories data format:', response.data);
        throw new Error('Dữ liệu danh mục không hợp lệ');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      let errorMessage = 'Lỗi khi tải danh sách danh mục';
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: errorMessage,
        confirmButtonText: 'OK',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch danh sách sản phẩm
  const fetchProducts = async () => {
    try {
      if (!user?.id) {
        console.error('No user ID found');
        return;
      }

      setLoading(true);
      const response = await client.get(API_URL.PRODUCTS.LIST, {
        params: {
          page: 1,
          limit: 100,
          name: searchTerm || '',
          status: 'active',
        },
      });

      if (response.data && Array.isArray(response.data.data)) {
        setProducts(response.data.data);
      } else {
        console.error('Invalid products data format:', response.data);
        throw new Error('Dữ liệu sản phẩm không hợp lệ');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      let errorMessage = 'Lỗi khi tải danh sách sản phẩm';
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: errorMessage,
        confirmButtonText: 'OK',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    if (user) {
      console.log('Fetching initial data...');
      fetchWarehouses();
      fetchCategories();
      fetchProducts();
    }
  }, []);

  // Fetch inventory data
  const fetchInventoryData = async () => {
    try {
      if (!user?.id) {
        console.error('No user ID found');
        return;
      }

      setLoading(true);
      setError(null);

      const params = {
        warehouseId: selectedWarehouse || undefined,
        categoryId: selectedCategory || undefined,
      };

      console.log('Inventory params:', params);
      const response = await client.get(API_URL.WAREHOUSE.STOCK.INVENTORY, {
        params,
      });

      console.log('Inventory response:', response.data);
      if (response.data.success) {
        setInventoryData(response.data.data);
        setSummary(response.data.summary);
      } else {
        throw new Error(response.data.message || 'Không thể tải dữ liệu tồn kho');
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError(error.message || 'Lỗi khi tải dữ liệu tồn kho');
    } finally {
      setLoading(false);
    }
  };

  // Fetch inventory data when filters change
  useEffect(() => {
    if (user) {
      fetchInventoryData();
    }
  }, [selectedWarehouse, selectedCategory]);

  // Tính toán summary cho dữ liệu đã lọc
  const calculateFilteredSummary = (filteredData) => {
    const newSummary = {
      totalImport: 0,
      totalExport: 0,
      totalError: 0,
      totalStock: 0,
      totalValue: 0,
    };

    filteredData.forEach((item) => {
      newSummary.totalImport += item.totalImport || 0;
      newSummary.totalExport += item.totalExport || 0;
      newSummary.totalError += item.totalError || 0;
      newSummary.totalStock += item.currentStock || 0;
      newSummary.totalValue += item.currentStock * item.price || 0;
    });

    return newSummary;
  };

  // Filter data
  const filteredData = inventoryData.filter((item) => {
    const searchMatch = searchTerm
      ? item.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productName.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    return searchMatch;
  });

  // Cập nhật summary khi dữ liệu được lọc
  useEffect(() => {
    const newSummary = calculateFilteredSummary(filteredData);
    setSummary(newSummary);
  }, [filteredData]);

  // Reset filters
  const handleReset = () => {
    setSelectedWarehouse('');
    setSelectedCategory('');
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-h-400px">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <div className="d-flex flex-column">
          <h4 className="mb-1 text-dark">Error</h4>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <Content>
      <div className="card">
        {/* Header Section */}
        <div className="card-header border-0" style={{ marginBottom: '-10px' }}>
          <div className="card-title">
            <h3 className="fw-bold m-0">Tồn kho</h3>
          </div>
        </div>
        <div className="card-header border-0">
          <div className="card-title">
            <div className="d-flex align-items-center position-relative my-1">
              <KTSVG path="/media/icons/duotune/general/gen021.svg" className="svg-icon-1 position-absolute ms-6" />
              <input
                type="text"
                className="form-control form-control-solid w-250px ps-14"
                placeholder="Tìm kiếm sản phẩm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="card-toolbar">
            <div className="d-flex align-items-center gap-2">
              {/* Filter Kho */}
              <div className="w-200px">
                <select
                  className="form-select form-select-solid"
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                >
                  <option value="">Tất cả kho</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse._id} value={warehouse._id}>
                      {warehouse.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Danh mục */}
              <div className="w-200px">
                <select
                  className="form-select form-select-solid"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Filters Button */}
              <button type="button" className="btn btn-light-primary" onClick={handleReset}>
                <i className="ki-duotone ki-filter-remove fs-2">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                Đặt lại
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="card-body py-4">
          <div className="row g-6 g-xl-9 mb-8">
            <div className="col-md-6 col-lg-3">
              <div className="card h-100">
                <div className="card-body d-flex flex-column p-9">
                  <div className="fs-2hx fw-bold text-primary mb-2">{summary.totalImport.toLocaleString('vi-VN')}</div>
                  <div className="fs-4 fw-semibold text-gray-400">Tổng số nhập</div>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card h-100">
                <div className="card-body d-flex flex-column p-9">
                  <div className="fs-2hx fw-bold text-success mb-2">{summary.totalExport.toLocaleString('vi-VN')}</div>
                  <div className="fs-4 fw-semibold text-gray-400">Tổng số xuất</div>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card h-100">
                <div className="card-body d-flex flex-column p-9">
                  <div className="fs-2hx fw-bold text-danger mb-2">{summary.totalError.toLocaleString('vi-VN')}</div>
                  <div className="fs-4 fw-semibold text-gray-400">Tổng số hỏng</div>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card h-100">
                <div className="card-body d-flex flex-column p-9">
                  <div className="fs-2hx fw-bold text-dark mb-2">{summary.totalStock.toLocaleString('vi-VN')}</div>
                  <div className="fs-4 fw-semibold text-gray-400">Tổng số tồn kho</div>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table align-middle table-row-dashed fs-6 gy-5">
              <thead>
                <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                  <th>Mã sản phẩm</th>
                  <th>Tên sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Kho</th>
                  <th>Số lượng tồn</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 fw-semibold">
                {filteredData.map((item) => (
                  <tr key={`${item.productId}-${item.warehouseId}`}>
                    <td>{item.productCode}</td>
                    <td>{item.productName}</td>
                    <td>{item.category}</td>
                    <td>{item.warehouseName}</td>
                    <td>{item.currentStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Content>
  );
};

export default StockOverview;
