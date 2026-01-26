export default function StatsBar() {
  return (
    <section className="bg-white border-b border">
      <div className="max-w-[1440px] mx-auto px-8 py-3 flex flex-wrap gap-x-12 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-text-muted uppercase">
            Latency:
          </span>
          <span className="font-mono text-[10px] font-bold text-brand-primary uppercase">
            0.42ms AVG
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-text-muted uppercase">
            Uptime:
          </span>
          <span className="font-mono text-[10px] font-bold text-brand-primary uppercase">
            99.992%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-text-muted uppercase">
            Active_Nodes:
          </span>
          <span className="font-mono text-[10px] font-bold text-brand-primary uppercase">
            14 Global
          </span>
        </div>
      </div>
    </section>
  )
}
