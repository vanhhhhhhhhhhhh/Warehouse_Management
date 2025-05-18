const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()


const hostname = process.env.HOSTNAME
const port = process.env.PORT 
const url = process.env.URL 
const dbName = process.env.DBNAME 


const app = express()
app.use(express.json())
app.use(cors());


mongoose.connect(`${url}${dbName}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB successfully'))
    .catch((err) => console.error('MongoDB connection error:', err));


app.listen(port, () => {
    console.log(`Server is running on http://${hostname}:${port}`);
})