<script lang="ts">
	import Checkbox from '$lib/components/Checkbox.svelte';
	import Counter from '$lib/components/Counter.svelte';
	import defaults from '$lib/settings';
	import Icon, { loadIcons } from '@iconify/svelte';
	import Expandable from '$lib/components/Expandable.svelte';
	import { UrlStore } from '$lib/crypt';
	import { formatNumber, cnd } from '$lib/utils';
	import CodeMirror from '$lib/components/CodeMirror/CodeMirror.svelte';
	import { ALLOWEDFORMATS } from '$lib/settings';
	import Select from '$lib/components/Select.svelte';
	import { onMount } from 'svelte';

	let customExpire = $state({ state: 0, date: null });

	const HOUR = 60;
	const DAY = HOUR * 24;

	let focusEvents = $state({ editor: false, select: false });

	let payload = $state({
		input: '',
		link: '',
		password: {
			state: 0,
			text: null,
			focused: false
		},
		urlLength: 13,
		burn: false,
		expire: 0,
		public: false,
		zk: true,
		title: '',
		format: 'raw',
		tags: [],
		error: false
	});

	let MAXEXPIREMS = $derived.by(() => {
		let maxMinutes =
			payload.urlLength == 4 ? 2 * DAY : payload.urlLength >= 9 ? defaults.MAXEXPIRE : 30 * DAY;
		return new Date(new Date().getTime() + maxMinutes * 1000 * 60);
	});
	let expand = $state(false);

	async function submit() {
		try {
			payload.error = false;
			if (customExpire.state && customExpire.date) {
				payload.expire = Math.round(
					(new Date(customExpire.date).getTime() - new Date().getTime()) / 60000
				);
			}

			if (payload.input.length == 0) throw 'Invalid input';
			if (!payload.title.length) payload.title = 'Untitled';
			if (customExpire.state && !customExpire.date) throw 'Invalid expiration';
			if (payload.expire < 1 && payload.urlLength < 9) throw 'Invalid expiration';
			if (payload.password.state && !payload.public && !payload.password.text)
				throw 'Password is empty';

			let res = await fetch('/api/url', {
				method: 'POST',
				body: JSON.stringify({ length: payload.urlLength }),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!res.ok) {
				throw new Error('Error while generating url');
			}

			const resJson = await res.json();

			let url = new UrlStore(
				resJson.data.url,
				payload.input,
				payload.title,
				resJson.data.salt,
				resJson.data.iv,
				payload.password.state ? payload.password.text! : '',
				payload.expire,
				payload.zk,
				payload.public,
				payload.burn
			);

			await url.deriveKey();

			res = await fetch('/api/new', {
				method: 'POST',
				body: JSON.stringify({ ...(await url.json()), format: payload.format }),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!res.ok) throw new Error('Error creating post');

			payload.link = window.location + resJson.data.url;
		} catch (err) {
			if (import.meta.env.DEV) {
				console.error(err);
			}

			payload.link = err as string;
			payload.error = true;
			return;
		}
	}

	onMount(() => {
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && expand) {
				expand = false;
			}
		});
	});

	loadIcons([
		'material-symbols:content-copy-outline-rounded',
		'material-symbols:local-fire-department-outline-rounded',
		'material-symbols:expand-more-rounded'
	]);
</script>

<div class="wrap m-auto mt-8 text-lg">
	<!-- Main Container -->
	<div
		class="{expand
			? 'absolute left-0 top-0 h-full w-full bg-bg-950 [&_*]:rounded-none'
			: 'gap-3'} grid grid-cols-3 max-lg:grid-cols-2 max-lg:grid-rows-2"
	>
		<!-- Left Column -->
		<div
			class="contain relative col-span-2 flex flex-col gap-2 {expand
				? 'col-span-full row-span-full'
				: 'col-span-2'}"
			class:lg:border-r-[1px]={expand}
		>
			<input
				class="w-full text-base placeholder:text-text-200 focus:placeholder:opacity-0"
				class:border-none={expand}
				type="text"
				placeholder="Untitled"
				bind:value={payload.title}
				maxlength={defaults.MAXRAWTITLELENGTH}
			/>
			{#if expand}
				<hr class="border-t-[1px] border-bg-700" />
			{/if}

			<!-- Editor -->
			<div
				class="flex h-full flex-col {cnd(!expand, 'border')}"
				class:!border-pri-400={!expand && focusEvents.editor}
			>
				<div class="relative flex flex-1 flex-col">
					<!-- Top Bar -->
					<div class="absolute h-full w-full flex-1 pl-2 pt-2">
						<CodeMirror
							bind:text={payload.input}
							bind:language={payload.format}
							bind:focused={focusEvents.editor}
							class="h-full w-full"
						/>
					</div>
				</div>

				<!-- Bottom bar -->
				<div
					class="grid w-full grid-cols-3 items-center gap-2 border-t-[1px] px-2 py-1 text-sm"
					class:border-pri-400={!expand && focusEvents.editor}
				>
					<div class="relative flex items-center gap-2">
						<Select
							hiddenClass="p-0"
							options={ALLOWEDFORMATS}
							showIcon={false}
							bind:value={payload.format}
						/>
					</div>
					<button
						class="w-max justify-self-center border-none"
						title="expand"
						onclick={() => (expand = !expand)}
					>
						<Icon icon="material-symbols:expand-more-rounded" />
					</button>
					<p class="z-20 justify-self-end">
						{payload.input.length.toLocaleString()} / {formatNumber(defaults.MAXCHARS)}
					</p>
				</div>
			</div>
		</div>

		<!-- Right Column -->
		<div class="flex flex-col gap-10 max-lg:col-span-2 {cnd(expand, 'hidden')}">
			<button id="submit" onclick={submit}>Submit</button>
			<div class="flex items-center border">
				<input
					class="w-full flex-1 cursor-pointer border-none"
					name="response"
					value={payload.link}
					onclick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						if (!payload.error && payload.link.length !== 0) {
							window.open(payload.link, '_blank');
						}
					}}
					type="text"
					readonly={true}
				/>
				<button
					class="border-none pl-0"
					title="Copy"
					onclick={() => {
						navigator.clipboard.writeText(payload.link);
					}}
				>
					<Icon icon="material-symbols:content-copy-outline-rounded" />
				</button>
			</div>

			<div class="flex flex-col gap-3">
				<span class="flex justify-between">
					<p class="text-sm">URL Size</p>
					{#if payload.urlLength <= 8 || payload.public}
						<p class="text-sm text-red-400">*Insecure</p>
					{:else if payload.urlLength <= 12 || !payload.zk}
						<p class="text-sm text-yellow-400">*Secure</p>
					{:else}
						<p class="text-sm text-green-400">*Very Secure</p>
					{/if}
				</span>
				<Counter
					bind:count={payload.urlLength}
					max={payload.public ? 16 : defaults.MAXPRIVATEHASH}
					min={payload.public ? 5 : defaults.MINPRIVATEHASH}
				/>
			</div>

			<div class="flex flex-col gap-3">
				<div class="flex items-center justify-between gap-3">
					<p class="text-sm">Expiration</p>
					<span class="flex items-center gap-3 text-sm">
						<div>
							<p>Date Picker</p>
						</div>
						<Checkbox bind:selected={customExpire.state} name="date-picker" />
					</span>
				</div>

				<div class="flex gap-3 text-base leading-none">
					{#if customExpire.state}
						<input
							type="date"
							class="flex-1"
							min={new Date(new Date().getTime() + 1000).toISOString().split('T')[0]}
							max={MAXEXPIREMS.toISOString().split('T')[0]}
							bind:value={customExpire.date}
						/>
					{:else}
						<div
							class="relative flex flex-1 items-center border"
							class:!border-pri-400={focusEvents.select}
						>
							<Select
								class="w-full border-none px-0 pl-2"
								containerClass="pr-2"
								bind:value={payload.expire}
								bind:isOpen={focusEvents.select}
								options={[
									{ value: 1, label: '60 Seconds' },
									{ value: 30, label: '30 Minutes' },
									{ value: HOUR, label: '1 Hour' },
									{ value: HOUR * 6, label: '6 Hours' },
									{ value: DAY, label: '24 Hours' },
									...cnd(payload.urlLength == 4, [{ value: DAY * 2, label: '2 Days' }]),
									...cnd(payload.urlLength >= 9, [
										{ value: DAY * 7, label: '7 Days' },
										{ value: DAY * 30, label: '30 Days' },
										{ value: 0, label: 'Never' }
									])
								]}
							/>
						</div>
					{/if}
					<button
						title="Destroy on View"
						class="h-full text-center {cnd(payload.burn, 'bg-pri-800 text-pri-200')}"
						aria-label="Destroy on View"
						onclick={() => {
							payload.burn = !payload.burn;
						}}
					>
						<Icon icon="material-symbols:local-fire-department-outline-rounded" />
					</button>
				</div>
			</div>
			<div class="flex gap-3">
				<!-- <button
					class={clsx('text-center', 'text-sm', 'flex-1')}
					title="Visibility"
					onclick={toggleVisibility}
				>
					{payload.public ? 'Public' : 'Private'}
					<Icon icon="material-" />
				</button> -->
				<button
					class="flex-1 text-center text-sm {cnd(
						payload.zk && !payload.public,
						'bg-pri-800 text-pri-200'
					)}"
					title="Encryption method"
					onclick={() => {
						payload.zk = !payload.zk;
					}}
					disabled={payload.public}
				>
					E2E Encryption
				</button>
			</div>
			<div
				class="flex items-center border text-lg {cnd(!payload.password.state, '!bg-bg-950/50')}"
				class:!border-pri-400={payload.password.focused}
			>
				<input
					class="w-full rounded-none border-0 text-base"
					id="password-input"
					type={payload.password.state === 2 ? 'text' : 'password'}
					placeholder="Password"
					maxlength="24"
					onfocus={() => {
						payload.password.focused = true;
					}}
					onblur={() => {
						payload.password.focused = false;
					}}
					bind:value={payload.password.text}
					disabled={!payload.password.state || payload.public}
				/>
				<div class="p-2">
					<Checkbox
						class="p-toggle"
						bind:selected={payload.password.state}
						extraIcon="material-symbols:horizontal-rule-rounded"
						disabled={payload.public}
					/>
				</div>
			</div>
		</div>

		<!-- TODO: Add tags -->
		<!-- <Tags class="col-span-3 flex-1" bind:tags={payload.tags} max={10} /> -->
	</div>

	<Expandable class="mt-8" title="What is E2E Encryption?"
		>E2E Encryption is the recommeded option for optimal security. Encryption and decryption are
		only handled on the browser. When E2E Encryption is disabled, <span class="text-accent-500">
			the server is allowed to handle decryption
		</span>. This would allow you to access your data from the <b>/raw</b> route and allow access
		from cli tools like <b>curl</b>.
	</Expandable>
	<!-- <Expandable class="mt-4" title="What does private/public do?"
		>When accessibility is set to public, the raw url for your text store is placed in our database.</Expandable
	> -->
	<Expandable class="mt-4" title="What does burn do?"
		>When burn/destroy on view is enabled, your data will be deleted after it is viewed. This also
		applies to password protected data. Even if the password is incorrect, it will be deleted after
		it is viewed.</Expandable
	>
	<Expandable class="mt-4" title="How can I view the password?"
		>You can view the password by clicking the password toggle button twice. This will show the
		password in plain text.</Expandable
	>

	<!-- <div class="mt-4 w-max m-auto">
		<span>For more information check out the</span>
		<a href="/docs" class="text-pri-500">docs</a>
	</div> -->
</div>

<style lang="postcss">
	.wrap {
		width: clamp(200px, 93%, 1000px);
		padding: 10px;
	}

	:global(.cm-editor),
	:global(.cm-wrap) {
		min-height: 200px;
		height: 100%;
	}

	:global(.cm-scroller) {
		overflow: auto;
	}

	#submit {
		background: theme('colors.accent.700');
		border: none;
		padding: 20px;
	}
</style>
