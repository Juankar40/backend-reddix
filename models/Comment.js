import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
    collection: "comments"
  }
);

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
  