import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Smartphone, QrCode, Users, Bell, Settings, Mail } from 'lucide-react'

export default function HelpPage() {
  const gettingStarted = [
    {
      icon: Smartphone,
      title: 'Download the App',
      description: 'Download Sanctum from the App Store (iOS) or Google Play Store (Android). The app is free for all members.',
    },
    {
      icon: QrCode,
      title: 'Enter Your Organization Code',
      description: 'Your organization will provide you with a unique code. Enter this code to connect to your community.',
    },
    {
      icon: Users,
      title: 'Create Your Profile',
      description: 'Verify your phone number and set up your profile with your name and optional photo.',
    },
  ]

  const features = [
    {
      title: 'Checking In',
      items: [
        'Open the app and tap "Show QR Code" on the home screen',
        'Present your QR code to the staff member at the entrance',
        'You\'ll receive a confirmation when checked in successfully',
        'Family members can be checked in together with one scan',
      ],
    },
    {
      title: 'Managing Your Family',
      items: [
        'Go to the Family tab to view your family group',
        'Add family members by tapping "Add Family Member"',
        'Family members share a group and can check in together',
        'Each family member gets their own QR code',
      ],
    },
    {
      title: 'Notifications',
      items: [
        'Enable notifications to receive announcements from your organization',
        'Get reminders about upcoming events',
        'Receive check-in confirmations',
        'Manage notification settings in Settings > Notifications',
      ],
    },
    {
      title: 'Profile Settings',
      items: [
        'Update your name and profile photo in Settings > Edit Profile',
        'Change your phone number if needed',
        'View and switch between multiple organizations',
        'Sign out securely when needed',
      ],
    },
  ]

  const troubleshooting = [
    {
      question: 'My QR code isn\'t scanning',
      answer: 'Make sure your screen brightness is turned up and the QR code is fully visible. Try cleaning your screen and holding steady. If problems persist, try closing and reopening the app.',
    },
    {
      question: 'I\'m not receiving notifications',
      answer: 'Check that notifications are enabled in both the app (Settings > Notifications) and your device settings. Make sure Do Not Disturb is off.',
    },
    {
      question: 'I can\'t find my organization',
      answer: 'Double-check the organization code with your community administrator. Codes are case-sensitive. Contact your organization if you\'re unsure of the code.',
    },
    {
      question: 'I need to change my phone number',
      answer: 'Contact your organization administrator to update your phone number. This ensures your membership records stay accurate.',
    },
    {
      question: 'The app is crashing or not loading',
      answer: 'Try force-closing the app and reopening it. If issues persist, check for app updates in the App Store or Play Store. You can also try uninstalling and reinstalling the app.',
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
            Help Center
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know about using Sanctum
          </p>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-8">Getting Started</h2>
          <div className="grid gap-6">
            {gettingStarted.map((step, index) => (
              <div key={index} className="bg-card rounded-xl p-6 border border-border flex gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-card/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-8">How to Use Sanctum</h2>
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-background rounded-xl p-6 border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">{feature.title}</h3>
                <ul className="space-y-2">
                  {feature.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-8">Troubleshooting</h2>
          <div className="space-y-6">
            {troubleshooting.map((item, index) => (
              <div key={index} className="bg-card rounded-xl p-6 border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.question}</h3>
                <p className="text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-card/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Still Need Help?</h2>
          <p className="text-muted-foreground mb-6">
            Can&apos;t find what you&apos;re looking for? Our support team is here to help.
          </p>
          <a
            href="mailto:kedarvyas17@gmail.com"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Contact Support
          </a>
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
              <Link href="/privacy" className="hover:text-background">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-background">
                Terms
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
