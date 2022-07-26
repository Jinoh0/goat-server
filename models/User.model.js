const { Schema, Types, model, default: mongoose } = require("mongoose");

const userSchema = new Schema({
  userName: { type: String, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  },
  bio: { type: String, maxlength: 128, trim: true },
  favoriteList: [{ type: Types.ObjectId, ref: "Post" }],
  commentList: [{ type: Types.ObjectId, ref: "Comment" }], 
  postList: [{ type: Types.ObjectId, ref: "Post" }],
  passwordHash: { type: String, required: true },
  img: { type: String },
  role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },
  isActive: { type: Boolean, default: true },
  disabledOn: { type: Date },
});

const UserModel = model("User", userSchema);

module.exports = UserModel;
