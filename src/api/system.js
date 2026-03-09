import request from './request'

export const userApi = {
    list: (params) => request({ url: '/admin/user/list', method: 'get', params }),
    add: (data) => request({ url: '/admin/user/add', method: 'post', data }),
    update: (data) => request({ url: '/admin/user/update', method: 'put', data }),
    delete: (id) => request({ url: `/admin/user/delete/${id}`, method: 'delete' }),
    assignRoles: (userId, roleIds) => request({ url: `/admin/user/assignRoles/${userId}`, method: 'post', data: roleIds })
}

export const roleApi = {
    list: () => request({ url: '/admin/role/list', method: 'get' }),
    add: (data) => request({ url: '/admin/role/add', method: 'post', data }),
    update: (data) => request({ url: '/admin/role/update', method: 'put', data }),
    delete: (id) => request({ url: `/admin/role/delete/${id}`, method: 'delete' }),
    assignMenus: (roleId, menuIds) => request({ url: `/admin/role/assignMenus/${roleId}`, method: 'post', data: menuIds })
}

export const menuApi = {
    list: () => request({ url: '/admin/menu/list', method: 'get' }),
    tree: () => request({ url: '/admin/menu/tree', method: 'get' }),
    add: (data) => request({ url: '/admin/menu/add', method: 'post', data }),
    update: (data) => request({ url: '/admin/menu/update', method: 'put', data }),
    delete: (id) => request({ url: `/admin/menu/delete/${id}`, method: 'delete' })
}
