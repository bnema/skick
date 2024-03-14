// routes/login/discord/callback/+server.ts
import { OAuth2RequestError } from "arctic";
import { discord, lucia, Providers } from "$lib/server/auth";
import type { RequestEvent } from "@sveltejs/kit";
import { type OAuthUser, addUserDB, updateUserDB } from "$lib/server/db/queries/user";

export async function GET(event: RequestEvent): Promise<Response> {
  const code = event.url.searchParams.get("code");
  const state = event.url.searchParams.get("state");
  const storedState = event.cookies.get("discord_oauth_state") ?? null;

  if (!code || !state || !storedState || state !== storedState) {
    const errorMessage = 'Invalid or missing code, state, or stored state';
    console.error(errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const tokens = await discord.validateAuthorizationCode(code);
    if (!tokens.accessToken) {
      throw new Error("Failed to fetch Discord access token");
    }

    const discordUserResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`
      }
    });

    if (!discordUserResponse.ok) {
      throw new Error("Failed to fetch Discord user");
    }

    const discordUser: DiscordUser = await discordUserResponse.json();

    const primaryEmail = discordUser.email || "null";
    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
      : null;

    const oauthUser: OAuthUser = {
      provider: Providers.DISCORD,
      id: discordUser.id,
      login: discordUser.username,
      avatar_url: avatarUrl || "null",
      email: primaryEmail
    };

    let userId: string;

    try {
      // Try to update the existing user
      userId = await updateUserDB(oauthUser, primaryEmail);
    } catch (e) {
      // If the user doesn't exist, create them
      userId = await addUserDB(oauthUser, primaryEmail);
    }

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes
    });

    // We can now clear the discord_oauth_state cookie
    event.cookies.set("discord_oauth_state", "", {
      path: "/",
      maxAge: 0
    });

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/"
      }
    });
  } catch (e) {
    console.error("Error during Discord OAuth callback:", e);

    if (e instanceof OAuth2RequestError) {
      // invalid code
      return new Response(null, {
        status: 400
      });
    }
    return new Response(null, {
      status: 500
    });
  }
}

interface DiscordUser {
  id: string;
  username: string;
  avatar: string | null;
  email?: string;
}