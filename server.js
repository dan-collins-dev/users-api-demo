"use strict";

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import cors from "cors";

const app = express();
const port = 8080;

/*
    Middleware used to enable and configure 
    Cross-Origin Resource Sharing (CORS). As is,
    anyone can make calls to our API. We can pass
    an object as a paramter to cors() which has
    settings that we can define.
    
    For instance:

    corsOptions = {
        origin: "http://localhost:8080"
    }

    app.use(cors(corsOptions))

    This sets the API to only allow requests from this
    domain. There are other available congifuration options
    which I recommend researching.
*/
app.use(cors());

// Necessary middleware that tells express how to
// read the body of an incoming request.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Constructing our filepath to be cross-platform friendly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersFilePath = path.join(__dirname, "data", "users.json");

// Helper function to get our user data
async function getUsers() {
    try {
        const userData = await fs.readFile(usersFilePath);
        return JSON.parse(userData);
    } catch (error) {
        console.error(error);
    }
}

// Helper function to save our user data
async function saveUsers(users) {
    try {
        await fs.writeFile(usersFilePath, JSON.stringify(users));
    } catch (error) {
        console.error(error.message);
    }
}

// Helper function to create and return a
// simple id based on the sum of all the
// existing user ids
async function createUserId() {
    const users = await getUsers();
    const userIds = users.map((user) => user.id);

    return Math.max(...userIds) + 1;
}

// A factory function to easily create our users.
// We are going to pass in the body of our request
// as an argument
async function createUser(reqBody) {
    return {
        id: await createUserId(),
        firstName: reqBody.firstName,
        lastName: reqBody.lastName,
        company: reqBody.company,
        email: reqBody.email,
        isActive: reqBody.isActive,
        department: reqBody.department
    };
}

// GET - returns all users
app.get("/api/users", async (req, res) => {
    try {
        const users = await getUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
    }
});

// GET BY ID - returns a user with a provided id if it
app.get("/api/users/{:id}", async (req, res) => {
    const id = req.params.id;

    // This check is to ensure that the id passed in
    // is a number
    if (typeof id !== "number") {
        return res.status(400).json("Bad Request");
    }

    try {
        const users = await getUsers();
        const user = users.find((user) => user.id === parseInt(id));

        if (!user) {
            return res
                .status(404)
                .json(`Employee with id of ${id} does not exist.`);
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
    }
});

// POST
app.post("/api/users", async (req, res) => {
    if (!req.body) {
        return res.status(400).json("Missing body");
    }

    // We are going to require all fields for our POST
    const requiredFields = [
        "firstName",
        "lastName",
        "company",
        "email",
        "isActive",
        "department",
    ];

    // Here we're iterating over the required
    // fields and making sure that they are
    // in the body of the request.
    const missingField = requiredFields.find(
        (field) =>
            req.body[field] === undefined ||
            req.body[field] === null ||
            req.body[field] === "",
    );

    // If a POST request is missing a field
    // we're going to return the first occuring
    // field that is missing.
    if (missingField) {
        return res.status(400).json(`${missingField} is required`);
    }

    try {
        const users = await getUsers();
        const newUser = await createUser(req.body)
        
        users.push(newUser);
        await saveUsers(users);
        
        res.status(201).json(newUser);
    } catch (error) {
        console.error(error);
    }
});

// PUT

// DELETE

// Serve API
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log("Press CTRL+C to end the process");
});
