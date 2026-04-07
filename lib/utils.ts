import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | null) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('de-DE').format(new Date(date))
}

export function formatCurrency(value: number | string | null) {
  if (value === null || value === undefined || value === '') return '—'

  const numericValue =
    typeof value === 'string' ? Number(value.replace(',', '.')) : value

  if (Number.isNaN(numericValue)) return '—'

  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(numericValue)
}