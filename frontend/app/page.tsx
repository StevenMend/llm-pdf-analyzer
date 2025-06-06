"use client"

import { useState, useRef } from "react"
import Navbar from "@/components/Navbar"
import HeroSection from "@/components/HeroSection"
import PDFUploader from "@/components/PDFUploader"
import ChatInterface from "@/components/ChatInterface"
import AnalysisHistory from "@/components/AnalysisHistory"
import type { PDFDocument, ChatMessage, AnalysisSession } from "@/types"

export default function Page() {
  const [currentPDF, setCurrentPDF] = useState<PDFDocument | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sessions, setSessions] = useState<AnalysisSession[]>([])
  const [activeSection, setActiveSection] = useState("home")
  const [hasSavedSession, setHasSavedSession] = useState(false)
  const [selectedSession, setSelectedSession] = useState<AnalysisSession | null>(null)
  const [conversationId, setConversationId] = useState<string>("default")


  const selectedSessionRef = useRef<AnalysisSession | null>(null)

  const handlePDFUpload = (pdf: PDFDocument) => {
    console.log("handlePDFUpload call:", pdf)
    const newConversationId = crypto.randomUUID() 
    setConversationId(newConversationId)
    setCurrentPDF(pdf)
    setMessages([])
    setSelectedSession(null)
    selectedSessionRef.current = null
    setHasSavedSession(false)
    setActiveSection("chat")
  }

  const handleNewMessage = (message: ChatMessage) => {
    console.log("new message:", message)
    setMessages((prev) => [...prev, message])

    const current = selectedSessionRef.current

    if (!hasSavedSession && !current && currentPDF && currentPDF.id) {
      const newSession: AnalysisSession = {
        id: Date.now().toString(),
        pdf: currentPDF,
        messages: [message],
        createdAt: new Date(),
      }
      setSelectedSession(newSession)
      selectedSessionRef.current = newSession
      setSessions((prev) => [newSession, ...prev])
      setHasSavedSession(true)
    } else if (current) {
      const updatedSession: AnalysisSession = {
        ...current,
        messages: [...current.messages, message],
      }
      setSelectedSession(updatedSession)
      selectedSessionRef.current = updatedSession
      setSessions((prev) =>
        prev.map((s) => (s.id === updatedSession.id ? updatedSession : s))
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 transition-colors duration-300">
      <Navbar activeSection={activeSection} onSectionChange={setActiveSection} />

      <main className="relative">
        {activeSection === "home" && (
          <HeroSection onGetStarted={() => setActiveSection("upload")} />
        )}

        {activeSection === "upload" && (
          <section id="upload" className="min-h-screen flex items-center justify-center px-4 pt-24 pb-8">
            <div className="w-full max-w-4xl">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Upload your PDF</h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  Drag and drop your document or click to select. We'll analyze the content with advanced AI.
                </p>
              </div>
              <PDFUploader onUpload={handlePDFUpload} />
            </div>
          </section>
        )}

        {activeSection === "chat" && (
          <section id="chat" className="min-h-screen px-4 pt-24 pb-8">
            <ChatInterface
            pdf={currentPDF}
            setPdf={setCurrentPDF}
            conversationId={conversationId}
            setConversationId={setConversationId}
            messages={messages}
            onNewMessage={handleNewMessage}
            onSaveSession={() => {}}
            onUpload={handlePDFUpload}
            />
          </section>
        )}

        {activeSection === "history" && (
          <section id="history" className="min-h-screen px-4 pt-24 pb-8">
            <AnalysisHistory
              sessions={sessions}
              onSelectSession={(session) => {
                setCurrentPDF(session.pdf)
                setMessages(session.messages)
                setSelectedSession(session)
                selectedSessionRef.current = session
                setHasSavedSession(true)
                setActiveSection("chat")
              }}
            />
          </section>
        )}
      </main>
    </div>
  )
}