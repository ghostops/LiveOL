export default function Features() {
  const features = [
    {
      title: 'Cross platform',
      description:
        'Download the app on both iOS and Android.',
      icon: '📱',
    },
    {
      title: 'As live as it gets',
      description: 'We serve the latest results with no delay.',
      icon: '⚡',
    },
    {
      title: 'Great usability',
      description:
        'Skip websites that looks messy on mobile devices.',
      icon: '👌',
    },
  ]

  return (
    <section className="bg-base-background py-24">
      <div className="max-w-[1440px] mx-auto px-8">
        {/* Section header */}
        <div className="flex flex-col mb-16">
          <h4 className="font-mono text-brand-primary text-lg font-bold leading-normal tracking-[0.3em] uppercase">
            What makes LiveOL special?
          </h4>
          <div className="w-12 h-1 bg-brand-primary mt-2" />
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col bg-white border border-border p-8 gap-6 group hover:border-brand-primary transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="p-4 bg-base-background border border-border">
                  <span className="text-4xl">{feature.icon}</span>
                </div>
                <span className="font-mono text-[10px] text-text-muted">
                  #{(index + 1).toString().padStart(2, '0')}
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
