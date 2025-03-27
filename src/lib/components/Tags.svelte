<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		tags: string[];
		max?: number;
	}

	const { class: CLASS, tags = $bindable(), max }: Props = $props();

	function mount(i: EventTarget): void {
		i.addEventListener('mousedown', (e: Event) => {
			const target = e.target as HTMLElement;
			const index = target.getAttribute('data-index');

			if (index) {
				tags.splice(Number(index), 1);
			}
		});
	}
</script>

<div class="border {CLASS} flex flex-wrap items-center gap-2 p-2" use:mount>
	<div class="flex flex-1 flex-wrap gap-2">
		{#each tags as tag, i}
			<p class="rounded-sm bg-accent-800 px-1" data-index={i}>{tag}</p>{/each}
		<input
			class="min-w-10 flex-1 border-r-2 border-none px-0 py-0"
			type="text"
			onkeydown={function (e) {
				if (e.key === 'Backspace') {
					if (this.value !== '') return;

					tags.pop();
				}
				if (e.key !== 'Enter') return;
				if (tags.length === max) return;
				tags.push(this.value);
				this.value = '';
			}}
		/>
	</div>
	<p class="text-pri-400/30">|</p>
	<p class="text-pri-300">{tags.length} / 10</p>
</div>
