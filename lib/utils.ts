import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return "0"
  return num.toLocaleString("en-US")
}

export function formatCurrency(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return "₱0.00"
  return `₱${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Convert ALL-CAPS product names to Title Case for display.
 * Leaves already mixed-case names unchanged.
 */
export function toDisplayName(name: string): string {
  if (!name) return name
  // If already has mixed case (not all uppercase), leave it
  if (name !== name.toUpperCase()) return name
  return name
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
}
