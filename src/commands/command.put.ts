import * as vscode from 'vscode';
import { putLocalText } from '../utils/jspg2';
import { reportError } from '../utils/report';
export default {
  name: 'put',
  async handle() {
    vscode.window.showInformationMessage('put!');
    try {
      await putLocalText('list');
      await putLocalText('form');
    } catch (e) {
      reportError(e.message);
    }
  }
};