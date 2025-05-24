const jwt = require('jsonwebtoken')
const User = require('../model/User')


const middlewareController = {

    verifyToken: async (req, res, next) => {
            const authHeader = req.header('Authorization')
            const token = authHeader && authHeader.split(' ')[1]

            if(!token){
                return res.status(401).json({success: false, message: 'Access token not found'})
            }
            try {
                const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
                req.userId = decoded.userId
                const user = await User.findById(req.userId)
                if(!user){
                    return res.status(404).json({success: false, message: 'User not found'})
                }
                req.user = user
                next()
            } catch (error) {
                return res.status(403).json({success: false, message: 'Invalid token'})
            }
    }
}