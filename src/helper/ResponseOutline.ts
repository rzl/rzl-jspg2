import * as vscode from 'vscode';
import * as json from 'jsonc-parser';
import * as path from 'path';

export class ResponseOutlineProvider implements vscode.TreeDataProvider<number> {

	private _onDidChangeTreeData: vscode.EventEmitter<number | undefined> = new vscode.EventEmitter<number | undefined>();
	readonly onDidChangeTreeData: vscode.Event<number | undefined> = this._onDidChangeTreeData.event;

	private tree: json.Node | undefined;
	private text = '';
	private editor: vscode.TextEditor | undefined;
	private autoRefresh = true;

	constructor(private context: vscode.ExtensionContext, private getData: Function) {
		vscode.window.onDidChangeActiveTextEditor(() => this.onActiveEditorChanged());
		vscode.workspace.onDidChangeTextDocument(e => this.onDocumentChanged(e));
		this.onActiveEditorChanged();

	}

	async refresh(offset?: number): Promise<void> {
		await this.parseTree();
		if (offset) {
			this._onDidChangeTreeData.fire(offset);
		} else {
			this._onDidChangeTreeData.fire(undefined);
		}
	}
	
	private onActiveEditorChanged(): void {
		if (vscode.window.activeTextEditor) {
			this.refresh();
		}
	}

	private async onDocumentChanged(changeEvent: vscode.TextDocumentChangeEvent): Promise<void> {
		if (this.tree && this.autoRefresh && changeEvent.document.uri.toString() === this.editor?.document.uri.toString()) {
			for (const change of changeEvent.contentChanges) {
				const path = json.getLocation(this.text, this.editor.document.offsetAt(change.range.start)).path;
				path.pop();
				const node = path.length ? json.findNodeAtLocation(this.tree, path) : void 0;
				await this.parseTree();
				this._onDidChangeTreeData.fire(node ? node.offset : void 0);
			}
		}
	}

	private async parseTree(): Promise<void> {
		try {

			this.text = '';
			this.tree = undefined;
			this.text = JSON.stringify(await this.getData(), null, 4);
			this.tree = json.parseTree(this.text);
		} catch(e) {
			this.tree = json.parseTree('');

		}

	}

	getChildren(offset?: number): Thenable<number[]> {
		if (offset && this.tree) {
			const path = json.getLocation(this.text, offset).path;
			const node = json.findNodeAtLocation(this.tree, path);
			return Promise.resolve(this.getChildrenOffsets(node as any));
		} else {
			return Promise.resolve(this.tree ? this.getChildrenOffsets(this.tree) : []);
		}
	}

	private getChildrenOffsets(node: json.Node): number[] {
		const offsets: number[] = [];
		if (node.children && this.tree) {
			for (const child of node.children) {
				const childPath = json.getLocation(this.text, child.offset).path;
				const childNode = json.findNodeAtLocation(this.tree, childPath);
				if (childNode) {
					offsets.push(childNode.offset);
				}
			}
		}
		return offsets;
	}

	getTreeItem(offset: number): vscode.TreeItem {
		if (!this.tree) {
			throw new Error('Invalid tree');
		}

		const path = json.getLocation(this.text, offset).path;
		const valueNode = json.findNodeAtLocation(this.tree, path);
		if (valueNode) {
			const hasChildren = valueNode.type === 'object' || valueNode.type === 'array';
			const treeItem: vscode.TreeItem = new vscode.TreeItem(this.getLabel(valueNode), hasChildren ? valueNode.type === 'object' ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
			// treeItem.command = {
			// 	command: 'extension.openJsonSelection',
			// 	title: '',
			// 	arguments: [new vscode.Range(this.editor.document.positionAt(valueNode.offset), this.editor.document.positionAt(valueNode.offset + valueNode.length))]
			// };
			treeItem.iconPath = this.getIcon(valueNode);
			treeItem.contextValue = valueNode.type;
			return treeItem;
		}
		throw (new Error(`Could not find json node at ${path}`));
	}

	select(range: vscode.Range) {
		if (this.editor) {
			this.editor.selection = new vscode.Selection(range.start, range.end);
		}
	}

	private getIcon(node: json.Node): any {
		const nodeType = node.type;
		if (nodeType === 'boolean') {
			return {
				light: this.context.asAbsolutePath(path.join('resources', 'light', 'boolean.svg')),
				dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'boolean.svg'))
			};
		}
		if (nodeType === 'string') {
			return {
				light: this.context.asAbsolutePath(path.join('resources', 'light', 'string.svg')),
				dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'string.svg'))
			};
		}
		if (nodeType === 'number') {
			return {
				light: this.context.asAbsolutePath(path.join('resources', 'light', 'number.svg')),
				dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'number.svg'))
			};
		}
		return null;
	}

	private getLabel(node: json.Node): string {
		if (node.parent?.type === 'array') {
			const prefix = node.parent.children?.indexOf(node).toString();
			if (node.type === 'object') {
				return prefix + ':{ }';
			}
			if (node.type === 'array') {
				return prefix + ':[ ]';
			}
			return prefix + ':' + node.value.toString();
		}
		else {
			const property = node.parent?.children ? node.parent.children[0].value.toString() : '';
			if (node.type === 'array' || node.type === 'object') {
				if (node.type === 'object') {
					return '{ } ' + property;
				}
				if (node.type === 'array') {
					return '[ ] ' + property;
				}
			}
			// const value = this.editor?.document.getText(new vscode.Range(this.editor.document.positionAt(node.offset), this.editor.document.positionAt(node.offset + node.length)));
			const value = this.text.slice(node.offset,node.offset + node.length);
			return `${property}: ${value}`;
		}
	}
}
