require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const lodash = require("lodash");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require(`passport`);
const passportLocalMongoose = require(`passport-local-mongoose`);

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: process.env.PASSPORT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(
  "mongodb+srv://prajwal124:testpassword@cluster0.lxzzk.mongodb.net/blogDB"
);
//mongoose.connect("mongodb://localhost:27017/blogDB");

const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
});

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
  userPosted: String,
});

userSchema.plugin(passportLocalMongoose);

//creates a new collection blog in blogDB with blogSchema
const blogItem = mongoose.model(`blog`, blogSchema);
const userModel = mongoose.model(`users`, userSchema);

//Global Array to Hold Posts
// let globalPostsArray = [];

passport.use(userModel.createStrategy());
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

const homeStartingContent =
  "This is a simple Blog app where you can write Articles / post etc";
const aboutStartingContent =
  "Hi, I am Prajwal. I am a full time Software Engineer from Bengaluru,India. I am also learning Web Development and Blockchain Development. This Web Site is created using NodeJs, BootStrap, MongoDB";
const contactStartingContent =
  "Created By Prajwal N ©2022 . Contact me for any queries/projects/partnership -> razer124@gmail.com";

app.get(`/register`, (req, res) => {
  res.render(`register`);
});

app.post(`/register`, (req, res) => {
  if (req.body.password === req.body.repeatPassword) {
    userModel.register(
      new userModel({ name: req.body.name, username: req.body.username }),
      req.body.password,
      function (err, user) {
        if (err) {
          console.log(err);
          res.send(err);
        }
        passport.authenticate("local")(req, res, () => {
          res.render(`home`, {
            homeContent: homeStartingContent,
            postsArray: {},
          });
        });
      }
    );
    // userModel.insertMany(
    //   {
    //     name: newUserReg.name,
    //     username: newUserReg.username,
    //     password: newUserReg.password,
    //   },
    //   (err, docs) => {
    //     if (err) {
    //       console.log(err);
    //     } else {
    //       console.log(docs);
    //       res.redirect(`/login`);
    //     }
    //   }
    // );
  } else {
    res.send(
      `<h1>passwords dont match</h1><br><a href ="/register"> <h3>Please click here to go back!</h3></a>`
    );
  }
});
app.get(`/login`, (req, res) => {
  res.render(`login`);
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect(`/`);
});

app.get("/posts/logout", (req, res) => {
  req.logout();
  res.redirect(`/`);
});

app.get("/posts/about", (req, res) => {
  res.redirect(`/about`);
});

app.get("/posts/contact", (req, res) => {
  res.redirect(`/contact`);
});

app.post("/login", passport.authenticate("local"), function (req, res) {
  const user = new userModel({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      res.render(`home`, {
        homeContent: homeStartingContent,
        postsArray: {},
      });
    }
  });
});

// app.post(`/login`, (req, res) => {
//   const userCred = {
//     username: req.body.username,
//     password: req.body.password,
//   };
//   userModel.findOne({ username: userCred.username }, (err, result) => {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log(result);
//       if (result.password === userCred.password) {
//         res.render(`home`, {
//           homeContent: homeStartingContent,
//           postsArray: {},
//         });
//       } else {
//         res.redirect(`login`);
//       }
//     }
//   });
//   console.log(userCred);
// });

//DISPLAY POSTS BY ID
app.get("/posts/:postid", (req, res) => {
  res.set(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stal e=0, post-check=0, pre-check=0"
  );
  if (req.isAuthenticated()) {
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
  } else {
    res.redirect("/login");
  }

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
  res.set(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stal e=0, post-check=0, pre-check=0"
  );
  if (req.isAuthenticated()) {
    let displayItems = [];
    blogItem.find({ userPosted: req.user.username }, (err, data) => {
      res.render(`home`, {
        homeContent: homeStartingContent,
        postsArray: data,
      });
    });
  } else {
    res.redirect("/login");
  }
});

//DISPLAY ABOUT US
app.get("/about", (req, res) => {
  res.set(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stal e=0, post-check=0, pre-check=0"
  );
  if (req.isAuthenticated()) {
    res.render(`about`, { aboutContent: aboutStartingContent });
  } else {
    res.redirect("/login");
  }
});

//DISPLAY CONTACT
app.get("/contact", (req, res) => {
  res.set(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stal e=0, post-check=0, pre-check=0"
  );
  if (req.isAuthenticated()) {
    res.render(`contact`, { contactContent: contactStartingContent });
  } else {
    res.redirect("/login");
  }
});

//DISPLAY COMPOSE
app.get("/compose", (req, res) => {
  res.set(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stal e=0, post-check=0, pre-check=0"
  );
  if (req.isAuthenticated()) {
    res.render(`compose`);
  } else {
    res.redirect("/login");
  }
});

//POST REQUEST FROM COMPOSE
app.post("/compose", (req, res) => {
  res.set(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stal e=0, post-check=0, pre-check=0"
  );
  if (req.isAuthenticated()) {
    const newPost = {
      postTitle: lodash.upperFirst(lodash.lowerCase(req.body.postTitle)),
      postBody: req.body.postBody,
      postuser: req.user.username,
    };
    //globalPostsArray.push(newPost);

    blogItem.insertMany(
      {
        title: newPost.postTitle,
        body: newPost.postBody,
        userPosted: newPost.postuser,
      },
      (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log(`Post Added to DB, PostTitle: ${newPost.postTitle}`);
        }
      }
    );
    res.redirect("/");
  } else {
    res.redirect("/login");
  }
  //CONSOLE LOGGING NEW POST ADDED
  //console.log(`New Post Added ${globalPostsArray.length - 1}`);
  //REDIRECTING TO HOME PAGE
});

//app listeing to port 3000 or dynamic port
app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running at port 3000...");
});
