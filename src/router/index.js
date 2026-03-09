import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        component: () => import('@/views/HomePage.vue'),
        name: 'Home'
    },
    {
        path: '/books/:id',
        component: () => import('@/views/BookDetail.vue'),
        name: 'BookDetail'
    },
    {
        path: '/celebrities/:id',
        component: () => import('@/views/CelebrityDetail.vue'),
        name: 'CelebrityDetail'
    },
    {
        path: '/authors/:id',
        component: () => import('@/views/AuthorDetail.vue'),
        name: 'AuthorDetail'
    },
    {
        path: '/login',
        component: () => import('@/views/Login.vue'),
        name: 'Login'
    },
    {
        path: '/admin',
        component: () => import('@/views/admin/AdminLayout.vue'),
        redirect: '/admin/books',
        children: [
            {
                path: 'books',
                component: () => import('@/views/admin/AdminBooks.vue'),
                name: 'AdminBooks'
            },
            {
                path: 'authors',
                component: () => import('@/views/admin/AdminAuthors.vue'),
                name: 'AdminAuthors'
            },
            {
                path: 'celebrities',
                component: () => import('@/views/admin/AdminCelebrity.vue'),
                name: 'AdminCelebrity'
            },
            {
                path: 'recommendations',
                component: () => import('@/views/admin/AdminRecommendations.vue'),
                name: 'AdminRecommendations'
            },
            {
                path: 'import',
                component: () => import('@/views/admin/AdminImport.vue'),
                name: 'AdminImport'
            },
            {
                path: 'users',
                component: () => import('@/views/admin/AdminUsers.vue'),
                name: 'AdminUsers'
            },
            {
                path: 'roles',
                component: () => import('@/views/admin/AdminRoles.vue'),
                name: 'AdminRoles'
            },
            {
                path: 'menus',
                component: () => import('@/views/admin/AdminMenus.vue'),
                name: 'AdminMenus'
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Navigation guard to protect admin routes
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('admin_token')
    if (to.path.startsWith('/admin')) {
        if (token) {
            next()
        } else {
            next('/login')
        }
    } else {
        next()
    }
})

export default router
