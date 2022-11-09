const { Database } = require('sqlite3');

const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database(
    './database/main.db',
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the main database.');
    }
);

db.run(`CREATE TABLE IF NOT EXISTS Users(userID INTEGER PRIMARY KEY, 
                            username TEXT NOT NULL,
                            password TEXT NOT NULL,
                            firstName TEXT NOT NULL,
                            lastName TEXT NOT NULL,
                            type TEXT NOT NULL,
                            isActive BOOL NOT NULL,
                            salt TEXT NOT NULL);`);

db.run(`CREATE TABLE IF NOT EXISTS TimeCard(timeslotID INTEGER PRIMARY KEY, 
                            timeIn TEXT NOT NULL,
                            timeOut TEXT,
                            isEdited bool NOT NULL,
                            createdOn TEXT NOT NULL,
                            userID INTEGER NOT NULL,
                            description TEXT, 
                            groupID INTEGER NOT NULL);`);

db.run(`CREATE TABLE IF NOT EXISTS Groups(groupID INTEGER PRIMARY KEY,
                            groupName TEXT NOT NULL,
                            isActive BOOL NOT NULL,
                            projectID INTEGER NOT NULL);`);

db.run(`CREATE TABLE IF NOT EXISTS Courses(courseID INTEGER PRIMARY KEY, 
                            courseName TEXT NOT NULL,
                            isActive BOOL NOT NULL,
                            instructorID INTEGER NOT NULL,
                            description TEXT);`);

db.run(`CREATE TABLE IF NOT EXISTS Projects(projectID INTEGER PRIMARY KEY, 
                            projectName TEXT NOT NULL,
                            isActive BOOL NOT NULL,
                            courseID INTEGER NOT NULL,
                            description TEXT);`);

db.run(`CREATE TABLE IF NOT EXISTS CourseRequest(requestID INTEGER PRIMARY KEY, 
                                userID INTEGER NOT NULL,
                                courseID INTEGER NOT NULL,
                                instructorID INTEGER NOT NULL,
                                isActive BOOL NOT NULL,
                                reviewerID INTEGER,
                                status BOOL NOT NULL);`);

db.run(`CREATE TABLE IF NOT EXISTS GroupAssignment(
                                    groupAssignmentID INTEGER PRIMARY KEY,
                                    userID INTEGER NOT NULL, 
                                    groupID INTEGER NOT NULL
                                    );
                                `);

// add super user to database for default admin functions
// username: Admin pass: admin
db.run(
    `INSERT INTO Users (username,
                        password,
                        firstName,
                        lastName,
                        type,
                        isActive,
                        salt)
                SELECT 'Admin', 
                        '063f475a51d8795c71e0c5ed5e8eda09a2294825a3c4ba24221be06e8d1e9a07c74d693372ad8c7ad7f13bbdbf9da924a7bd77e71bc28ea82335a5f08214513b', 
                        'Sudo',
                        'Admin',
                        'Admin',
                        true, 
                        '0dc02b66b207ebf3b6a789af5e835007'
                    WHERE NOT EXISTS(SELECT 1 FROM Users WHERE username = 'Admin')`
);

db.run(`CREATE TABLE IF NOT EXISTS AdminRequests(
                                requestID INTEGER PRIMARY KEY, 
                                userID INTEGER NOT NULL, 
                                requestType TEXT NOT NULL,
                                status Text NOT NULL,
                                isActive BOOL NOT NULL,
                                reviewerID INTEGER);`

);
