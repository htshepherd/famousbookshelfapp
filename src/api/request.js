import axios from 'axios'
import { ElMessage } from 'element-plus'

const instance = axios.create({
    baseURL: '/api',
    timeout: 10000,
})

// Request interceptor
instance.interceptors.request.use(
    (config) => {
        // Add auth headers if needed in future
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
        } else {
            ElMessage.error(res.message || 'Error')
            return Promise.reject(new Error(res.message || 'Error'))
        }
    },
    (error) => {
        ElMessage.error(error.message || 'Network Error')
        return Promise.reject(error)
    }
)

export default instance
