<script lang="ts">
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	interface Props {
		initialOpen: boolean;
		element?: HTMLDialogElement;
		children: any;
		class?: string;
		showClose?: boolean;
		title?: string;
	}

	let {
		element = $bindable<HTMLDialogElement>(),
		initialOpen = false,
		children,
		class: className,
		showClose = true,
		title
	}: Props = $props();

	function handleClick(e: MouseEvent) {
		const dialogDimensions = element.getBoundingClientRect();
		if (
			e.clientX < dialogDimensions.left ||
			e.clientX > dialogDimensions.right ||
			e.clientY < dialogDimensions.top ||
			e.clientY > dialogDimensions.bottom
		) {
			element.close();
		}
	}
	onMount(() => {
		element.addEventListener('click', handleClick);
	});
</script>

<dialog bind:this={element} open={initialOpen} class="border bg-bg-900 pt-2 text-right {className}">
	<div class="flex items-center justify-between px-2 pb-2">
		{#if title}
			<p class="text-lg font-medium text-bg-300">{title}</p>
		{/if}
		{#if showClose}
			<button class="text-right" onclick={() => element?.close()}>
				<Icon icon="material-symbols:close" />
			</button>
		{/if}
	</div>
	<hr />
	<div>{@render children()}</div>
</dialog>
