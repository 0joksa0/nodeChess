const express = require('express');

const app = express();

app.use(express.static('public'));
app.listen(3001)

app.get('/', (req,res) => {
    res.render('index');
})
app.set('view engine', 'ejs');