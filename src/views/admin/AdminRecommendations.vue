<template>
  <div class="admin-page">
    <div class="page-header">
      <div class="header-text">
        <h1>Recommendations</h1>
        <p>Track what celebrities are recommending to read</p>
      </div>
      <el-button type="primary" @click="openDrawer()" id="add-rec-btn" class="add-btn">
        <el-icon><Plus /></el-icon>
        Add Recommendation
      </el-button>
    </div>

    <!-- Toolbar like Tasks view -->
    <div class="toolbar">
      <div class="search-bar">
        <el-icon class="search-icon"><Search /></el-icon>
        <input v-model.trim="searchQuery" @keyup.enter="handleSearch" type="text" placeholder="Search records..." />
      </div>
      <div class="toolbar-actions">
        <span>Showing {{ tableData.length }} of {{ pagination.total }} records</span>
      </div>
    </div>

    <div class="task-list" v-loading="loading">
      <!-- List Header -->
      <div class="list-header" v-if="tableData.length > 0">
        <div class="col-main">Recommendation Info (序号 / 图书名称 / 作者名称)</div>
        <div class="col-assign">Celebrity (名人名称)</div>
        <div class="col-status">Source (出处/摘要)</div>
        <div class="col-action"></div>
      </div>

      <div v-for="row in tableData" :key="row.recordId" class="task-row">
        <div class="task-main">
          <div class="task-content">
            <div class="task-title">{{ row.bookName || 'Book #' + row.bookId }}</div>
            <div class="task-meta">
              <span><el-icon><User /></el-icon> 作者: {{ row.authorName || '未知' }}</span>
              <span><el-icon><Document /></el-icon> 序号: {{ row.recordId }}</span>
            </div>
          </div>
        </div>

        <div class="task-assign">
          <div class="mini-avatar-group">
            <div class="mini-avatar person" title="名人"><el-icon><UserFilled /></el-icon></div>
          </div>
          <span class="assign-text">{{ row.celebrityName || 'Celeb #' + row.celebrityId }}</span>
        </div>

        <div class="task-status">
          <div class="source-info">
            <div class="source-desc">{{ row.sourceDescription || '未知出处' }}</div>
            <div class="source-summary" :title="row.evidenceSummary">{{ row.evidenceSummary || '无摘要' }}</div>
          </div>
        </div>

        <div class="task-actions">
          <el-button circle size="small" @click="openDrawer(row)"><el-icon><Edit /></el-icon></el-button>
          <el-button circle size="small" type="danger" plain @click="handleDelete(row)"><el-icon><Delete /></el-icon></el-button>
        </div>
      </div>

      <div v-if="!loading && tableData.length === 0" class="empty-state">
        <p>暂无推荐记录</p>
      </div>
      
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </div>

    <el-drawer v-model="drawerVisible" :title="isEdit ? '编辑推荐记录' : '新增推荐记录'" size="480px">
      <el-form :model="formData" label-position="top">
        <div class="form-row-2">
          <el-form-item label="图书检索">
            <el-select
              v-model="formData.bookId"
              filterable
              remote
              reserve-keyword
              placeholder="搜索图书"
              :remote-method="searchBooks"
              :loading="searchingBook"
              style="width: 100%"
            >
              <el-option
                v-for="item in bookOptions"
                :key="item.bookId"
                :label="item.chineseName"
                :value="item.bookId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="名人检索">
            <el-select
              v-model="formData.celebrityId"
              filterable
              remote
              reserve-keyword
              placeholder="搜索名人"
              :remote-method="searchCelebrities"
              :loading="searchingCelebrity"
              style="width: 100%"
            >
              <el-option
                v-for="item in celebrityOptions"
                :key="item.celebrityId"
                :label="item.chineseName"
                :value="item.celebrityId"
              />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="出处说明">
          <el-input v-model="formData.sourceDescription" placeholder="推荐出处" />
        </el-form-item>
        <el-form-item label="可靠度">
          <el-input v-model="formData.reliability" placeholder="如：高、中、低" />
        </el-form-item>
        <el-form-item label="证据链接">
          <el-input v-model="formData.evidenceUrl" placeholder="http:// 或 https://" />
        </el-form-item>
        <el-form-item label="简要概述">
          <el-input v-model="formData.briefOverview" type="textarea" :rows="2" placeholder="一句话总结" />
        </el-form-item>
        <el-form-item label="证据摘要 (完整)">
          <el-input v-model="formData.evidenceSummary" type="textarea" :rows="4" placeholder="具体推荐语、原话摘录" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div style="flex: auto">
          <el-button @click="drawerVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { recommendationApi, bookApi, celebrityApi } from '@/api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'

const tableData = ref([])
const loading = ref(false)
const drawerVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const editId = ref(null)

const pagination = reactive({ page: 1, size: 10, total: 0 })
const formData = reactive({
  bookId: null, celebrityId: null,
  sourceDescription: '', evidenceSummary: '',
  reliability: '', evidenceUrl: '', briefOverview: ''
})

const searchQuery = ref('')
const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const searchingBook = ref(false)
const bookOptions = ref([])

const searchBooks = async (query) => {
  if (query) {
    searchingBook.value = true
    try {
      const res = await bookApi.list({ keyword: query })
      bookOptions.value = res.records || []
    } catch (e) {
      console.error(e)
    } finally {
      searchingBook.value = false
    }
  } else {
    bookOptions.value = []
  }
}

const searchingCelebrity = ref(false)
const celebrityOptions = ref([])

const searchCelebrities = async (query) => {
  if (query) {
    searchingCelebrity.value = true
    try {
      const res = await celebrityApi.list({ keyword: query })
      celebrityOptions.value = res.records || []
    } catch (e) {
      console.error(e)
    } finally {
      searchingCelebrity.value = false
    }
  } else {
    celebrityOptions.value = []
  }
}

const resetForm = () => {
  formData.bookId = null
  formData.celebrityId = null
  formData.sourceDescription = ''
  formData.evidenceSummary = ''
  formData.reliability = ''
  formData.evidenceUrl = ''
  formData.briefOverview = ''
  bookOptions.value = []
  celebrityOptions.value = []
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = { page: pagination.page, size: pagination.size }
    if (searchQuery.value) params.keyword = searchQuery.value
    const data = await recommendationApi.list(params)
    tableData.value = data.records || []
    pagination.total = data.total || 0
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const openDrawer = (row) => {
  if (row) {
    isEdit.value = true
    editId.value = row.recordId
    Object.assign(formData, {
      bookId: row.bookId,
      celebrityId: row.celebrityId,
      sourceDescription: row.sourceDescription || '',
      evidenceSummary: row.evidenceSummary || '',
      reliability: row.reliability || '',
      evidenceUrl: row.evidenceUrl || '',
      briefOverview: row.briefOverview || ''
    })
    if (row.bookId) {
      bookOptions.value = [{ bookId: row.bookId, chineseName: row.bookName || '已选图书' }]
    } else {
      bookOptions.value = []
    }
    if (row.celebrityId) {
      celebrityOptions.value = [{ celebrityId: row.celebrityId, chineseName: row.celebrityName || '已选名人' }]
    } else {
      celebrityOptions.value = []
    }
  } else {
    isEdit.value = false
    editId.value = null
    resetForm()
  }
  drawerVisible.value = true
}

const handleSubmit = async () => {
  if (!formData.bookId || !formData.celebrityId) {
    ElMessage.warning('请选择图书和名人')
    return
  }
  submitting.value = true
  try {
    if (isEdit.value) {
      await recommendationApi.update(editId.value, { ...formData })
      ElMessage.success('编辑成功')
    } else {
      await recommendationApi.create({ ...formData })
      ElMessage.success('新增成功')
    }
    drawerVisible.value = false
    fetchData()
  } catch (e) { console.error(e) }
  finally { submitting.value = false }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该推荐记录吗？', '提示', { type: 'warning' })
    .then(async () => {
      await recommendationApi.delete(row.recordId)
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
.col-main { flex: 0 0 40%; padding-left: 12px; box-sizing: border-box; }
.col-assign { flex: 0 0 25%; min-width: 160px; box-sizing: border-box; }
.col-status { flex: 1; min-width: 200px; padding-right: 16px; box-sizing: border-box; }
.col-action { width: 80px; flex-shrink: 0; }

.task-row { 
  display: flex; align-items: center; padding: 16px 0;
  border-bottom: 1px solid #f3f4f6; transition: background 0.2s;
}
.task-row:hover { background: #f9fafb; margin: 0 -12px; padding-left: 12px; padding-right: 12px; border-radius: 8px; border-bottom-color: transparent; }

.task-main { flex: 0 0 40%; display: flex; align-items: flex-start; gap: 12px; padding-left: 12px; box-sizing: border-box; }
.task-title { font-size: 15px; font-weight: 600; color: #111827; margin-bottom: 4px; }
.task-meta { display: flex; gap: 12px; font-size: 12px; color: #6b7280; }
.task-meta span { display: flex; align-items: center; gap: 4px; }

.task-assign { flex: 0 0 25%; min-width: 160px; display: flex; align-items: center; gap: 12px; box-sizing: border-box; }
.mini-avatar-group { display: flex; }
.mini-avatar { 
  width: 28px; height: 28px; border-radius: 50%; color: #fff;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid #fff; font-size: 14px;
}
.mini-avatar.person { background: #f472b6; z-index: 1; }
.assign-text { font-size: 13px; color: #4b5563; font-weight: 500; }

.task-status { flex: 1; min-width: 200px; padding-right: 16px; box-sizing: border-box; }
.source-info { display: flex; flex-direction: column; gap: 4px; }
.source-desc { font-size: 13px; font-weight: 600; color: #374151; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.source-summary { font-size: 12px; color: #6b7280; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.task-actions { width: 80px; flex-shrink: 0; display: flex; gap: 8px; opacity: 0; justify-content: flex-end; }
.task-row:hover .task-actions { opacity: 1; }

.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.empty-state { padding: 40px; text-align: center; color: #999; }
.pagination-wrapper { margin-top: 24px; display: flex; justify-content: flex-end; }
</style>
