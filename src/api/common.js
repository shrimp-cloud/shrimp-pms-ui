import request from '@/utils/request'

export function imageLibraryPage(params) {
    return request({ url: '/cms/image/library/page', method: 'get', params });
}
