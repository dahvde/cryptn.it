<script lang="ts">
	import Checkbox from '$lib/components/Checkbox.svelte';
	import Counter from '$lib/components/Counter.svelte';
	import defaults from '$lib/settings';
	import Icon, { loadIcons } from '@iconify/svelte';
	import { DateInput } from 'date-picker-svelte';
	import clsx from 'clsx';

	type JsonData = {
		input: string;
		password?: string;
		hashLength: number;
		expire: number;
		burn: boolean;
	};

	type Error = {
		type: 'input' | 'password' | 'expire' | 'other' | null;
		message: string | null;
	};

	let day = 24 * 60 * 60 * 1000;

	let error: Error = $state({ type: null, message: null });
	let customExpire = $state({ use: false, date: null });
	let payload = $state({
		input: '',
		link: '',
		password: {
			use: false,
			text: null
		},
		urlLength: 9,
		burn: false,
		expire: 30
	});

	const maxChar = 80000;

	$effect(() => {
		if (customExpire.use && customExpire.date) {
			// @ts-ignore
			payload.expire = Math.round((customExpire.date.getTime() - new Date().getTime()) / 60000);
			console.log(payload.expire);
		}
	});

	function resetError() {
		error.type = null;
		error.message = null;
	}

	function submit() {
		let jsonData: JsonData = {
			input: payload.input,
			hashLength: payload.urlLength,
			expire: payload.expire,
			burn: payload.burn
		};
		resetError();

		if (payload.input.length == 0) {
			error.type = 'input';
			error.message = 'invalid input';
			return;
		}

		if (customExpire.use) {
			if (!customExpire.date) {
				error.type = 'expire';
				error.message = 'invalid expiration';
				return;
			}
		}

		if (payload.expire < 1 && payload.urlLength < 9) {
			error.type = 'expire';
			error.message = 'invalid expiration';
			return;
		}

		if (payload.password.use) {
			if (!payload.password.text) {
				error.type = 'password';
				error.message = 'Password does not exist';
				return;
			}

			jsonData = { ...jsonData, password: payload.password.text };
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
					let err = new Error(resText.message);
					throw err;
				}

				payload.link = window.location + resText.message;
				if (payload.password.use) {
					payload.link += '?p=' + payload.password.text;
				}
			})
			.catch((err) => {
				payload.link = err;
				console.error(err);
			});
	}

	function copyLink(e: HTMLDivElement) {
		const [anchor, button] = e.children as unknown as [HTMLInputElement, HTMLButtonElement];

		anchor.addEventListener('click', () => {
			if (payload.link.length != 0) {
				window.open(payload.link, '_blank');
			}
		});

		button.addEventListener('click', () => {
			anchor.focus();
			anchor.select();
			navigator.clipboard.writeText(anchor.value);
		});
	}

	loadIcons([
		'material-symbols:content-copy-outline-rounded',
		'material-symbols:local-fire-department-outline-rounded'
	]);
</script>

<div class="wrap lg:text-lg m-auto lg:mt-20 mt-12 text-3xl">
	<div class="flex lg:flex-row flex-col gap-4 justify-center w-full">
		<div class="relative contain flex-1">
			<textarea
				name="txt"
				id="txt"
				class="w-full lg:h-full max-lg:h-96"
				bind:value={payload.input}
				maxlength={maxChar}
			>
			</textarea>

			<span class="absolute bottom-4 right-4 pointer-events-none z-10 text-[hsl(var(--primary))]">
				<div
					class="absolute bottom-0 left-0 w-full h-full bg-[hsla(var(--background))] -z-10 p-2 opacity-40"
				></div>
				<p class="z-20">
					{payload.input.length} / {maxChar}
				</p>
			</span>
		</div>

		<div id="r-contain">
			<button id="submit" onclick={submit}>Submit</button>
			<div class="border flex items-center" use:copyLink>
				<input
					class="border-none flex-1 cursor-pointer w-full"
					value={payload.link}
					type="text"
					readonly={true}
				/>
				<button class="border-none pl-0">
					<Icon icon="material-symbols:content-copy-outline-rounded" />
				</button>
			</div>

			<div class="flex flex-col gap-3">
				<span class="flex justify-between">
					<p class="text-sm">URL Size</p>
					{#if payload.urlLength <= 8}
						<p class="text-sm text-red-400">*Insecure</p>
					{:else if payload.urlLength <= 12}
						<p class="text-sm text-yellow-400">*Secure</p>
					{:else}
						<p class="text-sm text-green-400">*Very Secure</p>
					{/if}
				</span>
				<Counter bind:count={payload.urlLength} max={defaults.maxHash} min={defaults.minHash} />
			</div>

			<div class="flex flex-col gap-3">
				<div class="flex gap-3 justify-between items-center">
					<p class="text-sm">Expiration</p>
					<span class="text-sm flex gap-3 items-center">
						<div>
							<p>Picker</p>
						</div>
						<Checkbox bind:checked={customExpire.use} />
					</span>
				</div>
				<div class="flex gap-3 text-base leading-none">
					{#if customExpire.use}
						<DateInput
							class="flex-1"
							bind:value={customExpire.date}
							min={new Date(new Date().getTime() + 1000)}
							max={new Date(
								new Date().getTime() +
									(payload.urlLength == 4
										? 2 * day
										: payload.urlLength >= 9
											? 1826 * day
											: 30 * day)
							)}
							timePrecision="minute"
						/>
					{:else}
						<select class="focus:bg-bg-700 flex-1" bind:value={payload.expire}>
							<option value={15}> 60 Seconds </option>
							<option value={30}> 30 Minutes </option>
							<option value={60}> 1 Hour </option>
							<option value={60 * 6}> 6 Hours </option>
							<option value={60 * 24}> 24 Hours </option>
							{#if payload.urlLength == 4 && !payload.password.use}
								<option value={60 * 48}> 2 Days </option>
							{:else}
								<option value={60 * 24 * 7}> 7 days </option>
								<option value={60 * 24 * 30}> 30 days </option>
							{/if}

							{#if payload.urlLength >= 9}
								<option value={0}>Never</option>
							{/if}
						</select>
					{/if}
					<button
						class={clsx('text-center', 'text-lg', payload.burn ? 'bg-pri-800 text-pri-200' : '')}
						title="Destroy on View"
						onclick={() => {
							payload.burn = !payload.burn;
						}}
					>
						<Icon icon="material-symbols:local-fire-department-outline-rounded" />
					</button>
				</div>
			</div>
			<div class="flex gap-3 items-center">
				<Checkbox bind:checked={payload.password.use} />
				<label
					class="select-none text-sm"
					for="u-pass"
					onclick={() => {
						payload.password.use = !payload.password.use;
					}}>Password Protect</label
				>
			</div>

			<input
				class={clsx('w-fit', 'w-full')}
				id="password-input"
				type="password"
				placeholder="Password"
				bind:value={payload.password.text}
				disabled={!payload.password.use}
			/>
		</div>
	</div>
</div>

<style>
	#r-contain {
		@apply gap-5;
		display: flex;
		flex-direction: column;
	}

	#password-input:disabled {
		filter: brightness(60%);
	}

	.wrap {
		width: clamp(200px, 93%, 1000px);
		padding: 10px;
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
