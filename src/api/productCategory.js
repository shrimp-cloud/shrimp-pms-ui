import request from '@/utils/request';

export function productCategoryList(params) {
  return request({ url: '/pms/product/category/list', method: 'get', params });
}
export function productCategoryInfo(params) {
  return request({ url: '/pms/product/category/info', method: 'get', params });
}
export function productCategorySave(data) {
  return request({ url: '/pms/product/category/save', method: 'post', data });
}
export function productCategoryRemove(data) {
  return request({ url: '/pms/product/category/remove', method: 'post', data });
}
export function productCategoryOptions(params) {
  return request({ url: '/pms/product/category/options', method: 'get', params });
}
