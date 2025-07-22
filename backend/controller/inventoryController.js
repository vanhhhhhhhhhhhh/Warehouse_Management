const Stock_Import = require('../model/Stock_Import')
const Stock_Error = require('../model/Stock_Error')
const Stock_Export = require('../model/Stock_Export')
const Product = require('../model/Product')
const Warehouse = require('../model/Warehouse')
const Stock_Inventory = require('../model/Stock_Inventory')
const User = require('../model/User')

const inventoryController = {
    // Cập nhật tồn kho khi nhập hàng
    updateStockIn: async (wareId, proId, quantity, adminId, session = null) => {
        try {
            const updateOptions = {
                new: true,
                upsert: true
            }
            
            // Nếu có session, thêm vào options
            if (session) {
                updateOptions.session = session
            }

            const inventory = await Stock_Inventory.findOneAndUpdate(
                { wareId, proId, adminId },
                {
                    $inc: { 
                        totalImport: quantity,
                        currentStock: quantity 
                    },
                    lastUpdated: new Date()
                },
                updateOptions
            )
            return inventory
        } catch (error) {
            console.error('Error updating stock in:', error)
            throw error
        }
    },

    // Cập nhật tồn kho khi xuất hàng
    updateStockOut: async (wareId, proId, quantity, adminId) => {
        try {
            const inventory = await Stock_Inventory.findOneAndUpdate(
                { wareId, proId, adminId },
                {
                    $inc: { 
                        totalExport: quantity,
                        currentStock: -quantity 
                    },
                    lastUpdated: new Date()
                },
                { 
                    new: true,
                    upsert: true
                }
            )
            return inventory
        } catch (error) {
            console.error('Error updating stock out:', error)
            throw error
        }
    },

    // Cập nhật tồn kho khi có hàng lỗi
    updateStockError: async (wareId, proId, quantity, adminId) => {
        try {
            const inventory = await Stock_Inventory.findOneAndUpdate(
                { wareId, proId, adminId },
                {
                    $inc: { 
                        totalError: quantity,
                        currentStock: -quantity 
                    },
                    lastUpdated: new Date()
                },
                { 
                    new: true,
                    upsert: true
                }
            )
            return inventory
        } catch (error) {
            console.error('Error updating stock error:', error)
            throw error
        }
    },

    // Lấy báo cáo tồn kho
    getInventoryReport: async (req, res) => {
        try {
            const { warehouseId, categoryId, date } = req.query
            const userId = req.userId

            // Lấy thông tin user để xác định adminId
            const user = await User.findById(userId)
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông tin người dùng'
                })
            }

            // Xác định adminId (nếu là admin thì dùng userId, nếu là nhân viên thì dùng adminId của họ)
            const adminId = user.adminId || user._id

            let query = { isDelete: false, adminId }
            if (warehouseId) {
                query.wareId = warehouseId
            }

            // Nếu có filter theo danh mục
            if (categoryId) {
                const products = await Product.find({ cateId: categoryId })
                const productIds = products.map(p => p._id)
                query.proId = { $in: productIds }
            }

            // Nếu có filter theo ngày
            if (date) {
                query.lastUpdated = { $lte: new Date(date) }
            }

            const inventoryData = await Stock_Inventory.find(query)
                .populate('proId', 'name code price cateId')
                .populate('wareId', 'name')
                .populate({
                    path: 'proId',
                    populate: {
                        path: 'cateId',
                        select: 'name'
                    }
                })

            // Format dữ liệu trả về
            const formattedData = inventoryData.map(item => ({
                productId: item.proId?._id,
                productName: item.proId?.name,
                productCode: item.proId?.code,
                category: item.proId?.cateId?.name,
                warehouseId: item.wareId?._id,
                warehouseName: item.wareId?.name,
                totalImport: item.totalImport,
                totalExport: item.totalExport,
                totalError: item.totalError,
                currentStock: item.currentStock,
                totalValue: item.currentStock * (item.proId?.price || 0)
            }))

            // Tính tổng các giá trị
            const summary = formattedData.reduce((acc, item) => ({
                totalImport: acc.totalImport + item.totalImport,
                totalExport: acc.totalExport + item.totalExport,
                totalError: acc.totalError + item.totalError,
                totalStock: acc.totalStock + item.currentStock,
                totalValue: acc.totalValue + item.totalValue
            }), {
                totalImport: 0,
                totalExport: 0,
                totalError: 0,
                totalStock: 0,
                totalValue: 0
            })

            return res.status(200).json({
                success: true,
                data: formattedData,
                summary
            })

        } catch (error) {
            console.error('Inventory report error:', error)
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy báo cáo tồn kho'
            })
        }
    }
}

module.exports = inventoryController 