const express = require('express')

const app = express();

//Middlewares
app.use('/', () => {
    console.log("hello");
});

//Rotes
app.get('/', (req,res) => {
    res.send('Home page');
});

app.listen(3000);