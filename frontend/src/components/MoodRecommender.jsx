import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { characters } from '../data/characters'
import { avatarMap } from './characters'

function MoodRecommender() {
  const [mood, setMood] = useState('')
  const [recommendation, setRecommendation] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const findMatch = () => {
    if (!mood.trim()) return

    const lower = mood.toLowerCase()
    const scores = characters.map((char) => {
      let score = 0
      for (const keyword of char.moodKeywords) {
        if (lower.includes(keyword)) score += 2
      }
      // Partial matches on tagline/bestAdviceFor
      const tagWords = char.tagline.toLowerCase().split(' ')
      for (const word of tagWords) {
        if (lower.includes(word) && word.length > 3) score += 1
      }
      if (char.bio.bestAdviceFor && lower.includes(char.bio.bestAdviceFor.toLowerCase().split(' ')[0])) {
        score += 1
      }
      return { character: char, score }
    })

    scores.sort((a, b) => b.score - a.score)

    // If no clear match, pick based on sentiment
    if (scores[0].score === 0) {
      // Default matching based on common moods
      if (/sad|cry|hurt|pain|griev/.test(lower)) return setRecommendation(characters.find(c => c.id === 'guanyin'))
      if (/angry|frustrat|mad|annoy/.test(lower)) return setRecommendation(characters.find(c => c.id === 'athena'))
      if (/scared|afraid|fear|anxi/.test(lower)) return setRecommendation(characters.find(c => c.id === 'odin'))
      if (/bored|meh|blah/.test(lower)) return setRecommendation(characters.find(c => c.id === 'loki'))
      if (/happy|excited|great/.test(lower)) return setRecommendation(characters.find(c => c.id === 'sunwukong'))
      // Fallback: random
      return setRecommendation(characters[Math.floor(Math.random() * characters.length)])
    }

    setRecommendation(scores[0].character)
  }

  const AvatarComponent = recommendation ? avatarMap[recommendation.id] : null

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-500 to-teal-400 text-white shadow-lg shadow-purple-300/20 hover:shadow-purple-300/40 transition-all"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
        How are you feeling?
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-5 border border-purple-100/50 dark:border-purple-900/50">
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
                Describe how you are feeling and we will match you with the right oracle...
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && findMatch()}
                  placeholder="I'm feeling..."
                  className="flex-grow px-4 py-2.5 bg-white/80 dark:bg-slate-700/80 border border-purple-200/30 dark:border-purple-700/30 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-200/50"
                />
                <button
                  onClick={findMatch}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-purple-500 hover:bg-purple-600 transition-colors"
                >
                  Find
                </button>
              </div>

              <AnimatePresence>
                {recommendation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors"
                    onClick={() => navigate(`/chat/${recommendation.id}`)}
                    style={{ border: `2px solid ${recommendation.colors.primary}40` }}
                  >
                    {AvatarComponent && <AvatarComponent size={48} hover={false} />}
                    <div className="flex-grow">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        You should talk to {recommendation.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {recommendation.tagline}
                      </p>
                    </div>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="text-slate-400"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MoodRecommender
