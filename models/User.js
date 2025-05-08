import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    },
    { 
        timestamps: true,
        collection: "users" //define la coleccion
    },

);

const User = mongoose.model("User", userSchema); //le da a User los metodos de mongo para acceder a los datos en la tabla users
export default User;
