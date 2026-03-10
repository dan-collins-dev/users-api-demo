"use strict";

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { v4 } from "uuid";

const app = express();
const port = 8080;

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
        console.error(error.message);
    }
}

async function saveUsers(users) {
    await fs.writeFile(logsFilePath, JSON.stringify(users));
}

// GET
app.get("/api/users", async (req, res) => {
    const users = await getUsers();
    res.status(200).json(users);
});

// POST

// PUT

// DELETE

// Serve API
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log("Press CTRL+C to end the process");
});
