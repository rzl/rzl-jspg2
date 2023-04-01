/* eslint-disable @typescript-eslint/naming-convention */

import * as vscode from 'vscode';
import * as fse from 'fs-extra';
import * as path from 'path';
import { reportError } from '../utils/report';
import { showTextDocument } from '../utils/host';

const VENDOR_FOLDER = '.vscode';
export const CONGIF_FILENAME = 'jspg2.json';
export const CONFIG_PATH = path.join(VENDOR_FOLDER, CONGIF_FILENAME);

export const defaultConfig = {
  baseURL: '',
  username: 'admin',
  password: '',
  token: '',
  enable: true,
  timeout: 6000,
  headers: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    tenant_id: 0
  }
};

export class Config {
    defaultConfig: any;
    CONFIG_PATH: string;
    constructor(opt) {
        Object.assign(this, opt);
    }
    mergedDefault(config) {
        return {
            ...this.defaultConfig,
            ...config,
        };
    }
    readConfigsFromFile(configPath): Promise<any[]> {
        return fse.readJson(configPath).then(config => {
            const configs = Array.isArray(config) ? config : [config];
            return configs.map(this.mergedDefault, this);
        });
    }
    getConfigPath(basePath) {
        return path.join(basePath, this.CONFIG_PATH);
    }
    tryLoadConfigs(workspace): Promise<any[]> {
        const configPath = this.getConfigPath(workspace);
        return fse.pathExists(configPath).then(
            exist => {
                if (exist) {
                    return this.readConfigsFromFile(configPath);
                }
                return [];
            },
            _ => []
        );
    }
    newConfig(basePath) {
        const configPath = this.getConfigPath(basePath);

        return fse
            .pathExists(configPath)
            .then(exist => {
                if (exist) {
                    return showTextDocument(vscode.Uri.file(configPath));
                }

                return fse
                    .outputJson(
                        configPath,
                        this.defaultConfig,
                        { spaces: 4 }
                    )
                    .then(() => showTextDocument(vscode.Uri.file(configPath)));
            })
            .catch(reportError);
    }
}

