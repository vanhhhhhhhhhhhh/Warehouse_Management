const User = require('../model/User');
const argon2 = require('argon2');
const Role = require('../model/Role');

const userController = {
    getInforUser: async (req, res) => {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy user với ID này'
            });
        }

        res.json(user);
    },

    getAllStaff: async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Không tìm thấy token xác thực'
                });
            }

            const adminRole = await Role.findOne({ name: 'Admin' });
            const userRole = await Role.findById(req.user.roleId);

            let query = { roleId: { $ne: adminRole._id } };

            if (userRole.name === 'Admin') {
                // Nếu là admin, lấy nhân viên của admin đó
                query.adminId = req.user._id;
            } else {
                // Nếu là nhân viên, lấy nhân viên cùng admin
                query.adminId = req.user.adminId;
            }

            const staff = await User.find(query)
                .select('-password')
                .populate('roleId', 'name');

            res.json({
                success: true,
                staff
            });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách nhân viên:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy danh sách nhân viên'
            });
        }
    },

    createStaff: async (req, res) => {
        try {
            // 1. Validate input data
            const {
                fullName,
                username,
                email,
                phone,
                password,
                rePassword,
                roleId
            } = req.body;

            // Validate required fields
            if (!fullName || !username || !email || !password || !rePassword || !roleId || !phone) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
                });
            }

            // Validate password match
            if (password !== rePassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Mật khẩu nhập lại không khớp'
                });
            }

            // Validate fullName
            if (fullName.length < 3 || fullName.length > 50 || !/^[a-zA-ZÀ-ỹ\s]+$/.test(fullName)) {
                return res.status(400).json({
                    success: false,
                    message: 'Họ tên không hợp lệ (3-50 ký tự, chỉ chứa chữ cái và khoảng trắng)'
                });
            }

            // Validate username
            if (username.length < 3 || username.length > 30 || !/^[a-zA-Z0-9_]+$/.test(username)) {
                return res.status(400).json({
                    success: false,
                    message: 'Tên đăng nhập không hợp lệ (3-30 ký tự, chỉ chứa chữ cái, số và dấu gạch dưới)'
                });
            }

            // Validate email
            if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Email không hợp lệ'
                });
            }

            // Validate phone (if provided)
            if (phone && !/^[0-9]{10}$/.test(phone)) {
                return res.status(400).json({
                    success: false,
                    message: 'Số điện thoại không hợp lệ (phải có 10 chữ số)'
                });
            }

            // Validate password
            if (password.length < 6 || !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/.test(password)) {
                return res.status(400).json({
                    success: false,
                    message: 'Mật khẩu phải có ít nhất 6 ký tự, bao gồm cả chữ và số'
                });
            }

            if (password !== rePassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Mật khẩu nhập lại không khớp'
                });
            }

            const adminId = req.user._id;
            const admin = await User.findById(adminId).populate('roleId');

            if (!admin || admin.roleId.name !== 'Admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Chỉ Admin mới có quyền tạo nhân viên'
                });
            }

            // 3. Kiểm tra trùng lặp trong DB
            const existingUser = await User.findOne({
                $or: [
                    { username: username.toLowerCase() },
                    { email: email.toLowerCase() },
                    { phone: phone || undefined }
                ]
            }).select('username email phone');

            if (existingUser) {
                let field = '';
                if (existingUser.username === username.toLowerCase()) {
                    field = 'Tên đăng nhập';
                }
                else if (existingUser.email === email.toLowerCase()) {
                    field = 'Email';
                }
                else {
                    field = 'Số điện thoại';
                }

                return res.status(400).json({
                    success: false,
                    message: `${field} đã tồn tại trong hệ thống`
                });
            }

            // 4. Hash password using argon2
            const hashedPassword = await argon2.hash(password);

            // 5. Tạo user mới
            const newUser = new User({
                fullName: fullName.trim(),
                username: username.toLowerCase(),
                email: email.toLowerCase(),
                phone,
                password: hashedPassword,
                roleId: roleId,
                status: true,
                adminId: adminId,
                createdAt: new Date()
            });

            // 6. Lưu vào database
            const savedUser = await newUser.save();

            // 7. Trả về response (loại bỏ password)
            const userResponse = {
                id: savedUser._id,
                fullName: savedUser.fullName,
                username: savedUser.username,
                email: savedUser.email,
                phone: savedUser.phone,
                roleId: savedUser.roleId,
                status: savedUser.status
            };

            return res.status(201).json({
                success: true,
                message: 'Tạo nhân viên thành công',
                user: userResponse
            });

        } catch (error) {
            console.error('Create staff error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server khi tạo nhân viên',
                error: error.message
            });
        }
    },

    getStaffById: async (req, res) => {
        try {
            const { userId } = req.params;  // Changed from id to userId to match router
            console.log('Getting staff with ID:', userId);

            const staff = await User.findOne({
                _id: userId,
                isDelete: false  // Only get non-deleted staff
            })
            .select('-password')
            .populate('roleId', 'name');

            console.log('Found staff:', staff);

            if (!staff) {
                console.log('Staff not found or has been deleted');
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy nhân viên'
                });
            }

            res.json({
                success: true,
                staff
            });
        } catch (error) {
            console.error('Get staff error:', error);
            
            // Check if error is due to invalid ObjectId
            if (error.name === 'CastError' && error.kind === 'ObjectId') {
                return res.status(400).json({
                    success: false,
                    message: 'ID nhân viên không hợp lệ'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy thông tin nhân viên',
                error: error.message
            });
        }
    },

    updateStaff: async (req, res) => {
        try {
            const { userId } = req.params;
            
            const { fullName, username, email, phone, roleId, status } = req.body;

            // Validate input
            if (!fullName || !username || !email || !phone || !roleId) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
                });
            }

            // Kiểm tra email và số điện thoại đã tồn tại (trừ nhân viên hiện tại)
            const existingUser = await User.findOne({
                $and: [
                    { _id: { $ne: userId } },
                    {
                        $or: [
                            { email: email.toLowerCase() },
                            { phone }
                        ]
                    }
                ]
            });

            if (existingUser) {
                let field = existingUser.email === email.toLowerCase() ? 'Email' : 'Số điện thoại';
                return res.status(400).json({
                    success: false,
                    message: `${field} đã tồn tại trong hệ thống`
                });
            }

            // Kiểm tra nhân viên tồn tại
            const existingStaff = await User.findById(userId);

            if (!existingStaff) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy nhân viên'
                });
            }

            // Cập nhật thông tin
            const updatedStaff = await User.findByIdAndUpdate(
                userId,
                {
                    fullName: fullName.trim(),
                    username: username.toLowerCase(),
                    email: email.toLowerCase(),
                    phone,
                    roleId,
                    status,
                    updatedAt: new Date()
                },
                { new: true }
            ).select('-password');

            console.log('Updated staff:', updatedStaff);

            if (!updatedStaff) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy nhân viên'
                });
            }

            res.json({
                success: true,
                message: 'Cập nhật thông tin thành công',
                staff: updatedStaff
            });
        } catch (error) {
            // Check if error is due to invalid ObjectId
            if (error.name === 'CastError' && error.kind === 'ObjectId') {
                return res.status(400).json({
                    success: false,
                    message: 'ID nhân viên không hợp lệ'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Lỗi server khi cập nhật thông tin nhân viên',
                error: error.message
            });
        }
    },

    deleteStaff: async (req, res) => {
        try {
            const { staffIds } = req.body;
            
            // Chuyển đổi single ID thành array nếu chỉ xóa một nhân viên
            const idsToDelete = Array.isArray(staffIds) ? staffIds : [staffIds];

            // Validate input
            if (!idsToDelete || idsToDelete.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng chọn nhân viên cần xóa'
                });
            }

            // Kiểm tra quyền admin
            const adminRole = await Role.findOne({ name: 'Admin' });
            const currentUser = await User.findById(req.user._id).populate('roleId');

            if (!adminRole || !currentUser || currentUser.roleId.name !== 'Admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Chỉ Admin mới có quyền xóa nhân viên'
                });
            }

            // Kiểm tra không có admin trong danh sách xóa
            const staffToDelete = await User.find({
                _id: { $in: idsToDelete }
            }).populate('roleId');

            const hasAdmin = staffToDelete.some(staff => staff.roleId.name === 'Admin');
            if (hasAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'Không thể xóa tài khoản Admin'
                });
            }

            // Thực hiện xóa
            const result = await User.deleteMany({
                _id: { $in: idsToDelete },
                'roleId': { $ne: adminRole._id }
            });

            if (result.deletedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy nhân viên để xóa'
                });
            }

            const message = result.deletedCount === 1 
                ? 'Xóa nhân viên thành công'
                : `Đã xóa ${result.deletedCount} nhân viên thành công`;

            res.json({
                success: true,
                message,
                deletedCount: result.deletedCount
            });
        } catch (error) {
            console.error('Delete staff error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi xóa nhân viên',
                error: error.message
            });
        }
    }
};

module.exports = userController;
