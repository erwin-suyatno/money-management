<template>
  <div v-if="isOpen" class="fixed inset-0 z-[1000] flex items-end justify-center sm:items-center p-0 sm:p-4">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      @click="close"
    ></div>

    <!-- Modal Content -->
    <div class="premium-card !p-0 relative z-10 flex h-auto max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[2.5rem] border-t-8 border-primary-600 shadow-2xl animate-slide-up sm:max-w-lg sm:rounded-[2.5rem]">
      <!-- Header -->
      <div class="sticky top-0 z-20 border-b border-slate-50 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-xl font-black dark:text-white tracking-tight">{{ $t('actions.title') }}</h3>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Explore all features</p>
          </div>
          <button @click="close" class="p-2 hover:bg-slate-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
            <X :size="24" class="text-slate-400" />
          </button>
        </div>
      </div>

      <!-- Menu Grid -->
      <div class="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-900">
        <!-- Workspace Switcher Section -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-4 px-2">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ $t('common.workspace') }}</span>
            <div class="flex gap-1">
              <div class="w-1 h-1 rounded-full bg-primary-600"></div>
              <div class="w-1 h-1 rounded-full bg-primary-200"></div>
            </div>
          </div>
          
          <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            <button 
              v-for="ws in authStore.workspaces" 
              :key="ws.id"
              @click="authStore.activeWorkspaceId = ws.id"
              class="flex-shrink-0 min-w-[140px] p-4 rounded-3xl border-2 transition-all duration-300 text-left"
              :class="authStore.activeWorkspaceId === ws.id 
                ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-900/10' 
                : 'border-slate-50 dark:border-gray-800 bg-white dark:bg-gray-900'"
            >
              <div class="flex flex-col gap-2">
                <div 
                  class="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black"
                  :class="authStore.activeWorkspaceId === ws.id ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-gray-800 text-slate-400'"
                >
                  {{ ws.name.charAt(0) }}
                </div>
                <div class="min-w-0">
                  <p class="text-[11px] font-black dark:text-white truncate">{{ ws.name }}</p>
                  <p class="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{{ ws.type }}</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4 pb-8">
          <router-link
            v-for="item in menuItems"
            :key="item.to"
            :to="item.to"
            class="group flex flex-col items-center gap-3 p-4 rounded-3xl transition-all duration-300 border border-transparent hover:border-primary-100 hover:bg-primary-50/50 dark:hover:bg-primary-900/10"
            @click="close"
          >
            <div :class="[item.color, 'w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform']">
              <component :is="item.icon" :size="24" />
            </div>
            <span class="text-[10px] font-black text-center text-slate-600 dark:text-slate-400 uppercase tracking-wider group-hover:text-primary-600 transition-colors">
              {{ $t(item.label) }}
            </span>
          </router-link>
        </div>

        <!-- Account Section -->
        <div class="mt-4 pt-6 border-t border-slate-50 dark:border-gray-800">
          <div class="flex items-center gap-4 p-4 bg-slate-50 dark:bg-gray-800/50 rounded-3xl mb-4">
            <AppAvatar :name="userName" size="md" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-black text-slate-900 dark:text-white truncate">{{ userName }}</p>
              <p class="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest">{{ userEmail }}</p>
            </div>
          </div>
          
          <button 
            @click="handleLogout"
            class="w-full flex items-center justify-center gap-3 p-4 rounded-2xl text-red-500 font-black uppercase tracking-widest text-[10px] hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <LogOut :size="18" />
            {{ $t('nav.signout') }}
          </button>
        </div>
      </div>

      <!-- Safe Area Spacer -->
      <div class="h-[env(safe-area-inset-bottom)] bg-white dark:bg-gray-900"></div>
    </div>
  </div>
</template>

<script setup>
import { 
  X, 
  Tag, 
  CreditCard, 
  LifeBuoy, 
  Sparkles, 
  ArrowLeftRight, 
  Settings,
  LogOut
} from 'lucide-vue-next'
import { useAuthStore } from '../../stores/useAuthStore'
import AppAvatar from '../ui/AppAvatar.vue'

const authStore = useAuthStore()

defineProps({
  isOpen: Boolean,
  userName: String,
  userEmail: String
})

const emit = defineEmits(['close', 'logout'])

const menuItems = [
  { to: '/category', label: 'nav.categories', icon: Tag, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' },
  { to: '/debt', label: 'nav.debt', icon: CreditCard, color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' },
  { to: '/emergency-fund', label: 'nav.emergency', icon: LifeBuoy, color: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20' },
  { to: '/transfer', label: 'nav.transfer', icon: ArrowLeftRight, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' },
  { to: '/whats-new', label: 'nav.news', icon: Sparkles, color: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20' },
  { to: '/settings', label: 'nav.settings', icon: Settings, color: 'bg-slate-50 text-slate-600 dark:bg-slate-900/20' },
]

const close = () => emit('close')
const handleLogout = () => {
  emit('logout')
  close()
}
</script>
