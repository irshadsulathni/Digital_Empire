const mongoose = require('mongoose');
const nocache = require('nocache');
const express = require('express');
const dotenv = require('dotenv').config()
const ejs = require('ejs')
const path = require('path');
const adminRoute = require('./routes/adminRoute');
const { session } = require('passport');
const userRoute = require('./routes/userRoute');


mongoose.connect(process.env.mongo_id);

const app = express();


app.use(nocache());

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({extended:true}))


app.set('view engine', 'ejs')

// for userRoute 
app.use('/',userRoute);

// for adminRoute
app.use('/admin',adminRoute);



app.listen(process.env.port,()=>{
    console.log(`server runnig on :  http://localhost:${process.env.port}`)
});




