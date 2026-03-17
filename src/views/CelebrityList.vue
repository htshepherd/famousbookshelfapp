<template>
  <div class="celebrity-list-page reveal-fluid">
    <div class="mesh-aura"></div>
    
    <div class="page-header">
      <div class="header-container">
        <button class="back-link" @click="$router.push('/')">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回发现</span>
        </button>
        <h1 class="page-title">人物名录 <span class="count-badge" v-if="celebrities.length">{{ celebrities.length }}</span></h1>
        <p class="page-subtitle">汇集全球顶级思想家、投资家与创业者。追随智者的步伐，探索他们眼中的世界。</p>
      </div>
    </div>

    <div class="content-container">
      <div v-if="loading" class="skeleton-grid">
        <div v-for="i in 12" :key="i" class="skeleton-card">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-body">
            <div class="skeleton-line title"></div>
            <div class="skeleton-line meta"></div>
          </div>
        </div>
      </div>

      <div v-else-if="celebrities.length" class="celebrity-grid">
        <div 
          v-for="(cele, index) in celebrities" 
          :key="cele.celebrityId" 
          class="celebrity-card reveal-fluid"
          :style="{ animationDelay: `${index * 0.03}s` }"
          @click="$router.push(`/celebrities/${cele.celebrityId}`)"
        >
          <div class="card-inner">
            <div class="avatar-wrapper">
              <img v-if="cele.avatarUrl" :src="cele.avatarUrl" :alt="cele.chineseName" @error="handleImgError" />
              <div v-else class="avatar-placeholder">
                <el-icon><User /></el-icon>
              </div>
            </div>
            <div class="celebrity-info">
              <h3 class="celebrity-name">{{ cele.chineseName }}</h3>
              <div class="group-tag">
                <el-icon><CollectionTag /></el-icon>
                <span>{{ cele.groupName || '未分类' }}</span>
              </div>
            </div>
            <div class="hover-overlay">
              <span>查看书单</span>
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <el-empty description="暂无人物数据" />
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
import { ArrowLeft, User, CollectionTag, ArrowRight } from '@element-plus/icons-vue'

const celebrities = ref([])
const loading = ref(true)

const fetchCelebrities = async () => {
  loading.value = true
  try {
    const res = await publicApi.getAllCelebrities()
    celebrities.value = res || []
  } catch (err) {
    console.error('Failed to fetch celebrities:', err)
  } finally {
    loading.value = false
  }
}

const handleImgError = (e) => {
  e.target.style.display = 'none'
  const parent = e.target.parentElement
  if (parent) {
    const placeholder = document.createElement('div')
    placeholder.className = 'avatar-placeholder'
    placeholder.innerHTML = '<i class="el-icon"><svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 512a192 192 0 1 0 0-384 192 192 0 0 0 0 384zm0 64a256 256 0 1 1 0-512 256 256 0 0 1 0 512zm320 320v-32a96 96 0 0 0-96-96H288a96 96 0 0 0-96 96v32a32 32 0 1 1-64 0v-32a160 160 0 0 1 160-160h448a160 160 0 0 1 160 160v32a32 32 0 1 1-64 0z"></path></svg></i>'
    parent.appendChild(placeholder)
  }
}

onMounted(() => {
  fetchCelebrities()
})
</script>

<style scoped>
.celebrity-list-page {
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
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(20px) saturate(180%);
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
  transition: color 0.15s;
}

.back-link:hover { color: #0071e3; }

.page-title {
  font-size: 48px;
  font-weight: 800;
  letter-spacing: -0.03em;
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
  max-width: 700px;
  line-height: 1.5;
}

.content-container {
  padding-top: 60px;
  padding-bottom: 100px;
  flex: 1;
}

/* Celebrity Grid */
.celebrity-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px 24px;
}

.celebrity-card {
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
}

.card-inner {
  background: #fff;
  border-radius: 20px;
  padding: 16px 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  text-align: left;
  border: 1px solid rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
  height: 100%;
  gap: 16px;
  transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
}

.avatar-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: #f5f5f7;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}

.avatar-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: #d2d2d7;
  background: linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%);
}

.celebrity-name {
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 4px;
  color: #1d1d1f;
}

.group-tag {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #86868b;
  background: #f3f3f5;
  padding: 2px 8px;
  border-radius: 8px;
  width: fit-content;
}

.hover-overlay {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 60px;
  background: #0071e3;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  transform: translateY(100%);
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

.celebrity-card:hover .card-inner {
  transform: translateY(-8px);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 113, 227, 0.1);
}

.celebrity-card:hover .avatar-wrapper { transform: scale(1.08); }
.celebrity-card:hover .hover-overlay { transform: translateY(0); }

/* Skeletons */
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px 24px;
}

.skeleton-card {
  height: 88px;
  background: #f5f5f7;
  border-radius: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16px 20px;
  gap: 16px;
}

.skeleton-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #eee;
  flex-shrink: 0;
  animation: pulse 1.5s infinite ease-in-out;
}

.skeleton-line {
  background: #eee;
  border-radius: 4px;
  margin-bottom: 8px;
  animation: pulse 1.5s infinite ease-in-out;
}

.skeleton-line.title { width: 100px; height: 16px; }
.skeleton-line.meta { width: 60px; height: 12px; }

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

.page-footer {
  padding: 60px 0;
  text-align: center;
  border-top: 1px solid rgba(0,0,0,0.05);
  color: #86868b;
  font-size: 14px;
}

@media (max-width: 1250px) {
  .celebrity-grid, .skeleton-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 950px) {
  .celebrity-grid, .skeleton-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .page-header { padding: 80px 0 40px; }
  .page-title { font-size: 32px; }
  .header-container, .content-container { padding: 0 24px; }
  .celebrity-grid, .skeleton-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .card-inner, .skeleton-card { padding: 12px; border-radius: 12px; gap: 8px; height: auto; }
  .avatar-wrapper, .skeleton-avatar { width: 44px; height: 44px; }
  .celebrity-name { font-size: 15px; }
  .group-tag { font-size: 10px; padding: 1px 6px; }
}

@media (max-width: 480px) {
  .celebrity-grid, .skeleton-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .card-inner, .skeleton-card { padding: 10px; gap: 8px; }
  .avatar-wrapper, .skeleton-avatar { width: 36px; height: 36px; }
  .celebrity-name { font-size: 13px; }
  .group-tag { font-size: 9px; padding: 1px 4px; }
}
</style>
