<script lang="ts">
	import Checkbox from '$lib/components/Checkbox.svelte';
	import Counter from '$lib/components/Counter.svelte';
	import defaults from '$lib/settings';
	import Icon from '@iconify/svelte';
	import { loadIcon } from '@iconify/svelte';
	import clsx from 'clsx';

	type JsonData = {
		input: string;
		password?: string;
		hashLength: number;
	};

	type Error = {
		type: 'input' | 'password' | 'other' | null;
		message: string | null;
	};

	let textElem = $state({ input: '', link: '', hasPassword: true, password: '' });
	let error: Error = $state({ type: null, message: null });
	let settings = $state({
		password: {
			use: false,
			password: null
		},
		urlLength: 4
	});
	const maxChar = 20000;

	function resetError() {
		error.type = null;
		error.message = null;
	}

	function submit() {
		let jsonData: JsonData = { input: textElem.input, hashLength: settings.urlLength };
		resetError();

		if (textElem.input.length == 0) {
			error.type = 'input';
			error.message = '';
			return;
		}

		if (textElem.hasPassword) {
			if (textElem.password.length == 0) {
				error.type = 'password';
				error.message = 'Password does not exist';
				return;
			}

			jsonData = { ...jsonData, password: textElem.password };
		}

		fetch('/api/', {
			method: 'POST',
			body: JSON.stringify(jsonData),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(async (res) => {
				const resText = await res.json();
				if (!res.ok) {
					let err = new Error(resText);
					throw err;
				}

				textElem.link = window.location + resText.message;
			})
			.catch((err) => {
				textElem.link = err;
				console.error(err);
			});
	}

	function copyLink(e: HTMLDivElement) {
		const [anchor, button] = e.children as unknown as [HTMLInputElement, HTMLButtonElement];

		anchor.addEventListener('click', () => {
			if (textElem.link.length != 0) {
				window.open(textElem.link, '_blank');
			}
		});
		button.addEventListener('click', () => {
			anchor.focus();
			anchor.select();
		});
	}

	loadIcon('material-symbols:content-copy-outline-rounded');
</script>

<div class="wrap">
	<div class="contain">
		<div class="relative contain flex-1">
			<textarea
				name="txt"
				id="txt"
				placeholder="Text goes here btw..."
				bind:value={textElem.input}
				maxlength={maxChar}
			>
			</textarea>

			<p
				class="absolute bottom-4 right-4 pointer-events-none z-10 text-[hsl(var(--primary))] bg-[hsla(var(--background))] p-2"
			>
				{textElem.input.length} / {maxChar}
			</p>
		</div>

		<div id="r-contain">
			<button id="submit" onclick={submit}>Submit</button>
			{#if textElem.link != 'placeholder'}
				<div class="flex gap-2" use:copyLink>
					<input id="link" value={textElem.link} type="text" readonly={true} />
					<button id="link">
						<Icon icon="material-symbols:content-copy-outline-rounded" />
					</button>
				</div>
			{/if}

			<Counter bind:count={settings.urlLength} max={defaults.maxHash} min={defaults.minHash} />
			<div class="flex gap-4">
				<Checkbox bind:checked={textElem.hasPassword} />
				<label class="select-none" for="u-pass">Password Protect</label>
			</div>

			<input
				class={clsx('w-fit', textElem.hasPassword ? 'visible' : 'invisible', 'w-full')}
				type="text"
				placeholder="Password"
				bind:value={textElem.password}
			/>
		</div>
	</div>

	<!-- <div>
		Only encrypted data is stored on the server. For better security consider using a password.
	</div> -->
</div>

<style>
	.contain {
		display: flex;
		flex-direction: row;
		gap: 20px;
		justify-content: center;
	}

	#r-contain {
		display: flex;
		gap: 25px;
		flex-direction: column;
	}

	.wrap {
		width: clamp(800px, 30%, 800px);
		margin: auto;
		padding: 10px;
		margin-top: 12rem;
	}

	textarea {
		padding: 20px;
		color: white;
		resize: none;
		flex: 1;
	}

	#submit {
		@apply rounded-md;
		background: hsl(var(--secondary));
		border: none;
		padding: 20px;
	}

	#link {
		cursor: pointer;
		padding: 8px 10px;
		border: 2px solid hsl(var(--primary), 30%);
		border-radius: 7px;
	}
</style>
