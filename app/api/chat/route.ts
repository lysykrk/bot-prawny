import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

export async function POST(request: NextRequest) {
  try {
    const { message, documentContent, conversationHistory } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'API Key nie skonfigurowany' },
        { status: 500 }
      )
    }

    if (!message) {
      return NextResponse.json(
        { error: 'Wiadomość jest wymagana' },
        { status: 400 }
      )
    }

    // Prepare conversation history
    const messages: any[] = []

    // Add document context if available
    if (documentContent) {
      messages.push({
        role: 'user',
        content: `Przeanalizuj poniższy dokument prawny:\n\n${documentContent.substring(0, 3000)}`,
      })
      messages.push({
        role: 'assistant',
        content: 'Przeanalizowałem dokument. Co chciałbyś wiedzieć?',
      })
    }

    // Add conversation history
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach((msg: any) => {
        messages.push({
          role: msg.role,
          content: msg.content,
        })
      })
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message,
    })

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1500,
    })

    const assistantMessage = response.choices[0]?.message?.content || 'Brak odpowiedzi'

    return NextResponse.json({ response: assistantMessage })
  } catch (error: any) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Błąd serwera' },
      { status: 500 }
    )
  }
}