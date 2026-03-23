import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { characters } from '../data/characters'
import { avatarMap } from '../components/characters'
import { supabase } from '../lib/supabase'
import ParticleBackground from '../components/ParticleBackground'

function JournalPage() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!supabase) return
    supabase
      .from('journal_entries')
      .select('*')
      .order('saved_at', { ascending: false })
      .then(({ data }) => {
        if (data) setEntries(data)
      })
  }, [])

  const removeEntry = async (index) => {
    const entry = entries[index]
    if (!supabase || !entry) return
    const { error } = await supabase.from('journal_entries').delete().eq('id', entry.id)
    if (!error) {
      setEntries(entries.filter((_, i) => i !== index))
    }
  }

  const filtered = filter === 'all'
    ? entries
    : entries.filter((e) => e.character_id === filter)

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen relative"
    >
      <ParticleBackground />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
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
              Wisdom Journal
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'} saved
            </p>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === 'all'
                ? 'bg-purple-500 text-white'
                : 'bg-white/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border border-purple-200/30 dark:border-purple-700/30'
            }`}
          >
            All
          </button>
          {characters.map((char) => {
            const count = entries.filter((e) => e.character_id === char.id).length
            if (count === 0) return null
            return (
              <button
                key={char.id}
                onClick={() => setFilter(char.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filter === char.id
                    ? 'text-white'
                    : 'bg-white/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border border-purple-200/30 dark:border-purple-700/30'
                }`}
                style={filter === char.id ? { backgroundColor: char.colors.primary } : {}}
              >
                {char.name} ({count})
              </button>
            )
          })}
        </div>

        {/* Entries */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <svg className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <p className="text-slate-400 dark:text-slate-500 text-sm">
              No wisdom saved yet. Bookmark messages in chat to build your journal.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filtered.map((entry, index) => {
                const char = characters.find((c) => c.id === entry.characterId)
                const AvatarComponent = char ? avatarMap[char.id] : null

                return (
                  <motion.div
                    key={entry.saved_at + index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-5 border group"
                    style={{ borderColor: `${char?.colors?.primary || '#7C3AED'}30` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 pt-1">
                        {AvatarComponent && <AvatarComponent size={36} hover={false} />}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold" style={{ color: char?.colors?.primary }}>
                            {char?.name || 'Unknown'}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            {formatDate(entry.saved_at)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {entry.content}
                        </p>
                        {entry.user_question && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 italic">
                            In response to: &ldquo;{entry.user_question}&rdquo;
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeEntry(index)}
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-300 hover:text-rose-500 transition-all"
                        title="Remove from journal"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default JournalPage
