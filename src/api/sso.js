import request from '@/utils/request'

export function publicSsoLogout() {
    return request({url: '/cas/public/sso/logout', method: 'get'})
}
export function userResTree() {
    return request({url: '/cas/user/res/tree', method: 'get'})
}
export function userAppTenantList() {
    return request({url: '/cas/user/app/tenant/list', method: 'get'})
}
