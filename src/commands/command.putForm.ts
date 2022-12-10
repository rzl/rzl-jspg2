import * as vscode from 'vscode';
import { putLocalText } from '../utils/jspg2';
import { reportError } from '../utils/report';
export default {
  name: 'putForm',
  async handle() {
    vscode.window.showInformationMessage('putForm!');
    try {
      await putLocalText('form');
    } catch (e) {
      reportError(e.message);
    }
  }
};