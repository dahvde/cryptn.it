<script lang="ts">
	interface Props {
		children: any;
		class?: string;
		title: string;
	}

	let { children, class: CLASS, title }: Props = $props();

	function tooltipEvent(e: HTMLDivElement) {
		const tooltip = e.children[1] as HTMLElement;

		e.addEventListener('mouseenter', () => {
			tooltip.style.visibility = 'visible';
			tooltip.style.transitionDelay = '0.4s';
		});

		e.addEventListener('mouseleave', () => {
			tooltip.style.visibility = 'hidden';
			tooltip.style.transitionDelay = '0s';
		});
	}
</script>

<div class="relative {CLASS}" use:tooltipEvent>
	<div>
		{@render children()}
	</div>

	<div
		class="tooltip invisible absolute bottom-0 left-1/2 z-20 w-max translate-x-[-50%] translate-y-[115%] select-none rounded-md border-[1px] border-pri-800 bg-pri-900 p-2 text-bg-50 shadow-md"
	>
		{title}
	</div>
</div>
