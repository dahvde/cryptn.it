<script lang="ts">
	import Icon, { loadIcon } from '@iconify/svelte';
	import Logo from '$lib/components/Logo.svelte';
	import '../global.css';

	const { children } = $props();

	loadIcon('mdi:github');
</script>

<div class="flex h-full flex-col">
	<div class="py-8">
		<a class="m-auto block w-48 p-0" href="/">
			<Logo />
		</a>
	</div>
	<div class="flex-1">
		{@render children()}
	</div>

	<footer class="mt-6">
		<hr />
		<div class="notranslate m-auto grid grid-cols-3 items-center p-2 text-text-300">
			<a
				class="col-start-2 m-auto"
				href="https://github.com/dahvde/cryptn.it"
				target="_blank"
				aria-label="Website source code"><Icon class="text-2xl" icon="mdi:github" /></a
			>
			<p class="col-start-3 justify-self-end text-xs">© 2025 Cryptn.it</p>
		</div>
	</footer>
</div>
