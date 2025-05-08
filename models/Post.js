import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String },
    votes: {
      upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
    },
    file_url: { type: String },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
    collection: "posts"
  }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
