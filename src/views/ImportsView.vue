<template>
  <AppShell
    :is-authenticated="!!authStore.session"
    :user-name="authStore.user?.user_metadata?.full_name || 'User'"
    :user-email="authStore.user?.email"
    :page-title="$t('import.title')"
    @logout="handleLogout"
  >
    <!-- Header Area -->
    <div class="mb-8">
      <h2 class="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
        {{ $t('import.title') }}
      </h2>
      <p class="text-sm text-slate-500 font-medium">{{ $t('import.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <!-- Main Scanner Area -->
      <div class="lg:col-span-12">
        <div 
          class="drop-zone group"
          :class="{ 'is-loading': loading }"
          @dragover.prevent 
          @drop.prevent="handleDrop" 
          @click="$refs.fileInput.click()"
        >
          <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileSelect">
          
          <div class="relative z-10 flex flex-col items-center gap-8 py-16">
            <div class="w-24 h-24 bg-primary-50 dark:bg-primary-900/40 rounded-[2.5rem] flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform shadow-lg shadow-primary-500/10">
              <Camera :size="40" />
            </div>
            
            <div class="text-center">
              <h3 class="text-xl font-black dark:text-white mb-2">{{ $t('import.drop_zone') }}</h3>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">{{ $t('import.click_zone') }}</p>
            </div>

            <div v-if="selectedFile" class="px-6 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/40 animate-slide-up">
              {{ $t('import.file_label') }}: {{ selectedFile.name }}
            </div>

            <AppButton 
              v-if="selectedFile" 
              variant="primary" 
              size="lg" 
              @click.stop="processReceipt" 
              :loading="loading"
            >
              {{ loading ? $t('import.scanning') : $t('import.scan_btn') }}
            </AppButton>
          </div>

          <!-- Pulsing Background Overlay -->
          <div v-if="loading" class="absolute inset-0 bg-primary-600/5 animate-pulse"></div>
        </div>
      </div>

      <!-- Scan Result -->
      <div v-if="scanResult" class="lg:col-span-12 animate-slide-up">
        <AppCard class="border-t-4 border-emerald-500">
          <template #header>
            <h3 class="text-xs font-black uppercase tracking-widest text-slate-400">{{ $t('import.result') }}</h3>
          </template>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
            <div class="space-y-1">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ $t('import.merchant') }}</p>
              <p class="text-2xl font-black dark:text-white">{{ scanResult.merchant }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ $t('import.total_amount') }}</p>
              <p class="text-2xl font-black text-emerald-600 tabular-nums">{{ formatIDR(scanResult.amount) }}</p>
            </div>
            <div class="flex gap-3">
              <AppButton 
                variant="primary" 
                size="lg" 
                full-width
                @click="saveScan"
              >
                {{ $t('common.save') }}
              </AppButton>
              <AppButton 
                variant="ghost" 
                size="lg" 
                icon-only
                @click="scanResult = null; selectedFile = null"
              >
                <Trash2 :size="20" />
              </AppButton>
            </div>
          </div>
        </AppCard>
      </div>

      <!-- Info Section -->
      <div class="lg:col-span-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="info in infoCards" :key="info.title" class="flex items-start gap-4 p-6 bg-slate-50 dark:bg-gray-900/40 rounded-3xl">
            <div class="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-primary-600 shadow-sm">
              <component :is="info.icon" :size="20" />
            </div>
            <div>
              <h4 class="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white mb-1">{{ info.title }}</h4>
              <p class="text-[10px] font-medium text-slate-400 leading-relaxed">{{ info.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppShell>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Camera, Trash2, Zap, ShieldCheck, Layers } from 'lucide-vue-next'

import { useAuthStore } from '../stores/useAuthStore'
import { useCurrency } from '../composables/useCurrency'

import AppShell from '../components/layout/AppShell.vue'
import AppButton from '../components/ui/AppButton.vue'
import AppCard from '../components/ui/AppCard.vue'

const authStore = useAuthStore()
const router = useRouter()
const { formatIDR } = useCurrency()

const selectedFile = ref(null)
const loading = ref(false)
const scanResult = ref(null)
const fileInput = ref(null)

const infoCards = [
  { icon: Zap, title: 'Super Cepat', desc: 'AI mendeteksi total dan merchant dalam hitungan detik.' },
  { icon: ShieldCheck, title: 'Aman & Privat', desc: 'Data struk Anda diproses dengan enkripsi standar militer.' },
  { icon: Layers, title: 'Multi Format', desc: 'Mendukung foto langsung dari kamera HP atau upload file gambar.' }
]

const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (file) {
    selectedFile.value = file
    scanResult.value = null
  }
}

const handleDrop = (e) => {
  const file = e.dataTransfer.files[0]
  if (file) {
    selectedFile.value = file
    scanResult.value = null
  }
}

const processReceipt = () => {
  loading.value = true
  // Simulating AI processing
  setTimeout(() => {
    loading.value = false
    scanResult.value = { merchant: 'Minimart 88', amount: 56700 }
  }, 2500)
}

const saveScan = () => {
  alert('Fitur simpan otomatis akan segera hadir!')
  scanResult.value = null
  selectedFile.value = null
}

const handleLogout = async () => { await authStore.logout(); router.push('/login') }
</script>

<style scoped>
.drop-zone {
  position: relative;
  background-color: var(--color-surface);
  border: 4px dashed var(--color-border);
  border-radius: var(--radius-3xl);
  transition: all var(--transition-base);
  cursor: pointer;
  overflow: hidden;
}

.drop-zone:hover {
  border-color: var(--color-primary-500);
  background-color: rgba(var(--color-primary-500-rgb), 0.02);
}

.drop-zone.is-loading {
  pointer-events: none;
  opacity: 0.8;
}

.animate-slide-up {
  animation: slide-up 0.4s ease-out forwards;
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
