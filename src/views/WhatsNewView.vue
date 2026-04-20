<template>
  <AppShell
    :is-authenticated="!!authStore.session"
    :user-name="authStore.user?.user_metadata?.full_name || 'User'"
    :user-email="authStore.user?.email"
    page-title="Apa yang Baru?"
    @logout="handleLogout"
  >
    <div class="max-w-4xl mx-auto py-8">
      <!-- Header -->
      <div class="text-center mb-16 animate-slide-up">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
           <Zap :size="14" class="fill-current" />
           Versi Terbaru v1.2.0
        </div>
        <h1 class="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
          Menuju Keunggulan Finansial.
        </h1>
        <p class="text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
          Kami terus berevolusi. Berikut adalah pembaruan fitur terbaru yang dirancang untuk membantu Anda menguasai uang Anda dengan lebih cerdas.
        </p>
      </div>

      <!-- Feature Updates Timeline -->
      <div class="space-y-12">
        <div v-for="(update, idx) in updates" :key="idx" 
             class="relative pl-12 pb-12 last:pb-0 border-l-2 border-slate-100 dark:border-gray-800 animate-slide-up"
             :style="{ animationDelay: `${(idx + 1) * 150}ms` }"
        >
          <!-- Timeline Node -->
          <div class="absolute -left-[11px] top-0 w-5 h-5 rounded-full border-4 border-white dark:border-gray-950 bg-primary-600 shadow-lg shadow-primary-500/40"></div>
          
          <div class="group">
             <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                   <h3 class="text-2xl font-black text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{{ update.title }}</h3>
                   <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ update.date }}</span>
                </div>
                <div class="flex gap-2">
                   <span v-for="tag in update.tags" :key="tag" 
                         class="px-3 py-1 bg-slate-100 dark:bg-gray-800 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest">
                      {{ tag }}
                   </span>
                </div>
             </div>

             <AppCard class="border-slate-100 dark:border-gray-800 shadow-xl shadow-slate-200/50 dark:shadow-none !p-8 group-hover:border-primary-100 dark:group-hover:border-primary-900/50 transition-all duration-300">
                <div class="flex flex-col md:flex-row gap-8 items-center">
                   <div :class="update.colorClass" class="w-20 h-20 rounded-[2rem] flex items-center justify-center shrink-0 shadow-inner">
                      <component :is="update.icon" :size="36" />
                   </div>
                   <div class="flex-1">
                      <p class="text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                        {{ update.description }}
                      </p>
                      <ul class="grid grid-cols-1 md:grid-cols-2 gap-3">
                         <li v-for="item in update.highlights" :key="item" class="flex items-center gap-3 text-sm font-bold text-slate-900 dark:text-white">
                            <div class="w-2 h-2 rounded-full bg-primary-500"></div>
                            {{ item }}
                         </li>
                      </ul>
                   </div>
                </div>
             </AppCard>
          </div>
        </div>
      </div>

      <!-- Footer Action -->
      <div class="mt-24 text-center pb-20">
         <p class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Siap untuk mencoba?</p>
         <div class="flex items-center justify-center gap-4">
            <AppButton variant="primary" size="lg" @click="router.push('/dashboard')" class="px-10">Ke Dashboard</AppButton>
            <AppButton variant="secondary" size="lg" @click="router.push('/budget')" class="px-10">Lihat Anggaran</AppButton>
         </div>
      </div>
    </div>
  </AppShell>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { 
  Zap, 
  PieChart, 
  MousePointer2, 
  Layers, 
  LayoutGrid, 
  Sparkles 
} from 'lucide-vue-next'
import { useAuthStore } from '../stores/useAuthStore'
import AppShell from '../components/layout/AppShell.vue'
import AppCard from '../components/ui/AppCard.vue'
import AppButton from '../components/ui/AppButton.vue'

const authStore = useAuthStore()
const router = useRouter()

const updates = [
  {
    title: 'Revamp UI & Antarmuka Premium',
    date: '19 April 2026',
    icon: Sparkles,
    tags: ['Visual', 'UX'],
    colorClass: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20',
    description: 'Kami telah merombak seluruh antarmuka aplikasi dengan estetika modern yang lebih bersih, menggunakan teknik Glassmorphism dan sistem warna kontras tinggi.',
    highlights: [
      'Glassmorphism & Soft Shadows',
      'High-Contrast Light Mode',
      'Premium Typography System',
      'Smooth Micro-animations'
    ]
  },
  {
    title: 'Sistem Anggaran (Budgeting)',
    date: '19 April 2026',
    icon: PieChart,
    tags: ['Fitur Utama', 'Analitik'],
    colorClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20',
    description: 'Kontrol finansial kini di tangan Anda. Tetapkan batas pengeluaran harian, mingguan, atau bulanan per kategori untuk menghindari pemborosan.',
    highlights: [
      'Visual Progress Bar Dinamis',
      'Alert Sistem Kesehatan Dana',
      'Multi-Period Selection',
      'Analitik Sisa Budget'
    ]
  },
  {
    title: 'Visual Icon Selector',
    date: '19 April 2026',
    icon: MousePointer2,
    tags: ['UI/UX', 'Pembaruan'],
    colorClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20',
    description: 'Pengaturan kategori kini lebih visual. Pilih dari puluhan ikon profesional langsung dari antarmuka pemilih ikon baru.',
    highlights: [
      'Live Preview Ikon',
      'Grid Selection Terintegrasi',
      'Hex Color Display',
      'Dukungan Lucide Icons'
    ]
  },
  {
    title: 'Arsitektur Komponen Modular',
    date: '18 April 2026',
    icon: Layers,
    tags: ['Performa', 'Teknis'],
    colorClass: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20',
    description: 'Kami menulis ulang struktur kategori untuk performa yang lebih cepat dan pemeliharaan kode yang lebih baik.',
    highlights: [
      'Komponen Base Terfragmentasi',
      'Lazy Loading Optimization',
      'State Management Lebih Bersih',
      'Fluid Interaction'
    ]
  }
]

const handleLogout = async () => { await authStore.logout(); router.push('/login') }
</script>

<style scoped>
.animate-slide-up {
  animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
