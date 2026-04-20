<template>
  <AppModal 
    :is-open="isOpen" 
    :title="isEdit ? $t('budgets.edit') : $t('budgets.new_title')" 
    @close="emit('close')"
  >
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Category Selection -->
      <div class="space-y-1">
        <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{{ $t('budgets.form_category') }}</label>
        <select 
          v-model="form.category_id" 
          required
          class="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="" disabled>{{ $t('budgets.select_category') }}</option>
          <option v-for="c in categoryStore.expenseCategories" :key="c.id" :value="c.id">
            {{ c.name }}
          </option>
        </select>
      </div>

      <!-- Amount -->
      <AppInput 
        id="budget-amount" 
        v-model.number="form.amount" 
        :label="$t('budgets.form_amount')" 
        type="number"
        placeholder="Rp 0"
        required
      >
        <template #prefix><span class="text-xs font-black text-slate-400">Rp</span></template>
      </AppInput>

      <!-- Period Selection -->
      <div class="space-y-1">
        <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{{ $t('budgets.form_period') }}</label>
        <div class="grid grid-cols-2 gap-3">
          <button 
            v-for="p in periods" 
            :key="p.value"
            type="button"
            @click="form.period_type = p.value"
            class="py-3 px-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all"
            :class="form.period_type === p.value ? 'bg-primary-600 border-primary-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-gray-800 text-slate-400'"
          >
            {{ $t(p.i18n) }}
          </button>
        </div>
      </div>

      <div class="pt-4 space-y-3">
        <AppButton 
          variant="primary" 
          size="lg" 
          full-width 
          type="submit"
          :loading="budgetStore.loading"
        >
          {{ isEdit ? $t('budgets.update_btn') : $t('budgets.save_btn') }}
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
import { useBudgetStore } from '../../stores/useBudgetStore'
import { useCategoryStore } from '../../stores/useCategoryStore'
import AppModal from '../ui/AppModal.vue'
import AppInput from '../ui/AppInput.vue'
import AppButton from '../ui/AppButton.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  isOpen: Boolean,
  initialData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'success'])
const budgetStore = useBudgetStore()
const categoryStore = useCategoryStore()

const periods = [
  { i18n: 'budgets.period_daily', value: 'DAILY' },
  { i18n: 'budgets.period_weekly', value: 'WEEKLY' },
  { i18n: 'budgets.period_monthly', value: 'MONTHLY' },
  { i18n: 'budgets.period_yearly', value: 'YEARLY' }
]

const form = ref({
  category_id: '',
  amount: null,
  period_type: 'MONTHLY',
  start_date: new Date().toISOString().split('T')[0]
})

const isEdit = computed(() => !!props.initialData)

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.initialData) {
      form.value = { 
        category_id: props.initialData.category_id,
        amount: props.initialData.amount,
        period_type: props.initialData.period_type,
        start_date: props.initialData.start_date
      }
    } else {
      form.value = {
        category_id: '',
        amount: null,
        period_type: 'MONTHLY',
        start_date: new Date().toISOString().split('T')[0]
      }
    }
  }
})

const handleSubmit = async () => {
  let success
  if (isEdit.value) {
    success = await budgetStore.updateBudget(props.initialData.id, { ...form.value })
  } else {
    success = await budgetStore.addBudget({ ...form.value })
  }
  
  if (success) {
    emit('success')
  } else {
    alert(t('budgets.save_error') + ' ' + (budgetStore.error || ''))
  }
}
</script>
