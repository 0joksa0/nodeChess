const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/user');

const app = express();

//const for mongo db url
const dbUrl = 'mongodb+srv://chessGame:chess123@nodecc.9ciscng.mongodb.net/?retryWrites=true&w=majority'

app.set('view engine', 'ejs');

mongoose.connect(dbUrl, {useNewUrlParser: true, useUnifiedTopology: true})
        .then( (result) => {
            console.log("connection established to mongodb"); 
            app.listen(3001);
            console.log("listening on port 3001"); 
        })
        .catch( (err) => {console.log("error connecting to mongodb: " + err);})



//static middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req,res) => {
    res.render('index');
})

app.get('/signUp', (req, res) => {
    res.render('signUp');
})

app.post('/signUp', (req, res) => {
    const user = new User(req.body);
    user.save();
    res.send(user);
});
