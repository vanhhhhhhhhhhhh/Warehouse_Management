const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const exp = require('constants')
require('dotenv').config()
const apiAuth = require('./router/apiAuth')
const apiRole = require('./router/apiRole')
const apiProduct = require('./router/apiProduct')
const apiCategory = require('./router/apiCategory')

const hostname = process.env.HOSTNAME
const port = process.env.PORT
const url = process.env.URL
const dbName = process.env.DBNAME

const app = express()
app.use(express.json())

// Cấu hình CORS chi tiết
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

mongoose.connect(`${url}${dbName}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB successfully'))
    .catch((err) => console.error('MongoDB connection error:', err));

// AUTHENTICATION
app.use('/auth', apiAuth)

// ROLES
app.use('/roles', apiRole)

// CATEGORIES
app.use('/categories', apiCategory)

app.use('/products', apiProduct)

app.listen(port, () => {
    console.log(`Server is running on http://${hostname}:${port}`);
})
