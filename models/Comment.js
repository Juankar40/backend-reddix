import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    edited: { type: Boolean, default: false },
    edited_at: { type: Date }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "comments"
  }
);

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;