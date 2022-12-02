const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const { authUser, authRole } = require('./basicAuth.js');


// Constants
const PORT = 8080;
const HOST = '0.0.0.0';


// Database
const db = new sqlite3.Database('./database/main.db');

// App
const app = express();

app.use(
    cors({
        origin: 'http://localhost:4200',
        allowHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
});

app.use(
    session({
        name: 'sid',
        resave: false,
        secret: '4amigos number 1!',
        saveUninitialized: false,
        cookie: {
            maxAge: 36000000,
            sameSite: true,
        },
    })
);

app.get('/', (req, res) => {
    return res.send('Hello World');
});

app.get('/getCookie', (req, res) => {
    if (req.session.user) {
        return res.send(req.session.user.loggedIn);
    } else {
        return res.send(null);
    }
});

app.get('/logout', (req, res) => {
   req.session.destroy()
   return res.status('User Logged Out');
});


//Joins a group based on user id and group id
app.post('/joingroup', authUser, async (req, res, next) => {
    let sql = `INSERT INTO GroupAssignment (userID, groupID)
                VALUES (?, ?)`;

    let data = [];
    data[0] = req.body['userID'];
    data[1] = req.body['groupID'];

    db.run(sql, data, function (err, rows) {
        if (err) {
            return res.status(500).json({
                message: 'Something went wrong. Please try again later.',
            });
        }
        res.send(JSON.stringify(rows));
    });
});
//Leaves a group based on user id and group id
app.post('/leavegroup', authUser, async (req, res, next) => {
    let sql = `DELETE   
                FROM
                    GroupAssignment AS GA
               WHERE
                   GA.userID = ? AND GA.groupID = ?`;

    let data = [];
    data[0] = req.body['userID'];
    data[1] = req.body['groupID'];

    db.run(sql, data, function (err, rows) {
        if (err) {
            return res.status(500).json({
                message: 'Something went wrong. Please try again later.',
            });
        }
        res.send(JSON.stringify(rows));
    });
});

//Get users info based on username
app.post('/getuser', async (req, res, next) => {
    let sql = `SELECT userID, username, firstName, lastName, type, isActive FROM Users WHERE username = ?`;
    db.get(sql, [req.body['username']], (err, rows) => {
        if (err) {
            return res.status(500).json({
                message: 'Something went wrong. Please try again later.',
            });
        }
        res.send(JSON.stringify(rows));
    });
});
//Retrieves a list of all course requests
app.get('/getcourserequests/:userid', authUser, authRole('Instructor'), async (req, res, next) => {
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
               WHERE 
                   CR.isActive = 1
                   AND    
                   UI.userID = ${req.params.userid}
               ORDER BY 
                   C.courseName
                   AND
                   U.lastName
                   AND
                   U.firstName`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
        }
        res.send(JSON.stringify(rows));
    });
});

// get all course requests for a student, which are active
app.get('/getactivecourserequests', authUser, async (req, res, next) => {
    let sql = `SELECT
                 CR.requestID,
                 U.firstName || ' ' || U.lastName as studentName,
                 CR.status,
                 CR.isActive
             FROM CourseRequest as CR
                      LEFT JOIN Users U on U.userID = CR.userID
             WHERE CR.status = 1`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
        }
        res.send(JSON.stringify(rows));
    });
});

// get all course requests for a student, which are accepted
app.get('/getusercourserequests/:userid', authUser, async (req, res, next) => {
    // let sql = `SELECT CourseRequest.*
    //           FROM CourseRequest
    //           LEFT JOIN Users U on U.userID = CourseRequest.userID
    //           WHERE U.userID = ${req.params.userid}`;
    let sql = `SELECT *
            FROM CourseRequest CR
            WHERE CR.userID = ${req.params.userid}`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
        }
        res.send(JSON.stringify(rows));
    });
});


app.post('/leavecourse', authUser, async (req, res, next) => {
    let sql = `UPDATE CourseRequest
               SET
                   status = false,
                   isActive = false
               WHERE
                   userID = ?
                   AND
                   courseID = ?`;

    let data = [];
    data[0] = req.body['userID'];
    data[1] = req.body['courseID'];
    db.run(sql, data, function (err, rows) {
        if (err) {
            return res.status(500).json({
                message: 'Something went wrong. Please try again later.',
            });
        } else {
            return res.status(200).json({ message: 'User registered' });
        }
    });
});

//Updates passed course request
app.post('/updatecourserequest', authUser, async (req, res, next) => {
    console.log('Running update course request');

    let sql = `UPDATE CourseRequest
               SET

                   status = ?,
                   isActive = ?,
                   reviewerID = ?
               WHERE
                   requestID = ?`;

    let data = [];
    data[0] = req.body['status'];
    data[1] = req.body['isActive'];
    data[2] = req.body['reviewerID'];
    data[3] = req.body['requestID'];
    db.run(sql, data, function (err, rows) {
        if (err) {
            return res.status(500).json({
                message: 'Something went wrong. Please try again later.',
            });
        } else {
            return res.status(200).json({ message: 'User registered' });
        }
    });
});

//Testing for admin stuff! ------------------------------

//Retrieves a list of all users from the database
app.get('/getusers', authUser, authRole('Admin'), async (req, res, next) => {
    let sql = `SELECT userID, username, firstName, lastName, type, isActive FROM Users`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
        }

        res.send(JSON.stringify(rows));
    });
});

//Gets all courses from the database and sends them to the caller
app.get('/getcourses', authUser, async (req, res) => {
    let sql = `SELECT Courses.*, Users.firstName, Users.lastName
    FROM Courses
    LEFT JOIN Users ON Courses.instructorID = Users.userID`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
        } else {
            res.send(JSON.stringify(rows));
        }
    });
});

// where instructor ID = user id
// where current user = user id in course request

//Gets all courses where the user id is the current user and status is accepted
app.get('/getusercourses/:userid', authUser, async (req, res) => {
    let sql = `SELECT Courses.*
  FROM Courses
    LEFT JOIN CourseRequest CR ON CR.courseID = Courses.courseID
  WHERE CR.status = 1
  AND CR.isActive = 1
  AND CR.userID = ${req.params.userid}`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
        } else {
            res.send(JSON.stringify(rows));
        }
    });
});

//Gets all courses and course requests where the user id is the current user and status is accepted
app.get('/getcoursesandrequests', authUser, async (req, res) => {
    let sql = `SELECT Courses.*, CR.*, Users.firstName, Users.lastName
  FROM Courses, CourseRequest as CR
    LEFT JOIN Users U ON Courses.instructorID = U.userID
    LEFT JOIN Users UI ON UI.userID = CR.userID
  WHERE CR.status = 1`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
        } else {
            res.send(JSON.stringify(rows));
        }
    });
});

// get courses without user data
app.get('/getcoursesonly', authUser, async (req, res) => {
    let sql = `SELECT *
  FROM Courses`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
        } else {
            res.send(JSON.stringify(rows));
        }
    });
});

// get a course from the course table using the course ID
app.get('/getcourse', authUser, async (req, res) => {
    let sql = `SELECT *
  FROM Courses
  WHERE courseId = ?`;

    let data = [];
    data[0] = req.body['courseID'];

    db.all(sql, data, (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
        } else {
            res.send(JSON.stringify(rows));
        }
    });
});

app.get('/getprojectsbycourseid/:courseid', authUser, async (req, res) => {
    //let sql = `SELECT * FROM Projects WHERE courseID = ${req.params.courseid}`;

    let sql = `SELECT Projects.*, Courses.courseName
    FROM Projects
    LEFT JOIN Courses on Courses.courseID = Projects.courseID
    WHERE Projects.courseID = ${req.params.courseid}`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
        } else {
            res.send(JSON.stringify(rows));
        }
    });
});

app.get('/getuserprojects/:userid', authUser, async (req, res) => {
    let sql = `SELECT DISTINCT Projects.*, Courses.courseName
    FROM Projects
    INNER JOIN Courses on Courses.courseID = Projects.courseID
    INNER JOIN Groups G on G.projectID = Projects.projectID
    INNER JOIN GroupAssignment GA on GA.groupID = G.groupID
    WHERE GA.userID = ${req.params.userid}`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
        } else {
            res.send(JSON.stringify(rows));
        }
    });
});

// insert course request into table
app.post('/insertcourserequest', authUser, async (req, res, next) => {
    let sql = `INSERT INTO
  CourseRequest (userID, courseID, instructorID, isActive, reviewerID, status) VALUES (?, ?, ?, ?, ?, ?)`;

    let data = [];
    data[0] = req.body['userID'];
    data[1] = req.body['courseID'];
    data[2] = req.body['instructorID'];
    data[3] = req.body['isActive'];
    data[4] = req.body['reviewerID'];
    data[5] = req.body['status'];

    db.run(sql, data, function (err, rows) {
        if (err) {
            res.status(400).json({ error: err.message });
        } else {
            res.send(JSON.stringify(rows));
        }
    });
});

app.get('/getgroupsbyprojectid/:projectid', authUser, async (req, res) => {
    //let sql = `SELECT * FROM Groups WHERE projectID = ${req.params.projectid}`;

    let sql = `SELECT Groups.*, Projects.projectName
               FROM Groups
               LEFT JOIN Projects on Projects.projectID = Groups.projectID
               WHERE Groups.projectID = ${req.params.projectid}`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
        } else {
            res.send(JSON.stringify(rows));
        }
    });
});

//Updates the user in the database with the passed in information
app.post('/updatecurrentuserbyid/:userid', async (req, res) => {
    let data = [];
    data[0] = req.body['username'];
    data[1] = req.body['firstName'];
    data[2] = req.body['lastName'];
    data[3] = req.body['type'];
    data[4] = req.body['isActive'];

    if (data[0] === 'Admin' && data[1] === 'Sudo' && data[2] === 'Admin') {
        return res.status(500).json({ error: 'Cannot modify Admin account!' });
    }

    let sql = `UPDATE
                  users
              SET
                  username = ?,
                  firstName = ?,
                  lastName = ?,
                  type = ?,
                  isActive = ?
              WHERE
                  userID = ${req.params.userid}`;

    db.run(sql, data, (err) => {
        if (err)
        {
            return res.status(500).json({ error: err.message });
        }
        else
        {
            req.session.user.loggedIn.username = req.body['username'];
            req.session.user.loggedIn.firstName = req.body['firstName'];
            req.session.user.loggedIn.lastName = req.body['lastName'];
            req.session.user.loggedIn.type = req.body['type'];
            req.session.user.loggedIn.isActive = req.body['isActive'];
            return res
                .status(200)
                .json({ message: 'User updated successfully' });
        }
    });
});


//Updates the user in the database with the passed in information
app.post('/updateuserbyid/:userid', authUser, async (req, res) => {
    let data = [];
    data[0] = req.body['username'];
    data[1] = req.body['firstName'];
    data[2] = req.body['lastName'];
    data[3] = req.body['type'];
    data[4] = req.body['isActive'];

    if (data[0] === 'Admin' && data[1] === 'Sudo' && data[2] === 'Admin') {
        return res.status(500).json({ error: 'Cannot modify Admin account!' });
    }

    let sql = `UPDATE
                  users
              SET
                  username = ?,
                  firstName = ?,
                  lastName = ?,
                  type = ?,
                  isActive = ?
              WHERE
                  userID = ${req.params.userid}`;

    db.run(sql, data, (err) => {
        if (err)
        {
            return res.status(500).json({ error: err.message });
        }
        else
        {
            return res
                .status(200)
                .json({ message: 'User updated successfully' });
        }
    });
});

//Deletes the user based on a passed in user id, checks if the passed in user is the admin account
app.post('/deleteuserbyid/:userid', authUser, async (req, res) => {
    let data = [];
    data[0] = req.body['username'];
    data[1] = req.body['firstName'];
    data[2] = req.body['lastName'];
    data[3] = req.body['type'];
    data[4] = req.body['isActive'];

    if (data[0] === 'Admin' && data[1] === 'Sudo' && data[2] === 'Admin') {
        return res.status(500).json({ error: 'Cannot modify Admin account!' });
    }

    let sql = `DELETE FROM users WHERE userID = ${req.params.userid}`;

    db.run(sql, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        } else {
            return res
                .status(200)
                .json({ message: 'User deleted successfully' });
        }
    });
});

//Resets the passed in users password to a default value
app.post('/resetpassword/:userid', async (req, res) => {
    let defaultPassword = 'wildcat123';

    let salt = crypto.randomBytes(16).toString('hex');

    let hash = crypto
        .pbkdf2Sync(defaultPassword, salt, 1000, 64, `sha512`)
        .toString(`hex`);

    let data = [];

    data.push(hash);
    data.push(salt);

    sql = `UPDATE users SET password = ?, salt = ? WHERE userID = ${req.params.userid}`;

    db.run(sql, data, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        } else {
            return res.status(200).json({ message: 'Password reset' });
        }
    });
});

//Gets a list of all active admin requests from the database and returns them
app.get(`/getAdminRequests`, async (req, res) => {

    let sql = `SELECT AdminRequests.*, Users.username, Users.type
               FROM AdminRequests
               LEFT JOIN Users on Users.userID = AdminRequests.userID
               WHERE AdminRequests.isActive = true`;

    db.all(sql, [], (err, rows) => {

        if (err) {
            res.status(400).json({ "error": err.message });
        } else {

            res.send(JSON.stringify(rows));

        }

    });

});

//Updates the admin request database with any requests that have been changed by an admin
app.post(`/updateAdminRequests`, async (req, res) => {


    //Processes the account changes or password resets from the admin requests
    //Adds an error to the error array if there are any failures and returns early.
    req.body.forEach((request) => {

        if (request.status === 'approved') {

            if (request.requestType === 'password') {
                resetPassword(request.userID);
            }

            if (request.requestType === 'account'){
                updateAccountType(request.userID, request.type);
            }
        }
    });

    let db_error = false;
    let  error_msg = "";

    //Updates the admin request table
    req.body.forEach((request) =>{

        if (!db_error) {


            let sql = `UPDATE AdminRequests
                       SET status     = '${request.status}',
                           isActive   = ${request.isActive},
                           reviewerID = ${request.reviewerID}
                       WHERE requestID = ${request.requestID};`;

            db.run(sql, (err) => {
                if (err) {
                    //
                    db_error = true;
                    error_msg = err.message;
                } else {

                    if (request === req.body.at(-1)) {

                        return res.status(200).json({message: "Data updated successfully"});

                    }
                }
            });

            if (db_error) {
                return res.status(500).json({error: error_msg});
            }

        }

    });

});

app.post(`/updatePassword`, async (req, res) => {

    let changePassword = req.body.newPass;
    let userID = req.body.user;

    console.log(changePassword);
    console.log(userID);

    let salt = crypto.randomBytes(16).toString('hex');

    let hash = crypto.pbkdf2Sync(changePassword, salt,
        1000, 64, `sha512`).toString(`hex`);

    let data = []

    data.push(hash);
    data.push(salt);

    sql = `UPDATE users SET password = ?, salt = ? WHERE userID = ${userID}`;

    db.run(sql, data,(err) => {
        if(err){
            return res.status(500).json({error: error_msg});
        } else {
            return res.status(200).json({message: "Password Reset!"});

        }
    });

});

//Submits a request to the admin request table for a student
app.post(`/requestToBeInstructor`, async (req, res) => {
    let userID = req.body.userID;
    let username = req.body.userName;

    let requestCheckSql = `SELECT * FROM AdminRequests WHERE userID = ${userID} AND status = 'pending' AND requestType = 'account';`;

    db.all(requestCheckSql, [], (err, rows) => {

        if (err) {
            return res.status(400).json({ "error": err.message });
        } else {

            if (rows.length < 1) {

                let sql = `INSERT INTO AdminRequests (userID, requestType, status, isActive)
                           values (${userID}, 'account', 'pending', true);`

                db.run(sql, (err) => {
                    if (err) {
                        return res.status(500).json({error: err.message});
                    } else {
                        return res.status(200).json({message: "Request Sent!"});
                    }
                });
            } else {
                return res.status(400).json({error: "Request already awaiting approval!"});
            }
        }

    });

})

//Gets the course, projects, and group information for the admin modal tables
app.get(`/getcourseandgroupinfobyid/:userid`, (req, res) => {

    let userID = req.params.userid;

    let sql = `SELECT GA.userID, G.groupID, G.groupName, P.projectID, P.projectName, P.courseID, C.courseName, C.instructorID, U2.firstName, U2.lastName  FROM GroupAssignment GA
    LEFT JOIN Groups G on GA.groupID = G.groupID
    LEFT JOIN Users U on GA.userID = U.userID
    LEFT JOIN Projects P on G.projectID = P.projectID
    LEFT JOIN Courses C on P.courseID = C.courseID
    LEFT JOIN Users U2 ON C.instructorID = U2.userID
    WHERE GA.userID = ${userID};`

    db.all(sql, [], (err, rows) => {

        if (err) {
            res.status(400).json({ "error": err.message });
        } else {
            res.send(JSON.stringify(rows));
        }

    });

})

//-------------------------------------------------------

app.post('/register', async (req, res, next) => {
    function isEmpty(str) {
        return !str || str.length === 0;
    }

    if (
        isEmpty(req.body['username']) ||
        isEmpty(req.body['firstName']) ||
        isEmpty(req.body['lastName']) ||
        isEmpty(req.body['password']) ||
        isEmpty(req.body['repeatPassword'])
    ) {
        return res
            .status(400)
            .json({ message: 'Missing one or more required arguments.' });
    }

    // Validate user doesn't already exist
    let sql = `SELECT * FROM Users WHERE username = ?`;
    db.get(sql, [req.body['username']], (err, rows) => {
        if (err) {
            return res.status(500).json({
                message: 'Something went wrong. Please try again later.',
            });
        }

        if (rows) {
            return res
                .status(400)
                .json({ message: 'A user of this name already exists' });
        }

        // Validate passwords match
        if (req.body['password'] !== req.body['repeatPassword']) {
            return res
                .status(400)
                .json({ message: 'Given passwords do not match' });
        }

        let salt = crypto.randomBytes(16).toString('hex');

        let hash = crypto
            .pbkdf2Sync(req.body['password'], salt, 1000, 64, `sha512`)
            .toString(`hex`);

        let data = [];

        // Can't use dictionaries for queries so order matters!
        data[0] = req.body['username'];
        data[1] = hash;
        data[2] = req.body['firstName'];
        data[3] = req.body['lastName'];
        //Temporary to create an Instructor user
        data[4] = req.body['userType'];
        data[5] = true;
        data[6] = salt;

        db.run(
            `INSERT INTO Users(username, password, firstName, lastName, type, isActive, salt) VALUES(?, ?, ?, ?, ?, ?, ?)`,
            data,
            function (err, rows) {
                if (err) {
                    return res.status(500).json({
                        message:
                            'Something went wrong. Please try again later.',
                    });
                } else {
                    return res.status(200).json({ message: 'User registered' });
                }
            }
        );
    });
});

// change the password
app.post('/changepass', async (req, res, next) => {

    function isEmpty(str) {
        return (!str || str.length === 0 );
      }

    if(
        isEmpty(req.body["currentpassword"]) ||
        isEmpty(req.body["newpassword"]) ||
        isEmpty(req.body["repeatpassword"]) ||
        isEmpty(req.body["userID"])) {
        return res.status(400).json({message: 'Missing one or more required arguments.'});
    }


    // Validate passwords match
    if(req.body["newpassword"] !== req.body["repeatpassword"]) {
        return res.status(400).json({message: 'Given passwords do not match'});
    }

    // get the current password from database
    let sql1 = `SELECT * FROM Users WHERE userID = ?`;

    // make sure the current password is correct
    db.get(sql1, [req.body["userID"]], (err, rows) => {
        if (err) {
            console.log(rows);
        return res.status(500).json({message: 'Something went wrong. Please try again later.'});
        }

        if(rows) {
            salt = rows['salt']

            let hash = crypto.pbkdf2Sync(req.body["currentpassword"], salt,
            1000, 64, `sha512`).toString(`hex`);

            if(rows['password'] !== hash)
            {
                return res.status(400).json({message: 'Current password is incorrect.'});
                //return res.status(200).json({user: rows});
            }
            else
            {
                // salt the password
                let salt2 = crypto.randomBytes(16).toString('hex');

                // hash is what will be in the database for the password
                let hash2 = crypto.pbkdf2Sync(req.body["newpassword"], salt2,
                    1000, 64, `sha512`).toString(`hex`);


                let data = [];
                data[0] = hash2;
                data[1] = salt2;
                data[2] = req.body["userID"];

                console.log(data);
                // set the new password
                db.run(`UPDATE Users SET password = ?, salt = ? WHERE userID = ?`, data, function(err, rows)
                {
                    if (err)
                    {
                        return res.status(500).json({message: 'Something went wrong. Please try again later.'});
                    }
                    else
                    {
                        return res.status(200).json({message: "Password updated"});
                    }
                });
            }
        }
        else {
            return res.status(400).json({message: 'Current password is incorrect.'});
        }
    });
});


// change active status
app.post('/changeactive', async (req, res, next) => {

    /*function isEmpty(str) {
        return (!str || str.length === 0 );
    }

    if(
        isEmpty(req.body["activeStat"]) ||
        isEmpty(req.body["userID"])) {
        return res.status(400).json({message: 'Missing one or more required arguments.'});
    }*/

    let data = [];
    data[0] = req.body['activeStat'];
    data[1] = req.body["userID"];

    // change the user active status
    db.run(`UPDATE Users SET isActive = ? WHERE userID = ?`, data, function(err, rows)
    {
        if (err)
        {
            return res.status(500).json({message: 'Something went wrong. Please try again later.'});
        }
        else
        {
            console.log(req.session.user.loggedIn)
            req.session.user.loggedIn.isActive = req.body['activeStat'];
            return res.status(200).json({message: "User active status is changed"});
        }
    });



});



app.post('/login', async (req, res, next) => {
    function isEmpty(str) {
        return !str || str.length === 0;
    }

    if (isEmpty(req.body['username']) || isEmpty(req.body['password'])) {
        return res
            .status(400)
            .json({ message: 'Missing one or more required arguments.' });
    }

    let sql = `SELECT * FROM Users WHERE username = ?`;
    db.get(sql, [req.body['username']], (err, rows) => {
        if (err) {
            return res.status(500).json({
                message: 'Something went wrong. Please try again later.',
            });
        }

        if (rows) {

            //Check if the user has an outstanding password request
            let checkSql = `SELECT
                                *
                            FROM
                                AdminRequests
                            WHERE
                                userID = ${rows['userID']}
                              AND
                                requestType = 'password'
                              AND
                                status != 'completed'
                            ORDER BY
                                requestID DESC
                                LIMIT 1`;


            db.get(checkSql, [], (err, passrows) => {
                if(passrows)
                {
                    //Change the latest password request to completed
                    let updateSql = `UPDATE AdminRequests SET status = 'completed' WHERE requestID = ${passrows['requestID']}`
                    db.run(updateSql, [], function (err, updaterows) {
                            if (err)
                            {
                                console.log(err);
                                return res.status(500).json({
                                    message:
                                        'Something went wrong. Please try again later.',
                                });
                            }
                    });
                }
            });
            console.log("Got to salt")
            salt = rows['salt'];

            let hash = crypto
                .pbkdf2Sync(req.body['password'], salt, 1000, 64, `sha512`)
                .toString(`hex`);

            if (rows['password'] === hash) {
                //set user session variable
                //res.cookie('userid',rows['userID'], {maxAge:86400, httpOnly: true});

                ssn = req.session;
                //res.send(req.cookies)
                ssn.user = { loggedIn: rows };
                ssn.save();
                return res.status(200).json({ user: rows });
            } else {
                return res
                    .status(401)
                    .json({ message: 'Username or password is incorrect.' });
            }
        } else {
            return res
                .status(401)
                .json({ message: 'Username or password is incorrect.' });
        }
    });
});

//Sends a request to change password
app.get("/requestPassword/:username", async (req, res, next) => {
    let sql = `SELECT userID, username, firstName, lastName, type, isActive FROM Users WHERE username = "${req.params.username}"`;
    db.get(sql, (err, rows) => {
        if (rows)
        {
            //Check AdminRequest table for a pending or approved request
            let checkSql = `SELECT
                                *
                            FROM
                                AdminRequests
                            WHERE
                                userID = ?
                              AND
                                requestType = 'password'
                              AND
                                status != 'completed'
                            ORDER BY
                                requestID DESC
                                LIMIT 1`;
            let checkData = [];
            checkData[0] = rows["userID"];

            //Check if the user has a pending or accepted password reset request
            db.get(checkSql, checkData, (err, checkrows) =>
            {
                if (err)
                {
                    return res.status(400).json({"error": err.message});
                }
                if(checkrows)
                {
                    if (checkrows["status"] === "approved")
                    {
                        return res.status(200).json({message: 'accepted'});
                    }
                    else if (checkrows["status"] === "pending")
                    {
                        return res.status(200).json({message: 'pending'});
                    }
                    else if(checkrows["status"] === "denied")
                    {
                        return res.status(200).json({message: 'denied'});
                    }
                }
                else
                {
                    let sql2 = `INSERT INTO AdminRequests (userID, requestType, status, isActive, reviewerID)
                                    VALUES (?, 'password', 'pending', true, null)`
                    let data = [];
                    data[0] = rows["userID"];
                    db.get(sql2, data, function(err, insertrows) {
                        if (err)
                        {
                            return res.status(400).json({"error": err.message });
                        }
                        return res.status(200).json({message: 'success'});
                    });
                }

            });
        }
        else
        {
            return res.status(200).json({message: 'incorrect'});
        }
    });
});

app.post('/createGroup', async (req, res, next) => {
    function isEmpty(str) {
        return !str || str.length === 0;
    }

    console.log('Running createGroup');

    let data = [];

    // Can't use dictionaries for queries so order matters!
    data[0] = req.body['groupName'];
    data[1] = req.body['isActive'];
    data[2] = req.body['projectID'];

    console.log(data);

    db.run(
        `INSERT INTO Groups(groupName, isActive, projectID) VALUES(?, ?, ?)`,
        data,
        function (err, rows) {
            if (err) {
                return res.status(500).json({
                    message: 'Something went wrong. Please try again later.',
                });
            } else {
                console.log(data);
                return res.status(200).json({ group: data });
            }
        }
    );
});

app.post('/createCourse', authUser, async (req, res, next) => {
    function isEmpty(str) {
        return !str || str.length === 0;
    }

    console.log('Running createCourse');

    let data = [];

    // Can't use dictionaries for queries so order matters!
    data[0] = req.body['courseName'];
    data[1] = req.body['isActive'];
    data[2] = req.body['instructorID']; //Edited by Tage for course creation
    data[3] = req.body['description']; //Edited by Tage for course creation

    console.log(data);

    db.run(
        `INSERT INTO Courses(courseName, isActive, instructorID, description) VALUES(?, ?, ?, ?)`,
        data,
        function (err, rows) {
            if (err) {
                return res.status(500).json({
                    message: 'Something went wrong. Please try again later.',
                });
            } else {
                return res.status(200).json({ course: data });
            }
        }
    );
});

app.post('/createProject', authUser, async (req, res, next) => {
    function isEmpty(str) {
        return !str || str.length === 0;
    }

    console.log('Running createProject');

    let data = [];

    // Can't use dictionaries for queries so order matters!
    data[0] = req.body['projectName'];
    data[1] = req.body['isActive'];
    data[2] = req.body['courseID'];
    data[3] = req.body['description'];

    console.log(data);

    db.run(
        `INSERT INTO Projects(projectName, isActive, courseID, description) VALUES(?, ?, ?, ?)`,
        data,
        function (err, rows) {
            if (err) {
                return res.status(500).json({
                    message: 'Something went wrong. Please try again later.',
                });
            } else {
                console.log(rows);
                return res.status(200).json({ project: data });
            }
        }
    );
});

app.post('/clock', authUser, async (req, res, next) => {
    function isEmpty(str) {
        return !str || str.length === 0;
    }

    let isValid = true;
    let isClockin = req.body['timeIn'] !== null;
    let sql = `SELECT * FROM TimeCard WHERE UserID = ?`;
    db.all(sql, [req.body['userID']], (error, rows) => {
        if (error) {
            return res.status(500).json({
                message: 'Something went wrong. Please try again later.',
            });
        }

        if (isClockin) {
            console.log('clocking in.');
            rows.forEach((row) => {
                isValid = row['timeOut'] !== null;
            });

            if (!isValid) {
                return res.status(400).json({
                    message:
                        'you have an outstanding clock in. Please clock out.',
                });
            }

            let data = [];

            data[0] = req.body['timeIn'];
            data[1] = false;
            data[2] = req.body['createdOn'];
            data[3] = req.body['userID'];
            data[4] = req.body['description'];
            data[5] = req.body['groupID'];

            db.run(
                `INSERT INTO TimeCard(timeIn, isEdited, createdOn, userID, description, groupID) VALUES(?, ?, ?, ?, ?, ?)`,
                data,
                function (err, value) {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({
                            message:
                                'Something went wrong. Please try again later.',
                        });
                    } else {
                        return res
                            .status(200)
                            .json({ message: 'Clocked in successfully.' });
                    }
                }
            );
        } else {
            //clocking out
            console.log('clocking out.');
            let isNullTimeOut = false;
            let ID = 0;
            rows.every((row) => {
                isNullTimeOut = row['timeOut'] === null;
                if (isNullTimeOut) {
                    ID = row['timeslotID'];
                    return false;
                }
                return true;
            });

            isValid = isNullTimeOut;

            if (!isValid) {
                return res.status(400).json({
                    message: 'No outstanding clock in. Please clock in first.',
                });
            }

            let data = [];
            data[0] = req.body['timeOut'];
            data[1] = req.body['description'];
            data[2] = ID;

            db.run(
                `UPDATE TimeCard SET timeOut = ? , description = ? WHERE timeslotID = ? `,
                data,
                function (err, value) {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({
                            message:
                                'Something went wrong. Please try again later.',
                        });
                    } else {
                        return res
                            .status(200)
                            .json({ message: 'Clocked out successfully.' });
                    }
                }
            );
        }
    });
});

app.get('/getgroupsbyprojectid/:projectid', authUser, async (req, res) => {
    //let sql = `SELECT * FROM Groups WHERE projectID = ${req.params.projectid}`;

    let sql = `SELECT Groups.*, Projects.projectName
               FROM Groups
               LEFT JOIN Projects on Projects.projectID = Groups.projectID
               WHERE Groups.projectID = ${req.params.projectid}
               ORDER BY Groups.groupName`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
        } else {
            res.send(JSON.stringify(rows));
        }
    });
});

//Gets a list of all group assignments for a user
app.get('/getgroupassignments/:userID', authUser, async (req, res) => {
    let sql = `SELECT 
                   userID, groupID
               FROM 
                   GroupAssignment
               WHERE 
                   userID = ${req.params.userID}`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({
                message: 'Something went wrong. Please try again later.',
            });
        }
        res.send(JSON.stringify(rows));
    });
});

//Gets a list of all groups a user is in
app.get('/getusergroups/:userID', authUser, async (req, res) => {
    let sql = `SELECT DISTINCT
                    G.groupID,
                    G.groupName,
                    G.isActive,
                    P.projectID,
                    P.projectName,
                    C.courseName
                FROM
                    GroupAssignment AS GA
                        LEFT JOIN Groups G on GA.groupID = G.groupID
                        LEFT JOIN Projects P on G.projectID = P.projectID
                        LEFT JOIN CourseRequest CR on GA.userID = CR.userID AND P.courseID = CR.courseID
                        LEFT JOIN Courses C on CR.courseID = C.courseID
                WHERE
                        GA.userID = ${req.params.userID}
                        AND
                        CR.isActive = true
                        AND
                        CR.status = true`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({
                message: 'Something went wrong. Please try again later.',
            });
        }
        res.send(JSON.stringify(rows));
    });
});

//Gets a list of all users in a group
app.get('/getgroupusers/:groupID', authUser, async (req, res) => {
    let sql = `SELECT
                   U.userID,
                   U.username,
                   U.firstName,
                   U.lastName
               FROM
                   GroupAssignment AS GA
                       LEFT JOIN Groups G on GA.groupID = G.groupID
                       LEFT JOIN Users U on GA.userID = U.userID
               WHERE
                   GA.groupID = ${req.params.groupID}
               ORDER BY 
                   U.userID`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({
                message: 'Something went wrong. Please try again later.',
            });
        }
        res.send(JSON.stringify(rows));
    });
});

//Gets a list of all time cards for a users group
app.post('/getusergrouptimecards', authUser, async (req, res) => {
    console.log(
        'groupID: ' + req.body['groupID'] + ' userID: ' + req.body['userID']
    );
    let sql = `SELECT
                   *
               FROM
                   TimeCard
               WHERE
                   userID = ? AND groupID = ?
               ORDER BY     
                   userID`;
    let data = [];
    data[0] = req.body['userID'];
    data[1] = req.body['groupID'];

    db.all(sql, data, (err, rows) => {
        if (err) {
            return res.status(500).json({
                message: 'Something went wrong. Please try again later.',
            });
        }
        res.send(JSON.stringify(rows));
    });
});

//Creates a new time card
app.post('/createtimecard', authUser, async (req, res, next) => {
    function isEmpty(str) {
        return !str || str.length === 0;
    }

    let data = [];

    // Can't use dictionaries for queries so order matters!
    data[0] = req.body['timeIn'];
    data[1] = req.body['timeOut'];
    data[2] = 0;
    data[3] = req.body['createdOn'];
    data[4] = req.body['userID'];
    data[5] = req.body['description'];
    data[6] = req.body['groupID'];

    console.log(data);

    db.run(
        `INSERT INTO TimeCard(timeIn, timeOut, isEdited, createdOn, userID, description, groupID) VALUES(?, ?, ?, ?, ?, ?, ?)`,
        data,
        function (err, rows) {
            if (err) {
                return res.status(500).json({
                    message: 'Something went wrong. Please try again later.',
                });
            }
            res.send(JSON.stringify(rows));
        }
    );
});

//Delete specified time card
app.post('/deletetimecard', authUser, async (req, res, next) => {
    function isEmpty(str) {
        return !str || str.length === 0;
    }

    let data = [];

    // Can't use dictionaries for queries so order matters!
    data[0] = req.body['timeslotID'];

    db.run(
        `DELETE FROM TimeCard WHERE timeslotID = ?`,
        data,
        function (err, rows) {
            if (err) {
                return res.status(500).json({
                    message: 'Something went wrong. Please try again later.',
                });
            }
            res.send(JSON.stringify(rows));
        }
    );
});

//Returns a list of all courses for an instructor
app.get('/getinstructorcourses/:userID', authUser, async (req, res) => {
    let sql = `SELECT 
                  courseID, courseName, instructorID, description
              FROM
                  Courses
              WHERE
                  instructorID = ${req.params.userID}
                  AND 
                  isActive = 1
              ORDER BY 
                  courseName`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({
                message: 'Something went wrong. Please try again later.',
            });
        }
        res.send(JSON.stringify(rows));
    });
});
//Returns a list of all course requests for a course that have been accepted
app.get('/getcoursestudents/:courseID', authUser, async (req, res) => {
    let sql = `SELECT DISTINCT CR.requestID,
                      C.courseName,
                      U.firstName || ' ' || U.lastName as studentName,
                      CR.status,
                      CR.isActive
               FROM CourseRequest as CR
                        LEFT JOIN Users U on CR.userID = U.userID
                        LEFT JOIN Courses C on CR.courseID = C.courseID
               WHERE CR.status = 1
                 AND CR.isActive = 1
                 AND CR.courseID = ${req.params.courseID}
               GROUP BY studentName
               ORDER BY studentName`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({
                message: 'Something went wrong. Please try again later.',
            });
        }
        res.send(JSON.stringify(rows));
    });
});

//Returns a list of projects for an instructor
app.get('/getinstructorprojects/:userID', authUser, async (req, res) => {
    let sql = `SELECT
                   P.projectName,
                   C.courseName,
                   P.description,
                   P.projectID
               FROM Projects P
                        LEFT JOIN Courses C on P.courseID = C.courseID
               WHERE
                   C.instructorID = ${req.params.userID}
                 AND
                   P.isActive = 1
                 AND
                   C.isActive = 1
               ORDER BY
                   C.courseName, P.projectName`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({
                message: 'Something went wrong. Please try again later.',
            });
        }
        res.send(JSON.stringify(rows));
    });
});

//Updates a timecard
app.post('/updatetimecard', authUser, async (req, res, next) => {
    let sql = `UPDATE TimeCard
               SET

                   timeIn = ?,
                   timeOut = ?,
                   description = ?
               WHERE
                   timeslotID = ?`;

    let data = [];
    data[0] = req.body['timeIn'];
    data[1] = req.body['timeOut'];
    data[2] = req.body['description'];
    data[3] = req.body['timeslotID'];
    db.run(sql, data, function (err, rows) {
        if (err) {
            return res.status(500).json({
                message: 'Something went wrong. Please try again later.',
            });
        } else {
            return res.status(200).json({ message: 'User registered' });
        }
    });
});

//Resets the users password to a default password;
const resetPassword = ((userID, newPass) => {

    let changePassword = '';

    if (newPass != null){
        changePassword = newPass;
    } else {
        changePassword = 'wildcat123';
    }

    let salt = crypto.randomBytes(16).toString('hex');

    let hash = crypto.pbkdf2Sync(changePassword, salt,
        1000, 64, `sha512`).toString(`hex`);

    let data = []

    data.push(hash);
    data.push(salt);

    sql = `UPDATE users SET password = ?, salt = ? WHERE userID = ${userID}`;

    db.run(sql, data,(err) => {
        if(err){
            return {passed: false, msg: err.message}
        } else {
            return  {passed: true, msg: "Password Reset!"}
        }
    });


});

//Updates the user type from a student to an instructor or vice versa
const updateAccountType = ((userID, accountType) => {

    let updatedType = '';

    if (accountType === 'Basic') {
        updatedType = 'Instructor';
    }

    if (accountType === 'Instructor'){
        updatedType = 'Basic';
    }

    let sql = `UPDATE Users SET type = '${updatedType}' WHERE userID = ${userID};`

    db.run(sql, (err) => {
        if(err){
            return  {passed: false, msg: err.message}
        } else {
            return {passed: true, msg: "Account Updated!"}
        }
    });

});


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
require('./database/seed.js');
