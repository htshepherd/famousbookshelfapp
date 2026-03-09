<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <router-link to="/" class="admin-brand">
          <div class="brand-glyph">
            <el-icon><Reading /></el-icon>
          </div>
          <div class="brand-names">
            <span class="name-main">Famous Bookshelf</span>
            <span class="name-sub">Console / Admin</span>
          </div>
        </router-link>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-label">内容管理</div>
        <router-link v-for="item in navMain" :key="item.path" :to="item.path" class="nav-item">
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </router-link>

        <div class="nav-section-label">工具与数据</div>
        <router-link to="/admin/import" class="nav-item">
          <el-icon><Upload /></el-icon>
          <span>批量导入</span>
        </router-link>
      </nav>

      <footer class="sidebar-footer">
        <router-link to="/" class="nav-item footer-item">
          <el-icon><Back /></el-icon>
          <span>返回应用首页</span>
        </router-link>
      </footer>
    </aside>

    <main class="admin-main">
      <header class="main-header glass-effect">
        <div class="breadcrumb-mini">
          <span>Admin</span>
          <el-icon><ArrowRight /></el-icon>
          <span class="current">{{ currentPageTitle }}</span>
        </div>
        <div class="user-pill">
          <div class="user-avatar shadow-sm">A</div>
          <span>Administrator</span>
        </div>
      </header>
      
      <div class="scroll-view">
        <div class="admin-page-container">
          <router-view v-slot="{ Component }">
            <transition name="admin-fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { 
  Collection, 
  Edit, 
  Star, 
  User, 
  Upload, 
  Back, 
  ArrowRight,
  Reading
} from '@element-plus/icons-vue'

const route = useRoute()

const navMain = [
  { path: '/admin/books', label: '图书管理', icon: Collection },
  { path: '/admin/authors', label: '作者管理', icon: Edit },
  { path: '/admin/celebrities', label: '名人管理', icon: Star },
  { path: '/admin/recommendations', label: '推荐记录', icon: User },
]

const currentPageTitle = computed(() => {
  const titles = {
    '/admin/books': '图书管理',
    '/admin/authors': '作者管理',
    '/admin/celebrities': '名人管理',
    '/admin/recommendations': '推荐记录',
    '/admin/import': '数据批量导入'
  }
  return titles[route.path] || '管理中心'
})
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  background-color: var(--bg-color);
}

/* Sidebar Styling */
.admin-sidebar {
  width: 260px;
  background: var(--bg-secondary);
  border-right: 1px solid rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 32px 24px;
}

.admin-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.brand-glyph {
  width: 32px;
  height: 32px;
  background: var(--text-primary);
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.brand-names {
  display: flex;
  flex-direction: column;
}

.name-main {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.025em;
}

.name-sub {
  font-size: 10px;
  color: var(--text-secondary);
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.sidebar-nav {
  flex: 1;
  padding: 0 16px;
}

.nav-section-label {
  font-size: 11px;
  font-weight: 800;
  color: var(--text-tertiary);
  margin: 32px 12px 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: var(--transition-apple);
}

.nav-item:hover {
  background: rgba(0,0,0,0.03);
  color: var(--text-primary);
}

.nav-item.router-link-active {
  background: #fff;
  color: var(--accent-primary);
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
}

.sidebar-footer {
  padding: 24px 16px;
  border-top: 1px solid rgba(0,0,0,0.04);
}

.footer-item {
  color: var(--text-tertiary);
}

/* Main Area */
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  position: relative;
}

.main-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  z-index: 10;
}

.breadcrumb-mini {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-tertiary);
  font-weight: 600;
}

.breadcrumb-mini .current {
  color: var(--text-primary);
}

.user-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px;
  background: #fff;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.user-avatar {
  width: 24px;
  height: 24px;
  background: var(--text-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
}

.scroll-view {
  flex: 1;
  overflow-y: auto;
  background: #fff;
}

.admin-page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 40px 120px;
}

/* Transitions */
.admin-fade-enter-active,
.admin-fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.25, 1, 0.5, 1), transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

.admin-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.admin-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
