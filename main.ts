import { Editor, MarkdownView, Notice, Plugin } from 'obsidian';

export default class RemoveSTX extends Plugin {

	async onload() {

		// This creates an icon in the left ribbon.
		this.addRibbonIcon('x-circle', 'Remove Start-of-Text (STX)', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (markdownView) {
				const editor = markdownView.editor;
				const wholeText = editor.getValue();
				const count = (wholeText.match(/\u0002/g) || []).length;
				if (count === 0) {
					new Notice('No STX characters found.');
					return;
				} else if (count !== 0) {
					const newText = wholeText.replace(/\u0002/g, '');
					editor.setValue(newText);
					new Notice('Removed ' + count + ' STX characters.');
				};
			};
		});

		// This adds a status bar item.
		const statusBarElement = this.addStatusBarItem();
		statusBarElement.setText("STX");
		// when editor refreshes, remove the start-of-text character
		this.registerEvent(this.app.workspace.on('editor-change', (editor: Editor) => {
			const wholeText = editor.getValue();
			const count = (wholeText.match(/\u0002/g) || []).length;
			// Update the status bar item
			statusBarElement.setText(count.toString());
		}));

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'remove-start-of-text-editor',
			name: 'Remove start-of-text character',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const wholeText = editor.getValue();
				const newText = wholeText.replace(/\u0002/g, '');
				editor.setValue(newText);
			}
		});
	}

	onunload() {

	}
}
