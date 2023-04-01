import * as vscode from 'vscode';
// import { basename, dirname, join } from 'path';
import { getCgformHeadList, replaceLocalText } from '../utils/jspg2';
import { getActiveWorkspace } from '../workspace';
import path = require('path');
import * as fse from 'fs-extra';
import { showTextDocument } from '../utils/host';
import { reportError } from '../utils/report';

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface onlineNode {
	copyType: number;
	copyVersion: any;
	createBy: string;
	createTime: string;
	desFormCode: any;
	formCategory: string;
	formExtendJson: string;
	formTemplate: string;
	formTemplateMobile: any;
	hascopy: number;
	id: string;
	idSequence: any;
	idType: string;
	isCheckbox: string;
	isDbSynch: string;
	isDesForm: string;
	isPage: string;
	isTree: string;
	physicId: any;
	queryMode: string;
	relationType: any;
	scroll: number;
	subTableStr: any;
	tabOrderNum: any;
	tableName: string;
	tableTxt: string;
	tableType: number;
	tableVersion: number;
	taskId: any;
	tenantId: any;
	themeTemplate: string;
	treeField: any;
	treeFieldname: any;
	treeIdField: any;
	treeParentIdField: any;
	updateBy: string;
	updateTime: string;
}




export class OnlineModel {
	constructor() {
	}

	public roots(): Thenable<onlineNode[]> {
		return new Promise((c, e) => {
			getCgformHeadList({ copyType: 0 }).then((res) => {
				c(res.result.records);
			}).catch(() => {
				c([]);
			});
		});
	}

	public getChildren(node: onlineNode): Thenable<onlineNode[]> {
		return new Promise((c, e) => {
			getCgformHeadList({ physicId: node.id, copyType: 1 }).then((res) => {
				c(res.result.records);
			}).catch(() => {
				c([]);
			});
		});
	}
}

export class OnlineExplorerProvider implements vscode.TreeDataProvider<onlineNode>, vscode.TextDocumentContentProvider {

	private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
	readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;

	private clear: boolean;
	public lastWorkspace: string | undefined;
	public viewer: vscode.TreeView<onlineNode>;
	constructor(private readonly model: OnlineModel) {
		vscode.window.onDidChangeActiveTextEditor(() => this.onActiveEditorChanged());
		this.lastWorkspace = getActiveWorkspace()?.uri.fsPath;
	}
	public setClear(clear: boolean) {
		this.clear = clear;
		return this;
	}
	public onActiveEditorChanged() {
		let lastWorkspace = getActiveWorkspace()?.uri.fsPath;
		if (lastWorkspace) {
			if (lastWorkspace !== this.lastWorkspace) {
				this.lastWorkspace = lastWorkspace;
				this.setClear(true).refresh();
			}
		}
	}

	public refresh(): any {
		this._onDidChangeTreeData.fire(undefined);
	}


	public getTreeItem(element: onlineNode): vscode.TreeItem {
		let ti = new vscode.TreeItem(element.tableName, vscode.TreeItemCollapsibleState.Collapsed);
		ti.collapsibleState = element.copyType === 0 ? vscode.TreeItemCollapsibleState.Collapsed : void 0,
			ti.command = {
				command: 'onlineExplorer.openResource',
				arguments: [element],
				title: 'Open online Resource'
			};
		return ti;
	}

	public getChildren(element?: onlineNode): onlineNode[] | Thenable<onlineNode[]> {
		return new Promise(async (rs, rj) => {
			if (this.clear) {
				rs([]);
				this.clear = false;
				this.refresh();
			}
			if (element) {
				rs(this.model.getChildren(element));
			} else {

				let d = await this.model.roots();
				let dd = [...d];
				for (let a = 0; a < dd.length; a++) {

					//await this.viewer.reveal(dd[a], {expand: 0});
				}

				setTimeout(() => {

					rs(d);
				}, 2000);
			}
		});
	}

	public getParent(element: onlineNode): onlineNode | undefined {
		//const parent = element.resource.with({ path: dirname(element.resource.path) });
		//return parent.path !== '//' ? { resource: parent, isDirectory: true } : undefined;
		return undefined;
	}

	public provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string> {
		return '';
		//this.model.getContent(uri).then(content => content);
	}
}

export class OnlineExplorer {

	private ftpViewer: vscode.TreeView<onlineNode>;
	private treeDataProvider: OnlineExplorerProvider;


	constructor(context: vscode.ExtensionContext) {
		/* Please note that login information is hardcoded only for this example purpose and recommended not to do it in general. */
		const onlineModel = new OnlineModel();
		const treeDataProvider = new OnlineExplorerProvider(onlineModel);
		this.treeDataProvider = treeDataProvider;
		context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider('online', treeDataProvider));

		this.ftpViewer = vscode.window.createTreeView('onlineExplorer', { treeDataProvider });
		treeDataProvider.viewer = this.ftpViewer;
		vscode.commands.registerCommand('onlineExplorer.refresh', () => {
			treeDataProvider.setClear(true).refresh();
		});
		vscode.commands.registerCommand('onlineExplorer.openResource', resource => this.openResource(resource));
	}

	private openResource(resource: onlineNode): void {
		let defaultTemplate = `({
	/*****jspg2 code start jspg2*****/
	jspgCode: '${resource.id}',
	/*****jspg2 code end jspg2*****/

	/*****jspg2 list start jspg2*****/

	afterLoadData(that) {

	}

	/*****jspg2 list end jspg2*****/
	,
	/*****jspg2 form start jspg2*****/

	beforeSubmit() {
		return new Promise((rs, rj){
			rs()
		})
	},
	afterSubmit() {
		return new Promise((rs, rj){
			rs()
		})
	}


	/*****jspg2 form end jspg2*****/

})`;
		if (this.treeDataProvider.lastWorkspace) {
			var filePath = path.join(this.treeDataProvider.lastWorkspace, resource.tableName + '.js');
			fse.pathExists(filePath)
				.then(exist => {
					if (exist) {
						showTextDocument(vscode.Uri.file(filePath));
					}

					return fse.outputFile(
							filePath,
							defaultTemplate,
						)
						.then(() => {
							showTextDocument(vscode.Uri.file(filePath)).then(async () => {
								await replaceLocalText();
								await replaceLocalText();
							});
						});
				})
				.catch(reportError);
		}
	}
}