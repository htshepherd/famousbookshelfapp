<template>
  <div class="detail-page-view">
    <div v-if="loading" class="detail-skeleton">
      <el-skeleton animated>
        <template #template>
          <div class="skeleton-nav">
             <el-skeleton-item variant="text" style="width: 200px; height: 20px" />
          </div>
          <div class="detail-container">
            <div class="celeb-profile-layout">
              <div class="celeb-aside">
                <el-skeleton-item variant="circle" style="width: 140px; height: 140px; margin: 0 auto 32px" />
                <el-skeleton-item variant="h1" style="width: 60%; height: 30px; margin: 0 auto 10px" />
                <el-skeleton-item variant="text" style="width: 40%; height: 20px; margin: 0 auto" />
              </div>
              <div class="celeb-main-content">
                <el-skeleton-item variant="h2" style="width: 30%; height: 30px; margin-bottom: 40px" />
                <div class="rec-masonry-grid">
                  <el-skeleton-item v-for="i in 4" :key="i" variant="rect" style="width: 100%; height: 120px; border-radius: 20px" />
                </div>
              </div>
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>

    <template v-else-if="celebrity">
      <!-- Sub-nav for context -->
      <nav class="sub-nav">
        <div class="sub-nav-inner">
          <router-link to="/" class="back-link">
            <el-icon><ArrowLeft /></el-icon>
            <span>探索</span>
          </router-link>
          <div class="nav-sep">/</div>
          <span class="nav-name">{{ celebrity.chineseName }}</span>
        </div>
      </nav>

      <div class="detail-container">
        <div class="celeb-profile-layout">
          <!-- Floating Profile Card -->
          <aside class="celeb-aside">
            <div class="celeb-profile-glass glass-effect">
              <div class="avatar-wrapper">
                <img v-if="celebrity.avatarUrl" :src="celebrity.avatarUrl" alt="" @error="celebrity.avatarUrl = null" />
                <div v-else class="premium-placeholder-avatar" style="width:100%; height:100%;">
                  <el-icon><User /></el-icon>
                </div>
              </div>
              <div class="celeb-info-box">
                <h1 class="celeb-main-name">{{ celebrity.chineseName }}</h1>
                <p class="celeb-sub-name">{{ celebrity.englishName }}</p>
                <div class="celeb-tag-badge">{{ celebrity.groupName }}</div>
              </div>
            </div>
          </aside>

          <!-- Books Section -->
          <main class="celeb-main-content">
            <div class="section-header">
              <h2 class="section-title">阅读书籍清单</h2>
              <div class="count-pill">{{ recommendations.length }}</div>
            </div>

            <div v-if="recommendations.length" class="rec-masonry-grid">
              <div 
                v-for="rec in recommendations" 
                :key="rec.recordId" 
                class="book-rec-tile glass-effect"
                @click="goToBook(rec.bookId)"
              >
                <div class="book-visual">
                  <img v-if="rec.bookCoverUrl" :src="rec.bookCoverUrl" alt="" @error="rec.bookCoverUrl = null" />
                  <div v-else class="premium-placeholder-book" style="width:100%; height:100%;">
                    <el-icon><Reading /></el-icon>
                  </div>
                </div>
                
                <div class="book-info">
                  <h3 class="book-title">{{ rec.bookName || rec.bookChineseName }}</h3>
                  <div class="book-author" v-if="rec.authorName || rec.authorChineseName">{{ rec.authorName || rec.authorChineseName }}</div>
                  <div class="rec-evidence">{{ rec.evidenceSummary }}</div>
                </div>
              </div>
            </div>

            <div v-else class="empty-state-notice">
              <p>暂无收录的推荐书籍记录</p>
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
const celebrity = ref(null)
const recommendations = ref([])

const goToBook = (id) => {
  router.push(`/books/${id}`)
}

onMounted(async () => {
  const id = route.params.id
  try {
    const [celebData, recData] = await Promise.all([
      publicApi.getCelebrityDetail(id),
      publicApi.getCelebrityRecommendations(id)
    ])
    celebrity.value = celebData
    recommendations.value = recData
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

.celeb-profile-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 60px;
}

/* Sidebar Profile */
.celeb-aside {
  position: sticky;
  top: 130px;
  height: fit-content;
}

.celeb-profile-glass {
  padding: 40px;
  border-radius: 32px;
  text-align: center;
  background: #fff;
}

.avatar-wrapper {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 32px;
  border: 4px solid var(--bg-secondary);
  box-shadow: 0 20px 40px rgba(0,0,0,0.08);
}

.avatar-wrapper img { width: 100%; height: 100%; object-fit: cover; }

.celeb-main-name {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 4px;
  letter-spacing: -0.02em;
}

.celeb-sub-name {
  font-size: 15px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.celeb-tag-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  background: #000;
  color: #fff;
  padding: 4px 12px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Main Grid */
.section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 40px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.count-pill {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-tertiary);
  padding: 2px 10px;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.rec-masonry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.book-rec-tile {
  padding: 20px;
  border-radius: 20px;
  background: #fff;
  display: flex;
  align-items: stretch; /* 使图片和文字容器高度对齐 */
  gap: 16px;
  cursor: pointer;
  transition: var(--transition-apple);
}

.book-rec-tile:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 24px 48px rgba(0,0,0,0.06);
}

.book-visual {
  width: 60px;
  aspect-ratio: 3 / 4; /* 标准封面比例，高度约为 80px */
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  background: var(--bg-secondary);
}

.book-visual img { width: 100%; height: 100%; object-fit: cover; }

.book-info { 
  flex: 1; 
  min-width: 0; 
  display: flex; 
  flex-direction: column; 
  justify-content: space-between; /* 关键：使间距自动等分并撑满高度 */
}

.book-title {
  font-size: 15px;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 1; /* 保持高度一致性，建议单行 */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-author {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-secondary);
  line-height: 1.2;
  margin: 0;
}

.rec-evidence {
  font-size: 12.5px;
  color: var(--text-tertiary);
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

/* Skeleton Styles */
.detail-skeleton {
  max-width: 1100px;
  margin: 0 auto;
  padding: 48px 40px;
}
.skeleton-nav {
  height: 48px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(0,0,0,0.03);
  margin-bottom: 60px;
}

@media (max-width: 860px) {
  .celeb-profile-layout { grid-template-columns: 1fr; }
  .celeb-aside { position: static; margin-bottom: 40px; }
  .book-rec-tile { flex-direction: row; }
}

@media (max-width: 480px) {
  .book-rec-tile { flex-direction: column; align-items: center; text-align: center; }
  .book-info { align-items: center; }
}
</style>
