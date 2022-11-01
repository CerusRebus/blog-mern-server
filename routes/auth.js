import {Router} from "express"

import {register, login, getMe} from '../controllers/auth.js'
import {checkAuth} from "../utils/checkAuth.js"

const router = new Router()

// Register
// http://localhost:5000/api/auth/register
router.post('/register', register)

// Login
// http://localhost:5000/api/auth/login
router.post('/login', login)

// Get Me
// http://localhost:5000/api/auth/me
router.get('/me', checkAuth, getMe)

export default router