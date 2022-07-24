const router = require("express").Router();
const PostModel = require("../models/Post.model");
const isAuth = require("../middlewares/isAuth");
const attachCurrentUser = require("../middlewares/attachCurrentUser");
const UserModel = require("../models/User.model");
const CommentModel = require("../models/Comment.model");

const saltRounds = 10;

router.post("/create-post", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const loggedInUser = req.currentUser;

    const createdPost = await PostModel.create({
      ...req.body,
      owner: loggedInUser._id,
    });

    await UserModel.findOneAndUpdate(
      { _id: loggedInUser._id },
      { $push: { postList: createdPost._id } }
    );

    return res.status(201).json(createdPost);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
});

router.get("/my-posts", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const loggedInUser = req.currentUser;
    const userPosts = await PostModel.find(
      { owner: loggedInUser._id },
      { comments: 0 }
    );
    return res.status(200).json(userPosts);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
});

router.get("/all-posts", async (req, res) => {
  try {
    const loggedInUser = req.currentUser;

    const userPosts = await PostModel.find(req.body);
    return res.status(200).json(userPosts);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
});

router.get("/:postId", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const { postId } = req.params;
    const loggedInUser = req.currentUser;
    const post = await PostModel.findOne({ _id: postId });

    return res.status(200).json(post);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});
module.exports = router;

router.patch("/edit/:postId", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const { postId } = req.params;
    const loggedInUser = req.currentUser;
    const body = { ...req.body };
    delete body.comments;
    const post = await PostModel.findOne({ _id: postId });

    if (String(post.owner) !== String(loggedInUser._id)) {
      return res.status(401).json({ message: "Você não é dono desse post" });
    }

    const editedPost = await PostModel.findOneAndUpdate(
      { _id: postId },
      { ...body },
      { new: true, runValidators: true }
    );
    return res.status(200).json(editedPost);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

router.delete(
  "/delete/:postId",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const { postId } = req.params;
      const loggedInUser = req.currentUser;

      const post = await PostModel.findOne({
        _id: postId,
      });
      if (String(post.owner) !== String(loggedInUser._id)) {
        return res.status(401).json({ message: "Você não é dono do post" });
      }

      const deletedPost = await PostModel.deleteOne({
        _id: postId,
      });

      // await CommentModel.updateMany(
      //   { post: postId },
      //   { $pull: { post: postId } }
      // );

      const deletedPostComments = post.comments;

      console.log(post);
      await CommentModel.deleteOne({ deletedPostComments });

      //retirar os comentários deletados de dentro do commentList de todos usuários

      //tirando o post do usuário criador do post
      await UserModel.findOneAndUpdate(
        { _id: loggedInUser._id },
        { $pull: { postList: postId } },
        { runValidators: true }
      );

      return res.status(200).json(deletedPost);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }
);

module.exports = router;

//await usermodel.findone if there is id pull
//quando post da delete , tem que ir no favortie list de todos e retirar
