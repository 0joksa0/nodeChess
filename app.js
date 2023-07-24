const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const User = require("./models/user");
const WebSocket = require('ws');
var httpServer;
const app = express();

//array of logged users
var loggedUsers = new Array(); 

//const for mongo db url
const dbUrl =
  "mongodb+srv://chessGame:chess123@nodecc.9ciscng.mongodb.net/?retryWrites=true&w=majority";

//const for session secret and cookie life time
const secret = "secret";
const oneDay = 1000 * 60 * 60 * 24;

//const for web socket server
const wss = new WebSocket.Server({ noServer: true });

//set for ejs template engine
app.set("view engine", "ejs");


mongoose
  .connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    console.log("connection established to mongodb");
    //httpServer = app.listen(port);

    //console.log("listening on port 3001");
  })
  .catch((err) => {
    console.log("error connecting to mongodb: " + err);
  });

//static middleware
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: secret, resave: false, saveUninitialized: true, cookie: { maxAge: oneDay } }));

//routes
app.get("/", (req, res) => {
  //res.render("index");
  var loggedUser = isLoggedIn(req);
  if(!loggedUser)
    res.render("index", {username: null});
  else{
    res.render("index", {username: loggedUser.username, name: loggedUser.name, lastname: loggedUser.lastname} );
  }
});

app.get("/signUp", (req, res) => {
  var loggedUser = isLoggedIn(req);
  if(!loggedUser){
    res.render("signUp", { failed: null });
    return;
  }
  res.redirect("/");
});

app.post("/signUp", (req, res) => {
  const user = new User(req.body);
  User.find({ username: user.username }).then((result) => {
    if (result.length > 0) {
      res.render("signUp", { failed: true });
    } else {
      console.log("in else part");
      user.save();
      res.render("signUp", { failed: false });
    }
  });
});

app.get("/logIn", (req, res) => {
  var loggedUser = isLoggedIn(req);
  if(!loggedUser){
    res.render("logIn", { failed: null });
    return;
  }
  res.redirect("/")
});

app.post("/logIn", (req, res) => {
  User.findOne({ username: req.body.username }).then((result) => {
    const user = new User(result);
    //console.log(user)
    
    //bad username
    if (result == null) {
      res.render("logIn", { failed: true });
      return;
    }

    //bad password
    if (user.password != req.body.password) {
      //console.log("in else part" + user.id);
      res.render("logIn", { failed: true });
      return;
    }

    //save user id in session and pushing that session to loggedUsers array
    var session = req.session;

    if(!loggedUsers.includes(user))
        loggedUsers.push({session: req.session, user: user})
    console.log(loggedUsers)

    res.redirect('/gameMenu');
    console.log("Logged in user id:" + user.id);
    return;
  });

});

app.get("/logOut", (req, res) => {
  var loggedUser = isLoggedIn(req);
  if(!loggedUser)
    res.redirect("/")
  else{
    //removing user from loggedUsers array
    loggedUsers = loggedUsers.filter( (user) => user.session.id != req.session.id);
    console.log(loggedUsers)
    req.session.destroy();
    res.redirect("/");
  }
});

app.get("/gameMenu", (req, res) => {
  var loggedUser = isLoggedIn(req);
  if(!loggedUser)
    res.redirect("/")
  else{
    res.render("gameMenu", {username: loggedUser.username, name: loggedUser.name, lastname: loggedUser.lastname} );
  }
});

/*app.get("/gameMenu/:id", (req, res) => {
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
});*/

app.get("/board", (req,res) => {
  var loggedUser = isLoggedIn(req);
  if(!loggedUser)
    res.redirect("/")
  else{
  res.render("board");
}
});

app.get("/test", (req,res) => {
  var loggedUser = isLoggedIn(req);
  if(!loggedUser)
    res.redirect("/")
  else{
    res.render("testLobby", {username: loggedUser.username, name: loggedUser.name, lastname: loggedUser.lastname} );
  }
});

//404 page handler
app.use((req, res, next) => {
  res.status(404).render("404"); 
})

module.exports = {app : app, loggedUsers: loggedUsers};


//check if user is logged in and return user or false
function isLoggedIn(req) {
  var loggedUser = loggedUsers.find( (user) => user.session.id == req.session.id);

  return loggedUser != undefined ? loggedUser.user : false;
}

//make a game and return it