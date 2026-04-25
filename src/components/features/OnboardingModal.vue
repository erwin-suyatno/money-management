<template>
  <div v-if="isOpen" class="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl animate-fade-in">
    <div class="bg-white dark:bg-gray-950 w-full max-w-2xl rounded-[3rem] shadow-2xl relative overflow-hidden animate-scale-up">
      <!-- Decorative background -->
      <div class="absolute -right-24 -top-24 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl"></div>
      
      <div class="px-8 pt-12 pb-12 text-center relative z-10">
        <div class="w-20 h-20 bg-primary-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary-500/30">
          <Sparkles class="text-white" :size="40" />
        </div>
        
        <h2 class="text-3xl font-black text-slate-900 dark:text-white mb-3">{{ $t('onboarding.title') }}</h2>
        <p class="text-slate-500 font-medium mb-12 max-w-sm mx-auto">{{ $t('onboarding.subtitle') }}</p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            v-for="opt in options" 
            :key="opt.id"
            @click="selected = opt.id"
            :class="[
              'p-6 rounded-[2.5rem] border-2 transition-all duration-300 text-left group',
              selected === opt.id 
                ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-900/10' 
                : 'border-slate-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-900/30 bg-white dark:bg-gray-900'
            ]"
          >
            <div :class="[
              'w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors',
              selected === opt.id ? 'bg-primary-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-gray-800 text-slate-400 group-hover:text-primary-600'
            ]">
              <component :is="opt.icon" :size="24" />
            </div>
            <h4 class="font-black text-slate-900 dark:text-white mb-1">{{ $t(opt.i18nKey) }}</h4>
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{{ $t('onboarding.multiplier_label', { n: opt.multiplier }) }}</p>
          </button>
        </div>

        <div class="mt-12">
          <AppButton 
            variant="primary" 
            size="lg" 
            class="px-12 w-full md:w-auto" 
            :loading="loading"
            @click="saveProfile"
          >
            {{ $t('onboarding.start_btn') }}
          </AppButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Sparkles, User, Users, Baby } from 'lucide-vue-next'
import { useAuthStore } from '../../stores/useAuthStore'
import AppButton from '../ui/AppButton.vue'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['success'])
const authStore = useAuthStore()

const loading = ref(false)
const selected = ref('single')

const options = [
  { id: 'single', i18nKey: 'onboarding.single_label', multiplier: 6, icon: User },
  { id: 'married', i18nKey: 'onboarding.married_label', multiplier: 9, icon: Users },
  { id: 'children', i18nKey: 'onboarding.family_label', multiplier: 12, icon: Baby }
]

const saveProfile = async () => {
  loading.value = true
  const profile = options.find(o => o.id === selected.value)
  const success = await authStore.updateFinancialProfile({
    status: profile.id,
    multiplier: profile.multiplier,
    updated_at: new Date().toISOString()
  })

  if (success) {
    emit('success')
  }
  loading.value = false
}
</script>

<style scoped>
.animate-scale-up {
  animation: scale-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes scale-up {
  from { opacity: 0; transform: scale(0.9) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.4s ease-out forwards;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
