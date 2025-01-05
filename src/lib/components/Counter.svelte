<script lang="ts">
	import Icon from '@iconify/svelte';
	import { loadIcons } from '@iconify/svelte';

	interface Counter {
		count: number;
		max?: number;
		min?: number;
	}

	let { count = $bindable(0), max = 20, min = 5 }: Counter = $props();

	$effect(() => {
		if (count >= max) {
			count = max;
		}

		if (count <= min) {
			count = min
		}
	});

	loadIcons(['tabler:minus', 'tabler:plus']);
</script>

<div class="flex gap-4 justify-between items-center">
	<button
		onclick={() => {
			count -= 1;
		}}
	>
		<Icon icon="tabler:minus" />
	</button>
	<div class="">{count}</div>
	<button
		onclick={() => {
			count += 1;
		}}
	>
		<Icon icon="tabler:plus" />
	</button>
</div>
