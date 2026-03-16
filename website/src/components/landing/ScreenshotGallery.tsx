import DownloadButtons from '../DownloadButtons'

export default function ScreenshotGallery() {
  const screenshots = [
    {
      src: '/assets/images/gallery/list.png',
      alt: 'Browse competitions list',
    },
    {
      src: '/assets/images/gallery/results.png',
      alt: 'View live results and standings',
    },
    {
      src: '/assets/images/gallery/profile.png',
      alt: 'User profile and settings',
    },
    {
      src: '/assets/images/gallery/tracking-list.png',
      alt: 'Manage your tracked runners',
    },
    {
      src: '/assets/images/gallery/tracking-results.png',
      alt: 'Track runners with live results',
    },
    {
      src: '/assets/images/gallery/search.png',
      alt: 'Search for competitions and events',
    },
  ]

  return (
    <section className="relative bg-white border-y border-border py-24 overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(249, 95, 6, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249, 95, 6, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-[1440px] mx-auto px-8 relative">
        {/* Section header */}
        <div className="flex flex-col mb-16">
          <h4 className="font-mono text-brand-primary text-lg font-bold leading-normal tracking-[0.3em] uppercase">
            Experience the interface
          </h4>
          <div className="w-12 h-1 bg-brand-primary mt-2" />
        </div>

        {/* Gallery container */}
        <div className="relative">
          {/* Fade overlays for scroll indication */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          {/* Scrollable gallery */}
          <div className="overflow-x-auto pb-4 hide-scrollbar">
            <div className="flex gap-8 min-w-min px-4">
              {screenshots.map((screenshot, index) => (
                <div
                  key={index}
                  className="shrink-0 relative"
                  style={{ width: '280px' }}
                >
                  {/* Device frame */}
                  <div className="relative bg-text-main rounded-4xl p-2 shadow-lg">
                    {/* Screen */}
                    <div className="relative bg-white rounded-3xl overflow-hidden border-2 border-text-main/10">
                      <img
                        src={screenshot.src}
                        alt={screenshot.alt}
                        className="w-full h-auto aspect-[9/19.5] object-cover"
                        loading="lazy"
                      />

                      {/* Screen glare effect */}
                      <div className="absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA below gallery */}
        <div className="mt-16 text-center">
          <p className="text-text-muted text-xl mb-6">
            Available on iOS and Android
          </p>
          <div className="flex justify-center">
            <DownloadButtons />
          </div>
        </div>
      </div>

      {/* Custom CSS for hiding scrollbar while maintaining scroll */}
      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}
