export function useCurrency() {
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) {
      return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(0)
    }
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  return {
    currency: formatCurrency
  }
}
