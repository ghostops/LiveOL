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

      <div className="max-w-360 mx-auto px-8 py-32 flex flex-col items-start relative">
        <div className="flex flex-col gap-6 max-w-3xl">
          {/* Main heading */}
          <h1 className="text-brand-primary text-xl md:text-4xl font-black leading-[0.9] tracking-[-0.04em] italic">
            Live orienteering results with
          </h1>
          <h2 className="text-brand-primary text-5xl md:text-8xl font-black leading-[0.9] tracking-[-0.04em]">
            LiveOL
          </h2>

          {/* Description */}
          <p className="text-text-muted text-lg md:text-xl font-normal leading-relaxed max-w-xl">
            LiveOL is an app that displays orienteering results live. You get
            the latest results on your phone or tablet with a convenient
            interface in multiple languages.
          </p>

          {/* Download buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto items-center">
            <a
              href="https://itunes.apple.com/app/liveol/id1450106846"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity inline-block h-14 w-[168px]"
            >
              <img
                src="/assets/images/appstore.png"
                alt="Download on the App Store"
                className="w-full h-full object-contain"
              />
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=se.liveol.rn"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity inline-block h-14 w-[168px]"
            >
              <img
                src="/assets/images/playstore.png"
                alt="Get it on Google Play"
                className="w-full h-full object-contain block"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
