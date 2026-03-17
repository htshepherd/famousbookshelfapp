<template>
  <div class="classics-page reveal-fluid">
    <div class="mesh-aura"></div>
    
    <div class="page-header">
      <div class="header-container">
        <button class="back-link" @click="$router.push('/')">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回发现</span>
        </button>
        <h1 class="page-title">长青经典 <span class="count-badge" v-if="books.length">{{ books.length }}</span></h1>
        <p class="page-subtitle">这些著作经受了时间的洗礼，是被全球顶级思想家推荐次数最多的智慧结晶。</p>
      </div>
    </div>

    <div class="content-container">
      <div v-if="loading" class="skeleton-grid">
        <div v-for="i in 12" :key="i" class="skeleton-card">
          <div class="skeleton-visual"></div>
          <div class="skeleton-body">
            <div class="skeleton-line title"></div>
            <div class="skeleton-line meta"></div>
          </div>
        </div>
      </div>

      <div v-else-if="books.length" class="books-grid">
        <div 
          v-for="(book, index) in books" 
          :key="book.bookId" 
          class="book-card-premium reveal-fluid"
          :style="{ animationDelay: `${index * 0.05}s` }"
          @click="$router.push(`/books/${book.bookId}`)"
        >
          <el-popover
            placement="right"
            :width="320"
            trigger="hover"
            :show-after="400"
            popper-class="book-overview-popover"
          >
            <template #reference>
              <div class="card-inner">
                <div class="rank-tag">#{{ index + 1 }}</div>
                <div class="book-visual">
                  <img v-if="book.coverUrl" :src="book.coverUrl" :alt="book.chineseName" @error="handleImgError" />
                  <div v-else class="premium-placeholder">
                    <el-icon><Reading /></el-icon>
                  </div>
                </div>
                <div class="book-info">
                  <h3 class="book-title">{{ book.chineseName }}</h3>
                  <p class="book-author">{{ book.authorChineseName || '未知作者' }}</p>
                  <div class="recommend-stat">
                    <el-icon><StarFilled /></el-icon>
                    <span>{{ book.recommendationCount }} 次推荐</span>
                  </div>
                </div>
              </div>
            </template>
            <div class="popover-content">
              <h4 class="popover-title">{{ book.chineseName }}</h4>
              <div class="popover-divider"></div>
              <p class="popover-overview">{{ book.overview || '暂无详细介绍' }}</p>
              <div class="popover-footer">点击查看详情线索</div>
            </div>
          </el-popover>
        </div>
      </div>

      <div v-else class="empty-state">
        <el-empty description="暂无经典推荐数据" />
      </div>
    </div>
    
    <footer class="page-footer">
      <p>© 2026 名人书架 · 探索人类智慧的足迹</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { publicApi } from '@/api/public'
import { ArrowLeft, Reading, StarFilled } from '@element-plus/icons-vue'

const books = ref([])
const loading = ref(true)

const fetchClassics = async () => {
  loading.value = true
  try {
    const res = await publicApi.getClassicBooks()
    books.value = res || []
  } catch (err) {
    console.error('Failed to fetch classic books:', err)
  } finally {
    loading.value = false
  }
}

const handleImgError = (e) => {
  e.target.style.display = 'none'
  const parent = e.target.parentElement
  if (parent) {
    const placeholder = document.createElement('div')
    placeholder.className = 'premium-placeholder'
    placeholder.innerHTML = '<i class="el-icon"><svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M128 320v576h576V320H128zm-32-64h640a32 32 0 0 1 32 32v640a32 32 0 0 1-32 32H96a32 32 0 0 1-32-32V288a32 32 0 0 1 32-32zM960 96v704a32 32 0 0 1-32 32h-96V160H192V96a32 32 0 0 1 32-32h704a32 32 0 0 1 32 32z"></path></svg></i>'
    parent.appendChild(placeholder)
  }
}

onMounted(() => {
  fetchClassics()
})
</script>

<style scoped>
.classics-page {
  min-height: 100vh;
  background: #fff;
  color: #1d1d1f;
  display: flex;
  flex-direction: column;
}

.mesh-aura {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(circle at 10% 10%, rgba(0, 113, 227, 0.03) 0%, transparent 40%),
              radial-gradient(circle at 90% 90%, rgba(79, 172, 254, 0.03) 0%, transparent 40%);
  z-index: -1;
  pointer-events: none;
}

.page-header {
  padding: 120px 0 60px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container, .content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: #86868b;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 24px;
  padding: 0;
  transition: color 0.2s;
}

.back-link:hover {
  color: #0071e3;
}

.page-title {
  font-size: 48px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.count-badge {
  font-size: 18px;
  background: #f5f5f7;
  color: #86868b;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
}

.page-subtitle {
  font-size: 18px;
  color: #86868b;
  max-width: 600px;
  line-height: 1.5;
}

.content-container {
  padding-top: 60px;
  padding-bottom: 100px;
  flex: 1;
}

/* Books Grid */
.books-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px 32px;
}

.book-card-premium {
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

.card-inner {
  position: relative;
  display: flex;
  flex-direction: column;
}

.rank-tag {
  position: absolute;
  top: -12px;
  left: -12px;
  z-index: 10;
  background: #1d1d1f;
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.book-visual {
  width: 100%;
  aspect-ratio: 3 / 4.2;
  border-radius: 16px;
  overflow: hidden;
  background: #f5f5f7;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  margin-bottom: 20px;
  transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
  position: relative;
}

.book-visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.premium-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: #d2d2d7;
  background: linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%);
}

.book-card-premium:hover .book-visual {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.12);
}

.book-info {
  text-align: left;
}

.book-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 6px;
  color: #1d1d1f;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 44px;
}

.book-author {
  font-size: 14px;
  color: #86868b;
  font-weight: 500;
  margin-bottom: 12px;
}

.recommend-stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #0071e3;
  background: rgba(0, 113, 227, 0.05);
  width: fit-content;
  padding: 4px 10px;
  border-radius: 10px;
}

/* Skeletons */
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px 32px;
}

.skeleton-card {
  display: flex;
  flex-direction: column;
}

.skeleton-visual {
  width: 100%;
  aspect-ratio: 3 / 4.2;
  background: #f5f5f7;
  border-radius: 16px;
  margin-bottom: 20px;
  animation: pulse 1.5s infinite ease-in-out;
}

.skeleton-line {
  background: #f5f5f7;
  border-radius: 4px;
  margin-bottom: 8px;
  animation: pulse 1.5s infinite ease-in-out;
}

.skeleton-line.title { width: 80%; height: 20px; }
.skeleton-line.meta { width: 50%; height: 16px; }

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

/* Popover Styles */
.popover-content {
  padding: 8px;
}

.popover-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #1d1d1f;
}

.popover-divider {
  height: 1px;
  background: rgba(0,0,0,0.05);
  margin-bottom: 12px;
}

.popover-overview {
  font-size: 14px;
  color: #424245;
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 6;
  line-clamp: 6;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.popover-footer {
  font-size: 12px;
  color: #0071e3;
  font-weight: 600;
  text-align: right;
}

.page-footer {
  padding: 60px 0;
  text-align: center;
  border-top: 1px solid rgba(0,0,0,0.05);
  color: #86868b;
  font-size: 14px;
}

@media (max-width: 1100px) {
  .books-grid, .skeleton-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .page-header { padding: 80px 0 40px; }
  .page-title { font-size: 32px; }
  .header-container, .content-container { padding: 0 24px; }
  .books-grid, .skeleton-grid { grid-template-columns: repeat(2, 1fr); gap: 24px 16px; }
  .book-title { font-size: 15px; min-height: 36px; }
  .book-visual { margin-bottom: 12px; }
}
</style>

<style>
/* Global popover overrides */
.book-overview-popover {
  border-radius: 16px !important;
  padding: 20px !important;
  box-shadow: 0 20px 48px rgba(0,0,0,0.12) !important;
  border: 1px solid rgba(0,0,0,0.05) !important;
}
</style>
