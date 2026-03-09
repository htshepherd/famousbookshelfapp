<template>
  <div class="admin-page">
    <div class="page-header">
      <div class="header-text">
        <h1>Celebrities</h1>
        <p>Manage celebrity profiles, avatars, and groups</p>
      </div>
      <el-button type="primary" @click="openDrawer()" id="add-celeb-btn" class="add-btn">
        <el-icon><Plus /></el-icon>
        Add Celebrity
      </el-button>
    </div>

    <!-- Toolbar like People view -->
    <div class="toolbar">
      <div class="search-bar">
        <el-icon class="search-icon"><Search /></el-icon>
        <input v-model.trim="searchQuery" @keyup.enter="handleSearch" type="text" placeholder="Search celebrities by name..." />
      </div>
      <div class="toolbar-actions">
        <span>Showing {{ tableData.length }} of {{ pagination.total }} celebrities</span>
      </div>
    </div>

    <div class="people-list" v-loading="loading">
      <div v-for="row in tableData" :key="row.celebrityId" class="people-card">
        <div class="avatar-wrap">
          <img v-if="row.avatarUrl" :src="row.avatarUrl" @error="(e) => e.target.style.display = 'none'" />
          <el-icon v-else class="avatar-icon"><UserFilled /></el-icon>
        </div>
        
        <div class="people-info">
          <div class="people-name">{{ row.chineseName || '未命名' }}</div>
          <div class="people-status">
            <el-icon><Key /></el-icon>
            <span>序号: {{ row.celebrityId }}</span>
          </div>
        </div>

        <div class="people-tags">
          <span class="role-tag group-tag">分组: {{ row.groupName || '未分组' }}</span>
        </div>

        <div class="people-actions">
          <el-button circle size="small" @click="openDrawer(row)"><el-icon><Edit /></el-icon></el-button>
          <el-button circle size="small" type="danger" plain @click="handleDelete(row)"><el-icon><Delete /></el-icon></el-button>
        </div>
      </div>

      <div v-if="!loading && tableData.length === 0" class="empty-state">
        <p>暂无名人数据</p>
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

    <el-drawer v-model="drawerVisible" :title="isEdit ? '编辑名人' : '新增名人'" size="400px">
      <el-form :model="formData" label-position="top">
        <el-form-item label="中文名">
          <el-input v-model="formData.chineseName" placeholder="名人中文名" />
        </el-form-item>
        <el-form-item label="英文名">
          <el-input v-model="formData.englishName" placeholder="名人英文名" />
        </el-form-item>
        <el-form-item label="分组">
          <el-input v-model="formData.groupName" placeholder="如：企业家、科学家" />
        </el-form-item>
        <el-form-item label="头像URL">
          <el-input v-model="formData.avatarUrl" placeholder="头像图片链接" />
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
import { celebrityApi } from '@/api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'

const tableData = ref([])
const loading = ref(false)
const drawerVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const editId = ref(null)

const pagination = reactive({ page: 1, size: 10, total: 0 })
const formData = reactive({ chineseName: '', englishName: '', groupName: '', avatarUrl: '' })
const searchQuery = ref('')

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const resetForm = () => {
  formData.chineseName = ''
  formData.englishName = ''
  formData.groupName = ''
  formData.avatarUrl = ''
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = { page: pagination.page, size: pagination.size }
    if (searchQuery.value) params.keyword = searchQuery.value
    const data = await celebrityApi.list(params)
    tableData.value = data.records || []
    pagination.total = data.total || 0
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const openDrawer = (row) => {
  if (row) {
    isEdit.value = true
    editId.value = row.celebrityId
    Object.assign(formData, {
      chineseName: row.chineseName || '',
      englishName: row.englishName || '',
      groupName: row.groupName || '',
      avatarUrl: row.avatarUrl || ''
    })
  } else {
    isEdit.value = false
    editId.value = null
    resetForm()
  }
  drawerVisible.value = true
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    if (isEdit.value) {
      await celebrityApi.update(editId.value, { ...formData })
      ElMessage.success('编辑成功')
    } else {
      await celebrityApi.create({ ...formData })
      ElMessage.success('新增成功')
    }
    drawerVisible.value = false
    fetchData()
  } catch (e) { console.error(e) }
  finally { submitting.value = false }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该名人吗？', '提示', { type: 'warning' })
    .then(async () => {
      await celebrityApi.delete(row.celebrityId)
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

.people-list { display: flex; flex-direction: column; gap: 16px; }
.people-card {
  display: flex; align-items: center; padding: 16px 24px;
  background: #fff; border: 1px solid #eaebec; border-radius: 12px;
  transition: all 0.2s ease; position: relative;
}
.people-card:hover { border-color: #d1d5db; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }

.avatar-wrap {
  width: 56px; height: 56px; border-radius: 50%; overflow: hidden;
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  display: flex; align-items: center; justify-content: center; margin-right: 20px;
  flex-shrink: 0; border: 2px solid #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}
.avatar-wrap img { width: 100%; height: 100%; object-fit: cover; }
.avatar-icon { font-size: 28px; color: #fff; }

.people-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.people-name { font-size: 17px; font-weight: 700; color: #1f2937; }
.people-sub { font-size: 13px; color: #6b7280; display: flex; align-items: center; gap: 6px; }
.people-status { font-size: 13px; color: #6b7280; display: flex; align-items: center; gap: 6px; }
.status-online { color: #10b981; font-weight: 600; }

.people-tags { margin-right: 32px; display: flex; align-items: center; }
.role-tag {
  background: #ede9fe; color: #7c3aed; font-size: 12px; font-weight: 600;
  padding: 4px 12px; border-radius: 16px;
}
.group-tag { background: #dbeafe; color: #2563eb; }

.people-actions { display: flex; gap: 8px; opacity: 0; transition: opacity 0.2s; }
.people-card:hover .people-actions { opacity: 1; }

.empty-state { padding: 40px; text-align: center; color: #999; }
.pagination-wrapper { margin-top: 24px; display: flex; justify-content: flex-end; }
</style>
