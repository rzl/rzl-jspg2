import * as vscode from 'vscode';
import { reportError } from '../utils/report';
import { replaceLocalText } from '../utils/jspg2';

export default {
  name: 'getAll',
  async handle() {
    vscode.window.showInformationMessage('getAll!');
    try {
      await replaceLocalText('list');
      await replaceLocalText('form');
    } catch (e) {
      reportError(e.message);
    }
  }
};