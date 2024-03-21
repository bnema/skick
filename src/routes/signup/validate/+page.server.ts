import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad, Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { validateEmailSchema } from '../schema';
import { superValidate } from 'sveltekit-superforms';
import { type OAuthUser, addUserDB } from '$lib/server/db/queries/user.js';
import { Argon2id } from 'oslo/password';
import { Providers } from '$lib/server/auth.js';
import { generateEmailVerificationCode, verifyVerificationCode } from '$lib/server/verifEmail';
import { lucia } from '$lib/server/auth.js';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(validateEmailSchema))
	};
};

export const actions: Actions = {
  default: async (event) => {
    const form = await superValidate(event, zod(validateEmailSchema));
    if (!form.valid) {
      return fail(400, { form });
    }

    // Session from events.locals
    const sessionId = event.locals.session?.id;


    const { user } = await lucia.validateSession(sessionId as string);
	if (!user) {
		return new Response(null, {
			status: 401
		});
	}

    // get code from formdata
    const code  = form.data.code;
    const userId = user.id;

    const isVerified = await verifyVerificationCode(userId, code);

    if (!isVerified) {
      return fail(400, { form });
    }

    return { form };
  },
};
