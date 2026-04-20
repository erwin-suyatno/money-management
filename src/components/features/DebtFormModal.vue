<template>
  <AppModal :is-open="isOpen" @close="$emit('close')">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
          <CreditCard :size="20" />
        </div>
        <div>
          <h3 class="text-lg font-black dark:text-white">{{ isEdit ? $t('debts.update_title') : $t('debts.add_title') }}</h3>
          <p class="text-xs text-slate-500 font-medium">{{ $t('debts.modal_subtitle') }}</p>
        </div>
      </div>
    </template>

    <form @submit.prevent="handleSubmit" class="space-y-6 py-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Name -->
        <div class="md:col-span-2">
          <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{{ $t('debts.debt_name') }}</label>
          <input 
            v-model="form.name"
            type="text" 
            :placeholder="$t('debts.form_name_placeholder')"
            class="w-full bg-slate-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all"
            required
          />
        </div>

        <!-- Total Principal -->
        <div>
          <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{{ $t('debts.principal') }}</label>
          <div class="relative">
            <span class="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">Rp</span>
            <input 
              v-model="form.total_principal"
              type="number" 
              class="w-full bg-slate-50 dark:bg-gray-900 border-none rounded-2xl pl-12 pr-5 py-4 text-sm font-black focus:ring-2 focus:ring-primary-500 transition-all"
              required
            />
          </div>
        </div>

        <!-- Monthly Payment -->
        <div>
          <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{{ $t('debts.installment') }}</label>
          <div class="relative">
            <span class="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">Rp</span>
            <input 
              v-model="form.monthly_payment"
              type="number" 
              class="w-full bg-slate-50 dark:bg-gray-900 border-none rounded-2xl pl-12 pr-5 py-4 text-sm font-black focus:ring-2 focus:ring-primary-500 transition-all"
              required
            />
          </div>
        </div>

        <!-- Tenure -->
        <div>
          <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{{ $t('debts.tenure') }} ({{ $t('debts.months_label') }})</label>
          <div class="relative">
            <input 
              v-model="form.tenure_months"
              type="number" 
              class="w-full bg-slate-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm font-black focus:ring-2 focus:ring-primary-500 transition-all"
              required
            />
            <span class="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">{{ $t('debts.months_label') }}</span>
          </div>
        </div>

        <!-- Start Date -->
        <div>
          <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{{ $t('debts.start_date') }}</label>
          <input 
            v-model="form.start_date"
            type="date" 
            class="w-full bg-slate-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all"
            required
          />
        </div>

        <!-- Category -->
        <div class="md:col-span-2">
           <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{{ $t('transactions.form_category') }}</label>
           <select 
             v-model="form.category_id"
             class="w-full bg-slate-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all appearance-none"
           >
             <option :value="null">{{ $t('debts.select_category_optional') }}</option>
             <option v-for="cat in categoryStore.categories" :key="cat.id" :value="cat.id">
               {{ cat.name }}
             </option>
           </select>
        </div>
      </div>

      <div class="flex gap-3 pt-4">
        <AppButton type="button" variant="secondary" class="flex-1" @click="$emit('close')">{{ $t('common.cancel') }}</AppButton>
        <AppButton type="submit" variant="primary" class="flex-1" :loading="debtStore.loading">
          {{ isEdit ? $t('debts.save_btn') : $t('debts.add_btn') }}
        </AppButton>
      </div>
    </form>
  </AppModal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { CreditCard } from 'lucide-vue-next'
import { useDebtStore } from '../../stores/useDebtStore'
import { useCategoryStore } from '../../stores/useCategoryStore'
import AppModal from '../ui/AppModal.vue'
import AppButton from '../ui/AppButton.vue'

const props = defineProps({
  isOpen: Boolean,
  initialData: Object
})

const emit = defineEmits(['close', 'success'])

const debtStore = useDebtStore()
const categoryStore = useCategoryStore()

const isEdit = computed(() => !!props.initialData)

const form = ref({
  name: '',
  total_principal: 0,
  monthly_payment: 0,
  tenure_months: 12,
  start_date: new Date().toISOString().split('T')[0],
  category_id: null,
  status: 'ACTIVE'
})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.initialData) {
      form.value = { ...props.initialData }
    } else {
      resetForm()
    }
  }
})

const resetForm = () => {
  form.value = {
    name: '',
    total_principal: 0,
    monthly_payment: 0,
    tenure_months: 12,
    start_date: new Date().toISOString().split('T')[0],
    category_id: null,
    status: 'ACTIVE'
  }
}

const handleSubmit = async () => {
  let result
  if (isEdit.value) {
    result = await debtStore.updateDebt(props.initialData.id, form.value)
  } else {
    result = await debtStore.addDebt(form.value)
  }

  if (result) {
    emit('success')
    emit('close')
  }
}
</script>
