const router = require("express").Router();
const CommentModel = require("../models/Comment.model");
const isAuth = require("../middlewares/isAuth");
const attachCurrentUser = require("../middlewares/attachCurrentUser");
const UserModel = require("../models/User.model");
const PostModel = require("../models/Post.model");

router.post(
  "/:postId/create-comment",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const { postId } = req.params;
      const loggedInUser = req.currentUser;
      const comment = await CommentModel.create({
        ...req.body,
        owner: loggedInUser._id,
        post: postId,
      });
      const user = await UserModel.findOneAndUpdate(
        { _id: loggedInUser._id },
        { $push: { commentList: comment } }
      );

      const post = await PostModel.findOneAndUpdate(
        { _id: postId },
        { $push: { comments: comment } }
      );
      return res.status(201).json(comment);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }
);

router.get("/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await PostModel.findOne({ _id: postId }).populate(
      "comments"
    );

    return res.status(200).json(comments);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

router.patch(
  "/edit/:commentId",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const { commentId } = req.params;
      const loggedInUser = req.currentUser;
      const editedComment = await CommentModel.findOneAndUpdate(
        { _id: commentId },
        { ...req.body },
        { new: true, runValidators: true }
      );
      return res.status(200).json(editedComment);
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }
);

router.delete(
  "/delete/:commentId",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const loggedInUser = req.currentUser;
      const { commentId } = req.params;
      const comment = await CommentModel.findOne({ _id: commentId });
      if (String(comment.owner) !== String(loggedInUser._id)) {
        return res
          .status(401)
          .json({ message: "Você não é dono desse comentário" });
      }
      const deletedComment = await CommentModel.deleteOne({ _id: commentId });

      await PostModel.findOneAndUpdate(
        { _id: comment.post._id },
        { $pull: { comments: commentId } },
        { runValidators: true }
      );

      await UserModel.findOneAndUpdate(
        { _id: loggedInUser._id },
        { $pull: { commentList: commentId } },
        { runValidators: true }
      );

      return res.status(200).json(deletedComment);
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }
);

module.exports = router;
