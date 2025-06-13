<script lang="ts">
    import QRCode from "$lib/components/QRCode.svelte";
    import { page } from "$app/stores";
    import { UrlStore } from "$lib/crypt";
    import Icon, { loadIcons } from "@iconify/svelte";
    import { onMount } from "svelte";
    import { fly } from "svelte/transition";
    import CodeMirror from "$lib/components/CodeMirror/CodeMirror.svelte";
    import { EditorView, lineNumbers } from "@codemirror/view";
    import { cnd, dateFromNow } from "$lib/utils";
    import type { Extension } from "@codemirror/state";

    let [iv, encText] = $page.data.text.split(":");
    let rawTitle: string = $state("");
    let rawText: string = $state("");
    let loading = $state(true);
    let expand = $state(false);
    let password = $state("");
    let store = new UrlStore(
        "",
        encText,
        $page.data.title,
        $page.data.salt,
        iv,
        "",
    );
    let unlocked = $state(false);
    let kbSize = $state(0);
    let qr = $state({
        open: false,
        link: $page.url,
    });

    let extensions: Extension[] = $state([]);

    async function copyLink() {
        await navigator.clipboard.writeText(rawText);
    }

    onMount(async () => {
        store.url = window.location.pathname.substring(1);

        if (!$page.data.password) {
            await decrypt();
        }
    });

    $effect(() => {
        extensions = [
            EditorView.theme({
                ".cm-scroller": {
                    "max-height": "var(--cm-height)",
                    overflow: "auto",
                    width: "100%",
                },
            }),

            !expand ? lineNumbers() : [],
        ];
    });

    async function decrypt() {
        if ($page.data.password) {
            store.password = password;
        }

        try {
            await store.deriveKey();

            const { text, title } = await store.fullDecrypt();

            rawText = text;
            rawTitle = title;

            loading = false;
            unlocked = true;
        } catch (err) {
            console.error(err);
        }

        const length = rawText.length;
        const lineBreaks = length - rawText.replace(/(\r?\n|\r)/g, "").length;
        const nonAscii =
            length - rawText.replace(/[\u0100-\uFFFF]/g, "").length;

        const combined = length + nonAscii + Math.max(0, 2 + (lineBreaks - 1));

        kbSize = Math.max(1, Math.round(combined / 1024));

        if ($page.data.zk) {
            password = "";
        }
    }

    function scroll(top: boolean) {
        let textArea = document.querySelector(".cm-scroller") as HTMLElement;

        textArea.scrollTop = top ? 0 : textArea.scrollHeight;
    }

    loadIcons([
        "material-symbols:content-copy-outline-rounded",
        "material-symbols:close-fullscreen-rounded",
        "material-symbols:arrow-downward-rounded",
        "material-symbols:open-in-full-rounded",
        "material-symbols:text-snippet-outline",
        "material-symbols:lock",
    ]);
</script>

<div
    class="relative m-auto mt-8 w-[90%] max-w-[1000px] rounded-sm border-[1px]"
>
    <div class="grid grid-cols-[1fr_auto] justify-between border-b-[1px]">
        <div class="flex w-full min-w-0 items-center justify-between">
            {#if !unlocked && $page.data.password}
                <p class="w-full p-2 text-base font-medium">
                    This data is password protected
                </p>
                <div class="p-2">
                    <Icon class="text-bg-600" icon="material-symbols:lock" />
                </div>
            {:else}
                <div class="min-w-0 flex-1 pl-2 text-base font-medium">
                    <p class="overflow-hidden text-ellipsis whitespace-nowrap">
                        {rawTitle}
                    </p>
                </div>
                <p
                    class="justify-self-end p-2 text-sm font-medium text-text-500"
                >
                    {dateFromNow(new Date($page.data.created))}
                </p>
            {/if}
        </div>
        <div class="flex gap-0">
            {#if unlocked}
                {#if !$page.data.zk}
                    <button
                        title="Raw"
                        class="!rounded-none border-[0px] border-l-[1px] p-3"
                        onclick={() => {
                            window.open(
                                `/raw/${window.location.pathname.substring(1)}${cnd($page.data.password, `?p=${password}`)}`,
                                "_blank",
                            );
                        }}
                    >
                        <Icon icon="material-symbols:text-snippet-outline" />
                    </button>
                {/if}
                <button
                    title="QR Code"
                    class="!rounded-none border-[0px] border-l-[1px] p-3"
                    onclick={() => {
                        qr.open = true;
                    }}
                >
                    <Icon icon="material-symbols:qr-code-2" />
                </button>
                <button
                    title="Copy"
                    class="!rounded-none border-[0px] border-l-[1px] p-3"
                    onclick={copyLink}
                >
                    <Icon
                        icon="material-symbols:content-copy-outline-rounded"
                    />
                </button>
                <button
                    title="Fullscreen"
                    class="!rounded-none border-[0px] border-l-[1px] p-3"
                    onclick={() => {
                        expand = !expand;
                    }}
                >
                    <Icon icon="material-symbols:open-in-full-rounded" />
                </button>
            {/if}
        </div>
    </div>
    {#if !loading}
        <div
            class="h-max max-h-[calc(100vh-300px)] min-h-8 overflow-auto {cnd(
                expand,
                'min-h-none fixed left-0 top-0 h-screen !max-h-none w-screen bg-pri-950 !pr-0',
            )}"
            style="--cm-height: {expand
                ? '100vh'
                : 'max(calc(100vh - 300px), 8rem)'}"
            id="text-area"
        >
            <CodeMirror
                bind:text={rawText}
                readonly={true}
                bind:extraExtensions={extensions}
                language={$page.data.format}
            />
        </div>

        <div
            class="flex flex-row-reverse items-center justify-between border-t-[1px] p-1 text-sm text-text-500"
        >
            <p>
                {kbSize} kb
            </p>
            <p>{$page.data.format}</p>
        </div>
    {/if}

    {#if !unlocked && $page.data.password}
        <div class="flex flex-row items-center justify-center">
            <input
                class="w-full border-none"
                placeholder="Enter Password"
                type="text"
                onkeydown={(e) => {
                    if (e.key === "Enter") {
                        decrypt();
                    }
                }}
                bind:value={password}
            />

            <button
                class="rounded-none border-0 !border-l-[1px]"
                onclick={() => {
                    decrypt();
                }}
            >
                Decrypt
            </button>
        </div>
    {/if}
    {#if loading}
        <div
            class="absolute bottom-0 left-0 z-50 h-1 w-full overflow-hidden bg-bg-800"
        >
            <div class="indeterminate-bar"></div>
        </div>
    {/if}
</div>

{#if expand}
    <div
        class="absolute bottom-0 right-0 z-50 m-4 grid grid-cols-1 grid-rows-2 rounded-md text-xl [&>*]:bg-pri-900"
        transition:fly={{ y: -40, duration: 200 }}
    >
        <button
            class="justify-self-end !rounded-b-none rounded-t-lg border-[1px] border-b-0 p-3"
            onclick={() => scroll(true)}
        >
            <Icon icon="material-symbols:arrow-upward-rounded" />
        </button>
        <div
            class="grid grid-cols-3 overflow-hidden rounded-md rounded-tr-none border-[1px]"
        >
            <button class="!rounded-none border-[0px] p-3" onclick={copyLink}>
                <Icon icon="material-symbols:content-copy-outline-rounded" />
            </button>
            <button
                class="!rounded-none border-[0px] border-l-[1px] p-3"
                onclick={() => {
                    expand = !expand;
                }}
            >
                <Icon icon="material-symbols:close-fullscreen-rounded" />
            </button>
            <button
                class="!rounded-none border-[0px] border-l-[1px] p-3"
                onclick={() => scroll(false)}
            >
                <Icon icon="material-symbols:arrow-downward-rounded" />
            </button>
        </div>
    </div>
{/if}

{#if unlocked}
    <QRCode
        {password}
        class="z-30"
        link={new URL(qr.link)}
        zk={$page.data.zk}
        bind:open={qr.open}
    />
{/if}

<!-- <div>
		<div class="p-2" id="qrcode"></div>
		{#if !$page.data.zk}
			<div class="flex w-full border-t-[1px] text-sm text-text-400">
				<button
					class="flex-1 rounded-none border-0 border-l-[1px] p-2 {cnd(qr.plain, 'bg-bg-800')}"
					onclick={() => (qr.plain = true)}>PLAIN</button
				>
				<button
					class="flex-1 rounded-none border-0 p-2 {cnd(!qr.plain, 'bg-bg-800')}"
					onclick={() => (qr.plain = false)}>RAW</button
				>
			</div>
		{/if}
	</div>
</QRCode> -->

<style>
    li::marker {
        @apply select-none text-base text-bg-400;
        content: counter(list-count) " ";
    }

    .cm-gutterElement {
        border-right: 1px solid white;
    }

    :global(.cm-editor) {
        height: 100%;
    }

    /* :global(.cm-scroller) {
		overflow: auto;
		max-height: calc(100vh - 300px);
		width: 100%;
	} */

    li {
        @apply !rounded-none border-0 border-l-[1px] pl-2;
        margin: 0;
        padding: 0;
        counter-increment: list-count;
    }

    li div {
        @apply pl-2 font-mono;
        line-height: 30px;
    }

    li:hover {
        @apply bg-bg-900/50;
    }

    ol {
        @apply m-0;
        list-style: decimal;
    }

    .indeterminate-bar {
        @apply bg-pri-400;
        width: 30%;
        height: 100%;
        position: absolute;
        animation: indeterminate 1.5s infinite ease-in-out;
    }

    @keyframes indeterminate {
        0% {
            left: -30%;
        }
        100% {
            left: 100%;
        }
    }
</style>
