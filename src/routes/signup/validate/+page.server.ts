import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad, Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { validateEmailSchema } from '../schema';
import { superValidate, message } from 'sveltekit-superforms';
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
      return message(form, 'Invalid form data.');
    }

    // Session from events.locals
    const sessionId = event.locals.session?.id;

    const { user } = await lucia.validateSession(sessionId as string);
    if (!user) {
      return new Response(null, {
        status: 401
      });
    }

    // Check if the user is already verified
    if (user.emailVerified) {
      return message(form, 'Email already verified.');
    }

    // get code from formdata
    const code = form.data.code;
    const userId = user.id;

    const isVerified = await verifyVerificationCode(userId, code);

    if (isVerified) {
      console.log("Email verified");
      
      // Return success message and the form
      return message(form, 'Email verification successful!');
    } else {
      return fail(400, { 
        form,
        message: 'Invalid verification code.' 
      });
    }
  }
};
   