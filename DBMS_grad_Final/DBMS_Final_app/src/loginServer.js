/*James Letts
Database Management Systems
12/04/2026
Final Project*/

const crypto = require('crypto')
const connect = require('./connect.js');

async function loginFunction(req, res, next) {
    // Get Username req.body.uname
    // Get Password req.body.psw
    // Get cookie req.body.remember (Either 'on' or DNE)
    const username = req.body.uname;
    const password = req.body.psw;
    const shouldRemember = req.body.remember;
    
    // Validate all inputs
    if(!validateUsername(username)) {
        return res.status(401).json({ error: 'Invalid username or password.' });
    }

    if(!validatePassword(password)) {
        return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // Return any unnecessary mistakes

    // Check if the username exists
    if (!(await connect.getUserID(username))) {
        return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // Get the stored hashed password and salt
    const { password_hash, salt } = await connect.getPasswordHash(username);

    // Hash the inputted password
    const inputHash = hashInputtedPassword(password, salt);

    // Check if the password is incorrect
    if(inputHash != password_hash) {
        return res.status(401).json({ error: 'Invalid username or password.' });
    }
    
    // Correct Login Info
    const userID = await connect.getUserID(username);
    if(userID == -1) {
        console.log("Unable to grab userID");
    }

    // Return a cookie with login information (If succeed)
    req.session.userID = userID;
    req.session.username = username;

    // Change duration depending on remember me
    if(shouldRemember) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
    } else {
        req.session.cookie.maxAge = 24 * 60 * 60 * 1000;
    }
    // Return an error message otherwise
    req.session.save(err => {
        if (err) return next(err);
        return res.redirect('/?user=' + username);
    });

}

async function registerFunction(req, res, next) {
    const username = req.body.uname;
    const email = req.body.email;
    const password = req.body.psw1;
    const shouldRemember = req.body.remember;

    // User sends username, email, password, remember

    // Validate: Username, email, password
    if(!validateUsername(username)) {
        return res.status(401).json({ error: 'Invalid username.' });
    }

    if(!validateEmail(email)) {
        return res.status(401).json({ error: 'Invalid Email.' });
    }

    if(!validatePassword(password)) {
        return res.status(401).json({ error: 'Password.' });
    }

    // Check if the email and username already exists

    // Hash the password
    const { salt, hash } = hashNewPassword(password);

    // Add everything to the database
    const success = await connect.createUser(username, hash, salt, email);
    if (success == -1) {
        return res.status(401).json({ error: 'Error Creating User Account' });
    }

    // Return a cookie with login information (If succeed)
    req.session.userID = {"userID": await connect.getUserID(username)};
    req.session.username = username;

    // Change duration depending on remember me
    if(shouldRemember) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
    } else {
        req.session.cookie.maxAge = 24 * 60 * 60 * 1000;
    }
    // Return an error message otherwise
    req.session.save(err => {
        if (err) return next(err);
        return res.redirect('/?user=' + username);
    });

}

function validateUsername(username) {
    // No empty strings
    if (username == "") {
        return false;
    }

    // Check that the length is correct (Must be between 8 and 40)
    if (username.length < 8 || username.length > 40) {
        return false;
    } 

    // Check for illegal inputs (Allow only alpha-numeric + nonstarting spaces, hyphens, and understores)
    const alphaNum = /^[A-Za-z0-9][A-Za-z0-9 _-]*$/
    return alphaNum.test(username)
}

function validatePassword(password) {
    // No empty strings
    if (password == "") {
        return false;
    }

    // Check that the length is correct (Must be between 8 and 24)
    if (password.length < 8 || password.length > 25) {
        return false;
    }

    // Allow any character in the password, we will hash the function so the inputs don't matter
    return true
}

function validateEmail(email) {
    if (email == "") {
        return false;
    }

    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email)
}

// Hash a password and generate a salt
function hashNewPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');

    const hash = crypto.scryptSync(password, salt, 80).toString('hex');

    return { salt, hash };
}

// Hash a password with a given salt
function hashInputtedPassword(password, salt) {
    return crypto.scryptSync(password, salt, 80).toString('hex');
}

// Check if a password matches the hash in the DB
function verifyPassword(password, salt, hash) {
    const hashedPassword = crypto.scryptSync(password, salt, 80).toString('hex');
    return hashedPassword === hash;
}

module.exports = { loginFunction, registerFunction };