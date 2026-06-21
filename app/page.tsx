'use client'

import { useState } from 'react'
import ChatInterface from './components/ChatInterface'
import DocumentUpload from './components/DocumentUpload'
import ExportPanel from './components/ExportPanel'

export interface Document {
  id: string
  name: string
  content: string
}

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([])

  const handleAddDocument = (name: string, content: string) => {
    const newDoc: Document = {
      id: Date.now().toString(),
      name,
      content,
    }
    setDocuments(prev => [...prev, newDoc])
  }

  const handleRemoveDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id))
  }

  const combinedContent = documents.map(doc => `--- ${doc.name} ---\n${doc.content}`).join('\n\n')

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">⚖️ Bot Prawny</h1>
          <p className="text-gray-600">Analiza aktów prawnych i generowanie wniosków do sądu</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Upload */}
          <div className="lg:col-span-1">
            <DocumentUpload 
              documents={documents}
              onAddDocument={handleAddDocument}
              onRemoveDocument={handleRemoveDocument}
            />
          </div>

          {/* Middle Panel - Chat */}
          <div className="lg:col-span-1">
            <ChatInterface 
              documentContent={combinedContent}
              onConversationUpdate={setConversationHistory}
            />
          </div>

          {/* Right Panel - Export */}
          <div className="lg:col-span-1">
            <ExportPanel 
              conversationHistory={conversationHistory}
              documentContent={combinedContent}
            />
          </div>
        </div>
      </div>
    </main>
  )
}