const mongoose = require('mongoose');
const nocache = require('nocache');
const express = require('express');
const dotenv = require('dotenv').config();
const ejs = require('ejs');
const path = require('path');
const adminRoute = require('./routes/adminRoute');
const userRoute = require('./routes/userRoute');
const adminController = require('./controllers/adminController');
const userController = require('./controllers/userController');

mongoose.connect(process.env.MONGO_ID)
  .then(() => console.log('MongoDB connected......'))
  .catch(err => console.error(err));

const app = express();

app.use('/publicImages', express.static(path.join(__dirname, '../public/publicImages')));
app.use(nocache());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Apply user routes
app.use('/', userRoute);

// Apply admin routes
app.use('/admin', adminRoute);

// Error handling middleware for user routes
app.use((req, res, next) => {
  userController.load404(req, res, next);
});

// Error handling middleware for admin routes
app.use((req, res, next) => {
  adminController.adminLoad404(req, res, next);
});

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server running on: http://localhost:${process.env.PORT}`);
});
