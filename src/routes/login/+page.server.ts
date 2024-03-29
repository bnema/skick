import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad, Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { loginSchema } from './schema';
import { superValidate, message } from 'sveltekit-superforms';
import { type OAuthUser, getUserByEmail } from '$lib/server/db/queries/user.js';
import { Argon2id } from 'oslo/password';
import { lucia } from '$lib/server/auth.js';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(loginSchema))
	};
};

// login form return
export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(loginSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const { email, password } = form.data;

		const existingUser = await getUserByEmail(email);
		if (!existingUser) {
			return message(form, 'Incorrect username or password');
		}

		if (existingUser) {
			if (existingUser.hashed_password) {
				const validPassword = await new Argon2id().verify(existingUser.hashed_password, password);
				if (!validPassword) {
					return message(form, 'Incorrect username or password');
				}
			} else {
				return message(form, 'Incorrect username or password');
			}
		}

		const session = await lucia.createSession(existingUser.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		return message(form, 'Logged in');
	}
};
