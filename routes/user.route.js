import express from "express"
import * as UserController from "../controllers/UserController.js"
import * as auth from "../middlewares/auth.middleware.js"
import { upload } from "../config/multer.js"

const route = express.Router()

route.get("/getAllUsers", UserController.getAllUsers)
route.get("/getUserById/:id", UserController.getUserById)
route.get("/getUserByUsername/:username", UserController.getUserByUsername)
route.get("/getUserByCookie", auth.verifyToken, UserController.getUserByCookie)

route.get("/getUserInteractions", auth.verifyToken, UserController.getUserInteractions);
route.get("/getUserInteractionsByUsername/:username", UserController.getUserInterectionsByUsername);



route.put('/updateProfile', auth.verifyToken, upload.single('file'), UserController.updateProfile);

route.delete("/deleteAccount", auth.verifyToken, UserController.deleteUser)

route.get('/getUserPosts/:id', UserController.getUserPosts)
route.get('/getUserComments/:id', UserController.getUserComments)

export default route
