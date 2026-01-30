export default function PlusFeatures() {
  const features = [
    {
      icon: '📊',
      title: 'Sort results by any column',
      description:
        'Analyze performance data your way by sorting results by time, position, split times, or any other metric.',
    },
    {
      icon: '👥',
      title: 'Follow unlimited runners',
      description:
        'Track as many athletes as you want with no restrictions. Never miss a performance from your favorite runners.',
    },
    {
      icon: '💚',
      title: 'Support LiveOL development',
      description:
        'Help us build new features, maintain servers, and keep LiveOL running smoothly for the entire orienteering community.',
    },
  ]

  return (
    <section className="relative bg-white border-y border-border py-24 overflow-hidden">
      {/* Blueprint grid pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(249, 95, 6, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249, 95, 6, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Plus symbol decorations */}
      <div className="absolute top-8 right-8 text-brand-primary/10 text-9xl font-black pointer-events-none">
        +
      </div>
      <div className="absolute bottom-8 left-8 text-brand-primary/10 text-9xl font-black pointer-events-none">
        +
      </div>

      <div className="max-w-[1440px] mx-auto px-8 relative">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="font-mono text-brand-primary text-xs font-bold tracking-[0.3em] uppercase border border-brand-primary/30 px-4 py-2">
              Premium Experience
            </span>
          </div>
          <h2 className="text-brand-primary text-4xl md:text-6xl font-black leading-tight tracking-[-0.02em] uppercase italic mb-4">
            LiveOL+
          </h2>
          <p className="text-text-muted text-lg md:text-xl max-w-2xl mx-auto">
            Unlock exclusive features and support the future of live
            orienteering results
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-base-background border-2 border-border p-8 relative"
            >
              {/* Feature number */}
              <div className="absolute top-4 right-4 font-mono text-xs text-text-muted">
                #{(index + 1).toString().padStart(2, '0')}
              </div>

              {/* Icon */}
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white border-2 border-border">
                  <span className="text-4xl">{feature.icon}</span>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-text-main text-xl font-black uppercase italic mb-3">
                {feature.title}
              </h3>
              <p className="text-text-muted text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Pricing callout */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-brand-primary to-orange-600 p-8 md:p-12 relative overflow-hidden">
            {/* Grid overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }}
            />

            <div className="relative text-center">
              <p className="text-white text-2xl md:text-3xl font-black uppercase italic mb-4">
                Annual Plan
              </p>
              <p className="text-white/90 text-lg mb-6">
                Support LiveOL development and unlock premium features
              </p>
              <p className="text-white/80 text-sm font-mono uppercase tracking-wider">
                Available in-app • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
