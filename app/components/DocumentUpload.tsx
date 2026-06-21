'use client'

import { useState } from 'react'
import { Upload, File, X, Plus } from 'lucide-react'
import type { Document } from '../page'

export default function DocumentUpload({ 
  documents,
  onAddDocument,
  onRemoveDocument
}: { 
  documents: Document[]
  onAddDocument: (name: string, content: string) => void
  onRemoveDocument: (id: string) => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        onAddDocument(file.name, data.content)
      } else {
        setError(data.error || 'Błąd podczas przesyłania pliku')
      }
    } catch (err) {
      setError('Błąd połączenia')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-[600px] flex flex-col">
      <h2 className="text-xl font-bold text-gray-900 mb-4">📄 Dokumenty ({documents.length})</h2>

      <div className="flex-1 flex flex-col">
        {documents.length === 0 ? (
          <label className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition flex flex-col items-center justify-center">
            <Upload className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-700 text-center">
              Przeciągnij dokument lub kliknij
            </p>
            <p className="text-xs text-gray-500 mt-1">PDF, DOCX, TXT</p>
            <input
              type="file"
              accept=".pdf,.docx,.txt,.doc"
              onChange={handleFileUpload}
              className="hidden"
              disabled={loading}
            />
          </label>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <File className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="font-medium text-sm text-gray-900 truncate">
                      {doc.name}
                    </span>
                  </div>
                  <button
                    onClick={() => onRemoveDocument(doc.id)}
                    className="text-gray-400 hover:text-red-500 transition flex-shrink-0 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round(doc.content.length / 1024)} KB
                </div>
              </div>
            ))}

            {/* Add another document button */}
            <label className="border-2 border-dashed border-gray-300 rounded-lg p-3 cursor-pointer hover:border-blue-500 transition flex items-center justify-center gap-2 text-gray-500 hover:text-blue-500">
              <Plus className="w-4 h-4" />
              <span className="text-xs font-medium">Dodaj dokument</span>
              <input
                type="file"
                accept=".pdf,.docx,.txt,.doc"
                onChange={handleFileUpload}
                className="hidden"
                disabled={loading}
              />
            </label>
          </div>
        )}

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 border-t border-gray-200 pt-4">
        <p className="font-medium mb-2">💡 Wskazówki:</p>
        <ul className="space-y-1">
          <li>✓ Dodaj wiele kodeksów</li>
          <li>✓ Załącz postanowienia sądu</li>
          <li>✓ Analizuj razem wszystkie dokumenty</li>
        </ul>
      </div>
    </div>
  )
}