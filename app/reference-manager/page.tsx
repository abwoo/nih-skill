export const metadata = {
  title: 'Reference Manager - NIH Skill',
  description: 'Search, analyze, and organize your biomedical literature with AI-powered insights'
}

// Temporary fallback component while ReferenceManager is being optimized
function ReferenceManagerFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md p-8">
        <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-indigo-500/25">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Reference Manager
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            AI-powered literature search and analysis tool is being optimized for the new design system.
          </p>
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-400">
              Coming Soon
            </div>
          </div>
        </div>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          ← Back to Home
        </a>
      </div>
    </div>
  )
}

export default function ReferenceManagerPage() {
  return <ReferenceManagerFallback />
}
