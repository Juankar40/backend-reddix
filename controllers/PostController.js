import Post from "../models/Post.js"
import User from "../models/User.js"
import multer from "multer"

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./uploads/"); 
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    }
  });
  const upload = multer({ storage });



export const getAllPosts = async (req, res) => {
    try {
      const posts = await Post.find()
        .populate("user_id", "username name") // Solo trae username y name del usuario
  
      res.json(posts);
    } catch (error) {
      console.error("Error al obtener los posts:", error);
      res.status(500).json({ message: "Error interno al obtener los posts." });
    }
};

export const getPostById = async (req, res) => {
    const { id } = req.params;

    try {
        const post = await Post.findById(id).populate("user_id", "username name");

        if (!post) {
            return res.status(404).json({ message: "Post no encontrado." });
        }

        res.status(200).json(post);
    } catch (error) {
        console.error("Error al obtener el post:", error);
        res.status(500).json({ message: "Error interno al obtener el post." });
    }
};
  

export const createPost = [
    upload.single("file"), // "file" debe coincidir con el append() en FormData
    async (req, res) => {
      const { title, description } = req.body;
      const user_id = req.user.id;
  
      try {
        const post = new Post({
          title,
          user_id,
          description,
          votes: { upvotes: [], downvotes: [] },
          file_url: req.file ? req.file.filename : null,
          comments: [],
        });
  
        await post.save();
        await User.findByIdAndUpdate(user_id, { $push: { posts: post._id } });
  
        res.json(post);
      } catch (error) {
        console.error("Error al crear el post:", error);
        res.status(500).json({ message: "Error interno al crear el post." });
      }
    }
  ];

  export const upVote = async (req, res) => {
    const {post_id} = req.body
    const post = await Post.findById(post_id)
    let number = 0
    let voteState = 1


    if(!post.votes.upvotes.includes(req.user.id)){
      post.votes.upvotes.push(req.user.id)
      number = 1
    }
    else{
     post.votes.upvotes = post.votes.upvotes.filter(item => item.toString() !== req.user.id)
     number = -1
     voteState = 0
    }

    if(post.votes.downvotes.includes(req.user.id)){
      post.votes.downvotes = post.votes.downvotes.filter(item => item.toString() !== req.user.id)
      number++
    }

    post.save()

    res.json({number: number, voteState: voteState})

  }

  export const downVote = async (req, res) => {
    const {post_id} = req.body
    const post = await Post.findById(post_id)
    let number = 0
    let voteState = -1


    if(!post.votes.downvotes.includes(req.user.id)){
      post.votes.downvotes.push(req.user.id)
      number = -1
    }
    else{
     post.votes.downvotes = post.votes.downvotes.filter(item => item.toString() !== req.user.id)
     number = 1
     voteState = 0
    }

    if(post.votes.upvotes.includes(req.user.id)){
      post.votes.upvotes = post.votes.upvotes.filter(item => item.toString() !== req.user.id)
      number--
    }

    post.save()

    res.json({number: number, voteState: voteState})
  }

  
export const getVoteState = async (req, res) => {
  const userId = req.user.id;
  const { post_id } = req.body;

  try {
    const post = await Post.findById(post_id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.votes.upvotes.includes(userId)) {
      return res.json({ voteState: 1 });
    }

    if (post.votes.downvotes.includes(userId)) {
      return res.json({ voteState: -1 });
    }

    return res.json({ voteState: 0 });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getPostsByCookie = async (req, res) => {
    try {
        const user_id = req.user.id;

        const user = await User.findById(user_id)

        const posts = await Post.find({ _id: { $in: user.posts } });

        res.status(200).json({ posts: posts });
    } catch (error) {
        console.error("Error al obtener los posts del usuario:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};