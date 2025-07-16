const Warehouse = require('../model/Warehouse')
const mongoose = require('mongoose')

// Lấy danh sách kho
const getWarehouses = async (req, res) => {
    try {
        const warehouses = await Warehouse.find({ isDelete: false })
            .populate('adminId', 'name email')
            .populate('staffId', 'name email')
            .sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            data: warehouses
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách kho',
            error: error.message
        })
    }
}

// Lấy thông tin một kho
const getWarehouse = async (req, res) => {
    try {
        const warehouse = await Warehouse.findOne({
            _id: req.params.id,
            isDelete: false
        })
        .populate('adminId', 'name email')
        .populate('staffId', 'name email')

        if (!warehouse) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy kho'
            })
        }

        res.status(200).json({
            success: true,
            data: warehouse
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin kho',
            error: error.message
        })
    }
}

// Tạo kho mới
const createWarehouse = async (req, res) => {
    try {
        const { name, address, phone, adminId, staffId } = req.body

        if (!adminId) {
            return res.status(400).json({
                success: false,
                message: 'Không tìm thấy ID người quản lý'
            })
        }

        // Kiểm tra kho đã tồn tại
        const existingWarehouse = await Warehouse.findOne({ 
            name,
            isDelete: false 
        })

        if (existingWarehouse) {
            return res.status(400).json({
                success: false,
                message: 'Tên kho đã tồn tại'
            })
        }

        const warehouse = new Warehouse({
            name,
            address,
            phone,
            adminId,
            staffId
        })

        await warehouse.save()

        res.status(201).json({
            success: true,
            message: 'Tạo kho thành công',
            data: warehouse
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo kho',
            error: error.message
        })
    }
}

// Cập nhật thông tin kho
const updateWarehouse = async (req, res) => {
    try {
        const { name, address, phone, adminId, staffId, isActive } = req.body

        // Kiểm tra kho tồn tại
        const warehouse = await Warehouse.findOne({
            _id: req.params.id,
            isDelete: false
        })

        if (!warehouse) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy kho'
            })
        }

        // Kiểm tra tên kho trùng lặp (nếu có thay đổi tên)
        if (name && name !== warehouse.name) {
            const existingWarehouse = await Warehouse.findOne({
                name,
                isDelete: false,
                _id: { $ne: req.params.id }
            })

            if (existingWarehouse) {
                return res.status(400).json({
                    success: false,
                    message: 'Tên kho đã tồn tại'
                })
            }
        }

        // Cập nhật thông tin
        const updatedWarehouse = await Warehouse.findByIdAndUpdate(
            req.params.id,
            {
                name,
                address,
                phone,
                adminId,
                staffId,
                isActive
            },
            { new: true }
        )
        .populate('adminId', 'name email')
        .populate('staffId', 'name email')

        res.status(200).json({
            success: true,
            message: 'Cập nhật kho thành công',
            data: updatedWarehouse
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật kho',
            error: error.message
        })
    }
}

// Xóa kho (soft delete)
const deleteWarehouse = async (req, res) => {
    try {
        const warehouse = await Warehouse.findOne({
            _id: req.params.id,
            isDelete: false
        })

        if (!warehouse) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy kho'
            })
        }

        // Soft delete
        warehouse.isDelete = true
        await warehouse.save()

        res.status(200).json({
            success: true,
            message: 'Xóa kho thành công'
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa kho',
            error: error.message
        })
    }
}

// Xóa nhiều kho
const deleteManyWarehouses = async (req, res) => {
    try {
        const { ids } = req.body

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Danh sách ID không hợp lệ'
            })
        }

        // Soft delete nhiều kho
        await Warehouse.updateMany(
            { _id: { $in: ids } },
            { isDelete: true }
        )

        res.status(200).json({
            success: true,
            message: `Đã xóa ${ids.length} kho thành công`
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa nhiều kho',
            error: error.message
        })
    }
}

// Tìm kiếm kho
const searchWarehouses = async (req, res) => {
    try {
        const { keyword } = req.query

        if (!keyword) {
            return res.status(400).json({
                success: false,
                message: 'Từ khóa tìm kiếm không được để trống'
            })
        }

        const warehouses = await Warehouse.find({
            isDelete: false,
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { 'address.city': { $regex: keyword, $options: 'i' } },
                { 'address.district': { $regex: keyword, $options: 'i' } },
                { 'address.ward': { $regex: keyword, $options: 'i' } },
                { phone: { $regex: keyword, $options: 'i' } }
            ]
        })
        .populate('adminId', 'name email')
        .populate('staffId', 'name email')
        .sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            data: warehouses
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tìm kiếm kho',
            error: error.message
        })
    }
}

module.exports = {
    getWarehouses,
    getWarehouse,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    deleteManyWarehouses,
    searchWarehouses
} 