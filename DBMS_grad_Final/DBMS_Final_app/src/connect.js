/*James Letts
Database Management Systems
12/04/2026
Final Project*/

// mysql.js - The Database Connection Pool Module

const e = require('express');
const { DB_HOST, DB_USER, DB_PASSWORD, 
        DB_PATH, DB_CONNECTION_LIMIT, DB_QUEUE_LIMIT
} = require('./envParse.js');

console.log(DB_HOST);
const mysql = require('mysql2/promise');
// Configuration details
const dbConfig = {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD, // !! CHANGE THIS TO YOUR ACTUAL PASSWORD !!
    database: DB_PATH,
    // Connection Pool settings are optional but good practice
    waitForConnections: true, 
    connectionLimit: DB_CONNECTION_LIMIT,
    queueLimit: DB_QUEUE_LIMIT
};

// Create and export the connection pool
const pool = mysql.createPool(dbConfig);

// A simple check to ensure the pool is working on startup
pool.getConnection()
    .then(connection => {
        console.log("Database Pool: MySQL connection successful and pool established.");
        connection.release(); // Release the test connection immediately
    })
    .catch(err => {
        console.error("Database Pool Error: Could not connect to MySQL! Check credentials and if the server is running.", err.message);
    });


// Functions to interact with the Database

// Get the password and salt from a Database
async function getPasswordHash(username) {
    console.log("Getting Password Hash");
    try{
        //execute an SQL query to retrieve the password_hash and salt
        const [rows] = await pool.execute(
            `SELECT password_hash, salt 
            FROM user WHERE username = ?`, 
            [username]);
        
        //if no user is found, return null
        if (rows.length == 0) return null;

        //return the password_hash and salt from the found user record
        console.log(rows[0])
        return{
            password_hash: rows[0].password_hash,
            salt: rows[0].salt
        };
    }catch (err){
        console.error("Password Hash Error:", err);
        return -1;
    }
}

//Add a new user to the database
async function createUser(username, password_hash, salt, email){
    console.log("Creating User");
    try{
        //execute an SQL query to add anew user with usrnm, pswd, salt, and email
        const [result] = await pool.execute(
            `INSERT INTO user (username, password_hash, salt, email) 
            VALUES (?, ?, ?, ?)`, 
            [username, password_hash, salt, email]);

        return result.insertID;

    }catch (err){
        console.error("Create User Error:", err);
        return -1;
    }
}

//Retrieve a user via their userID
async function getUserByID(userID){
    console.log("Getting User Via ID");
    try{
        //execute an SQL query that selects userID, username, and email for a specific userID
        const [rows] = await pool.execute(
            `SELECT userID, username
            FROM user 
            WHERE userID = ?`, 
            [userID]);
        //if found, the first row is returned
        //if not, null is returned
        return rows[0] || -1;
    }catch (err){
        console.error("Get User Error:", err);
        return -1;
    }
}

async function getUserID(username) {
    try{
        const [rows] = await pool.execute(
            `SELECT userID
            FROM user 
            WHERE username = ?`, 
            [username]);
        return rows[0] || null;
    }catch (err){
        console.error("Get User Error:", err);
        return -1;
    }
}

module.exports = { getPasswordHash, createUser, getUserByID, getUserID }
