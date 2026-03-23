import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { getCharacterById } from '../data/characters'
import { avatarMap } from '../components/characters'
import ChatMessage from '../components/ChatMessage'
import TypingIndicator from '../components/TypingIndicator'
import SuggestedQuestions from '../components/SuggestedQuestions'
import { culturalBorders, culturalPatternBgs } from '../components/CulturalPatterns'
import CharacterIntro from '../components/CharacterIntro'
import VoiceInput from '../components/VoiceInput'
import { API_BASE } from '../lib/api'
import { playResponseChime, playWhoosh } from '../lib/sounds'

function ChatPage() {
  const { characterId, conversationId: urlConversationId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const character = getCharacterById(characterId)
  const AvatarComponent = avatarMap[characterId]

  const [messages, setMessages] = useState([])
  const [allMessages, setAllMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState(urlConversationId || null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [newestMessageIndex, setNewestMessageIndex] = useState(-1)
  const [showEntrance, setShowEntrance] = useState(!urlConversationId)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  // Play entrance whoosh on new conversations
  useEffect(() => {
    if (showEntrance) {
      playWhoosh()
      const timer = setTimeout(() => setShowEntrance(false), 1500)
      return () => clearTimeout(timer)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isInitialized) return
    setIsInitialized(true)

    if (urlConversationId) {
      loadExistingConversation(urlConversationId)
    } else {
      startNewConversation()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadExistingConversation = async (convId) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at')

    if (data && data.length > 0) {
      const loadedMessages = data.map((m) => ({ role: m.role, content: m.content }))
      setMessages(loadedMessages)
      setAllMessages(loadedMessages)
      setConversationId(convId)
    }
  }

  const startNewConversation = async () => {
    const { data: conv } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        character_id: characterId,
        title: 'New conversation',
      })
      .select()
      .single()

    if (!conv) return
    setConversationId(conv.id)

    const greetingPrompt = {
      role: 'user',
      content: 'Greet me and introduce yourself briefly in 2-3 sentences. Be warm and inviting.',
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character_id: characterId,
          messages: [greetingPrompt],
          conversation_id: conv.id,
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
              if (data.text) {
                fullText += data.text
              }
              if (data.error) {
                fullText = `I sense a disturbance... ${data.error}`
              }
            } catch (e) {
              // ignore parse errors for partial chunks
            }
          }
        }
      }

      const greetingResponse = { role: 'assistant', content: fullText }
      await supabase.from('messages').insert({
        conversation_id: conv.id,
        role: 'assistant',
        content: fullText,
      })

      setAllMessages([greetingPrompt, greetingResponse])
      setMessages([greetingResponse])
      setNewestMessageIndex(0)
      playResponseChime()
    } catch (err) {
      setMessages([{ role: 'assistant', content: 'The spirits are restless... Unable to connect to the oracle.' }])
    }

    setIsLoading(false)
  }

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading || !conversationId) return

    const userMessage = { role: 'user', content: messageText.trim() }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setNewestMessageIndex(updatedMessages.length - 1)
    setInput('')

    await supabase.from('messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: userMessage.content,
    })

    const userMessageCount = updatedMessages.filter((m) => m.role === 'user').length
    if (userMessageCount === 1) {
      await supabase
        .from('conversations')
        .update({
          title: userMessage.content.substring(0, 50),
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId)
    } else {
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId)
    }

    const fullHistory = [...allMessages, userMessage]
    setAllMessages(fullHistory)

    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character_id: characterId,
          messages: fullHistory,
          conversation_id: conversationId,
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
              if (data.text) {
                fullText += data.text
                setMessages((prev) => {
                  const withoutStreaming = prev.filter(
                    (m, i) => !(i === prev.length - 1 && m.role === 'assistant' && m._streaming)
                  )
                  return [...withoutStreaming, { role: 'assistant', content: fullText, _streaming: true }]
                })
              }
              if (data.error) {
                fullText = `The oracle falters... ${data.error}`
                setMessages((prev) => [...prev, { role: 'assistant', content: fullText }])
              }
            } catch (e) {
              // ignore parse errors
            }
          }
        }
      }

      const assistantMessage = { role: 'assistant', content: fullText }
      setMessages((prev) => {
        const withoutStreaming = prev.filter((m) => !m._streaming)
        return [...withoutStreaming, assistantMessage]
      })
      setAllMessages((prev) => [...prev, assistantMessage])
      setNewestMessageIndex(-1)

      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: fullText,
      })

      playResponseChime()
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'The connection to the beyond has been severed... Please try again.' },
      ])
    }

    setIsLoading(false)
    inputRef.current?.focus()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleVoiceResult = (transcript) => {
    setInput(transcript)
    // Auto-send after voice input
    setTimeout(() => sendMessage(transcript), 300)
  }

  // Find the previous user message for a given message index
  const getPreviousUserMessage = (index) => {
    for (let i = index - 1; i >= 0; i--) {
      if (messages[i].role === 'user') return messages[i].content
    }
    return null
  }

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-800">
        <p>Oracle not found. The spirits have departed.</p>
      </div>
    )
  }

  const BorderComponent = culturalBorders[character.mythology]
  const PatternBgComponent = culturalPatternBgs[character.mythology]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col"
    >
      {/* Dramatic character entrance overlay */}
      <AnimatePresence>
        {showEntrance && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${character.colors.primary}40, ${character.colors.secondary}40)` }}
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="text-center"
            >
              {AvatarComponent && <AvatarComponent size={140} hover={true} />}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4 text-2xl font-bold text-white"
                style={{ fontFamily: "'Cinzel Decorative', Georgia, serif", textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}
              >
                {character.name}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 backdrop-blur-xl bg-white/70 dark:bg-slate-900/80 border-b z-20"
        style={{ borderColor: `${character.colors.primary}40` }}
      >
        <button
          onClick={() => navigate('/select')}
          className="p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        {AvatarComponent && <AvatarComponent size={40} hover={false} />}

        <div>
          <h2 className="text-slate-800 dark:text-slate-200 font-semibold text-sm">{character.name}</h2>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${character.colors.primary}20`,
              color: character.colors.primary,
            }}
          >
            {character.mythology}
          </span>
        </div>
      </div>

      {/* Cultural border under header */}
      {BorderComponent && (
        <div className="z-20">
          <BorderComponent color={character.colors.primary} opacity={0.4} height={14} />
        </div>
      )}

      {/* Messages Area with cultural pattern background */}
      <div className="flex-grow overflow-y-auto px-4 py-6 space-y-1 relative">
        {/* SVG pattern background */}
        {PatternBgComponent && <PatternBgComponent opacity={0.03} />}

        <div className="relative z-10">
          {/* Character intro card */}
          <CharacterIntro character={character} />

          {messages.length === 0 && isLoading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-sm text-slate-400 dark:text-slate-500 mt-4"
            >
              The oracle is awakening... this may take up to 30 seconds.
            </motion.p>
          )}

          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message}
              character={character}
              isNew={index === newestMessageIndex || message._streaming}
              userQuestion={getPreviousUserMessage(index)}
            />
          ))}

          {messages.length <= 2 &&
            messages.length > 0 &&
            !isLoading &&
            messages[messages.length - 1]?.role === 'assistant' && (
              <SuggestedQuestions
                questions={character.suggestedQuestions}
                onSelect={(question) => sendMessage(question)}
                color={character.colors.primary}
              />
            )}

          {isLoading && !messages.some((m) => m._streaming) && (
            <div className="flex items-center gap-2 ml-1">
              {AvatarComponent && <AvatarComponent size={24} hover={false} />}
              <TypingIndicator color={character.colors.primary} />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Cultural border above input */}
      {BorderComponent && (
        <div style={{ transform: 'scaleY(-1)' }}>
          <BorderComponent color={character.colors.primary} opacity={0.25} height={10} />
        </div>
      )}

      {/* Input Bar */}
      <div
        className="px-4 py-3 backdrop-blur-xl bg-white/70 dark:bg-slate-900/80 border-t"
        style={{ borderColor: `${character.colors.primary}30` }}
      >
        <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-4xl mx-auto">
          <VoiceInput
            onResult={handleVoiceResult}
            color={character.colors.primary}
            disabled={isLoading}
          />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${character.name}...`}
            disabled={isLoading}
            className="flex-grow px-4 py-3 bg-white/60 dark:bg-slate-800/60 border border-purple-200/50 dark:border-purple-700/50 rounded-xl text-slate-800 dark:text-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-800 transition-all disabled:opacity-50"
          />
          <motion.button
            type="submit"
            disabled={isLoading || !input.trim()}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-xl text-white font-medium transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
            style={{
              background: character.colors.bg,
              boxShadow: input.trim() ? `0 4px 20px ${character.colors.primary}40` : 'none',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </motion.button>
        </form>
      </div>
    </motion.div>
  )
}

export default ChatPage
