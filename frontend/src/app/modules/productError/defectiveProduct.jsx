import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KTSVG } from '../../../_metronic/helpers'
import axios from 'axios'

const DefectiveProductPage = () => {
    const navigate = useNavigate()
    const [selectedDate, setSelectedDate] = useState('')
    const [selectedWarehouse, setSelectedWarehouse] = useState('')
    // const [selectedStatus, setSelectedStatus] = useState('')
    const [stockError, setStockError] = useState([])


    const handleNavigateToCreate = () => {
        navigate('/apps/declareProduct')
    }


    useEffect(() => {
        const fetchData = async () => {
            try {
                const errorResponse = await axios.get('http://localhost:9999/error/stockError')
                setStockError(errorResponse.data.data)
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

    const uniqueWarehouses = Array.from(
        new Set(stockError.map((error) => error.wareId.name))
    )

    const filterError = stockError.filter((error) => {
        const isMatchDate = !selectedDate || formatDateOnly(error.createdAt) === selectedDate
        const isMatchWarehouse = !selectedWarehouse || error.wareId.name === selectedWarehouse
        return isMatchDate && isMatchWarehouse
    })

    const handleSelected = (value) => {
        setSelectedWarehouse(value)
    }

    const handleReset = () => {
        setSelectedDate('')
        setSelectedWarehouse('')
    }



    return (
        <div className='d-flex flex-column gap-7'>
            <div className='px-9'>
                <div className='card'>
                    {/* Header */}
                    <div className='card-header border-0 pt-6'>
                        <div className='card-title'>
                            <h3 className='fw-bold m-0'>Danh sách sản phẩm hỏng, lỗi</h3>
                        </div>
                        <div className='card-toolbar'>
                            <div className='d-flex justify-content-end'>
                                <button
                                    type='button'
                                    className='btn btn-primary'
                                    onClick={handleNavigateToCreate}
                                >
                                    <i className='ki-duotone ki-plus fs-2'></i>
                                    Khai báo sản phẩm
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className='card-header border-0'>
                        <div className='d-flex align-items-center position-relative gap-5'>
                            <span className='fw-bold me-2'>Lọc theo:</span>

                            {/* Date Filter */}
                            <div className='d-flex align-items-center position-relative'>
                                <i className='ki-duotone ki-calendar fs-3 position-absolute ms-4'></i>
                                <input
                                    type='date'
                                    className='form-control form-control-solid w-200px ps-12'
                                    placeholder='dd/mm/yyyy'
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>

                            {/* Warehouse Filter */}
                            <div className='d-flex align-items-center position-relative'>
                                <i className='ki-duotone ki-home fs-3 position-absolute ms-4'></i>
                                <select
                                    className='form-select form-select-solid w-200px ps-12'
                                    value={selectedWarehouse || ''}
                                    onChange={(e) => handleSelected(e.target.value)}
                                >
                                    <option value=''>Tất cả kho</option>
                                    {
                                        uniqueWarehouses.map((error) => {
                                            return <option value={error}>{error}</option>
                                        })
                                    }
                                </select>
                            </div>

                            {/* Status Filter
                            <div className='d-flex align-items-center position-relative'>
                                <i className='ki-duotone ki-status fs-3 position-absolute ms-4'></i>
                                <select
                                    className='form-select form-select-solid w-200px ps-12'
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                >
                                    <option value=''>Tất cả trạng thái</option>
                                    <option value='PENDING'>Chờ duyệt</option>
                                    <option value='APPROVED'>Đã duyệt</option>
                                    <option value='REJECTED'>Từ chối</option>
                                </select>
                            </div> */}

                            {/* Reset Button */}
                            <button type='button' className='btn btn-light-primary' onClick={handleReset}>
                                <i className='ki-duotone ki-filter-remove fs-2'></i>
                                Đặt lại
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className='card-body py-4'>
                        <div className='table-responsive'>
                            <table className='table align-middle table-row-dashed fs-6 gy-5'>
                                <thead>
                                    <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                                        <th>STT</th>
                                        <th>Ngày khai báo</th>
                                        <th>Người tạo</th>
                                        <th>Kho</th>
                                        <th>Sản phẩm</th>
                                        <th>Số lượng</th>
                                        <th>Nguyên nhân</th>
                                    </tr>
                                </thead>
                                <tbody className='text-gray-600 fw-semibold'>
                                    {
                                        filterError.map((error, key) => {
                                            return <tr>
                                                <td>{key + 1}</td>
                                                <td>{formatDateOnly(error.declareDate)}</td>
                                                <td>{error.staffId.fullName}</td>
                                                <td>{error.wareId.name}</td>
                                                <td>{error.proId.name}</td>
                                                <td>{error.quantity}</td>
                                                <td>{error.reason}</td>
                                            </tr>
                                        })
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DefectiveProductPage
