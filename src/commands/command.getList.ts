import * as vscode from 'vscode';
import { reportError } from '../utils/report';
import { replaceLocalText } from '../utils/jspg2';

export default {
  name: 'getList',
  async handle() {
    vscode.window.showInformationMessage('getList!');
    try {
      await replaceLocalText('list');
    } catch (e) {
      reportError(e.message);
    }
  }
};