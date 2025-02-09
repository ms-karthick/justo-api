const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./config/dbConnect.js");
const passport = require('passport');
const app = express();
const session =  require('express-session');
var cookieParser = require('cookie-parser');
const { applystrategy } = require('./app/middlewares/passport-config.js');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const  sequelize  = require('./config/dbConnect.js');
const seedUser = require("./app/seeder/userSeed.js");
const rateLimiter = require("./app/middlewares/customRateLimiter.js");

const corsOptions = {
  origin: "http://localhost:3000"
};

// const limiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 5 });
app.use(cors(corsOptions));
db.conn;

app.use(cors()); 
// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ 
  secret: process.env.JWT_SECRET_KEY,
  resave: false,
  saveUninitialized: true
 }));


app.use(passport.initialize());

app.use(passport.session());
app.use(rateLimiter);

applystrategy(passport,"fffff");

app.get("/", (req, res) => {
  res.json({ message: "Hi there, welcome to justo API." });
});


const user = require('./app/routes/user.js');


app.use('/auth',user);

sequelize.sync().then( async () => {
  console.log('Database connected and synchronized');
  // await seedUser();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
