import type { ProviderRoute } from '@/lib/types'

function formatCalls(totalCalls: string): string {
  const num = Number(totalCalls)
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return totalCalls
}

function getUptimeColor(uptimePct: number | null): string {
  if (uptimePct === null) return 'rgba(250,250,250,0.30)'
  if (uptimePct > 95) return '#00C48C'
  if (uptimePct >= 80) return '#F5A623'
  return '#FF3B5C'
}

function getUptimeLabel(uptimePct: number | null): string {
  if (uptimePct === null) return 'No data yet'
  return `${uptimePct.toFixed(1)}%`
}

function renderStars(rating: number | null): React.ReactNode {
  if (rating === null)
    return <span style={{ color: 'rgba(250,250,250,0.30)' }}>—</span>

  const fullStars = Math.floor(rating)
  const stars: React.ReactNode[] = []

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <span key={i} style={{ color: '#F5A623' }}>
          ★
        </span>
      )
    } else {
      stars.push(
        <span key={i} style={{ color: 'rgba(250,250,250,0.15)' }}>
          ★
        </span>
      )
    }
  }

  return <span className="flex gap-0.5 text-sm">{stars}</span>
}

export default function RouteCard({ route }: { route: ProviderRoute }) {
  return (
    <div
      className="rounded-lg p-6 h-full flex flex-col transition-colors cursor-pointer"
      style={{
        backgroundColor: '#111318',
        border: '1px solid rgba(255,255,255,0.07)',
        borderTop: '1px solid #0052CC',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#1C2030'
        e.currentTarget.style.borderTopWidth = '2px'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#111318'
        e.currentTarget.style.borderTopWidth = '1px'
      }}
    >
      {/* Category badge */}
      <div className="mb-3">
        <span
          className="inline-block px-2 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: '#0052CC', color: '#FAFAFA' }}
        >
          {route.category}
        </span>
      </div>

      {/* Name */}
      <h3
        className="text-lg font-bold mb-2 leading-snug"
        style={{ color: '#FAFAFA', fontFamily: 'Inter, sans-serif' }}
      >
        {route.name}
      </h3>

      {/* Description */}
      <p
        className="text-sm mb-4 line-clamp-2 leading-relaxed flex-grow"
        style={{ color: 'rgba(250,250,250,0.45)' }}
      >
        {route.description}
      </p>

      {/* Stats row */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div
          className="font-medium"
          style={{ color: getUptimeColor(route.uptimePct) }}
        >
          {getUptimeLabel(route.uptimePct)}
        </div>
        {route.avgLatencyMs !== null && (
          <div style={{ color: 'rgba(250,250,250,0.45)' }}>
            {route.avgLatencyMs}ms
          </div>
        )}
      </div>

      {/* Rating + calls + price */}
      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3">
          {renderStars(route.avgRating)}
          <span className="text-xs" style={{ color: 'rgba(250,250,250,0.45)' }}>
            {route.totalCalls ? formatCalls(route.totalCalls) : '0'} calls
          </span>
        </div>
        <div
          className="text-sm font-bold"
          style={{ color: '#FAFAFA', fontFamily: 'Inter, sans-serif' }}
        >
          {route.costUsdc} USDC
        </div>
      </div>
    </div>
  )
}
