export default function Features() {
  const features = [
    {
      id: 'MOD_01',
      title: 'Live Tracking',
      description:
        'High-frequency GPS integration with 10Hz sampling. Sub-meter precision mapping for real-time route analysis and athlete pacing.',
      icon: '📍',
    },
    {
      id: 'MOD_02',
      title: 'Expert Editorials',
      description:
        'Strategic breakdown by international technical delegates. Post-race analysis covering choice execution and terrain complexity.',
      icon: '📝',
    },
    {
      id: 'MOD_03',
      title: 'Global Events',
      description:
        'Unified database for WOC, EOC, and IOF World Cup. Real-time synchronization with local timekeeping EMIT/SI systems.',
      icon: '🌍',
    },
  ]

  return (
    <section className="bg-base-background py-24 border-b border">
      <div className="max-w-[1440px] mx-auto px-8">
        {/* Section header */}
        <div className="flex flex-col mb-16">
          <h4 className="font-mono text-brand-primary text-xs font-bold leading-normal tracking-[0.3em] uppercase">
            System Architecture
          </h4>
          <div className="w-12 h-1 bg-brand-primary mt-2" />
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="flex flex-col bg-white border border-border p-8 gap-6 group hover:border-brand-primary transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="p-4 bg-base-background border border-border">
                  <span className="text-4xl">{feature.icon}</span>
                </div>
                <span className="font-mono text-[10px] text-text-muted">
                  {feature.id}
                </span>
              </div>
              <div>
                <h3 className="text-text-main text-xl font-black uppercase italic">
                  {feature.title}
                </h3>
                <p className="text-text-muted text-sm font-normal mt-3 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
