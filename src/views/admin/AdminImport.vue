<template>
  <div class="admin-view">
    <div class="view-header">
      <div class="header-left">
        <h2>批量数据同步</h2>
        <p>通过 Excel 文件批量注入推荐记录、作者及图书资产。</p>
      </div>
    </div>

    <div class="import-grid">
      <!-- Step 1: Download -->
      <div class="step-card premium-card">
        <div class="step-badge">01</div>
        <div class="step-body">
          <div class="step-icon-main">
            <el-icon><Download /></el-icon>
          </div>
          <h3>获取导入模板</h3>
          <p>请下载标准的 Excel 结构化模板。系统将解析其中的关联逻辑，自动为您补全缺失的作者或图书记录。</p>
          
          <div class="template-spec">
            <span class="spec-label">支持属性：</span>
            <div class="spec-tags">
              <span>中文/英文名</span>
              <span>封面/头像URL</span>
              <span>名人分组</span>
              <span>证据溯源</span>
            </div>
          </div>

          <button class="apple-button apple-button-secondary full-btn" @click="downloadTemplate">
            下载 .xlsx 规范模板
          </button>
        </div>
      </div>

      <!-- Step 2: Upload -->
      <div class="step-card premium-card is-active">
        <div class="step-badge">02</div>
        <div class="step-body">
          <div class="step-icon-main">
            <el-icon><Upload /></el-icon>
          </div>
          <h3>部署数据文件</h3>
          <p>请选择填写完毕的 Excel 文件。系统将进行即时解析与入库同步。支持 .xlsx 格式。</p>
          
          <div class="upload-bar">
            <el-upload
              class="linear-file-uploader"
              action="/api/admin/recommendations/import"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleFileChange"
              accept=".xlsx"
            >
              <button class="upload-trigger-btn">
                <el-icon><DocumentAdd /></el-icon>
                <span>浏览文件</span>
              </button>
            </el-upload>
            <div class="file-status">
              <span v-if="selectedFile" class="file-name">
                <el-icon><Document /></el-icon> {{ selectedFile.name }}
              </span>
              <span v-else class="empty-name">尚未选择文件</span>
            </div>
          </div>

          <button 
            class="apple-button apple-button-primary full-btn" 
            :disabled="!selectedFile || loading"
            @click="submitUpload"
          >
            <el-icon v-if="loading" class="is-loading"><Loading /></el-icon>
            <span v-else>确认导入</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading Modal for Import -->
    <el-dialog
      v-model="loadingDialogVisible"
      title="正在导入数据"
      width="400px"
      append-to-body
      :close-on-click-modal="false"
      :show-close="false"
      class="upload-modal"
    >
      <div class="import-progress-wrap">
        <el-icon class="is-loading import-spinner"><Loading /></el-icon>
        <p class="import-status-text">系统正在解析并导入所有数据...</p>
        <p class="import-tips">数据量全量导入可能需要数十秒，请耐心等待。</p>
      </div>
    </el-dialog>

    <!-- Results Reporting -->
    <el-dialog
      v-model="resultDialogVisible"
      title="数据同步执行报告"
      width="540px"
      append-to-body
      class="report-modal"
    >
      <div v-if="importResult" class="report-content">
        <div class="stat-grid">
          <div class="stat-pill">
            <span class="val">{{ importResult.totalCount }}</span>
            <span class="lbl">扫描总数</span>
          </div>
          <div class="stat-pill success">
            <span class="val">{{ importResult.successCount }}</span>
            <span class="lbl">同步成功</span>
          </div>
          <div class="stat-pill error">
            <span class="val">{{ importResult.failCount }}</span>
            <span class="lbl">执行失败</span>
          </div>
        </div>

        <div v-if="importResult.errors && importResult.errors.length" class="error-log-sect">
          <div class="log-header">
            <el-icon><Warning /></el-icon>
            错误溯源
          </div>
          <div class="log-scroll">
            <div v-for="(err, idx) in importResult.errors" :key="idx" class="log-entry">
              <span class="row-marker">L{{ err.row }}</span>
              <span class="msg-text">{{ err.message }}</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <button class="apple-button apple-button-primary" @click="resultDialogVisible = false">完成审查</button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { recommendationApi } from '@/api/admin'
import { ElMessage } from 'element-plus'

const fileList = ref([])
const selectedFile = ref(null)
const loading = ref(false)
const loadingDialogVisible = ref(false)
const resultDialogVisible = ref(false)
const importResult = ref(null)

const handleFileChange = (file) => {
  selectedFile.value = file.raw
}

const submitUpload = async () => {
  if (!selectedFile.value) return
  
  loading.value = true
  loadingDialogVisible.value = true
  try {
    const res = await recommendationApi.importExcel(selectedFile.value)
    importResult.value = res
    loadingDialogVisible.value = false
    resultDialogVisible.value = true
    fileList.value = []
    selectedFile.value = null
    ElMessage.success('批量导入任务已完成')
  } catch (error) {
    console.error('Import process failed:', error)
    loadingDialogVisible.value = false
    ElMessage.error(error.response?.data?.message || '服务器响应超时或连接中断')
  } finally {
    loading.value = false
  }
}

const downloadTemplate = () => {
  window.open('/api/public/template', '_blank')
}
</script>

<style scoped>
.admin-view {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.view-header h2 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.view-header p {
  font-size: 14px;
  color: #86868b;
}

.import-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.step-card {
  position: relative;
  padding: 40px;
  background: white;
  display: flex;
  flex-direction: column;
}

.step-badge {
  position: absolute;
  top: 24px;
  right: 24px;
  font-size: 32px;
  font-weight: 800;
  color: #f0f0f2;
}

.step-icon-main {
  width: 52px;
  height: 52px;
  background: #f7f7f8;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #111;
  margin-bottom: 24px;
  border: 1px solid rgba(0,0,0,0.04);
}

.step-body {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.step-body h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #111;
}

.step-body p {
  font-size: 14px;
  color: #86868b;
  line-height: 1.6;
  margin-bottom: 32px;
}

.template-spec {
  margin-bottom: 32px;
}

.spec-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #d1d1d6;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.spec-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.spec-tags span {
  font-size: 12px;
  padding: 4px 10px;
  background: #f7f7f8;
  border-radius: 6px;
  color: #4a4a4e;
  border: 1px solid rgba(0,0,0,0.04);
}

.upload-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 32px;
}

.upload-trigger-btn {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-trigger-btn:hover {
  border-color: #d1d5db;
  color: #111827;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.file-status {
  flex: 1;
  font-size: 13px;
  overflow: hidden;
}

.file-name {
  color: #111827;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-name {
  color: #9ca3af;
}

.full-btn {
  width: 100%;
  margin-top: auto;
}

/* Report Modal */
.report-content {
  padding: 8px 0;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.stat-pill {
  padding: 16px;
  background: #f7f7f8;
  border-radius: 12px;
  text-align: center;
}

.stat-pill .val {
  display: block;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 2px;
}

.stat-pill .lbl {
  font-size: 11px;
  font-weight: 600;
  color: #86868b;
}

.stat-pill.success .val { color: #34c759; }
.stat-pill.error .val { color: #ff3b30; }

.import-progress-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px;
  text-align: center;
}

.import-spinner {
  font-size: 40px;
  color: #0066cc;
  margin-bottom: 24px;
}

.import-status-text {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.import-tips {
  font-size: 13px;
  color: #86868b;
  margin: 0;
}

.log-header {
  font-size: 14px;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.log-scroll {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: 8px;
}

.log-entry {
  padding: 10px 16px;
  font-size: 13px;
  border-bottom: 1px solid rgba(0,0,0,0.03);
  display: flex;
  gap: 12px;
}

.row-marker {
  font-weight: 700;
  color: #ff3b30;
}

@media (max-width: 800px) {
  .import-grid { grid-template-columns: 1fr; }
}
</style>
