import express from "express"
import * as UserController from "../controllers/UserController.js"
import * as auth from "../middlewares/auth.middleware.js"
import { upload } from "../config/multer.js"
import User from "../models/User.js"

const route = express.Router()

route.get("/getAllUsers", UserController.getAllUsers)
route.get("/getUserById/:id", UserController.getUserById)
route.get("/getUserByUsername/:username", UserController.getUserByUsername)
route.get("/getUserByCookie", auth.verifyToken, UserController.getUserByCookie)

route.get("/getChatHistory/:id", auth.verifyToken, UserController.getChatHistory)

route.get("/getUserInteractions", auth.verifyToken, UserController.getUserInteractions);
route.get("/getUserInteractionsByUsername/:username", UserController.getUserInterectionsByUsername);

route.get("/checkFollowStatus/:username", auth.verifyToken, UserController.checkFollowStatus)
route.get("/getFollowedUsers", auth.verifyToken, UserController.getFollowedUsers)
route.get("/getFollowers", auth.verifyToken, UserController.getFollowers)
route.get("/getFollowedUsers/:username", UserController.getFollowedUsersByUsername)
route.get("/getFollowers/:username", UserController.getFollowersByUsername)
route.post("/followUser/:username", auth.verifyToken, UserController.followUser)
route.post("/unfollowUser/:username", auth.verifyToken, UserController.unfollowUser)



route.put('/updateProfile', auth.verifyToken, upload.single('file'), UserController.updateProfile);

route.delete("/deleteAccount", auth.verifyToken, UserController.deleteUser)

route.get('/getUserPosts/:id', UserController.getUserPosts)
route.get('/getUserComments/:id', UserController.getUserComments)

export default route
