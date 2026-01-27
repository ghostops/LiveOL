export default function Hero() {
  return (
    <section className="relative border-b border-border bg-gradient-to-br from-base-background to-white overflow-hidden">
      {/* Blueprint grid background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(249, 95, 6, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249, 95, 6, 0.08) 1px, transparent 1px),
            linear-gradient(rgba(249, 95, 6, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249, 95, 6, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
        }}
      />

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-24 h-24 border-l border-t border-brand-primary/20 m-4 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-24 h-24 border-r border-b border-brand-primary/20 m-4 pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-8 py-32 md:py-48 flex flex-col items-start relative">
        <div className="flex flex-col gap-6 max-w-3xl">
          {/* Status badge */}
          <div className="inline-flex items-center gap-3 self-start px-3 py-1 bg-white border border-brand-primary/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary" />
            </span>
            <span className="font-mono text-[11px] font-bold text-brand-primary uppercase">
              v2.4.0 Stable Build // System Ready
            </span>
          </div>

          {/* Main heading */}
          <h2 className="text-brand-primary text-5xl md:text-8xl font-black leading-[0.9] tracking-[-0.04em] uppercase italic">
            High-Precision
            <br />
            Live Results
          </h2>

          {/* Description */}
          <p className="text-text-muted text-lg md:text-xl font-normal leading-relaxed max-w-xl">
            The digital blueprint for global orienteering performance.
            Engineered for sub-second synchronization across elite
            championships.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto">
            <a
              href="https://liveol.ludviglarsendahl.se"
              className="flex cursor-pointer items-center justify-center border-2 border-brand-primary bg-brand-primary text-white h-14 px-10 text-sm font-black uppercase tracking-[0.2em] hover:bg-white hover:text-brand-primary transition-all"
            >
              View Live Events
            </a>
            <a
              href="/contact"
              className="flex cursor-pointer items-center justify-center border-2 border bg-white text-text-main h-14 px-10 text-sm font-black uppercase tracking-[0.2em] hover:border-brand-primary transition-all"
            >
              Documentation
            </a>
          </div>
        </div>

        {/* Technical reference */}
        <div className="absolute right-8 bottom-8 hidden lg:block text-right">
          <p className="font-mono text-[10px] text-text-muted uppercase leading-relaxed">
            Ref_ID: 100-293-OL
            <br />
            Drafting_Sheet: A1-METRIC
            <br />
            Scale: 1:15,000 / 5m
          </p>
        </div>
      </div>
    </section>
  )
}
