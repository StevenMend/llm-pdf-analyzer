export interface PDFDocument {
  id: string
  name: string
  size: number
  uploadedAt: Date
  content: string
}

export interface ChatMessage {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  attachment?: PDFDocument
}

export interface AnalysisSession {
  id: string
  pdf: PDFDocument
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}
