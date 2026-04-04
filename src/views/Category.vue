<template>
  <div class="max-w-6xl mx-auto p-4 sm:p-8 lg:p-12 pb-32">
    <!-- 1. Skeleton Loading -->
    <div v-if="categoryStore.loading && categoryStore.categories.length === 0" class="animate-in fade-in duration-500">
       <div class="mb-12 flex items-center justify-between">
          <div class="space-y-4">
             <Skeleton width="350px" height="60px" />
             <Skeleton width="200px" height="20px" />
          </div>
          <Skeleton width="180px" height="60px" variant="pill" />
       </div>
       <div class="space-y-16">
          <div v-for="i in 2" :key="i" class="space-y-8">
             <div class="flex items-center space-x-4">
                <Skeleton width="200px" height="40px" />
                <div class="flex-1 h-px bg-slate-100 dark:bg-gray-800"></div>
             </div>
             <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Skeleton v-for="j in 3" :key="j" height="180px" />
             </div>
          </div>
       </div>
    </div>

    <!-- 2. Actual Content -->
    <template v-else>
      <div class="mb-12 flex items-center justify-between">
        <div>
          <h1 class="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{{ $t('categories.title') }}</h1>
          <p class="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2 ml-1">V1.1.0 {{ $t('categories.subtitle') }}</p>
        </div>
        <button @click="openCreateModal" class="px-8 py-5 bg-indigo-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition active:scale-95 flex items-center space-x-3">
           <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
           <span class="hidden sm:inline">{{ $t('categories.add') }}</span>
        </button>
      </div>

      <!-- Error message -->
      <div v-if="categoryStore.error" class="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 rounded-3xl p-4 flex items-center text-red-700 dark:text-red-400">
        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <p class="text-sm font-bold">{{ categoryStore.error }}</p>
      </div>

      <!-- Grouped Sections -->
      <div class="space-y-20">
        <div v-for="type in groupedCategories" :key="type.code" class="animate-in slide-in-from-bottom-4 duration-500">
          <div class="flex items-center space-x-6 mb-10">
             <div class="flex items-center space-x-3">
                <div class="w-2 h-8 bg-indigo-600 rounded-full"></div>
                <h3 class="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{{ translateType(type.name) }}</h3>
             </div>
             <div class="h-px bg-slate-100 dark:bg-gray-800 flex-1"></div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             <div v-for="cat in type.parents" :key="cat.id" class="flex flex-col space-y-4">
                <!-- Parent Card -->
                <div class="premium-card p-6 border-l-8 group hover:border-indigo-500/30 transition-all flex flex-col justify-between"
                     :style="{ borderLeftColor: cat.color }">
                  <div class="flex items-start justify-between">
                    <div :style="{ backgroundColor: cat.color + '20', color: cat.color }" 
                         class="w-14 h-14 rounded-[1.5rem] flex items-center justify-center shadow-sm">
                       <component :is="cat.icon || 'Tag'" class="w-7 h-7" />
                    </div>
                    <div class="flex items-center space-x-2">
                       <span v-if="!cat.user_id" class="text-[7px] font-black uppercase tracking-widest text-slate-400 px-2 py-1 bg-slate-50 dark:bg-gray-900 rounded-full border border-slate-100 dark:border-gray-800">{{ $t('categories.system_tag') }}</span>
                       <div v-if="cat.user_id" class="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button @click="confirmDelete(cat)" class="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl text-slate-400 hover:text-rose-600">
                             <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          </button>
                       </div>
                    </div>
                  </div>
                  <div class="mt-8">
                    <h4 class="text-lg font-black text-slate-900 dark:text-white truncate">{{ cat.name }}</h4>
                  </div>
                </div>

                <!-- Sub-categories Loop -->
                <div v-if="type.subsByParent[cat.id]" class="pl-6 space-y-3">
                   <div v-for="sub in type.subsByParent[cat.id]" :key="sub.id" 
                        class="premium-card !p-4 border-l-4 group flex items-center justify-between"
                        :style="{ borderLeftColor: sub.color || cat.color }">
                      <div class="flex items-center space-x-3">
                         <div :style="{ color: sub.color || cat.color }" class="w-8 h-8 rounded-xl bg-slate-50 dark:bg-gray-800 flex items-center justify-center">
                            <component :is="sub.icon || 'CornerDownRight'" class="w-4 h-4" />
                         </div>
                         <span class="text-sm font-bold text-slate-600 dark:text-slate-300">{{ sub.name }}</span>
                      </div>
                      <button v-if="sub.user_id" @click="confirmDelete(sub)" class="p-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity">
                         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7h-2l-1-1H7l-1 1H4v2h16V7z"/></svg>
                      </button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!categoryStore.loading && categoryStore.categories.length === 0" class="py-24 text-center">
         <div class="inline-flex w-24 h-24 bg-slate-50 dark:bg-gray-900 rounded-[3rem] items-center justify-center text-slate-300 mb-8">
            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
         </div>
         <h3 class="text-xl font-black dark:text-white">{{ $t('categories.empty') }}</h3>
      </div>
    </template>

    <!-- Modals -->
    <div v-if="showModal" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
       <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md" @click="showModal = false"></div>
       <div class="premium-card !p-0 w-full max-w-lg relative z-10 animate-in fade-in zoom-in duration-300 overflow-hidden shadow-2xl border-t-8 border-indigo-600">
          <div class="p-8 border-b border-slate-50 dark:border-gray-800 flex items-center justify-between">
             <div>
                <h3 class="text-xl font-black dark:text-white tracking-tight">{{ $t('categories.modal_title') }}</h3>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{{ $t('categories.modal_setup') }}</p>
             </div>
             <button @click="showModal = false" class="p-3 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-2xl transition-all"><svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></svg></button>
          </div>
          
          <form @submit.prevent="handleSubmit" class="p-8 space-y-6">
             <div class="grid grid-cols-2 gap-3">
                <button v-for="t in categoryStore.types" :key="t.id"
                        type="button" @click="form.category_type_id = t.id"
                        :class="form.category_type_id === t.id ? 'bg-indigo-600 text-white shadow-xl' : 'bg-slate-50 dark:bg-gray-900 text-slate-400'"
                        class="py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all">
                   {{ translateType(t.name) }}
                </button>
             </div>

             <div class="grid grid-cols-1 gap-6">
                <div>
                   <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">{{ $t('categories.form_name') }}</label>
                   <input v-model="form.name" type="text" required :placeholder="t('categories.form_name')" class="w-full bg-slate-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500/20 rounded-3xl px-6 py-5 focus:ring-0 dark:text-white font-bold transition-all">
                </div>
                <div>
                   <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">{{ $t('categories.form_parent') }}</label>
                   <select v-model="form.parent_id" class="w-full bg-slate-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500/20 rounded-3xl px-6 py-5 focus:ring-0 dark:text-white font-bold appearance-none cursor-pointer">
                      <option :value="null">{{ $t('categories.form_top_level') }}</option>
                      <option v-for="c in filteredPotentialParents" :key="c.id" :value="c.id">
                         &nbsp;&nbsp;↳ {{ c.name }}
                      </option>
                   </select>
                </div>
                <div class="grid grid-cols-2 gap-6">
                   <div>
                      <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">{{ $t('categories.form_color') }}</label>
                      <input v-model="form.color" type="color" class="w-full h-16 bg-slate-50 dark:bg-gray-900 border-2 border-transparent rounded-3xl p-1 cursor-pointer">
                   </div>
                   <div>
                      <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">{{ $t('categories.form_icon') }}</label>
                      <input v-model="form.icon" type="text" :placeholder="$t('categories.form_icon_placeholder')" class="w-full bg-slate-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500/20 rounded-3xl px-6 py-5 focus:ring-0 dark:text-white font-bold text-center">
                   </div>
                </div>
             </div>

             <button type="submit" 
                     :disabled="categoryStore.loading" 
                     class="w-full py-6 bg-indigo-600 text-white rounded-[2.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center">
                {{ categoryStore.loading ? $t('common.loading') : $t('common.commit') }}
             </button>
          </form>
       </div>
    </div>
>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useCategoryStore } from '../stores/useCategoryStore'
import { useI18n } from 'vue-i18n'
import Skeleton from '../components/Skeleton.vue'

const { t } = useI18n()
const categoryStore = useCategoryStore()
const showModal = ref(false)
const form = ref({
  category_type_id: '',
  parent_id: null,
  name: '',
  color: '#6366f1',
  icon: 'Tag'
})

onMounted(async () => {
  await categoryStore.fetchInitialData()
  if (categoryStore.types.length > 0) form.value.category_type_id = categoryStore.types[0].id
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

const filteredPotentialParents = computed(() => categoryStore.categories.filter(c => c.category_type_id === form.value.category_type_id && !c.parent_id))

const translateType = (name) => {
  if (name === 'Income') return t('transactions.income')
  if (name === 'Expense') return t('transactions.expense')
  return name
}

const openCreateModal = () => {
  if (categoryStore.types.length > 0) form.value.category_type_id = categoryStore.types[0].id
  form.value.parent_id = null
  form.value.name = ''
  showModal.value = true
}

const handleSubmit = async () => {
  const success = await categoryStore.addCategory({ ...form.value })
  if (success) showModal.value = false
}

const confirmDelete = async (cat) => {
  if (confirm(t('categories.delete_confirm', { name: cat.name }))) {
    await categoryStore.deleteCategory(cat.id)
  }
}
</script>
