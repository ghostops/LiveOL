export default function TechnicalSpecs() {
  const specs = [
    { label: 'Sync Engine', value: 'LiveOL Delta-X v4' },
    { label: 'Map Protocol', value: 'ISOM 2017-2 Vector' },
    { label: 'Data Integrity', value: '99.999% Atomic Updates' },
    { label: 'Client Bandwidth', value: '< 15KB per Event Stream' },
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Specs panel */}
        <div className="flex flex-col gap-8 order-2 lg:order-1">
          <div className="bg-brand-primary/5 border-2 border-brand-primary/20 p-10 flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💻</span>
              <h3 className="font-mono text-brand-primary text-sm font-bold uppercase tracking-[0.2em]">
                Technical Specifications
              </h3>
            </div>

            <div className="flex flex-col gap-4">
              {specs.map((spec, index) => (
                <div
                  key={spec.label}
                  className={`flex justify-between pb-4 ${
                    index < specs.length - 1
                      ? 'border-b border-brand-primary/10'
                      : ''
                  }`}
                >
                  <span className="font-mono text-xs text-text-muted uppercase font-bold">
                    {spec.label}
                  </span>
                  <span className="font-mono text-xs font-bold text-text-main">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>

            <a
              href="/contact"
              className="flex items-center justify-center gap-3 font-mono text-xs font-black uppercase text-brand-primary border border-brand-primary/30 py-4 bg-white hover:bg-brand-primary hover:text-white transition-all"
            >
              Download Full Developer Documentation
              <span>→</span>
            </a>
          </div>

          <p className="text-xs text-text-muted font-mono leading-relaxed">
            NOTE: Integration requires valid IOF API credentials. Legacy XML
            imports are supported via the conversion bridge 0x11-D.
          </p>
        </div>

        {/* Visualization panel */}
        <div className="order-1 lg:order-2">
          <div className="relative w-full aspect-square md:aspect-video lg:aspect-square border border-border bg-zinc-100 overflow-hidden flex items-center justify-center">
            {/* Blueprint background */}
            <div
              className="absolute inset-0 opacity-20"
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

            {/* Center content */}
            <div className="z-10 flex flex-col items-center gap-4 text-center p-8">
              <div className="w-16 h-16 rounded-full border-2 border-brand-primary/50 flex items-center justify-center">
                <span className="text-3xl text-brand-primary/60">🧭</span>
              </div>
              <div>
                <p className="font-mono text-xs text-text-muted uppercase tracking-widest font-bold mb-1">
                  Active Map Renderer Engine
                </p>
                <p className="font-mono text-[10px] text-brand-primary/60 uppercase">
                  Thread_ID: 0xFF92A // Status: Streaming
                </p>
              </div>
            </div>

            {/* Top right stats */}
            <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
              <div className="flex gap-1">
                <div className="w-8 h-[2px] bg-brand-primary" />
                <div className="w-8 h-[2px] bg-zinc-300" />
                <div className="w-8 h-[2px] bg-zinc-300" />
              </div>
              <p className="font-mono text-[9px] text-text-muted">FPS: 120.0</p>
            </div>

            {/* Bottom left coordinates */}
            <div className="absolute bottom-6 left-6 bg-white p-4 border border-border">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 bg-brand-primary" />
                <span className="font-mono text-[10px] font-bold uppercase">
                  Cursor_Loc
                </span>
              </div>
              <p className="font-mono text-[9px] leading-tight text-text-muted font-bold">
                LAT: 59.329329329° N
                <br />
                LON: 18.068618068° E
                <br />
                ALT: 42.12m MSL
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
