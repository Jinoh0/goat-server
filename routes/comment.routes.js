const router = require("express").Router();
const UserModel = require("../models/User.model");
const PostModel = require("../models/Post.model");

const isAuth = require("../middlewares/isAuth");
const attachCurrentUser = require("../middlewares/attachCurrentUser");
const CommentModel = require("../models/Comment.model");

router.post(
  "/:postId/create-comment",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const { postId } = req.params;
      const loggedInUser = req.currentUser;
      const createdComment = await CommentModel.create({
        ...req.body,
        owner: loggedInUser._id,
        post: postId,
      });

      await UserModel.findOneAndUpdate(
        { _id: loggedInUser._id },
        { $push: { commentList: createdComment } }
      );

      await PostModel.findOneAndUpdate(
        { _id: postId },
        { $push: { comments: createdComment } }
      );

      return res.status(200).json(createdComment);
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
  }
);

router.get("/:postId/all-comments", async (req, res) => {
  try {
    const { postId } = req.params;
    const allComments = await PostModel.findOne({ _id: postId })
      .populate("comments")
      .populate("owner")
      .populate("post");

    return res.status(200).json(allComments);
  } catch (error) {
    console.error(error);
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
      const comment = await CommentModel.findOne({ _id: commentId });
      const body = { ...req.body };

      const updatedComment = await CommentModel.findOneAndUpdate(
        { _id: comment._id },
        { ...body },
        { new: true, runValidators: true }
      );
      return res.status(200).json(updatedComment);
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
  }
);

router.patch(
  "/like/:commentId",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const loggedInUser = req.currentUser;
      const { commentId } = req.params;
      const comment = await CommentModel.findOne({ _id: commentId });

      if (comment.likes.includes(loggedInUser._id)) {
        const unLike = await CommentModel.findOneAndUpdate(
          { _id: commentId },
          { $pull: { likes: loggedInUser._id } },
          { new: true, runValidators: true }
        );
        return res.status(200).json(unLike);
      }

      const likeComment = await CommentModel.findOneAndUpdate(
        { _id: commentId },
        { $push: { likes: loggedInUser._id } },
        { new: true, runValidators: true }
      );

      return res.status(200).json(likeComment);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }
);

router.delete(
  "/delete/:commentId",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const { commentId } = req.params;
      const loggedInUser = req.currentUser;
      const comment = await CommentModel.findOne({ _id: commentId });
      const deletedComment = await CommentModel.deleteOne({
        _id: commentId,
      });

      await PostModel.updateMany(
        { comments: commentId },
        { $pull: { comments: commentId } }
      );

      await UserModel.findOneAndUpdate(
        { _id: loggedInUser._id },
        { $pull: { commentList: commentId } },
        { runValidators: true }
      );

      return res.status(200).json(deletedComment);
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
  }
);

module.exports = router;
