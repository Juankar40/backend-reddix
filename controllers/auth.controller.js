import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const register = async (req, res) => {
  const { username, name, email, password } = req.body;

  try {
    if (await User.findOne({ username })) throw new Error("Username already exists");
    if (await User.findOne({ email })) throw new Error("Email already exists");

    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_HASH));

    const user = new User({ username, name, email, password: hashedPassword });
    await user.save();

    // Llamar al script de envío de correo
    const scriptPath = path.resolve(__dirname, '../scripts/send_email.py');
    execFile('python3', [scriptPath, email, name], (error, stdout, stderr) => {
      if (error) console.error(`Email script error: ${error}`);
      if (stderr) console.error(`stderr: ${stderr}`);
      console.log(`stdout: ${stdout}`);
    });

    res.json({ message: "User registered successfully" });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

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

        res.cookie('access_token', token, {
            httpOnly: true,
            secure: true, // ← true en producción HTTPS (como en Render)
            sameSite: 'None'
          }).json({ message: "Login exitoso" });

        
    } catch (error) {
        res.status(401).json({message : error.message})
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('access_token', {httpOnly: true, secure: false}).json({message : "cookie deleted"})
    } catch (error) {
        res.status(500).json({message : error.message})
    }
}