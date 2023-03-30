/* eslint-disable curly */
import * as vscode from "vscode";
import { getRequest } from "../workspace";
import { getValidFullRange } from "./host";
import logger from "./logger";
import { reportError, reportInfo } from "./report";
import path = require("path");
import * as fse from "fs-extra";


export const reg =
  /(?<=\/\*\*\*MMM\*\*\*  START  \*\*\*MMM\*\*\*\/\s*\n)[\s\S]+(?=\n\s*\/\*\*\*WWW\*\*\*   END   \*\*\*WWW\*\*\*\/)/gi;

export function activeCode() {
  return resolveCode();
}

export function resolveCode() {
  let activeTextEditor = vscode.window.activeTextEditor;
  if (activeTextEditor) {
    var currentPath = activeTextEditor.document.uri.path;
    var filePath = path.parse(currentPath);
    var codePath;
    if (['columns', 'formitem', 'queryInfo'].includes(filePath.name)) {
      codePath = filePath.dir;
    } else if (['list', 'form'].includes(filePath.name)) {
      codePath = path.join(filePath.dir, 'data');
    } else {
      codePath = path.join(filePath.dir, '..', '..');
    }
    var codeFilePath = path.join(codePath, 'code.json');
    if (fse.pathExistsSync(codeFilePath)) {
      try {
        var obj = fse.readJSONSync(codeFilePath);
        return obj.code;
      }  catch (e) {
        throw new Error("code 解释异常 " + e.message);
      }
    }
  }
}
export function resolveText(text, type) {
  var matchText = text.match(reg);
  if (matchText) {
    return matchText[0];
  } else {
    throw new Error(`${type} 解释异常, 未找到${type}段落标记`);
  }
}

export function resolveList(text) {
  var listText = text.match(reg);
  if (listText) {
    return listText[0];
  } else {
    throw new Error("list 解释异常, 未找到list段落标记");
  }
}

export function resolveForm(text) {
  var formText = text.match(reg);
  if (formText) {
    return formText[0];
  } else {
    throw new Error("form 解释异常, 未找到form段落标记");
  }
}

export async function getCgformHeadList(params = {}) {
  var request = await getRequest();
  Object.assign(params, {
    pageSize: 10000,
    column: "tableName",
    order: "asc",
  });
  var res = await request.service.get("/online/cgform/head/list", { params });
  logger.info("get getCgformHeadList res " + JSON.stringify(res, null, 4));
  if (res.code !== 0 && res.code !== 200) {
    throw new Error(res.message);
  }
  return res;
}

export async function getFormItem(code = "") {
  if (!code) return {};
  var request = await getRequest();
  var res = await request.service.get("/online/cgform/api/getFormItem/" + code);
  logger.info("get getFormItem res " + JSON.stringify(res, null, 4));
  if (res.code !== 0 && res.code !== 200) {
    res = getErpFormItem(code);
    if (res.code !== 0 && res.code !== 200) {
        throw new Error(res.message);
    }
  }
  return res;
}

export async function getErpFormItem(code = "") {
  if (!code) return {};
  var request = await getRequest();
  var res = await request.service.get("/online/cgform/api/getErpFormItem/" + code);
  logger.info("get getErpFormItem res " + JSON.stringify(res, null, 4));
  if (res.code !== 0 && res.code !== 200) {
    throw new Error(res.message);
  }
  return res;
}

export async function getColumns(code = "") {
  if (!code) return {};
  var request = await getRequest();
  var res = await request.service.get("/online/cgform/api/getColumns/" + code);
  logger.info("get getColumns res " + JSON.stringify(res, null, 4));
  if (res.code !== 0 && res.code !== 200) {
    throw new Error(res.message);
  }
  return res;
}
export async function getQueryInfo(code = "") {
  if (!code) return {};
  var request = await getRequest();
  var res = await request.service.get(
    "/online/cgform/api/getQueryInfo/" + code,
  );
  logger.info("get getQueryInfo res " + JSON.stringify(res, null, 4));
  if (res.code !== 0 && res.code !== 200) {
    throw new Error(res.message);
  }
  return res;
}
export async function getEnhanceJs(code, type) {
  var request = await getRequest();
  var res = await request.service.get("/online/cgform/head/enhanceJs/" + code, {
    params: { type },
  });
  logger.info("get list res " + JSON.stringify(res, null, 4));
  if (res.code !== 200) {
    if (res.message === "查询为空") {
      await postEnhanceJs(code, type, "");
      return await getEnhanceJs(code, type);
    }
    throw new Error(res.message);
  }
  return res;
}

export async function putEnhanceJs(code, type, text) {
  var res = await getEnhanceJs(code, type);
  var request = await getRequest();
  var putData = {
    cgJs: text,
    cgJsType: type,
    cgformHeadId: code,
    content: null,
    id: res.result.id,
  };
  logger.info("put list data " + JSON.stringify(putData, null, 4));
  var res2 = await request.service.put(
    "/online/cgform/head/enhanceJs/" + code,
    putData,
  );
  if (res2.code !== 200) {
    throw new Error(res.message);
  }
  logger.info("put list res " + JSON.stringify(res2, null, 4));
  return res2;
}

export async function postEnhanceJs(code, type, text) {
  var request = await getRequest();
  var postData = {
    cgJs: text,
    cgJsType: type,
    cgformHeadId: code,
    content: null,
  };
  logger.info("post " + type + " data " + JSON.stringify(postData, null, 4));
  var res = await request.service.post(
    "/online/cgform/head/enhanceJs/" + code,
    postData,
  );
  if (res.code !== 200) {
    throw new Error(res.message);
  }
  logger.info("post " + type + " res " + JSON.stringify(res, null, 4));
  return res;
}

export async function putLocalText(type) {
  let activeTextEditor = vscode.window.activeTextEditor;
  if (activeTextEditor) {
    var text = activeTextEditor.document.getText();
    var code = resolveCode();
    var resolve = type === "list" ? resolveList : resolveForm;
    var listText = resolve(text);
    await putEnhanceJs(code, type, listText);
    reportInfo("put " + type + " done");
  }
}

export async function replaceLocalText(type) {
  let activeTextEditor = vscode.window.activeTextEditor;
  if (activeTextEditor) {
    var text = activeTextEditor.document.getText();
    resolveText(text, type);
    var code = resolveCode();
    var res = await getEnhanceJs(code, type);
    var newText = text.replace(reg, res.result.cgJs);
    let validFullRange = getValidFullRange(activeTextEditor);
    await (new Promise((rs, rj) => {
      vscode.window.activeTextEditor?.edit(async (editBuilder) => {
        try {
          editBuilder.replace(validFullRange, newText);
          await vscode.window.activeTextEditor?.document.save();
          rs(null);
        } catch (e) {
          reportError(e.message);
        }
      });
    }));
    reportInfo("get " + type + " done");
  }
}

const listText = `    afterLoadData(that) {

}`;
export function listTemplate(text = listText) {
    return `({
  /***MMM***  START  ***MMM***/
${text}
  /***WWW***   END   ***WWW***/
})`;
}
const formText = `    beforeSubmit() {
    return new Promise((rs, rj) {

    })
},
afterSubmit() {
    return new Promise((rs, rj) {

    })
}`
export function formTemplate(text = formText) {
    return`({
    /*****jspg2 form start jspg2*****/
${text}
    /*****jspg2 form end jspg2*****/
})`};

export const defaultTemplate = `({
    /*****jspg2 code start jspg2*****/
    jspgCode: '00000000000000000000000000000000',
    /*****jspg2 code end jspg2*****/
})`;
export async function setDefaultTemplate() {
  let activeTextEditor = vscode.window.activeTextEditor;
  if (activeTextEditor) {
    let validFullRange = getValidFullRange(activeTextEditor);
    await (new Promise((rs, rj) => {
      vscode.window.activeTextEditor?.edit(async (editBuilder) => {
        try {
          editBuilder.replace(validFullRange, defaultTemplate);
          await vscode.window.activeTextEditor?.document.save();
          rs(null);
        } catch (e) {
          reportError(e.message);
        }
      });
    }));
  }
}
