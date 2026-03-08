import "dotenv/config";
import cors from "cors";
import express from "express";
import {
  allowedExperienceLevels,
  allowedFamilies,
  generateSessionToken,
  hashPassword,
  hashSessionToken,
  isStrongPassword,
  isValidEmail,
  isValidName,
  normalizeEmail,
  verifyPassword,
} from "./lib/auth";
import { getAuthSessionsCollection, getShopPerfumesCollection, getUsersCollection } from "./lib/mongo";

const app = express();
const port = Number(process.env.PORT) || 5000;
const authSessionHours = Number(process.env.AUTH_SESSION_HOURS) > 0 ? Number(process.env.AUTH_SESSION_HOURS) : 168;
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const mongoDbName = process.env.MONGODB_DB || "scentcraft";
const mongoCollectionName = process.env.MONGODB_COLLECTION || "shop-perfumes";
const allowedCorsOrigins = new Set(
  (process.env.FRONTEND_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0),
);

function toMongoRuntimeInfo(uri: string) {
  const defaultInfo = {
    uriLabel: "(unparseable URI)",
    authUser: "(none)",
  };

  try {
    const parsed = new URL(uri);
    const authUser = parsed.username ? decodeURIComponent(parsed.username) : "(none)";
    const host = parsed.host;
    const protocol = parsed.protocol.replace(":", "");

    return {
      uriLabel: `${protocol}://${host}`,
      authUser,
    };
  } catch {
    return defaultInfo;
  }
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedCorsOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  }),
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    message: "Backend is running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/shop-perfumes", async (_req, res) => {
  try {
    const collection = await getShopPerfumesCollection();
    const perfumes = await collection.find({}, { projection: { _id: 0 } }).sort({ name: 1 }).toArray();
    res.json(perfumes);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ ok: false, message });
  }
});

type RegisterRequestBody = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  family?: string;
  experience?: string;
  notes?: string;
  consent?: boolean;
};

type LoginRequestBody = {
  email?: string;
  password?: string;
};

type LogoutRequestBody = {
  token?: string;
};

type CartItem = {
  fileName: string;
  name: string;
  priceValue: number;
  quantity: number;
};

type UpdateCartRequestBody = {
  cartItems?: unknown;
};

function getBearerToken(authorizationHeader?: string) {
  if (!authorizationHeader) {
    return "";
  }

  if (!authorizationHeader.toLowerCase().startsWith("bearer ")) {
    return "";
  }

  return authorizationHeader.slice(7).trim();
}

function getClientIp(headerValue?: string | string[]) {
  if (!headerValue) {
    return "";
  }

  if (Array.isArray(headerValue)) {
    return headerValue[0] ?? "";
  }

  const first = headerValue.split(",")[0];
  return first?.trim() ?? "";
}

function isValidCartItems(value: unknown): value is CartItem[] {
  if (!Array.isArray(value)) {
    return false;
  }

  if (value.length > 100) {
    return false;
  }

  return value.every((item) => {
    if (!item || typeof item !== "object") {
      return false;
    }

    const entry = item as Record<string, unknown>;
    return (
      typeof entry.fileName === "string" &&
      entry.fileName.trim().length > 0 &&
      typeof entry.name === "string" &&
      entry.name.trim().length > 0 &&
      typeof entry.priceValue === "number" &&
      Number.isFinite(entry.priceValue) &&
      entry.priceValue >= 0 &&
      typeof entry.quantity === "number" &&
      Number.isInteger(entry.quantity) &&
      entry.quantity > 0
    );
  });
}

app.post("/api/users/register", async (req, res) => {
  const body = (req.body ?? {}) as RegisterRequestBody;

  const name = (body.name ?? "").trim();
  const email = normalizeEmail(body.email ?? "");
  const password = body.password ?? "";
  const confirmPassword = body.confirmPassword ?? "";
  const family = (body.family ?? "").trim();
  const experience = (body.experience ?? "").trim();
  const notes = (body.notes ?? "").trim();
  const consent = body.consent === true;

  if (!isValidName(name)) {
    res.status(400).json({ ok: false, message: "Name must be 2-80 letters and can include spaces." });
    return;
  }

  if (!isValidEmail(email)) {
    res.status(400).json({ ok: false, message: "Please enter a valid email address." });
    return;
  }

  if (!isStrongPassword(password)) {
    res.status(400).json({
      ok: false,
      message:
        "Password must be 8-64 chars and include uppercase, lowercase, number, and special character.",
    });
    return;
  }

  if (confirmPassword.length > 0 && password !== confirmPassword) {
    res.status(400).json({ ok: false, message: "Password and confirm password do not match." });
    return;
  }

  if (!allowedFamilies.has(family)) {
    res.status(400).json({ ok: false, message: "Invalid scent family selected." });
    return;
  }

  if (!allowedExperienceLevels.has(experience)) {
    res.status(400).json({ ok: false, message: "Invalid experience level selected." });
    return;
  }

  if (notes.length > 600) {
    res.status(400).json({ ok: false, message: "Notes cannot exceed 600 characters." });
    return;
  }

  if (!consent) {
    res.status(400).json({ ok: false, message: "You must accept terms and privacy policy." });
    return;
  }

  try {
    const users = await getUsersCollection();
    const existing = await users.findOne({ email }, { projection: { _id: 1 } });
    if (existing) {
      res.status(409).json({ ok: false, message: "An account with this email already exists." });
      return;
    }

    const { passwordHash, passwordSalt } = await hashPassword(password);
    const createdAt = new Date().toISOString();

    const insertResult = await users.insertOne({
      cartItems: [],
      name,
      email,
      passwordHash,
      passwordSalt,
      family,
      experience,
      notes,
      consent,
      createdAt,
    });

    res.status(201).json({
      ok: true,
      message: "Account created successfully.",
      user: {
        id: insertResult.insertedId.toString(),
        name,
        email,
      },
    });
  } catch (error) {
    const err = error as { code?: number; message?: string };
    if (err.code === 11000) {
      res.status(409).json({ ok: false, message: "An account with this email already exists." });
      return;
    }
    res.status(500).json({ ok: false, message: err.message ?? "Failed to create account." });
  }
});

app.post("/api/users/login", async (req, res) => {
  const body = (req.body ?? {}) as LoginRequestBody;
  const email = normalizeEmail(body.email ?? "");
  const password = body.password ?? "";

  if (!isValidEmail(email)) {
    res.status(400).json({ ok: false, message: "Please enter a valid email address." });
    return;
  }

  if (password.length === 0) {
    res.status(400).json({ ok: false, message: "Password is required." });
    return;
  }

  try {
    const users = await getUsersCollection();
    const user = await users.findOne({ email });
    if (!user) {
      res.status(401).json({ ok: false, message: "Invalid email or password." });
      return;
    }

    const validPassword = await verifyPassword(password, user.passwordSalt, user.passwordHash);
    if (!validPassword) {
      res.status(401).json({ ok: false, message: "Invalid email or password." });
      return;
    }

    const token = generateSessionToken();
    const tokenHash = hashSessionToken(token);
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + authSessionHours * 60 * 60 * 1000).toISOString();

    const sessions = await getAuthSessionsCollection();
    await sessions.insertOne({
      userId: user._id,
      tokenHash,
      createdAt,
      expiresAt,
      revokedAt: null,
      ip: getClientIp(req.headers["x-forwarded-for"]) || req.ip || "",
      userAgent: String(req.headers["user-agent"] ?? ""),
    });

    res.json({
      ok: true,
      message: "Logged in successfully.",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        family: user.family,
        experience: user.experience,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed.";
    res.status(500).json({ ok: false, message });
  }
});

app.post("/api/users/logout", async (req, res) => {
  const body = (req.body ?? {}) as LogoutRequestBody;
  const token = body.token || getBearerToken(req.headers.authorization);

  if (!token) {
    res.status(400).json({ ok: false, message: "Token is required for logout." });
    return;
  }

  try {
    const tokenHash = hashSessionToken(token);
    const sessions = await getAuthSessionsCollection();
    const result = await sessions.updateOne(
      { tokenHash, revokedAt: null },
      { $set: { revokedAt: new Date().toISOString() } },
    );

    if (result.matchedCount === 0) {
      res.status(404).json({ ok: false, message: "Session not found or already logged out." });
      return;
    }

    res.json({ ok: true, message: "Logged out successfully." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Logout failed.";
    res.status(500).json({ ok: false, message });
  }
});

app.put("/api/users/cart", async (req, res) => {
  const token = getBearerToken(req.headers.authorization);
  if (!token) {
    res.status(401).json({ ok: false, message: "Authorization token is required." });
    return;
  }

  const body = (req.body ?? {}) as UpdateCartRequestBody;
  if (!isValidCartItems(body.cartItems)) {
    res.status(400).json({ ok: false, message: "Invalid cart payload." });
    return;
  }

  try {
    const tokenHash = hashSessionToken(token);
    const nowIso = new Date().toISOString();

    const sessions = await getAuthSessionsCollection();
    const session = await sessions.findOne({ tokenHash, revokedAt: null, expiresAt: { $gt: nowIso } });

    if (!session) {
      res.status(401).json({ ok: false, message: "Session expired or invalid." });
      return;
    }

    const users = await getUsersCollection();
    const result = await users.updateOne({ _id: session.userId }, { $set: { cartItems: body.cartItems } });

    if (result.matchedCount === 0) {
      res.status(404).json({ ok: false, message: "User not found." });
      return;
    }

    res.json({ ok: true, message: "Cart updated.", cartItems: body.cartItems });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update cart.";
    res.status(500).json({ ok: false, message });
  }
});

app.get("/api/users/me", async (req, res) => {
  const token = getBearerToken(req.headers.authorization);
  if (!token) {
    res.status(401).json({ ok: false, message: "Authorization token is required." });
    return;
  }

  try {
    const tokenHash = hashSessionToken(token);
    const nowIso = new Date().toISOString();

    const sessions = await getAuthSessionsCollection();
    const session = await sessions.findOne({ tokenHash, revokedAt: null, expiresAt: { $gt: nowIso } });

    if (!session) {
      res.status(401).json({ ok: false, message: "Session expired or invalid." });
      return;
    }

    const users = await getUsersCollection();
    const user = await users.findOne(
      { _id: session.userId },
      { projection: { passwordHash: 0, passwordSalt: 0 } },
    );

    if (!user) {
      res.status(404).json({ ok: false, message: "User not found." });
      return;
    }

    res.json({
      ok: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        family: user.family,
        experience: user.experience,
        notes: user.notes,
        cartItems: user.cartItems ?? [],
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load profile.";
    res.status(500).json({ ok: false, message });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening on http://localhost:${port}`);
  const mongoInfo = toMongoRuntimeInfo(mongoUri);
  console.log(
    `[Mongo] uri=${mongoInfo.uriLabel} user=${mongoInfo.authUser} db=${mongoDbName} collection=${mongoCollectionName}`,
  );
  console.log(`[CORS] allowed origins: ${Array.from(allowedCorsOrigins).join(", ")}`);
});
