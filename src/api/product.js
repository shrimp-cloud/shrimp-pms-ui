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
export function skuStockList(params) {
  return request({ url: '/pms/sku/stock/list', method: 'get', params });
}
export function skuStockSave(data) {
  return request({ url: '/pms/sku/stock/save', method: 'post', data });
}