// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import initCommands from './commands';
import { reportError } from './utils/report';
import { getWorkspaceFolders, setContextValue } from './utils/host';
//  import { ResponseOutlineProvider } from './helper/ResponseOutline';
//  import { activeCode, getColumns, getFormItem, getQueryInfo } from './utils/jspg2';
import { OnlineExplorer } from './helper/OnlineExplorer';
import { thatCompletionProvider } from './utils/completion';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "rzl-jspg2" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	//let disposable = vscode.commands.registerCommand('rzl-jspg2.helloWorld', () => {
	// The code you place here will be executed every time your command is executed
	// Display a message box to the user
	//	 vscode.window.showInformationMessage('Hello World from rzl-jspg2!');

	//});
	//context.subscriptions.push(disposable);
	try {
		initCommands(context);
	} catch (error) {
		reportError(error, 'initCommands');
	}

	const workspaceFolders = getWorkspaceFolders();
	if (!workspaceFolders) {
		return;
	}

	setContextValue('enabled', true);
	// const getFormItemProvider = new ResponseOutlineProvider(context, _ =>  getFormItem(activeCode()));
	// vscode.window.registerTreeDataProvider('getFormItem', getFormItemProvider);
	// const getColumnsProvider = new ResponseOutlineProvider(context, _ =>  getColumns(activeCode()));
	// vscode.window.registerTreeDataProvider('getColumns', getColumnsProvider);
	// const getQueryInfoProvider = new ResponseOutlineProvider(context, _ =>  getQueryInfo(activeCode()));
	// vscode.window.registerTreeDataProvider('getQueryInfo', getQueryInfoProvider);
	// vscode.commands.registerCommand('jsonOutline.refresh', () => jsonOutlineProvider.refresh());
	new OnlineExplorer(context);
	context.subscriptions.push(thatCompletionProvider);

	
}

// This method is called when your extension is deactivated
export function deactivate() { }
