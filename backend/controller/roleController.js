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
            const adminId = req.user._id // Lấy adminId từ user đã được xác thực

            const roles = await Role.find({
                name: { $ne: 'Admin' },
                adminId: adminId
            });
            res.status(200).json(roles);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = roleController
