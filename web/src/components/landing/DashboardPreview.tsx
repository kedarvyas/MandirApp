'use client'

import { Users, UserCheck, CreditCard, TrendingUp, QrCode, Plus } from 'lucide-react'

const stats = [
  { label: 'Total Members', value: '247', icon: Users, color: 'text-[#4A2040]', bg: 'bg-[#6B3050]/10' },
  { label: "Today's Check-ins", value: '42', icon: UserCheck, color: 'text-[#4A7C59]', bg: 'bg-[#4A7C59]/10' },
  { label: 'Monthly Donations', value: '$3,450', icon: CreditCard, color: 'text-[#D4A03E]', bg: 'bg-[#D4A03E]/10' },
  { label: 'Active Families', value: '68', icon: TrendingUp, color: 'text-[#6B3050]', bg: 'bg-[#6B3050]/10' },
]

const recentCheckIns = [
  { name: 'Priya Sharma', initials: 'PS', time: '9:15 AM' },
  { name: 'Raj Patel', initials: 'RP', time: '9:12 AM' },
  { name: 'Anita Kumar', initials: 'AK', time: '9:08 AM' },
  { name: 'Dev Singh', initials: 'DS', time: '9:05 AM' },
]

export function DashboardPreview() {
  return (
    <div className="bg-[#FDF8F5] rounded-lg p-4 sm:p-6 text-left h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#2D1A24]">Dashboard</h3>
          <p className="text-xs sm:text-sm text-[#2D1A24]/60">Welcome to Lotus Temple</p>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#4A2040] flex items-center justify-center">
            <span className="text-white text-xs sm:text-sm">LT</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
        <button className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-[#4A2040] text-white rounded-md text-[10px] sm:text-xs font-medium">
          <QrCode className="w-3 h-3" />
          Scan Check-in
        </button>
        <button className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 border border-[#4A2040] text-[#4A2040] rounded-md text-[10px] sm:text-xs font-medium">
          <Plus className="w-3 h-3" />
          New Member
        </button>
        <button className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 border border-[#4A2040] text-[#4A2040] rounded-md text-[10px] sm:text-xs font-medium">
          <CreditCard className="w-3 h-3" />
          Record Payment
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-lg p-2 sm:p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs text-[#2D1A24]/60 truncate">{stat.label}</p>
                  <p className="text-sm sm:text-lg font-bold text-[#2D1A24] mt-0.5">{stat.value}</p>
                </div>
                <div className={`p-1.5 sm:p-2 rounded-full ${stat.bg} flex-shrink-0 ml-1`}>
                  <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${stat.color}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Check-ins */}
      <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
        <h4 className="text-xs sm:text-sm font-semibold text-[#2D1A24] mb-2 sm:mb-3">Recent Check-ins</h4>
        <div className="space-y-2 sm:space-y-2.5">
          {recentCheckIns.map((checkIn, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 sm:py-2 border-b border-[#F5E6DC] last:border-0">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#F5E6DC] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#4A2040] text-[10px] sm:text-xs font-semibold">{checkIn.initials}</span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-[#2D1A24] truncate">{checkIn.name}</p>
              </div>
              <p className="text-[10px] sm:text-xs text-[#2D1A24]/50 flex-shrink-0 ml-2">{checkIn.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
