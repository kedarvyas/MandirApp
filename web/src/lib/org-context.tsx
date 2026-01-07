'use client'

import { createContext, useContext, ReactNode } from 'react'
import type { Organization, Staff } from '@/types/database'

interface OrgContextValue {
  organization: Organization
  staff: Staff
}

const OrgContext = createContext<OrgContextValue | null>(null)

interface OrgProviderProps {
  children: ReactNode
  organization: Organization
  staff: Staff
}

export function OrgProvider({ children, organization, staff }: OrgProviderProps) {
  return (
    <OrgContext.Provider value={{ organization, staff }}>
      {children}
    </OrgContext.Provider>
  )
}

export function useOrganization() {
  const context = useContext(OrgContext)
  if (!context) {
    throw new Error('useOrganization must be used within an OrgProvider')
  }
  return context.organization
}

export function useStaff() {
  const context = useContext(OrgContext)
  if (!context) {
    throw new Error('useStaff must be used within an OrgProvider')
  }
  return context.staff
}
