import * as vscode from 'vscode';
import {
  getWorkspaceFolders,
  showConfirmMessage,
  showOpenDialog,
  openFolder,
  addWorkspaceFolder,
  promptForInput,
  showTextDocument
}
  from '../utils/host';
import * as fse from 'fs-extra';

import { Config, defaultConfig, CONFIG_PATH } from '../helper/Config';
import { getFormItem, replaceLocalText } from '../utils/jspg2';
import { getActiveWorkspace } from '../workspace';
import path = require('path');
import { reportError } from '../utils/report';

export default {
  name: 'loadCode',
  async handle() {
    promptForInput('请输入code').then(async (code) => {
      let defaultTemplate = `({
  /*****jspg2 code start jspg2*****/
  jspgCode: '${code}',
  /*****jspg2 code end jspg2*****/

  /*****jspg2 list start jspg2*****/

  afterLoadData(that) {

  }

  /*****jspg2 list end jspg2*****/
  ,
  /*****jspg2 form start jspg2*****/

  beforeSubmit() {
    return new Promise((rs, rj){
      rs()
    })
  },
  afterSubmit() {
    return new Promise((rs, rj){
      rs()
    })
  }

  /*****jspg2 form end jspg2*****/

})`;
      let formItem = await getFormItem(code);
      let workspace = getActiveWorkspace()?.uri.fsPath;
      let tableName = formItem.result.head.tableName;
      if (workspace) {
        var filePath = path.join(workspace, tableName + '.js');
        fse.pathExists(filePath)
          .then(exist => {
            if (exist) {
              return showTextDocument(vscode.Uri.file(filePath));
            }
            return fse.outputFile(
              filePath,
              defaultTemplate,
            )
              .then(() => {
                showTextDocument(vscode.Uri.file(filePath)).then(async () => {
                  await replaceLocalText('list');
                  await replaceLocalText('form');
                })
              });
          })
          .catch(reportError);
      }
    })

  }
};