<script lang="ts">
	import { EditorView, keymap, ViewPlugin, ViewUpdate } from '@codemirror/view';
	import { EditorState, StateEffect } from '@codemirror/state';
	import { minimalSetup } from 'codemirror';
	import type { Extension } from '@codemirror/state';
	import { languages } from '@codemirror/language-data';
	import { indentWithTab } from '@codemirror/commands';
	import { baseTheme, myTheme } from './Theme';
	import { getView, setView } from './State.svelte';
	import { MAXCHARS } from '$lib/settings';

	interface Props {
		text: string;
		language?: string;
		class?: string;
		extraExtensions?: Extension[];
		readonly?: boolean;
		focused?: boolean;
	}

	let view = $state<EditorView>();
	let editorContainer: HTMLElement;

	async function getLanguage(language: string) {
		if (language === 'raw') {
			return [];
		}

		const lang = languages.find((lang) => lang.name.toLowerCase() === language.toLowerCase());

		return (await lang?.load())?.extension ?? [];
	}

	let {
		text = $bindable(''),
		language = $bindable('raw'),
		class: CLASS,
		extraExtensions = $bindable([]),
		readonly = $bindable(false),
		focused = $bindable(false)
	}: Props = $props();

	let extensions = $derived([
		minimalSetup,
		...extraExtensions,
		...(language != 'raw' ? [myTheme, keymap.of([indentWithTab])] : [baseTheme]),
		...(readonly ? [EditorView.editable.of(false)] : []),
		EditorState.changeFilter.of((tr) => {
			return (tr.state.doc.length + tr.newDoc.length) / 2 <= MAXCHARS;
		}),
		ViewPlugin.fromClass(
			class {
				constructor() {
					if (view?.hasFocus) {
						focused = true;
					}
				}

				update(update: ViewUpdate) {
					if (update.focusChanged) {
						if (update.view.hasFocus) {
							focused = true;
						} else {
							focused = false;
						}
					}
				}
			}
		),
		EditorView.updateListener.of((update) => {
			text = update.state.doc.toString();
		})
	]);

	$effect(() => {
		getLanguage(language).then((lang) => {
			if (view === undefined) {
				const state = EditorState.create({
					doc: text,
					extensions: [...extensions, lang ?? []]
				});

				let tempView = new EditorView({
					state,
					parent: editorContainer
				});

				setView(tempView);

				view = getView();

				return () => {
					view?.destroy();
				};
			}

			view?.dispatch({
				effects: StateEffect.reconfigure.of([...extensions, lang ?? [], ...extraExtensions])
			});
		});
	});
</script>

<div
	class="codemirror cursor-text {CLASS}"
	onclick={() => view?.focus()}
	onkeydown={(e) => e.key === 'Enter' && view?.focus()}
	role="textbox"
	tabindex="0"
	bind:this={editorContainer}
></div>
