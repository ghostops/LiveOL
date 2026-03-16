import { Link } from '@tanstack/react-router'

export default function Newsletter() {
  return (
    <section className="relative bg-linear-to-br from-base-background via-orange-50 to-white border-y border-border py-24 overflow-hidden">
      {/* Technical grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(249, 95, 6, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249, 95, 6, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Corner accents */}
      <div className="absolute top-0 right-0 w-32 h-32 border-r border-t border-brand-primary/20 m-8 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l border-b border-brand-primary/20 m-8 pointer-events-none" />

      <div className="max-w-360 mx-auto px-8 relative">
        <div className="max-w-3xl mx-auto text-center">
          {/* Section label */}
          <div className="inline-block mb-6">
            <span className="font-mono text-brand-primary text-xs font-bold tracking-[0.3em] uppercase border border-brand-primary/30 px-4 py-2">
              Stay Updated
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-brand-primary text-4xl md:text-6xl font-black leading-tight tracking-[-0.02em] uppercase italic mb-6">
            Stay in the Loop
          </h2>

          {/* Description */}
          <p className="text-text-muted text-lg md:text-xl font-normal leading-relaxed mb-10 max-w-2xl mx-auto">
            Get early access to new features, behind-the-scenes development
            updates, and be the first to know what we're building next.
          </p>

          {/* CTA Button */}
          <Link
            to="/newsletter"
            className="inline-flex items-center justify-center gap-3 border-2 border-brand-primary bg-brand-primary text-white h-16 px-12 text-sm font-black uppercase tracking-[0.2em] hover:bg-white hover:text-brand-primary transition-all group"
          >
            Subscribe to Newsletter
            <span className="text-xl group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
