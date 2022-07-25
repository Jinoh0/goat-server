const { Schema, Types, model } = require("mongoose");

const postSchema = new Schema({
  favorite: [{ type: Types.ObjectId, ref: "User" }], //ver depois como ficara
  owner: { type: Types.ObjectId, ref: "User" },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 12,
    maxlength: 48,
  },
  link: { type: String, trim: true },
  img: { type: String, trim: true },
  description: { type: String, required: true, minLength: 64 },
  comments: [{ type: Types.ObjectId, ref: "Comment" }],
});

const PostModel = model("Post", postSchema);

module.exports = PostModel;
