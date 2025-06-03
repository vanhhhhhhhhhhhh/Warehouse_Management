import React from 'react'

interface DeleteModalProps {
  show: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  show,
  onClose,
  onConfirm,
  loading
}) => {
  if (!show) return null

  return (
    <>
      <div
        className='modal fade show d-block'
        tabIndex={-1}
        style={{
          backgroundColor: 'rgba(0,0,0,0.5)',
          transition: 'background-color 0.3s ease',
        }}
      >
        <div
          className='modal-dialog'
          style={{
            marginTop: '2rem',
            maxWidth: '600px',
            opacity: 1,
            transform: 'translateY(0)',
            transition: 'all 0.5s ease',
            animation: 'modal-fade-in 0.5s ease'
          }}
        >
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'>Xóa sản phẩm</h5>
              <button
                type='button'
                className='btn-close'
                onClick={onClose}
                disabled={loading}
              ></button>
            </div>
            <div className='modal-body'>
              <p>Bạn có chắc chắn muốn xóa những sản phẩm này? Thao tác này không thể khôi phục.</p>
            </div>
            <div className='modal-footer'>
              <button
                type='button'
                className='btn btn-light'
                onClick={onClose}
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type='button'
                className='btn btn-danger'
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className='spinner-border spinner-border-sm me-2' role='status' aria-hidden='true'></span>
                    Đang xóa...
                  </>
                ) : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Style cho animation */}
      <style>{`
        @keyframes modal-fade-in {
          from { opacity: 0; transform: translateY(-60px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}