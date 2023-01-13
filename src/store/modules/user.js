import { publicSsoLogout, userAppTenantList } from '@/api/sso'
import { getToken, removeToken } from '@/utils/auth'
const appCode = import.meta.env.VITE_APP_APP_CODE;

import { Base64 } from 'js-base64';

const useUserStore = defineStore('user', {
    state: () => ({
      app: {},
      apps: [],
      tenant: {},
      tenants: [],
      name: '',
      avatar: '',
    }),
    actions: {
      // 获取用户信息
      getInfo() {
        return new Promise((resolve, reject) => {
          const token = getToken();
          if (!token) {
            reject("token 不存在");
            return;
          }
          const jwtInfoArr = token.split(".");
          if (jwtInfoArr.length !== 3) {
            reject("token 格式不正确");
            return;
          }
          const payload = jwtInfoArr[1];
          let userInfo = Base64.decode(payload);
          userInfo = JSON.parse(userInfo);

          this.name = userInfo.username
          this.avatar = userInfo.avatar;
          this.getAppTenants();
          resolve(userInfo)
        })
      },
      getAppTenants() {
        userAppTenantList().then(res => {
          const apps = res.data.apps;
          const tenants = res.data.tenants;
          if (apps && apps.length > 0) {
            this.apps = [];
            for (const app of apps) {
              app.displayName = app.appCode + ':' + app.appName;
              this.apps.push(app);
              if (appCode === app.appCode) {
                this.app = app;
              }
            }
          }
          if (tenants && tenants.length > 0) {
            this.tenants = [];
            let tenantCode = localStorage.getItem('tenant-code');
            let currentTenant = undefined;
            for (const tenant of tenants) {
              tenant.displayName = tenant.tenantCode + ':' + tenant.tenantName;
              this.tenants.push(tenant);
              if (tenantCode && tenantCode === tenant.tenantCode) {
                currentTenant = tenant;
              }
            }
            if (!currentTenant) {
              currentTenant = this.tenants[0];
              tenantCode = currentTenant.tenantCode;
            }
            this.tenant = currentTenant;
            localStorage.setItem('tenant-code', tenantCode);
          }
        })
      },
      // 退出系统
      logOut() {
        return new Promise((resolve, reject) => {
          publicSsoLogout().then(() => {
            resolve()
          }).catch(error => {
            reject(error)
          }).finally(val => {
            // 无论如何前端均需要清除 token
            removeToken()
            // localStorage.clear();
          });
        })
      }
    }
  })

export default useUserStore
