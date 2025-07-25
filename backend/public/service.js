import AsyncLock from "async-lock";
import fs from "fs";
import jwt from "jsonwebtoken";
import { Redis } from '@upstash/redis';
import { AccessError, InputError } from "./error";

const lock = new AsyncLock();

const JWT_SECRET = "llamallamaduck";
const DATABASE_FILE = "./database.json";

// Initialize Redis client for Vercel KV
let redis = null;
if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN
  });
}

/***************************************************************
                       State Management
***************************************************************/

let admins = {};

const sessionTimeouts = {};

const update = async admins => new Promise((resolve, reject) => {
  lock.acquire("saveData", async () => {
    try {
      if (redis) {
        // Store to Vercel KV using Redis SDK
        await redis.set("admins", JSON.stringify(admins));
      } else {
        // Store to local file system (development mode)
        fs.writeFileSync(DATABASE_FILE, JSON.stringify({
          admins
        }, null, 2));
      }
      resolve();
    } catch (error) {
      console.log(error);
      reject(new Error("Writing to database failed"));
    }
  });
});

export const save = () => update(admins);
export const reset = () => {
  update({});
  admins = {};
};

// Initialize data on startup
const initializeData = async () => {
  try {
    if (redis) {
      // Read from Vercel KV
      console.log("Connecting to Vercel KV...");
      const data = await redis.get("admins");
      if (data) {
        admins = JSON.parse(data);
        console.log("Data loaded from Vercel KV");
      } else {
        // Initialize with empty admins object
        console.log("No existing data found, initializing new database");
        admins = {};
        await save();
      }
    } else {
      // Read from local file (development mode)
      console.log("Running in development mode, using local file storage");
      const data = JSON.parse(fs.readFileSync(DATABASE_FILE));
      admins = data.admins;
    }
  } catch (error) {
    console.log("WARNING: No database found, creating a new one");
    console.log("Error details:", error.message);
    admins = {};
    await save();
  }
};

// Export initialization function to be called before server starts
export const initializeDatabase = initializeData;

// Initialize data on module load (but don't await in module scope)
initializeData().catch(console.error);

/***************************************************************
                       Helper Functions
***************************************************************/

export const userLock = callback => new Promise((resolve, reject) => {
  lock.acquire("userAuthLock", callback(resolve, reject));
});

/***************************************************************
                       Auth Functions
***************************************************************/

export const getEmailFromAuthorization = authorization => {
  try {
    const token = authorization.replace("Bearer ", "");
    const { email } = jwt.verify(token, JWT_SECRET);
    if (!(email in admins)) {
      throw new AccessError("Invalid Token");
    }
    return email;
  } catch (error) {
    throw new AccessError("Invalid token");
  }
};

export const login = (email, password) => userLock((resolve, reject) => {
  if (email in admins) {
    if (admins[email].password === password) {
      resolve(jwt.sign({ email }, JWT_SECRET, { algorithm: "HS256" }));
    }
  }
  reject(new InputError("Invalid username or password"));
});

export const logout = email => userLock((resolve, reject) => {
  admins[email].sessionActive = false;
  resolve();
});

export const register = (email, password, name) => userLock((resolve, reject) => {
  if (email in admins) {
    return reject(new InputError("Email address already registered"));
  }
  admins[email] = {
    name,
    password,
    store: {}
  };
  const token = jwt.sign({ email }, JWT_SECRET, { algorithm: "HS256" });
  resolve(token);
});

export const getProfile = email => userLock((resolve, reject) => {
  if (!(email in admins)) {
    return reject(new AccessError("User not found"));
  }
  resolve({
    email,
    name: admins[email].name
  });
});

/***************************************************************
                       Store Functions
***************************************************************/

export const getStore = email => userLock((resolve, reject) => {
  resolve(admins[email].store);
});

export const setStore = (email, store) => userLock((resolve, reject) => {
  admins[email].store = store;
  resolve();
});