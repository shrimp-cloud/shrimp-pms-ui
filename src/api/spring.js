import request from '@/utils/request'

export function dictItems(params) {
  return request({url: '/spring/dict/items', method: 'get', params})
}
