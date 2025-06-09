import React from 'react'
import { Modal } from 'react-bootstrap'

interface ErrorModalProps {
    show: boolean
    onHide: () => void
    title?: string
    message?: string
}

const ErrorModal: React.FC<ErrorModalProps> = ({
    show,
    onHide,
    title = 'Không có quyền truy cập',
    message = 'Bạn không có quyền thực hiện chức năng này. Vui lòng liên hệ quản trị viên để được hỗ trợ.'
}) => {
    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            className="error-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title className="text-danger">
                    <i className="ki-duotone ki-shield-cross fs-2 me-2">
                        <span className="path1"></span>
                        <span className="path2"></span>
                    </i>
                    {title}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="mb-0">{message}</p>
            </Modal.Body>
            <Modal.Footer>
                <button
                    type="button"
                    className="btn btn-light"
                    onClick={onHide}
                >
                    Đóng
                </button>
            </Modal.Footer>

            <style>
                {`
                .error-modal .modal-content {
                    border: none;
                    border-radius: 8px;
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
                }

                .error-modal .modal-header {
                    border-bottom: 1px solid #eff2f5;
                    padding: 1.5rem;
                }

                .error-modal .modal-title {
                    font-size: 1.25rem;
                    display: flex;
                    align-items: center;
                }

                .error-modal .modal-body {
                    padding: 1.5rem;
                    font-size: 1rem;
                }

                .error-modal .modal-footer {
                    border-top: 1px solid #eff2f5;
                    padding: 1rem 1.5rem;
                }

                .error-modal .btn-light {
                    background-color: #f5f8fa;
                    border-color: #f5f8fa;
                    color: #7e8299;
                }

                .error-modal .btn-light:hover {
                    background-color: #e4e6ef;
                    border-color: #e4e6ef;
                }
            `}</style>
        </Modal>
    )
}

export default ErrorModal
