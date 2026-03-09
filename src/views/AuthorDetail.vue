<template>
  <div class="detail-page-view">
    <div v-if="loading" class="loading-full">
      <div class="apple-spinner"></div>
      <p>正在加载...</p>
    </div>

    <template v-else-if="author">
      <!-- Contextual Sub-nav -->
      <nav class="sub-nav">
        <div class="sub-nav-inner">
          <router-link to="/" class="back-link">
            <el-icon><ArrowLeft /></el-icon>
            <span>探索</span>
          </router-link>
          <div class="nav-sep">/</div>
          <span class="nav-name">{{ author.chineseName }}</span>
        </div>
      </nav>

      <div class="detail-container">
        <div class="author-layout">
          <!-- Sidebar Meta Panel -->
          <aside class="author-sidebar">
            <div class="author-profile-card glass-effect">
              <div class="author-visual-box">
                <div class="premium-placeholder-avatar" style="width:100%; height:100%; border-radius: 20px;">
                  <el-icon :size="40"><Edit /></el-icon>
                </div>
              </div>
              <div class="author-meta-info">
                <h1 class="author-main-name">{{ author.chineseName }}</h1>
                <p class="author-sub-name">{{ author.englishName }}</p>
                <div class="author-id-badge">Author / 创作者</div>
              </div>
            </div>
          </aside>

          <!-- Works Exhibition -->
          <main class="author-main-flow">
            <div class="section-title-box">
              <h2 class="title-text">已出版作品集</h2>
              <div class="total-badge">{{ books.length }}</div>
            </div>

            <div v-if="books.length" class="works-exhibition-list">
              <div 
                v-for="book in books" 
                :key="book.bookId" 
                class="work-card glass-effect"
                @click="goToBook(book.bookId)"
              >
                <div class="work-hero-visual">
                  <img v-if="book.coverUrl" :src="book.coverUrl" alt="" />
                  <div v-else class="premium-placeholder-book" style="width:100%; height:100%;">
                    <el-icon><Reading /></el-icon>
                  </div>
                </div>
                <div class="work-details">
                  <div class="work-header-line">
                    <h3 class="work-primary-title">{{ book.chineseName }}</h3>
                    <el-icon class="arrow-jump"><TopRight /></el-icon>
                  </div>
                  <p class="work-secondary-title">{{ book.englishName }}</p>
                  
                  <div class="work-footer-hint">
                    查看推荐与溯源详情
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="empty-state-notice">
              <div class="empty-glass glass-effect">
                <p>暂无收录该作者的作品记录</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { publicApi } from '@/api/public'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const author = ref(null)
const books = ref([])

const goToBook = (id) => {
  router.push(`/books/${id}`)
}

onMounted(async () => {
  const id = route.params.id
  try {
    const [authorData, booksData] = await Promise.all([
      publicApi.getAuthorDetail(id),
      publicApi.getAuthorBooks(id)
    ])
    author.value = authorData
    books.value = booksData
  } catch (error) {
    console.error('Fetch failed:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.detail-page-view {
  min-height: 100vh;
}

/* Sub-nav */
.sub-nav {
  position: sticky;
  top: 56px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  z-index: 1000;
  border-bottom: 1px solid rgba(0,0,0,0.03);
}

.sub-nav-inner {
  max-width: 1100px;
  margin: 0 auto;
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 40px;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
}

.back-link:hover { color: var(--accent-primary); }

.nav-sep {
  margin: 0 12px;
  font-size: 12px;
  color: var(--text-tertiary);
  opacity: 0.5;
}

.nav-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.detail-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 60px 40px 120px;
}

.author-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 60px;
}

/* Sidebar Sidebar Panel */
.author-sidebar {
  position: sticky;
  top: 130px;
  height: fit-content;
}

.author-profile-card {
  padding: 40px;
  border-radius: 32px;
  text-align: center;
  background: #fff;
}

.author-visual-box {
  width: 80px;
  height: 80px;
  background: var(--bg-secondary);
  border-radius: 20px;
  margin: 0 auto 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  box-shadow: 0 12px 24px rgba(0,0,0,0.04);
}

.author-main-name {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 4px;
}

.author-sub-name {
  font-size: 15px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.author-id-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  color: var(--text-tertiary);
  background: var(--bg-secondary);
  padding: 4px 12px;
  border-radius: 12px;
  text-transform: uppercase;
}

/* Main Exhibition Flow */
.section-title-box {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 40px;
}

.title-text {
  font-size: 24px;
  font-weight: 700;
}

.total-badge {
  font-size: 13px;
  font-weight: 700;
  background: var(--text-primary);
  color: white;
  padding: 2px 10px;
  border-radius: 20px;
}

.works-exhibition-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.work-card {
  padding: 24px;
  border-radius: 24px;
  background: #fff;
  display: flex;
  gap: 32px;
  cursor: pointer;
  transition: var(--transition-apple);
}

.work-card:hover {
  transform: translateY(-4px) scale(1.005);
  box-shadow: 0 24px 48px rgba(0,0,0,0.06);
}

.work-card:hover .arrow-jump {
  transform: translate(2px, -2px);
  color: var(--accent-primary);
}

.work-hero-visual {
  width: 90px;
  height: 126px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  background: #f5f5f7;
}

.work-hero-visual img { width: 100%; height: 100%; object-fit: cover; }

.work-details { flex: 1; min-width: 0; display: flex; flex-direction: column; }

.work-header-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.work-primary-title {
  font-size: 19px;
  font-weight: 700;
  color: var(--text-primary);
}

.arrow-jump {
  font-size: 18px;
  color: var(--text-tertiary);
  transition: var(--transition-apple);
}

.work-secondary-title {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.work-footer-hint {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
  margin-top: auto;
}

/* Empty State */
.empty-glass {
  padding: 60px;
  text-align: center;
  border-radius: 32px;
  color: var(--text-secondary);
}

/* Loading Full */
.loading-full {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: var(--text-tertiary);
}

.apple-spinner {
  width: 32px; height: 32px; border: 3px solid rgba(0,0,0,0.03); border-top-color: var(--accent-primary);
  border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 16px;
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 860px) {
  .author-layout { grid-template-columns: 1fr; }
  .author-sidebar { position: static; margin-bottom: 40px; }
}
</style>
