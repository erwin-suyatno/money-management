<template>
  <div class="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
    <!-- Visual Circle -->
    <div class="relative mb-12">
      <div class="absolute inset-0 bg-indigo-500/10 blur-[80px] rounded-full scale-150 animate-pulse"></div>
      <div class="w-32 h-32 sm:w-48 sm:h-48 bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl flex items-center justify-center relative z-10 border border-slate-100 dark:border-gray-700/50">
        <span class="text-5xl sm:text-7xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">{{ errorCode }}</span>
      </div>
    </div>

    <!-- Text Content -->
    <div class="max-w-md">
      <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{{ errorTitle }}</h2>
      <p class="text-slate-500 dark:text-slate-400 font-medium mb-12 leading-relaxed">
        {{ errorMessage }}
      </p>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <router-link to="/" class="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition active:scale-[0.98]">
           {{ $t('errors.btn_home') }}
        </router-link>
        <button @click="goBack" class="w-full sm:w-auto px-10 py-5 bg-slate-50 dark:bg-gray-800 text-slate-600 dark:text-slate-200 rounded-[2rem] font-bold hover:bg-slate-100 dark:hover:bg-gray-750 transition transition active:scale-[0.98]">
           {{ $t('errors.btn_back') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

// Default to 404 if no code is provided
const errorCode = computed(() => route.params.code || route.meta.code || '404')

const errorDetails = computed(() => ({
  '404': {
    title: t('errors.404.title'),
    message: t('errors.404.message')
  },
  '401': {
    title: t('errors.401.title'),
    message: t('errors.401.message')
  },
  '500': {
    title: t('errors.500.title'),
    message: t('errors.500.message')
  }
}))

const errorTitle = computed(() => errorDetails.value[errorCode.value]?.title || t('errors.default_title'))
const errorMessage = computed(() => errorDetails.value[errorCode.value]?.message || t('errors.default_message'))

const goBack = () => {
  router.back()
}
</script>
