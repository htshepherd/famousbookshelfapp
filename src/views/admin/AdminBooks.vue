<template>
  <div class="admin-page">
    <div class="page-header">
      <div class="header-text">
        <h1>Books Library</h1>
        <p>Manage books in the repository and link authors</p>
      </div>
      <el-button type="primary" @click="openDrawer()" id="add-book-btn" class="add-btn">
        <el-icon><Plus /></el-icon>
        Add Book
      </el-button>
    </div>

    <!-- Toolbar like Tasks view -->
    <div class="toolbar">
      <div class="search-bar">
        <el-icon class="search-icon"><Search /></el-icon>
        <input v-model.trim="searchQuery" @keyup.enter="handleSearch" type="text" placeholder="Search books by title..." />
      </div>
      <div class="toolbar-actions">
        <span>Showing {{ tableData.length }} of {{ pagination.total }} books</span>
      </div>
    </div>

    <div class="task-list" v-loading="loading">
      <!-- List Header -->
      <div class="list-header" v-if="tableData.length > 0">
        <div class="col-main">Book Info (序号 / 图书名称 / 图书英文)</div>
        <div class="col-assign">Author (作者中文名)</div>
        <div class="col-action"></div>
      </div>

      <div v-for="row in tableData" :key="row.bookId" class="task-row">
        <div class="task-main">
          <div class="book-cover-mini">
            <img v-if="row.coverUrl" :src="row.coverUrl" />
            <el-icon v-else><Reading /></el-icon>
          </div>
          <div class="task-content">
            <div class="task-title">{{ row.chineseName || '未命名图书' }}</div>
            <div class="task-meta">
              <span>{{ row.englishName || '-' }}</span>
              <span><el-icon><Key /></el-icon> 序号: {{ row.bookId }}</span>
            </div>
          </div>
        </div>

        <div class="task-assign">
          <div class="mini-avatar">
            <el-icon><User /></el-icon>
          </div>
          <div class="assign-info">
            <span class="assign-name">{{ row.authorName || '未绑定作者' }}</span>
          </div>
        </div>

        <div class="task-actions">
          <el-button circle size="small" @click="openDrawer(row)"><el-icon><Edit /></el-icon></el-button>
          <el-button circle size="small" type="danger" plain @click="handleDelete(row)"><el-icon><Delete /></el-icon></el-button>
        </div>
      </div>

      <div v-if="!loading && tableData.length === 0" class="empty-state">
        <p>暂无图书数据</p>
      </div>
      
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </div>

    <el-drawer v-model="drawerVisible" :title="isEdit ? '编辑图书' : '新增图书'" size="450px" class="drawer-custom">
      <el-form :model="formData" label-position="top">
        <div class="form-row-2">
          <el-form-item label="中文书名">
            <el-input v-model="formData.chineseName" placeholder="如：穷查理宝典" />
          </el-form-item>
          <el-form-item label="英文书名">
            <el-input v-model="formData.englishName" placeholder="如：Poor Charlie's Almanack" />
          </el-form-item>
        </div>
        
        <el-form-item label="关联作者">
          <el-select
            v-model="formData.authorId"
            filterable
            remote
            reserve-keyword
            placeholder="输入拼音或中文检索作者"
            :remote-method="searchAuthors"
            :loading="searchingAuthor"
            style="width: 100%"
          >
            <el-option
              v-for="item in authorOptions"
              :key="item.authorId"
              :label="item.chineseName + (item.englishName ? ' (' + item.englishName + ')' : '')"
              :value="item.authorId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="封面图片链接 (URL)">
          <el-input v-model="formData.coverUrl" placeholder="https://...">
            <template #prefix><el-icon><Picture /></el-icon></template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div style="flex: auto; padding-top: 16px; border-top: 1px solid #eee;">
          <el-button @click="drawerVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { bookApi, authorApi } from '@/api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'

const tableData = ref([])
const loading = ref(false)
const drawerVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const editId = ref(null)

const pagination = reactive({ current: 1, size: 10, total: 0 })
const formData = reactive({
  chineseName: '',
  englishName: '',
  authorId: null,
  coverUrl: ''
})

const searchQuery = ref('')
const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

const searchingAuthor = ref(false)
const authorOptions = ref([])

const searchAuthors = async (query) => {
  if (query) {
    searchingAuthor.value = true
    try {
      const res = await authorApi.list({ keyword: query })
      authorOptions.value = res.records || []
    } catch (e) {
      console.error(e)
    } finally {
      searchingAuthor.value = false
    }
  } else {
    authorOptions.value = []
  }
}

const resetForm = () => {
  formData.chineseName = ''
  formData.englishName = ''
  formData.authorId = null
  formData.coverUrl = ''
  authorOptions.value = []
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current,
      size: pagination.size
    }
    if (searchQuery.value) {
      params.keyword = searchQuery.value
    }
    const res = await bookApi.list(params)
    tableData.value = res.records || []
    pagination.total = res.total || 0
  } catch (error) {
    console.error('Fetch failed:', error)
  } finally {
    loading.value = false
  }
}

const openDrawer = (row) => {
  if (row) {
    isEdit.value = true
    editId.value = row.bookId
    Object.assign(formData, {
      chineseName: row.chineseName || '',
      englishName: row.englishName || '',
      authorId: row.authorId || null,
      coverUrl: row.coverUrl || ''
    })
    if (row.authorId) {
      authorOptions.value = [{ authorId: row.authorId, chineseName: row.authorName || '已选作者' }]
    } else {
      authorOptions.value = []
    }
  } else {
    isEdit.value = false
    editId.value = null
    resetForm()
  }
  drawerVisible.value = true
}

const handleSubmit = async () => {
  if (!formData.chineseName) {
    ElMessage.warning('请至少填写中文书名')
    return
  }
  submitting.value = true
  try {
    if (isEdit.value) {
      await bookApi.update(editId.value, { ...formData })
      ElMessage.success('编辑成功')
    } else {
      await bookApi.create({ ...formData })
      ElMessage.success('新增成功')
    }
    drawerVisible.value = false
    fetchData()
  } catch (e) { console.error(e) }
  finally { submitting.value = false }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该图书记录吗？', '提示', { type: 'warning' })
    .then(async () => {
      await bookApi.delete(row.bookId)
      ElMessage.success('删除成功')
      fetchData()
    })
    .catch(() => {})
}

onMounted(fetchData)
</script>

<style scoped>
.admin-page { max-width: 1000px; margin: 0 auto; padding-bottom: 60px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
.header-text h1 { font-size: 28px; font-weight: 800; color: #111; margin-bottom: 4px; }
.header-text p { font-size: 15px; color: #666; margin: 0; }
.add-btn { border-radius: 8px; font-weight: 600; padding: 10px 20px; }

.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.search-bar { 
  display: flex; align-items: center; background: #fff; border: 1px solid #e0e0e0;
  padding: 8px 16px; border-radius: 8px; width: 360px;
}
.search-icon { color: #999; margin-right: 8px; font-size: 18px; }
.search-bar input { border: none; outline: none; flex: 1; font-size: 14px; background: transparent; }
.toolbar-actions { font-size: 13px; color: #666; }

/* Task List Styles */
.task-list { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 0 24px 24px; }

.list-header { 
  display: flex; align-items: center; padding: 20px 0 12px;
  border-bottom: 1px solid #f3f4f6; font-size: 13px; font-weight: 600; color: #6b7280;
}
.col-main { flex: 0 0 60%; padding-left: 12px; box-sizing: border-box; }
.col-assign { flex: 1; padding-left: 12px; box-sizing: border-box; }
.col-action { width: 80px; flex-shrink: 0; }

.task-row { 
  display: flex; align-items: center; padding: 16px 0;
  border-bottom: 1px solid #f3f4f6; transition: background 0.2s;
}
.task-row:hover { background: #f9fafb; margin: 0 -12px; padding-left: 12px; padding-right: 12px; border-radius: 8px; border-bottom-color: transparent; }

.task-main { flex: 0 0 60%; display: flex; align-items: center; gap: 16px; padding-left: 12px; box-sizing: border-box; }

.book-cover-mini {
  width: 32px; height: 44px; border-radius: 4px; background: #f3f4f6;
  display: flex; align-items: center; justify-content: center; color: #9ca3af;
  overflow: hidden; flex-shrink: 0; border: 1px solid #e5e7eb;
}
.book-cover-mini img { width: 100%; height: 100%; object-fit: cover; }

.task-title { font-size: 15px; font-weight: 600; color: #111827; margin-bottom: 4px; }
.task-meta { display: flex; gap: 12px; font-size: 13px; color: #6b7280; }
.task-meta span { display: flex; align-items: center; gap: 4px; }

.task-assign { flex: 1; display: flex; align-items: center; gap: 12px; padding-left: 12px; box-sizing: border-box; }
.mini-avatar { 
  width: 32px; height: 32px; border-radius: 50%; color: #fff; background: #fb923c;
  display: flex; align-items: center; justify-content: center; font-size: 16px;
}
.assign-info { display: flex; flex-direction: column; }
.assign-name { font-size: 14px; font-weight: 600; color: #374151; }
.assign-id { font-size: 11px; color: #9ca3af; }

.task-actions { width: 80px; display: flex; gap: 8px; opacity: 0; justify-content: flex-end; }
.task-row:hover .task-actions { opacity: 1; }

.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.empty-state { padding: 40px; text-align: center; color: #999; }
.pagination-wrapper { margin-top: 24px; display: flex; justify-content: flex-end; }
</style>
