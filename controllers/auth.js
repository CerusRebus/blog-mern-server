import User from "../models/User.js"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Register user
export const register = async (req, res) => {
    try {
        const {username, password} = req.body
        const isUsed = await User.findOne({username})

        if (isUsed) {
            return res.status(200).json({
                success: false,
                message: 'Данный username уже занят.'
            })
        }

        const salt = bcrypt.genSaltSync(10) // сложность хеширования пароля
        const hash = bcrypt.hashSync(password, salt)

        const newUser = new User(
            {
                username,
                password: hash
            }
        )

        const token = jwt.sign(
            {
                id: newUser._id
            },
            process.env.JWT_SECRET,
            {expiresIn: '30d'})

        await newUser.save()

        return res.status(201).json({
            success: true,
            message: 'Регистрация прошла успешно.',
            newUser,
            token
        })
    } catch (error) {
        return res.status(400).json({success: false, message: 'Ошибка при создании нового пользователя.'})
    }
}

// Login user
export const login = async (req, res) => {
    try {
        const {username, password} = req.body
        const user = await User.findOne({username})
        if (!user) {
            return res.status(200).json({success: false, message: 'Такого пользователя не существует.'})
        }
        const isPasswordCorrect = await bcrypt.compare(password, user['password'])
        if (!isPasswordCorrect) {
            return res.status(200).json({success: false, message: 'Неверный пароль.'})
        }

        const token = jwt.sign(
            {
                id: user['_id']
            },
            process.env.JWT_SECRET,
            {expiresIn: '30d'})

        return res.status(200).json({success: true, message: 'Вы вошли в свой аккаунт.', token, user})
    } catch (error) {
        return res.status(400).json({success: false, message: 'Ошибка при авторизации пользователя.'})
    }
}

// Get me
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
        if (!user) {
            return res.status(406).json({success: false, message: 'Такого пользователя не существует.'})
        }

        const token = jwt.sign(
            {
                id: user['_id']
            },
            process.env.JWT_SECRET,
            {expiresIn: '30d'})

        return res.status(200).json({success: true, user, token})

    } catch (error) {
        return res.status(403).json({success: false, message: 'Нет доступа.'})
    }
}