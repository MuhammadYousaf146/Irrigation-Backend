const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    key: "userId",
    secret: "thisismysecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 60,
    },
  })
);

const db = mysql.createConnection({
  // user: "root",
  // host: "localhost",
  // password: "",
  // database: "agri"

  user: "abdullah112211",
  host: "db4free.net",
  password: "abdullah112211",
  database: "abdullah112211"
});

// db.connect(function(err) {
//     if (err) throw err;
//     db.query("SELECT * FROM `timedata`", function (err, result, fields) {
//       if (err) throw err;
//       console.log(result)
//     });
// });

app.post("/register", (req, res) => {
  const username = req.body.fullname;
  const phoneNo = req.body.phoneno;
  const role = 1;
  const cnic = req.body.cnic;
  const email = req.body.email;
  var password = req.body.password;

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.log(err);
    }
    const sql = "INSERT INTO `user`(`username`, `phoneNo`, `role`, `cnic`, `email`,`password`) VALUES ("+ mysql.escape(username) +","+ mysql.escape(phoneNo) 
    +","+ mysql.escape(role) +","+ mysql.escape(cnic) +","+ mysql.escape(email) + ",'" + hash +"')";

    const sql1 = "SELECT * FROM user WHERE email = " + mysql.escape(email);
    db.query(sql1, (err, result) => {
      if (err) throw err;
      else if(result && result.length > 0)
      {
        res.send({"code":409}) //email already in use
      }
      else
      {
        db.query(
          sql, (err, result) => {
              if (err) throw err;
              else
              res.send({"code":200}); //registered successfully
          }
        )
      }
    })  
  });
});

app.get("/login", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  db.query(
    "SELECT * FROM user WHERE email = ?;",
    email,
    (err, result) => {
      
      if (err) {
        res.send({ err: err });
      }

      if (result.length > 0) {
        bcrypt.compare(password, result[0].password, (error, response) => {
          
          if (response) {
            req.session.user = result;
            
            res.send({"code":200,
            ...result});
          } else {
            res.send({"code":401, message: "Wrong username/password combination!" });
          }
        });
      } else {
        res.send({"code":401, message: "User doesn't exist" });
      }
    }
  );
});



app.post("/dashboardData", (req, res) => {
     const user_id = req.body.user_id;    

     const sql = "SELECT * FROM ownership WHERE user_id = " + mysql.escape(user_id) ;

    db.query(sql, (err, result) => {
      if (err) throw err;
      res.send(result)
    })  
});

app.post("/logout", (req, res)=>{
  req.session.user = null;
  res.send("logout")
})

app.post("/field", (req, res) => {
  const boardID = req.body.field;
  //console.log(boardID)
  const sql = "SELECT * FROM timedata WHERE boardID = " + boardID + " order by datetime desc LIMIT 1"
  db.query(sql, (err, result) => {
    if (err) throw err;
    //console.log(result)
    res.send(result)
  })
});

app.post("/timeSeriesData", (req, res) => {
  const boardID = req.body.field;
  const sql = "SELECT * FROM timedata WHERE boardID = " + boardID + " order by datetime desc"
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result)
  })
});

app.listen(3001, () => {
  console.log("Yey, your server is running on port 3001");

});