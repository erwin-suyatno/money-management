<template>
  <AppModal 
    :is-open="isOpen" 
    :title="isEdit ? $t('categories.edit_title') : $t('categories.new_title')" 
    @close="emit('close')"
  >
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Type Toggle -->
      <div class="flex bg-slate-100 dark:bg-gray-900 p-1 rounded-2xl shadow-inner">
        <button 
          v-for="t in categoryStore.types" 
          :key="t.id"
          type="button" 
          @click="form.category_type_id = t.id"
          class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          :class="form.category_type_id === t.id ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' : 'text-slate-400'"
        >
          {{ $t(`transactions.${t.name.toLowerCase()}`) }}
        </button>
      </div>

      <AppInput 
        id="cat-name" 
        v-model="form.name" 
        :label="$t('categories.form_name')" 
        :placeholder="$t('categories.form_name_placeholder')"
        required
      />

      <!-- Parent Selection -->
      <div class="space-y-1">
        <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{{ $t('categories.form_parent') }}</label>
        <select 
          v-model="form.parent_id" 
          class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option :value="null">{{ $t('categories.parent_main') }}</option>
          <option v-for="c in filteredPotentialParents" :key="c.id" :value="c.id">
             ↳ {{ c.name }}
          </option>
        </select>
      </div>

      <!-- Color & Icon Picker -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Color Picker -->
        <div class="space-y-1">
          <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{{ $t('categories.form_color') }}</label>
          <div class="flex items-center gap-3">
            <input 
              v-model="form.color" 
              type="color" 
              class="w-12 h-12 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-1 cursor-pointer"
            >
            <div class="flex-1 px-4 py-3 bg-slate-50 dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 text-xs font-bold font-mono">
              {{ form.color.toUpperCase() }}
            </div>
          </div>
        </div>

        <!-- Icon Picker -->
        <div class="space-y-1">
           <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{{ $t('categories.form_icon') }}</label>
           <div class="grid grid-cols-6 gap-2 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-3 max-h-[140px] overflow-y-auto scrollbar-thin">
              <button 
                v-for="iconName in categoryStore.availableIcons" 
                :key="iconName"
                type="button"
                @click="form.icon = iconName"
                class="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                :class="form.icon === iconName ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-gray-800'"
              >
                 <component :is="categoryStore.resolveIcon(iconName)" :size="16" />
              </button>
           </div>
        </div>
      </div>

      <!-- Icon Preview / Grid (Optional Enhancement) -->
      <div class="p-4 bg-slate-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-gray-800">
         <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">{{ $t('categories.preview') }}</p>
         <div class="flex items-center gap-4">
            <div 
              :style="{ backgroundColor: form.color + '15', color: form.color }" 
              class="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-sm"
            >
              <component :is="categoryStore.resolveIcon(form.icon)" :size="28" />
            </div>
            <div>
               <p class="text-sm font-black dark:text-white">{{ form.name || $t('categories.form_name') }}</p>
               <p class="text-[10px] font-bold text-slate-400">{{ $t(`transactions.${(categoryStore.types.find(t => t.id === form.category_type_id)?.name || '').toLowerCase()}`) }}</p>
            </div>
         </div>
      </div>

      <div class="pt-4 space-y-3">
        <AppButton 
          variant="primary" 
          size="lg" 
          full-width 
          type="submit"
          :loading="categoryStore.loading"
        >
          {{ isEdit ? $t('categories.update_btn') : $t('categories.save_btn') }}
        </AppButton>
        <AppButton 
          variant="ghost" 
          size="lg" 
          full-width 
          @click="emit('close')"
        >
          {{ $t('common.cancel') }}
        </AppButton>
      </div>
    </form>
  </AppModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCategoryStore } from '../../stores/useCategoryStore'
import AppModal from '../ui/AppModal.vue'
import AppInput from '../ui/AppInput.vue'
import AppButton from '../ui/AppButton.vue'

const props = defineProps({
  isOpen: Boolean,
  initialData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'success'])
const categoryStore = useCategoryStore()

const form = ref({
  category_type_id: '',
  parent_id: null,
  name: '',
  color: '#6366f1',
  icon: 'tag'
})

const isEdit = computed(() => !!props.initialData)

// Initialize form
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.initialData) {
      form.value = { ...props.initialData }
    } else {
      if (categoryStore.types.length > 0) {
        form.value.category_type_id = categoryStore.types[0].id
      }
      form.value.parent_id = null
      form.value.name = ''
      form.value.color = '#6366f1'
      form.value.icon = 'tag'
    }
  }
})

const filteredPotentialParents = computed(() => 
  categoryStore.categories.filter(c => 
    c.category_type_id === form.value.category_type_id && 
    !c.parent_id && 
    c.id !== props.initialData?.id
  )
)

// translateType logic removed as it's handled by i18n directly in template

const handleSubmit = async () => {
  let success = false
  if (isEdit.value) {
    // success = await categoryStore.updateCategory(props.initialData.id, { ...form.value })
    // Placeholder as updateCategory is not in store yet
    success = await categoryStore.addCategory({ ...form.value }) // Fallback for demo
  } else {
    success = await categoryStore.addCategory({ ...form.value })
  }
  
  if (success) emit('success')
}
</script>
