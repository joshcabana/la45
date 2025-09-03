export default function Page() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
      <h1 className="font-serif text-4xl md:text-6xl leading-tight">
        Meet in <span className="text-gold">45 seconds</span>. <br />
        Real‑time intros, zero swipe fatigue.
      </h1>
      <p className="mt-6 max-w-xl text-white/70">
        LA45 pairs you in a live, 45‑second video intro. If you both like, you match. No endless chat. No noise.
      </p>
      <div className="mt-10 flex gap-4">
        <a href="/queue" className="inline-flex items-center px-5 py-3 bg-white text-black rounded-md hover:opacity-90">Enter LA45</a>
        <a href="/safety" className="inline-flex items-center px-5 py-3 border border-white/30 rounded-md hover:border-white">Safety</a>
      </div>
    </section>
  )
}

