import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    profileImage: { type: String },
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
    chats: [{
      content: { type: String, required: true },
      from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      timestamp: { type: Date, default: Date.now }
    }]
  },
  {
    timestamps: true,
    collection: "users"
  }
);

const User = mongoose.model("User", userSchema);
export default User;