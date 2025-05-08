import jwt from "jsonwebtoken"

export const verifyToken = async (req, res, next) => {
    const token = req.cookies.acces_token
    try {
        if(!token){throw new Error("Any token")}
        const decoded = jwt.verify(token, process.env.SECRET_JWT_KEY)
        req.user = decoded
        next()
    } catch (error) {
        res.status(401).json({message: error.message})
    }
}