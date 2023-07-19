const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/user");

const app = express();

//const for mongo db url
const dbUrl =
  "mongodb+srv://chessGame:chess123@nodecc.9ciscng.mongodb.net/?retryWrites=true&w=majority";

app.set("view engine", "ejs");

var loggedUser = new Array(); 

mongoose
  .connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    console.log("connection established to mongodb");
    app.listen(3001);
    console.log("listening on port 3001");
  })
  .catch((err) => {
    console.log("error connecting to mongodb: " + err);
  });

//static middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/signUp", (req, res) => {
  res.render("signUp", { failed: 0 });
});

app.post("/signUp", (req, res) => {
  const user = new User(req.body);
  User.find({ username: user.username }).then((result) => {
    if (result.length > 0) {
      res.render("signUp", { failed: 1 });
    } else {
      console.log("in else part");
      user.save();
      res.render("signUp", { failed: 2 });
    }
  });
  //user.save();
  //res.send(user);
});

app.get("/logIn", (req, res) => {
  res.render("logIn", { failed: 0 });
});

app.post("/logIn", (req, res) => {
  User.findOne({ username: req.body.username }).then((result) => {
    const user = new User(result);
    //console.log(user)
    if (result == null) {
      res.render("logIn", { failed: 1 });
      return;
    }

    if (user.password != req.body.password) {
      console.log("in else part" + user.id);

      //make changes for logged users for :id and push them go game page
      
      res.render("logIn", { failed: 1 });
      return;
    }
    if(!loggedUser.includes(user))
        loggedUser.push(user)
    res.redirect('/gameMenu/' + user.id);
    console.log("Logged in user id:" + user.id);
    return;
  });
  //res.render('logIn', { failed: 2});
});

app.get("/gameMenu", (req, res) => {
    res.redirect("/")
});

app.get("/gameMenu/:id", (req, res) => {
    const  id = req.params.id;
    console.log(id)
    User.findById(id).then( (result)=>{
      console.log(result.name, result.lastname);
        res.render('gameMenu', result);
    })
    .catch((err) => {
        console.log(err);
        res.redirect('/logIn');
    })
});

app.get("/board", (req,res) => {
  res.render("board");
});

