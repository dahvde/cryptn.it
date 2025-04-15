<script lang="ts">
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	interface Props {
		element?: HTMLDialogElement;
		children: any;
		class?: string;
		showClose?: boolean;
		title?: string;
		open?: boolean;
	}

	let {
		element = $bindable<HTMLDialogElement>(),
		children,
		class: className,
		showClose = true,
		title,
		open = $bindable(false)
	}: Props = $props();

	function handleClick(e: MouseEvent) {
		const dialogDimensions = element.getBoundingClientRect();
		if (
			e.clientX < dialogDimensions.left ||
			e.clientX > dialogDimensions.right ||
			e.clientY < dialogDimensions.top ||
			e.clientY > dialogDimensions.bottom
		) {
			open = false;
		}
	}

	onMount(() => {
		element.addEventListener('click', handleClick);
	});

	$effect(() => {
		if (open) {
			element.showModal();
		} else {
			element.close();
		}
	});
</script>

<dialog bind:this={element} class="border bg-bg-900 pt-2 text-right {className}">
	<div class="flex items-center justify-between px-2 pb-2">
		{#if title}
			<p class="text-lg font-medium text-bg-300">{title}</p>
		{/if}
		{#if showClose}
			<button class="text-right" onclick={() => (open = false)}>
				<Icon icon="material-symbols:close" />
			</button>
		{/if}
	</div>
	<hr />
	<div>{@render children()}</div>
</dialog>

<style>
	dialog::backdrop {
		background-color: rgba(0, 0, 0, 0.26);
	}
</style>
