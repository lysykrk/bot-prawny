'use client'

import { useState } from 'react'
import { Download, Copy, Check } from 'lucide-react'
import { jsPDF } from 'jspdf'

interface Message {
  role: string
  content: string
}

export default function ExportPanel({ 
  conversationHistory, 
  documentContent 
}: { 
  conversationHistory: Message[]
  documentContent: string
}) {
  const [copied, setCopied] = useState(false)
  const [exportFormat, setExportFormat] = useState<'pdf' | 'txt'>('pdf')

  const generatePetition = (): string => {
    const assistantMessages = conversationHistory
      .filter(m => m.role === 'assistant')
      .map(m => m.content)
      .join('\n\n')

    return `WNIOSEK DO SĄDU
================

Data: ${new Date().toLocaleDateString('pl-PL')}

${assistantMessages || 'Brak zawartości do eksportu. Przeprowadź rozmowę z botem.'}

Źródło: Wygenerowane przez Bot Prawny
`
  }

  const handleCopyToClipboard = () => {
    const content = generatePetition()
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    const textWidth = pageWidth - 2 * margin
    let yPosition = margin

    const title = 'WNIOSEK DO SĄDU'
    doc.setFontSize(16)
    doc.text(title, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 10

    doc.setFontSize(10)
    const date = `Data: ${new Date().toLocaleDateString('pl-PL')}`
    doc.text(date, margin, yPosition)
    yPosition += 10

    const content = generatePetition()
    doc.setFontSize(10)
    const lines = doc.splitTextToSize(content, textWidth)

    lines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage()
        yPosition = margin
      }
      doc.text(line, margin, yPosition)
      yPosition += 5
    })

    doc.save('wniosek-do-sadu.pdf')
  }

  const handleExportTXT = () => {
    const content = generatePetition()
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content))
    element.setAttribute('download', 'wniosek-do-sadu.txt')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const hasContent = conversationHistory.length > 1

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-[600px] flex flex-col">
      <h2 className="text-xl font-bold text-gray-900 mb-4">📤 Eksport</h2>

      <div className="flex-1 flex flex-col">
        {!hasContent ? (
          <div className="flex-1 flex items-center justify-center text-center text-gray-500">
            <p className="text-sm">
              Przeprowadź rozmowę z botem, aby wygenerować wniosek.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-gray-50 rounded-lg p-4 flex-1 overflow-y-auto border border-gray-200 mb-4">
              <p className="text-xs font-medium text-gray-600 mb-2">PODGLĄD:</p>
              <div className="text-xs text-gray-700 whitespace-pre-wrap">
                {generatePetition().substring(0, 300)}...
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Format:
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setExportFormat('pdf')}
                    className={`flex-1 px-3 py-2 rounded text-sm font-medium transition ${
                      exportFormat === 'pdf'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => setExportFormat('txt')}
                    className={`flex-1 px-3 py-2 rounded text-sm font-medium transition ${
                      exportFormat === 'txt'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    TXT
                  </button>
                </div>
              </div>

              <button
                onClick={handleCopyToClipboard}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Skopiowano!' : 'Kopiuj'}
              </button>

              <button
                onClick={exportFormat === 'pdf' ? handleExportPDF : handleExportTXT}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4" />
                Pobierz {exportFormat.toUpperCase()}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 border-t border-gray-200 pt-4">
        <p className="font-medium mb-2">ℹ️ Informacja:</p>
        <p>Eksportuj rozmowę jako wniosek do sądu lub dokument tekstowy.</p>
      </div>
    </div>
  )
}