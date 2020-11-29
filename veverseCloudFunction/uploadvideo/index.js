'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { poolPromise} = require('./db');
 
let cors = require('cors');


const app = express();
app.use(cors());;
app.set('view engine', 'pug');
app.enable('trust proxy');

// Automatically parse request body as form data.
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Set Content-Type for all responses for these routes.
app.use((req, res, next) => {
  //res.setHeader('Access-Control-Allow-Origin', '*');
  res.set('Content-Type', 'application/json');
  next();
});


let pool;
app.use(async (req, res, next) => {
  if (pool) {
    return next();
  }
  try {
    pool = await poolPromise;
    next();
  }
  catch (err) {
    console.log(err);
    return next(err);
  }
});




// getVideo Temp Video ID
app.post('/', async (req, res) => {
  try {
    let videoPath ="NoVideo";
    let thumbNailPath = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png";
    let date = new Date(Date.now()).toISOString().substring(0,19).replace('T',' ');
    var stmt = `INSERT INTO veverseMySqlDatabase.Video (title, description,date,views,likes,category,video_path,thumbnail_path,emailID)
    VALUES ('${req.body.title}', '${req.body.description}','${date}','0','0','${req.body.category}','${videoPath}','${thumbNailPath}','${req.body.emailID}' );`;
    let queryObj = await pool.query(stmt);
    var selectVideoId = `select max(videoID) as videoID from veverseMySqlDatabase.Video;`;
    let resultSql = await pool.query(selectVideoId);
    return res.status(200).json({
      success: true,
      videoID: resultSql[0].videoID
    }).end();
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      success: false,
      error: err
    }).end();
  }
});


//Update
app.put('/update', async (req, res) => {
  try {
    let updateVideoRow= `UPDATE veverseMySqlDatabase.Video SET video_path = '${req.body.videoPath}', thumbnail_path = '${req.body.thumbNailPath}' WHERE videoID=${req.body.videoID};`;
    pool.query(updateVideoRow);
    return res.status(200).json({
      success: true
    }).end();
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      success: false,
      error: err
    }).end();
  }
});


//Delete in case the upload fails
app.delete('/delete', async (req, res) => {
  try {
    var stmt =  `DELETE FROM veverseMySqlDatabase.Video where videoID=${req.body.videoID}`;
    let queryObj = await pool.query(stmt);
    return res.status(200).json({
      success: true
    }).end();
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      success: false,
      error: err
    }).end();
  }
});


const PORT =  5555;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


module.exports = {
    app
};