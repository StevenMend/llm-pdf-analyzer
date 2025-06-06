"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react"
import type { PDFDocument } from "@/types"

interface PDFUploaderProps {
  onUpload: (pdf: PDFDocument) => void
}

export default function PDFUploader({ onUpload }: PDFUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setError(null)
      setIsUploading(true)
      setUploadedFile(file)
      setUploadProgress(0)

      try {
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + 10
          })
        }, 200)

        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("http://localhost:8000/api/pdf/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Upload failed with:", errorText)
          throw new Error("Error uploading PDF")
        }

        const data = await response.json()
        console.log("Upload response:", data)

        setUploadProgress(100)

        const pdfDoc: PDFDocument = {
          id: data.pdf_id,
          name: file.name,
          size: file.size,
          uploadedAt: new Date(),
          content: "PDF content would be extracted here...",
        }

        setTimeout(() => {
          onUpload(pdfDoc)
          setIsUploading(false)
        }, 500)
      } catch (err) {
        console.error("Upload error:", err)
        setError("Error processing PDF. Please try again.")
        setIsUploading(false)
        setUploadProgress(0)
      }
    },
    [onUpload],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    disabled: isUploading,
  })

  const resetUpload = () => {
    setUploadedFile(null)
    setError(null)
    setUploadProgress(0)
    setIsUploading(false)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 cursor-pointer ${
          isDragActive
            ? "border-teal-400 bg-teal-50"
            : isUploading
              ? "border-slate-300 bg-slate-50 cursor-not-allowed"
              : "border-slate-300 hover:border-teal-400 hover:bg-teal-50 hover:shadow-md hover:shadow-teal-200 transform hover:scale-105"
        }`}
      >
        <input {...getInputProps()} />

        {!isUploading && !uploadedFile && (
          <>
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-bounce">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-3">
              {isDragActive ? "Drop your PDF here" : "Drag your PDF here"}
            </h3>
            <p className="text-slate-600 mb-6">Or click to select a file from your device</p>
            <div className="inline-flex items-center space-x-2 text-sm text-slate-500">
              <FileText className="w-4 h-4" />
              <span>PDF files only</span>
            </div>
          </>
        )}

        {isUploading && uploadedFile && (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
              <FileText className="w-8 h-8 text-teal-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Processing {uploadedFile.name}</h3>
              <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
                <div
                  className="bg-gradient-to-r from-teal-500 to-cyan-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-slate-600">{uploadProgress}% complete</p>
            </div>
          </div>
        )}

        {uploadProgress === 100 && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-green-700">PDF processed successfully!</h3>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-700">{error}</p>
          </div>
          <button onClick={resetUpload} className="text-red-500 hover:text-red-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}
