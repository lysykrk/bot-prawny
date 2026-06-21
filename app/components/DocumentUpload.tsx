'use client'

import { useState } from 'react'
import { Upload, File, X } from 'lucide-react'

export default function DocumentUpload({ 
  onDocumentUpload, 
  currentContent 
}: { 
  onDocumentUpload: (content: string) => void
  currentContent: string
}) {
  const [fileName, setFileName] = useState<string>('')
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
        onDocumentUpload(data.content)
        setFileName(file.name)
      } else {
        setError(data.error || 'Błąd podczas przesyłania pliku')
      }
    } catch (err) {
      setError('Błąd połączenia')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    onDocumentUpload('')
    setFileName('')
    setError('')
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-[600px] flex flex-col">
      <h2 className="text-xl font-bold text-gray-900 mb-4">📄 Dokumenty</h2>

      <div className="flex-1 flex flex-col">
        {!currentContent ? (
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
          <div className="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <File className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-sm text-gray-900">{fileName}</span>
              </div>
              <button
                onClick={handleClear}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-gray-600 max-h-96 overflow-y-auto bg-white p-3 rounded border border-gray-200">
              {currentContent.substring(0, 500)}...
            </div>
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
          <li>✓ Wgraj kodeks lub ustawę</li>
          <li>✓ Dodaj postanowienie sądu</li>
          <li>✓ Przygotuj notatki sprawy</li>
        </ul>
      </div>
    </div>
  )
}