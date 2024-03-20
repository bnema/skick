import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types.js";
import { formSchema } from "./schema";
import { superValidate } from "sveltekit-superforms";




export const load: PageServerLoad = async () => {
    return {
      form: await superValidate(zod(formSchema)),
    };
  };

  