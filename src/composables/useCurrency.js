export function useCurrency() {
  const formatIDR = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      value = 0
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatRaw = (value) => {
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  return {
    formatIDR,
    formatRaw
  }
}
