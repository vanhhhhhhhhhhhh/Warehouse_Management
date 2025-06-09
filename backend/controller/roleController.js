const Role = require('../model/Role')

const roleController = {
    // Create role
    createRole: async (req, res) => {
        try {
            console.log('Request body:', req.body);  // Log request body
            console.log('User:', req.user);  // Log user info
            
            const { name, status, permissions } = req.body;
            const adminId = req.user._id;

            // Kiểm tra xem role đã tồn tại trong phạm vi của admin chưa
            const existingRole = await Role.findOne({
                name,
                adminId: adminId
            });

            if (existingRole) {
                return res.status(400).json({
                    success: false,
                    message: 'Vai trò này đã tồn tại trong hệ thống'
                });
            }

            const role = new Role({
                name,
                status,
                permissions,
                adminId: adminId
            });

            await role.save();

            return res.status(201).json({
                success: true,
                data: role
            });
        } catch (error) {
            console.error('Error in createRole:', error);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    getRoles: async (req, res) => {
        try {
            const adminId = req.user._id

            const roles = await Role.find({
                name: { $ne: 'Admin' },
                adminId: adminId,
                isDelete: { $ne: true } // Không lấy các role đã xóa
            });
            res.status(200).json(roles);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getRoleById: async (req, res) => {
        try {
            const { roleId } = req.params;
            const adminId = req.user._id;

            const role = await Role.findOne({
                _id: roleId,
                adminId: adminId
            });

            res.status(200).json(role);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    updateRole: async (req, res) => {
        try {
            const { roleId } = req.params;
            const { name, status, permissions } = req.body;
            const adminId = req.user._id;

            // Kiểm tra role có tồn tại không
            const existingRole = await Role.findOne({
                _id: roleId,
                adminId: adminId
            });

            if (!existingRole) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy vai trò'
                });
            }

            // Kiểm tra xem tên mới có bị trùng với role khác không
            if (name !== existingRole.name) {
                const duplicateRole = await Role.findOne({
                    name,
                    adminId: adminId,
                    _id: { $ne: roleId }
                });

                if (duplicateRole) {
                    return res.status(400).json({
                        success: false,
                        message: 'Tên vai trò đã tồn tại trong hệ thống'
                    });
                }
            }

            // Cập nhật role
            const updatedRole = await Role.findByIdAndUpdate(
                roleId,
                {
                    name,
                    status,
                    permissions,
                    updatedAt: Date.now()
                },
                { new: true }
            );

            return res.status(200).json({
                success: true,
                message: 'Cập nhật vai trò thành công',
                data: updatedRole
            });

        } catch (error) {
            console.error('Error in updateRole:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Có lỗi xảy ra khi cập nhật vai trò'
            });
        }
    },

    // Soft delete role
    deleteRole: async (req, res) => {
        try {
            const { id } = req.params;
            const adminId = req.user._id;

            // Kiểm tra role có tồn tại không
            const role = await Role.findOne({
                _id: id,
                adminId: adminId
            });

            if (!role) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy vai trò'
                });
            }

            // Kiểm tra xem có phải role Admin không
            if (role.name.toLowerCase() === 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Không thể xóa vai trò Admin'
                });
            }

            // Cập nhật trạng thái isDelete thành true
            await Role.findByIdAndUpdate(id, {
                isDelete: true,
                updatedAt: Date.now()
            });

            return res.status(200).json({
                success: true,
                message: 'Xóa vai trò thành công'
            });
        } catch (error) {
            console.error('Delete role error:', error);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = roleController
