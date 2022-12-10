export function objToStr(obj) {
    function _objToStr(obj) {
      if (!obj) return;
      const newobj = JSON.parse(JSON.stringify(obj));
      for (const key in obj) {
        if (obj[key] instanceof Function) {
          newobj[key] = obj[key].toString().replace(/[\n\t]/g, '');
          continue;
        }
        if (obj[key] instanceof Object) {
          newobj[key] = _objToStr(obj[key]);
        }
      }
      return newobj;
    }
    return JSON.stringify(_objToStr(obj));
  }

export function strToObj(obj) {
    if (!obj) return;
    obj = typeof obj == 'object' ? obj : JSON.parse(obj);
    const regex = /^(function(\s|\()+|\(\)\s+=>)|(}$)/;
    for (const key in obj) {
        if (obj[key] instanceof Object) {
            this.strToObj(obj[key]);
        } else {
            if (regex.test(obj[key].trim())) {
                // 是一个函数
                try {
                    obj[key] = eval('(' + obj[key] + ')');
                } catch (e) {
                    try {
                        if (obj[key].trim().indexOf('async') == 0) {
                            obj[key] = eval('(' + obj[key].replace(/^async /, 'async function ') + ')');
                        } else {

                            obj[key] = eval('(function ' + obj[key] + ')');
                        }
                    } catch (e) {
                        console.error(e)
                    }
                }
            }
        }
    }
    return obj;
}