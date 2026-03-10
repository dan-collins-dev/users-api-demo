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

// Constructing our filepath to be cross-platform friendly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersFilePath = path.join(__dirname, "data", "users.json");

// Helpers to get and save our user data
async function getUsers() {
    try {
        const userData = await fs.readFile(usersFilePath);
        return JSON.parse(userData);
    } catch (error) {
        console.error(error);
    }
}

async function saveUsers(users) {
    try {
        await fs.writeFile(logsFilePath, JSON.stringify(users));
    } catch (error) {
        console.error(error.message);
    }
}

// GET
app.get("/api/users", async (req, res) => {
    try {
        const users = await getUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
    }
});

// GET BY ID
app.get("/api/users/{:id}", async (req, res) => {
    if (!req.params.id) {
        return res.status(400).json("Bad Request");
    }

    try {
        const id = parseInt(req.params.id);

        const users = await getUsers();
        const user = users.find((user) => user.id === id);

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

// PUT

// DELETE

// Serve API
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log("Press CTRL+C to end the process");
});
