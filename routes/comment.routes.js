
import express from "express"
import * as CommentController from "../controllers/CommentController.js"
import * as authMiddleware from '../middlewares/auth.middleware.js'

const route = express.Router()

// Make sure all handler functions are properly exported from CommentController
route.post("/createComment", authMiddleware.verifyToken, CommentController.createComment)
route.get("/getCommentsByPost/:id", CommentController.getCommentsByPost)
route.put("/updateComment/:id", authMiddleware.verifyToken, CommentController.updateComment)
route.delete("/deleteComment/:id", authMiddleware.verifyToken, CommentController.deleteComment)
route.put("/likeComment/:id", authMiddleware.verifyToken, CommentController.likeComment)
route.put("/dislikeComment/:id", authMiddleware.verifyToken, CommentController.dislikeComment)

export default route