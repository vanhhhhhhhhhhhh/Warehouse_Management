import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

const StockImportPrint = () => {
  const { id } = useParams()
  const [receipt, setReceipt] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const res = await axios.get(`http://localhost:9999/import/receipt/${id}`)
        setReceipt(res.data.data)
      } catch (error) {
        console.error('Lỗi khi lấy phiếu nhập:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReceipt()
  }, [id])

  if (loading) return <div style={{ padding: '20px' }}>Đang tải phiếu nhập...</div>
  if (!receipt) return <div style={{ padding: '20px' }}>Không tìm thấy phiếu nhập</div>

  const { receiptCode, receiptName, wareId, adminId, createdAt, items } = receipt

  const formatDate = (iso) => {
    const date = new Date(iso)
    return date.toLocaleDateString('vi-VN')
  }

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice, 0)

  return (
    <>
      {/* CSS ẩn các thành phần khác khi in */}
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
        <div className='print-btn' style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <button
            onClick={() => window.print()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2E8B57',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🖨️ In phiếu
          </button>
        </div>

        <div id="print-area">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>PHIẾU NHẬP KHO</h2>
          </div>

          <hr style={{ margin: '20px 0' }} />

          <div style={{ lineHeight: '1.8', fontSize: '16px' }}>
            <p><strong>Mã phiếu:</strong> {receiptCode}</p>
            <p><strong>Tên phiếu:</strong> {receiptName}</p>
            <p><strong>Ngày lập:</strong> {formatDate(createdAt)}</p>
            <p><strong>Kho nhập:</strong> {wareId?.name}</p>
            <p><strong>Người lập phiếu:</strong> {adminId?.fullName}</p>
          </div>

          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: '30px',
              fontSize: '15px'
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
              {items.map((item, index) => (
                <tr key={item.proId._id}>
                  <td style={tdStyle}>{index + 1}</td>
                  <td style={tdStyle}>{item.proId.name}</td>
                  <td style={tdStyle}>{item.quantity}</td>
                  <td style={tdStyle}>{item.unitPrice.toLocaleString()}</td>
                  <td style={tdStyle}>
                    {(item.unitPrice * item.quantity).toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr style={{ backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>
                <td colSpan="4" style={{ ...tdStyle, textAlign: 'right' }}>
                  Tổng cộng:
                </td>
                <td style={tdStyle}>{totalAmount.toLocaleString()} VNĐ</td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <strong>Người lập phiếu</strong>
              <br /><br />
              <em>(Ký và ghi rõ họ tên)</em>
            </div>
            <div>
              <strong>Thủ kho</strong>
              <br /><br />
              <em>(Ký và ghi rõ họ tên)</em>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

const thStyle = {
  border: '1px solid #ccc',
  padding: '12px 16px',
  textAlign: 'center'
}

const tdStyle = {
  border: '1px solid #ddd',
  padding: '10px 14px',
  textAlign: 'center'
}

export default StockImportPrint
