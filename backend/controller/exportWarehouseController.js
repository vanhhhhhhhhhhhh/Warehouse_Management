const Export = require('../model/Stock_Export')
const Product = require('../model/Product') 
const Warehouse = require('../model/Warehouse')
const User = require('../model/User')
const inventoryController = require('./inventoryController')

exports.createExport = async (req, res) => {
  try {
    const userId = req.userId;

    const { receiptCode, receiptName, wareId, items } = req.body

    // Validate input
    if (!receiptCode || !receiptName || !wareId || !items || !items.length) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' })
    }

    // Lấy thông tin user để xác định vai trò
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng' })
    }

    // Kiểm tra mã phiếu tồn tại
    const currentAdminId = user.adminId || user._id;
    const checkCodeExists = await Export.findOne({ 
      receiptCode,
      adminId: currentAdminId
    })
    if (checkCodeExists) {
      return res.status(400).json({ message: 'Mã phiếu đã tồn tại trong hệ thống' })
    }

    // Kiểm tra kho tồn tại
    const warehouse = await Warehouse.findById(wareId)
    if (!warehouse) {
      return res.status(404).json({ message: 'Kho không tồn tại trong hệ thống' })
    }

    // Kiểm tra số lượng tồn kho trước khi xuất
    const itemResults = []
    for (const item of items) {
      const { proId, quantity } = item
      if (!proId || !quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Thông tin sản phẩm không hợp lệ' })
      }

      const product = await Product.findById(proId)
      if (!product) {
        return res.status(404).json({ message: 'Sản phẩm không tồn tại' })
      }

      // Kiểm tra số lượng tồn kho thực tế
      try {
        const currentStock = await inventoryController.getCurrentStock(wareId, proId, user.adminId || user._id)
        
        if (currentStock < quantity) {
          return res.status(400).json({ 
            message: `Không đủ hàng trong kho cho sản phẩm "${product.name}". Tồn kho hiện tại: ${currentStock}, yêu cầu xuất: ${quantity}` 
          })
        }
      } catch (stockError) {
        console.error('Stock check error:', stockError)
        return res.status(500).json({ 
          message: `Không thể kiểm tra tồn kho cho sản phẩm "${product.name}"`,
          error: stockError.message 
        })
      }

      const unitPrice = product.price * quantity
      itemResults.push({
        proId,
        quantity,
        unitPrice
      })
    }

    const newExport = new Export({
      receiptCode,
      receiptName,
      wareId,
      staffId: userId,                    // ID của người tạo phiếu (có thể là staff hoặc admin)
      adminId: user.adminId || user._id,  // ID của admin (nếu người tạo là staff thì lấy adminId, nếu là admin thì lấy _id)
      items: itemResults
    })

    const savedExport = await newExport.save()

    // Cập nhật số lượng tồn kho cho từng sản phẩm
    try {
      const updatePromises = itemResults.map(item => {
        const { proId, quantity } = item
        return inventoryController.updateStockOut(wareId, proId, quantity, user.adminId || user._id)
      })

      await Promise.all(updatePromises)

      return res.status(201).json({
        success: true,
        message: 'Xuất kho thành công',
        data: savedExport
      })
    } catch (inventoryError) {
      // Nếu có lỗi khi cập nhật tồn kho, xóa phiếu xuất đã lưu
      await Export.findByIdAndDelete(savedExport._id)
      console.error('Inventory update error:', inventoryError)
      return res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra khi cập nhật tồn kho',
        error: inventoryError.message
      })
    }
  } catch (err) {
    console.error('Export error:', err)
    return res.status(500).json({ 
      success: false,
      message: 'Có lỗi xảy ra khi xuất kho',
      error: err.message
    })
  }
}

exports.listWarehouse = async(req, res) => {
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
}

exports.exportReceipt = async (req, res) => {
  try {
    const expId = req.params.id
    const stockExport = await Export.findById(expId)
      .populate('wareId')
      .populate('adminId')
      .populate('staffId')
      .populate('items.proId')

    if (!stockExport) {
      return res.status(404).json({ message: 'Không tìm thấy dữ liệu' })
    }

    return res.status(200).json({ data: stockExport })
  } catch (error) {
    console.error('Lỗi lấy phiếu xuất:', error)
    return res.status(500).json({ message: 'Lỗi server', error })
  }
}

exports.getExportHistory = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    let exports;

    // Vai trò admin (không có adminId)
    if (!user.adminId) {
      // Lấy danh sách nhân viên dưới quyền admin
      const staffs = await User.find({ adminId: user._id }, '_id');
      const staffIds = staffs.map(staff => staff._id);

      // Lấy các phiếu xuất của admin và nhân viên dưới quyền
      exports = await Export.find({
        $or: [
          { staffId: { $in: staffIds } },  // Phiếu xuất của nhân viên
          { staffId: user._id }            // Phiếu xuất của admin
        ]
      })
      .populate('wareId')
      .populate('adminId')
      .populate('staffId')
      .populate('items.proId')
      .sort({ exportDate: -1 });  // Sắp xếp theo thời gian mới nhất
    } 
    // Vai trò nhân viên (có adminId)
    else {
      exports = await Export.find({
        staffId: userId  // Chỉ lấy phiếu xuất của nhân viên đó
      })
      .populate('wareId')
      .populate('adminId')
      .populate('staffId')
      .populate('items.proId')
      .sort({ exportDate: -1 });  // Sắp xếp theo thời gian mới nhất
    }

    return res.status(200).json({
      data: exports
    })
  } catch (err) {
    console.error('Export history error:', err)
    return res.status(500).json({ 
      message: 'Có lỗi xảy ra khi lấy lịch sử xuất kho',
      error: err.message
    })
  }
}

exports.deleteExport = async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await Export.findByIdAndDelete(id)

    if (!deleted) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu xuất' })
    }

    return res.status(200).json({ message: 'Xóa phiếu xuất thành công' })
  } catch (err) {
    console.error('Delete export error:', err)
    return res.status(500).json({ 
      message: 'Có lỗi xảy ra khi xóa phiếu xuất',
      error: err.message
    })
  }
}