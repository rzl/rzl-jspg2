import * as vscode from "vscode";
import { promptForInput, showTextDocument } from "../utils/host";
import * as fse from "fs-extra";
import signMd5Utils from "../utils/signMd5Utils";
import {
  getCgformHeadList,
  getColumns,
  getEnhanceJs,
  getErpFormItem,
  getFormItem,
  getQueryInfo,
  listTemplate,
  //  replaceLocalText,
} from "../utils/jspg2";
import { getActiveWorkspace } from "../workspace";
import path = require("path");
import { reportError } from "../utils/report";

export default {
  name: "loadCode",
  async handle() {
    promptForInput("请输入code").then(async (code) => {
      let workspace = getActiveWorkspace()?.uri.fsPath;
      if (workspace) {
        if (code!.length<30) {
          let res = await getCgformHeadList({tableName: code})
            if (res.result.records.length>0) {
              var row = res.result.records[0]
              code = row.id
            } else {
              reportError(`未找到表 ${code}`)
            }
        } else { 

        }
        let formItem = await getFormItem(code);
        let columns = await getColumns(code);
        let queryInfo = await getQueryInfo(code);
        let tableName = formItem.result.head.tableName;
        let themeTemplate = formItem.result.head.themeTemplate;
        if (themeTemplate === "erp") {
          var erpFormItem = await getErpFormItem(code);
        }
        let codeDir = path.join(workspace, tableName);
        let dataDir = path.join(codeDir, "data");
        var data = { formItem, columns, queryInfo };
        for (let x in data) {
          fse.outputFile(
            path.join(dataDir, x + ".json"),
            JSON.stringify(data[x], null, 4),
          );
        }
        if (erpFormItem) {
          fse.outputFile(
            path.join(dataDir, "erpFormItem.json"),
            JSON.stringify(erpFormItem, null, 4),
          );
        }
        fse.outputFile(
          path.join(dataDir, "code.json"),
          JSON.stringify(
            {
              code,
              tableName: formItem.result.head.tableName,
              tableTxt: formItem.result.head.tableTxt,
            },
            null,
            4,
          ),
        );
        var listPath = path.join(codeDir, "list.js");
        fse.pathExists(listPath).then(async (exist) => {
          if (exist) {
            fse.cpSync(
              listPath,
              path.join(
                codeDir,
                "history",
                "list",
                'list-local-' + signMd5Utils.getDateTimeToString() + ".js",
              ),
            );
          }
          var res = await getEnhanceJs(code, "list");
          return fse.outputFile(
            listPath,
            listTemplate(res.result.cgJs),
          ).then(() => {

          });
        }).catch(reportError);

        var formPath = path.join(codeDir, "form.js");
        fse.pathExists(formPath).then(async (exist) => {
          if (exist) {
            fse.cpSync(
              formPath,
              path.join(
                codeDir,
                "history",
                "form",
                'form-local-' + signMd5Utils.getDateTimeToString() + ".js",
              ),
            );
          }
          var res = await getEnhanceJs(code, "form");
          return fse.outputFile(
            formPath,
            listTemplate(res.result.cgJs),
          ).then(() => {
            showTextDocument(vscode.Uri.file(formPath)).then(async () => {
            });
          });
        }).catch(reportError);
      }
    });
  },
};
