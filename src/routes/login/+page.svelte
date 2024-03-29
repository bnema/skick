<!-- Login using discord oauth on /login/discord -->
<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { loginSchema, type LoginSchema } from './schema';
	import { page } from '$app/stores';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	export let data: SuperValidated<Infer<LoginSchema>>;

	const form = superForm(data, {
		validators: zodClient(loginSchema),
		dataType: 'json'
	});

	const { form: formData, enhance, message } = form;
</script>

<main class="flex flex-col items-center justify-center gap-4 p-5">
	<!-- login form -->
	<div class="rounded-lg bg-gray-300 p-5">
		<h1>Login</h1>
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
					<Form.Description>Enter your password.</Form.Description>
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Button>Submit</Form.Button>

			{#if $message}
				<div class:success={$page.status == 200} class:error={$page.status >= 400}>
					{$message}
				</div>
			{/if}
		</form>
		<p class="pt-2 text-center text-sm">
			Not registered yet? <a href="/signup">Sign up</a>
		</p>
	</div>

	<!-- login with discord -->
	<div class="rounded-lg bg-gray-300 p-5">
		<a href="/login/discord">Login with Discord</a>
	</div>
</main>
