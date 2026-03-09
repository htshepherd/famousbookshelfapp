<template>
  <div class="admin-page">
    <div class="page-header">
      <div class="header-text">
        <h1>User Management</h1>
        <p>Manage system users, assigned roles, and account status</p>
      </div>
      <el-button type="primary" @click="handleAdd" id="add-user-btn" class="add-btn">
        <el-icon><Plus /></el-icon>
        Add User
      </el-button>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-bar">
        <el-icon class="search-icon"><Search /></el-icon>
        <input v-model.trim="queryParams.username" @keyup.enter="handleSearch" type="text" placeholder="Search users by username..." />
      </div>
      <div class="toolbar-actions">
        <span>Showing {{ userList.length }} of {{ total }} users</span>
      </div>
    </div>

    <div class="task-list" v-loading="loading">
      <!-- List Header -->
      <div class="list-header" v-if="userList.length > 0">
        <div class="col-main">用户名</div>
        <div class="col-roles">所属角色</div>
        <div class="col-status">状态</div>
        <div class="col-action">操作</div>
      </div>

      <div v-for="row in userList" :key="row.userId" class="task-row">
        <div class="task-main">
          <div class="user-avatar-mini">
            {{ row.username.charAt(0).toUpperCase() }}
          </div>
          <div class="task-content">
            <div class="task-title">{{ row.username }}</div>
            <div class="task-meta">
              <span><el-icon><Key /></el-icon> 序号: {{ row.userId }}</span>
              <span><el-icon><Calendar /></el-icon> {{ formatDate(row.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div class="task-roles">
          <template v-if="row.roles && row.roles.length">
            <div class="role-tags-container">
              <span v-for="role in row.roles" :key="role.roleId" class="role-pill">
                {{ role.roleName }}
              </span>
            </div>
          </template>
          <span v-else class="empty-text">未分配角色</span>
        </div>

        <div class="task-status">
          <span :class="['status-tag', row.status === 1 ? 'status-active' : 'status-disabled']">
            {{ row.status === 1 ? '正常' : '禁用' }}
          </span>
        </div>

        <div class="task-actions">
          <el-button circle size="small" @click="handleEdit(row)" title="编辑用户"><el-icon><Edit /></el-icon></el-button>
          <el-button circle size="small" type="warning" plain @click="handleAssignRole(row)" title="权限分配"><el-icon><Lock /></el-icon></el-button>
          <el-button circle size="small" type="danger" plain @click="handleDelete(row)" title="删除用户"><el-icon><Delete /></el-icon></el-button>
        </div>
      </div>

      <div v-if="!loading && userList.length === 0" class="empty-state">
        <p>暂无用户数据</p>
      </div>
      
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryParams.current"
          v-model:page-size="queryParams.size"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="fetchUsers"
          @current-change="fetchUsers"
        />
      </div>
    </div>

    <!-- Add/Edit Drawer -->
    <el-drawer 
      v-model="dialogVisible" 
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      size="420px"
      class="drawer-custom"
    >
      <el-form :model="form" label-position="top">
        <el-form-item label="用户名" required>
          <el-input v-model="form.username" :disabled="dialogType === 'edit'" placeholder="请输入登录账号" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="用户昵称">
              <el-input v-model="form.nickname" placeholder="显示名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="账号状态">
              <el-radio-group v-model="form.status">
                <el-radio :label="1">正常</el-radio>
                <el-radio :label="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="电子邮箱">
          <el-input v-model="form.email" placeholder="email@example.com" />
        </el-form-item>
        <el-form-item label="登录密码" v-if="dialogType === 'add'" required>
          <el-input v-model="form.password" type="password" show-password placeholder="6-20位字符" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">保存信息</el-button>
        </div>
      </template>
    </el-drawer>

    <!-- Role Assignment Drawer -->
    <el-drawer 
      v-model="roleDialogVisible" 
      title="分配权限角色" 
      size="420px"
      class="drawer-custom"
    >
      <div class="assignment-header">
        <p>为用户 <strong>{{ currentUsername }}</strong> 勾选对应的系统权限组：</p>
      </div>
      
      <div class="role-selection-list">
        <el-checkbox-group v-model="selectedRoles">
          <div v-for="role in allRoles" :key="role.roleId" class="role-select-item">
            <el-checkbox :label="role.roleId">
              <div class="role-info-wrap">
                <span class="role-name">{{ role.roleName }}</span>
                <span class="role-code">{{ role.roleCode }}</span>
              </div>
            </el-checkbox>
          </div>
        </el-checkbox-group>
      </div>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="roleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitRoleAssignment" :loading="roleSubmitLoading">确认分配</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { userApi, roleApi } from '@/api/system'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Edit, Delete, Key, Lock, Calendar } from '@element-plus/icons-vue'

const userList = ref([])
const total = ref(0)
const loading = ref(false)
const submitLoading = ref(false)
const queryParams = reactive({
  current: 1,
  size: 10,
  username: ''
})

const handleSearch = () => {
  queryParams.current = 1
  fetchUsers()
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}:${s}`
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await userApi.list(queryParams)
    userList.value = res.records
    total.value = res.total
  } catch (error) {
    console.error('Failed to fetch users:', error)
  } finally {
    loading.value = false
  }
}

// Add/Edit
const dialogVisible = ref(false)
const dialogType = ref('add')
const form = reactive({
  userId: null,
  username: '',
  password: '',
  nickname: '',
  email: '',
  status: 1
})

const handleAdd = () => {
  dialogType.value = 'add'
  Object.assign(form, {
    userId: null,
    username: '',
    password: '',
    nickname: '',
    email: '',
    status: 1
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  form.userId = row.userId
  form.username = row.username
  form.nickname = row.nickname
  form.email = row.email
  form.status = row.status !== undefined ? row.status : 1
  form.password = ''
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!form.username) return ElMessage.warning('请输入用户名')
  if (dialogType.value === 'add' && !form.password) return ElMessage.warning('请输入密码')

  submitLoading.value = true
  try {
    if (dialogType.value === 'add') {
      await userApi.add(form)
      ElMessage.success('添加成功')
    } else {
      await userApi.update(form)
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
    fetchUsers()
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该用户吗？此操作不可逆。', '删除确认', { 
    type: 'warning',
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    confirmButtonClass: 'el-button--danger'
  }).then(async () => {
    await userApi.delete(row.userId)
    ElMessage.success('删除成功')
    fetchUsers()
  })
}

// Role Assignment
const roleDialogVisible = ref(false)
const roleSubmitLoading = ref(false)
const allRoles = ref([])
const selectedRoles = ref([])
const currentUserId = ref(null)
const currentUsername = ref('')

const handleAssignRole = async (row) => {
  currentUserId.value = row.userId
  currentUsername.value = row.username
  
  try {
    const roles = await roleApi.list()
    allRoles.value = roles
    selectedRoles.value = row.roles ? row.roles.map(r => r.roleId) : []
    roleDialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取角色列表失败')
  }
}

const submitRoleAssignment = async () => {
  roleSubmitLoading.value = true
  try {
    await userApi.assignRoles(currentUserId.value, selectedRoles.value)
    ElMessage.success('角色分配成功')
    roleDialogVisible.value = false
    fetchUsers()
  } finally {
    roleSubmitLoading.value = false
  }
}

onMounted(fetchUsers)
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

/* List Styles */
.task-list { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 0 24px 24px; }

.list-header { 
  display: flex; align-items: center; padding: 20px 0 12px;
  border-bottom: 1px solid #f3f4f6; font-size: 13px; font-weight: 600; color: #6b7280;
}
.col-main { flex: 1.5; padding-left: 12px; box-sizing: border-box; }
.col-roles { flex: 1.2; padding-left: 12px; box-sizing: border-box; }
.col-status { flex: 0 0 140px; text-align: left; padding-left: 12px; }
.col-action { flex: 0 0 160px; flex-shrink: 0; padding-left: 12px; }

.task-row { 
  display: flex; align-items: center; padding: 16px 0;
  border-bottom: 1px solid #f3f4f6; transition: background 0.2s;
}
.task-row:hover { background: #f9fafb; margin: 0 -12px; padding-left: 12px; padding-right: 12px; border-radius: 8px; border-bottom-color: transparent; }

.task-main { flex: 1.5; display: flex; align-items: center; gap: 16px; padding-left: 12px; box-sizing: border-box; }

.user-avatar-mini {
  width: 36px; height: 36px; border-radius: 10px; background: var(--text-primary);
  display: flex; align-items: center; justify-content: center; color: #fff;
  font-weight: 700; font-size: 16px; flex-shrink: 0; box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.task-title { font-size: 15px; font-weight: 600; color: #111827; margin-bottom: 4px; }
.task-meta { display: flex; gap: 12px; font-size: 12px; color: #6b7280; flex-wrap: wrap; }
.task-meta span { display: flex; align-items: center; gap: 4px; }

.task-roles { flex: 1.2; padding-left: 12px; box-sizing: border-box; }
.role-tags-container { display: flex; flex-wrap: wrap; gap: 6px; }
.role-pill { 
  font-size: 11px; font-weight: 600; color: #4338ca; background: #e0e7ff; 
  padding: 2px 8px; border-radius: 12px; white-space: nowrap;
}
.empty-text { font-size: 12px; color: #9ca3af; font-style: italic; }

.task-status { flex: 0 0 140px; display: flex; justify-content: flex-start; padding-left: 12px; }
.status-tag { font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 6px; }
.status-active { background: #dcfce7; color: #166534; }
.status-disabled { background: #fee2e2; color: #991b1b; }

.task-actions { flex: 0 0 160px; display: flex; gap: 8px; opacity: 1; justify-content: flex-start; padding-left: 12px; }

.drawer-footer { padding-top: 16px; border-top: 1px solid #eee; display: flex; justify-content: flex-end; gap: 12px; }

.assignment-header { margin-bottom: 20px; background: #f9fafb; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb; }
.assignment-header p { font-size: 13px; color: #4b5563; margin: 0; }

.role-selection-list { display: flex; flex-direction: column; gap: 8px; }
.role-select-item { 
  padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; 
  transition: all 0.2s; background: #fff;
}
.role-select-item:hover { border-color: #cbd5e1; background: #f8fafc; }
.role-info-wrap { display: flex; flex-direction: column; }
.role-name { font-size: 14px; font-weight: 600; color: #1e293b; }
.role-code { font-size: 11px; color: #64748b; font-family: monospace; }

.empty-state { padding: 40px; text-align: center; color: #999; }
.pagination-wrapper { margin-top: 24px; display: flex; justify-content: flex-end; }
</style>
