const User = require('../model/User')
const argon2 = require('argon2')
const jwt = require('jsonwebtoken')
require('dotenv').config()




const authController = {

    register: async (req, res) => {
        try {
            const { fullname, email, password, confirmPassword } = req.body
            if (!fullname || !email || !password || !confirmPassword) {
                return res.status(400).json({ message: 'All fields are required' })
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            const normalizedEmail = email.trim().toLowerCase()
            if (!emailRegex.test(normalizedEmail)) {
                return res.status(400).json({ message: 'Email is not valid' })
            }

            if (password.length < 6) {
                return res.status(400).json({ message: 'Password must be at least 6 characters long' })
            }

            if (password !== confirmPassword) {
                return res.status(400).json({ message: 'Passwords do not match' })
            }

            const existingUser = await User.findOne({ email })
            if (existingUser) {
                return res.status(400).json({ message: 'Email already exist' })
            }

            const hashPassword = await argon2.hash(password)
            const newUser = new User({ fullname, email: normalizedEmail, password: hashPassword, roleId: '682f5579f87dcf5d413d22d3' })
            await newUser.save()
            return res.status(201).json({ message: 'Register successfully' })
        } catch (error) {
            return res.status(500).json(error.message)
        }
    },


    login: async (req, res) => {
        try {
            const { email, password } = req.body
            if(!email || !password){
                return res.status(400).json({ message: 'All fields are required' })
            }

            const normalizedEmail = email.trim().toLowerCase();

            const user = await User.findOne({email: normalizedEmail})
            if(!user || user.isDelete || !user.isActive){
                return res.status(404).json({message: 'Email or password is incorrect'})
            }

            const validPassword = await argon2.verify(user.password, password)
            if(!validPassword){
                return res.status(404).json({message: 'Email or password is incorrect'})
            }

            const accessToken = await jwt.sign({userId: user._id, roleId: user.roleId}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'})
            return res.status(200).json({message: 'Login successfully',  accessToken, 
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