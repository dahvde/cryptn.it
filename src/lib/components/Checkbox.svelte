<script lang="ts">
	import Icon, { loadIcon } from '@iconify/svelte';
	import clsx from 'clsx';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		selected: number;
		class?: string;
		name?: string;
		extraIcon?: string;
	}

	let { selected = $bindable(0), class: CLASS, extraIcon, ...props }: Props = $props();

	const listMax = extraIcon ? 3 : 2;
	loadIcon('material-symbols:check-rounded');
</script>

<button
	class="flex h-6 w-6 items-center justify-center p-1 {CLASS}"
	class:bg-pri-800={selected}
	onclick={() => {
		selected = (selected + 1) % listMax;
	}}
	{...props}
>
	{#if selected == 1}
		<Icon icon="material-symbols:check-rounded" />
	{/if}
	{#if extraIcon && selected == 2}
		<Icon icon={extraIcon} />
	{/if}
</button>
