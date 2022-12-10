import * as vscode from 'vscode';
import { putLocalText } from '../utils/jspg2';
import { reportError } from '../utils/report';
export default {
  name: 'putList',
  async handle() {
    vscode.window.showInformationMessage('putList!');
    try {
      await putLocalText('list');
    } catch (e) {
      reportError(e.message);
    }
  }
};