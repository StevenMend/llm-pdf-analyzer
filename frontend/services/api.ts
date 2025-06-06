const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export class APIService {
  static async uploadPDF(file: File): Promise<{ pdf_id: string; content: string }> {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch(`${API_BASE_URL}/api/pdf/upload`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to upload PDF")
    }

    return response.json()
  }

  static async sendMessage(message: string, pdfId: string): Promise<Response> {
    return fetch(`${API_BASE_URL}/api/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        pdf_id: pdfId,
      }),
    })
  }

  static async getAnalysisHistory(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/history`)

    if (!response.ok) {
      throw new Error("Failed to fetch history")
    }

    return response.json()
  }
}
