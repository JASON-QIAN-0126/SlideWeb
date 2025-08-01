import AsyncLock from "async-lock";
import fs from "fs";
import jwt from "jsonwebtoken";
import { Redis } from '@upstash/redis';
import { AccessError, InputError } from "./error";

const lock = new AsyncLock();

const JWT_SECRET = "llamallamaduck";
const DATABASE_FILE = "./database.json";

// 检查环境变量和初始化Redis客户端
const initRedis = () => {
  // Vercel KV 可能使用不同的环境变量名
  const kvUrl = process.env.KV_REST_API_URL || 
                process.env.KV_URL || 
                process.env.UPSTASH_REDIS_REST_URL;
                
  const kvToken = process.env.KV_REST_API_TOKEN || 
                  process.env.KV_TOKEN || 
                  process.env.UPSTASH_REDIS_REST_TOKEN;

  console.log('Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL ? '✓ On Vercel' : '✗ Not Vercel',
    VERCEL_ENV: process.env.VERCEL_ENV,
    KV_REST_API_URL: process.env.KV_REST_API_URL ? '✓ Set' : '✗ Missing',
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? '✓ Set' : '✗ Missing',
    KV_URL: process.env.KV_URL ? '✓ Set' : '✗ Missing',
    KV_TOKEN: process.env.KV_TOKEN ? '✓ Set' : '✗ Missing',
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ? '✓ Set' : '✗ Missing',
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ? '✓ Set' : '✗ Missing'
  });

  // 检查是否在Vercel环境中或设置了KV环境变量
  if (kvUrl && kvToken) {
    try {
      const redis = new Redis({
        url: kvUrl,
        token: kvToken,
      });
      console.log('✅ Redis client initialized for Vercel KV');
      console.log('🔗 Using KV URL:', kvUrl.substring(0, 30) + '...');
      return redis;
    } catch (error) {
      console.error('❌ Failed to initialize Redis:', error.message);
      return null;
    }
  } else {
    console.log('⚠️ Redis environment variables not found, using local storage');
    console.log('💡 Expected variables: KV_REST_API_URL + KV_REST_API_TOKEN or KV_URL + KV_TOKEN');
    return null;
  }
};

// Initialize Redis client for Vercel KV
const redis = initRedis();

// 检查是否在生产环境（Vercel）
const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';

/***************************************************************
                       State Management
***************************************************************/

let admins = {};

const sessionTimeouts = {};

const update = async (admins) =>
  new Promise((resolve, reject) => {
    lock.acquire("saveData", async () => {
      try {
        if (redis) {
          // Store to Vercel KV using Redis SDK
          console.log('💾 Saving to Vercel KV...');
          await redis.set("admins", JSON.stringify(admins));
          console.log('✅ Data saved to Vercel KV');
        } else if (!isProduction) {
          // Store to local file system (development mode only)
          console.log('💾 Saving to local file...');
          fs.writeFileSync(
            DATABASE_FILE,
            JSON.stringify(
              {
                admins,
              },
              null,
              2
            )
          );
          console.log('✅ Data saved to local file');
        } else {
          // 在生产环境但没有Redis连接时的错误
          throw new Error('Production environment detected but Redis is not available. Please check KV environment variables.');
        }
        resolve();
      } catch(error) {
        console.error('❌ Database write error:', error.message);
        reject(new Error("Writing to database failed: " + error.message));
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
      // 测试Redis连接
      console.log("🔍 Testing Redis connection...");
      try {
        await redis.ping();
        console.log("✅ Redis connection test successful");
      } catch (pingError) {
        console.error("❌ Redis ping failed:", pingError.message);
        throw new Error(`Redis connection test failed: ${pingError.message}`);
      }

      // Read from Vercel KV
      console.log("🔄 Loading data from Vercel KV...");
      const data = await redis.get("admins");
      if (data) {
        admins = JSON.parse(data);
        console.log("✅ Data loaded from Vercel KV, users:", Object.keys(admins).length);
      } else {
        // Initialize with empty admins object
        console.log("📝 No existing data found, initializing new database");
        admins = {};
        await save();
      }
    } else if (!isProduction) {
      // Read from local file (development mode only)
      console.log("🔄 Loading data from local file...");
      try {
        const data = JSON.parse(fs.readFileSync(DATABASE_FILE));
        admins = data.admins;
        console.log("✅ Data loaded from local file, users:", Object.keys(admins).length);
      } catch (fileError) {
        console.log("📝 No local database file found, creating new one");
        admins = {};
        await save();
      }
    } else {
      // 生产环境但没有Redis的错误情况
      throw new Error('Production environment detected but no database connection available. Please check your Vercel KV configuration.');
    }
  } catch(error) {
    console.error("❌ Database initialization error:", error.message);
    
    // 在生产环境中，如果数据库初始化失败，应该抛出错误而不是静默失败
    if (isProduction) {
      console.error("🚨 Critical: Database initialization failed in production!");
      console.error("📋 Troubleshooting steps:");
      console.error("1. Check if Vercel KV database is created");
      console.error("2. Verify KV environment variables are set in Vercel project settings");
      console.error("3. Ensure KV_REST_API_URL and KV_REST_API_TOKEN are correct");
      throw error;
    } else {
      // 开发环境中，如果失败就使用空数据
      console.log("⚠️ Using empty database in development mode");
      admins = {};
    }
  }
};

// Export initialization function to be called before server starts
export const initializeDatabase = initializeData;

// 移除模块加载时的自动初始化，改为在需要时初始化
// initializeData().catch(console.error);

/***************************************************************
                       Helper Functions
***************************************************************/

export const userLock = (callback) =>
  new Promise((resolve, reject) => {
    lock.acquire("userAuthLock", callback(resolve, reject));
  });

/***************************************************************
                       Auth Functions
***************************************************************/

export const getEmailFromAuthorization = (authorization) => {
  try {
    const token = authorization.replace("Bearer ", "");
    const { email } = jwt.verify(token, JWT_SECRET);
    if (!(email in admins)) {
      throw new AccessError("Invalid Token");
    }
    return email;
  } catch(error) {
    throw new AccessError("Invalid token");
  }
};

export const login = (email, password) =>
  userLock((resolve, reject) => {
    if (email in admins) {
      if (admins[email].password === password) {
        resolve(jwt.sign({ email }, JWT_SECRET, { algorithm: "HS256" }));
      }
    }
    reject(new InputError("Invalid username or password"));
  });

export const logout = (email) =>
  userLock((resolve, reject) => {
    admins[email].sessionActive = false;
    resolve();
  });

export const register = (email, password, name) =>
  userLock((resolve, reject) => {
    if (email in admins) {
      return reject(new InputError("Email address already registered"));
    }
    admins[email] = {
      name,
      password,
      store: {},
    };
    const token = jwt.sign({ email }, JWT_SECRET, { algorithm: "HS256" });
    resolve(token);
  });

export const getProfile = (email) =>
  userLock((resolve, reject) => {
    if (!(email in admins)) {
      return reject(new AccessError("User not found"));
    }
    resolve({
      email,
      name: admins[email].name,
    });
  });

/***************************************************************
                       Store Functions
***************************************************************/

export const getStore = (email) =>
  userLock((resolve, reject) => {
    resolve(admins[email].store);
  });

export const setStore = (email, store) =>
  userLock((resolve, reject) => {
    admins[email].store = store;
    resolve();
  });
