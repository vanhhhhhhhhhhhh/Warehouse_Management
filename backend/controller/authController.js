const User = require('../model/User')
const argon2 = require('argon2')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const authController = {

    register: async (req, res) => {
        try {
            const { fullName, email, password, confirmPassword, phone } = req.body

            if (!fullName || !email || !password || !confirmPassword || !phone) {
                return res.status(400).json({ message: 'Vui lòng điền đầy đủ tất cả các trường' })
            }

            if (password !== confirmPassword) {
                return res.status(400).json({ message: 'Mật khẩu không khớp' })
            }

            const existingUser = await User.findOne({ email })
            if (existingUser) {
                return res.status(400).json({ message: 'Email đã tồn tại' })
            }

            const hashPassword = await argon2.hash(password)

            const user = new User({
                fullName,
                email: email.trim().toLowerCase(),
                password: hashPassword,
                phone,
                roleId: '682f5579f87dcf5d413d22d3'
            })

            await user.save()

            return res.status(201).json({ message: 'Đăng ký thành công' })
        } catch (error) {
            console.error(error)
            return res.status(500).json({ message: error.message || 'Internal server error' })
        }
    },


    verifyToken: async (req, res) => {
        try {
          const api_token = req.body?.api_token
          if (!api_token) {
            return res.status(400).json({ message: 'Token không hợp lệ' })
          }

          let decoded
          try {
            decoded = jwt.verify(api_token, process.env.ACCESS_TOKEN_SECRET)
            if (!decoded) {
              return res.status(400).json({ message: 'Token không hợp lệ' })
            }
          } catch (error) {
            return res.status(400).json({ message: 'Token không hợp lệ' })
          }

          const user = await User.findOne({ _id: decoded.userId })

          if (!user) {
            return res.status(400).json({ message: 'User không tồn tại' })
          }

          return res.status(200).json({
            message: 'Token hợp lệ',
            user: {
                id: user._id,
                fullname: user.fullname,
                email: user.email,
                roleId: user.roleId
            }
          })
        } catch (error) {
          return res.status(500).json({ message: error.message || 'Internal server error' })
        }
    },


    login: async (req, res) => {
        try {
            const { email, password } = req.body
            if (!email || !password) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Vui lòng điền đầy đủ email và mật khẩu' 
                })
            }

            const normalizedEmail = email.trim().toLowerCase();

            // Tìm user và kiểm tra isDelete
            const user = await User.findOne({ 
                email: normalizedEmail,
                isDelete: false 
            }).populate('roleId')

            // Kiểm tra user tồn tại
            if (!user) {
                return res.status(401).json({ 
                    success: false,
                    message: 'Email hoặc mật khẩu không chính xác' 
                })
            }

            // Kiểm tra mật khẩu
            const validPassword = await argon2.verify(user.password, password)
            if (!validPassword) {
                return res.status(401).json({ 
                    success: false,
                    message: 'Email hoặc mật khẩu không chính xác' 
                })
            }

            // Kiểm tra trạng thái tài khoản
            if (!user.status) {
                return res.status(403).json({ 
                    success: false,
                    message: 'Tài khoản đã bị vô hiệu hóa' 
                })
            }

            // Tạo token với thông tin cần thiết
            const accessToken = jwt.sign(
                { 
                    userId: user._id,
                    roleId: user.roleId._id
                }, 
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '1d' }
            )

            // Trả về thông tin đăng nhập thành công
            return res.status(200).json({
                success: true,
                message: 'Đăng nhập thành công',
                token: accessToken,
                user: {
                    id: user._id,
                    fullname: user.fullname,
                    email: user.email,
                    phone: user.phone,
                    roleId: user.roleId._id,
                    roleName: user.roleId.name,
                    adminId: user.adminId,
                    status: user.status,
                    permissions: user.roleId.permissions
                }
            })
        } catch (error) {
            console.error('Login error:', error)
            return res.status(500).json({ 
                success: false,
                message: 'Lỗi server khi đăng nhập' 
            })
        }
    }
}


module.exports = authController