import { cookies } from "next/headers";

const sessionCookie = "aca_google_session";
const stateCookie = "aca_google_oauth_state";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  picture?: string;
};

type SessionPayload = {
  user: AuthUser;
  expiresAt: number;
};

function getSessionSecret() {
  const secret = process.env.AUTH_SESSION_SECRET;

  if (!secret || secret === "replace-with-a-long-random-string") {
    throw new Error("AUTH_SESSION_SECRET is not configured");
  }

  return secret;
}

function base64UrlEncode(value: string | ArrayBuffer) {
  const bytes =
    typeof value === "string"
      ? new TextEncoder().encode(value)
      : new Uint8Array(value);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64UrlDecode(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );

  return atob(padded);
}

async function sign(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );

  return base64UrlEncode(signature);
}

async function verify(value: string, signature: string) {
  return (await sign(value)) === signature;
}

export async function createSessionToken(user: AuthUser) {
  const payload: SessionPayload = {
    user,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
  };
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = await sign(body);

  return `${body}.${signature}`;
}

export async function readSessionToken(token?: string) {
  if (!token) return null;

  const [body, signature] = token.split(".");

  if (!body || !signature || !(await verify(body, signature))) {
    return null;
  }

  const payload = JSON.parse(base64UrlDecode(body)) as SessionPayload;

  if (payload.expiresAt < Date.now()) {
    return null;
  }

  return payload.user;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  return readSessionToken(cookieStore.get(sessionCookie)?.value);
}

export function getSessionCookieName() {
  return sessionCookie;
}

export function getStateCookieName() {
  return stateCookie;
}
