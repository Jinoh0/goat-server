const router = require("express").Router();
const UserModel = require("../models/User.model");
const PostModel = require("../models/Post.model");

const isAuth = require("../middlewares/isAuth");
const attachedCurrentUser = require("../middlewares/attachCurrentUser");
const CommentModel = require("../models/Comment.model");

router.post(
  "/:postId/create-comment",
  isAuth,
  attachedCurrentUser,
  async (req, res) => {
    try {
      const { postId } = req.params;
      const loggedInUser = req.currentUser;
      const createdComment = await CommentModel.create({
        ...req.body,
        owner: loggedInUser._id,
        post: postId,
      });

      console.log(req);
      await UserModel.findOneAndUpdate(
        { _id: loggedInUser._id },
        { $push: { commentList: createdComment } }
      );

      await PostModel.findOneAndUpdate(
        { _id: postId },
        { $push: { comments: createdComment } }
      );

      console.log(req.body);
      // if (!req.body.post || req.body.post == {}) {
      //   return res
      //     .status(400)
      //     .json({ message: "o comment precisa de um post" });
      // }
      //porque o teste ta dando errado toda hroa?
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
    const allComments = await PostModel.findOne({ _id: postId }).populate(
      "comments"
    );

    return res.status(200).json(allComments);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
});

router.patch(
  "/edit/:commentId",
  isAuth,
  attachedCurrentUser,
  async (req, res) => {
    try {
      const { commentId } = req.params;
      const loggedInUser = req.currentUser;
      const comment = await CommentModel.findOne({ _id: commentId });
      const body = { ...req.body };
      console.log(body);
      // delete body.comment;
      //pq nao precisa disso? KAREN

      console.log(commentId);

      // if (comment.owner !== loggedInUser._id) {
      //   return res
      //     .status(401)
      //     .json({ msg: "Voce nao pode alterar esse album" });
      // }

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

router.delete(
  "/delete/:commentId",
  isAuth,
  attachedCurrentUser,
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
