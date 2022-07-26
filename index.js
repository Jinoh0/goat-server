require("dotenv").config();
const express = require("express");
const cors = require("cors");
require("./config/db.config")();

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());
app.use(cors({ origin: process.env.REACT_APP_URL }));

const uploadImgRouter = require("./routes/uploadimg.routes");
app.use("/", uploadImgRouter);

const userRouter = require("./routes/user.routes");
app.use("/user", userRouter);

const postRouter = require("./routes/post.routes");
app.use("/post", postRouter);

const commentRouter = require("./routes/comment.routes");
app.use("/comment", commentRouter);

app.listen(Number(process.env.PORT), () => {
  console.log("Server up at port: ", process.env.PORT);
});
