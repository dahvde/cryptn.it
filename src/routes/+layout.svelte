<script lang="ts">
	import Icon, { loadIcon } from '@iconify/svelte';
	import logo from '$lib/assets/logo.svg';
	import '../global.css';

	const { children } = $props();

	loadIcon('mdi:github');
</script>

<div class="h-full flex flex-col">
	<div class="py-8">
		<img class="max-w-40 m-auto" src={logo} alt="Title" />
	</div>
	<div class="flex-1">
		{@render children()}
	</div>

	<footer class="">
		<hr />
		<div class="w-max m-auto p-4">
			<a href="https://github.com/dahvde/cryptn.it" target="_blank"
				><Icon class="text-2xl" icon="mdi:github" /></a
			>
		</div>
	</footer>
</div>
