<template>
  <div class="home-page reveal-fluid">
    <div class="mesh-aura"></div>
    
    <div class="home-container">
      <!-- Minimalist Hero -->
      <header class="fluid-hero">
        <div class="hero-content">
          <h1 class="hero-title reveal-fluid">
            影响世界的人，<span class="gradient-blue">与影响他们的书。</span>
          </h1>
          
          <!-- Glassmorphism Search Board -->
          <div class="search-fluid reveal-fluid">
            <div class="glass-search" :class="{ 'is-active': isSearching }">
              <el-icon class="glass-icon-search"><Search /></el-icon>
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="搜索书籍、名人、或感兴趣的主题..."
                class="glass-input"
                @focus="isSearching = true"
                @blur="handleBlur"
                @input="onInput"
                @keyup.enter="handleEnter"
              />
              <div v-show="!searchQuery" class="shortcut-pill">⌘ K</div>
              <button v-show="searchQuery" @click="clearSearch" class="glass-clear">
                <el-icon><Close /></el-icon>
              </button>
            </div>
            
            <div class="search-trends">
              <span>正在流行：</span>
              <button @click="quickSearch('纳瓦尔')">纳瓦尔</button>
              <button @click="quickSearch('查理芒格')">查理·芒格</button>
              <button @click="quickSearch('原则')">原则</button>
              <button @click="quickSearch('硅谷')">硅谷</button>
            </div>
          </div>
        </div>
      </header>

      <main class="fluid-main">
        <!-- Search Results State -->
        <section v-if="searchQuery || loading" class="search-view">
          <div v-if="loading" class="loading-state">
             <div class="apple-spinner"></div>
             <p>正在搜索...</p>
          </div>

          <div v-else-if="hasResults" class="results-layout">
            <div class="results-columns">
              <!-- Books Column -->
              <div v-if="results.books && results.books.length" class="result-block">
                <div class="block-header">
                  <el-icon><Reading /></el-icon>
                  <span>Books</span>
                </div>
                <div class="grid-vertical">
                  <div v-for="book in results.books" :key="book.bookId" class="glass-item" @click="goTo('books', book.bookId)">
                    <div class="item-visual-book">
                      <img v-if="book.coverUrl" :src="book.coverUrl" />
                      <div v-else class="premium-placeholder-book" style="width: 100%; height: 100%;">
                        <el-icon><Reading /></el-icon>
                      </div>
                    </div>
                    <div class="item-text">
                      <div class="item-primary">{{ book.chineseName }}</div>
                      <div class="item-author" v-if="book.authorChineseName">{{ book.authorChineseName }}</div>
                    </div>
                    <el-icon class="arrow-icon"><ArrowRight /></el-icon>
                  </div>
                </div>
              </div>

              <!-- Celebrities Column -->
              <div v-if="results.celebrities && results.celebrities.length" class="result-block">
                <div class="block-header">
                  <el-icon><User /></el-icon>
                  <span>Famous</span>
                </div>
                <div class="grid-vertical">
                  <div v-for="cele in results.celebrities" :key="cele.celebrityId" class="glass-item" @click="goTo('celebrities', cele.celebrityId)">
                    <div class="item-visual-avatar">
                      <img v-if="cele.avatarUrl" :src="cele.avatarUrl" />
                      <div v-else class="premium-placeholder-avatar" style="width: 100%; height: 100%;">
                        <el-icon><User /></el-icon>
                      </div>
                    </div>
                    <div class="item-text">
                      <div class="item-primary">{{ cele.chineseName }}</div>
                      <div class="item-info">{{ cele.groupName }}</div>
                    </div>
                    <el-icon class="arrow-icon"><ArrowRight /></el-icon>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
             <div class="empty-premium-card reveal-fluid">
               <div class="empty-icon-aura">
                 <el-icon><Search /></el-icon>
               </div>
               <h3 class="empty-title">未找到相关线索</h3>
               <p class="empty-desc">请尝试搜索不同的书籍或名人。</p>
               <button class="action-ghost" @click="clearSearch">重置搜索</button>
             </div>
          </div>
        </section>

        <!-- Simplified Discovery View (Dual Pillars) -->
        <section v-else class="discovery-view reveal-fluid">
          <div class="pillar-layout">
            <!-- Pillar 1: Books -->
            <div class="discover-pillar glass-effect" @click="quickSearch('')">
              <div class="pillar-visual books-visual">
                <el-icon :size="48"><Collection /></el-icon>
              </div>
              <div class="pillar-body">
                <div class="pillar-tag">Library</div>
                <h2 class="pillar-title">长青经典</h2>
                <p>探索经受住时间考验的智慧结晶，那些塑造了领袖思维的永恒著作。</p>
                <!-- Blue Link Removed -->
              </div>
            </div>
            
            <!-- Pillar 2: Celebrities -->
            <div class="discover-pillar glass-effect" @click="quickSearch('')">
              <div class="pillar-visual people-visual">
                <el-icon :size="48"><User /></el-icon>
              </div>
              <div class="pillar-body">
                <div class="pillar-tag">Thinkers</div>
                <h2 class="pillar-title">人物名录</h2>
                <p>了解顶级思想家、投资家与创业者的私人书单。追随智者的脚步。</p>
                <!-- Blue Link Removed -->
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { publicApi } from '@/api/public'

const router = useRouter()
const searchQuery = ref('')
const loading = ref(false)
const isSearching = ref(false)
const results = ref({ books: [], celebrities: [], authors: [] })

const hasResults = computed(() => 
  (results.value.books && results.value.books.length > 0) || 
  (results.value.celebrities && results.value.celebrities.length > 0)
)

let debounceTimer = null
const onInput = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { performSearch() }, 300)
}

const performSearch = async () => {
  const query = searchQuery.value.trim()
  if (!query) {
    results.value = { books: [], celebrities: [], authors: [] }
    return
  }
  loading.value = true
  try {
    const data = await publicApi.search(query)
    results.value = data || { books: [], celebrities: [], authors: [] }
  } catch (e) {
    console.error('Search error:', e)
  } finally {
    loading.value = false
  }
}

const handleEnter = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  performSearch()
}

const quickSearch = (q) => {
  searchQuery.value = q
  performSearch()
}

const clearSearch = () => {
  searchQuery.value = ''
  results.value = { books: [], celebrities: [], authors: [] }
}

const handleBlur = () => {
  setTimeout(() => { isSearching.value = false }, 200)
}

const goTo = (type, id) => {
  router.push(`/${type}/${id}`)
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  position: relative;
}

.home-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 40px;
}

/* Mesh Aura */
.mesh-aura {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(circle at 50% -20%, rgba(0, 113, 227, 0.05) 0%, transparent 80%);
  z-index: -1;
  pointer-events: none;
}

/* Hero Section */
.fluid-hero {
  padding: 180px 0 100px;
  text-align: center;
}

.hero-title {
  font-size: 56px;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.1;
  margin-bottom: 60px;
  color: #1d1d1f;
}

.gradient-blue {
  background: linear-gradient(135deg, #0071e3 0%, #4facfe 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Glass Search Bar */
.search-fluid {
  max-width: 640px;
  margin: 0 auto;
}

.glass-search {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 24px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(0, 0, 0, 0.08);
  height: 68px;
  border-radius: 34px;
  transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
}

.glass-search.is-active {
  background: #fff;
  border-color: rgba(0, 113, 227, 0.3);
  box-shadow: 0 20px 48px rgba(0, 113, 227, 0.12);
  transform: translateY(-4px) scale(1.01);
}

.glass-icon-search { font-size: 22px; color: #86868b; }
.glass-input {
  flex: 1; border: none; background: transparent; outline: none;
  font-size: 18px; font-weight: 500; color: #1d1d1f;
}

.shortcut-pill {
  font-size: 11px; font-weight: 700; color: #86868b;
  background: #f5f5f7; padding: 4px 8px; border-radius: 6px;
}

.glass-clear {
  background: none; border: none; cursor: pointer; color: #86868b;
}

.search-trends {
  margin-top: 24px; display: flex; justify-content: center; gap: 20px;
}
.search-trends span { font-size: 13px; color: #86868b; font-weight: 500; }
.search-trends button {
  background: none; border: none; cursor: pointer;
  color: #0071e3; font-size: 13px; font-weight: 600;
  transition: color 0.15s;
}
.search-trends button:hover { color: #4facfe; }

/* Premium Empty State */
.empty-state {
  padding: 40px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.empty-premium-card {
  max-width: 480px;
  text-align: center;
  padding: 20px 40px;
}

.empty-icon-aura {
  width: 100px;
  height: 100px;
  background: #fff;
  border-radius: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 32px;
  font-size: 40px;
  color: #d2d2d7;
  box-shadow: 0 10px 30px rgba(0,0,0,0.03);
  position: relative;
}

.empty-icon-aura::after {
  content: "";
  position: absolute;
  top: -10px; left: -10px; right: -10px; bottom: -10px;
  border: 1px solid rgba(0,0,0,0.02);
  border-radius: 46px;
}

.empty-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #1d1d1f;
}

.empty-desc {
  font-size: 15px;
  color: #86868b;
  line-height: 1.6;
  margin-bottom: 32px;
}

.action-ghost {
  background: #f5f5f7;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.2s;
}

.action-ghost:hover {
  background: #e8e8ed;
  transform: translateY(-2px);
}

/* Simplified Discovery View */
.discovery-view { padding-bottom: 120px; }
.pillar-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.discover-pillar {
  padding: 80px 40px;
  border-radius: 40px;
  background: #fff;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.discover-pillar:hover {
  transform: translateY(-12px);
  box-shadow: 0 40px 80px rgba(0,0,0,0.08);
}

.pillar-visual {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  background: var(--bg-secondary);
  color: var(--accent-primary);
  transition: var(--transition-apple);
}

.discover-pillar:hover .pillar-visual {
  background: var(--accent-primary);
  color: #fff;
  transform: scale(1.1);
}

.pillar-tag {
  font-size: 11px; font-weight: 800; text-transform: uppercase;
  color: var(--text-tertiary); margin-bottom: 16px; letter-spacing: 0.12em;
}

.pillar-title {
  font-size: 32px; font-weight: 700; margin-bottom: 16px; color: #1d1d1f;
}

.pillar-body p {
  font-size: 16px; color: #86868b; line-height: 1.6; max-width: 320px;
  margin: 0;
}

/* Results Area */
.results-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
.block-header {
  display: flex; align-items: center; gap: 12px; margin-bottom: 24px;
  font-size: 13px; font-weight: 700; color: #86868b; text-transform: uppercase;
}
.grid-vertical { display: flex; flex-direction: column; gap: 12px; }

.glass-item {
  display: flex; align-items: center; gap: 20px; padding: 16px;
  border-radius: 20px; background: #fff; cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  border: 1px solid rgba(0,0,0,0.03);
}

.glass-item:hover {
  background: var(--bg-secondary);
  transform: scale(1.015);
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

.item-visual-book {
  width: 50px; height: 68px; border-radius: 6px; overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1); background: #eee;
}
.item-visual-book img { width: 100%; height: 100%; object-fit: cover; }

.item-visual-avatar {
  width: 50px; height: 50px; border-radius: 50%; overflow: hidden; background: #eee;
}
.item-visual-avatar img { width: 100%; height: 100%; object-fit: cover; }

.item-primary { 
  font-size: 16px; 
  font-weight: 700; 
  color: #1d1d1f; 
  margin-bottom: 6px; 
}

.item-author, .item-info { 
  font-size: 13.5px; 
  color: var(--text-secondary); 
  font-weight: 600; 
  margin-bottom: 4px; 
}

.item-secondary, .item-overview { 
  font-size: 12px; 
  color: var(--text-tertiary); 
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.arrow-icon { font-size: 16px; color: #d1d1d6; opacity: 0; transition: opacity 0.3s; }
.glass-item:hover .arrow-icon { opacity: 1; }

@media (max-width: 860px) {
  .hero-title { font-size: 48px; padding: 0 20px; }
  .pillar-layout, .results-columns { grid-template-columns: 1fr; }
}
</style>
