import Comment from "../models/Comment.js"
import Post from "../models/Post.js"

// Get Comment By ID
export const getCommentById = async (req, res) => {
    try {
        const {params: {id}} = req
        const comment = await Comment.findById(id)
        return res.status(200).json({success: true, comment: comment})
    } catch (error) {
        return res.status(400).json({
            success: false, message: error
        })
    }
}

// Create Comment
export const createComment = async (req, res) => {
    try {
        const {postId, comment} = req.body
        if (!comment) return res.status(200).json({success: false, message: "Комментарий не может быть пустым."})

        const newComment = new Comment({comment})
        await newComment.save()

        try {
            await Post.findByIdAndUpdate(postId, {
                $push: {comments: newComment._id}
            })
        } catch (error) {
            return console.log(error)
        }

        return res.status(201).json({success: true, message: 'Комментарий успешно был добавлен.', newComment: newComment})

    } catch (error) {
        return res.status(400).json({success: false, message: error})
    }
}

// Update Comment
export const updateComment = async (req, res) => {
    try {
        const {id, comment} = req.body

        const newComment = await Comment.findById(id)
        newComment.comment = comment
        await newComment.save()
        // console.log(newComment);
        return res.status(200).json({success: true, message: 'Комментарий был изменен.', comment: newComment})
    } catch (error) {
        return res.status(400).json({
            success: false, message: error
        })
    }

}

// Remove Comment
export const removeComment = async (req, res) => {
    try {
        const {commentId, postId} = req.body
        const comment = await Comment.findByIdAndDelete(commentId)
        if (!comment) return res.status(400).json({success: false, message: 'Такого комментария не существует.'})
        try {
            await Post.findByIdAndUpdate(postId, {
                $pull: {comments: commentId}
            })
        } catch (error) {
            return console.log(error)
        }
        return res.status(200).json({success: true, message: 'Комментарий был успешно удален.', comment: comment})
    } catch (error) {
        return res.status(400).json({success: false, message: error})
    }
}
