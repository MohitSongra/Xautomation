import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { TwitterCookie } from "@/lib/twitter/client";

type EncryptedCookieJar = {
  version: 1;
  algorithm: "aes-256-gcm";
  iv: string;
  tag: string;
  data: string;
};

function getEncryptionKey() {
  const secret = process.env.COOKIE_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error("COOKIE_ENCRYPTION_KEY is not configured");
  }

  return createHash("sha256").update(secret).digest();
}

function isEncryptedCookieJar(value: unknown): value is EncryptedCookieJar {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<EncryptedCookieJar>;
  return (
    candidate.version === 1 &&
    candidate.algorithm === "aes-256-gcm" &&
    typeof candidate.iv === "string" &&
    typeof candidate.tag === "string" &&
    typeof candidate.data === "string"
  );
}

export function encryptTwitterCookies(cookies: unknown[]): EncryptedCookieJar {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(cookies), "utf8"),
    cipher.final(),
  ]);

  return {
    version: 1,
    algorithm: "aes-256-gcm",
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    data: encrypted.toString("base64"),
  };
}

export function decryptTwitterCookies(storedCookies: unknown): TwitterCookie[] {
  if (Array.isArray(storedCookies)) {
    return storedCookies as TwitterCookie[];
  }

  if (!isEncryptedCookieJar(storedCookies)) {
    throw new Error("Stored X cookies are missing or invalid");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(storedCookies.iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(storedCookies.tag, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(storedCookies.data, "base64")),
    decipher.final(),
  ]);
  const parsed = JSON.parse(decrypted.toString("utf8")) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error("Decrypted X cookies are not an array");
  }

  return parsed as TwitterCookie[];
}
