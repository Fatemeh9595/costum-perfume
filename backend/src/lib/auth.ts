import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[A-Za-z][A-Za-z\s'-]{1,79}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/;

export const allowedFamilies = new Set(["", "floral", "fruity", "woody", "fresh", "oriental"]);
export const allowedExperienceLevels = new Set(["", "new", "curious", "enthusiast"]);

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string) {
  return emailRegex.test(value);
}

export function isValidName(value: string) {
  return nameRegex.test(value);
}

export function isStrongPassword(value: string) {
  return passwordRegex.test(value);
}

export async function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return { passwordHash: derived.toString("hex"), passwordSalt: salt };
}

export async function verifyPassword(password: string, salt: string, storedHash: string) {
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const stored = Buffer.from(storedHash, "hex");

  if (stored.length !== derived.length) {
    return false;
  }

  return timingSafeEqual(stored, derived);
}

export function generateSessionToken() {
  return randomBytes(32).toString("hex");
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
