import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { avatarMap } from './characters'
import { API_BASE } from '../lib/api'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import ShareQuoteModal from './ShareQuoteModal'

// Module-level singleton so only one message plays at a time
let currentAudio = null

function SpeakerIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M10 3.75a.75.75 0 00-1.264-.546L4.703 7H3.167a.75.75 0 00-.7.48A6.985 6.985 0 002 10c0 .93.165 1.82.467 2.52.136.33.47.48.7.48h1.536l4.033 3.796A.75.75 0 0010 16.25V3.75zM15.95 5.05a.75.75 0 00-1.06 1.061 5.5 5.5 0 010 7.778.75.75 0 001.06 1.06 7 7 0 000-9.899z" />
      <path d="M13.829 7.172a.75.75 0 00-1.061 1.06 2.5 2.5 0 010 3.536.75.75 0 001.06 1.06 4 4 0 000-5.656z" />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
      <path fillRule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm5-2.25A.75.75 0 017.75 7h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-4.5z" clipRule="evenodd" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg className="w-3.5 h-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

function ChatMessage({ message, character, isNew, userQuestion }) {
  const isUser = message.role === 'user'
  const AvatarComponent = avatarMap[character?.id]
  const { isDark } = useTheme()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const audioRef = useRef(null)

  // Clean up audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const handleSpeak = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
      setIsPlaying(false)
      return
    }

    if (currentAudio) {
      currentAudio.pause()
      currentAudio = null
    }

    setIsLoading(true)
    try {
      const resp = await fetch(`${API_BASE}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character_id: character?.id, text: message.content }),
      })

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        console.error('TTS error:', err)
        setIsLoading(false)
        setHasError(true)
        setTimeout(() => setHasError(false), 3000)
        return
      }

      const blob = await resp.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRef.current = audio
      currentAudio = audio

      audio.onended = () => {
        URL.revokeObjectURL(url)
        setIsPlaying(false)
        audioRef.current = null
        if (currentAudio === audio) currentAudio = null
      }

      audio.onerror = () => {
        setIsPlaying(false)
        setIsLoading(false)
        setHasError(true)
        setTimeout(() => setHasError(false), 3000)
      }

      setIsLoading(false)
      setIsPlaying(true)
      audio.play()
    } catch (e) {
      console.error('TTS fetch failed:', e)
      setIsLoading(false)
      setHasError(true)
      setTimeout(() => setHasError(false), 3000)
    }
  }

  const handleBookmark = async () => {
    if (!supabase || !user) return

    const { error } = await supabase.from('journal_entries').insert({
      user_id: user.id,
      character_id: character?.id,
      content: message.content,
      user_question: userQuestion || null,
    })

    if (!error) {
      setBookmarked(true)
      setTimeout(() => setBookmarked(false), 2000)
    }
  }

  // Don't re-animate streaming messages on every token — only animate on first appear
  const shouldAnimate = isNew && !message._streaming
  const Wrapper = shouldAnimate ? motion.div : 'div'
  const wrapperProps = shouldAnimate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: 'easeOut' },
      }
    : {}

  return (
    <>
      <Wrapper {...wrapperProps} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
          {/* Character label for assistant messages */}
          {!isUser && character && (
            <div className="flex items-center gap-2 mb-1.5 ml-1">
              {AvatarComponent && (
                <AvatarComponent size={24} hover={false} />
              )}
              <span
                className="text-xs font-semibold"
                style={{ color: character.colors.primary }}
              >
                {character.name}
              </span>
            </div>
          )}

          {/* Message bubble */}
          <div
            className={`rounded-2xl px-4 py-3 ${
              isUser
                ? 'rounded-br-md'
                : `${isDark ? 'bg-slate-800/90' : 'bg-white/90'} backdrop-blur-sm rounded-bl-md shadow-sm`
            }`}
            style={
              isUser
                ? {
                    backgroundColor: `${character?.colors?.primary || '#7C3AED'}${isDark ? '35' : '25'}`,
                    color: isDark ? '#e2e8f0' : '#1e293b',
                  }
                : {
                    borderLeft: `4px solid ${character?.colors?.primary || '#7C3AED'}`,
                    color: isDark ? '#e2e8f0' : '#1e293b',
                  }
            }
          >
            {isUser ? (
              <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{message.content}</p>
            ) : (
              <div className={`text-sm leading-relaxed prose prose-sm max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ol]:mb-2 [&_li]:mb-0.5 ${
                isDark
                  ? 'prose-headings:text-slate-200 prose-p:text-slate-300 prose-strong:text-slate-200 prose-li:text-slate-300 prose-a:text-purple-400'
                  : 'prose-headings:text-slate-800 prose-p:text-slate-700 prose-strong:text-slate-800 prose-li:text-slate-700 prose-a:text-purple-600'
              }`}>
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Action buttons — only for completed assistant messages */}
          {!isUser && !message._streaming && (
            <div className="mt-2 ml-1 flex items-center gap-2 flex-wrap">
              {/* TTS button */}
              <button
                onClick={handleSpeak}
                disabled={isLoading || hasError}
                title={isPlaying ? 'Stop' : 'Listen'}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-150 cursor-pointer disabled:cursor-default hover:shadow-sm active:scale-95"
                style={{
                  color: hasError ? '#ef4444' : isPlaying ? '#fff' : character?.colors?.primary || '#7C3AED',
                  backgroundColor: hasError
                    ? '#fef2f2'
                    : isPlaying
                    ? character?.colors?.primary || '#7C3AED'
                    : `${character?.colors?.primary || '#7C3AED'}12`,
                  borderColor: hasError ? '#fca5a5' : `${character?.colors?.primary || '#7C3AED'}50`,
                }}
              >
                {isLoading ? <SpinnerIcon /> : isPlaying ? <StopIcon /> : <SpeakerIcon />}
                <span>{hasError ? 'Error' : isLoading ? 'Loading\u2026' : isPlaying ? 'Stop' : 'Listen'}</span>
              </button>

              {/* Share button */}
              <button
                onClick={() => setShowShare(true)}
                title="Share this wisdom"
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-150 cursor-pointer hover:shadow-sm active:scale-95"
                style={{
                  color: character?.colors?.primary || '#7C3AED',
                  backgroundColor: `${character?.colors?.primary || '#7C3AED'}12`,
                  borderColor: `${character?.colors?.primary || '#7C3AED'}50`,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                <span>Share</span>
              </button>

              {/* Bookmark button */}
              <button
                onClick={handleBookmark}
                title={bookmarked ? 'Saved!' : 'Save to journal'}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-150 cursor-pointer hover:shadow-sm active:scale-95"
                style={{
                  color: bookmarked ? '#fff' : character?.colors?.primary || '#7C3AED',
                  backgroundColor: bookmarked
                    ? character?.colors?.primary || '#7C3AED'
                    : `${character?.colors?.primary || '#7C3AED'}12`,
                  borderColor: `${character?.colors?.primary || '#7C3AED'}50`,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                <span>{bookmarked ? 'Saved!' : 'Save'}</span>
              </button>
            </div>
          )}
        </div>
      </Wrapper>

      {/* Share modal */}
      {showShare && (
        <ShareQuoteModal
          message={message}
          character={character}
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  )
}

export default ChatMessage
