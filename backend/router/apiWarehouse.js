const express = require('express')
const router = express.Router()
const warehouseController = require('../controller/warehouseController')
const { checkPermission } = require('../middleware/auth')

// Lấy danh sách kho
router.get('/', checkPermission('WAREHOUSE', 'READ'), warehouseController.getWarehouses)

// Tìm kiếm kho
router.get('/search', checkPermission('WAREHOUSE', 'READ'), warehouseController.searchWarehouses)

// Lấy thông tin một kho
router.get('/:id', checkPermission('WAREHOUSE', 'READ'), warehouseController.getWarehouse)

// Tạo kho mới
router.post('/', checkPermission('WAREHOUSE', 'CREATE'), warehouseController.createWarehouse)

// Cập nhật thông tin kho
router.put('/:id', checkPermission('WAREHOUSE', 'UPDATE'), warehouseController.updateWarehouse)

// Xóa kho
router.delete('/:id', checkPermission('WAREHOUSE', 'DELETE'), warehouseController.deleteWarehouse)

// Xóa nhiều kho
router.delete('/', checkPermission('WAREHOUSE', 'DELETE'), warehouseController.deleteManyWarehouses)

module.exports = router 