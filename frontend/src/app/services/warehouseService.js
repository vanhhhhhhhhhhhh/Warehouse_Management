import axios from 'axios'

const API_URL = 'http://localhost:9999'

// Lấy danh sách kho
export const getWarehouses = async () => {
    try {
        const userStr = localStorage.getItem('user')
        const user = userStr ? JSON.parse(userStr) : null
        const adminId = user?.id

        const response = await axios.get(`${API_URL}/warehouses${adminId ? `?adminId=${adminId}` : ''}`)
        return response.data
    } catch (error) {
        throw error.response?.data || error.message
    }
}

// Tìm kiếm kho
export const searchWarehouses = async (keyword) => {
    try {
        const userStr = localStorage.getItem('user')
        const user = userStr ? JSON.parse(userStr) : null
        const adminId = user?.id

        const response = await axios.get(`${API_URL}/warehouses/search?keyword=${keyword}${adminId ? `&adminId=${adminId}` : ''}`)
        return response.data
    } catch (error) {
        throw error.response?.data || error.message
    }
}

// Lấy thông tin một kho
export const getWarehouse = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/warehouses/${id}`)
        return response.data
    } catch (error) {
        throw error.response?.data || error.message
    }
}

// Tạo kho mới
export const createWarehouse = async (warehouseData) => {
    try {
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')
        const user = userStr ? JSON.parse(userStr) : null
        const adminId = user?.id

        if (!adminId) {
            throw new Error('Không tìm thấy ID người quản lý')
        }
        
        const response = await axios.post(`${API_URL}/warehouses`, 
            { ...warehouseData, adminId },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                withCredentials: true
            }
        )
        return response.data
    } catch (error) {
        throw error.response?.data || error.message
    }
}

// Cập nhật thông tin kho
export const updateWarehouse = async (id, warehouseData) => {
    try {
        const response = await axios.put(`${API_URL}/warehouses/${id}`, warehouseData)
        return response.data
    } catch (error) {
        throw error.response?.data || error.message
    }
}

// Xóa kho
export const deleteWarehouse = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/warehouses/${id}`)
        return response.data
    } catch (error) {
        throw error.response?.data || error.message
    }
}

// Xóa nhiều kho
export const deleteManyWarehouses = async (ids) => {
    try {
        const response = await axios.delete(`${API_URL}/warehouses`, { data: { ids } })
        return response.data
    } catch (error) {
        throw error.response?.data || error.message
    }
}

// Lấy danh sách nhân viên quản lý kho
export const getAllStaff = async (token) => {
    try {
        const response = await axios.get('http://localhost:9999/users', {
            headers: {
                Authorization: `Bearer ${token}`
            },
            withCredentials: true
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error.message
    }
}
