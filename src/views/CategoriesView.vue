<template>
  <AppShell
    :is-authenticated="!!authStore.session"
    :user-name="authStore.user?.user_metadata?.full_name || 'User'"
    :user-email="authStore.user?.email"
    :page-title="$t('categories.title')"
    @logout="handleLogout"
  >
    <!-- Header Area -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-10 px-1 md:px-0">
      <div class="animate-slide-up">
        <h2 class="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
          {{ $t('categories.title') }}
        </h2>
        <p class="text-xs md:text-sm text-slate-500 font-medium whitespace-nowrap">{{ $t('categories.subtitle') }}</p>
      </div>

      <AppButton 
        variant="primary" 
        size="md" 
        class="w-full md:w-auto !rounded-2xl shadow-xl shadow-primary-500/20"
        @click="openCreateModal"
      >
        <template #prefix><Plus :size="18" /></template>
        <span>{{ $t('categories.add') }}</span>
      </AppButton>
    </div>

    <!-- Category Groups -->
    <div class="space-y-12">
      <template v-if="isLoading">
        <div v-for="i in 2" :key="i" class="space-y-6">
          <div class="flex items-center gap-4">
            <AppSkeleton width="180px" height="24px" />
            <div class="h-px bg-slate-100 dark:bg-gray-800 flex-1"></div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
             <AppSkeleton v-for="j in 3" :key="j" height="80px" variant="rect" />
          </div>
        </div>
      </template>

      <div v-else v-for="type in groupedCategories" :key="type.code" class="animate-slide-up">
        <!-- Group Header -->
        <div class="flex items-center gap-4 mb-6">
          <div class="flex items-center gap-3">
            <div class="w-1.5 h-6 bg-primary-600 rounded-full"></div>
            <h3 class="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">{{ translateType(type.name) }}</h3>
          </div>
          <div class="h-px bg-slate-100 dark:bg-gray-800 flex-1"></div>
        </div>

        <!-- Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CategoryItem 
            v-for="cat in type.parents" :key="cat.id" 
            :category="cat"
            @delete="confirmDelete"
            @edit="handleEdit"
          >
            <template #subcategories v-if="type.subsByParent[cat.id]">
              <SubcategoryItem 
                v-for="sub in type.subsByParent[cat.id]" 
                :key="sub.id" 
                :category="sub"
                @delete="confirmDelete"
                @edit="handleEdit"
              />
            </template>
          </CategoryItem>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <CategoryFormModal 
      :is-open="showModal"
      :initial-data="editingCategory"
      @close="closeModal"
      @success="handleSuccess"
    />
  </AppShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Plus
} from 'lucide-vue-next'

import { useAuthStore } from '../stores/useAuthStore'
import { useCategoryStore } from '../stores/useCategoryStore'

import AppShell from '../components/layout/AppShell.vue'
import AppButton from '../components/ui/AppButton.vue'
import AppSkeleton from '../components/ui/AppSkeleton.vue'
import CategoryItem from '../components/features/CategoryItem.vue'
import SubcategoryItem from '../components/features/SubcategoryItem.vue'
import CategoryFormModal from '../components/features/CategoryFormModal.vue'

const isLoading = computed(() => categoryStore.loading)

const authStore = useAuthStore()
const categoryStore = useCategoryStore()
const router = useRouter()

const showModal = ref(false)
const editingCategory = ref(null)

onMounted(async () => {
  await categoryStore.fetchInitialData()
})

const groupedCategories = computed(() => {
  if (categoryStore.types.length === 0) return []
  return categoryStore.types.map(type => {
    const parents = categoryStore.categories.filter(c => c.category_type_id === type.id && !c.parent_id)
    const subsByParent = {}
    categoryStore.categories.forEach(c => {
       if (c.parent_id && c.category_type_id === type.id) {
          if (!subsByParent[c.parent_id]) subsByParent[c.parent_id] = []
          subsByParent[c.parent_id].push(c)
       }
    })
    return { ...type, parents, subsByParent }
  })
})

const translateType = (name) => {
  const key = name.toLowerCase()
  return t(`categories.${key}`) || name
}

const openCreateModal = () => {
  editingCategory.value = null
  showModal.value = true
}

const handleEdit = (cat) => {
  editingCategory.value = cat
  showModal.value = true
}

const handleSuccess = () => {
  showModal.value = false
  editingCategory.value = null
  categoryStore.fetchInitialData()
}

const closeModal = () => {
  showModal.value = false
  editingCategory.value = null
}

const confirmDelete = async (cat) => {
  if (confirm(t('categories.delete_confirm', { name: cat.name }))) {
    await categoryStore.deleteCategory(cat.id)
  }
}

const handleLogout = async () => { await authStore.logout(); router.push('/login') }

import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<style scoped>
.animate-slide-up {
  animation: slide-up 0.4s ease-out forwards;
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
