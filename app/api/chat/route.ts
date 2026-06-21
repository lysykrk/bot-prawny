import { NextRequest, NextResponse } from 'next/server'
import { VertexAI } from '@google-cloud/vertexai'

const SYSTEM_PROMPT = `Jesteś Bot Prawny - ekspertem w prawie polskim i pomocy w przygotowaniu dokumentów sądowych.

Twoje obowiązki:
1. Analizuj dokumenty prawne, ustawy i kodeksy
2. Wyjaśniaj skomplikowane pojęcia prawne w prosty, zrozumiały sposób
3. Pomagaj w przygotowaniu wniosków do sądu
4. Udzielaj porad dotyczących procedury sądowej
5. Generuj szablony dokumentów sądowych

Zawsze:
- Odpowiadaj po polsku
- Bądź precyzyjny i szczegółowy
- Odwołuj się do konkretnych artykułów kodeksów
- Wskaż potencjalne zagrożenia lub braki w dokumentach
- Proponuj poprawki i ulepszenia
- Kiedy potrzeba, zastrzegaj, że to nie jest porada prawna od prawnika`

let vertexAI: VertexAI | null = null

function initializeVertexAI() {
  if (!vertexAI) {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID
    
    if (!projectId) {
      throw new Error('GOOGLE_CLOUD_PROJECT_ID nie skonfigurowany')
    }

    vertexAI = new VertexAI({
      project: projectId,
      location: 'us-central1',
    })
  }
  return vertexAI
}

export async function POST(request: NextRequest) {
  try {
    const { message, documentContent, conversationHistory } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Wiadomość jest wymagana' },
        { status: 400 }
      )
    }

    const vertexAI = initializeVertexAI()

    // Prepare conversation history
    const messages: any[] = []

    // Add document context if available
    if (documentContent) {
      messages.push({
        role: 'user',
        parts: [{
          text: `Przeanalizuj poniższy dokument prawny:\n\n${documentContent.substring(0, 3000)}`,
        }],
      })
      messages.push({
        role: 'model',
        parts: [{
          text: 'Przeanalizowałem dokument. Co chciałbyś wiedzieć?',
        }],
      })
    }

    // Add conversation history
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach((msg: any) => {
        messages.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{
            text: msg.content,
          }],
        })
      })
    }

    // Add current message
    messages.push({
      role: 'user',
      parts: [{
        text: message,
      }],
    })

    const model = vertexAI.getGenerativeModel({
      model: 'gemini-pro',
    })

    const chat = model.startChat({
      history: messages.slice(0, -1),
    })

    const response = await chat.sendMessage(message)
    const assistantMessage = response.response.candidates?.[0]?.content?.parts?.[0]?.text || 'Brak odpowiedzi'

    return NextResponse.json({ response: assistantMessage })
  } catch (error: any) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Błąd serwera' },
      { status: 500 }
    )
  }
}