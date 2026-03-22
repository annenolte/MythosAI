import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import { characters } from '../data/characters'
import ParticleBackground from '../components/ParticleBackground'
import CharacterCard from '../components/CharacterCard'
import ConversationHistory from '../components/ConversationHistory'
import MoodRecommender from '../components/MoodRecommender'
import RelationshipGraph from '../components/RelationshipGraph'
import {
  culturalBorders,
  culturalSymbols,
  culturalPatternBgs,
} from '../components/CulturalPatterns'

const mythologyGroups = [
  { name: 'Greek', icon: null, color: '#F5C842', secondColor: '#FF8C00' },
  { name: 'Norse', icon: null, color: '#5BA4CF', secondColor: '#7B68EE' },
  { name: 'Egyptian', icon: null, color: '#1ABC9C', secondColor: '#FFD700' },
  { name: 'East Asian', icon: null, color: '#E74C3C', secondColor: '#FF4081' },
]

function CharacterSelect() {
  const { user, signOut } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [moodOpen, setMoodOpen] = useState(false)
  const [connectionsOpen, setConnectionsOpen] = useState(false)

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false })

    if (data) {
      setConversations(data)
    }
  }

  const handleSelectConversation = (conversation) => {
    navigate(`/chat/${conversation.character_id}/${conversation.id}`)
  }

  const handleDeleteConversation = async (id) => {
    await supabase.from('conversations').delete().eq('id', id)
    setConversations((prev) => prev.filter((c) => c.id !== id))
  }

  const handleSelectCharacter = (character) => {
    navigate(`/chat/${character.id}`)
  }

  const handleSurpriseMe = () => {
    const random = characters[Math.floor(Math.random() * characters.length)]
    navigate(`/chat/${random.id}`)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  // Daily wisdom: pick a quote based on today's date
  const getDailyWisdom = (char) => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
    return char.dailyWisdom[dayOfYear % char.dailyWisdom.length]
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen relative ${isDark ? 'bg-slate-900' : ''}`}
    >
      <ParticleBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className={`text-4xl font-bold mb-1 ${isDark ? 'text-purple-200' : 'text-purple-900'}`}
              style={{ fontFamily: "'Cinzel Decorative', Georgia, serif" }}
            >
              Choose Your Oracle
            </h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all ${
                isDark
                  ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600'
                  : 'bg-white/50 text-slate-600 hover:bg-white/70'
              }`}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <button
              onClick={handleSignOut}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                isDark
                  ? 'text-purple-300 hover:text-purple-100 bg-slate-700/50 hover:bg-slate-700 border-2 border-purple-700 hover:border-purple-500'
                  : 'text-purple-700 hover:text-purple-900 bg-white/50 hover:bg-white/70 border-2 border-purple-300 hover:border-purple-400'
              }`}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Feature buttons row */}
        <div className="flex flex-nowrap gap-2 mb-6">
          <button
            onClick={handleSurpriseMe}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-amber-500 text-white shadow-lg shadow-amber-300/20 hover:bg-amber-600 transition-all whitespace-nowrap"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
            Surprise Me
          </button>

          <button
            onClick={() => navigate('/debate')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-rose-500 text-white shadow-lg shadow-rose-300/20 hover:bg-rose-600 transition-all whitespace-nowrap"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Oracle Debate
          </button>

          <button
            onClick={() => navigate('/quiz')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-teal-500 text-white shadow-lg shadow-teal-300/20 hover:bg-teal-600 transition-all whitespace-nowrap"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Which Oracle?
          </button>

          <button
            onClick={() => navigate('/journal')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-indigo-500 text-white shadow-lg shadow-indigo-300/20 hover:bg-indigo-600 transition-all whitespace-nowrap"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            Journal
          </button>

          <button
            onClick={() => { setMoodOpen(!moodOpen); setConnectionsOpen(false) }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-purple-500 text-white shadow-lg shadow-purple-300/20 hover:bg-purple-600 transition-all whitespace-nowrap"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
            Mood Match
          </button>

          <button
            onClick={() => { setConnectionsOpen(!connectionsOpen); setMoodOpen(false) }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-amber-500 text-white shadow-lg shadow-amber-300/20 hover:bg-amber-600 transition-all whitespace-nowrap"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="6" r="3" />
              <circle cx="18" cy="18" r="3" />
              <circle cx="18" cy="6" r="3" />
              <line x1="8.5" y1="7.5" x2="15.5" y2="16.5" />
              <line x1="15.5" y1="7.5" x2="8.5" y2="16.5" />
            </svg>
            Connections
          </button>
        </div>

        {/* Expandable panels */}
        <MoodRecommender isOpen={moodOpen} onToggle={() => setMoodOpen(!moodOpen)} />
        <RelationshipGraph isOpen={connectionsOpen} onToggle={() => setConnectionsOpen(!connectionsOpen)} />

        {/* Conversation History */}
        {conversations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`mb-10 backdrop-blur-xl rounded-3xl p-6 border shadow-lg ${
              isDark
                ? 'bg-slate-800/60 border-purple-900/50 shadow-purple-900/20'
                : 'bg-white/60 border-purple-100/50 shadow-purple-100/20'
            }`}
          >
            <ConversationHistory
              conversations={conversations}
              characters={characters}
              onSelect={handleSelectConversation}
              onDelete={handleDeleteConversation}
            />
          </motion.div>
        )}

        {/* Character Sections by Mythology */}
        {mythologyGroups.map((group, groupIndex) => {
          const groupCharacters = characters.filter((c) => c.mythology === group.name)
          if (groupCharacters.length === 0) return null

          const BorderComponent = culturalBorders[group.name]
          const SymbolsComponent = culturalSymbols[group.name]
          const PatternBgComponent = culturalPatternBgs[group.name]

          return (
            <motion.div
              key={group.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + groupIndex * 0.1 }}
              className="mb-10"
            >
              {/* Cultural border on top of section */}
              {BorderComponent && (
                <BorderComponent color={group.color} opacity={0.5} height={18} />
              )}

              {/* Section Header with cultural symbols */}
              <div className="flex items-center gap-3 my-4">
                <h2
                  className={`text-xl font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                  style={{ fontFamily: "'Cinzel Decorative', Georgia, serif" }}
                >
                  {group.name} Mythology
                </h2>
                <div
                  className="flex-grow h-0.5 rounded-full"
                  style={{ background: `linear-gradient(to right, ${group.color}, ${group.secondColor}, transparent)` }}
                />
              </div>

              {/* Cultural symbols decoration */}
              <div className="flex justify-center mb-3 opacity-60">
                {SymbolsComponent && <SymbolsComponent opacity={0.4} />}
              </div>

              {/* Section with cultural pattern background */}
              <div className="relative rounded-2xl p-4 overflow-hidden">
                {PatternBgComponent && <PatternBgComponent opacity={0.04} />}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {groupCharacters.map((character, index) => (
                    <motion.div
                      key={character.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 + groupIndex * 0.1 + index * 0.05 }}
                    >
                      <CharacterCard
                        character={character}
                        onClick={() => handleSelectCharacter(character)}
                        dailyWisdom={getDailyWisdom(character)}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Cultural border on bottom of section */}
              {BorderComponent && (
                <div className="mt-2" style={{ transform: 'scaleY(-1)' }}>
                  <BorderComponent color={group.color} opacity={0.3} height={12} />
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

export default CharacterSelect
