import axios from 'axios'
import { ElMessage } from 'element-plus'

const instance = axios.create({
    baseURL: '/api',
    timeout: 10000,
})

// Request interceptor
instance.interceptors.request.use(
    (config) => {
        // Add auth headers
        const token = localStorage.getItem('admin_token')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor
instance.interceptors.response.use(
    (response) => {
        const res = response.data
        if (res.code === 200) {
            return res.data
        } else if (res.code === 401) {
            localStorage.removeItem('admin_token')
            localStorage.removeItem('admin_username')
            ElMessage.error(res.message || '登录过期，请重新登录')
            window.location.href = '/login'
            return Promise.reject(new Error(res.message || 'Unauthorized'))
        } else {
            ElMessage.error(res.message || 'Error')
            return Promise.reject(new Error(res.message || 'Error'))
        }
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('admin_token')
            localStorage.removeItem('admin_username')
            ElMessage.error('登录过期，请重新登录')
            window.location.href = '/login'
        } else {
            ElMessage.error(error.message || 'Network Error')
        }
        return Promise.reject(error)
    }
)

export default instance
