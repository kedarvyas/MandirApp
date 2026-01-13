'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, QrCode, Users, Bell, Smartphone, Monitor } from 'lucide-react'

interface Feature {
  id: string
  title: string
  description: string
  mobileImage: string
  dashboardImage: string
  icon: React.ElementType
}

const features: Feature[] = [
  {
    id: 'checkin',
    title: 'QR Code Check-In',
    description: 'Members show their personal QR code at the door for instant, touchless check-in. Staff scan with any device.',
    mobileImage: '/demo/mobile-home.png',
    dashboardImage: '/demo/dashboard-home.png',
    icon: QrCode,
  },
  {
    id: 'news',
    title: 'News & Announcements',
    description: 'Keep your community informed. Post updates, event announcements, and important notices that reach all members.',
    mobileImage: '/demo/mobile-news.png',
    dashboardImage: '/demo/dashboard-news.png',
    icon: Bell,
  },
  {
    id: 'family',
    title: 'Family Management',
    description: 'Group family members together. Track attendance for the whole family and manage relationships easily.',
    mobileImage: '/demo/mobile-family.png',
    dashboardImage: '/demo/dashboard-members.png',
    icon: Users,
  },
]

// Placeholder component when image isn't available
function ImagePlaceholder({ type, title, icon: Icon }: { type: 'mobile' | 'dashboard', title: string, icon: React.ElementType }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#FDF8F5] to-[#F5E6DC] flex flex-col items-center justify-center p-6">
      <div className={`${type === 'mobile' ? 'w-16 h-16' : 'w-20 h-20'} bg-primary/10 rounded-2xl flex items-center justify-center mb-4`}>
        <Icon className={`${type === 'mobile' ? 'w-8 h-8' : 'w-10 h-10'} text-primary`} />
      </div>
      <p className={`${type === 'mobile' ? 'text-sm' : 'text-base'} font-semibold text-[#2D1A24] text-center`}>{title}</p>
      <p className={`${type === 'mobile' ? 'text-xs' : 'text-sm'} text-[#2D1A24]/50 mt-1`}>
        {type === 'mobile' ? 'Mobile App' : 'Dashboard'}
      </p>
    </div>
  )
}

// Image with fallback to placeholder
function ScreenImage({ src, alt, type, title, icon }: {
  src: string
  alt: string
  type: 'mobile' | 'dashboard'
  title: string
  icon: React.ElementType
}) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return <ImagePlaceholder type={type} title={title} icon={icon} />
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover object-top"
      priority
      onError={() => setHasError(true)}
    />
  )
}

interface ProductShowcaseProps {
  id?: string
}

export function ProductShowcase({ id }: ProductShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const goToSlide = (index: number) => {
    setActiveIndex(index)
  }

  const goToPrev = () => {
    setActiveIndex((prev) => (prev - 1 + features.length) % features.length)
  }

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % features.length)
  }

  const activeFeature = features[activeIndex]
  const FeatureIcon = activeFeature.icon

  return (
    <section id={id} className="py-20 bg-gradient-to-b from-background to-card/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            See Sanctum in action
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore how the mobile app and dashboard work together seamlessly
          </p>
        </div>

        {/* Feature Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {features.map((feature, index) => (
            <button
              key={feature.id}
              onClick={() => goToSlide(index)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                index === activeIndex
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-card text-muted-foreground hover:bg-accent border border-border'
              }`}
            >
              {feature.title}
            </button>
          ))}
        </div>

        {/* Feature Description */}
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-foreground mb-3">
            {activeFeature.title}
          </h3>
          <p className="text-muted-foreground text-lg">
            {activeFeature.description}
          </p>
        </div>

        {/* Content Area */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={goToPrev}
            className="absolute left-0 lg:left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-background/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-background transition-colors border border-border hidden md:flex items-center justify-center"
            aria-label="Previous feature"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 lg:right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-background/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-background transition-colors border border-border hidden md:flex items-center justify-center"
            aria-label="Next feature"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>

          {/* Showcase Content - Centered */}
          <div className="flex flex-col lg:flex-row items-center lg:items-end justify-center gap-10 lg:gap-20 px-4 md:px-20">
            {/* Mobile Preview */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {/* Phone Frame */}
                <div className="relative bg-[#1a1a1a] rounded-[2.5rem] p-[6px] shadow-2xl" style={{ width: '280px' }}>
                  {/* Dynamic Island */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20" />

                  {/* Screen */}
                  <div className="bg-[#FDF8F5] rounded-[2.2rem] overflow-hidden relative" style={{ height: '580px' }}>
                    <ScreenImage
                      src={activeFeature.mobileImage}
                      alt={`${activeFeature.title} - Mobile App`}
                      type="mobile"
                      title={activeFeature.title}
                      icon={FeatureIcon}
                    />
                  </div>
                </div>
                {/* Shadow */}
                <div className="absolute inset-x-8 -bottom-4 h-8 bg-black/20 blur-xl rounded-full -z-10" />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground font-medium">Member App</p>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="flex flex-col items-center w-full max-w-xl lg:max-w-2xl">
              <div className="relative w-full">
                {/* Browser Frame */}
                <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                  {/* Browser Chrome */}
                  <div className="bg-gray-100 border-b border-gray-200 px-4 py-2.5 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                      <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                      <div className="w-3 h-3 rounded-full bg-[#27CA40]" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-white rounded-md px-3 py-1.5 text-xs text-gray-500 border border-gray-200 max-w-xs">
                        app.sanctum.com/dashboard
                      </div>
                    </div>
                  </div>
                  {/* Screen Content */}
                  <div className="relative" style={{ height: '420px' }}>
                    <ScreenImage
                      src={activeFeature.dashboardImage}
                      alt={`${activeFeature.title} - Dashboard`}
                      type="dashboard"
                      title={activeFeature.title}
                      icon={FeatureIcon}
                    />
                  </div>
                </div>
                {/* Shadow */}
                <div className="absolute inset-x-8 -bottom-4 h-8 bg-black/15 blur-xl rounded-full -z-10" />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <Monitor className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground font-medium">Staff Dashboard</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-12">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === activeIndex ? 'w-8 bg-primary' : 'w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
