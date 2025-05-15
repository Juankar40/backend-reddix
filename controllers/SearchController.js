import Post from "../models/Post.js"

export const searchPosts = async (req, res) => {
  try {
    const query = req.query.query

    if (!query) {
      return res.status(400).json({ error: "Falta el parámetro de búsqueda" })
    }

    const results = await Post.find({
      title: { $regex: query, $options: "i" }
    })

    res.json(results)
  } catch (error) {
    console.error("Error al buscar posts:", error)
    res.status(500).json({ error: "Error en la búsqueda de posts" })
  }
}