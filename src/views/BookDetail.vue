<template>
  <div class="detail-page-view">
    <div v-if="loading" class="detail-skeleton">
      <el-skeleton animated>
        <template #template>
          <div class="skeleton-nav">
             <el-skeleton-item variant="text" style="width: 200px; height: 20px" />
          </div>
          <div class="detail-container">
            <div class="book-info-hero">
              <el-skeleton-item variant="image" class="hero-cover-wrapper" />
              <div class="hero-main">
                <el-skeleton-item variant="h1" style="width: 70%; height: 60px; margin-bottom: 24px" />
                <el-skeleton-item variant="text" style="width: 40%; height: 30px; margin-bottom: 48px" />
                <el-skeleton-item variant="rect" style="width: 100%; height: 200px" />
              </div>
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>

    <template v-else-if="book">
      <!-- Minimal Sticky Sub-nav -->
      <nav class="sub-nav">
        <div class="sub-nav-inner">
          <router-link to="/" class="back-link">
            <el-icon><ArrowLeft /></el-icon>
            <span>探索</span>
          </router-link>
          <div class="nav-sep">/</div>
          <span class="nav-name">{{ book.chineseName || book.bookChineseName }}</span>
        </div>
      </nav>

      <div class="detail-container">
        <div class="book-info-hero">
          <!-- Left: Hero Book Cover -->
          <div class="hero-aside">
            <div class="hero-cover-wrapper">
              <img v-if="book.coverUrl" :src="book.coverUrl" alt="" class="hero-cover-img" @error="book.coverUrl = null" />
              <div v-else class="hero-cover-placeholder premium-placeholder-book">
                <el-icon :size="80"><Reading /></el-icon>
              </div>
              <div class="cover-gloss"></div>
            </div>
          </div>

          <!-- Right: Book Primary Meta -->
          <div class="hero-main">
            <div class="book-identity">
              <h1 class="book-title-main">{{ book.chineseName || book.bookChineseName }}</h1>
              <div class="author-meta">
                <span class="author-label">BY Author</span>
                <span class="author-value">{{ book.authorChineseName || book.authorName }}</span>
              </div>
            </div>

            <div class="book-summary-section">
              <div class="summary-header">
                <el-icon><Memo /></el-icon>
                <span>作品概览 BRIEF OVERVIEW</span>
              </div>
              <div class="summary-content">
                <p>{{ book.overview || book.briefOverview || book.description || book.bookOverview }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Recommendations Grid -->
        <section class="famous-recs-section">
          <div class="section-divider">
            <span class="divider-text">阅读本书的名人</span>
          </div>

          <div v-if="recommendations.length" class="famous-grid">
            <div 
              v-for="rec in recommendations" 
              :key="rec.recordId || rec.celebrityId" 
              class="famous-card-premium" 
              @click="goToCelebrity(rec.celebrityId)"
            >
              <div class=" ünlü-avatar-box">
                <img v-if="rec.avatarUrl || rec.celebrityAvatarUrl" :src="rec.avatarUrl || rec.celebrityAvatarUrl" @error="rec.avatarUrl = null; rec.celebrityAvatarUrl = null" />
                <div v-else class="premium-placeholder-avatar">
                  <el-icon :size="20"><User /></el-icon>
                </div>
              </div>
              <div class="ünlü-info">
                <div class="ünlü-name">{{ rec.celebrityChineseName || rec.chineseName || rec.celebrityName || rec.name }}</div>
                <div class="ünlü-tag">{{ rec.celebrityGroupName || rec.groupName || '智者' }}</div>
              </div>
              <div class="card-arrow">
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
          </div>
          
          <div v-else class="empty-recs">
            <div class="empty-glass">
              <el-icon><Compass /></el-icon>
              <p>暂无收录的名人推荐记录</p>
            </div>
          </div>
        </section>
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
const book = ref(null)
const recommendations = ref([])

const goToCelebrity = (id) => {
  if (id) router.push(`/celebrities/${id}`)
}

onMounted(async () => {
  const id = route.params.id
  try {
    const [bookRes, recRes] = await Promise.allSettled([
      publicApi.getBookDetail(id),
      publicApi.getBookRecommendations(id)
    ])
    
    let currentBookData = null
    if (bookRes.status === 'fulfilled') {
      const base = bookRes.value?.data || bookRes.value
      currentBookData = Array.isArray(base) ? base[0] : (base?.books ? base.books[0] : base)
      book.value = currentBookData
    }
    
    if (recRes.status === 'fulfilled') {
      const base = recRes.value?.data || recRes.value
      // Priority: 1. nested recommenders 2. dedicated endpoint
      if (currentBookData?.recommenders?.length > 0) {
        recommendations.value = currentBookData.recommenders
      } else {
        recommendations.value = Array.isArray(base) ? base : (base?.list || [])
      }
    }
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
  background-color: #fbfbfd;
  color: #1d1d1f;
}

/* Sub-nav */
.sub-nav {
  position: sticky;
  top: 56px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  z-index: 1000;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.sub-nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 52px;
  display: flex;
  align-items: center;
  padding: 0 40px;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #0071e3;
  text-decoration: none;
  transition: opacity 0.2s;
}
.back-link:hover { opacity: 0.7; }

.nav-sep { margin: 0 14px; color: #d2d2d7; font-size: 12px; }
.nav-name { font-size: 14px; font-weight: 600; color: #1d1d1f; }

.detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 40px 120px;
}

/* Hero Section */
.book-info-hero {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 80px;
  margin-bottom: 100px;
}

.hero-cover-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4; /* Standard book cover ratio */
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 
    0 40px 100px -20px rgba(0,0,0,0.15),
    0 20px 40px -10px rgba(0,0,0,0.1);
  background: #fff;
}

.hero-cover-img { width: 100%; height: 100%; object-fit: cover; }
.cover-gloss {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(105deg, rgba(255,255,255,0.1) 0%, transparent 40%, rgba(0,0,0,0.05) 100%);
  pointer-events: none;
}

.hero-cover-placeholder {
  width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #f5f5f7 0%, #e2e2e7 100%);
  color: #aeaeae;
}

/* Header Content */
.book-identity { margin-bottom: 48px; }
.book-title-main {
  font-size: 64px;
  font-weight: 800;
  letter-spacing: -0.05em;
  line-height: 1.05;
  margin-bottom: 24px;
}

.author-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}
.author-label {
  font-size: 11px; font-weight: 800; color: #86868b; letter-spacing: 0.1em;
  padding: 4px 10px; border: 1.5px solid #d2d2d7; border-radius: 6px;
}
.author-value { font-size: 22px; font-weight: 700; color: #1d1d1f; }

/* Summary Grid */
.book-summary-section {
  background: white;
  border-radius: 32px;
  padding: 40px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.02);
  border: 1px solid rgba(0,0,0,0.04);
}

.summary-header {
  display: flex; align-items: center; gap: 12px; margin-bottom: 24px;
  color: #86868b; font-size: 13px; font-weight: 700; letter-spacing: 0.05em;
}

.summary-content p {
  font-size: 19px; line-height: 1.75; color: #424245; font-weight: 400;
  margin: 0;
}

/* Recommendations Section */
.famous-recs-section { margin-top: 120px; }

.section-divider {
  display: flex; align-items: center; margin-bottom: 48px;
}
.divider-text {
  font-size: 12px; font-weight: 800; color: #86868b; letter-spacing: 0.15em;
  padding-right: 24px; position: relative;
}
.section-divider::after {
  content: ""; flex: 1; height: 1px; background: #e2e2e7;
}

.famous-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}

.famous-card-premium {
  background: #fff;
  padding: 24px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid rgba(0,0,0,0.03);
}

.famous-card-premium:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 30px 60px -12px rgba(0,0,0,0.08);
  border-color: #0071e3;
}

.ünlü-avatar-box {
  width: 72px; height: 72px; border-radius: 50%; overflow: hidden;
  background: #f5f5f7; flex-shrink: 0;
  border: 2px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.ünlü-avatar-box img { width: 100%; height: 100%; object-fit: cover; }

.ünlü-info { flex: 1; }
.ünlü-name { font-size: 18px; font-weight: 700; margin-bottom: 4px; color: #1d1d1f; }
.ünlü-tag { 
  font-size: 13px; font-weight: 500; color: #86868b;
  display: inline-block; padding: 2px 0;
}

.card-arrow { color: #d2d2d7; font-size: 20px; opacity: 0; transition: all 0.3s; transform: translateX(-10px); }
.famous-card-premium:hover .card-arrow { opacity: 1; transform: translateX(0); color: #0071e3; }

/* Empty State */
.empty-recs { padding: 60px 0; text-align: center; }
.empty-glass {
  display: inline-flex; flex-direction: column; align-items: center; gap: 16px;
  color: #aeaeae; font-size: 16px;
}
.empty-glass .el-icon { font-size: 40px; opacity: 0.5; }

.loading-full { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; }
.apple-spinner { width: 32px; height: 32px; border: 3px solid rgba(0,0,0,0.03); border-top-color: #0071e3; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 16px; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Skeleton Styles */
.detail-skeleton {
  max-width: 1200px;
  margin: 0 auto;
  padding: 56px 40px;
}
.skeleton-nav {
  height: 52px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  margin-bottom: 80px;
}

@media (max-width: 960px) {
  .book-info-hero { grid-template-columns: 1fr; gap: 40px; }
  .hero-aside { max-width: 300px; margin: 0 auto; }
  .book-title-main { font-size: 42px; }
  .famous-grid { grid-template-columns: 1fr; }
}
</style>
