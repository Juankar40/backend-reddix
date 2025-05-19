import Comment from "../models/Comment.js";
import User from "../models/User.js";
import Post from "../models/Post.js";
import mongoose from "mongoose";

export const createComment = async (req, res) => {
  try {
    const { text, post_id, parent_id } = req.body;
    const user_id = req.user.id;

    if (!text || !post_id) {
      return res.status(400).json({
        message: "Comment text and post ID are required"
      });
    }

    // Check if the post exists
    const postExists = await Post.findById(post_id);
    if (!postExists) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    const commentData = {
      text,
      user: user_id,
      post: post_id,
    };

    // If there's a parent comment, set it and validate
    if (parent_id) {
      const parentComment = await Comment.findById(parent_id);
      if (!parentComment) {
        return res.status(404).json({
          message: "Parent comment not found"
        });
      }
      
      // Check if parent is already a child comment (prevent nested replies beyond one level)
      if (parentComment.parent) {
        return res.status(400).json({
          message: "Cannot reply to a reply"
        });
      }
      
      commentData.parent = parent_id;
    }

    // Create the comment
    const newComment = new Comment(commentData);
    await newComment.save();

    // If this is a reply to another comment, update the parent's children array
    if (parent_id) {
      await Comment.findByIdAndUpdate(
        parent_id,
        { $push: { children: newComment._id } },
        { new: true }
      );
    }

    // Populate user data
    const populatedComment = await Comment.findById(newComment._id)
      .populate({
        path: "user",
        select: "username profileImage"
      });

    res.status(201).json({
      message: "Comment created successfully",
      comment: populatedComment
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({
      message: "Error creating comment",
      error: error.message
    });
  }
};

export const getCommentsByPost = async (req, res) => {
  try {
    const { id } = req.params;

    const comments = await Comment.find({ post: id })
      .populate({
        path: "user",
        select: "username profileImage"
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "user",
            select: "username profileImage"
          },
          {
            path: "likedBy",
            select: "_id"
          },
          {
            path: "dislikedBy",
            select: "_id"
          }
        ]
      })
      .populate("likedBy", "_id")
      .populate("dislikedBy", "_id")
      .sort({ created_at: -1 });

    res.status(200).json({
      comments
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({
      message: "Error fetching comments",
      error: error.message
    });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const user_id = req.user.id;

    if (!text) {
      return res.status(400).json({
        message: "Comment text is required"
      });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found"
      });
    }

    // Only allow the comment creator to update it
    if (comment.user.toString() !== user_id) {
      return res.status(403).json({
        message: "You are not authorized to update this comment"
      });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      { 
        text, 
        edited: true,
        edited_at: new Date() 
      },
      { new: true }
    ).populate({
      path: "user",
      select: "username profileImage"
    });

    res.status(200).json({
      message: "Comment updated successfully",
      comment: updatedComment
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({
      message: "Error updating comment",
      error: error.message
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        message: "Comment not found"
      });
    }

    // Only allow the comment creator to delete it
    if (comment.user.toString() !== user_id) {
      return res.status(403).json({
        message: "You are not authorized to delete this comment"
      });
    }

    // If this comment has a parent, remove this comment from parent's children array
    if (comment.parent) {
      await Comment.findByIdAndUpdate(
        comment.parent,
        { $pull: { children: comment._id } }
      );
    }

    // Handle any children of this comment
    // Option 1: Delete all child comments (cascade delete)
    if (comment.children && comment.children.length > 0) {
      await Comment.deleteMany({ _id: { $in: comment.children } });
    }
    
    // Finally delete the comment itself
    await Comment.findByIdAndDelete(id);

    res.status(200).json({
      message: "Comment deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      message: "Error deleting comment",
      error: error.message
    });
  }
};

export const likeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        message: "Comment not found"
      });
    }

    // Check if user already liked the comment
    const alreadyLiked = comment.likedBy.includes(user_id);
    
    // Check if user already disliked the comment
    const alreadyDisliked = comment.dislikedBy.includes(user_id);

    let updateOperation = {};

    if (alreadyLiked) {
      // If already liked, remove the like (toggle off)
      updateOperation = {
        $inc: { likes: -1 },
        $pull: { likedBy: user_id }
      };
    } else {
      // Add like
      updateOperation = {
        $inc: { likes: 1 },
        $push: { likedBy: user_id }
      };
      
      // If previously disliked, remove the dislike
      if (alreadyDisliked) {
        updateOperation.$inc.dislikes = -1;
        updateOperation.$pull = { ...updateOperation.$pull, dislikedBy: user_id };
      }
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      updateOperation,
      { new: true }
    ).populate({
      path: "user",
      select: "username profileImage"
    });

    res.status(200).json({
      message: alreadyLiked ? "Like removed" : "Comment liked",
      comment: updatedComment
    });
  } catch (error) {
    console.error("Error liking comment:", error);
    res.status(500).json({
      message: "Error processing like",
      error: error.message
    });
  }
};

export const dislikeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        message: "Comment not found"
      });
    }

    // Check if user already disliked the comment
    const alreadyDisliked = comment.dislikedBy.includes(user_id);
    
    // Check if user already liked the comment
    const alreadyLiked = comment.likedBy.includes(user_id);

    let updateOperation = {};

    if (alreadyDisliked) {
      // If already disliked, remove the dislike (toggle off)
      updateOperation = {
        $inc: { dislikes: -1 },
        $pull: { dislikedBy: user_id }
      };
    } else {
      // Add dislike
      updateOperation = {
        $inc: { dislikes: 1 },
        $push: { dislikedBy: user_id }
      };
      
      // If previously liked, remove the like
      if (alreadyLiked) {
        updateOperation.$inc.likes = -1;
        updateOperation.$pull = { ...updateOperation.$pull, likedBy: user_id };
      }
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      updateOperation,
      { new: true }
    ).populate({
      path: "user",
      select: "username profileImage"
    });

    res.status(200).json({
      message: alreadyDisliked ? "Dislike removed" : "Comment disliked",
      comment: updatedComment
    });
  } catch (error) {
    console.error("Error disliking comment:", error);
    res.status(500).json({
      message: "Error processing dislike",
      error: error.message
    });
  }
};