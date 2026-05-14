import { NextRequest, NextResponse } from "next/server";
import {
  AuthUser,
  createSessionToken,
  getSessionCookieName,
  getStateCookieName,
} from "@/lib/auth";

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleUserInfo = {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
};

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const storedState = request.cookies.get(getStateCookieName())?.value;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/demo-store?auth=missing_config`);
  }

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(`${appUrl}/demo-store?auth=invalid_state`);
  }

  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `${appUrl}/api/auth/google/callback`;
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokenJson = (await tokenResponse.json()) as GoogleTokenResponse;

  if (!tokenResponse.ok || !tokenJson.access_token) {
    console.error("Google token exchange failed:", tokenJson);
    return NextResponse.redirect(`${appUrl}/demo-store?auth=token_failed`);
  }

  const userResponse = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: {
        Authorization: `Bearer ${tokenJson.access_token}`,
      },
    },
  );

  if (!userResponse.ok) {
    return NextResponse.redirect(`${appUrl}/demo-store?auth=user_failed`);
  }

  const googleUser = (await userResponse.json()) as GoogleUserInfo;
  const user: AuthUser = {
    id: googleUser.sub,
    email: googleUser.email,
    name: googleUser.name || googleUser.email,
    picture: googleUser.picture,
  };
  const sessionToken = await createSessionToken(user);
  const response = NextResponse.redirect(`${appUrl}/demo-store?auth=success`);

  response.cookies.delete(getStateCookieName());
  response.cookies.set(getSessionCookieName(), sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
