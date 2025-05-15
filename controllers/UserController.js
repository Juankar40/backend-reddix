import User from "../models/User.js"
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import multer from "multer";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

export const getAllUsers = async (req, res) => {
    const users = await User.find();
    res.json(users)
}

export const getUserById = async (req, res) => {
    const params = req.params 
    const id = params.id
    try {
        const user = await User.findById(id)
        if(!user){throw new Error("User not found")}
        res.json(user)
    } catch (error) {
        res.status(404).json({message: error.message})
    }
}

export const getUserByUsername = async (req, res) => {
    const { username } = req.params;
    
    try {
        const user = await User.findOne({ username }).select("-password");
        if (!user) throw new Error("User not found");
        const posts = await Post.find({ user_id: user._id });

        const upvotes = posts.reduce((acc, post) => acc + (post.votes?.upvotes?.length || 0), 0);
        const downvotes = posts.reduce((acc, post) => acc + (post.votes?.downvotes?.length || 0), 0);
        const commentCount = posts.reduce((acc, post) => acc + (post.comments?.length || 0), 0);

        res.json({
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                age: user.age,
                postCount: posts.length,
                commentCount,
                upvotes,
                downvotes,
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};


export const getUserByCookie = async (req, res) => {
    try {
        const decoded = jwt.verify(req.cookies.access_token, process.env.SECRET_JWT_KEY);
        const userId = decoded.id;

        const posts = await Post.find({ user_id: userId });
        const user = await User.findById(userId).select("-password");

        const upvotes = posts.reduce((acc, post) => acc + (post.votes?.upvotes?.length || 0), 0);
        const downvotes = posts.reduce((acc, post) => acc + (post.votes?.downvotes?.length || 0), 0);

        const commentCount = posts.reduce((acc, post) => acc + (post.comments?.length || 0), 0);

        res.json({
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                age: user.age,
                postCount: posts.length,
                commentCount,
                upvotes,
                downvotes,
                profileImage: user.profileImage
            }
        });
    } catch (err) {
        console.log(err);
        res.status(401).json({ message: "Invalid token or user" });
    }
};

export const getUserProfileById = async (req, res) => {
    try {
        const userId = req.params.id;

        // Obtener datos básicos del usuario
        const user = await User.findById(userId).select("-password");
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

        // Obtener los posts del usuario
        const posts = await Post.find({ user_id: userId }).populate('votes.upvotes votes.downvotes comments.user');

        // Sumar upvotes y downvotes de los posts
        const upvotes = posts.reduce((acc, post) => acc + (post.votes?.upvotes?.length || 0), 0);
        const downvotes = posts.reduce((acc, post) => acc + (post.votes?.downvotes?.length || 0), 0);

        // Contar los comentarios de los posts
        const commentCount = posts.reduce((acc, post) => acc + (post.comments?.length || 0), 0);

        // Devolver los datos del usuario y sus posts
        res.json({
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                age: user.age,
                postCount: posts.length,
                commentCount,
                upvotes,
                downvotes,
                posts // Devolvemos los posts aquí
            }
        });

    } catch (error) {
        console.error('Error getUserProfileById:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};





export const getUserInteractions = async (req, res) => {
    try {
        const decoded = jwt.verify(req.cookies.access_token, process.env.SECRET_JWT_KEY);
        const userId = decoded.id;

        const user = await User.findById(userId).populate({
            path: 'comments',
            options: { sort: { createdAt: -1 } }
        });

        const commentsWithPosts = await Promise.all(user.comments.map(async comment => {
            const post = await Post.findOne({ comments: comment._id });
            return post ? { comment, post } : null;
        }));

        // Posts upvoted y downvoted
        const upvotedPosts = await Post.find({ "votes.upvotes": userId }).sort({ created_at: -1 });
        const downvotedPosts = await Post.find({ "votes.downvotes": userId }).sort({ created_at: -1 });

        res.json({
            commentsWithPosts: commentsWithPosts.filter(Boolean),
            upvotedPosts,
            downvotedPosts
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch interactions" });
    }
};


export const getUserInterectionsByUsername = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username: username }).populate({
            path: 'comments',
            options: { sort: { createdAt: -1 } }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const commentsWithPosts = await Promise.all(user.comments.map(async comment => {
            const post = await Post.findOne({ comments: comment._id });
            return post ? { comment, post } : null;
        }));

        const upvotedPosts = await Post.find({ "votes.upvotes": user._id }).sort({ created_at: -1 });
        const downvotedPosts = await Post.find({ "votes.downvotes": user._id }).sort({ created_at: -1 });

        res.json({
            commentsWithPosts: commentsWithPosts.filter(Boolean),
            upvotedPosts,
            downvotedPosts
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch interactions" });
    }
};


export const editUser = async (req, res) => {
  const { name, username, password } = req.body;
  const userId = req.user.id; 

  if (!name || !username || !password) {
    return res.status(400).json({ message: 'Faltan datos para actualizar el usuario' });
  }

  try {
    // Cifrar la contraseña si se cambia
    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar el usuario en la base de datos
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { name, username, password: hashedPassword }, 
      { new: true } // Retorna el usuario actualizado
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Usuario actualizado correctamente', updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el usuario' });
  }
};

export const deleteUser = async (req, res) => {
    const userId = req.user.id;  // Suponiendo que el id del usuario está en req.user
    try {
        const user = await User.findById(userId);  // Busca al usuario por el id
        if (!user) {
            throw new Error("User not found");
        }
        await user.deleteOne();  // Elimina el usuario de la base de datos
        res.json({ message: "OK" });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getUserPosts = async (req, res) => {
    const params = req.params 
    const id = params.id
    try {
        const user = await User.findById(id).populate('posts');
        if (!user) {throw new Error("User not found")}
        res.json(user.posts)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}


export const getUserComments = async (req, res) => {
    const params = req.params 
    const id = params.id
    try {
        const user = await User.findById(id).populate('comments');
        if (!user) {throw new Error("User not found")}
        res.json(user.comments);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const updateProfile = async (req, res) => {
  try {
    const { name, username, password } = req.body;
    const user_id = req.user.id;
    const file = req.file;

    const updateData = {
      name,
      username,
    };

    if (password) {
      const hashPassword = await bcrypt.hash(password, parseInt(process.env.SALT_HASH));
      updateData.password = hashPassword;
    }

    if (file) {
      updateData.profileImage = file.filename; 
    }

    const user = await User.findByIdAndUpdate(user_id, updateData, { new: true });

    res.status(200).json({ message: "Perfil actualizado", user });
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};