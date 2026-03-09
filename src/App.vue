<template>
  <div class="app-layout">
    <!-- Fluid Glass Navbar - Minimalist -->
    <header v-if="!isAdminPage" class="navbar-container glass-effect">
      <nav class="navbar-inner">
        <router-link to="/" class="logo">
          <div class="logo-mark">
            <el-icon><Reading /></el-icon>
          </div>
          <span class="logo-type">Famous Bookshelf</span>
        </router-link>
        
        <!-- Navigation Actions Removed as per request -->
        <div class="nav-actions">
          <!-- Only logo and potential user-related stuff (if any) stay here. 
               "探索发现" and "管理中心" are removed. -->
        </div>
      </nav>
    </header>
    
    <main :class="{ 'main-view': !isAdminPage }">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Minimalist Footer -->
    <footer v-if="!isAdminPage" class="footer-modern">
      <div class="footer-container">
        <div class="footer-grid">
          <div class="footer-brand">
            <span class="brand-name">Famous Bookshelf</span>
            <p>影响世界的人，与影响他们的书。</p>
          </div>
          <div class="footer-links">
            <div class="link-group">
              <span class="group-title">关于</span>
              <a href="#">产品介绍</a>
              <a href="#">数据来源</a>
            </div>
            <div class="link-group">
              <span class="group-title">共建</span>
              <a href="#">提交收录</a>
              <a href="#">开源代码</a>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <div class="copy">&copy; 2024 Famous Bookshelf. All rights reserved.</div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isAdminPage = computed(() => route.path.startsWith('/admin'))
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Navbar Style */
.navbar-container {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 2000;
  height: 56px;
  display: flex;
  align-items: center;
}

.navbar-inner {
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  padding: 0 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  transition: opacity 0.2s;
}

.logo:hover { opacity: 0.8; }

.logo-mark {
  width: 32px;
  height: 32px;
  background: var(--text-primary);
  color: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.logo-type {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.025em;
}

.nav-actions {
  display: flex;
  align-items: center;
}

.main-view {
  flex: 1;
  padding-top: 56px;
}

/* Modern Footer */
.footer-modern {
  background: var(--bg-secondary);
  padding: 80px 0 40px;
  border-top: 1px solid rgba(0,0,0,0.02);
}

.footer-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 40px;
}

.footer-grid {
  display: flex;
  justify-content: space-between;
  margin-bottom: 60px;
}

.brand-name {
  font-size: 18px;
  font-weight: 700;
  display: block;
  margin-bottom: 12px;
}

.footer-brand p {
  font-size: 14px;
  color: var(--text-secondary);
  max-width: 240px;
  line-height: 1.6;
}

.footer-links {
  display: flex;
  gap: 80px;
}

.group-title {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-tertiary);
  margin-bottom: 20px;
  letter-spacing: 0.12em;
}

.link-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.link-group a {
  font-size: 13px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s;
}

.link-group a:hover { color: var(--accent-primary); }

.footer-bottom {
  padding-top: 40px;
  border-top: 1px solid rgba(0,0,0,0.04);
  display: flex;
  justify-content: center;
  align-items: center;
}

.copy {
  font-size: 12px;
  color: var(--text-tertiary);
}

.status-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  background: #fff;
  padding: 6px 14px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #34c759;
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(52, 199, 89, 0.4);
}

/* Page Transitions */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}
</style>
