import * as vscode from 'vscode';
import { reportError } from '../utils/report';
import { replaceLocalText } from '../utils/jspg2';
import * as path from 'path'
export getlist() {

}

export default {
  name: 'get',
  async handle() {
    vscode.window.showInformationMessage('get!');
    try {
      let activeTextEditor = vscode.window.activeTextEditor;

      await replaceLocalText('list');

      //path.join(activeTextEditor.document.uri.path, '..', '..')

    } catch (e) {
      reportError(e.message);
    }
  }
};