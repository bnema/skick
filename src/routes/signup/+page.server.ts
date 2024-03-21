import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad, Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { formSchema } from './schema';
import { superValidate } from 'sveltekit-superforms';
import { generateId } from 'lucia';
import { type OAuthUser, addUserDB } from '$lib/server/db/queries/user.js';
import { Argon2id } from 'oslo/password';
import { tursoClient } from '$lib/server/db/turso.js';
import { Providers } from '$lib/server/auth.js';
import { generateEmailVerificationCode } from '$lib/server/verifEmail';
import { lucia } from '$lib/server/auth.js';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(formSchema))
	};
};

export const actions: Actions = {
  default: async (event) => {
    const form = await superValidate(event, zod(formSchema));
    if (!form.valid) {
      return fail(400, { form });
    }

    const { email, password } = form.data;
    const hashedPassword = await new Argon2id().hash(password);

    const user: OAuthUser = {
      provider: Providers.EMAIL,
      login: '',
      id: '',
      avatar_url: '',
      email,
    };

   const userId= await addUserDB(user, email, hashedPassword);

    const verificationCode = await generateEmailVerificationCode(userId, email);
    console.log(verificationCode);

    // TODO: Impl Email sending service: await sendVerificationEmail(email, verificationCode);

    const session = await lucia.createSession(userId, {
      fresh: true,
    });
  const cookie = lucia.createSessionCookie(session.id);

  console.log("cookie", cookie);

  event.cookies.set(cookie.name, cookie.value, {
    path: ".",
    ...cookie.attributes
  });



    return { form };
  },
};
