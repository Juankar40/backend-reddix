import express from "express"
import * as UserController from "../controllers/UserController.js"
import * as auth from "../middlewares/auth.middleware.js"


const route = express.Router()

route.get("/getAllUsers", UserController.getAllUsers)
route.get("/getUserById/:id", UserController.getUserById)
route.get("/getUserByCookie", auth.verifyToken, UserController.getUserByCookie)


route.put("/editUser", auth.verifyToken, UserController.editUser)

route.delete("/deleteUser/:id", auth.verifyToken, UserController.deleteUser)

route.get('/getUserPosts/:id', UserController.getUserPosts)
route.get('/getUserComments/:id', UserController.getUserComments)

export default route
