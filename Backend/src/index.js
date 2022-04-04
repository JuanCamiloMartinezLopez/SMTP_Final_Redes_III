const express = require('express')
const morgan =require('morgan')
const cors= require('cors')
const bodyParser = require('body-parser');
require("dotenv").config();

const app = express()


//settings
app.set("port", process.env.PORT || 3000);

// middlewares
app.use(morgan("dev"));
app.use(cors({origin:"*"}))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

// routes
app.use(require("./routes"));

// static files
app.use(express.static('./src/public')); //make public static

// listening the Server
app.listen(app.get("port"), () => {
  console.log("Server on port", app.get("port"));
});