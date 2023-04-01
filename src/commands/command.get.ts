import * as vscode from 'vscode';
import { reportError } from '../utils/report';
import { replaceLocalText } from '../utils/jspg2';

export default {
  name: 'get',
  async handle() {
    vscode.window.showInformationMessage('get!');
    try {
      await replaceLocalText();
    } catch (e) {
      reportError(e.message);
    }
  }
};