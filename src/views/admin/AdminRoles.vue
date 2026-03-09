<template>
  <div class="admin-page">
    <div class="page-header">
      <div class="header-text">
        <h1>Role Management</h1>
        <p>Define system roles and their specific menu & action permissions</p>
      </div>
      <el-button type="primary" @click="handleAdd" id="add-role-btn" class="add-btn">
        <el-icon><Plus /></el-icon>
        Add Role
      </el-button>
    </div>

    <!-- No toolbar needed for roles usually, or just a simple summary -->
    <div class="toolbar">
      <div class="toolbar-info">
        <span>System Roles: {{ roleList.length }} profiles defined</span>
      </div>
    </div>

    <div class="task-list" v-loading="loading">
      <!-- List Header -->
      <div class="list-header" v-if="roleList.length > 0">
        <div class="col-main">角色名称</div>
        <div class="col-desc">角色描述</div>
        <div class="col-action">操作</div>
      </div>

      <div v-for="row in roleList" :key="row.roleId" class="task-row">
        <div class="task-main">
          <div class="role-icon-box">
            <el-icon><Avatar /></el-icon>
          </div>
          <div class="task-content">
            <div class="task-title">{{ row.roleName }}</div>
            <div class="task-meta">
              <code class="code-pill">{{ row.roleCode }}</code>
              <span><el-icon><Key /></el-icon> ID: {{ row.roleId }}</span>
            </div>
          </div>
        </div>

        <div class="task-desc">
          <p class="desc-text">{{ row.description || 'No description provided.' }}</p>
        </div>

        <div class="task-actions">
          <el-button circle size="small" @click="handleEdit(row)" title="编辑角色"><el-icon><Edit /></el-icon></el-button>
          <el-button circle size="small" type="warning" plain @click="handleAssignPermission(row)" title="分配权限"><el-icon><Setting /></el-icon></el-button>
          <el-button circle size="small" type="danger" plain @click="handleDelete(row)" title="删除角色"><el-icon><Delete /></el-icon></el-button>
        </div>
      </div>

      <div v-if="!loading && roleList.length === 0" class="empty-state">
        <p>暂无角色数据</p>
      </div>
    </div>

    <!-- Add/Edit Drawer -->
    <el-drawer 
      v-model="dialogVisible" 
      :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
      size="420px"
      class="drawer-custom"
    >
      <el-form :model="form" label-position="top">
        <el-form-item label="角色名称" required>
          <el-input v-model="form.roleName" placeholder="如: 超级管理员" />
        </el-form-item>
        <el-form-item label="标识编码" required>
          <el-input v-model="form.roleCode" placeholder="如: ADMIN" />
        </el-form-item>
        <el-form-item label="描述说明">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="简述该角色的权限范围..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">保存角色</el-button>
        </div>
      </template>
    </el-drawer>

    <!-- Permission Assignment Drawer -->
    <el-drawer 
      v-model="permDialogVisible" 
      title="权限授权配置" 
      size="480px"
      class="drawer-custom"
    >
      <div class="assignment-header">
        <p>正在配置 <strong>{{ currentRoleName }}</strong> 的功能权限：</p>
      </div>
      
      <div class="tree-wrapper">
        <el-tree
          ref="treeRef"
          :data="menuTree"
          show-checkbox
          node-key="menuId"
          :props="{ label: 'menuName' }"
          default-expand-all
          highlight-current
          class="custom-tree"
        >
          <template #default="{ node, data }">
            <span class="custom-tree-node">
              <el-icon v-if="data.icon" class="node-icon"><component :is="data.icon" /></el-icon>
              <span>{{ node.label }}</span>
            </span>
          </template>
        </el-tree>
      </div>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="permDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPermissionAssignment" :loading="permSubmitLoading">提交授权</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, nextTick } from 'vue'
import { roleApi, menuApi } from '@/api/system'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Setting, Key, Avatar } from '@element-plus/icons-vue'

const roleList = ref([])
const loading = ref(false)
const submitLoading = ref(false)
const permSubmitLoading = ref(false)

const fetchRoles = async () => {
  loading.value = true
  try {
    const res = await roleApi.list()
    roleList.value = res
  } catch (error) {
    console.error('Failed to fetch roles:', error)
  } finally {
    loading.value = false
  }
}

// Add/Edit
const dialogVisible = ref(false)
const dialogType = ref('add')
const form = reactive({
  roleId: null,
  roleName: '',
  roleCode: '',
  description: ''
})

const handleAdd = () => {
  dialogType.value = 'add'
  Object.assign(form, { roleId: null, roleName: '', roleCode: '', description: '' })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  Object.assign(form, {
    roleId: row.roleId,
    roleName: row.roleName,
    roleCode: row.roleCode,
    description: row.description
  })
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!form.roleName || !form.roleCode) return ElMessage.warning('请填写必填项')
  submitLoading.value = true
  try {
    if (dialogType.value === 'add') {
      await roleApi.add(form)
      ElMessage.success('添加成功')
    } else {
      await roleApi.update(form)
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
    fetchRoles()
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该角色吗？', '删除确认', { 
    type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消'
  }).then(async () => {
    await roleApi.delete(row.roleId)
    ElMessage.success('删除成功')
    fetchRoles()
  })
}

// Permission Assignment
const permDialogVisible = ref(false)
const menuTree = ref([])
const currentRoleId = ref(null)
const currentRoleName = ref('')
const treeRef = ref(null)

const buildTree = (list, parentId = 0) => {
  return list
    .filter(item => item.parentId === parentId)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .map(item => ({
      ...item,
      children: buildTree(list, item.menuId)
    }))
}

const handleAssignPermission = async (row) => {
  currentRoleId.value = row.roleId
  currentRoleName.value = row.roleName
  
  try {
    loading.value = true
    const menus = await menuApi.list()
    menuTree.value = buildTree(menus)
    permDialogVisible.value = true
    
    // Use nextTick to ensure the tree has rendered before setting keys
    await nextTick()
    if (treeRef.value) {
      if (row.menus && row.menus.length > 0) {
        // Robust extraction of IDs
        const menuIds = row.menus.map(m => (typeof m === 'object' ? m.menuId : m))
        // Filter out parent nodes to avoid auto-checking all children in check-strictly=false mode
        // If the tree is check-strictly=false (default), we only need to set leaf nodes, 
        // and Element Plus will calculate parents automatically.
        const leafKeys = []
        const getLeafKeys = (nodes) => {
          nodes.forEach(node => {
            if (!node.children || node.children.length === 0) {
              if (menuIds.includes(node.menuId)) leafKeys.push(node.menuId)
              } else {
                getLeafKeys(node.children)
              }
          })
        }
        getLeafKeys(menuTree.value)
        treeRef.value.setCheckedKeys(leafKeys)
      } else {
        treeRef.value.setCheckedKeys([])
      }
    }
  } catch (error) {
    console.error('Permission fetch error:', error)
    ElMessage.error('获取权限列表失败')
  } finally {
    loading.value = false
  }
}

const submitPermissionAssignment = async () => {
  permSubmitLoading.value = true
  try {
    // Collect both checked and half-checked nodes to ensure parent-child structure is saved
    const checkedKeys = treeRef.value.getCheckedKeys()
    const halfCheckedKeys = treeRef.value.getHalfCheckedKeys()
    const allKeys = [...checkedKeys, ...halfCheckedKeys]
    
    await roleApi.assignMenus(currentRoleId.value, allKeys)
    ElMessage.success('授权成功')
    permDialogVisible.value = false
    fetchRoles()
  } finally {
    permSubmitLoading.value = false
  }
}

onMounted(fetchRoles)
</script>

<style scoped>
.admin-page { max-width: 1000px; margin: 0 auto; padding-bottom: 60px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
.header-text h1 { font-size: 28px; font-weight: 800; color: #111; margin-bottom: 4px; }
.header-text p { font-size: 15px; color: #666; margin: 0; }
.add-btn { border-radius: 8px; font-weight: 600; padding: 10px 20px; }

.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.toolbar-info { font-size: 14px; color: #64748b; font-weight: 500; }

/* List Styles */
.task-list { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 0 24px 24px; }

.list-header { 
  display: flex; align-items: center; padding: 20px 0 12px;
  border-bottom: 1px solid #f3f4f6; font-size: 13px; font-weight: 600; color: #6b7280;
}
.col-main { flex: 1; padding-left: 12px; box-sizing: border-box; }
.col-desc { flex: 1.5; padding-left: 24px; box-sizing: border-box; }
.col-action { flex: 0 0 160px; flex-shrink: 0; padding-left: 12px; }

.task-row { 
  display: flex; align-items: center; padding: 16px 0;
  border-bottom: 1px solid #f3f4f6; transition: background 0.2s;
}
.task-row:hover { background: #f9fafb; margin: 0 -12px; padding-left: 12px; padding-right: 12px; border-radius: 8px; border-bottom-color: transparent; }

.task-main { flex: 1; display: flex; align-items: center; gap: 16px; padding-left: 12px; box-sizing: border-box; }

.role-icon-box {
  width: 36px; height: 36px; border-radius: 10px; background: #f1f5f9;
  display: flex; align-items: center; justify-content: center; color: #64748b;
  font-size: 20px; flex-shrink: 0; border: 1px solid #e2e8f0;
}

.task-title { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
.task-meta { display: flex; align-items: center; gap: 10px; font-size: 12px; color: #64748b; }
.code-pill { background: #f8fafc; border: 1px solid #e2e8f0; padding: 1px 6px; border-radius: 4px; color: #475569; font-weight: 600; }

.task-desc { flex: 1.5; padding-left: 24px; box-sizing: border-box; }
.desc-text { font-size: 13px; color: #64748b; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.task-actions { flex: 0 0 160px; display: flex; gap: 8px; opacity: 1; justify-content: flex-start; padding-left: 12px; }

.drawer-footer { padding-top: 16px; border-top: 1px solid #eee; display: flex; justify-content: flex-end; gap: 12px; }

.assignment-header { margin-bottom: 20px; background: #f8fafc; padding: 16px; border-radius: 10px; border: 1px solid #e2e8f0; }
.assignment-header p { font-size: 14px; color: #334155; margin: 0; }

.tree-wrapper { 
  border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; 
  background: #fff; max-height: calc(100vh - 250px); overflow-y: auto;
}
.custom-tree :deep(.el-tree-node__content) { height: 36px; border-radius: 6px; }
.custom-tree :deep(.el-tree-node__label) { font-size: 14px; color: #334155; }
.custom-tree-node { display: flex; align-items: center; gap: 8px; font-size: 14px; }
.node-icon { color: #6366f1; font-size: 16px; }

.desc-text { font-size: 13px; color: #64748b; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.empty-state { padding: 40px; text-align: center; color: #999; }
</style>
