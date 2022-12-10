import * as vscode from 'vscode';
import { putLocalText } from '../utils/jspg2';
import { reportError } from '../utils/report';
export default {
  name: 'putAll',
  async handle() {
    vscode.window.showInformationMessage('putAll!');
    try {
      await putLocalText('list');
      await putLocalText('form');
    } catch (e) {
      reportError(e.message);
    }
  }
};