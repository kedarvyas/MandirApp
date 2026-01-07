/**
 * Shared constants used across the web application
 */

import type { MemberStatus, PaymentMethod } from '@/types/database'

// Member status display configuration
export const STATUS_COLORS: Record<MemberStatus, string> = {
  active: 'bg-green-100 text-green-700',
  pending_invite: 'bg-yellow-100 text-yellow-700',
  pending_registration: 'bg-blue-100 text-blue-700',
  inactive: 'bg-gray-100 text-gray-700',
}

export const STATUS_LABELS: Record<MemberStatus, string> = {
  active: 'Active',
  pending_invite: 'Pending Invite',
  pending_registration: 'Pending Registration',
  inactive: 'Inactive',
}

// Payment method display configuration
export const PAYMENT_METHOD_COLORS: Record<PaymentMethod, string> = {
  cash: 'bg-green-100 text-green-700',
  check: 'bg-blue-100 text-blue-700',
  card: 'bg-purple-100 text-purple-700',
  other: 'bg-gray-100 text-gray-700',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  check: 'Check',
  card: 'Card',
  other: 'Other',
}
