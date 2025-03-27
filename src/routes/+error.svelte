<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="flex h-full w-screen select-none flex-col items-center justify-center" id="error">
	<div id="error-text" class="text-stroke text-[20rem] font-black text-pri-400">{$page.status}</div>
	<a class="anchor-button !bg-sec-800 font-medium" href="/">Home</a>
</div>

<style>
	#error-text {
		text-shadow:
			-8px -8px 0 theme('colors.pri.600'),
			0px -1px 0 #000,
			-1px 1px 0 #000,
			1px 1px 0 #000;
	}
</style>
