<template>
  <div 
    class="flex items-center justify-between p-3 bg-white dark:bg-gray-800/40 border border-slate-100 dark:border-gray-800 rounded-xl group transition-all hover:border-primary-500/30"
  >
    <div class="flex items-center gap-3">
      <CornerDownRight :size="14" class="text-slate-300" />
      <span class="text-xs font-bold text-slate-600 dark:text-slate-300">{{ category.name }}</span>
    </div>
    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
       <button 
         v-if="category.user_id" 
         @click.stop="emit('edit', category)" 
         class="text-slate-400 hover:text-primary-600 p-1"
       >
         <Pencil :size="12" />
       </button>
       <button 
         v-if="category.user_id" 
         @click.stop="emit('delete', category)" 
         class="text-slate-400 hover:text-rose-600 p-1"
       >
         <Trash2 :size="12" />
       </button>
    </div>
  </div>
</template>

<script setup>
import { CornerDownRight, Trash2, Pencil } from 'lucide-vue-next'

const props = defineProps({
  category: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete'])
</script>
