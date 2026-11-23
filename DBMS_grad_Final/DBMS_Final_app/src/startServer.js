/*James Letts
Database Management Systems
12/04/2026
Final Project*/

//******************************************************************************
//*** set up an HTTP server off port 3001
//******************************************************************************
const express = require('express');
const session = require('express-session');
const app = express();

const { PORT, SI_SECRET_KEY } = require('./envParse.js');

const login = require('./loginServer.js');
const connect = require('./connect.js');

const fsp = require("fs").promises; // Use fs/promises for async/await file operations

//*** create form parser
// Using express's built-in body parser for simplicity and consistency
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: SI_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,    // 24 hours
        httpOnly: false,
        sameSite: 'lax'
    }
}));

const path = require("path");

//******************************************************************************
//*** File system module used for accessing files in nodejs (using promises API)
//******************************************************************************

// Modified to be async and use await fsp.readFile
async function readAndServe(path, res) {
    try {
        const data = await fsp.readFile(path);
        res.setHeader('Content-Type', 'text/html');
        res.end(data);
    } catch (err) {
        console.error("File Read Error:", err);
        res.status(404).send("<html><body><h1>404 Not Found</h1><p>The file " + path + " could not be served.</p></body></html>");
    }
}


//******************************************************************************
//*** This routing table handles all the GET requests from the browser
//******************************************************************************

// All GET handlers now use async/await by calling the async readAndServe utility

// Route Directory
app.get("/", async (req, res) => {
    console.log("User called home");
    await readAndServe("./pages/home.html", res);
});

// Login Page GET
app.get("/login", async (req, res) => {
    await readAndServe("./pages/login.html", res);
});

// Register a new user page GET
app.get("/register", async (req, res) => {
    await readAndServe("./pages/register.html", res);
});

app.get("/placeholder", async (req, res) => {
    await readAndServe("./pages/placeholder.html", res);
});

//******************************************************************************
//*** This routing table handles all the POST requests from the browser
//******************************************************************************

app.post("/login", async (req, res, next) => {
    return await login.loginFunction(req, res, next);
});

app.post("/register", async (req, res, next) => {
    return await login.registerFunction(req, res, next)
});

// --- Global Error Handler Middleware ---
// Kept as a fallback for non-route-specific errors or errors passed by next()
app.use((err, req, res, next) => {
    // Log the error stack for debugging purposes
    console.error(err.stack);
    res.status(500).json({ error: 'An unexpected server error occurred.', details: err.message });
});

app.use("/static", express.static(path.join(__dirname, "src")));

//*** set up an HTTP server off port 3000
app.listen(PORT, function () {
    console.log("NodeJS app listening on port " + PORT);
});