import { getActiveWorkspace } from './helper';
import { Config, defaultConfig, CONFIG_PATH } from '../helper/Config';

const configMap = {

};

export async function getConfig() {
    let fsPath = getActiveWorkspace()?.uri.fsPath;
    if (fsPath) {
        var config = new Config({ defaultConfig, CONFIG_PATH});
        let data = await config.tryLoadConfigs(fsPath);
        if (configMap[fsPath] === undefined) {
            data[0].$isUpdate = true;
            setConfig(fsPath, data);
            return data;
        } else {
            delete data[0].$isUpdate;
            if (JSON.stringify(configMap[fsPath]) === JSON.stringify(data)) {
                return configMap[fsPath];
            } else {
                data[0].$isUpdate = true;
                setConfig(fsPath, data);
                return data;
            }
        }
    }
}

export function setConfig(fsPath, config) {
    configMap[fsPath] = config;
    return config;
}