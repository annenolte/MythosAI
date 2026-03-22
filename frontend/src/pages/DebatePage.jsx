import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { characters } from '../data/characters'
import { avatarMap } from '../components/characters'
import { API_BASE } from '../lib/api'
import ParticleBackground from '../components/ParticleBackground'
import { playResponseChime } from '../lib/sounds'

function DebatePage() {
  const navigate = useNavigate()
  const [question, setQuestion] = useState('')
  const [selectedChars, setSelectedChars] = useState(['athena', 'loki'])
  const [responses, setResponses] = useState({})
  const [loading, setLoading] = useState({})
  const [asked, setAsked] = useState(false)

  const toggleCharacter = (id) => {
    setSelectedChars((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 2) return prev // minimum 2
        return prev.filter((c) => c !== id)
      }
      if (prev.length >= 3) return prev // maximum 3
      return [...prev, id]
    })
  }

  const askAll = async () => {
    if (!question.trim() || selectedChars.length < 2) return
    setAsked(true)
    setResponses({})

    // Fire off requests to all selected characters in parallel
    for (const charId of selectedChars) {
      setLoading((prev) => ({ ...prev, [charId]: true }))

      fetchCharacterResponse(charId, question.trim()).then((text) => {
        setResponses((prev) => ({ ...prev, [charId]: text }))
        setLoading((prev) => ({ ...prev, [charId]: false }))
        playResponseChime()
      })
    }
  }

  const fetchCharacterResponse = async (characterId, userMessage) => {
    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character_id: characterId,
          messages: [{ role: 'user', content: userMessage }],
        }),
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value)
        const lines = text.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.text) fullText += data.text
              if (data.error) fullText = `The oracle falters... ${data.error}`
            } catch (e) {}
          }
        }
      }
      return fullText
    } catch (e) {
      return 'The spirits could not be reached...'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen relative"
    >
      <ParticleBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate('/select')}
            className="p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <div>
            <h1
              className="text-3xl font-bold text-purple-900 dark:text-purple-200"
              style={{ fontFamily: "'Cinzel Decorative', Georgia, serif" }}
            >
              Oracle Debate
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Ask a question and hear from multiple oracles</p>
          </div>
        </div>

        {/* Character selector */}
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-5 border border-purple-100/50 dark:border-purple-900/50 mb-6">
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 font-medium">
            Choose 2-3 oracles to debate ({selectedChars.length}/3 selected)
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {characters.map((char) => {
              const selected = selectedChars.includes(char.id)
              const AvatarComponent = avatarMap[char.id]
              return (
                <button
                  key={char.id}
                  onClick={() => toggleCharacter(char.id)}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
                  style={{
                    backgroundColor: selected ? `${char.colors.primary}20` : 'transparent',
                    border: `2px solid ${selected ? char.colors.primary : 'transparent'}`,
                  }}
                >
                  {AvatarComponent && <AvatarComponent size={36} hover={false} />}
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{char.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Question input */}
        <div className="flex gap-3 mb-8">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && askAll()}
            placeholder="Ask your question to the council..."
            className="flex-grow px-5 py-3.5 bg-white/80 dark:bg-slate-700/80 border border-purple-200/50 dark:border-purple-700/50 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-200/50"
          />
          <button
            onClick={askAll}
            disabled={!question.trim() || selectedChars.length < 2 || Object.values(loading).some(Boolean)}
            className="px-6 py-3.5 rounded-xl text-white font-medium bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 disabled:opacity-40 transition-all shadow-lg"
          >
            {Object.values(loading).some(Boolean) ? 'Consulting...' : 'Ask All'}
          </button>
        </div>

        {/* Responses grid */}
        {asked && (
          <div className={`grid gap-4 ${selectedChars.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
            {selectedChars.map((charId) => {
              const char = characters.find((c) => c.id === charId)
              const AvatarComponent = avatarMap[charId]
              const response = responses[charId]
              const isLoading = loading[charId]

              return (
                <motion.div
                  key={charId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl overflow-hidden border-2"
                  style={{ borderColor: `${char.colors.primary}40` }}
                >
                  {/* Character header */}
                  <div
                    className="flex items-center gap-2 px-4 py-3"
                    style={{ background: `${char.colors.primary}15` }}
                  >
                    {AvatarComponent && <AvatarComponent size={32} hover={false} />}
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{char.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{char.mythology}</p>
                    </div>
                  </div>

                  {/* Response */}
                  <div className="p-4 min-h-[120px]">
                    {isLoading && (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: char.colors.primary,
                                animation: `typingBounce 1.2s ease-in-out ${i * 0.15}s infinite`,
                              }}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-slate-400">{char.name} is contemplating...</span>
                      </div>
                    )}
                    {response && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm leading-relaxed prose prose-sm max-w-none prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-strong:text-slate-800 dark:prose-strong:text-slate-200 [&_p]:mb-2 [&_p:last-child]:mb-0"
                      >
                        <ReactMarkdown>{response}</ReactMarkdown>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </motion.div>
  )
}

export default DebatePage
