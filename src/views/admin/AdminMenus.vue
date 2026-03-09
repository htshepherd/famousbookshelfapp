<template>
  <div class="admin-page">
    <div class="page-header">
      <div class="header-text">
        <h1>Navigation & Permissions</h1>
        <p>Configure the system's menu tree, route mapping, and action identifiers</p>
      </div>
      <el-button type="primary" @click="handleAdd(0)" id="add-root-menu-btn" class="add-btn">
        <el-icon><Plus /></el-icon>
        Add Root Menu
      </el-button>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-info">
        <span>Structure: Recursive tree of folders, links and action buttons</span>
      </div>
    </div>

    <div class="menu-list-container" v-loading="loading">
      <el-table
        :data="menuTree"
        row-key="menuId"
        style="width: 100%"
        :tree-props="{ children: 'children' }"
        class="custom-tree-table"
      >
        <el-table-column label="菜单标题" min-width="50%">
          <template #default="scope">
            <div class="task-content-cell">
              <div class="task-title-row">
                <el-icon v-if="scope.row.icon" class="type-icon"><component :is="scope.row.icon" /></el-icon>
                <span class="menu-name-text">{{ scope.row.menuName }}</span>
              </div>
              <div class="task-meta-row">
                <code v-if="scope.row.perms" class="code-pill">{{ scope.row.perms }}</code>
                <span v-if="scope.row.path" class="path-text">
                  <el-icon v-if="scope.row.path"><Link /></el-icon> {{ scope.row.path }}
                </span>
                <span class="order-text">
                  <el-icon><Sort /></el-icon> 排序: {{ scope.row.sortOrder }}
                </span>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="menuType" label="类型" width="120" align="left">
          <template #default="scope">
            <span :class="['type-label', 'type-' + scope.row.menuType.toLowerCase()]">
              {{ scope.row.menuType === 'M' ? 'DIR' : (scope.row.menuType === 'C' ? 'PAGE' : 'BTN') }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="160" fixed="right" align="left">
          <template #default="scope">
            <el-button circle size="small" @click="handleAdd(scope.row.menuId)" title="添加子项"><el-icon><Plus /></el-icon></el-button>
            <el-button circle size="small" @click="handleEdit(scope.row)" title="修改"><el-icon><Edit /></el-icon></el-button>
            <el-button circle size="small" type="danger" plain @click="handleDelete(scope.row)" title="删除"><el-icon><Delete /></el-icon></el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Admin Drawer -->
    <el-drawer 
      v-model="dialogVisible" 
      :title="dialogType === 'add' ? '新增菜单项' : '编辑菜单项'"
      size="500px"
      class="drawer-custom"
    >
      <el-form :model="form" label-position="top">
        <el-form-item label="上级归属">
          <el-tree-select
            v-model="form.parentId"
            :data="menuOptions"
            check-strictly
            :props="{ label: 'menuName', value: 'menuId' }"
            placeholder="选择上级节点"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="节点类型">
          <el-radio-group v-model="form.menuType" class="type-picker">
            <el-radio-button label="M">目录 (DIR)</el-radio-button>
            <el-radio-button label="C">菜单 (PAGE)</el-radio-button>
            <el-radio-button label="F">按钮 (BTN)</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <div class="form-row-2">
          <el-form-item label="菜单名称" required>
            <el-input v-model="form.menuName" placeholder="如: 用户管理" />
          </el-form-item>
          <el-form-item label="显示排序">
            <el-input-number v-model="form.sortOrder" :min="0" style="width: 100%" />
          </el-form-item>
        </div>

        <el-row :gutter="16" v-if="form.menuType !== 'F'">
          <el-col :span="12">
            <el-form-item label="图标 (Icon)">
              <el-input v-model="form.icon" placeholder="Element 图标名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="路由地址 (Route)">
              <el-input v-model="form.path" placeholder="示例: user" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="组件路径" v-if="form.menuType === 'C'">
          <el-input v-model="form.component" placeholder="示例: admin/AdminUsers" />
        </el-form-item>

        <el-form-item label="权限标识符 (Permission Tag)">
          <el-input v-model="form.perms" placeholder="格式: system:user:list" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">保存配置</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { menuApi } from '@/api/system'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Link, Sort } from '@element-plus/icons-vue'

const rawMenus = ref([])
const menuTree = ref([])
const loading = ref(false)
const submitLoading = ref(false)

const buildTree = (list, parentId = 0) => {
  return list
    .filter(item => item.parentId === parentId)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .map(item => ({
      ...item,
      children: buildTree(list, item.menuId)
    }))
}

const fetchMenus = async () => {
  loading.value = true
  try {
    const res = await menuApi.list()
    rawMenus.value = res
    menuTree.value = buildTree(res)
  } catch (error) {
    console.error('Failed to fetch menus:', error)
  } finally {
    loading.value = false
  }
}

const menuOptions = computed(() => {
  const rootTree = buildTree(rawMenus.value)
  return [{ menuId: 0, menuName: '根目录', children: rootTree }]
})

// Add/Edit
const dialogVisible = ref(false)
const dialogType = ref('add')
const form = reactive({
  menuId: null,
  parentId: 0,
  menuName: '',
  path: '',
  component: '',
  perms: '',
  icon: '',
  sortOrder: 0,
  menuType: 'M'
})

const handleAdd = (parentId) => {
  dialogType.value = 'add'
  Object.assign(form, {
    menuId: null,
    parentId: parentId || 0,
    menuName: '',
    path: '',
    component: '',
    perms: '',
    icon: '',
    sortOrder: 0,
    menuType: 'M'
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  Object.assign(form, {
    menuId: row.menuId,
    parentId: row.parentId,
    menuName: row.menuName,
    path: row.path,
    component: row.component,
    perms: row.perms,
    icon: row.icon,
    sortOrder: row.sortOrder,
    menuType: row.menuType
  })
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!form.menuName) return ElMessage.warning('请输入菜单名称')
  submitLoading.value = true
  try {
    if (dialogType.value === 'add') {
      await menuApi.add(form)
      ElMessage.success('添加成功')
    } else {
      await menuApi.update(form)
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
    fetchMenus()
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该菜单项吗？', '删除确认', { 
    type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消'
  }).then(async () => {
    await menuApi.delete(row.menuId)
    ElMessage.success('删除成功')
    fetchMenus()
  })
}

onMounted(fetchMenus)
</script>

<style scoped>
.admin-page { max-width: 1000px; margin: 0 auto; padding-bottom: 60px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
.header-text h1 { font-size: 28px; font-weight: 800; color: #111; margin-bottom: 4px; }
.header-text p { font-size: 15px; color: #666; margin: 0; }
.add-btn { border-radius: 8px; font-weight: 600; padding: 10px 20px; }

.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.toolbar-info { font-size: 14px; color: #64748b; font-weight: 500; }

.menu-list-container { 
  background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; 
  padding: 0 24px 24px;
}

.custom-tree-table :deep(.el-table__header th) {
  background: transparent; color: #6b7280; font-weight: 600;
  font-size: 13px; padding: 20px 0 12px; border-bottom: 1px solid #f3f4f6;
}

.custom-tree-table :deep(.el-table__row) { transition: background 0.2s; }
.custom-tree-table :deep(.el-table__row:hover) { background-color: #f9fafb !important; }
.custom-tree-table :deep(td.el-table__cell) { padding: 12px 0; border-bottom: 1px solid #f3f4f6; }

.task-content-cell { display: inline-flex; flex-direction: column; vertical-align: middle; gap: 4px; padding: 4px 0; }
.task-title-row { display: flex; align-items: center; gap: 8px; font-weight: 700; color: #1e293b; font-size: 15px; }
.task-meta-row { display: flex; align-items: center; gap: 12px; font-size: 11px; color: #64748b; margin-top: 2px; }

.type-icon { font-size: 16px; color: #6366f1; }

.type-label { 
  font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; 
  letter-spacing: 0.02em;
}
.type-m { background: #f1f5f9; color: #475569; } /* Dir */
.type-c { background: #e0f2fe; color: #0369a1; } /* Page */
.type-f { background: #fef3c7; color: #92400e; } /* Button */

.code-pill { background: #f8fafc; border: 1px solid #e2e8f0; padding: 1px 6px; border-radius: 4px; color: #475569; font-size: 11px; font-family: monospace; }
.path-text { font-size: 13px; color: #64748b; }
.empty-val { color: #cbd5e1; }

.drawer-footer { padding-top: 16px; border-top: 1px solid #eee; display: flex; justify-content: flex-end; gap: 12px; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.type-picker { margin-bottom: 8px; }
</style>
