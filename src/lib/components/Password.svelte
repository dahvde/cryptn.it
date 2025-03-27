<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	let visible = $state(false);

	interface Props extends HTMLInputAttributes {
		password: string;
	}

	let { password = $bindable(), class: CLASS }: Props = $props();
</script>

<div class="{CLASS} flex overflow-hidden rounded-md border bg-bg-900">
	<input
		class="rounded-none border-none focus:outline-none"
		type={visible ? 'text' : 'password'}
		bind:value={password}
	/>
	<button
		class="!rounded-none border-0 border-l-[1px] text-xs"
		onclick={() => {
			visible = !visible;
		}}>{visible ? 'hide' : 'show'}</button
	>
</div>
