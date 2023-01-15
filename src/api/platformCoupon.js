import request from '@/utils/request';

export function platformCouponPage(params) {
  return request({ url: '/pms/platform/coupon/page', method: 'get', params });
}
export function platformCouponInfo(params) {
  return request({ url: '/pms/platform/coupon/info', method: 'get', params });
}
export function platformCouponSave(data) {
  return request({ url: '/pms/platform/coupon/save', method: 'post', data });
}
export function platformCouponRemove(data) {
  return request({ url: '/pms/platform/coupon/remove', method: 'post', data });
}
export function platformCouponStatusOn(data) {
  return request({ url: '/pms/platform/coupon/status/on', method: 'post', data });
}
export function platformCouponStatusOff(data) {
  return request({ url: '/pms/platform/coupon/status/off', method: 'post', data });
}
