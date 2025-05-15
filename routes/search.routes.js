import express from "express"
import * as SearchController from "../controllers/SearchController.js"

const route = express.Router()

// Ruta para buscar posts por título
route.get("/searchPosts", SearchController.searchPosts)

export default route