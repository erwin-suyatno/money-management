<template>
  <AppShell
    :is-authenticated="!!authStore.session"
    :user-name="userName"
    :user-email="authStore.user?.email"
    :page-title="$t('settings.title')"
    @logout="handleLogout"
  >
    <!-- Header Area -->
    <div class="mb-8 md:mb-10 animate-slide-up px-1 md:px-0">
      <h2 class="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
        {{ $t('settings.title') }}
      </h2>
      <p class="text-xs md:text-sm text-slate-500 font-medium">{{ $t('settings.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <!-- Left: Profile Summary -->
      <div class="lg:col-span-4 lg:sticky lg:top-24 h-fit space-y-6">
        <template v-if="isLoading">
           <AppCard class="py-10 space-y-6">
              <AppSkeleton variant="circle" width="120px" height="120px" class="mx-auto" />
              <div class="space-y-2"><AppSkeleton width="140px" height="20px" class="mx-auto" /><AppSkeleton width="100px" height="12px" class="mx-auto" /></div>
           </AppCard>
        </template>
        <AppCard v-else class="text-center py-10">
           <div class="relative inline-block mb-6">
              <AppAvatar 
                :name="userName" 
                size="xl" 
                class="mx-auto shadow-2xl shadow-primary-500/20"
              />
              <button class="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-xl shadow-lg hover:scale-110 transition-transform">
                <Camera :size="16" />
              </button>
           </div>
           
           <h3 class="text-xl font-black text-slate-900 dark:text-white italic">{{ userName }}</h3>
           <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{{ authStore.user?.email }}</p>
           
           <div class="mt-8 flex justify-center gap-2">
              <AppBadge variant="primary">{{ $t('settings.premium') }}</AppBadge>
              <AppBadge variant="success">{{ $t('settings.verified') }}</AppBadge>
           </div>
        </AppCard>
      </div>

      <!-- Right: Detailed Settings -->
      <div class="lg:col-span-8 space-y-10">
        <!-- Appearance -->
        <section class="space-y-6">
          <div class="flex items-center gap-3 px-2">
            <h3 class="text-xs font-black uppercase tracking-widest text-slate-400">{{ $t('settings.appearance') }}</h3>
            <div class="h-px bg-slate-100 dark:bg-gray-800 flex-1"></div>
          </div>

          <AppCard class="!p-0 overflow-hidden divide-y divide-slate-50 dark:divide-gray-800/50">
             <div class="p-6 flex items-center justify-between">
                <div class="flex items-center gap-4">
                   <div class="w-10 h-10 bg-slate-50 dark:bg-gray-900 rounded-xl flex items-center justify-center text-primary-600">
                      <Sun v-if="theme === 'light'" :size="20" />
                      <Moon v-else-if="theme === 'dark'" :size="20" />
                      <Monitor v-else :size="20" />
                   </div>
                   <div>
                      <p class="text-sm font-black text-slate-900 dark:text-white">{{ $t('settings.app_theme') }}</p>
                      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ $t('settings.theme_desc') }}</p>
                   </div>
                </div>
                <div class="flex bg-slate-100 dark:bg-gray-900 p-1 rounded-xl shadow-inner">
                   <button @click="setTheme('light')" :class="theme === 'light' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' : 'text-slate-400'" class="p-2 rounded-lg transition-all"><Sun :size="16" /></button>
                   <button @click="setTheme('dark')" :class="theme === 'dark' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' : 'text-slate-400'" class="p-2 rounded-lg transition-all"><Moon :size="16" /></button>
                   <button @click="setTheme('system')" :class="theme === 'system' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' : 'text-slate-400'" class="p-2 rounded-lg transition-all"><Monitor :size="16" /></button>
                </div>
             </div>

             <div class="p-6 flex items-center justify-between">
                <div class="flex items-center gap-4">
                   <div class="w-10 h-10 bg-slate-50 dark:bg-gray-900 rounded-xl flex items-center justify-center text-primary-600">
                      <Languages :size="20" />
                   </div>
                   <div>
                      <p class="text-sm font-black text-slate-900 dark:text-white">{{ $t('settings.language') }}</p>
                      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ $t('settings.lang_desc') }}</p>
                   </div>
                </div>
                <select 
                  v-model="$i18n.locale" 
                  class="bg-transparent border-none text-xs font-black uppercase tracking-widest text-primary-600 outline-none cursor-pointer"
                >
                   <option value="id">Indonesia</option>
                   <option value="en">English (US)</option>
                </select>
             </div>
          </AppCard>
        </section>

        <!-- Account -->
        <section class="space-y-6">
          <div class="flex items-center gap-3 px-2">
            <h3 class="text-xs font-black uppercase tracking-widest text-slate-400">{{ $t('settings.security') }}</h3>
            <div class="h-px bg-slate-100 dark:bg-gray-800 flex-1"></div>
          </div>

          <AppCard class="!p-0 overflow-hidden divide-y divide-slate-50 dark:divide-gray-800/50">
             <button class="w-full p-6 flex items-center justify-between hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all text-left group">
                <div class="flex items-center gap-4">
                   <div class="w-10 h-10 bg-slate-50 dark:bg-gray-900 rounded-xl flex items-center justify-center text-rose-500">
                      <ShieldX :size="20" />
                   </div>
                   <div>
                      <p class="text-sm font-black text-rose-600">{{ $t('settings.delete_account') }}</p>
                      <p class="text-[10px] font-bold text-rose-300 uppercase tracking-widest">{{ $t('settings.delete_desc') }}</p>
                   </div>
                </div>
                <Trash2 :size="16" class="text-rose-300" />
             </button>
          </AppCard>
        </section>
      </div>
    </div>
  </AppShell>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Camera, 
  Sun, 
  Moon, 
  Monitor, 
  Languages, 
  Trash2, 
  ShieldX, 
} from 'lucide-vue-next'

import { useAuthStore } from '../stores/useAuthStore'
import { useTheme } from '../composables/useTheme'

import AppShell from '../components/layout/AppShell.vue'
import AppCard from '../components/ui/AppCard.vue'
import AppAvatar from '../components/ui/AppAvatar.vue'
import AppBadge from '../components/ui/AppBadge.vue'
import AppSkeleton from '../components/ui/AppSkeleton.vue'

const authStore = useAuthStore()
const isLoading = ref(true)
import { onMounted } from 'vue'
onMounted(() => setTimeout(() => isLoading.value = false, 600))
const router = useRouter()
const { theme, setTheme } = useTheme()

const userName = computed(() => authStore.user?.user_metadata?.full_name || t('common.user'))

const handleLogout = async () => { await authStore.logout(); router.push('/login') }
</script>

<style scoped>
section {
  animation: slide-up 0.4s ease-out forwards;
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
