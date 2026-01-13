import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export default function FAQPage() {
  const generalFAQs = [
    {
      question: 'How do members check in?',
      answer:
        "Members download the free Sanctum app, enter your organization's unique code, and register with their phone number. They'll receive a personal QR code that staff can scan at the entrance for instant check-in.",
    },
    {
      question: 'What devices can scan QR codes?',
      answer:
        'Any smartphone, tablet, or computer with a camera can scan QR codes through our web dashboard. No special hardware required.',
    },
    {
      question: 'Can family members check in together?',
      answer:
        'Yes! You can link family members together. When one family member checks in, you have the option to check in the entire family with a single scan.',
    },
    {
      question: 'Is our member data secure?',
      answer:
        "Absolutely. Your data is encrypted and stored securely. We never share or sell member information. Each organization's data is completely isolated and only accessible by your authorized staff.",
    },
  ]

  const pricingFAQs = [
    {
      question: 'How does the pricing consultation work?',
      answer:
        "Simply fill out our quote form with details about your organization. We'll review your needs and send you a custom proposal within 24 hours. No obligation, no pressure.",
    },
    {
      question: 'Is there a free trial?',
      answer:
        'Yes! Every organization gets a free trial period to test the platform with their community before committing to a paid plan.',
    },
    {
      question: 'How much does Sanctum cost?',
      answer:
        "Pricing is customized based on your community size, number of locations, and feature needs. Contact us for a personalized quote—we'll work with your budget.",
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit cards (Visa, Mastercard, American Express) and can arrange ACH bank transfers or invoicing for annual plans.',
    },
    {
      question: 'Can I change my plan later?',
      answer:
        "Absolutely! As your community grows or your needs change, we'll work with you to adjust your plan accordingly.",
    },
    {
      question: 'Do you offer discounts for non-profits?',
      answer:
        'Yes! All religious organizations and registered non-profits receive special pricing. This is factored into every custom quote we provide.',
    },
    {
      question: 'What if we need to cancel?',
      answer:
        "You can cancel anytime. We'll help you export your data, and you'll have access until the end of your current billing period.",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2 md:gap-3">
              <Image
                src="/logo.svg"
                alt="Sanctum"
                width={48}
                height={48}
                className="w-10 h-10 md:w-12 md:h-12"
              />
              <span className="text-xl md:text-2xl font-bold text-foreground">Sanctum</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Find answers to common questions about Sanctum
          </p>
        </div>
      </section>

      {/* General FAQs */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-8">General</h2>
          <div className="space-y-6">
            {generalFAQs.map((faq, index) => (
              <div key={index} className="bg-card rounded-xl p-6 border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing FAQs */}
      <section className="py-12 bg-card/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-8">Pricing & Billing</h2>
          <div className="space-y-6">
            {pricingFAQs.map((faq, index) => (
              <div key={index} className="bg-background rounded-xl p-6 border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still have questions */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-6">
            We&apos;re here to help. Reach out and we&apos;ll get back to you within 24 hours.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Sanctum"
                width={32}
                height={32}
                className="w-8 h-8 invert"
              />
              <span className="font-bold">Sanctum</span>
            </div>
            <div className="flex gap-6 text-sm text-background/70">
              <Link href="/" className="hover:text-background">
                Home
              </Link>
              <Link href="/pricing" className="hover:text-background">
                Pricing
              </Link>
              <Link href="/signup" className="hover:text-background">
                Get Started
              </Link>
            </div>
          </div>
          <div className="border-t border-background/20 mt-8 pt-8 text-center text-sm text-background/50">
            © {new Date().getFullYear()} Sanctum. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
