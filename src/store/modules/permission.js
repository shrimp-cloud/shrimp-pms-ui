import router, { constantRoutes } from '@/router'
import { userResTree } from '@/api/sso'
import Layout from '@/layout/index'
import ParentView from '@/components/ParentView'
import InnerLink from '@/layout/components/InnerLink'
import {ElMessage} from "element-plus";


// 匹配views里面所有的.vue文件
const modules = import.meta.glob('./../../views/**/*.vue')

const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [],
    routeBtns: {},
    addRoutes: [],
    defaultRoutes: [],
    topbarRouters: [],
    sidebarRouters: []
  }),
  actions: {
    setRoutes(routes) {
      this.addRoutes = routes
      this.routes = constantRoutes.concat(routes)
    },
    addRouteBtns(route, btns) {
      this.routeBtns[route] = btns
    },
    setDefaultRoutes(routes) {
      this.defaultRoutes = constantRoutes.concat(routes)
    },
    setTopbarRoutes(routes) {
      this.topbarRouters = routes
    },
    setSidebarRouters(routes) {
      this.sidebarRouters = routes
    },
    generateRoutes(roles) {
      return new Promise((resolve, reject) => {
        // 向后端请求路由数据
        userResTree().then(res => {
          // console.log('router.res', res);
          const data = res.data;
          if (!data || data.length === 0) {
            const msg = '您没有此系统的任何权限！';
            ElMessage({message: msg, type: 'error', duration: 5 * 1000})
            reject(msg);
            return;
          }
          // 将资源树，转换成 ruoyi 所要求的资源树
          const ruoyiTree = tree2RuoyiTree(data);
          // console.log('router.ruoyiTree', ruoyiTree);

          const sdata = JSON.parse(JSON.stringify(ruoyiTree))
          const rdata = JSON.parse(JSON.stringify(ruoyiTree))
          const defaultData = JSON.parse(JSON.stringify(ruoyiTree))
          const sidebarRoutes = filterAsyncRouter(sdata)
          const rewriteRoutes = filterAsyncRouter(rdata, false, true)
          const defaultRoutes = filterAsyncRouter(defaultData)
          this.setRoutes(rewriteRoutes)
          this.setSidebarRouters(constantRoutes.concat(sidebarRoutes))
          this.setDefaultRoutes(sidebarRoutes)
          this.setTopbarRoutes(defaultRoutes)
          resolve(rewriteRoutes)
        })
      })
    }
  }
})

function tree2RuoyiTree(reses, currentRoute) {
  const menus = [];
  for (let i = 0; i < reses.length; i++) {
    const d = reses[i];
    // 只有MENU是用来展示的
    if (d.resType !== 'MENU') {
      continue;
    }
    // 当前路径 cr
    let cr = currentRoute || '';
    let p = d.routePath || '';
    cr = p.startsWith('/') ? p : cr + '/' + p;

    const menu = {};
    menu.path = p;
    menu.name = i + '-' + d.resName;
    menu.hidden = d.hidden;
    menu.redirect = (!p || p === '' || p === '/') ? '/index': 'noRedirect';
    menu.component = d.component ? d.component : 'error/index';
    menu.alwaysShow = false;
    const meta = {};
    meta.title = d.resName;
    meta.icon = d.icon ? d.icon : 'form';
    meta.noCache = false;
    meta.link = null;
    menu.meta = meta;
    // 子菜单处理
    menu.children = d.children ? tree2RuoyiTree(d.children, cr) : undefined;
    menus.push(menu);

    // 按钮处理【为后面的按钮权限做数据准备】
    const btns = d.children ? getMenuButtons(d.children) : undefined;
    if (btns && btns.length > 0) {
      usePermissionStore().addRouteBtns(cr,btns);
    }
  }
  return menus.length > 0 ? menus : undefined;
}

// 获取按钮资源
function getMenuButtons(routers) {
  const buttons = [];
  for (const router of routers) {
    if (router.resType === 'BUTTON' && router.buttonCode) {
      buttons.push(router.buttonCode);
    }
  }
  return buttons;
}


// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap, lastRouter = false, type = false) {
  return asyncRouterMap.filter(route => {
    if (type && route.children) {
      route.children = filterChildren(route.children)
    }
    if (route.component) {
      // Layout ParentView 组件特殊处理
      if (route.component === 'Layout') {
        route.component = Layout
      } else if (route.component === 'ParentView') {
        route.component = ParentView
      } else if (route.component === 'InnerLink') {
        route.component = InnerLink
      } else {
        let component = route.component;
        if (component.indexOf("views/") !== -1) {
          component = component.substring(component.indexOf("views/") + 6);
        }
        if (component.startsWith("/")) {
          component = component.substring(1);
        }
        if (component.indexOf(".vue") === component.length -4) {
          component = component.substring(0, component.length -4);
        }
        route.component = loadView(component)
      }
    }
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children, route, type)
    } else {
      delete route['children']
      delete route['redirect']
    }
    return true
  })
}

function filterChildren(childrenMap, lastRouter = false) {
  var children = []
  childrenMap.forEach((el, index) => {
    if (el.children && el.children.length) {
      if (el.component === 'ParentView' && !lastRouter) {
        el.children.forEach(c => {
          c.path = el.path + '/' + c.path
          if (c.children && c.children.length) {
            children = children.concat(filterChildren(c.children, c))
            return
          }
          children.push(c)
        })
        return
      }
    }
    if (lastRouter) {
      el.path = lastRouter.path + '/' + el.path
    }
    children = children.concat(el)
  })
  return children
}

export const loadView = (view) => {
  let res;
  for (const path in modules) {
    const dir = path.split('views/')[1].split('.vue')[0];
    if (dir === view) {
      res = () => modules[path]();
    }
  }
  return res;
}

export default usePermissionStore
