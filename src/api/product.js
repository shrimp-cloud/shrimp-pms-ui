import request from '@/utils/request';

export function productPage(params) {
  return request({ url: '/pms/product/page', method: 'get', params });
}
export function productInfo(params) {
  return request({ url: '/pms/product/info', method: 'get', params });
}
export function productSave(data) {
  return request({ url: '/pms/product/save', method: 'post', data });
}
export function productRemove(data) {
  return request({ url: '/pms/product/remove', method: 'post', data });
}
export function productSkuInfo(params) {
  return request({ url: '/pms/product/sku/info', method: 'get', params });
}
export function productSkuSave(data) {
  return request({ url: '/pms/product/sku/save', method: 'post', data });
}
export function productShelvesOn(data) {
  return request({ url: '/pms/product/shelves/on', method: 'post', data });
}
export function productShelvesOff(data) {
  return request({ url: '/pms/product/shelves/off', method: 'post', data });
}
