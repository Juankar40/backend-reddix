// index.js
import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import connectDB from "./config/db.js"
import { Server as SocketServer } from "socket.io"
import http from "http"
import configureSockets from "./socket.js" // 👈 nuevo import

import usersRouter from "./routes/user.route.js"
import postsRouter from "./routes/post.route.js"
import authRouter from "./routes/auth.routes.js"
import commentRouter from "./routes/comment.routes.js"
import searchRouter from "./routes/search.routes.js"

dotenv.config()
connectDB()

const app = express()
const server = http.createServer(app)

const io = new SocketServer(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  }
})

// 👇 Inicializa los sockets
configureSockets(io)

app.use(express.json())
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
app.use(cookieParser())
app.use('/uploads', express.static('uploads'))

app.get('/', (req, res) => res.send("g"))

app.use("/", usersRouter)
app.use("/", postsRouter)
app.use("/", authRouter)
app.use("/", commentRouter)
app.use("/", searchRouter)

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log("Servidor " + PORT)
})
