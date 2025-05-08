import User from "../models/User.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"


export const register = async (req, res) => {
    const {username, name, age, email, password} = req.body

    try {
        
        if(await User.findOne({username : username})){throw new Error("Username already exist")}
        if(await User.findOne({email : email})){throw new Error("Email already exist")}

        const hashPassword = await bcrypt.hash(password, parseInt(process.env.SALT_HASH))

        const user = new User({
            username : username,
            name : name,
            age : age,
            email : email,
            password : hashPassword,
            posts : [],
            comments : []
        })
    
        await user.save()
    
        res.json({message: "User registered succesful"})
    } catch (error) {
        res.status(409).json({message: error.message})
    }
    
}

export const login = async (req, res) => {
    const {email, password} = req.body
    
    try {
        const user = await User.findOne({email : email})
        if(!user){throw new Error("User not found")}  

        const isValid = await bcrypt.compare(password, user.password)
        if(!isValid) throw new Error("Password incorrect")

        const token = jwt.sign(
            {id: user.id, username: user.username, name: user.name, age: user.age, posts: user.posts, comments: user.comments},
            process.env.SECRET_JWT_KEY,
            {
                expiresIn: '3h',
            }
        )

        res.cookie('acces_token', token, {httpOnly: true, secure: false}).send("cookie metida")

        
    } catch (error) {
        res.status(401).json({message : error.message})
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('acces_token', {httpOnly: true, secure: false}).json({message : "cookie deleted"})
    } catch (error) {
        res.status(500).json({message : error.message})
    }
}