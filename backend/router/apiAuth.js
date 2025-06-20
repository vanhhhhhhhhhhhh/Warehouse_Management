const router = require('express').Router()
const authController = require('../controller/authController')

router.post('/register', authController.register)

router.post('/login', authController.login)

router.post('/login/employee', authController.loginEmployee)

router.post('/verify-token', authController.verifyToken)

router.post('/forgot-password', authController.forgotPassword)

router.post('/verify-otp', authController.verifyOTP)

router.post('/reset-password', authController.resetPassword)

module.exports = router