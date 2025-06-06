"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, FileText, Sparkles, Copy, ExternalLink, Trash } from "lucide-react"
import type { PDFDocument, ChatMessage, AnalysisSession } from "@/types"

interface ChatInterfaceProps {
  pdf: PDFDocument
  setPdf: React.Dispatch<React.SetStateAction<PDFDocument | null>>
  messages: ChatMessage[]
  onNewMessage: (message: ChatMessage) => void
  onSaveSession: (session: AnalysisSession) => void
  onUpload: (pdf: PDFDocument) => void
  conversationId: string  
  setConversationId: React.Dispatch<React.SetStateAction<string>> 
}

export default function ChatInterface({
  pdf,
  setPdf,
  messages,
  onNewMessage,
  onSaveSession,
  onUpload,
  conversationId,
  setConversationId,
}: ChatInterfaceProps) {
  if (!pdf)  {
    return (
      <div className="max-w-4xl mx-auto h-[calc(100vh-6rem)] flex items-center justify-center px-4">
        <div className="max-w-3xl rounded-2xl p-6 bg-white border border-slate-200 shadow-lg text-slate-600 text-center text-sm animate-float-delay-1">
          A document has not been uploaded yet, real-time analysis is not available.
        </div>
      </div>
    )
  }



  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState("")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(messages)

  const hasGeneratedInitialSummary = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [hasCleared, setHasCleared] = useState(false)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

 
  const handleNewMessage = (msg: ChatMessage) => {
  setHasCleared(false)
  setChatMessages((prev) => [...prev, msg])
  onNewMessage(msg)
}


  const welcomeMessage: ChatMessage = {
    id: Date.now().toString(),
    type: "assistant",
    content: `The document "${pdf.name}" has been successfully uploaded. You can now ask me anything about its content.`,
    timestamp: new Date(),
    isWelcome: true,
  } as ChatMessage


  useEffect(() => {
  const newWelcome: ChatMessage = {
    id: Date.now().toString(),
    type: "assistant",
    content: `The document "${pdf.name}" has been successfully uploaded. You can now ask me anything about its content.`,
    timestamp: new Date(),
    isWelcome: true,
  }

  setChatMessages([newWelcome])
  setHasCleared(false)
  scrollToBottom()
}, [pdf?.id])




  useEffect(() => {
  if (!pdf?.id) return

  const alreadyHasWelcome = messages.some((m) => m.isWelcome)

  const welcomeMessage: ChatMessage = {
    id: Date.now().toString(),
    type: "assistant",
    content: `The document "${pdf.name}" has been successfully uploaded. You can now ask me anything about its content.`,
    timestamp: new Date(),
    isWelcome: true,
  }

  const initialMessages = alreadyHasWelcome
    ? messages
    : [welcomeMessage, ...messages]

  setChatMessages(initialMessages)
}, [])






  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingMessage])

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages, streamingMessage])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement)?.closest(".menu-container")) {
        setShowMenu(false)
      }
    }
    window.addEventListener("click", handleClickOutside)
    return () => window.removeEventListener("click", handleClickOutside)
  }, [])

  useEffect(() => {
    console.log("🔥 ChatInterface montado")
    return () => {
      console.log("💀 ChatInterface desmontado")
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    handleNewMessage(userMessage)
    const userInput = input.trim()
    setInput("")
    setIsStreaming(true)
    setStreamingMessage("")

    try {
      const response = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userInput,
          pdf_id: pdf.id,
          conversation_id: conversationId,
        }),
      })

      if (!response.ok || !response.body) throw new Error("Error en la respuesta del servidor")

      const reader = response.body.getReader()
      const decoder = new TextDecoder("utf-8")
      let buffer = ""
      let accumulated = ""

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split("\n\n")
        buffer = events.pop() || ""

        for (const event of events) {
          if (!event.startsWith("data: ")) continue
          const jsonStr = event.slice(6).trim()
          if (!jsonStr) continue

          const parsed = JSON.parse(jsonStr)
          console.log("📩 parsed:", parsed)

          if (parsed.type === "content") {
            accumulated += parsed.content
            setStreamingMessage(accumulated)
          } else if (parsed.type === "done") {
            const aiMessage: ChatMessage = {
              id: Date.now().toString(),
              type: "assistant",
              content: accumulated,
              timestamp: new Date(),
            }
            handleNewMessage(aiMessage)
            setStreamingMessage("")
          }
        }
      }
    } catch (error) {
      console.error("Error en streaming:", error)
    } finally {
      setIsStreaming(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleClearMessages = () => {
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "assistant",
      content: `The document "${pdf.name}" has been successfully uploaded. You can now ask me anything about its content.`,
      timestamp: new Date(),
      isWelcome: true,
    }
    setChatMessages([welcomeMessage])
    setHasCleared(true)
    setShowMenu(false)
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const openPDFInNewWindow = () => {
    window.open(`/api/pdf/view/${pdf.id}`, "_blank")
  }

  const handleExportConversation = () => {
    if (chatMessages.length === 0) return

    const plainText = chatMessages
      .map((msg) => {
        const sender = msg.type === "user" ? "You" : "AI Assistant"
        return `${sender}:\n${msg.content}\n`
      })
      .join("\n")

    const blob = new Blob([plainText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `conversation-${conversationId}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-6rem)] flex flex-col relative">
      <div className="flex-1 overflow-y-auto relative pt-[72px] pb-[160px] space-y-6 mb-6 pr-1 pl-1 sm:pr-2 sm:pl-2 minimal-scrollbar">
        {chatMessages.map((m) => (
          <div key={m.id} className={`flex ${m.type === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-3xl rounded-2xl p-6 ${
                m.type === "user"
                  ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  : "bg-white border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300"
              } transform hover:scale-[1.02] transition-transform duration-300 animate-float-delay-1`}
            >
              <div className="flex items-start space-x-3">
                {m.type === "assistant" && (
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <p className={`text-sm ${m.type === "user" ? "text-cyan-100" : "text-slate-500"} mb-2`}>
                    {m.type === "user" ? "You" : "AI Assistant"}
                  </p>

                  {m.attachment && (
                    <div className="mb-3">
                      <div className="inline-flex items-center bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-3 shadow-md hover:shadow-lg transition-all duration-300 group">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-sm">
                            <FileText className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-white truncate text-sm">{m.attachment.name}</h4>
                            <p className="text-xs text-cyan-100">
                              PDF • {(m.attachment.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={openPDFInNewWindow}
                          className="ml-2 p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200 transform hover:scale-110"
                          title="Open PDF"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {m.content && (
                    <div className={`prose ${m.type === "user" ? "prose-invert" : ""} max-w-none`}>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </div>
                  )}

                  {m.type === "assistant" && (
                    <div className="flex items-center space-x-2 mt-4">
                      <button
                        onClick={() => copyToClipboard(m.content)}
                        className="p-2 text-slate-400 hover:text-teal-600 transition-all duration-300 rounded-lg hover:bg-teal-50 transform hover:scale-110"
                        title="Copy response"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isStreaming && (
          <>
            <div className="flex items-center text-sm text-gray-500 italic mb-2">
              <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
              The assistant is typing...
            </div>

            <div className="flex justify-start">
              <div className="max-w-3xl bg-white border border-slate-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] animate-float-delay-2">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                    <Sparkles className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-500 mb-2">AI Assistant</p>
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-wrap">
                        {streamingMessage}
                        <span className="inline-block w-2 h-5 bg-cyan-500 ml-1 animate-pulse" />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="fixed bottom-0 left-0 right-0 px-4 pb-4 z-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-4 shadow-lg">
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question about your PDF..."
                  className="w-full resize-none border-0 focus:ring-0 text-slate-900 placeholder-slate-500 bg-transparent"
                  rows={1}
                  style={{ minHeight: "24px", maxHeight: "120px" }}
                  disabled={isStreaming}
                />
              </div>

              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="p-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl hover:from-teal-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Send className="w-5 h-5" />
              </button>


              <div className="relative menu-container">
                <button
                  type="button"
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 shadow transition-all duration-300 transform hover:scale-105"
                  title="More actions"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-slate-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6h.01M12 12h.01M12 18h.01"
                    />
                  </svg>
                </button>

                {showMenu && (
                  <div className="absolute bottom-full right-0 mb-2 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                    <button
                      onClick={handleExportConversation}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      Export Chat
                    </button>
                    <button
                      onClick={handleClearMessages}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Clear Chat
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}




