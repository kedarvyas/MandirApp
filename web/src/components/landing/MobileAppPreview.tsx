'use client'

import { Home, Users, Settings } from 'lucide-react'

export function MobileAppPreview() {
  // More realistic QR code pattern (7x7 grid like real QR codes)
  const qrPattern = [
    1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1,
    1,0,0,0,0,0,1,0,0,1,0,1,0,0,1,0,0,0,0,0,1,
    1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1,
    1,0,1,1,1,0,1,0,0,1,1,1,0,0,1,0,1,1,1,0,1,
    1,0,1,1,1,0,1,0,1,0,0,0,1,0,1,0,1,1,1,0,1,
    1,0,0,0,0,0,1,0,0,1,0,1,0,0,1,0,0,0,0,0,1,
    1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1,
    0,0,0,0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,0,0,0,
    1,0,1,0,1,1,1,1,0,0,1,0,0,1,1,0,1,0,1,1,0,
    0,1,0,1,0,0,0,1,1,0,1,0,1,0,0,1,0,1,0,0,1,
    1,1,1,0,1,1,1,0,0,1,1,1,0,0,1,1,1,0,1,1,0,
    0,1,0,1,0,0,0,1,1,0,1,0,1,0,0,1,0,1,0,0,1,
    1,0,1,0,1,1,1,0,1,0,0,0,1,0,1,0,1,0,1,1,0,
    0,0,0,0,0,0,0,0,1,0,1,0,1,0,0,0,1,1,0,0,1,
    1,1,1,1,1,1,1,0,0,1,1,1,0,0,1,0,1,0,1,1,0,
    1,0,0,0,0,0,1,0,1,0,0,0,1,0,0,1,0,1,0,0,1,
    1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1,1,0,
    1,0,1,1,1,0,1,0,0,1,0,1,0,0,0,1,0,1,0,0,1,
    1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1,0,1,1,0,
    1,0,0,0,0,0,1,0,0,0,1,0,0,1,0,1,0,1,0,0,1,
    1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,0,
  ]

  return (
    <div className="relative mx-auto" style={{ width: '260px' }}>
      {/* Phone Frame */}
      <div className="relative bg-[#1a1a1a] rounded-[2.5rem] p-[6px] shadow-2xl">
        {/* Dynamic Island */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20" />

        {/* Screen */}
        <div className="bg-[#FDF8F5] rounded-[2.2rem] overflow-hidden relative" style={{ height: '540px' }}>
          {/* Status Bar */}
          <div className="bg-[#4A2040] pt-10 pb-1 px-6 flex justify-between items-center text-white text-[11px]">
            <span className="font-medium">9:41</span>
            <div className="flex gap-1 items-center">
              <svg className="w-4 h-3" viewBox="0 0 17 12" fill="white">
                <path d="M1.5 4.5h1v5h-1zM4.5 3h1v6.5h-1zM7.5 1.5h1v9h-1zM10.5 3h1v6.5h-1z"/>
              </svg>
              <svg className="w-4 h-3" viewBox="0 0 16 12" fill="white">
                <path d="M8 2C4.5 2 1.5 4 0 7c1.5 3 4.5 5 8 5s6.5-2 8-5c-1.5-3-4.5-5-8-5zm0 8c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z"/>
              </svg>
              <div className="w-6 h-3 border border-white/80 rounded-sm relative ml-0.5">
                <div className="absolute inset-[2px] right-[3px] bg-white rounded-[1px]" />
                <div className="absolute -right-[3px] top-1/2 -translate-y-1/2 w-[2px] h-1.5 bg-white rounded-r-sm" />
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="bg-[#4A2040] pb-3 text-center">
            <h1 className="text-white font-semibold text-base">Sanctum</h1>
          </div>

          {/* Content */}
          <div className="px-4 py-3 space-y-3">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-[#F5E6DC]/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#e8a87c] to-[#c38d9e] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PS</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-[#2D1A24] text-sm">Priya Sharma</h2>
                  <p className="text-[11px] text-[#2D1A24]/60">Member since Jan 15, 2025</p>
                  <span className="inline-block mt-1 text-[9px] px-2 py-0.5 bg-[#4A7C59]/15 text-[#4A7C59] rounded-full font-medium border border-[#4A7C59]/20">
                    Active Member
                  </span>
                </div>
              </div>
            </div>

            {/* Organization */}
            <p className="text-center text-[10px] text-[#2D1A24]/40 font-semibold tracking-widest py-1">
              LOTUS TEMPLE
            </p>

            {/* QR Code Card */}
            <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-[#F5E6DC]/50">
              <div className="text-center mb-2.5">
                <h3 className="font-semibold text-[#2D1A24] text-sm">Your Check-in Code</h3>
                <p className="text-[10px] text-[#2D1A24]/50">Tap to expand for easier scanning</p>
              </div>

              {/* QR Code */}
              <div className="bg-white rounded-xl p-3 flex items-center justify-center border border-[#F5E6DC]">
                <div className="grid grid-cols-21 gap-[1px]" style={{ width: '126px', height: '126px' }}>
                  {qrPattern.map((cell, i) => (
                    <div
                      key={i}
                      className={`w-[5px] h-[5px] ${cell ? 'bg-[#2D1A24]' : 'bg-white'}`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-center text-[9px] text-[#D4A89A] mt-2.5">
                Pull down to refresh if the code doesn't scan
              </p>
            </div>

            {/* Phone Info */}
            <div className="bg-white rounded-xl p-3 shadow-sm flex justify-between items-center border border-[#F5E6DC]/50">
              <span className="text-[11px] text-[#2D1A24]/50">Phone</span>
              <span className="text-[11px] font-medium text-[#2D1A24]">+1 (555) 123-4567</span>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-[#F5E6DC] px-4 py-2.5 rounded-b-[2.2rem]">
            <div className="flex justify-around items-center">
              <div className="flex flex-col items-center gap-0.5">
                <div className="p-1.5 rounded-lg bg-[#4A2040]/10">
                  <Home className="w-4 h-4 text-[#4A2040]" />
                </div>
                <span className="text-[9px] text-[#4A2040] font-medium">Home</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <div className="p-1.5">
                  <Users className="w-4 h-4 text-[#2D1A24]/35" />
                </div>
                <span className="text-[9px] text-[#2D1A24]/35">Family</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <div className="p-1.5">
                  <Settings className="w-4 h-4 text-[#2D1A24]/35" />
                </div>
                <span className="text-[9px] text-[#2D1A24]/35">Settings</span>
              </div>
            </div>
            {/* Home Indicator */}
            <div className="w-28 h-1 bg-black/20 rounded-full mx-auto mt-2" />
          </div>
        </div>
      </div>

      {/* Decorative shadow */}
      <div className="absolute inset-x-8 -bottom-4 h-8 bg-black/20 blur-xl rounded-full -z-10" />
    </div>
  )
}
