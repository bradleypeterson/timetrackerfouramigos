const cors = require('cors'); 
const express = require('express');
const mongoose = require('mongoose'); 
const crypto = require('crypto'); 
const sqlite3 = require('sqlite3').verbose();

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// Database
const db = new sqlite3.Database('./database/main.db');

// App
const app = express();
app.use(cors());
app.use(express.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => {
  return res.send('Hello World');
});

//Joins a group based on user id and group id
app.post('/joingroup', async (req, res, next) => {
    let sql = `INSERT INTO GroupAssignment (userID, groupID)
                VALUES (?, ?)`;

    let data = [];
    data[0] = req.body["userID"];
    data[1] = req.body["groupID"];

    db.run(sql, data, function(err, rows) {
        if (err) {
            return res.status(500).json({message: 'Something went wrong. Please try again later.'});
        }
        res.send(JSON.stringify(rows));
    });
});
//Leaves a group based on user id and group id
app.post('/leavegroup', async (req, res, next) => {
    let sql = `DELETE   
                FROM
                    GroupAssignment AS GA
               WHERE
                   GA.userID = ? AND GA.groupID = ?`;

    let data = [];
    data[0] = req.body["userID"];
    data[1] = req.body["groupID"];

    db.run(sql, data, function(err, rows) {
        if (err) {
            return res.status(500).json({message: 'Something went wrong. Please try again later.'});
        }
        res.send(JSON.stringify(rows));
    });
});

//Get users info based on username
app.post('/getuser', async (req, res, next) => {
    let sql = `SELECT userID, username, firstName, lastName, type, isActive FROM Users WHERE username = ?`;
    db.get(sql, [req.body["username"]], (err, rows) => {

        if (err) {
            return res.status(500).json({message: 'Something went wrong. Please try again later.'});
        }
        res.send(JSON.stringify(rows));
    });

});
//Retrieves a list of all course requests
app.get('/getcourserequests', async (req, res, next) => {
    let sql = `SELECT
                   CR.requestID,
                   C.courseName,
                   U.firstName || ' ' || U.lastName as studentName,
                   UI.firstName || ' ' || UI.lastName as instructorName,
                   CR.status,
                   UR.firstName || ' ' || UR.lastName as reviewerName,
                   CR.isActive
               FROM CourseRequest as CR
                        LEFT JOIN Courses C on CR.courseID = C.courseID
                        LEFT JOIN Users U on CR.userID = U.userID
                        LEFT JOIN Users UI on CR.instructorID = UI.userID
                        LEFT JOIN Users UR on CR.reviewerID = UR.userID
               WHERE CR.isActive = 1`;
    db.all(sql, [], (err, rows) => {
        if(err)
        {
            res.status(400).json({ "error": err.message });
        }
        res.send(JSON.stringify(rows));
    });
});

// get all course requests for a student, which are active
app.get('/getactivecourserequests', async (req, res, next) => {
  let sql = `SELECT
                 CR.requestID,
                 C.courseName,
                 U.firstName || ' ' || U.lastName as studentName,
                 CR.status,
                 CR.isActive
             FROM CourseRequest as CR
                      LEFT JOIN Users U on CR.userID = U.userID
             WHERE CR.status = 1`;
  db.all(sql, [], (err, rows) => {
      if(err)
      {
          res.status(400).json({ "error": err.message });
      }
      res.send(JSON.stringify(rows));
  });
});


// get all course requests for a student, which are accepted
app.get('/getacceptedcourserequests', async (req, res, next) => {
  let sql = `SELECT
                 CR.requestID,
                 C.courseName,
                 U.firstName || ' ' || U.lastName as studentName,
                 CR.status,
                 CR.isActive
             FROM CourseRequest as CR
                      LEFT JOIN Users U on CR.userID = U.userID
             WHERE CR.status = 1`;
  db.all(sql, [], (err, rows) => {
      if(err)
      {
          res.status(400).json({ "error": err.message });
      }
      res.send(JSON.stringify(rows));
  });
});



//Updates passed course request
app.post('/updatecourserequest', async (req, res, next) => {
    console.log("Running update course request");

    let sql = `UPDATE CourseRequest
               SET

                   status = ?,
                   isActive = ?,
                   reviewerID = ?
               WHERE
                   requestID = ?`;

    let data = [];
    data[0] = req.body["status"];
    data[1] = req.body["isActive"];
    data[2] = req.body["reviewerID"];
    data[3] = req.body["requestID"];
    db.run(sql, data, function(err, rows)
    {
        if (err)
        {
            return res.status(500).json({message: 'Something went wrong. Please try again later.'});
        }
        else
        {
            return res.status(200).json({message: 'User registered'});
        }
    });

});

//Testing for admin stuff! ------------------------------

//Retrieves a list of all users from the database
app.get('/getusers', async (req, res, next) => {

    let sql = `SELECT userID, username, firstName, lastName, type, isActive FROM Users`;
    db.all(sql, [], (err, rows) => {

        if (err) {
            res.status(400).json({ "error": err.message });
        }

        res.send(JSON.stringify(rows));

    });

});

//Gets all courses from the database and sends them to the caller
app.get('/getcourses', async (req, res) => {
    let sql = `SELECT Courses.*, Users.firstName, Users.lastName
    FROM Courses
    LEFT JOIN Users ON Courses.instructorID = Users.userID`;

    db.all(sql, [], (err, rows) => {

        if (err) {
            res.status(400).json({ "error": err.message });
        } else {
            res.send(JSON.stringify(rows));
        }

    });
});

// where instructor ID = user id
// where current user = user id in course request


//Gets all courses and course requests where the user id is the current user and status is accepted
app.get('/getcoursesandrequests', async (req, res) => {
  let sql = `SELECT Courses.*, CR.*, Users.firstName, Users.lastName
  FROM Courses, CourseRequest as CR
    LEFT JOIN Users U ON Courses.instructorID = U.userID
    LEFT JOIN Users UI ON UI.userID = CR.userID
  WHERE CR.status = 1`;

  db.all(sql, [], (err, rows) => {

      if (err) {
          res.status(400).json({ "error": err.message });
      } else {
          res.send(JSON.stringify(rows));
      }

  });
});


// get courses without user data
app.get('/getcoursesonly', async (req, res) => {
  let sql = `SELECT *
  FROM Courses`;

  db.all(sql, [], (err, rows) => {

      if (err) {
          res.status(400).json({ "error": err.message });
      } else {
          res.send(JSON.stringify(rows));
      }

  });
});

// get a course from the course table using the course ID
app.get('/getcourse', async (req, res) => {
  let sql = `SELECT *
  FROM Courses
  WHERE courseId = ?`;

  let data = [];
    data[0] = req.body["courseID"];

  db.all(sql, data, (err, rows) => {

      if (err) {
          res.status(400).json({ "error": err.message });
      } else {
          res.send(JSON.stringify(rows));
      }

  });
});

app.get('/getprojectsbycourseid/:courseid', async (req, res) => {
    //let sql = `SELECT * FROM Projects WHERE courseID = ${req.params.courseid}`;

    let sql = `SELECT Projects.*, Courses.courseName
    FROM Projects
    LEFT JOIN Courses on Courses.courseID = Projects.courseID
    WHERE Projects.courseID = ${req.params.courseid}`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({"error": err.message });
        } else {
            res.send(JSON.stringify(rows));
        }
    });
});

// insert course request into table
app.post('/insertcourserequest', async (req, res, next) => {
  let sql = `INSERT INTO
  CourseRequest (userID, courseID, instructorID, isActive, reviewerID, status) VALUES (?, ?, ?, ?, ?, ?)` ;

  let data = [];
    data[0] = req.body["userID"];
    data[1] = req.body["courseID"];
    data[2] = req.body["instructorID"];
    data[3] = req.body["isActive"];
    data[4] = req.body["reviewerID"];
    data[5] = req.body["status"];


  db.run(sql, data, function (err, rows) {

      if (err) {
          res.status(400).json({ "error": err.message });
      } else {
          res.send(JSON.stringify(rows));
      }

  });

});


app.get('/getgroupsbyprojectid/:projectid', async (req, res) => {
    //let sql = `SELECT * FROM Groups WHERE projectID = ${req.params.projectid}`;

    let sql = `SELECT Groups.*, Projects.projectName
               FROM Groups
               LEFT JOIN Projects on Projects.projectID = Groups.projectID
               WHERE Groups.projectID = ${req.params.projectid}`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({"error": err.message });
        } else {
            res.send(JSON.stringify(rows));
        }
    });
});


//-------------------------------------------------------

app.post('/register', async (req, res, next) => {

  function isEmpty(str) {
    return (!str || str.length === 0 );
  }

  if(isEmpty(req.body["username"]) ||
  isEmpty(req.body["firstName"]) ||
  isEmpty(req.body["lastName"]) ||
  isEmpty(req.body["password"]) ||
  isEmpty(req.body["repeatPassword"])) {
    return res.status(400).json({message: 'Missing one or more required arguments.'});
  };

  // Validate user doesn't already exist
  let sql = `SELECT * FROM Users WHERE username = ?`;
  db.get(sql, [req.body["username"]], (err, rows) => {

    if (err) {
      return res.status(500).json({message: 'Something went wrong. Please try again later.'});
    }

    if(rows) {
      return res.status(400).json({message: 'A user of this name already exists'});
    }

    // Validate passwords match
    if(req.body["password"] !== req.body["repeatPassword"]) {
      return res.status(400).json({message: 'Given passwords do not match'});
    }
    
    let salt = crypto.randomBytes(16).toString('hex');
        
    let hash = crypto.pbkdf2Sync(req.body["password"], salt,  
      1000, 64, `sha512`).toString(`hex`);

    let data = [];

    // Can't use dictionaries for queries so order matters!
    data[0] = req.body["username"];
    data[1] = hash;
    data[2] = req.body["firstName"];
    data[3] = req.body["lastName"];
    //Temporary to create an Instructor user
    data[4] = req.body["userType"];
    data[5] = true;
    data[6] = salt;

    db.run(`INSERT INTO Users(username, password, firstName, lastName, type, isActive, salt) VALUES(?, ?, ?, ?, ?, ?, ?)`, data, function(err, rows) {
      if (err) {
        return res.status(500).json({message: 'Something went wrong. Please try again later.'});
      } else {
        return res.status(200).json({message: 'User registered'});
      }
    });
  });
});

app.post('/login', async (req, res, next) => {
  function isEmpty(str) {
    return (!str || str.length === 0 );
  }


  if(isEmpty(req.body["username"]) ||
  isEmpty(req.body["password"])) {
    return res.status(400).json({message: 'Missing one or more required arguments.'});
  };

  let sql = `SELECT * FROM Users WHERE username = ?`;
  db.get(sql, [req.body["username"]], (err, rows) => {
    if (err) {
      return res.status(500).json({message: 'Something went wrong. Please try again later.'});
    }

    if(rows) {
      salt = rows['salt']

      let hash = crypto.pbkdf2Sync(req.body["password"], salt,  
      1000, 64, `sha512`).toString(`hex`);

      if(rows['password'] === hash) {
        return res.status(200).json({user: rows});
      } else {
        return res.status(401).json({message: 'Username or password is incorrect.'});
      }
    } else {
      return res.status(401).json({message: 'Username or password is incorrect.'});
    }
  });
});

app.post('/createGroup', async (req, res, next) => {
    function isEmpty(str) {
        return (!str || str.length === 0);
    }

    console.log("Running createGroup");

    let data = [];

    // Can't use dictionaries for queries so order matters!
    data[0] = req.body["groupName"];
    data[1] = req.body["isActive"];
    data[2] = req.body["projectID"];

    console.log(data);

    db.run(`INSERT INTO Groups(groupName, isActive, projectID) VALUES(?, ?, ?)`, data, function (err, rows) {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        } else {
            console.log(data);
            return res.status(200).json({group: data});
        }
    });
});

app.get

app.post('/createCourse', async (req, res, next) => {
  function isEmpty(str) {
      return (!str || str.length === 0);
  }

  console.log("Running createCourse");

  let data = [];

  // Can't use dictionaries for queries so order matters!
  data[0] = req.body["courseName"];
  data[1] = req.body["isActive"];
  data[2] = req.body["instructorID"]; //Edited by Tage for course creation
  data[3] = req.body["description"]; //Edited by Tage for course creation

  console.log(data);

  db.run(`INSERT INTO Courses(courseName, isActive, instructorID, description) VALUES(?, ?, ?, ?)`, data, function (err, rows) {
      if (err) {
          return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
      } else {
          return res.status(200).json({course: data});
      }
  });
});

app.post('/createProject', async (req, res, next) => {
  function isEmpty(str) {
      return (!str || str.length === 0);
  }

  console.log("Running createProject");

  let data = [];

  // Can't use dictionaries for queries so order matters!
  data[0] = req.body["projectName"];
  data[1] = req.body["isActive"];
  data[2] = req.body['courseID'];
  data[3] = req.body['description']

  console.log(data);

  db.run(`INSERT INTO Projects(projectName, isActive, courseID, description) VALUES(?, ?, ?, ?)`, data, function (err, rows) {
      if (err) {
          return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
      } else {
          console.log(rows);
          return res.status(200).json({project: data});
      }
  });
});

app.post('/clock', async (req, res, next) => {
  function isEmpty(str) {
    return (!str || str.length === 0 );
  }
  
  let isValid = true;
  let isClockin = req.body["timeIn"] !== null;
  let sql = `SELECT * FROM TimeCard WHERE UserID = ?`;
  db.all(sql, [req.body["userID"]], (error, rows) => 
  {
    if (error) {
      return res.status(500).json({message: 'Something went wrong. Please try again later.'});
    }

    if(isClockin){
      console.log("clocking in.");
      rows.forEach(row => {
        isValid = (row['timeOut'] !== null);
      });

      if(!isValid){
        return res.status(400).json({message: 'you have an outstanding clock in. Please clock out.'});
      }

      let data = [];

      data[0] = req.body["timeIn"];
      data[1] = false;
      data[2] = req.body["createdOn"];
      data[3] = req.body["userID"];
      data[4] = req.body["description"];

      db.run(`INSERT INTO TimeCard(timeIn, isEdited, createdOn, userID, description) VALUES(?, ?, ?, ?, ?)`, data, function(err,value){
        if(err){
          console.log(err)
          return res.status(500).json({message: 'Something went wrong. Please try again later.'});
        }
        else{
          return res.status(200).json({message: 'Clocked in successfully.'});
        }
      });
    }
    else{//clocking out
      console.log("clocking out.");
      let isNullTimeOut = false;
      let ID = 0;
      rows.every(row => {
        isNullTimeOut = row["timeOut"] === null;
        if(isNullTimeOut){
          ID = row["timeslotID"];
          return false;
        }
        return true;
      });

      isValid = isNullTimeOut;

      if(!isValid){
        return res.status(400).json({message: 'No outstanding clock in. Please clock in first.'});
      }

      let data = [];
      data[0] = req.body["timeOut"];
      data[1] = req.body["description"];
      data[2] = ID;

      db.run(`UPDATE TimeCard SET timeOut = ? , description = ? WHERE timeslotID = ? `, data, function(err, value){
        if(err){
          console.log(err)
          return res.status(500).json({message: 'Something went wrong. Please try again later.'});
        }
        else{
          return res.status(200).json({message: 'Clocked out successfully.'});
        }
      });
    }
  });  
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
require('./database/seed.js');