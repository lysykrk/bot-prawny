import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Plik jest wymagany' },
        { status: 400 }
      )
    }

    const fileType = file.type
    const buffer = await file.arrayBuffer()
    let content = ''

    // Handle text files
    if (fileType === 'text/plain') {
      content = new TextDecoder().decode(buffer)
    } else if (fileType === 'application/pdf') {
      // For PDF, return simplified text extraction
      content = await extractTextFromBuffer(buffer)
    } else if (
      fileType === 'application/msword' ||
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      content = await extractTextFromBuffer(buffer)
    } else {
      return NextResponse.json(
        { error: 'Nieobsługiwany format pliku' },
        { status: 400 }
      )
    }

    if (!content) {
      return NextResponse.json(
        { error: 'Nie udało się wyodrębnić tekstu z pliku' },
        { status: 400 }
      )
    }

    return NextResponse.json({ content: content.substring(0, 10000) })
  } catch (error: any) {
    console.error('Upload API Error:', error)
    return NextResponse.json(
      { error: 'Błąd podczas przetwarzania pliku' },
      { status: 500 }
    )
  }
}

async function extractTextFromBuffer(buffer: ArrayBuffer): Promise<string> {
  try {
    const uint8Array = new Uint8Array(buffer)
    const text = new TextDecoder().decode(uint8Array)
    
    // Remove binary/control characters but keep text
    const cleanText = text
      .replace(/[^\x20-\x7E\n\r\t\u0100-\uFFFF]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    
    return cleanText
  } catch (error) {
    return ''
  }
}