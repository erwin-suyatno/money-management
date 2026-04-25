<template>
  <div class="space-y-3">
    <!-- Main Card -->
    <AppCard 
      class="relative border-l-4 group"
      :style="{ borderLeftColor: category.color }"
    >
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div 
            :style="{ backgroundColor: category.color + '15', color: category.color }" 
            class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
          >
            <component :is="categoryStore.resolveIcon(category.icon)" :size="24" />
          </div>
          <h4 class="font-black text-slate-900 dark:text-white truncate max-w-[140px]">{{ category.name }}</h4>
        </div>
        
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span v-if="!category.user_id" class="text-[8px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-gray-800 px-2 py-1 rounded-full">Sistem</span>
          <div v-if="category.user_id" class="flex gap-1">
             <button @click.stop="emit('edit', category)" class="text-slate-400 hover:text-primary-600 p-2">
                <Pencil :size="14" />
             </button>
             <button @click.stop="emit('delete', category)" class="text-slate-400 hover:text-rose-600 p-2">
                <Trash2 :size="16" />
             </button>
          </div>
        </div>
      </div>
    </AppCard>

    <!-- Subcategories Slot -->
    <div v-if="$slots.subcategories" class="pl-4 space-y-2">
       <slot name="subcategories"></slot>
    </div>
  </div>
</template>

<script setup>
import { useCategoryStore } from '../../stores/useCategoryStore'
import { Pencil, Trash2 } from 'lucide-vue-next'
import AppCard from '../ui/AppCard.vue'

const props = defineProps({
  category: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete'])
const categoryStore = useCategoryStore()
</script>
