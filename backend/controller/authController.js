const User = require('../model/User')
const argon2 = require('argon2')
const jwt = require('jsonwebtoken')
require('dotenv').config()




const authController = {

    register: async (req, res) => {
        try {
            const { fullname, email, password, confirmPassword, phone } = req.body

            if (!fullname || !email || !password || !confirmPassword || !phone) {
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
                fullname,
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


    login: async (req, res) => {
        try {
            const { email, password } = req.body
            if (!email || !password) {
                return res.status(400).json({ message: 'Vui lòng điền đầy đủ tất cả các trường' })
            }

            const normalizedEmail = email.trim().toLowerCase();

            const user = await User.findOne({ email: normalizedEmail })
            if (!user || user.isDelete || !user.isActive) {
                return res.status(404).json({ message: 'Email hoặc mật khẩu không chính xác' })
            }

            const validPassword = await argon2.verify(user.password, password)
            if (!validPassword) {
                return res.status(404).json({ message: 'Email hoặc mật khẩu không chính xác' })
            }

            const accessToken = await jwt.sign({ userId: user._id, roleId: user.roleId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
            return res.status(200).json({
                message: 'Đăng nhập thành công', accessToken,
                user: {
                    id: user._id,
                    fullname: user.fullname,
                    email: user.email,
                    roleId: user.roleId
                }
            })
        } catch (error) {
            return res.status(500).json(error.message)
        }
    }
}


module.exports = authController