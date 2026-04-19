'use client'
import { useState } from 'react'

export default function Home() {
  const [password, setPassword] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<{role: string, text: string}[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = () => {
    if (password.trim()) {
      setIsLoggedIn(true)
    }
  }

  const handleAsk = async () => {
    if (!question.trim()) return
    
    const userMessage = question
    setMessages(prev => [...prev, { role: 'user', text: userMessage }])
    setQuestion('')
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage, password })
      })
      
      const data = await res.json()
      
      if (res.status === 401) {
        setError('Falsches Passwort')
        setIsLoggedIn(false)
        return
      }
      
      setMessages(prev => [...prev, { role: 'assistant', text: data.answer }])
    } catch {
      setError('Fehler beim Abrufen der Antwort.')
    } finally {
      setLoading(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-gray-900 p-8 rounded-2xl shadow-xl w-96">
          <h1 className="text-2xl font-bold text-white mb-2">GENII RAG</h1>
          <p className="text-gray-400 mb-6">M&A Knowledge Assistant</p>
          <input
            type="password"
            placeholder="Passwort eingeben..."
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 mb-4 outline-none border border-gray-700 focus:border-blue-500"
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
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <h1 className="text-white font-bold text-xl">GENII M&A Assistant</h1>
        <p className="text-gray-400 text-sm">Powered by Claude + GENII Framework</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-lg">Stelle eine Frage zum GENII Framework</p>
            <p className="text-sm mt-2">z.B. "Welche Zielregionen hat GENII?" oder "Was sind die Disqualifikatoren?"</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-2xl px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-100'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-400 px-4 py-3 rounded-2xl text-sm">
              Analysiere Framework...
            </div>
          </div>
        )}
        {error && <p className="text-red-400 text-center text-sm">{error}</p>}
      </div>

      {/* Input */}
      <div className="bg-gray-900 border-t border-gray-800 px-6 py-4">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            placeholder="Frage stellen..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAsk()}
            className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 outline-none border border-gray-700 focus:border-blue-500"
          />
          <button
            onClick={handleAsk}
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