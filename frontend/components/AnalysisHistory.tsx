"use client"

import { useState } from "react"
import { FileText, MessageSquare, Calendar, Search, Trash2 } from "lucide-react"
import type { AnalysisSession } from "@/types"

interface AnalysisHistoryProps {
  sessions: AnalysisSession[]
  onSelectSession: (session: AnalysisSession) => void
}

export default function AnalysisHistory({ sessions, onSelectSession }: AnalysisHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredSessions = sessions.filter(
    (session) =>
      session.pdf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.messages.some((msg) => msg.content.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Analysis History</h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Review your past analyses and continue conversations where you left off.
        </p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search history..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-slate-900 placeholder-slate-500"
        />
      </div>


      {filteredSessions.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            {searchTerm ? "No results found" : "No analyses yet"}
          </h3>
          <p className="text-slate-600">
            {searchTerm ? "Try different search terms" : "Upload your first PDF to start analyzing documents"}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-violet-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() => onSelectSession(session)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all duration-200">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-semibold text-slate-900 mb-2 truncate">{session.pdf.name}</h3>

              <div className="flex items-center space-x-4 text-sm text-slate-500 mb-4">
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{session.messages.length} messages</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(session.createdAt)}</span>
                </div>
              </div>


              {session.messages.length > 0 && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-sm text-slate-600 line-clamp-3">
                    {session.messages[session.messages.length - 1].content}
                  </p>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-400">{(session.pdf.size / 1024 / 1024).toFixed(2)} MB</span>
                <div className="text-violet-600 group-hover:translate-x-1 transition-transform duration-200">→</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
