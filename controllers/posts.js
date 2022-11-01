import path, {dirname} from "path"
import {fileURLToPath} from "url"

import Post from "../models/Post.js"
import User from "../models/User.js"
import Comment from "../models/Comment.js"

// Create Post
export const createPost = async (req, res) => {
    try {
        const {title, text} = req.body
        const user = await User.findById(req.userId)
        if (req.files) {
            let fileName = Date.now().toString() + req.files.image.name // create name image
            const __dirname = dirname(fileURLToPath(import.meta.url)) // path current directory
            await req.files.image.mv(path.join(__dirname, '..', 'uploads', fileName)) // moves image to directory "uploads"
            const newPostWithImage = new Post({
                username: user['username'], title, text, imgUrl: fileName, author: req.userId
            })
            await newPostWithImage.save()
            await User.findByIdAndUpdate(req.userId, {
                $push: {posts: newPostWithImage}
            })
            return res.status(201).json({success: true, message: 'Пост успешно добавлен.', post: newPostWithImage})
        }

        const newPostWithoutImage = new Post({
            username: user['username'], title, text, imgUrl: '', author: req.userId
        })
        await newPostWithoutImage.save()
        await User.findByIdAndUpdate(req.userId, {
            $push: {posts: newPostWithoutImage}
        })
    } catch (error) {
        return res.status(400).json({
            success: false, message: 'Ошибка при создании поста.'
        })
    }
}

// Get All Posts
export const getAll = async (req, res) => {
    try {
        const posts = await Post.find().sort('-createdAt')
        const popularPosts = await Post.find().limit(5).sort('-views')
        if (!posts) {
            return res.status(200).json({success: false, message: 'Постов нет.'})
        }
        return res.status(200).json({success: true, posts: posts, popularPosts: popularPosts})
    } catch (error) {
        return res.status(400).json({
            success: false, message: 'Ошибка при получении постов.'
        })
    }
}

// Get Post By ID
export const getPostById = async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, {
            $inc: {views: 1}
        })
        return res.status(200).json({success: true, post: post})
    } catch (error) {
        return res.status(400).json({
            success: false, message: error
        })
    }
}

// Get All My Posts
export const getMyPosts = async (req, res) => {
    try {
        const posts = await Post.find({author: req.userId})
        return res.status(200).json({success: true, posts: posts})
    } catch (error) {
        return res.status(400).json({
            success: false, message: error
        })
    }
}

// Remove Post
export const removePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id)
        if (!post) return res.status(400).json({success: false, message: 'Такого поста не существует.'})
        await Promise.all(post?.['comments'].map(async comment => await Comment.findByIdAndDelete(comment._id)))
        try {
            await User.findByIdAndUpdate(req.userId, {
                $pull: {posts: req.params.id}
            })
        } catch (error) {
            return console.log(error)
        }
        return res.status(200).json({success: true, post: post, message: 'Пост был удален.',})
    } catch (error) {
        return res.status(400).json({success: false, message: error})
    }
}

// Update Post
export const updatePost = async (req, res) => {
    try {
        const {title, text, id} = req.body
        const post = await Post.findById(id)

        if (req.files) {
            let fileName = Date.now().toString() + req.files.image.name // create name image
            const __dirname = dirname(fileURLToPath(import.meta.url)) // path current directory
            req.files.image.mv(path.join(__dirname, '..', 'uploads', fileName)) // moves image to directory "uploads"
            post.imgUrl = fileName || ''
        }
        post.title = title
        post.text = text
        await post.save()
        return res.status(200).json({success: true, message: 'Пост был обновлен.', post: post})
    } catch (error) {
        return res.status(400).json({
            success: false, message: error
        })
    }
}

// Get Post Comments
export const getPostComments = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        const comments = await Promise.all(post['comments'].map((comment) => {
            return Comment.findById(comment)
        }))
        return res.status(200).json({success: true, comments: comments})
    } catch (error) {
        return res.status(400).json({
            success: false, message: error
        })
    }
}