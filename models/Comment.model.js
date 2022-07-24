const { Schema, model, Types } = require("mongoose");

const commentSchema = new Schema({
  owner: { type: Types.ObjectId, ref: "User" },
  post: { type: Types.ObjectId, ref: "Post" },
  comment: { type: String, required: true, minlength: 64 },
  likes: [{ type: Types.ObjectId, ref: "User" }],
});

const CommentModel = model("Comment", commentSchema);

module.exports = CommentModel;
