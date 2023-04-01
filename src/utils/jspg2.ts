/* eslint-disable curly */
import * as vscode from "vscode";
import { getRequest } from "../workspace";
import { fullReplace, getValidFullRange } from "./host";
import logger from "./logger";
import { reportError, reportInfo } from "./report";
import path = require("path");
import * as fse from "fs-extra";

const COLUMNS_BASE_NAME = 'columns';
const FORMITEM_BASE_NAME = 'formItem';
const QUERYINFO_BASE_NAME = 'queryInfo';
const LIST_BASE_NAME = 'list';
const FORM_BASE_NAME = 'form';
export const LIST_HISTORY_BASE_NAME = 'list-';
export const FORM_HISTORY_BASE_NAME = 'form-';

export const reg =
  /(?<=\/\*\*\*MMM\*\*\*  START  \*\*\*MMM\*\*\*\/\s*\n)[\s\S]+(?=\n\s*\/\*\*\*WWW\*\*\*   END   \*\*\*WWW\*\*\*\/)/gi;

export function activeCode() {
  return resolveCode();
}

export function resolveCode() {
  let activeTextEditor = vscode.window.activeTextEditor;
  if (activeTextEditor) {
    var currentPath = activeTextEditor.document.uri.fsPath;
    var filePath = path.parse(currentPath);
    var codePath;
    if ([COLUMNS_BASE_NAME, FORMITEM_BASE_NAME, QUERYINFO_BASE_NAME].includes(filePath.name)) {
      codePath = filePath.dir;
    } else if ([LIST_BASE_NAME, FORM_BASE_NAME].includes(filePath.name)) {
      codePath = path.join(filePath.dir, 'data');
    } else {
      codePath = path.join(filePath.dir, '..', '..', 'data');
    }
    var codeFilePath = path.join(codePath, 'code.json');
    if (fse.existsSync(codeFilePath)) {
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

export async function getCgformHeadList(params = {}, other = {}){
  var request = await getRequest();
  Object.assign(params, {
    pageSize: 10000,
    column: "tableName",
    order: "asc",
  }, other);
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
export async function getQueryInfo(code) {
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

export async function getEnhanceJsHistory(code, type) {
  var request = await getRequest();
  var res = await request.service.get("/online/cgform/head/enhanceJs/getHistory/" + code, {
    params: { type },
  });
  logger.info("get list res " + JSON.stringify(res, null, 4));
  if (res.code !== 200) {
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

export async function putLocalText() {
  let activeTextEditor = vscode.window.activeTextEditor;
  if (activeTextEditor) {
    var currentPath = activeTextEditor.document.uri.path;
    var filePath = path.parse(currentPath);
    var text = activeTextEditor.document.getText();
    var code = resolveCode();
    
    var type
    if (filePath.name == LIST_BASE_NAME) {
      type = 'list'
    } else if (filePath.name == FORM_BASE_NAME) {
      type = 'form'
    } else if (filePath.name.startsWith(LIST_HISTORY_BASE_NAME)) {
      type = 'list'
    } else if (filePath.name.startsWith(FORM_HISTORY_BASE_NAME)) {
      type = 'form'
    }
    if (type) {
      var resolve = filePath.name === "list" ? resolveList : resolveForm;
      var data = resolve(text);
      await putEnhanceJs(code, type, data);
    } else {
      reportError("该文件不支持 put " + type + " done");
      return 
    }
    reportInfo("put " + type + " done");
  }
}

export async function replaceLocalText() {
  let activeTextEditor = vscode.window.activeTextEditor;
  if (activeTextEditor) {
    var currentPath = activeTextEditor.document.uri.path;
    var filePath = path.parse(currentPath);
    var text = activeTextEditor.document.getText();
    var code = resolveCode();
    var fn

    if (filePath.name == LIST_BASE_NAME) {
      fn = getEnhanceJs(code, 'list');
    } else if (filePath.name == FORM_BASE_NAME) {
      fn = getEnhanceJs(code, 'form');
    } else if (filePath.name == COLUMNS_BASE_NAME) {
      fn = getColumns(code)
    } else if (filePath.name == FORMITEM_BASE_NAME) {
      fn = getFormItem(code)
    } else if (filePath.name == QUERYINFO_BASE_NAME) {
      fn = getQueryInfo(code)
    } else {
      reportError("该文件不支持 get " + filePath.name + " done");
      return 
    }
    var res = await fn;
    var newText
    if ([LIST_BASE_NAME,FORM_BASE_NAME ].includes(filePath.name)) {
      newText = text.replace(reg, res.result.cgJs);
    } else {
      newText = JSON.stringify(res, null, 4)
    }
    if (newText) {
      await fullReplace(activeTextEditor, newText)
    }
    reportInfo("get " + filePath.name + " done");
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
