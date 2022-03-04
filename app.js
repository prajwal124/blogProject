const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const lodash = require("lodash");
const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://prajwal124:testpassword@cluster0.lxzzk.mongodb.net/blogDB"
);

//create blog schema
const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please Enter the Title Name!"], //validation where Title is must required.
  },
  body: {
    type: String,
    required: [true, "Post Body Cannot be Blank!"], //validation where Post Body is must required.
  },
});

//creates a new collection blog in blogDB with blogSchema
const blogItem = mongoose.model(`blog`, blogSchema);

//Global Array to Hold Posts
// let globalPostsArray = [];

const homeStartingContent =
  "This is a simple Blog app where you can write Articles / post etc";
const aboutStartingContent =
  "Hi, I am Prajwal. I am a full time Software Engineer from Bengaluru,India. I am also learning Web Development and Blockchain Development. This Web Site is created using NodeJs, BootStrap, MongoDB";
const contactStartingContent =
  "Created By Prajwal N ©2022 . Contact me for any queries/projects/partnership -> razer124@gmail.com";

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//DISPLAY POSTS BY ID
app.get("/posts/:postid", (req, res) => {
  //to access the url id the user typed  http://localhost:3000/posts/1, grabs 1
  // http://localhost:3000/posts/new, grabs new
  let postId = req.params.postid;
  // console.log(req.params);
  blogItem.findOne({ _id: postId }, (err, data) => {
    if (err) console.log(err);
    else {
      res.render(`post`, {
        postTitle: data.title,
        postBody: data.body,
      });
    }
  });

  // let renderFlag = 0;
  //Render the Page according to the post index/array index
  // if (i < globalPostsArray.length) {
  //   res.render(`post`, {
  //     postTitle: globalPostsArray[i].postTitle,
  //     postBody: globalPostsArray[i].postBody,
  //   });
  //   renderFlag = 1;
  // }
  // //Render the Page according to the Post title
  // else {
  //   globalPostsArray.forEach((element) => {
  //     if (element.postTitle === lodash.upperFirst(lodash.lowerCase(i))) {
  //       res.render(`post`, {
  //         postTitle: element.postTitle,
  //         postBody: element.postBody,
  //       });
  //       renderFlag = 1;
  //     }
  //   });
  // }

  // //if post doesnt exist, redner no posts found
  // if (renderFlag === 0) {
  //   res.render(`post`, {
  //     postTitle: "No Posts Found",
  //     postBody: "",
  //   });
  // }
});

//DISPLAY HOME
app.get("/", (req, res) => {
  let displayItems = [];
  blogItem.find({}, (err, data) => {
    res.render(`home`, {
      homeContent: homeStartingContent,
      postsArray: data,
    });
  });
});

//DISPLAY ABOUT US
app.get("/about", (req, res) => {
  res.render(`about`, { aboutContent: aboutStartingContent });
});

//DISPLAY CONTACT
app.get("/contact", (req, res) => {
  res.render(`contact`, { contactContent: contactStartingContent });
});

//DISPLAY COMPOSE
app.get("/compose", (req, res) => {
  res.render(`compose`);
});

//POST REQUEST FROM COMPOSE
app.post("/compose", (req, res) => {
  const newPost = {
    postTitle: lodash.upperFirst(lodash.lowerCase(req.body.postTitle)),
    postBody: req.body.postBody,
  };
  //globalPostsArray.push(newPost);

  blogItem.insertMany(
    {
      title: newPost.postTitle,
      body: newPost.postBody,
    },
    (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Post Added to DB, PostTitle: ${newPost.postTitle}`);
      }
    }
  );

  //CONSOLE LOGGING NEW POST ADDED
  //console.log(`New Post Added ${globalPostsArray.length - 1}`);
  //REDIRECTING TO HOME PAGE
  res.redirect("/");
});

//app listeing to port 3000 or dynamic port
app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running at port 3000...");
});
