import axios from 'axios';
import signMd5Utils from '../utils/signMd5Utils';
import logger from '../utils/logger';

export default class Request {
  username: string;
  password: string;
  token: string;
  tokenKey: string;
  headers: any;
  service: any;
  baseURL: string;
  timeout: number;
  logging: boolean;
  isRefreshing: boolean;
  requests: any;
  constructor(opt) {
    this.tokenKey = 'X-Access-Token';
    this.isRefreshing = false;
    this.requests = [];
    Object.assign(this, opt);
    let service = axios.create({
      baseURL: opt.baseURL, // api base_url
      timeout: opt.timeout || 6000 // 请求超时时间
    });
    this.service = service;

    service.interceptors.request.use(async (config : any) => {
      try {
        config.headers[this.tokenKey] = this.token;;
        let url = config.url;
        let data = {};
        let param = {};
        if (config.params) {
          Object.keys(config.params).filter(k => k !== '_t' && !(config.params[k] === null || config.params[k] === undefined)).forEach((x) => {
            param[x] = config.params[x];
          });
        }
        Object.assign(data, param);
        if (config.data) {
          Object.assign(data, config.data);
        }
        let sign = signMd5Utils.getSign(url, data);
        // eslint-disable-next-line @typescript-eslint/naming-convention
        var signHeader = { 'X-Sign': sign, 'X-TIMESTAMP': signMd5Utils.getDateTimeToString() };
        Object.assign(config.headers, signHeader, opt.headers);
      } catch (e) {
        console.error(e);
      }
      return config;
    }, (error) => {
      return Promise.reject(error);
    });
    service.interceptors.response.use(async (response) => {
      try {
        if (response.data.code === 500) {
          logger.error(response.data.message);
        }
      } catch (e) {

      }
      return response.data;
    }, async (error) => {
      if (error.response) {
        const data = error.response.data;
        const config = error.response.config;
        switch (error.response.status) {
          case 500:
            let type = error.response.request.responseType;
            if (type === 'blob') {
              break;
            }
            if (data.message.includes("Token失效") || data.message.includes("请重新登录") || data.message.includes("token")) {
              if (!this.isRefreshing) {
                this.isRefreshing = true;
                return this.login().then(res => {
                  if (res.code === 200) {
                    this.token = res.result.token;
                    this.requests.forEach(cb => cb(this.token));
                    this.requests = [];
                    this.isRefreshing = false;
                    return service(config);
                  } else {
                    return Promise.reject(new Error(res.message));
                  }
                }).catch((e) => {
                  this.isRefreshing = false;
                  return Promise.reject(e);
                });
              } else {
                return new Promise((resolve) => {
                  this.requests.push((token) => {
                    config.headers[this.tokenKey] = token;
                    resolve(service(config));
                  });
                });
              }
            }
            break;
        }
      }
      return Promise.reject(error);
    }
    );
  }
  login() {
    return this.service.post('/sys/login', {
      password: this.password,
      username: this.username
    });
  }
  getData(opt) {
    return this.service.get('/online/cgform/head/enhanceJs/' + opt.code);
  }
  async putData(opt) {
    let res = await this.getData(opt);
    let id = res.data.id;
    return await this.service.put('/online/cgform/head/enhanceJs/' + opt.code, {
      opt,...id
    });
  }
}