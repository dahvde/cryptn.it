<script lang="ts">
	import settings, { MAXPRIVATEHASH } from '$lib/settings';
	import Icon from '@iconify/svelte';
	import { loadIcons } from '@iconify/svelte';

	interface Counter {
		count: number;
		max?: number;
		min?: number;
		disabled?: boolean;
	}

	let { count = $bindable(0), max = 20, min = 5, disabled }: Counter = $props();

	function addBorder(e: MouseEvent) {
		const target = e.target as HTMLElement;
		target.classList.add('!border-pri-400');
	}

	function removeBorder(e: MouseEvent) {
		const target = e.target as HTMLElement;
		target.classList.remove('!border-pri-400');
	}

	loadIcons(['tabler:minus', 'tabler:plus']);
</script>

<div class="flex items-center justify-between gap-4">
	<button
		aria-label="decrease"
		name="decrease"
		onmousedown={addBorder}
		onmouseup={removeBorder}
		onclick={() => {
			count -= 1;
		}}
		disabled={disabled || count <= min}
	>
		<Icon class="pointer-events-none" icon="tabler:minus" />
	</button>
	<input
		type="number"
		name="counter-value"
		class="counter-value w-full select-none border-none text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
		max={settings.MAXPRIVATEHASH}
		min={settings.MINPRIVATEHASH}
		onblur={() => {
			if (count > settings.MAXPRIVATEHASH) {
				count = settings.MAXPRIVATEHASH;
			}

			if (count < settings.MINPRIVATEHASH) {
				count = settings.MINPRIVATEHASH;
			}
		}}
		bind:value={count}
	/>
	<button
		aria-label="increase"
		onmousedown={addBorder}
		onmouseup={removeBorder}
		name="increase"
		onclick={() => {
			count += 1;
		}}
		disabled={disabled || count >= max}
	>
		<Icon class="pointer-events-none" icon="tabler:plus" />
	</button>
</div>
