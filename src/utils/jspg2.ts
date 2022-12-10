import * as vscode from 'vscode';
import { getRequest } from "../workspace";
import { getValidFullRange } from './host';
import logger from "./logger";
import { reportError, reportInfo } from './report';

export const codeReg = /(?<=\/\*\*\*\*\*jspg2 code start jspg2\*\*\*\*\*\/\s*\n)[\s\S]+(?=\s+\/\*\*\*\*\*jspg2 code end jspg2\*\*\*\*\*\/)/gi;
export const listReg = /(?<=\/\*\*\*\*\*jspg2 list start jspg2\*\*\*\*\*\/\s*\n)[\s\S]+(?=\s+\/\*\*\*\*\*jspg2 list end jspg2\*\*\*\*\*\/)/gi;
export const formReg = /(?<=\/\*\*\*\*\*jspg2 form start jspg2\*\*\*\*\*\/\s*\n)[\s\S]+(?=\s+\/\*\*\*\*\*jspg2 form end jspg2\*\*\*\*\*\/)/gi;

export function resolveCode(text) {
    var codeText = text.match(codeReg);
    if (codeText) {
        try {
            var code = (eval(`({${codeText[0]}})`)).jspgCode;
            return code;
        } catch (e) {
            throw new Error('code 解释异常 ' + e.message);
        }
    } else {
        throw new Error('code 解释异常, 为找到code段落标记');
    }
}
export function resolveText(text, type) {
    var reg = type === 'list' ? listReg : formReg;
    var matchText = text.match(reg);
    if (matchText) {
        return matchText[0];
    } else {
        throw new Error(`${type} 解释异常, 未找到${type}段落标记`);
    }
}

export function resolveList(text) {
    var listText = text.match(listReg);
    if (listText) {
        return listText[0];
    } else {
        throw new Error('list 解释异常, 未找到list段落标记');
    }
}

export function resolveForm(text) {
    var formText = text.match(formReg);
    if (formText) {
        return formText[0];
    } else {
        throw new Error('form 解释异常, 未找到form段落标记');
    }
}

export async function getEnhanceJs(code, type) {
    var request = await getRequest();
    var res = await request.service.get('/online/cgform/head/enhanceJs/' + code, { params: { type } });
    logger.info('get list res ' + JSON.stringify(res, null, 4));
    if (res.code !== 200) {
        if (res.message === '查询为空') {
            await postEnhanceJs(code, type, '');
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
        id: res.result.id
    };
    logger.info('put list data ' + JSON.stringify(putData, null, 4));
    var res2 = await request.service.put('/online/cgform/head/enhanceJs/' + code, putData);
    if (res2.code !== 200) {
        throw new Error(res.message);
    }
    logger.info('put list res ' + JSON.stringify(res2, null, 4));
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
    logger.info('post ' + type + ' data ' + JSON.stringify(postData, null, 4));
    var res = await request.service.post('/online/cgform/head/enhanceJs/' + code, postData);
    if (res.code !== 200) {
        throw new Error(res.message);
    }
    logger.info('post ' + type + ' res ' + JSON.stringify(res, null, 4));
    return res;
}

export async function putLocalText(type) {
    let activeTextEditor = vscode.window.activeTextEditor;
    if (activeTextEditor) {
        var text = activeTextEditor.document.getText();
        var code = resolveCode(text);
        var resolve = type === 'list' ? resolveList : resolveForm;
        var listText = resolve(text);
        await putEnhanceJs(code, type, listText);
        reportInfo('put ' + type + ' done');
    }
}

export async function replaceLocalText(type) {
    let activeTextEditor = vscode.window.activeTextEditor;
    if (activeTextEditor) {
        var text = activeTextEditor.document.getText();
        resolveText(text, type);
        var code = resolveCode(text);
        var res = await getEnhanceJs(code, type);
        var reg = type === 'list' ? listReg : formReg;
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
        reportInfo('get ' + type + ' done');
    }
}


export const defaultTemplate = `({
    /*****jspg2 code start jspg2*****/
    jspgCode: '00000000000000000000000000000000',
    /*****jspg2 code end jspg2*****/

    /*****jspg2 list start jspg2*****/


    afterLoadData(that) {

    }



    /*****jspg2 list end jspg2*****/
    ,
    /*****jspg2 form start jspg2*****/

    beforeSubmit() {
        return new Promise(rs, rj) {

        }
    },
    afterSubmit() {
        return new Promise(rs, rj) {
            
        }
    }


    /*****jspg2 form end jspg2*****/

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