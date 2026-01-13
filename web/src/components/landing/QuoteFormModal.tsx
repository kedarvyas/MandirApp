'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { X } from 'lucide-react'

interface QuoteFormModalProps {
  isOpen: boolean
  onClose: () => void
}

const serviceOptions = [
  'Member Check-In',
  'Donation Tracking',
  'Family Management',
  'Multi-Location',
  'Custom Integration',
  'General Enquiry',
]

export function QuoteFormModal({ isOpen, onClose }: QuoteFormModalProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const emailBody = `
New Quote Request from Sanctum Website

Name: ${formData.name}
Email: ${formData.email}
Organization: ${formData.organization}

Interested In:
${selectedServices.length > 0 ? selectedServices.map(s => `- ${s}`).join('\n') : '- Not specified'}

Message:
${formData.message || 'No additional message'}
    `.trim()

    const mailtoLink = `mailto:kedarvyas17@gmail.com?subject=${encodeURIComponent(`Quote Request: ${formData.organization}`)}&body=${encodeURIComponent(emailBody)}`
    window.open(mailtoLink, '_blank')

    // Short delay then show success
    await new Promise((resolve) => setTimeout(resolve, 500))

    setSubmitted(true)
    setIsSubmitting(false)
  }

  const handleClose = () => {
    onClose()
    // Reset form after close animation
    setTimeout(() => {
      setSubmitted(false)
      setSelectedServices([])
      setFormData({ name: '', email: '', organization: '', message: '' })
    }, 300)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        <div className="p-8 sm:p-10">
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#4A7C59]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-[#4A7C59]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Thank you!
              </h3>
              <p className="text-muted-foreground mb-6">
                We&apos;ve received your request and will get back to you within 24 hours.
              </p>
              <Button onClick={handleClose} variant="outline">
                Close
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  Get a Quote
                </h2>
                <p className="text-muted-foreground">
                  Tell us about your organization and we&apos;ll create a custom plan for you.
                </p>
              </div>

              {/* Service Selection */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-foreground mb-3">
                  What are you interested in?
                </label>
                <div className="flex flex-wrap gap-2">
                  {serviceOptions.map((service) => (
                    <button
                      key={service}
                      type="button"
                      onClick={() => toggleService(service)}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                        selectedServices.includes(service)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-foreground border-border hover:border-primary/50'
                      }`}
                    >
                      {service}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Your Name
                    </label>
                    <Input
                      type="text"
                      placeholder="John Smith"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      className="border-border focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Your Email
                    </label>
                    <Input
                      type="email"
                      placeholder="john@organization.org"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      className="border-border focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Organization Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Your Temple / Church / Organization"
                    value={formData.organization}
                    onChange={(e) =>
                      setFormData({ ...formData, organization: e.target.value })
                    }
                    required
                    className="border-border focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tell us about your project
                  </label>
                  <Textarea
                    placeholder="How many members do you have? What features are most important to you?"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows={4}
                    className="border-border focus:border-primary resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-primary hover:bg-[#5D2850] text-primary-foreground py-6 text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Submit Request'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
