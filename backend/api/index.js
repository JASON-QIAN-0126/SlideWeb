import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import fs from "fs";
import swaggerUi from "swagger-ui-express";
import { AccessError, InputError } from "./error.js";
import {
  getEmailFromAuthorization,
  getProfile,
  getStore,
  login,
  logout,
  register,
  save,
  setStore,
  initializeDatabase,
} from "./service.js";

const app = express();

// 配置 CORS 允许前端访问
app.use(cors({
  origin: [
    'https://slide-web-frontend.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'https://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));

// 动态导入swagger文档
let swaggerDocument;
try {
  swaggerDocument = JSON.parse(fs.readFileSync('./swagger.json', 'utf8'));
} catch (error) {
  console.warn('Could not load swagger.json:', error.message);
  swaggerDocument = {
    openapi: "3.0.0",
    info: { title: "Presto API", version: "1.0.0" },
    paths: {}
  };
}

// Initialize database on cold start
let isInitialized = false;
const ensureInitialized = async () => {
  if (!isInitialized) {
    try {
      console.log("Initializing database...");
      await initializeDatabase();
      console.log("Database initialized successfully");
      isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize database:", error);
      throw error;
    }
  }
};

// Middleware to ensure database is initialized
app.use(async (req, res, next) => {
  try {
    await ensureInitialized();
    next();
  } catch (error) {
    console.error("Database initialization failed:", error);
    res.status(500).json({ error: "Database initialization failed" });
  }
});

const catchErrors = (fn) => async (req, res) => {
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

const authed = (fn) => async (req, res) => {
  try {
    const authorization = req.header("Authorization");
    if (!authorization) {
      return res.status(403).send({ error: "Authorization header required" });
    }
    const email = getEmailFromAuthorization(authorization);
    await fn(req, res, email);
  } catch (error) {
    console.log("Auth error:", error.message);
    return res.status(403).send({ error: "Authentication failed" });
  }
};

app.post(
  "/admin/auth/login",
  catchErrors(async (req, res) => {
    const { email, password } = req.body;
    const token = await login(email, password);
    return res.json({ token });
  })
);

app.post(
  "/admin/auth/register",
  catchErrors(async (req, res) => {
    const { email, password, name } = req.body;
    const token = await register(email, password, name);
    return res.json({ token });
  })
);

app.post(
  "/admin/auth/logout",
  catchErrors(
    authed(async (req, res, email) => {
      await logout(email);
      return res.json({});
    })
  )
);

app.get(
  "/admin/auth/profile",
  catchErrors(
    authed(async (req, res, email) => {
      const profile = await getProfile(email);
      return res.json(profile);
    })
  )
);

/***************************************************************
                       Store Functions
***************************************************************/

app.get(
  "/store",
  catchErrors(
    authed(async (req, res, email) => {
      const store = await getStore(email);
      return res.json({ store });
    })
  )
);

app.put(
  "/store",
  catchErrors(
    authed(async (req, res, email) => {
      await setStore(email, req.body.store);
      return res.json({});
    })
  )
);

/***************************************************************
                       Running Server
***************************************************************/

app.get("/", (req, res) => res.redirect("/docs"));

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// For Vercel serverless functions
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  let port;
  if (process.env.PORT) {
    port = process.env.PORT;
  } else if (process.env.PROD_BACKEND_PORT) {
    port = process.env.PROD_BACKEND_PORT;
  } else {
    try {
      port = JSON.parse(fs.readFileSync("../frontend/backend.config.json")).BACKEND_PORT;
    } catch (error) {
      console.log("Warning: Could not read backend.config.json, using default port 5005");
      port = 5005;
    }
  }

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`For API docs, navigate to http://localhost:${port}`);
  });
}
