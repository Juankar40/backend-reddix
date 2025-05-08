import jwt from "jsonwebtoken"

export const verifyToken = async (req, res, next) => {
    const token = req.cookies.access_token;
    console.log("Token recibido:", token);  // Verifica que el token esté presente

    try {
        if (!token) {
            throw new Error("Any token");
        }
        
        const decoded = jwt.verify(token, process.env.SECRET_JWT_KEY);
        console.log("Token decodificado:", decoded);  // Imprime el contenido del token

        req.user = decoded;
        next();
    } catch (error) {
        console.error("Error al verificar el token:", error);  // Agrega un log detallado de los errores
        res.status(401).json({ message: error.message });
    }
};
