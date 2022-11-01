import {Router} from "express"

import {checkAuth} from "../utils/checkAuth.js"
import {createComment, removeComment, updateComment, getCommentById} from "../controllers/comments.js"

const router = new Router()

// Create Comment
// http://localhost:5000/api/comments/:id
router.post('/:id', checkAuth, createComment)

// Get Comment By Id
// http://localhost:5000/api/comments/:id
router.get('/:id', getCommentById)

// Update Comment
// http://localhost:5000/api/comments/:id
router.put('/:id', checkAuth, updateComment)

// Remove Comment
// http://localhost:5000/api/comments/:id
router.delete('/:id', checkAuth, removeComment)

export default router
