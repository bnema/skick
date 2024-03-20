<!-- routes/signup/+page.svelte -->
<script lang="ts">
    import * as Form from "$lib/components/ui/form";
    import { Input } from "$lib/components/ui/input";
    import { formSchema, type FormSchema } from "./schema";
    import {
      type SuperValidated,
      type Infer,
      superForm,
    } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
   
    export let data: SuperValidated<Infer<FormSchema>>;
   
    const form = superForm(data, {
      validators: zodClient(formSchema),
      dataType: "json",
    });
   
    const { form: formData, enhance } = form;
  </script>

<h1>Sign up</h1>

<form method="POST" use:enhance>
    <Form.Field {form} name="email">
      <Form.Control let:attrs>
        <Form.Label>E-mail</Form.Label>
        <Input {...attrs} bind:value={$formData.email} />
      </Form.Control>
      <Form.Description>Enter your e-mail address.</Form.Description>
      <Form.FieldErrors />
    </Form.Field>
    <Form.Field {form} name="password">
      <Form.Control let:attrs>
        <Form.Label>Password</Form.Label>
        <Input type="password" {...attrs} bind:value={$formData.password} />
        <Form.Description>Enter a password wih at least 8 characters, one uppercase letter, one lowercase letter, and one number.</Form.Description>
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
    <Form.Field {form} name="confirmPassword">
      <Form.Control let:attrs>
        <Form.Label>Confirm password</Form.Label>
        <Input type="password" {...attrs} bind:value={$formData.confirmPassword} />
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
    <Form.Button>Submit</Form.Button>
</form>



