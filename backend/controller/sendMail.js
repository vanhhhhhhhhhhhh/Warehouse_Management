const nodemailer = require('nodemailer')
require('dotenv').config()

const sendMail = async({email, subject, html}) => {
    if (process.env.NODE_ENV === 'test') {
        console.log('Email:', email)
        console.log('Subject:', subject)
        console.log('HTML:', html)

        console.log('Email sent successfully')
        return
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    })

    const message = {
        from: 'ADMIN FROM METRONIC',
        to: email,
        subject: subject,
        html: html
    }

    const result = await transporter.sendMail(message)
    return result
}

module.exports = sendMail