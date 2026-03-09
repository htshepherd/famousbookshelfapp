import request from './request'

// Generator for CRUD ops
const createCrudApi = (entity) => ({
    list: (params) => request({ url: `/admin/${entity}`, method: 'get', params }),
    create: (data) => request({ url: `/admin/${entity}`, method: 'post', data }),
    update: (id, data) => request({ url: `/admin/${entity}/${id}`, method: 'put', data }),
    delete: (id) => request({ url: `/admin/${entity}/${id}`, method: 'delete' })
})

export const bookApi = createCrudApi('books')
export const authorApi = createCrudApi('authors')
export const celebrityApi = createCrudApi('celebrities')
export const recommendationApi = {
    ...createCrudApi('recommendations'),
    importExcel: (file) => {
        const formData = new FormData()
        formData.append('file', file)
        return request({
            url: '/admin/recommendations/import',
            method: 'post',
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 300000 // 增加超时时间到 5 分钟 (300秒) 以支持大量数据导入
        })
    }
}
