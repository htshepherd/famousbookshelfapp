<template>
  <div class="login-container">
    <div class="login-box glass-effect">
      <div class="login-header">
        <div class="brand-glyph">
          <el-icon><Reading /></el-icon>
        </div>
        <h2>Famous Bookshelf</h2>
        <p>管理系统</p>
      </div>
      
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef" class="login-form">
        <el-form-item prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入用户名" 
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码" 
            :prefix-icon="Lock"
            size="large"
            @keyup.enter="handleLogin"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            class="login-btn" 
            :loading="loading" 
            @click="handleLogin"
            size="large"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <router-link to="/">返回应用首页</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Reading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import request from '@/api/request'
import Cookies from 'js-cookie'

const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await request.post('/auth/login', loginForm)
        if (res && res.token) {
          Cookies.set('admin_token', res.token, { expires: 7, sameSite: 'strict' })
          localStorage.setItem('admin_username', res.username || loginForm.username)
          ElMessage.success('登录成功')
          router.push('/admin/books')
        }
      } catch (error) {
        // Error is handled by request interceptor
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: -10%;
  left: -10%;
  width: 120%;
  height: 120%;
  background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.8) 0%, rgba(240, 242, 245, 1) 100%);
  z-index: 0;
}

.login-box {
  position: relative;
  width: 100%;
  max-width: 380px;
  padding: 40px 32px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.6);
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 36px;
}

.brand-glyph {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  background: var(--text-primary, #1d1d1f);
  color: white;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.15);
}

.login-header h2 {
  margin: 0 0 8px;
  font-size: 24px;
  color: var(--text-primary, #1d1d1f);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.login-header p {
  margin: 0;
  color: var(--text-secondary, #86868b);
  font-size: 14px;
  font-weight: 500;
}

.login-form {
  margin-bottom: 24px;
}

.login-btn {
  width: 100%;
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  height: 44px;
  margin-top: 8px;
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.2);
}

.login-footer {
  text-align: center;
  margin-top: 16px;
}

.login-footer a {
  color: var(--text-secondary, #86868b);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.3s ease;
}

.login-footer a:hover {
  color: var(--accent-primary, #0066cc);
}
</style>
