import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KTSVG } from '../../../_metronic/helpers'
import axios from 'axios'

const StockInPage = () => {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [stockImports, setStockImports] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const imports = await axios.get('http://localhost:9999/import/history')
                setStockImports(imports.data.data)
            } catch (error) {
                console.log(error);
            }
        }
        fetchData()
    }, [])

    function formatDateOnly(isoString) {
        const date = new Date(isoString)

        const utc = date.getTime() + (date.getTimezoneOffset() * 60000)
        const vnTime = new Date(utc + 7 * 60 * 60000)

        const year = vnTime.getFullYear()
        const month = String(vnTime.getMonth() + 1).padStart(2, '0')
        const day = String(vnTime.getDate()).padStart(2, '0')

        return `${year}-${month}-${day}`
    }

    const filterImports = stockImports.filter((imp) => 
        imp.receiptCode.toLowerCase().includes(searchTerm.toLowerCase())
    )


    function countTotalProduct(items) {
        return items.reduce((total, item) => total + item.quantity, 0)
    }

    function calculateTotalValue(items) {
        return items.reduce((total, item) => total + item.unitPrice, 0)
    }




    return (
        <div className='d-flex flex-column gap-7'>
            <div className='px-9'>
                <div className='card'>
                    <div className='card-header border-0 pt-6 d-flex justify-content-between'>
                        <div className='card-title'>
                            <h3 className='fw-bold'>Danh sách phiếu nhập kho</h3>
                        </div>
                    </div>

                    {/* Header */}
                    <div className='card-header border-0 pt-6'>
                        <div className='card-title'>
                            <div className='d-flex align-items-center position-relative my-1'>
                                <KTSVG
                                    path='/media/icons/duotune/general/gen021.svg'
                                    className='svg-icon-1 position-absolute ms-6'
                                />
                                <input
                                    type='text'
                                    className='form-control form-control-solid w-300px ps-14'
                                    placeholder='Tìm kiếm theo Mã phiếu'
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className='card-toolbar'>
                            <div className='d-flex justify-content-end gap-2'>
                                <button
                                    type='button'
                                    className='btn btn-primary'
                                    onClick={() => navigate('/apps/stockIn/create')}
                                >
                                    <i className='ki-duotone ki-plus fs-2'></i>
                                    Thêm phiếu nhập
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className='card-body py-4'>
                        <table className='table align-middle table-row-dashed fs-6 gy-5'>
                            <thead>
                                <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                                    <th className='min-w-100px text-black'>Thời gian nhập</th>
                                    <th className='min-w-100px text-black'>Mã phiếu</th>
                                    <th className='min-w-150px text-black'>Kho nhập</th>
                                    <th className='min-w-100px text-black'>Người tạo</th>
                                    <th className='min-w-100px text-black'>Số lượng SP</th>
                                    <th className='min-w-100px text-black'>Tổng giá trị</th>
                                    <th className='min-w-100px text-black'>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className='text-gray-600 fw-semibold'>
                                {
                                    filterImports.map((imports) => {
                                        return <tr>
                                            <td>{formatDateOnly(imports.importDate)}</td>
                                            <td>{imports.receiptCode}</td>
                                            <td>{imports.wareId.name}</td>
                                            <td>{imports.adminId.fullName}</td>
                                            <td>{countTotalProduct(imports.items)}</td>
                                            <td>{calculateTotalValue(imports.items)}</td>
                                            <td>
                                                <button
                                                onClick={() => navigate(`/apps/stockIn/print/${imports._id}`)}
                                                    className='btn btn-icon btn-bg-light btn-active-color-success btn-sm ms-5'>
                                                    <i className='fas fa-print'></i>
                                                </button>
                                            </td>
                                        </tr>
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StockInPage
