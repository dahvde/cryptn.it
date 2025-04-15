<script lang="ts">
	import { onMount } from 'svelte';
	import { cnd } from '$lib/utils';
	import Modal from './Modal.svelte';

	interface Props {
		link: URL | null;
		zk: boolean;
		password?: string;
		open: boolean;
		class?: string;
	}

	let qr = $state({ code: null, plain: true });

	let { link = $bindable(), zk, open = $bindable(false), password, class: CLASS }: Props = $props();

	let links = $derived.by(() => {
		if (link == null) return { plain: '', raw: '' };
		let raw = `${link.protocol}//${link.host}/raw${link.pathname}`;
		if (password) raw += `?p=${password}`;

		return { plain: link.toString(), raw };
	});

	onMount(async () => {
		let attempts = 0;

		while (attempts < 10) {
			try {
				await new Promise((resolve) => setTimeout(resolve, 200));
				// @ts-ignore
				qr.code = new QRCode('qrcode', {
					text: link,
					width: 300,
					height: 300,
					colorDark: `rgb(${getComputedStyle(document.documentElement).getPropertyValue('--primary-300')})`,
					colorLight: '#ffffff00',
					// @ts-ignore
					correctLevel: QRCode.CorrectLevel.L
				});

				break;
			} catch (err) {
				attempts += 1;
			}
		}
	});

	$effect(() => {
		if (zk) {
			qr.plain = true;
		}
	});

	$effect(() => {
		if (qr.code) {
			// @ts-ignore
			qr.code.makeCode(qr.plain ? links.plain : links.raw);
		}
	});
</script>

<svelte:head>
	<script src="/qrcode.min.js" async={false}></script>
</svelte:head>

<Modal bind:open title="QR Code" class={CLASS}>
	<div class="p-2" id="qrcode"></div>
	{#if !zk}
		<div class="flex w-full border-t-[1px] text-sm text-text-400">
			<button
				class="flex-1 rounded-none border-0 border-l-[1px] p-2 {cnd(qr.plain, 'bg-bg-800')}"
				onclick={() => (qr.plain = true)}>PLAIN</button
			>
			<button
				class="flex-1 rounded-none border-0 p-2 {cnd(!qr.plain, 'bg-bg-800')}"
				onclick={() => (qr.plain = false)}>RAW</button
			>
		</div>
	{/if}
</Modal>
