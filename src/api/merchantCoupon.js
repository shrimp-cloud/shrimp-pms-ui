import request from '@/utils/request';

export function merchantCouponPage(params) {
  return request({ url: '/pms/merchant/coupon/page', method: 'get', params });
}
export function merchantCouponInfo(params) {
  return request({ url: '/pms/merchant/coupon/info', method: 'get', params });
}
export function merchantCouponSave(data) {
  return request({ url: '/pms/merchant/coupon/save', method: 'post', data });
}
export function merchantCouponRemove(data) {
  return request({ url: '/pms/merchant/coupon/remove', method: 'post', data });
}
export function merchantCouponStatusOn(data) {
  return request({ url: '/pms/merchant/coupon/status/on', method: 'post', data });
}
export function merchantCouponStatusOff(data) {
  return request({ url: '/pms/merchant/coupon/status/off', method: 'post', data });
}
