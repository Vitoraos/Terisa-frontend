'use client'

import { useEffect, useState, useRef, type ReactNode } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useUser } from './providers'
import { getMarketplace } from '@/lib/api'
import type { ProviderRoute } from '@/lib/types'
import RouteCard from '@/components/RouteCard'
import Link from 'next/link'

/* ═══════════════════════════════════════════════════════════════
   1. TYPEWRITER HOOK  (character-by-character, cycling phrases)
   ═══════════════════════════════════════════════════════════════ */

function useTypewriter(
  phrases: string[],
  typeSpeed = 40,
  holdDuration = 2000,
  deleteSpeed = 30
) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    const phrase = phrases[currentIndex]
    let timer: ReturnType<typeof setTimeout>

    if (isDeleting) {
      if (displayText === '') {
        setIsDeleting(false)
        setCurrentIndex((prev) => (prev + 1) % phrases.length)
        return
      }
      timer = setTimeout(() => {
        setDisplayText((prev) => prev.slice(0, -1))
      }, deleteSpeed)
    } else {
      if (displayText === phrase) {
        setIsTyping(false)
        timer = setTimeout(() => {
          setIsDeleting(true)
          setIsTyping(true)
        }, holdDuration)
        return
      }
      timer = setTimeout(() => {
        setDisplayText((prev) => phrase.slice(0, prev.length + 1))
      }, typeSpeed)
    }

    return () => clearTimeout(timer)
  }, [
    displayText,
    isDeleting,
    currentIndex,
    phrases,
    typeSpeed,
    holdDuration,
    deleteSpeed,
  ])

  return { displayText, isTyping }
}

/* ═══════════════════════════════════════════════════════════════
   2. INTERSECTION OBSERVER HOOK  (scroll-triggered animations)
   ═══════════════════════════════════════════════════════════════ */

function useInView(ref: React.RefObject<HTMLElement | null>, threshold = 0.2) {
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, threshold])

  return isInView
}

/* ═══════════════════════════════════════════════════════════════
   3. BARREL CAROUSEL  (3D scroll-driven rotation)
   ═══════════════════════════════════════════════════════════════ */

function BarrelCarousel({ routes }: { routes: ProviderRoute[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  /* Responsive card width */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  /* Track scroll + container dimensions */
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const update = () => {
      setScrollLeft(el.scrollLeft)
      setContainerWidth(el.clientWidth)
    }

    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const CARD_WIDTH = isMobile ? 280 : 340
  const GAP = 24
  const ITEM_WIDTH = CARD_WIDTH + GAP

  return (
    <div className="relative w-full py-12" style={{ perspective: '1200px' }}>
      {/* Edge fades */}
      <div
        className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #09090B, transparent)' }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, #09090B, transparent)' }}
      />

      <div
        ref={containerRef}
        className="flex gap-6 overflow-x-auto px-[calc(50%-170px)] scrollbar-hide cursor-grab active:cursor-grabbing"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {routes.map((route, i) => {
          const cardCenter = i * ITEM_WIDTH + ITEM_WIDTH / 2
          const viewportCenter = scrollLeft + containerWidth / 2
          const distance = cardCenter - viewportCenter
          const maxDistance = Math.max(containerWidth / 2, ITEM_WIDTH)
          const normalized = distance / maxDistance
          const rotateY = Math.max(-50, Math.min(50, normalized * 50))
          const scale = Math.max(0.75, 1 - Math.abs(normalized) * 0.2)
          const opacity = Math.max(0.4, 1 - Math.abs(normalized) * 0.35)

          return (
            <div
              key={route.id}
              className="flex-shrink-0"
              style={{
                width: `${CARD_WIDTH}px`,
                scrollSnapAlign: 'center',
                transform: `perspective(1200px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity,
                transition: 'transform 0.4s ease-out, opacity 0.4s ease-out',
              }}
            >
              <Link href={`/marketplace/${route.id}`} className="block">
                <RouteCard route={route} />
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   4. STEP CARD  (How It Works)
   ═══════════════════════════════════════════════════════════════ */

function StepCard({
  number,
  title,
  description,
  icon,
}: {
  number: number
  title: string
  description: string
  icon: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, 0.3)

  return (
    <div
      ref={ref}
      className="flex flex-col items-center text-center p-8 rounded-lg"
      style={{
        backgroundColor: '#111318',
        border: '1px solid rgba(255,255,255,0.07)',
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.6s ease-out ${number * 0.15}s, transform 0.6s ease-out ${number * 0.15}s`,
      }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: 'rgba(0, 82, 204, 0.15)' }}
      >
        {icon}
      </div>
      <div
        className="text-sm font-medium mb-3"
        style={{ color: '#0052CC', fontFamily: 'Inter, sans-serif' }}
      >
        Step {number}
      </div>
      <h3
        className="text-xl font-bold mb-3"
        style={{ color: '#FAFAFA', fontFamily: 'Inter, sans-serif' }}
      >
        {title}
      </h3>
      <p
        className="text-base leading-relaxed"
        style={{ color: 'rgba(250,250,250,0.45)' }}
      >
        {description}
      </p>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   5. MAIN LANDING PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const { authenticated, login } = usePrivy()
  const { user } = useUser()
  const [featuredRoutes, setFeaturedRoutes] = useState<ProviderRoute[]>([])
  const [loading, setLoading] = useState(true)

  const phrases = [
    'Text AI',
    'Image Generation',
    'Financial Data',
    'Weather APIs',
    'Developer Tools',
  ]
  const { displayText, isTyping } = useTypewriter(phrases, 40, 2000, 30)

  /* Redirect authenticated users to dashboard */
  useEffect(() => {
    if (authenticated && user) {
      window.location.href = '/dashboard'
    }
  }, [authenticated, user])

  /* Fetch featured routes from marketplace */
  useEffect(() => {
    getMarketplace({ limit: 6 })
      .then((routes) => {
        setFeaturedRoutes(routes.slice(0, 6))
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  /* Scroll-triggered section refs */
  const howItWorksRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const howItWorksInView = useInView(howItWorksRef, 0.2)
  const ctaInView = useInView(ctaRef, 0.3)

  /* ── Render ────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#09090B' }}>
      {/* ═══════════════════════════════════════════════════════
          NAVIGATION  (fixed, 64px, bg-1, border-bottom)
          ═══════════════════════════════════════════════════════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 lg:px-12"
        style={{
          backgroundColor: '#111318',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div
          className="text-xl font-bold tracking-tight"
          style={{ color: '#FAFAFA', fontFamily: 'Inter, sans-serif' }}
        >
          Terisa
        </div>

        <div className="flex items-center gap-3">
          {/* Log in — secondary button */}
          <button
            onClick={() => login()}
            className="px-5 py-2 text-sm font-medium rounded-md transition-colors"
            style={{
              color: '#0052CC',
              backgroundColor: 'transparent',
              border: '1px solid #0052CC',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 82, 204, 0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            Log in
          </button>

          {/* Sign up — primary button */}
          <button
            onClick={() => login()}
            className="px-5 py-2 text-sm font-medium rounded-md transition-colors"
            style={{
              color: '#FAFAFA',
              backgroundColor: '#0052CC',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 82, 204, 0.85)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0052CC'
            }}
          >
            Sign up
          </button>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════
          HERO  (100vh, centered, staggered fade-up)
          ═══════════════════════════════════════════════════════ */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-16 text-center">
        <div className="max-w-3xl mx-auto">
          {/* Headline — staggered fade-up per line */}
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            style={{
              color: '#FAFAFA',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <span
              className="block"
              style={{ animation: 'fadeUp 0.6s ease-out 0.2s both' }}
            >
              One balance.
            </span>
            <span
              className="block"
              style={{ animation: 'fadeUp 0.6s ease-out 0.35s both' }}
            >
              Every API.
            </span>
            <span
              className="block"
              style={{ animation: 'fadeUp 0.6s ease-out 0.5s both' }}
            >
              Pay per call.
            </span>
          </h1>

          {/* Rotating typewriter phrase — Signal Amber */}
          <div
            className="h-10 mb-6 flex items-center justify-center"
            style={{ animation: 'fadeUp 0.6s ease-out 0.65s both' }}
          >
            <span
              className="text-xl md:text-2xl font-bold"
              style={{
                color: '#F5A623',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {displayText}
              <span
                className="inline-block w-0.5 h-6 ml-1 align-middle"
                style={{
                  backgroundColor: '#F5A623',
                  animation: isTyping
                    ? 'blink 1s step-end infinite'
                    : 'none',
                }}
              />
            </span>
          </div>

          {/* Subheadline */}
          <p
            className="text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto"
            style={{
              color: 'rgba(250,250,250,0.85)',
              animation: 'fadeUp 0.6s ease-out 0.8s both',
            }}
          >
            Stop managing subscriptions for every API you use. Top up once, call
            anything. Micro-fees as low as $0.0005 per request.
          </p>

          {/* CTA */}
          <div style={{ animation: 'fadeUp 0.6s ease-out 0.95s both' }}>
            <button
              onClick={() => login()}
              className="px-8 py-4 text-base font-medium rounded-md transition-colors"
              style={{
                color: '#FAFAFA',
                backgroundColor: '#0052CC',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  'rgba(0, 82, 204, 0.85)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0052CC'
              }}
            >
              Sign up — it takes 30 seconds
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURED APIs  (3D barrel carousel, max 6)
          ═══════════════════════════════════════════════════════ */}
      {featuredRoutes.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-3xl md:text-4xl font-bold text-center mb-4"
              style={{
                color: '#FAFAFA',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Featured APIs
            </h2>
            <p
              className="text-center mb-12"
              style={{ color: 'rgba(250,250,250,0.45)' }}
            >
              Discover what you can build with Terisa
            </p>

            <BarrelCarousel routes={featuredRoutes} />

            <div className="text-center mt-10">
              <Link
                href="/marketplace"
                className="inline-flex items-center text-sm font-medium transition-colors hover:underline"
                style={{ color: '#0052CC' }}
              >
                Browse all APIs →
              </Link>
            </div>
          </div>
        </section>
      )}

      {loading && (
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex gap-6 justify-center">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-[340px] h-[220px] rounded-lg"
                  style={{
                    backgroundColor: '#111318',
                    animation: 'pulse-subtle 2s ease-in-out infinite',
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════
          HOW IT WORKS  (3 steps, staggered fade-up)
          ═══════════════════════════════════════════════════════ */}
      <section
        ref={howItWorksRef}
        className="py-20 px-6"
        style={{ backgroundColor: '#111318' }}
      >
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            style={{
              color: '#FAFAFA',
              fontFamily: 'Inter, sans-serif',
              opacity: howItWorksInView ? 1 : 0,
              transform: howItWorksInView ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
            }}
          >
            How It Works
          </h2>
          <p
            className="text-center mb-16 max-w-xl mx-auto"
            style={{
              color: 'rgba(250,250,250,0.45)',
              opacity: howItWorksInView ? 1 : 0,
              transform: howItWorksInView ? 'translateY(0)' : 'translateY(24px)',
              transition:
                'opacity 0.6s ease-out 0.1s, transform 0.6s ease-out 0.1s',
            }}
          >
            Three steps to start calling any API on the planet
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number={1}
              title="Top up your balance"
              description="Add USDC via card or mobile money. Your balance works across every API on the platform."
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="#0052CC"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
            <StepCard
              number={2}
              title="Copy your API key"
              description="Generate a key in one click. Use it to authenticate every request — no separate accounts needed."
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="#0052CC"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              }
            />
            <StepCard
              number={3}
              title="Call any API"
              description="Pick an API from the marketplace and start calling. You pay micro-fees per request — nothing else."
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="#0052CC"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CTA SECTION  (final conversion push)
          ═══════════════════════════════════════════════════════ */}
      <section ref={ctaRef} className="py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-3xl md:text-4xl font-bold mb-6 leading-tight"
            style={{
              color: '#FAFAFA',
              fontFamily: 'Inter, sans-serif',
              opacity: ctaInView ? 1 : 0,
              transform: ctaInView ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
            }}
          >
            Developers are already saving hours. What are you waiting for?
          </h2>
          <p
            className="text-lg mb-10"
            style={{
              color: 'rgba(250,250,250,0.45)',
              opacity: ctaInView ? 1 : 0,
              transform: ctaInView ? 'translateY(0)' : 'translateY(24px)',
              transition:
                'opacity 0.6s ease-out 0.1s, transform 0.6s ease-out 0.1s',
            }}
          >
            Join the platform where one balance unlocks every API.
          </p>
          <div
            style={{
              opacity: ctaInView ? 1 : 0,
              transform: ctaInView ? 'translateY(0)' : 'translateY(24px)',
              transition:
                'opacity 0.6s ease-out 0.2s, transform 0.6s ease-out 0.2s',
            }}
          >
            <button
              onClick={() => login()}
              className="px-8 py-4 text-base font-medium rounded-md transition-colors"
              style={{
                color: '#FAFAFA',
                backgroundColor: '#0052CC',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  'rgba(0, 82, 204, 0.85)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0052CC'
              }}
            >
              Sign up for free
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER  (bg-1, border-top, email / discord / slack)
          ═══════════════════════════════════════════════════════ */}
      <footer
        className="py-10 px-6"
        style={{
          backgroundColor: '#111318',
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div
            className="text-sm"
            style={{ color: 'rgba(250,250,250,0.45)' }}
          >
            © 2026 Terisa
          </div>
          <div className="flex items-center gap-8">
            <a
              href="mailto:hello@terisa.io"
              className="text-sm transition-colors"
              style={{ color: 'rgba(250,250,250,0.45)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FAFAFA'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(250,250,250,0.45)'
              }}
            >
              Email
            </a>
            <a
              href="https://discord.gg/terisa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm transition-colors"
              style={{ color: 'rgba(250,250,250,0.45)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FAFAFA'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(250,250,250,0.45)'
              }}
            >
              Discord
            </a>
            <a
              href="https://terisa.slack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm transition-colors"
              style={{ color: 'rgba(250,250,250,0.45)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FAFAFA'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(250,250,250,0.45)'
              }}
            >
              Slack
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
