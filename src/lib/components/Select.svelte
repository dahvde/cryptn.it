<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import Icon, { loadIcon } from '@iconify/svelte';

	let customSelect: HTMLSelectElement;

	interface Option {
		value: string;
		label: string;
	}

	interface Props extends HTMLSelectAttributes {
		options: Option[] | string[];
		containerClass?: string;
		hiddenClass?: string;
		showIcon?: boolean;
		isOpen?: boolean;
	}

	let width = $state();

	let {
		options: rawOptions,
		class: CLASS,
		value = $bindable(),
		containerClass,
		showIcon = true,
		hiddenClass,
		isOpen = $bindable(false),
		...props
	}: Props = $props();

	let options: Option[] = $derived.by(() => {
		if (typeof rawOptions[0] === 'string') {
			return rawOptions.map((option) => ({ value: option, label: option })) as Option[];
		}

		return rawOptions as Option[];
	});

	function selectClickHandle(event: MouseEvent) {
		if (customSelect) {
			const rect = customSelect.getBoundingClientRect();
			const { clientX, clientY } = event;

			const isInComponent =
				clientX >= rect.left &&
				clientX <= rect.right &&
				clientY >= rect.top &&
				clientY <= rect.bottom;

			if (isInComponent === false) {
				isOpen = false;
			}
		}
	}

	function selectBlurHandle() {
		isOpen = false;
	}

	function selectKeyHandle(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			isOpen = true;
		}
	}

	function selectMousePress(event: MouseEvent) {
		isOpen = !isOpen;
	}

	loadIcon('material-symbols:arrow-drop-down-rounded');
</script>

<div class="flex items-center {containerClass} relative w-full">
	<div class="flex items-center {CLASS}" bind:clientWidth={width}>
		<p class="w-full">{options.find((option) => option.value === value)?.label}</p>

		<Icon icon="material-symbols:arrow-drop-down-rounded" />
	</div>

	<select
		class="absolute left-0 top-0 opacity-0 {hiddenClass}"
		style="width: {width}px"
		{...props}
		bind:value
		bind:this={customSelect}
		onclick={selectClickHandle}
		onmousedown={selectMousePress}
		onkeydown={selectKeyHandle}
		onblur={selectBlurHandle}
	>
		{#each options as option}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>

	{#if showIcon}{/if}
</div>
