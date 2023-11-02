import { App, Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface RemoveSTXSettings {
	hideIfNoSTX: boolean;
}

const DEFAULT_SETTINGS: RemoveSTXSettings = {
	hideIfNoSTX: true,
}

export default class RemoveSTX extends Plugin {
	settings: RemoveSTXSettings;
	stxChar = new RegExp("\x02", "g");

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon('x-circle', 'Remove Start-of-Text (STX)', (evt: MouseEvent) => {
			const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (markdownView) {
				const editor = markdownView.editor;
				const wholeText = editor.getValue();
				const stxCount = (wholeText.match(this.stxChar) || []).length;
				if (stxCount === 0) {
					new Notice('No STX characters found.');
				} else {
					const newText = wholeText.replace(this.stxChar, '');
					editor.setValue(newText);
					new Notice(`Removed ${stxCount} STX characters.`);
				}
			} else {
				new Notice('No active markdown editor.');
			}
		});

		const statusBarElement = this.addStatusBarItem();
		this.updateStatusBar(statusBarElement);

		this.registerEvent(this.app.workspace.on('editor-change', (editor: Editor) => {
			this.updateStatusBar(statusBarElement);
		}));

		this.addCommand({
			id: 'remove-start-of-text-editor',
			name: 'Remove start-of-text character',
			editorCallback: (editor: Editor) => {
				const wholeText = editor.getValue();
				const newText = wholeText.replace(this.stxChar, '');
				editor.setValue(newText);
			}
		});

		this.addSettingTab(new RemoveSTXSettings(this.app, this));
	}

	updateStatusBar(statusBarElement: HTMLElement) {
		// TODO: This only updates when the editor changes.
		// TODO: Problem is that the editor doesn't change when Obsidian opens a new file.
		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (markdownView) {
			const wholeText = markdownView.editor.getValue();
			const stxCount = (wholeText.match(this.stxChar) || []).length;
			if (stxCount === 0 && this.settings.hideIfNoSTX) {
				statusBarElement.setText('');
			} else {
				statusBarElement.setText(`${stxCount.toString()} STX`);
			}
		} // TODO: else?
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class RemoveSTXSettings extends PluginSettingTab {
	plugin: RemoveSTX;

	constructor(app: App, plugin: RemoveSTX) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Hide If No STX')
			.setDesc('Hide the status bar item if there are no STX characters in the current file.')
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.hideIfNoSTX);
				toggle.onChange(async (value) => {
					this.plugin.settings.hideIfNoSTX = value;
					await this.plugin.saveSettings();
				});
			});
	}
}
