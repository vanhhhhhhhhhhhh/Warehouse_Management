const User = require('../model/User')
const argon2 = require('argon2')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const sendMail = require('./sendMail')

const authController = {

    register: async (req, res) => {
        try {
            const { fullName, email, password, confirmPassword, phone } = req.body

            if (!fullName || !email || !password || !confirmPassword || !phone) {
                return res.status(400).json({ message: 'Vui lòng điền đầy đủ tất cả các trường' })
            }

            if(fullName.startsWith(' ')){
                return res.status(400).json({message: 'Họ tên không được bắt đầu bằng khoảng trắng'})
            }

            if (fullName.length < 3 || fullName.length > 50) {
                return res.status(400).json({ message: 'Họ tên phải từ 3 đến 50 ký tự' })
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: 'Email không hợp lệ. Vui lòng thử lại' })
            }

            const existingUser = await User.findOne({ email })
            if (existingUser) {
                return res.status(400).json({ message: 'Email đã tồn tại' })
            }

            if(password.startsWith(' ') || password.endsWith(' ')){
                return res.status(400).json({message: 'Mật khẩu không được bắt đầu hoặc kết thúc bằng khoảng trắng'})
            }

            if(password.length < 6){
                return res.status(400).json({message: 'Mật khẩu phải chứa ít nhất 6 ký tự'})
            }

            if (password !== confirmPassword) {
                return res.status(400).json({ message: 'Mật khẩu không khớp' })
            }

            const phoneRegex = /^[0-9]+$/
            if (!phoneRegex.test(phone)) {
                return res.status(400).json({ message: 'Số điện thoại không hợp lệ. Chỉ được chứa chữ số.' })
            }

            if(phone.length < 9 || phone.length > 11){
                return res.status(400).json({message: 'Số điện thoại chỉ tối thiểu 9 số và tối đa 11 số'})
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
            await sendMail({
                email: email,
                subject: "Chúc mừng bạn đã đăng ký thành công tài khoản Metronic!",
                html: `
                        <h2>Chào mừng ${fullName} đến với Metronic - Hệ thống quản lý kho chuyên nghiệp!</h2>
                        <p>Cảm ơn bạn đã đăng ký tài khoản. Dưới đây là thông tin tài khoản của bạn:</p>
                    <ul>
                        <li><strong>Họ tên:</strong> ${fullName}</li>
                        <li><strong>Email:</strong> ${email}</li>
                        <li><strong>Số điện thoại:</strong> ${phone}</li>
                    </ul>
                        <p>Hãy đăng nhập và bắt đầu quản lý kho hàng của bạn một cách hiệu quả ngay hôm nay.</p>
                        <p>Trân trọng,<br/>Đội ngũ Metronic</p>
                    `
            })
            return res.status(201).json({ message: 'Đăng ký thành công' })
        } catch (error) {
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

            const user = await User.findOne({
                email: normalizedEmail,
                isDelete: false
            }).populate('roleId').populate('adminId')

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Email hoặc mật khẩu không chính xác'
                })
            }

            if (user.adminId) {
                return res.status(403).json({ message: 'Tài khoản này không được phép đăng nhập tại trang quản trị' })
            }

            const validPassword = await argon2.verify(user.password, password)
            if (!validPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Email hoặc mật khẩu không chính xác'
                })
            }

            const accessToken = jwt.sign(
                {
                    userId: user._id,
                    roleId: user.roleId._id
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '1d' }
            )

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
    },

    loginEmployee: async (req, res) => {
        try {
            const { email, username, password } = req.body

            if(!email || !username || !password){
                return res.status(400).json({message: 'Vui lòng nhập đầy đủ các trường'})
            }

            const employee = await User.findOne({ username: username, isDelete: false }).populate('adminId').populate('roleId')
            if (!employee) {
                return res.status(400).json({ message: 'Tên người dùng hoặc mật khẩu không chính xác' })
            }
            if (employee.adminId.email !== email) {
                return res.status(400).json({ message: 'Email quản trị viên không khớp' })
            }
            const validPassword = await argon2.verify(employee.password, password);
            if (!validPassword) {
                return res.status(400).json({ message: 'Tên người dùng hoặc mật khẩu không chính xác' })
            }

            if (!employee.status) {
                return res.status(403).json({ message: 'Tài khoản đã bị vô hiệu hóa' })
            }
            const accessToken = jwt.sign(
                {
                    userId: employee._id,
                    roleId: employee.roleId._id,
                    adminId: employee.adminId._id
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '1d' }
            )

            return res.status(200).json({
                success: true,
                message: 'Đăng nhập thành công',
                token: accessToken,
                employee: {
                    id: employee._id,
                    fullname: employee.fullname,
                    email: employee.email,
                    phone: employee.phone,
                    roleId: employee.roleId._id,
                    roleName: employee.roleId.name,
                    adminId: employee.adminId,
                    status: employee.status,
                    permissions: employee.roleId.permissions
                }
            })

        } catch (error) {
            console.log('Login error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server khi đăng nhập'
            })
        }
    },


    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body

            if (!email) {
                return res.status(500).json({ message: 'Vui lòng nhập email' })
            }

            const user = await User.findOne({ email: email.trim().toLowerCase() })
            if (!user) {
                return res.status(404).json({ message: 'Email không tồn tại trong hệ thống' })
            }

            const otp = Math.floor(100000 + Math.random() * 900000).toString()

            user.resetPasswordOtp = otp
            user.resetPasswordOtpExpire = Date.now() + 10 * 6 * 1000
            await user.save()

            await sendMail({
                email: user.email,
                subject: "Metronic - Mã xác minh đặt lại mật khẩu",
                html: `
                        <h2>Xin chào ${user.fullName},</h2>
                        <p>Bạn đã yêu cầu đặt lại mật khẩu trên <strong>Hệ thống Quản lý Kho Metronic</strong>.</p>
                        <p>Mã xác minh OTP của bạn là:</p>
                        <h1>${otp}</h1>
                        <p>Mã này sẽ hết hạn sau 10 phút.</p>
                        <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
                        <p>Trân trọng,<br/>Đội ngũ Metronic</p>
                `
            })
            return res.status(200).json({ message: 'OTP đã được gửi tới email của bạn' })
        } catch (error) {
            return res.status(500).json({ message: error.message || 'Internal server error' })
        }
    },


    verifyOTP: async (req, res) => {
        try {
            const { email, otp } = req.body

            if (!email || !otp) {
                return res.status(500).json({ message: 'Thiếu email hoặc mã otp' })
            }

            const user = await User.findOne({ email: email.trim().toLowerCase() })
            if (!user) {
                return res.status(404).json({ message: 'Email không tồn tại trong hệ thống' })
            }

            if (user.resetPasswordOtp !== otp) {
                return res.status(400).json({ message: 'Mã OTP không đúng' })
            }

            if (user.resetPasswordOtpExpire < Date.now()) {
                return res.status(400).json({ message: 'Mã OTP đã hết hạn' })
            }
            return res.status(200).json({ message: 'Xác minh OTP thành công' })
        } catch (error) {
            return res.status(500).json({ message: error.message || 'Internal server error' })
        }
    },


    resetPassword: async (req, res) => {
        try {
            const { email, otp, newPassword, confirmPassword } = req.body

            if (!email || !otp || !newPassword || !confirmPassword) {
                return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' })
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({ message: 'Mật khẩu không khớp' })
            }

            const user = await User.findOne({ email: email.trim().toLowerCase() })
            if (!user) {
                return res.status(404).json({ message: 'Email không tồn tại trong hệ thống' })
            }

            if (user.resetPasswordOtp !== otp || user.resetPasswordOtpExpire < Date.now()) {
                return res.status(400).json({ message: 'OTP không hợp lệ hoặc đã hết hạn' })
            }

            user.password = await argon2.hash(newPassword)
            user.resetPasswordOtp = undefined
            user.resetPasswordOtpExpire = undefined
            await user.save()
            return res.status(200).json({ message: 'Đặt lại mật khẩu thành công' })
        } catch (error) {
            return res.status(500).json({ message: error.message || 'Internal server error' })
        }
    }
}


module.exports = authController