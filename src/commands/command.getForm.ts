import * as vscode from 'vscode';
import { reportError } from '../utils/report';
import { replaceLocalText } from '../utils/jspg2';

export default {
  name: 'getForm',
  async handle() {
    vscode.window.showInformationMessage('getForm!');
    try {
      await replaceLocalText('form');
    } catch (e) {
      reportError(e.message);
    }
  }
};