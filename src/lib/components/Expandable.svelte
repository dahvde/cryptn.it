<script>
	import Icon, { loadIcon } from '@iconify/svelte';
	import { slide } from 'svelte/transition';

	let { children, open = $bindable(), title, class: CLASS } = $props();
	loadIcon('material-symbols:keyboard-arrow-up-rounded');
</script>

<div class={CLASS}>
	<button
		aria-label="Toggle Open"
		class="flex w-full items-center justify-between border-0 px-0 py-1"
		tabindex="0"
		onclick={() => {
			open = !open;
		}}
	>
		<p class="border-none p-0 text-lg font-semibold">{title}</p>
		<div class="float-end transition-transform" class:rotate-180={open}>
			<Icon icon="material-symbols:keyboard-arrow-up-rounded" />
		</div>
	</button>
	<hr />
	{#if open}
		<div class="text-base" transition:slide>{@render children()}</div>
	{/if}
</div>
