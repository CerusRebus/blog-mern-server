import express from 'express'
import mongoose from "mongoose"
import dotenv from 'dotenv'
import cors from 'cors'
import bodyParser from "body-parser"
import fileUpload from 'express-fileupload'

import authRout from './routes/auth.js'
import postRout from './routes/posts.js'
import commentRout from './routes/comments.js'

const app = express()
dotenv.config()

// Constants
const PORT = process.env.PORT || 3001
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_NAME = process.env.DB_NAME

// Middleware
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())
app.use(fileUpload())
app.use(bodyParser.json())
app.use(express.static('uploads'))

// Routes
app.use('/api/auth', authRout)
app.use('/api/posts', postRout)
app.use('/api/comments', commentRout)

app.get('/', () => { return 2 })

async function start() {
    try {
        await mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.tmxatwa.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`)
        app.listen(PORT, () => {
            console.log(`Server started on port: ${PORT}`)
        })
    } catch (error) {
        console.log(error);
    }
}
await start()