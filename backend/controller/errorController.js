const Stock_Error = require('../model/Stock_Error')
const Stock_Import = require('../model/Stock_Import')
const User = require('../model/User')
const inventoryController = require('./inventoryController')

const errorController = {

    listStockImport: async (req, res) => {
        try {
            const admin = req.userId
            const imports = await Stock_Import.find({ adminId: admin }).populate('wareId').populate('items.proId')
            const result = imports.map((imp) => ({
                importId: imp._id,
                receiptCode: imp.receiptCode,
                receiptName: imp.receiptName,
                wareName: imp.wareId.name,
                items: imp.items.map((item) => ({
                    proId: item.proId._id,
                    proName: item.proId.name,
                    quantity: item.quantity
                })),
                importDate: imp.importDate
            }))
            return res.status(200).json({ data: result })
        } catch (error) {
            return res.status(500).json(error.message)
        }
    },

    declareErrorStock: async (req, res) => {
        try {
            const userId = req.userId
            const { importId, proId, quantity, reason } = req.body
            if (!importId || !proId || !quantity || !reason) {
                return res.status(400).json({ message: 'Vui lòng nhập đầy đủ các trường' })
            }

            if (quantity <= 0) {
                return res.status(400).json({ message: 'Số lương khai báo phải lớn hơn 0' })
            }

            // Lấy adminId từ thông tin user trong request
            const actualAdminId = req.user.adminId || req.userId

            const checkExistProduct = await Stock_Error.findOne({importId: importId, proId: proId})
            if(checkExistProduct){
                return res.status(400).json({message: 'Sản phẩm đã được khai báo lỗi trước đó'})
            }

            const stock_import = await Stock_Import.findOne({ _id: importId, adminId: userId, 'items.proId': proId }).populate('wareId').populate('items.proId')
            if (!stock_import) {
                return res.status(404).json({ message: 'Không tìm thấy phiếu nhập này' })
            }

            let totalInStock = 0
            for (const item of stock_import.items) {
                if (item.proId._id.toString() === proId) {
                    totalInStock += item.quantity
                }
            }

            if (quantity > totalInStock) {
                return res.status(400).json({ message: `Số lượng khai báo ${quantity} đang lớn hơn số lượng còn lại trong kho ${totalInStock}` })
            }

            const newDeclareError = new Stock_Error({
                importId,
                wareId: stock_import.wareId,
                proId,
                adminId: userId,
                quantity,
                reason
            })
            await newDeclareError.save()

            // Cập nhật số lượng tồn kho khi có hàng lỗi
            await inventoryController.updateStockError(stock_import.wareId._id, proId, quantity, actualAdminId)

            return res.status(201).json({ data: newDeclareError })
        } catch (error) {
            return res.status(500).json(error.message)
        }
    },

    listStockError: async (req, res) => {
        try {
            const userId = req.userId
            const user = await User.findById(userId)
            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng' })
            }

            let listStockError

            // Vai trof Admin
            if (!user.adminId) {
                const usersWithSameAdmin = await User.find({ adminId: user._id }, '_id')
                const userIds = usersWithSameAdmin.map(u => u._id)
                listStockError = await Stock_Error.find({
                    adminId: { $in: userIds }
                }).populate('wareId').populate('proId').populate('adminId')
            } else {
                // Vai trò nhân viên
                listStockError = await Stock_Error.find({ adminId: userId }).populate('wareId').populate('proId').populate('adminId')
            }
            return res.status(200).json({ data: listStockError })
        } catch (error) {
            return res.status(500).json(error.message)
        }
    }

}


module.exports = errorController