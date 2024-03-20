import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad, Actions } from "./$types.js";
import { fail } from "@sveltejs/kit";
import { formSchema } from "./schema";
import { superValidate } from "sveltekit-superforms";


export const load: PageServerLoad = async () => {
    return {
      form: await superValidate(zod(formSchema)),
    };
  };

  export const actions: Actions = {
    default: async (event) => {
      const form = await superValidate(event, zod(formSchema));
      if (!form.valid) {
        return fail(400, {
          form,
        });
      }


      return {
        form,
      };
    },
  };

