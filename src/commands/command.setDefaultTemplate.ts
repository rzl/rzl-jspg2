import * as vscode from 'vscode';
import { reportError } from '../utils/report';
import { setDefaultTemplate } from '../utils/jspg2';

export default {
  name: 'setDefaultTemplate',
  async handle() {
    vscode.window.showInformationMessage('setDefaultTemplate!');
    try {
      await setDefaultTemplate();
    } catch (e) {
      reportError(e.message);
    }
  }
};