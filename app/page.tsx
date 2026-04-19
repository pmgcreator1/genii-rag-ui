'use client'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

const EXAMPLE_QUESTIONS = [
  "Welche Zielregionen hat GENII?",
  "Was sind die automatischen Disqualifikatoren?",
  "Welche EBITDA-Anforderungen gibt es?",
  "Welche Software Verticals sind relevant?"
]

type Message = {
  role: 'user' | 'assistant'
  text: string
  sources?: string[]
}

export default function Home() {
  const [password, setPassword] = useState(() => 
    typeof window !== 'undefined' ? sessionStorage.getItem('genii_pw') || '' : ''
  )
  const [isLoggedIn, setIsLoggedIn] = useState(() =>
    typeof window !== 'undefined' ? !!sessionStorage.getItem('genii_pw') : false
  )
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = () => {
    if (password.trim()) {
      sessionStorage.setItem('genii_pw', password)
      setIsLoggedIn(true)
    }
  }

  const handleAsk = async (q?: string) => {
    const finalQuestion = q || question
    if (!finalQuestion.trim()) return

    setMessages(prev => [...prev, { role: 'user', text: finalQuestion }])
    setQuestion('')
    setLoading(true)
    setError('')

    try {
      const storedPassword = sessionStorage.getItem('genii_pw') || password
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: finalQuestion, password: storedPassword })
      })

      const data = await res.json()

      if (res.status === 401) {
        setError('Falsches Passwort')
        sessionStorage.removeItem('genii_pw')
        setIsLoggedIn(false)
        return
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        text: data.answer,
        sources: data.sources
      }])
    } catch {
      setError('Fehler beim Abrufen der Antwort.')
    } finally {
      setLoading(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-gray-900 p-8 rounded-2xl shadow-xl w-96 border border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">G</div>
            <h1 className="text-2xl font-bold text-white">GENII RAG</h1>
          </div>
          <p className="text-gray-400 mb-6 text-sm">M&A Knowledge Assistant · Intern</p>
          <input
            type="password"
            placeholder="Passwort eingeben..."
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 mb-4 outline-none border border-gray-700 focus:border-blue-500 transition"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Einloggen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">G</div>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">GENII M&A Assistant</h1>
          <p className="text-gray-500 text-xs">Powered by Claude · Internes Wissenssystem</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 max-w-4xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="text-center mt-16">
            <p className="text-gray-400 text-lg mb-6">Stelle eine Frage zum GENII Framework</p>
            <div className="grid grid-cols-2 gap-3">
              {EXAMPLE_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleAsk(q)}
                  className="bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-blue-500 text-gray-300 text-sm px-4 py-3 rounded-xl text-left transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-2xl px-4 py-3 rounded-2xl text-sm ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-900 text-gray-100 border border-gray-800'
            }`}>
              {msg.role === 'assistant' ? (
                <>
                  <ReactMarkdown className="prose prose-invert prose-sm max-w-none">
                    {msg.text}
                  </ReactMarkdown>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-gray-500 text-xs mb-1">Quellen:</p>
                      {msg.sources.map((s, j) => (
                        <span key={j} className="inline-block bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded mr-1">
                          📄 {s}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-900 border border-gray-800 text-gray-400 px-4 py-3 rounded-2xl text-sm">
              Analysiere Framework...
            </div>
          </div>
        )}
        {error && <p className="text-red-400 text-center text-sm">{error}</p>}
      </div>

      <div className="bg-gray-900 border-t border-gray-800 px-6 py-4">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            placeholder="Frage stellen..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAsk()}
            className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 outline-none border border-gray-700 focus:border-blue-500 transition"
          />
          <button
            onClick={() => handleAsk()}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            Senden
          </button>
        </div>
      </div>
    </div>
  )
}