import express from 'express'
import * as authController from '../controllers/auth.controller.js'
import * as authMiddleware from '../middlewares/auth.middleware.js'

const router = express.Router()


router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/logout', authController.logout)

router.get("/check-auth", authMiddleware.checkToken);

export default router