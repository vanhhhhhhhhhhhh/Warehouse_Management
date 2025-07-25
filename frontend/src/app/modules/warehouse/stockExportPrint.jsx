import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StockExportPrint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        console.log('Fetching receipt with ID:', id); // Debug log
        const res = await axios.get(`http://localhost:9999/export/receipt/${id}`);
        console.log('Receipt data:', res.data); // Debug log
        setReceipt(res.data.data);
        setError(null);
      } catch (error) {
        console.error('Lỗi khi lấy phiếu xuất:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReceipt();
    } else {
      setLoading(false);
      setError('Không có ID phiếu xuất');
    }
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Đang tải phiếu xuất...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <div>Có lỗi xảy ra: {error}</div>
        <button onClick={() => window.history.back()}>Quay lại</button>
      </div>
    );
  }

  // No receipt found
  if (!receipt) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Không tìm thấy phiếu xuất</div>
        <button onClick={() => window.history.back()}>Quay lại</button>
      </div>
    );
  }

  // Destructure with fallbacks
  const {
    receiptCode = 'N/A',
    receiptName = 'N/A',
    wareId = {},
    adminId = {},
    exportDate = new Date(),
    items = [],
  } = receipt;

  const formatDate = (iso) => {
    try {
      const date = new Date(iso);
      return date.toLocaleDateString('vi-VN');
    } catch (error) {
      return 'N/A';
    }
  };

  const totalAmount = items.reduce((sum, item) => {
    // const quantity = Number(item.quantity) || 0
    const unitPrice = Number(item.unitPrice) || Number(item.proId?.price) || 0;
    return sum + unitPrice;
  }, 0);

  return (
    <>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }

            #print-area, #print-area * {
              visibility: visible;
            }

            #print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 40px;
              background: white;
            }

            .print-btn {
              display: none !important;
            }
          }
        `}
      </style>

      <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
        <div
          className="print-btn"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ddd',
              border: '1px solid #bbb',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ← Quay lại
          </button>
          <button
            onClick={() => window.print()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2E8B57',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            🖨️ In phiếu
          </button>
        </div>

        <div id="print-area">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>PHIẾU XUẤT KHO</h2>
          </div>

          <hr style={{ margin: '20px 0' }} />

          <div style={{ lineHeight: '1.8', fontSize: '16px' }}>
            <p>
              <strong>Mã phiếu:</strong> {receiptCode}
            </p>
            <p>
              <strong>Tên phiếu:</strong> {receiptName}
            </p>
            <p>
              <strong>Ngày xuất:</strong> {formatDate(exportDate)}
            </p>
            <p>
              <strong>Kho xuất:</strong> {wareId?.name || 'N/A'}
            </p>
            <p>
              <strong>Người lập phiếu:</strong> {adminId?.fullName || 'N/A'}
            </p>
          </div>

          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: '30px',
              fontSize: '15px',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={thStyle}>STT</th>
                <th style={thStyle}>Tên sản phẩm</th>
                <th style={thStyle}>Số lượng</th>
                <th style={thStyle}>Đơn giá (VNĐ)</th>
                <th style={thStyle}>Thành tiền (VNĐ)</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, index) => {
                  const quantity = Number(item.quantity) || 0;

                  return (
                    <tr key={item.proId?._id || index}>
                      <td style={tdStyle}>{index + 1}</td>
                      <td style={tdStyle}>{item.proId?.name || 'N/A'}</td>
                      <td style={tdStyle}>{quantity}</td>
                      <td style={tdStyle}>{item.proId?.price.toLocaleString()}</td>
                      <td style={tdStyle}>{totalAmount.toLocaleString()}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" style={{ ...tdStyle, textAlign: 'center', fontStyle: 'italic' }}>
                    Không có sản phẩm nào
                  </td>
                </tr>
              )}

              {items.length > 0 && (
                <tr style={{ backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>
                  <td colSpan="4" style={{ ...tdStyle, textAlign: 'right' }}>
                    Tổng cộng:
                  </td>
                  <td style={tdStyle}>{totalAmount.toLocaleString()} VNĐ</td>
                </tr>
              )}
            </tbody>
          </table>

          <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <strong>Người lập phiếu</strong>
              <br />
              <br />
              <em>(Ký và ghi rõ họ tên)</em>
            </div>
            <div>
              <strong>Thủ kho</strong>
              <br />
              <br />
              <em>(Ký và ghi rõ họ tên)</em>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const thStyle = {
  border: '1px solid #ccc',
  padding: '12px 16px',
  textAlign: 'center',
};

const tdStyle = {
  border: '1px solid #ddd',
  padding: '10px 14px',
  textAlign: 'center',
};

export default StockExportPrint;
