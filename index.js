const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const sharp = require('sharp');
const path = require('path');
const multer = require('multer');

// const tf = require('@tensorflow/tfjs-node');
//const fs = require('fs').promises;

const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);

// (async () => {
//   // Load your pre-trained model
//   const model = await tf.loadLayersModel('http://127.0.0.1:8080/model.json');

//   // Path to the image you want to predict
//   const fpath = './textimg.jpg';

//   // Read and preprocess the image
//   const imageBuffer = await readFile(fpath);
//   console.log(imageBuffer)
  
//   // const baseimg = imageBuffer.toString('base64')
//   // //console.log(baseimg)
//   // const imageBufferr = Buffer.from(baseimg, 'base64');
//    const image = tf.node.decodeImage(imageBuffer);
//   // //console.log(image)
//   // console.log(imageBuffer)
//   const resizedImage = tf.image.resizeBilinear(image, [300, 300]);
//   const normalizedImage = resizedImage.div(255);

//   // Expand dimensions to create a batch of one image
//   const batchedImage = normalizedImage.expandDims(0);

//   //console.log(batchedImage);

//   // Make predictions
//   const predictions = model.predict(batchedImage);

//   // Convert predictions tensor to a regular JavaScript array
//   const predictionsArray = predictions.arraySync();

//   // Print the predicted values
//   console.log(predictionsArray);

//   // Clean up
//   image.dispose();
//   resizedImage.dispose();
//   normalizedImage.dispose();
//   predictions.dispose();
// })();

// // async function loadModel(){
//   const model = await tf.loadLayersModel("http://127.0.0.1:8080/model.json")

//   return model;
// }
// loadModel().then((model)=>{
//   const inputData = "C:\Users\HHT\Documents\React Projects\SIAS\server\modeljs\js\textimg.jpg";
//   console.log(model.predict(inputData))
// })

const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

//app.use(express.json());
app.use(express.json({limit: '50mb'}));
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/'); // Specify the upload directory
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + '-' + file.originalname); // Rename the file
//   }
// });

// const upload = multer({ storage: storage });

// app.post('/upload', upload.single('image'), (req, res) => {
//   const imageBuffer = req.file.buffer; // This is the raw image data
//   console.log(imageBuffer);
//   // You can save/process the image data here or send a response back
//   res.json({ message: 'Image uploaded successfully' });
// });

// app.post('/upload', upload.single('image'),async (req, res) => {
//   if (!req.file) {
//     return res.status(400).send('No file uploaded.');
//   }
  


//   const imageData = req.file.buffer;
//   console.log("req.file.buffer   :  "+imageData)

//   const imageBuffer = Buffer.from(imageData, 'base64');
//   console.log(imageBuffer)
  
//   const image = tf.node.decodeImage(imageBuffer);
  
//   const resizedImage = tf.image.resizeBilinear(image, [300, 300]);
//   const normalizedImage = resizedImage.div(255);

//   // Expand dimensions to create a batch of one image
//   const batchedImage = normalizedImage.expandDims(0);


//   // //Load Model
//   // const model = await tf.loadLayersModel('http://127.0.0.1:8080/model.json');
//   // //Make predictions
//   // const predictions = model.predict(batchedImage);

//   // // Convert predictions tensor to a regular JavaScript array
//   // const predictionsArray = predictions.arraySync();

//   // // Print the predicted values
//   // console.log(Math.max(...predictionsArray[0]));

//   // const maxValue = Math.max(...predictionsArray[0]);
//   // const maxIndex = predictionsArray[0].indexOf(maxValue);

//   // console.log("max index is " + maxIndex)
//   // // Clean up
//   // image.dispose();
//   // resizedImage.dispose();
//   // normalizedImage.dispose();
//   // predictions.dispose();


//   // // Process the uploaded image (req.file) here
//   // res.status(200).send('File uploaded successfully.');
// });

app.post('/upload',async (req, res) => {
  const imageFile = req.body.image;
  //console.log(imageFile)

  if (!imageFile) {
    return res.status(400).send('No image file received.');
  }
  const imageBuffer = Buffer.from(imageFile, 'base64');
     //console.log(imageBuffer)
     const image = tf.node.decodeImage(imageBuffer);
     const resizedImage = tf.image.resizeBilinear(image, [300, 300]);
      const normalizedImage = resizedImage.div(tf.scalar(255));

      // Expand dimensions to create a batch of one image
      const batchedImage = normalizedImage.expandDims(0);
      //console.log(tf.concat([batchedImage]))


      //Load Model
      const model = await tf.loadLayersModel('http://127.0.0.1:8080/model.json');
      //Make predictions
      const predictions = model.predict(batchedImage);

      // Convert predictions tensor to a regular JavaScript array
      const predictionsArray = predictions.arraySync();

      // Print the predicted values
      console.log(Math.max(...predictionsArray[0]));

      const maxValue = Math.max(...predictionsArray[0]);
      const maxIndex = predictionsArray[0].indexOf(maxValue);

      

      console.log("max index is " + maxIndex)
      // Clean up
      image.dispose();
      resizedImage.dispose();
      normalizedImage.dispose();
      predictions.dispose();

      if(maxIndex === 0)
      {
        return res.send({code : 100, message : "PowderyMildew"});
      }
      else if(maxIndex === 1)
      {
        return res.send({code : 101, message : "Scab"});
      }
      else if(maxIndex === 2)
      {
        return res.send({code : 102, message : "Healthy"});
      }
      else if(maxIndex === 3)
      {
        return res.send({code : 103, message : "Invalid Data"});
      }
      else if(maxIndex === 4)
      {
        return res.send({code : 104, message : "Stripe Rust"});
      }
      else{
        return res.send({code : 105, message : "Error"})
      }
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
      if (result)
     { if (result.length > 0) {
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
      }}
      else {
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
  const sql = "SELECT UNIX_TIMESTAMP(datetime) AS date,boardID,mist1,mist2,mist3,mist4,humidity,temperature,motor1,motor2,datetime FROM `timedata` WHERE boardID = " + boardID + " order by datetime desc LIMIT 1;"
  //const sql = "SELECT * FROM timedata WHERE boardID = " + boardID + " order by datetime desc LIMIT 1" ,waterLevel
  db.query(sql, (err, result) => {
    if (err) throw err;
    //console.log(result)
    res.send(result)
  })
});

app.post("/setAutomanual", (req, res) => {
  const automanual = req.body.automanual;
  const boardID = req.body.field;
  const sql = "UPDATE `ownership` SET `automanual`= " + automanual + " WHERE boardID = "+ boardID;
  //console.log(sql)
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result)
  })
})

app.post("/setMotor1", (req, res) => {
  const m1 = req.body.motor1;
  const boardID = req.body.field;
  const sql = "UPDATE `ownership` SET `m1`= " + m1 + " WHERE boardID = "+ boardID;
  //console.log(sql)
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result)
  })
})

app.post("/setMotor2", (req, res) => {
  const m2 = req.body.motor2;
  const boardID = req.body.field;
  const sql = "UPDATE `ownership` SET `m2`= " + m2 + " WHERE boardID = "+ boardID;
  //console.log(sql)
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result)
  })
})

app.post("/getAutoMotor", (req, res) => {
  const boardID = req.body.field;
  const sql = "SELECT * FROM `ownership` WHERE boardID = "+ boardID;
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result)
  })
})

app.post("/last10daysrecord", (req, res) => {
  const boardID = req.body.field;
  const sql = "SELECT DATE(datetime) AS date, EXTRACT(day FROM datetime) AS day, EXTRACT(month FROM datetime) AS month, EXTRACT(year FROM datetime) AS year, AVG(humidity) AS humidity_average,AVG(mist1) AS mist_average, AVG(temperature) AS temp_average FROM `timedata` WHERE boardID = " + boardID +
  " GROUP BY DATE(datetime), EXTRACT(year FROM datetime), EXTRACT(month FROM datetime), EXTRACT(day FROM datetime) ORDER BY DATE(datetime) DESC LIMIT 10";
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result)
  })
});

app.post("/last10hoursrecord", (req, res) => {
  const boardID = req.body.field;
  const sql = "SELECT DATE(datetime) as date, EXTRACT(hour FROM datetime) AS hour, EXTRACT(day FROM datetime) AS day, EXTRACT(month FROM datetime) AS month,AVG(humidity) AS humidity_average,AVG(mist1) AS mist_average,AVG(temperature) AS temp_average  from timedata WHERE boardID = " + boardID +
  " GROUP BY DATE(datetime), EXTRACT(month FROM datetime), EXTRACT(day FROM datetime), EXTRACT(hour FROM datetime) ORDER BY DATE(datetime) DESC, EXTRACT(hour FROM datetime) DESC LIMIT 10";
  db.query(sql, (err, result) => {
    if (err) throw err;
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

app.post('/deseaseDetector', async (req, res) => {

  const imageBuffer = req.body.imgData
  console.log(imageBuffer)
  
  // // const baseimg = imageBuffer.toString('base64')
  // // //console.log(baseimg)
  // // const imageBufferr = Buffer.from(baseimg, 'base64');
  //  const image = tf.node.decodeImage(imageBuffer);
  // // //console.log(image)
  // // console.log(imageBuffer)
  // const resizedImage = tf.image.resizeBilinear(image, [300, 300]);
  // const normalizedImage = resizedImage.div(255);

  // // Expand dimensions to create a batch of one image
  // const batchedImage = normalizedImage.expandDims(0);

  // //console.log(batchedImage);
  // //Load Model
  // const model = await tf.loadLayersModel('http://127.0.0.1:8080/model.json');

  // // Make predictions
  // const predictions = model.predict(batchedImage);

  // // Convert predictions tensor to a regular JavaScript array
  // const predictionsArray = predictions.arraySync();

  // // Print the predicted values
  // console.log(predictionsArray);

  // // Clean up
  // image.dispose();
  // resizedImage.dispose();
  // normalizedImage.dispose();
  // predictions.dispose();





  // const image = tf.node.decodeImage(imageBufferr);
  // const resizedImagee = tf.image.resizeBilinear(image, [300, 300]);
  // const normalizedImagee = resizedImagee.div(255);

    // // Load your pre-trained model
    // const model = await tf.loadLayersModel('http://127.0.0.1:8080/model.json');

    //  // Make predictions
    // const predictions = model.predict(batchedImage);

    // // Convert predictions tensor to a regular JavaScript array
    // const predictionsArray = predictions.arraySync();

    // // Print the predicted values
    // console.log(predictionsArray);

    // // Clean up
    // predictions.dispose();
    // //res.status(200).json({ message: 'Image preprocessed successfully' });
});

app.listen(3001, () => {
  console.log("Yey, your server is running on port 3001");

});