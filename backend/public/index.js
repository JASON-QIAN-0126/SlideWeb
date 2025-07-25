import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import fs from "fs";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";
import { AccessError, InputError } from "./error";
import { getEmailFromAuthorization, getProfile, getStore, login, logout, register, save, setStore, initializeDatabase } from "./service";

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));

const catchErrors = fn => async (req, res) => {
  try {
    await fn(req, res);
    save();
  } catch (err) {
    if (err instanceof InputError) {
      res.status(400).send({ error: err.message });
    } else if (err instanceof AccessError) {
      res.status(403).send({ error: err.message });
    } else {
      console.log(err);
      res.status(500).send({ error: "A system error ocurred" });
    }
  }
};

/***************************************************************
                       Auth Function
***************************************************************/

const authed = fn => async (req, res) => {
  const email = getEmailFromAuthorization(req.header("Authorization"));
  await fn(req, res, email);
};

app.post("/admin/auth/login", catchErrors(async (req, res) => {
  const { email, password } = req.body;
  const token = await login(email, password);
  return res.json({ token });
}));

app.post("/admin/auth/register", catchErrors(async (req, res) => {
  const { email, password, name } = req.body;
  const token = await register(email, password, name);
  return res.json({ token });
}));

app.post("/admin/auth/logout", catchErrors(authed(async (req, res, email) => {
  await logout(email);
  return res.json({});
})));

app.get("/admin/auth/profile", catchErrors(authed(async (req, res, email) => {
  const profile = await getProfile(email);
  return res.json(profile);
})));

/***************************************************************
                       Store Functions
***************************************************************/

app.get("/store", catchErrors(authed(async (req, res, email) => {
  const store = await getStore(email);
  return res.json({ store });
})));

app.put("/store", catchErrors(authed(async (req, res, email) => {
  await setStore(email, req.body.store);
  return res.json({});
})));

/***************************************************************
                       Running Server
***************************************************************/

app.get("/", (req, res) => res.redirect("/docs"));

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Determine port based on environment
let port;
if (process.env.PORT) {
  // Vercel will provide this
  port = process.env.PORT;
} else if (process.env.PROD_BACKEND_PORT) {
  // Custom production port
  port = process.env.PROD_BACKEND_PORT;
} else {
  // Development mode - read from config file
  try {
    port = JSON.parse(fs.readFileSync("../frontend/backend.config.json")).BACKEND_PORT;
  } catch (error) {
    console.log("Warning: Could not read backend.config.json, using default port 5005");
    port = 5005;
  }
}

// Initialize database and start server
const startServer = async () => {
  try {
    console.log("Initializing database...");
    await initializeDatabase();
    console.log("Database initialized successfully");

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`For API docs, navigate to http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  }
};

startServer();