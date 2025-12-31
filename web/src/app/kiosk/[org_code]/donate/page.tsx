'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  CreditCard,
  Smartphone,
  CheckCircle2,
  ArrowLeft,
  DollarSign,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Organization, KioskSettings, DEFAULT_KIOSK_SETTINGS, KioskPaymentMethod } from '@/types/database'

type Step = 'loading' | 'disabled' | 'not_found' | 'amount' | 'payment' | 'processing' | 'success'

export default function DonationKioskPage() {
  const params = useParams()
  const orgCode = params.org_code as string

  const [step, setStep] = useState<Step>('loading')
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [kioskSettings, setKioskSettings] = useState<KioskSettings>(DEFAULT_KIOSK_SETTINGS)
  const [amount, setAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<KioskPaymentMethod | null>(null)

  const selectedAmount = amount || (customAmount ? parseFloat(customAmount) : 0)

  // Fetch organization on mount
  useEffect(() => {
    async function fetchOrganization() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .ilike('org_code', orgCode)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        setStep('not_found')
        return
      }

      setOrganization(data)

      const settings = (data.settings?.kiosk as KioskSettings) || DEFAULT_KIOSK_SETTINGS

      if (!settings.enabled) {
        setStep('disabled')
        return
      }

      setKioskSettings(settings)
      setStep('amount')
    }

    fetchOrganization()
  }, [orgCode])

  const handleAmountSelect = (value: number) => {
    setAmount(value)
    setCustomAmount('')
  }

  const handleCustomAmountChange = (value: string) => {
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setCustomAmount(value)
      setAmount(null)
    }
  }

  const handlePaymentSelect = async (method: KioskPaymentMethod) => {
    setPaymentMethod(method)
    setStep('processing')

    // Simulate payment processing
    // TODO: Integrate with actual payment provider (Stripe, etc.)
    await new Promise(resolve => setTimeout(resolve, 2000))

    setStep('success')
  }

  const handleReset = () => {
    setStep('amount')
    setAmount(null)
    setCustomAmount('')
    setPaymentMethod(null)
  }

  const handleSuccessComplete = () => {
    setTimeout(handleReset, 8000)
  }

  // Loading state
  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FDF8F5] via-[#F5E6DC] to-[#FDF8F5] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 rounded-full border-4 border-[#4A2040]/20 border-t-[#4A2040] mx-auto mb-4"
          />
          <p className="text-lg text-[#2D1A24]/70">Loading...</p>
        </div>
      </div>
    )
  }

  // Not found state
  if (step === 'not_found') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FDF8F5] via-[#F5E6DC] to-[#FDF8F5] flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-[#2D1A24] mb-4">
            Organization Not Found
          </h1>
          <p className="text-lg text-[#2D1A24]/70">
            The organization code &quot;{orgCode}&quot; was not found or is no longer active.
          </p>
        </div>
      </div>
    )
  }

  // Disabled state
  if (step === 'disabled') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FDF8F5] via-[#F5E6DC] to-[#FDF8F5] flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-[#2D1A24] mb-4">
            Kiosk Not Available
          </h1>
          <p className="text-lg text-[#2D1A24]/70">
            The donation kiosk for {organization?.name} is currently disabled.
            Please contact an administrator.
          </p>
        </div>
      </div>
    )
  }

  const primaryColor = organization?.primary_color || '#4A2040'

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDF8F5] via-[#F5E6DC] to-[#FDF8F5] flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {kioskSettings.show_org_logo && organization?.logo_url ? (
            <img
              src={organization.logo_url}
              alt={organization.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <span className="text-2xl text-white">॰</span>
            </div>
          )}
          <span className="text-2xl font-bold text-[#2D1A24]">
            {organization?.name || 'Sanctum'}
          </span>
        </div>
        {step !== 'amount' && step !== 'success' && (
          <button
            onClick={() => setStep('amount')}
            className="flex items-center gap-2 hover:opacity-80 transition-colors text-lg"
            style={{ color: primaryColor }}
          >
            <ArrowLeft className="w-6 h-6" />
            Back
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          {step === 'amount' && (
            <AmountStep
              key="amount"
              selectedAmount={selectedAmount}
              presetAmount={amount}
              customAmount={customAmount}
              kioskSettings={kioskSettings}
              primaryColor={primaryColor}
              onAmountSelect={handleAmountSelect}
              onCustomAmountChange={handleCustomAmountChange}
              onContinue={() => setStep('payment')}
            />
          )}

          {step === 'payment' && (
            <PaymentStep
              key="payment"
              amount={selectedAmount}
              kioskSettings={kioskSettings}
              primaryColor={primaryColor}
              onPaymentSelect={handlePaymentSelect}
            />
          )}

          {step === 'processing' && (
            <ProcessingStep key="processing" primaryColor={primaryColor} />
          )}

          {step === 'success' && (
            <SuccessStep
              key="success"
              amount={selectedAmount}
              thankYouMessage={kioskSettings.thank_you_message}
              primaryColor={primaryColor}
              onComplete={handleSuccessComplete}
              onNewDonation={handleReset}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-[#2D1A24]/50 text-sm">
        Secure donations powered by Sanctum
      </footer>
    </div>
  )
}

// Amount Selection Step
function AmountStep({
  selectedAmount,
  presetAmount,
  customAmount,
  kioskSettings,
  primaryColor,
  onAmountSelect,
  onCustomAmountChange,
  onContinue
}: {
  selectedAmount: number
  presetAmount: number | null
  customAmount: string
  kioskSettings: KioskSettings
  primaryColor: string
  onAmountSelect: (amount: number) => void
  onCustomAmountChange: (value: string) => void
  onContinue: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-4xl"
    >
      <div className="text-center mb-12">
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <Heart className="w-10 h-10" style={{ color: primaryColor }} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-[#2D1A24] mb-4">
          Make a Donation
        </h1>
        <p className="text-xl text-[#2D1A24]/70">
          Select an amount or enter a custom donation
        </p>
      </div>

      {/* Preset Amounts */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {kioskSettings.preset_amounts.map((value) => (
          <button
            key={value}
            onClick={() => onAmountSelect(value)}
            className="p-6 rounded-2xl text-2xl md:text-3xl font-bold transition-all duration-200"
            style={{
              backgroundColor: presetAmount === value ? primaryColor : 'white',
              color: presetAmount === value ? 'white' : '#2D1A24',
              border: `2px solid ${presetAmount === value ? primaryColor : `${primaryColor}30`}`,
              transform: presetAmount === value ? 'scale(1.05)' : 'scale(1)',
              boxShadow: presetAmount === value ? '0 10px 40px rgba(0,0,0,0.15)' : 'none'
            }}
          >
            ${value}
          </button>
        ))}
      </div>

      {/* Custom Amount */}
      {kioskSettings.custom_amount_enabled && (
        <div
          className="bg-white rounded-2xl p-6 mb-8"
          style={{ border: `2px solid ${primaryColor}30` }}
        >
          <label className="block text-lg text-[#2D1A24]/70 mb-3">
            Or enter custom amount
          </label>
          <div className="relative">
            <DollarSign
              className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8"
              style={{ color: primaryColor }}
            />
            <input
              type="text"
              inputMode="decimal"
              value={customAmount}
              onChange={(e) => onCustomAmountChange(e.target.value)}
              placeholder="0.00"
              className="w-full pl-14 pr-6 py-4 text-3xl font-bold text-[#2D1A24] bg-transparent border-none outline-none placeholder:text-[#2D1A24]/30"
            />
          </div>
        </div>
      )}

      {/* Continue Button */}
      <button
        onClick={onContinue}
        disabled={selectedAmount <= 0}
        className="w-full py-6 rounded-2xl text-2xl font-bold transition-all duration-200"
        style={{
          backgroundColor: selectedAmount > 0 ? primaryColor : `${primaryColor}30`,
          color: selectedAmount > 0 ? 'white' : `${primaryColor}60`,
          cursor: selectedAmount > 0 ? 'pointer' : 'not-allowed',
          boxShadow: selectedAmount > 0 ? '0 10px 40px rgba(0,0,0,0.15)' : 'none'
        }}
      >
        Continue with ${selectedAmount.toFixed(2)}
      </button>
    </motion.div>
  )
}

// Payment Method Step
function PaymentStep({
  amount,
  kioskSettings,
  primaryColor,
  onPaymentSelect
}: {
  amount: number
  kioskSettings: KioskSettings
  primaryColor: string
  onPaymentSelect: (method: KioskPaymentMethod) => void
}) {
  const paymentButtons: { method: KioskPaymentMethod; label: string; icon: React.ReactNode; style: string }[] = [
    {
      method: 'apple_pay',
      label: 'Apple Pay',
      icon: (
        <svg viewBox="0 0 24 24" className="w-10 h-10 fill-current">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
        </svg>
      ),
      style: 'bg-black text-white hover:bg-gray-900'
    },
    {
      method: 'google_pay',
      label: 'Google Pay',
      icon: (
        <svg viewBox="0 0 24 24" className="w-10 h-10">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      ),
      style: 'bg-white text-[#2D1A24] border-2 border-gray-200 hover:bg-gray-50'
    },
    {
      method: 'card',
      label: 'Credit / Debit Card',
      icon: <CreditCard className="w-10 h-10" style={{ color: primaryColor }} />,
      style: `bg-white text-[#2D1A24] border-2 hover:opacity-90`
    },
    {
      method: 'venmo',
      label: 'Venmo',
      icon: (
        <svg viewBox="0 0 24 24" className="w-10 h-10 fill-current">
          <path d="M19.5 3c.9 1.5 1.3 3 1.3 5 0 3.9-3.4 9-6.1 12.6H7.5L5 4.4l6.2-.6.9 7.3c1-1.7 2.2-4.3 2.2-6.1 0-1.2-.2-2-.5-2.7L19.5 3z"/>
        </svg>
      ),
      style: 'bg-[#008CFF] text-white hover:bg-[#0074D4]'
    }
  ]

  const enabledMethods = paymentButtons.filter(btn =>
    kioskSettings.payment_methods.includes(btn.method)
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-4xl"
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-[#2D1A24] mb-4">
          Choose Payment Method
        </h1>
        <p className="text-2xl font-semibold" style={{ color: primaryColor }}>
          Donating ${amount.toFixed(2)}
        </p>
      </div>

      <div className={`grid gap-6 ${enabledMethods.length <= 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
        {enabledMethods.map(({ method, label, icon, style }) => (
          <button
            key={method}
            onClick={() => onPaymentSelect(method)}
            className={`flex items-center justify-center gap-4 p-8 rounded-2xl text-2xl font-semibold transition-colors ${style}`}
            style={method === 'card' ? { borderColor: `${primaryColor}30` } : undefined}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>
    </motion.div>
  )
}

// Processing Step
function ProcessingStep({ primaryColor }: { primaryColor: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="text-center"
    >
      <div className="relative w-32 h-32 mx-auto mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-4"
          style={{ borderColor: `${primaryColor}30`, borderTopColor: primaryColor }}
        />
        <div
          className="absolute inset-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <Smartphone className="w-12 h-12" style={{ color: primaryColor }} />
        </div>
      </div>
      <h2 className="text-3xl font-bold text-[#2D1A24] mb-4">
        Processing Payment
      </h2>
      <p className="text-xl text-[#2D1A24]/70">
        Please wait while we process your donation...
      </p>
    </motion.div>
  )
}

// Success Step
function SuccessStep({
  amount,
  thankYouMessage,
  primaryColor,
  onComplete,
  onNewDonation
}: {
  amount: number
  thankYouMessage: string
  primaryColor: string
  onComplete: () => void
  onNewDonation: () => void
}) {
  useEffect(() => {
    onComplete()
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="text-center max-w-2xl"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.5, delay: 0.2 }}
        className="w-32 h-32 bg-[#4A7C59] rounded-full flex items-center justify-center mx-auto mb-8"
      >
        <CheckCircle2 className="w-16 h-16 text-white" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-[#2D1A24] mb-4">
          Thank You!
        </h2>
        <p className="text-2xl text-[#2D1A24]/70 mb-2">
          Your donation of
        </p>
        <p className="text-5xl font-bold mb-6" style={{ color: primaryColor }}>
          ${amount.toFixed(2)}
        </p>
        <p className="text-xl text-[#2D1A24]/70 mb-8">
          {thankYouMessage}
        </p>

        <div className="flex items-center justify-center gap-2 text-[#4A7C59] mb-12">
          <Sparkles className="w-6 h-6" />
          <span className="text-lg">Your generosity makes a difference</span>
        </div>

        <button
          onClick={onNewDonation}
          className="px-12 py-4 rounded-2xl text-xl font-semibold text-white transition-colors"
          style={{ backgroundColor: primaryColor }}
        >
          Make Another Donation
        </button>
      </motion.div>
    </motion.div>
  )
}
