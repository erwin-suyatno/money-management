export function useFormatDate() {
  const formatDate = (date, options = {}) => {
    const d = new Date(date)
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      ...options
    }).format(d)
  }

  const formatShort = (date) => {
    const d = new Date(date)
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short'
    }).format(d)
  }

  const getMonthName = (date) => {
    const d = new Date(date)
    return new Intl.DateTimeFormat('id-ID', {
      month: 'long'
    }).format(d)
  }

  return {
    formatDate,
    formatShort,
    getMonthName
  }
}
