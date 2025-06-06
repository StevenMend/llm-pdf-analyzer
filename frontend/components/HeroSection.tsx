"use client"

import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react"

interface HeroSectionProps {
  onGetStarted: () => void
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <div className="min-h-screen pt-24 pb-8 flex flex-col items-center justify-center text-center px-4">
      <div className="max-w-5xl w-full">
        <div className="mb-4 sm:mb-6">
          <div className="inline-flex items-center space-x-2 bg-teal-50 text-teal-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4 shadow-lg animate-float">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Powered by OpenAI</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-2 sm:mb-3 leading-tight">
            Analyze any PDF
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 animate-gradient">
              with Advanced AI
            </span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-600 max-w-2xl mx-auto mb-3 sm:mb-4 leading-relaxed">
            Upload your document and ask smart questions. Get accurate answers in real-time with the power of top
            language models.
          </p>

          <button
            onClick={onGetStarted}
            className="group inline-flex items-center space-x-2 sm:space-x-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold hover:from-teal-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-xl mb-4 sm:mb-6"
          >
            <span>Start Analysis</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 sm:group-hover:translate-x-2 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          <div className="bg-white/60 backdrop-blur-sm p-3 sm:p-4 rounded-xl md:rounded-2xl border border-slate-200 animate-float-delay-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg sm:rounded-xl flex items-center justify-center mb-1 sm:mb-2 shadow-lg">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-1">Real-time Answers</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-snug">Get instant answers with AI streaming.</p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm p-3 sm:p-4 rounded-xl md:rounded-2xl border border-slate-200 animate-float-delay-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg sm:rounded-xl flex items-center justify-center mb-1 sm:mb-2 shadow-lg">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-1">No Storage, No Trace</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-snug">
              Everything runs in-memory.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm p-3 sm:p-4 rounded-xl md:rounded-2xl border border-slate-200 animate-float-delay-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg sm:rounded-xl flex items-center justify-center mb-1 sm:mb-2 shadow-lg">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-1">Secure & Private</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-snug">Your documents are processed securely.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
