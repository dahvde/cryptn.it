<script lang="ts">
	import Icon from '@iconify/svelte';
	import clsx from 'clsx';
	interface Props {
		checked: boolean;
		class?: string;
	}

	let { checked = $bindable(), class: CLASS }: Props = $props();
</script>

<button
	class={clsx('p-1 w-6 h-6 flex justify-center items-center', checked ? 'bg-pri-800' : '', CLASS)}
	onclick={() => {
		checked = !checked;
	}}
>
	{#if checked}
		<Icon icon="material-symbols:check-rounded" />
	{/if}
</button>
