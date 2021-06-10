const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const logger= require('morgan')
const fetch = require("node-fetch");
const fs= require("fs");
const { urlencoded } = require('body-parser');


const indexRouter = require('./routes/index');
const port = 80;
const app = express();

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use('/',indexRouter)
app.use('/static',express.static(path.join(__dirname, 'public')));
    
app.listen(port, ()=>{
        console.log(`The application started successfully on port ${port}`);
});

