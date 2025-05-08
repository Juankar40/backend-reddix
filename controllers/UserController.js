import User from "../models/User.js"
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

import jwt from "jsonwebtoken"

export const getAllUsers = async (req, res) => {
    const users = await User.find();
    res.json(users)
}

export const getUserById = async (req, res) => {
    const params = req.params //obtenemos los parametros del get
    const id = params.id
    try {
        const user = await User.findById(id)
        if(!user){throw new Error("User not found")}
        res.json(user)
    } catch (error) {
        res.status(404).json({message: error.message})
    }
}

export const getUserByCookie = async (req, res) => {
    const token = req.cookies.acces_token
    res.json({user: jwt.verify(token, process.env.SECRET_JWT_KEY)})
}


export const editUser = async (req, res) => {
    res.send(req.body)
}

export const deleteUser = async (req, res) => {
    const params = req.params 
    const id = params.id
    try {
        const user = await User.findById(id)
        if(!user){throw new Error("User not found")}
        await user.deleteOne()
        res.json({message: "OK"})
    } catch (error) {
        res.status(404).json({message: error.message})
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