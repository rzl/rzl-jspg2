import Request from "../helper/request";
import { getConfig } from './configMap';
import { getActiveWorkspace } from './helper';

const requestMap = {

};

export async function getRequest() {
  let fsPath = getActiveWorkspace()?.uri.fsPath;
  if (fsPath) {
    var config = await getConfig();
    if (config.length > 0) {
      if (requestMap[fsPath] === undefined) {
        return setRequest(fsPath, new Request(config[0]));

      } else {
        if (config[0].$isUpdate) {
          return setRequest(fsPath, new Request(config[0]));
        }
        return requestMap[fsPath];
      }
    }
  }
}

export function setRequest(fsPath, request) {
  requestMap[fsPath] = request;
  return request;
}