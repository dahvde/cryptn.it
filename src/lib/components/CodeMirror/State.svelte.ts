import { EditorView } from '@codemirror/view';

let view = $state<EditorView>();

export function setText(text: string) {
	view?.dispatch({
		changes: { from: 0, to: view.state.doc.length, insert: text }
	});
}

export function setView(newView: EditorView) {
	view = newView;
}

export function getView() {
	return view;
}
