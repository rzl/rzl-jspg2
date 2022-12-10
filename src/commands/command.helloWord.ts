import * as vscode from 'vscode';
export default {
    name: 'helloWorld',
    async handle() {
		vscode.window.showInformationMessage('helloWorld!');

    }
};