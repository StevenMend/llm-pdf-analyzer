"use client"

import { useState, useCallback } from "react"
import type { ChatMessage } from "@/types"

export function useStreamingChat() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState("")

  const sendMessage = useCallback(
    async (message: string, pdfId: string, onMessage: (message: ChatMessage) => void) => {
      setIsStreaming(true)
      setStreamingMessage("")

      try {
        const response = await fetch("http://127.0.0.1:8000/api/chat/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            pdf_id: pdfId,
          }),
        })

        if (!response.ok || !response.body) {
          throw new Error("Failed to send message or empty body")
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let fullResponse = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.replace("data: ", "").trim()
              if (!data) continue

              try {
                const parsed = JSON.parse(data)

                if (parsed.type === "done") continue

                console.log(`📩 SSE: [${parsed.type}] ${parsed.content?.slice(0, 60) || "(sin contenido)"}`)

                if (parsed.type === "content") {
                  fullResponse += parsed.content
                  setStreamingMessage(fullResponse.trim())
                }
              } catch (err) {
                console.warn("Could not parse SSE line:", data)
              }
            }
          }
        }

        const aiMessage: ChatMessage = {
          id: Date.now().toString(),
          type: "assistant",
          content: fullResponse.trim(),
          timestamp: new Date(),
        }

        onMessage(aiMessage)
        setStreamingMessage("")
      } catch (error) {
        console.error("Error sending message:", error)
      } finally {
        setIsStreaming(false)
      }
    },
    []
  )

  return {
    isStreaming,
    streamingMessage,
    sendMessage,
  }
}
