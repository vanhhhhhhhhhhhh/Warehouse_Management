const Warehouse = require('../model/Warehouse')
const Product = require('../model/Product')
const Stock_Import = require('../model/Stock_Import')
const User = require('../model/User')
const Role = require('../model/Role')
const inventoryController = require('./inventoryController')
const mongoose = require('mongoose')

const importWarehouseController = {

    listWarehouse: async(req, res) => {
        try {
            const staffId = req.userId
            const warehouse = await Warehouse.find({staffId: staffId, isActive: true, isDelete: false})
            if(!warehouse){
                return res.status(404).json({message: 'Nhân viên chưa được gán kho'})
            }
            return res.status(200).json({data: warehouse})
        } catch (error) {
            return res.status(500).json(error)
        }
    },

    listProduct: async(req, res) => {
        try {
            // const userId = req.userId
            // const user = await User.findById(userId)
            // if(!user){
            //     return res.status(404).json({message: 'Không tìm thấy người dùng'})
            // }

            // const adminId = user.adminId
            // if(!adminId){
            //     return res.status(404).json({message: 'Người dùng không có admin quản lý'})
            // }

            // const usersWithSameAdmin = await User.find({adminId: adminId}, '_id')
            // const userIds = usersWithSameAdmin.map(u => u._id)

            // const products = await Product.find({adminId: {$in: userIds}, isDelete: false}).populate('adminId')
            // return res.status(200).json({data: products})

            const userId = req.userId
            const user = await User.findById(userId)
            if(!user){
                return res.status(404).json({message: 'Không tìm thấy người dùng'})
            }

            const admin = user.adminId
            if(!admin){
                return res.status(404).json({message: 'Người dùng không có admin quản lý'})
            }

            const products = await Product.find({adminId: admin, isDelete: false})
            return res.status(200).json({data: products})
        } catch (error) {
            return res.status(500).json(error)
        }
    },

    importIntoWarehouse: async(req, res) => {
        const userId = req.userId
        const {receiptCode, receiptName, wareId, items} = req.body

        if(!receiptCode || !receiptName || !wareId || !items){
            return res.status(400).json({message: 'Vui lòng nhập đầy đủ các trường'})
        }

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({message: 'Không tìm thấy thông tin người dùng'})
        }

        const currentAdminId = user.adminId || user._id
        const checkCodeIsExist = await Stock_Import.findOne({
            receiptCode: receiptCode,
            adminId: currentAdminId
        })
        if(checkCodeIsExist){
            return res.status(400).json({message: 'Mã phiếu đã tồn tại trong hệ thống'})
        }

        try {
            const warehouse = await Warehouse.findById(wareId)
            if(!warehouse){
                return res.status(404).json({message: 'Kho không tồn tại trong hệ thống'})
            }

            const itemResults = []
            for(const item of items){
                const {proId, quantity} = item

                if(!proId || !quantity){
                    return res.status(400).json({message: 'Vui lòng nhập đầy đủ các trường'})
                }

                const product = await Product.findById(proId)
                if(!product){
                    return res.status(404).json({message: 'Sản phẩm không tồn tại'})
                }
                if(quantity <= 0){
                    return res.status(400).json({message: `Số lượng sản phẩm ${product.name} không được bé hơn hoặc bằng 0`})
                }
                const unitPrice = product.price * quantity
                
                itemResults.push({
                    proId,
                    quantity,
                    unitPrice
                })
            }

            // Lưu phiếu nhập với thông tin người tạo
            const addNewImport = new Stock_Import({
                receiptCode,
                receiptName,
                wareId,
                staffId: userId,
                adminId: user.adminId || user._id,
                items: itemResults
            })

            const savedImport = await addNewImport.save()

            // Cập nhật tồn kho cho từng sản phẩm
            try {
                const updatePromises = itemResults.map(item => {
                    const {proId, quantity} = item
                    return inventoryController.updateStockIn(wareId, proId, quantity, user.adminId || user._id)
                })

                await Promise.all(updatePromises)

                return res.status(201).json({
                    success: true,
                    message: 'Nhập kho thành công',
                    data: savedImport
                })
            } catch (inventoryError) {
                // Nếu có lỗi khi cập nhật tồn kho, xóa phiếu nhập đã lưu
                await Stock_Import.findByIdAndDelete(savedImport._id)
                console.error('Inventory update error:', inventoryError)
                return res.status(500).json({
                    success: false,
                    message: 'Có lỗi xảy ra khi cập nhật tồn kho',
                    error: inventoryError.message
                })
            }
        } catch (error) {
            console.error('Import error:', error)
            return res.status(500).json({
                success: false,
                message: 'Có lỗi xảy ra khi nhập kho',
                error: error.message
            })
        }
    },

    historyImport: async (req, res) => {
        try {
            const userId = req.userId;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }

            let imports;

            // Vai trò admin (không có adminId)
            if (!user.adminId) {
                // Lấy danh sách nhân viên dưới quyền admin
                const staffs = await User.find({ adminId: user._id }, '_id');
                const staffIds = staffs.map(staff => staff._id);

                // Lấy các phiếu nhập của admin và nhân viên dưới quyền
                imports = await Stock_Import.find({
                    $or: [
                        { staffId: { $in: staffIds } },  // Phiếu nhập của nhân viên
                        { staffId: user._id }            // Phiếu nhập của admin
                    ]
                })
                .populate('wareId')
                .populate('adminId')
                .populate('staffId')
                .populate('items.proId')
                .sort({ importDate: -1 });  // Sắp xếp theo thời gian mới nhất
            } 
            // Vai trò nhân viên (có adminId)
            else {
                imports = await Stock_Import.find({
                    staffId: userId  // Chỉ lấy phiếu nhập của nhân viên đó
                })
                .populate('wareId')
                .populate('adminId')
                .populate('staffId')
                .populate('items.proId')
                .sort({ importDate: -1 });  // Sắp xếp theo thời gian mới nhất
            }

            return res.status(200).json({ data: imports });

        } catch (error) {
            console.error('History import error:', error);
            return res.status(500).json({ 
                message: 'Có lỗi xảy ra khi lấy lịch sử nhập kho',
                error: error.message 
            });
        }
    },

    importReceipt: async(req, res) => {
        try {
            const impId = req.params.id
            const stockImport = await Stock_Import.findById(impId).populate('wareId').populate('adminId').populate('items.proId')
            if(!stockImport){
                return res.status(404).json({message: 'Không tìm thấy dữ liệu'})
            }
            return res.status(200).json({data: stockImport})
        } catch (error) {
            return res.status(500).json(error)
        }
    }


}

module.exports = importWarehouseController