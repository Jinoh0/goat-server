const { Schema, model, Types } = require("mongoose");

const postSchema = new Schema({
  favorite: [{ type: Types.ObjectId, ref: "User" }],
  owner: { type: Types.ObjectId, ref: "User" },
  title: {
    type: String,
    required: true,
    trim: true,
    minLenght: 12,
    maxLength: 48,
  },
  link: { type: String, trim: true },
  img: { type: String, trim: true },
  description: { type: String, required: true, minLength: 64 },
  comments: [{ type: Types.ObjectId, ref: "Comment" }],
});

const PostModel = model("Post", postSchema);

module.exports = PostModel;
