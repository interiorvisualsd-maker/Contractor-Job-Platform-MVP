import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">F</div>
            <span className="font-semibold text-slate-900">Fixr</span>
          </div>
          <Link href="/submit" className="btn-primary text-sm">Submit a job</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-3xl mx-auto px-4 py-12 md:py-20 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Home repair?<br className="md:hidden" /> We match you with a verified pro.
          </h1>
          <p className="mt-4 text-base md:text-lg text-slate-600 max-w-xl mx-auto">
            Submit your job in 2 minutes. No account needed. A qualified local contractor will follow up with a quote.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/submit" className="btn-primary text-base px-6 py-3">Submit a job →</Link>
            <a href="#how" className="btn-secondary text-base px-6 py-3">How it works</a>
          </div>
          <p className="mt-3 text-xs text-slate-400">Free to submit · No account required</p>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Step
            num="1"
            title="Submit your job"
            text="Tell us what needs fixing. Add photos so the contractor knows what they're walking into."
          />
          <Step
            num="2"
            title="We qualify & assign"
            text="Our admin team reviews your job and matches you with a verified contractor in your area."
          />
          <Step
            num="3"
            title="Get a quote"
            text="The contractor reviews your job, sends a quote, and reaches out to schedule the work."
          />
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">What do you need fixed?</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {["Plumbing", "Electrical", "Roofing", "Carpentry", "Painting", "HVAC", "General Repair", "Renovation", "Flooring", "Other"].map((cat) => (
              <Link
                key={cat}
                href={`/submit?category=${encodeURIComponent(cat)}`}
                className="card px-4 py-3 text-center text-sm font-medium text-slate-700 hover:border-blue-300 hover:text-blue-700 transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-blue-600">
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-white">Ready to get started?</h2>
          <p className="mt-2 text-blue-100">Submit your job now. Takes less than 2 minutes.</p>
          <Link href="/submit" className="mt-6 inline-flex bg-white text-blue-600 font-semibold px-6 py-3 rounded-md hover:bg-blue-50 transition-colors">
            Submit a job →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center text-xs flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>© 2026 Fixr. Prototype demo.</span>
          <div className="flex gap-4">
            <Link href="/admin/login" className="hover:text-white">Admin</Link>
            <Link href="/contractor/login" className="hover:text-white">Contractor</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Step({ num, title, text }: { num: string; title: string; text: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold mb-3">{num}</div>
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-600">{text}</p>
    </div>
  );
}
