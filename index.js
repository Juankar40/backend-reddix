import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import connectDB from "./config/db.js"
import usersRouter from "./routes/user.route.js"
import postsRouter from "./routes/post.route.js"
import authRouter from "./routes/auth.routes.js"


dotenv.config()
connectDB()

const app = express()
app.use(express.json()) //lee el body de las request y las transforma en un objeto json
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
  }));
app.use(cookieParser()) //middleware para recibir las cookies en cada request
app.use('/uploads', express.static('uploads'));

  

app.get('/', (req, res) => {
    res.send("g")
})

app.use("/", usersRouter)
app.use("/", postsRouter)
app.use("/", authRouter)



const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log("Servidor " + PORT)
})