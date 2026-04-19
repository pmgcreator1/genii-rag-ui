'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'

// Module-level — survives all React remounts/re-renders
let _password = ''

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
  const passwordRef = useRef<string>('')
  if (typeof window !== 'undefined' && !passwordRef.current) {
    passwordRef.current = sessionStorage.getItem('genii_pw') || ''
    _password = passwordRef.current
  }
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const handleLogin = async () => {
    if (!password.trim()) return
    setLoginLoading(true)
    setLoginError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      if (res.status === 401) {
        setLoginError('Falsches Passwort')
        return
      }
      _password = password
      passwordRef.current = password
      sessionStorage.setItem('genii_pw', password)
      setIsLoggedIn(true)
    } catch {
      setLoginError('Verbindungsfehler – bitte erneut versuchen')
    } finally {
      setLoginLoading(false)
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
      const storedPassword = _password || passwordRef.current || sessionStorage.getItem('genii_pw') || ''
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: finalQuestion, password: storedPassword })
      })

      const data = await res.json()

      if (res.status === 401) {
        setError('Falsches Passwort')
        sessionStorage.removeItem('genii_pw')
        passwordRef.current = ''
        _password = ''
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
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center relative overflow-hidden">
        <Image
          src="/gsg-logo.png"
          alt=""
          aria-hidden
          width={700}
          height={210}
          style={{
            position: 'absolute',
            filter: 'invert(1) saturate(0) brightness(2) blur(8px)',
            mixBlendMode: 'screen',
            opacity: 0.06,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
        <div className="bg-[#0F1F3D] p-8 rounded-2xl shadow-xl w-96 border border-[#1e3a6e] relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Image
              src="/gsg-logo.png"
              alt="GSG GENII"
              width={160}
              height={48}
              style={{ filter: 'invert(1) saturate(0) brightness(2)', mixBlendMode: 'screen' }}
            />
          </div>
          <p className="text-[#5B9BD5] mb-6 text-sm">M&A Knowledge Assistant · Intern</p>
          <input
            type="password"
            placeholder="Passwort eingeben..."
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full bg-[#0A1628] text-white rounded-lg px-4 py-3 mb-4 outline-none border border-[#1e3a6e] focus:border-[#5B9BD5] transition placeholder:text-[#4a6080]"
          />
          {loginError && (
            <p className="text-red-400 text-sm mb-3">{loginError}</p>
          )}
          <button
            onClick={handleLogin}
            disabled={loginLoading}
            className="w-full bg-[#1B4FD8] hover:bg-[#5B9BD5] disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
          >
            {loginLoading ? 'Prüfe...' : 'Einloggen'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A1628] flex flex-col">
      <div className="bg-[#0F1F3D] border-b border-[#1e3a6e] px-6 py-4 flex items-center gap-4">
        <Image
          src="/gsg-logo.png"
          alt="GSG GENII"
          width={120}
          height={36}
          style={{ filter: 'invert(1) saturate(0) brightness(2)', mixBlendMode: 'screen' }}
        />
        <div className="border-l border-[#1e3a6e] pl-4">
          <p className="text-white font-semibold text-sm leading-tight">M&A Assistant</p>
          <p className="text-[#5B9BD5] text-xs">Powered by Claude · Internes Wissenssystem</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 max-w-4xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="text-center mt-12">
            <div className="bg-[#0F1F3D] border border-[#1e3a6e] rounded-2xl px-8 py-6 mb-8 text-left max-w-2xl mx-auto">
              <p className="text-[#5B9BD5] text-xs font-semibold uppercase tracking-widest mb-2">GENII Knowledge Base</p>
              <p className="text-white text-base font-semibold mb-2">Willkommen beim GENII M&A Assistenten</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Dieses System gibt dir direkten Zugriff auf das interne GENII M&A-Framework. Du kannst Fragen zu relevanten Software-Verticals, Akquisitionskriterien, EBITDA-Anforderungen und der Frage stellen, ob ein Unternehmen zum GENII-Portfolio passt – beantwortet direkt aus unserer Wissensdatenbank.
              </p>
            </div>
            <p className="text-[#5B9BD5] text-sm mb-4">Beispielfragen:</p>
            <div className="grid grid-cols-2 gap-3">
              {EXAMPLE_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleAsk(q)}
                  className="bg-[#0F1F3D] hover:bg-[#1e3a6e] border border-[#1e3a6e] hover:border-[#5B9BD5] text-gray-300 text-sm px-4 py-3 rounded-xl text-left transition"
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
                ? 'bg-[#1B4FD8] text-white'
                : 'bg-[#0F1F3D] text-gray-100 border border-[#1e3a6e]'
            }`}>
              {msg.role === 'assistant' ? (
                <>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#1e3a6e]">
                      <p className="text-[#4a6080] text-xs mb-1">Quellen:</p>
                      {msg.sources.map((s, j) => (
                        <span key={j} className="inline-block bg-[#0A1628] border border-[#1e3a6e] text-[#5B9BD5] text-xs px-2 py-1 rounded mr-1">
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
            <div className="bg-[#0F1F3D] border border-[#1e3a6e] text-[#5B9BD5] px-4 py-3 rounded-2xl text-sm">
              Analysiere Framework...
            </div>
          </div>
        )}
        {error && <p className="text-red-400 text-center text-sm">{error}</p>}
      </div>

      <div className="bg-[#0F1F3D] border-t border-[#1e3a6e] px-6 py-4">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            placeholder="Frage stellen..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAsk()}
            className="flex-1 bg-[#0A1628] text-white rounded-xl px-4 py-3 outline-none border border-[#1e3a6e] focus:border-[#5B9BD5] transition placeholder:text-[#4a6080]"
          />
          <button
            onClick={() => handleAsk()}
            disabled={loading}
            className="bg-[#1B4FD8] hover:bg-[#5B9BD5] disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            Senden
          </button>
        </div>
      </div>
    </div>
  )
}
