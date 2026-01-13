'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { QuoteFormModal } from './QuoteFormModal'

interface GetQuoteButtonProps {
  size?: 'default' | 'lg'
  showArrow?: boolean
  className?: string
  variant?: 'default' | 'secondary'
  label?: string
}

export function GetQuoteButton({ size = 'lg', showArrow = true, className = '', variant = 'default', label = 'Get Quote' }: GetQuoteButtonProps) {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)

  const baseStyles = variant === 'default'
    ? 'bg-primary hover:bg-[#5D2850] hover:scale-105 hover:shadow-lg text-primary-foreground transition-all duration-200'
    : ''

  return (
    <>
      <Button
        size={size}
        onClick={() => setIsQuoteModalOpen(true)}
        className={`${baseStyles} ${className}`}
      >
        {label}
        {showArrow && <ArrowRight className="ml-2 h-5 w-5" />}
      </Button>
      <QuoteFormModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
      />
    </>
  )
}
