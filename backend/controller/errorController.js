const Stock_Error = require('../model/Stock_Error')
const Stock_Import = require('../model/Stock_Import')
const User = require('../model/User')
const inventoryController = require('./inventoryController')

const errorController = {
    listStockImport: async (req, res) => {
        try {
            const userId = req.userId;
            
            // Lấy thông tin user để xác định vai trò
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }

            let imports;
            // Nếu là admin
            if (!user.adminId) {
                // Lấy danh sách nhân viên dưới quyền
                const staffIds = await User.find({ adminId: userId }, '_id');
                const staffIdList = staffIds.map(staff => staff._id);

                // Lấy phiếu nhập của admin và nhân viên dưới quyền
                imports = await Stock_Import.find({
                    $or: [
                        { staffId: { $in: staffIdList } },
                        { staffId: userId }
                    ]
                })
                .populate('wareId')
                .populate('items.proId')
                .sort({ importDate: -1 });
            } 
            // Nếu là nhân viên
            else {
                imports = await Stock_Import.find({ 
                    staffId: userId 
                })
                .populate('wareId')
                .populate('items.proId')
                .sort({ importDate: -1 });
            }

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
            }));

            return res.status(200).json({ 
                success: true,
                data: result 
            });
        } catch (error) {
            console.error('List stock import error:', error);
            return res.status(500).json({ 
                success: false,
                message: 'Lỗi khi lấy danh sách phiếu nhập',
                error: error.message 
            });
        }
    },

    declareErrorStock: async (req, res) => {
        try {
            const userId = req.userId;
            const { importId, proId, quantity, reason } = req.body;

            // Validate input
            if (!importId || !proId || !quantity || !reason) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Vui lòng nhập đầy đủ các trường' 
                });
            }

            if (quantity <= 0) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Số lượng khai báo phải lớn hơn 0' 
                });
            }

            // Lấy thông tin user
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Không tìm thấy thông tin người dùng' 
                });
            }

            // Kiểm tra sản phẩm đã được khai báo lỗi
            const checkExistProduct = await Stock_Error.findOne({
                importId: importId,
                proId: proId
            });
            if (checkExistProduct) {
                return res.status(400).json({
                    success: false,
                    message: 'Sản phẩm đã được khai báo lỗi trước đó'
                });
            }

            // Kiểm tra quyền truy cập phiếu nhập
            const stock_import = await Stock_Import.findOne({ 
                _id: importId,
                staffId: userId,
                'items.proId': proId 
            })
            .populate('wareId')
            .populate('items.proId');

            if (!stock_import) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Không tìm thấy phiếu nhập này hoặc bạn không có quyền truy cập' 
                });
            }

            // Kiểm tra số lượng tồn kho
            let totalInStock = 0;
            for (const item of stock_import.items) {
                if (item.proId._id.toString() === proId) {
                    totalInStock += item.quantity;
                }
            }

            if (quantity > totalInStock) {
                return res.status(400).json({ 
                    success: false,
                    message: `Số lượng khai báo ${quantity} đang lớn hơn số lượng còn lại trong kho ${totalInStock}` 
                });
            }

            // Tạo khai báo lỗi mới
            const newDeclareError = new Stock_Error({
                importId,
                wareId: stock_import.wareId._id,
                proId,
                staffId: userId,
                adminId: user.adminId || userId,
                quantity,
                reason
            });
            const savedError = await newDeclareError.save();

            // Cập nhật số lượng tồn kho
            await inventoryController.updateStockError(
                stock_import.wareId._id,
                proId,
                quantity,
                user.adminId || userId
            );

            return res.status(201).json({ 
                success: true,
                message: 'Khai báo sản phẩm lỗi thành công',
                data: savedError 
            });
        } catch (error) {
            console.error('Declare error stock error:', error);
            return res.status(500).json({ 
                success: false,
                message: 'Lỗi khi khai báo sản phẩm lỗi',
                error: error.message 
            });
        }
    },

    listStockError: async (req, res) => {
        try {
            const userId = req.userId;
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Không tìm thấy người dùng' 
                });
            }

            let listStockError;

            // Vai trò Admin
            if (!user.adminId) {
                const staffIds = await User.find({ adminId: userId }, '_id');
                const staffIdList = staffIds.map(staff => staff._id);

                listStockError = await Stock_Error.find({
                    $or: [
                        { staffId: { $in: staffIdList } },
                        { staffId: userId }
                    ]
                })
                .populate('wareId')
                .populate('proId')
                .populate('staffId')
                .populate('adminId')
                .sort({ createdAt: -1 });
            } else {
                // Vai trò nhân viên
                listStockError = await Stock_Error.find({ 
                    staffId: userId 
                })
                .populate('wareId')
                .populate('proId')
                .populate('staffId')
                .populate('adminId')
                .sort({ createdAt: -1 });
            }

            return res.status(200).json({ 
                success: true,
                data: listStockError 
            });
        } catch (error) {
            console.error('List stock error:', error);
            return res.status(500).json({ 
                success: false,
                message: 'Lỗi khi lấy danh sách sản phẩm lỗi',
                error: error.message 
            });
        }
    }
}

module.exports = errorController