"use client"

import { useState } from "react"
import { Menu, X, FileText, MessageSquare, History } from "lucide-react"

interface NavbarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export default function Navbar({ activeSection, onSectionChange }: NavbarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const navItems = [
    { id: "home", label: "Home", icon: FileText },
    { id: "upload", label: "Upload PDF", icon: FileText },
    { id: "chat", label: "Analysis", icon: MessageSquare },
    { id: "history", label: "History", icon: History },
  ]

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white/95 backdrop-blur-xl border-r border-slate-200 z-50 transform transition-all duration-500 ease-out md:hidden ${
          isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">PDFAnalyzer</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSectionChange(item.id)
                    setIsSidebarOpen(false)
                  }}
                  className={`w-full flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${
                    activeSection === item.id
                      ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/25"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="font-medium text-lg">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>
      <nav className="fixed top-4 inset-x-4 z-30 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-lg shadow-slate-900/5 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">PDFAnalyzer</span>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => onSectionChange(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      activeSection === item.id
                        ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/25"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-300 transform hover:scale-110"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}
