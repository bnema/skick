import { Lucia } from 'lucia';
import { LibSQLAdapter } from '@lucia-auth/adapter-sqlite';
import { tursoClient } from '../db/turso';
import { GitHub, Discord } from 'arctic';


export enum Providers {
	DISCORD = 'discord',
	GOOGLE = 'google',
  }
  
// Create a client for the database
const db = tursoClient();

const adapter = new LibSQLAdapter(db, {
	user: 'users',
	session: 'sessions'
});

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: import.meta.env.PROD,
		}
	},
	getUserAttributes: (attributes) => {
		return {
			githubId: attributes.github_id,
			discordId: attributes.discord_id,
			username: attributes.username
		};
	}
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface DatabaseUserAttributes {
  github_id: string;
  discord_id: string;
  username: string;
}
let clientIdGithub, clientSecretGithub, redirectURIGithub

if (import.meta.env.PROD) {
	clientIdGithub = import.meta.env.VITE_GITHUB_PROD_CLIENT_ID;
	clientSecretGithub = import.meta.env.VITE_GITHUB_PROD_CLIENT_SECRET;
	redirectURIGithub = "https://pumuduru.io/login/github/callback"
} else if (import.meta.env.DEV) {
	clientIdGithub = import.meta.env.VITE_GITHUB_DEV_CLIENT_ID;
	clientSecretGithub = import.meta.env.VITE_GITHUB_DEV_CLIENT_SECRET;
	redirectURIGithub = "http://localhost:5173/login/github/callback"
} else {
	throw new Error("Environnement non valide. Veuillez définir PROD ou DEV.");
}

export const github = new GitHub(
	clientIdGithub,
	clientSecretGithub,
	{
		redirectURI: redirectURIGithub,
	
	}
);

let clientIdDiscord: string;
let clientSecretDiscord: string;
let redirectURIDiscord: string;

if (import.meta.env.PROD) {
  clientIdDiscord = import.meta.env.VITE_DISCORD_PROD_CLIENT_ID;
  clientSecretDiscord = import.meta.env.VITE_DISCORD_PROD_CLIENT_SECRET;
  redirectURIDiscord = "https://pumuduru.io/login/discord/callback";
} else if (import.meta.env.DEV) {
  clientIdDiscord = import.meta.env.VITE_DISCORD_DEV_CLIENT_ID;
  clientSecretDiscord = import.meta.env.VITE_DISCORD_DEV_CLIENT_SECRET;
  redirectURIDiscord = "http://localhost:5173/login/discord/callback";
} else {
  throw new Error("Environnement non valide. Veuillez définir PROD ou DEV.");
}

export const discord = new Discord(
  clientIdDiscord,
  clientSecretDiscord,
  redirectURIDiscord
);