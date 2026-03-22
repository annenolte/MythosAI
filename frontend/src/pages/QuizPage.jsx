import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { characters } from '../data/characters'
import { avatarMap } from '../components/characters'
import ParticleBackground from '../components/ParticleBackground'
import { playResponseChime, playClick } from '../lib/sounds'

const quizQuestions = [
  {
    question: 'When facing a major problem, you...',
    options: [
      { text: 'Map out every angle before acting', traits: ['strategic', 'analytical'] },
      { text: 'Trust your gut and adapt as you go', traits: ['adventurous', 'resourceful'] },
      { text: 'Seek the deeper meaning behind it', traits: ['philosophical', 'seeker'] },
      { text: 'Question whether it is really a problem at all', traits: ['rebellious', 'witty'] },
    ],
  },
  {
    question: 'Your ideal way to spend a free day:',
    options: [
      { text: 'Reading, studying, or organizing', traits: ['analytical', 'organized', 'scholarly'] },
      { text: 'Exploring somewhere you have never been', traits: ['adventurous', 'bold', 'independent'] },
      { text: 'Taking care of someone you love', traits: ['nurturing', 'devoted', 'compassionate'] },
      { text: 'Doing something that scares you a little', traits: ['bold', 'rebellious', 'intense'] },
    ],
  },
  {
    question: 'What matters most to you?',
    options: [
      { text: 'Knowledge and understanding', traits: ['scholarly', 'seeker', 'analytical'] },
      { text: 'Loyalty and protecting those I love', traits: ['devoted', 'nurturing', 'resilient'] },
      { text: 'Freedom and authenticity', traits: ['independent', 'bold', 'rebellious'] },
      { text: 'Inner peace and compassion', traits: ['compassionate', 'gentle', 'empathetic'] },
    ],
  },
  {
    question: 'How do you handle conflict?',
    options: [
      { text: 'Strategic thinking — find the best outcome for all', traits: ['strategic', 'leader', 'analytical'] },
      { text: 'Talk it out — find common ground through stories', traits: ['resourceful', 'resilient', 'adventurous'] },
      { text: 'Challenge it head-on with wit', traits: ['witty', 'bold', 'rebellious'] },
      { text: 'Listen deeply and seek understanding', traits: ['empathetic', 'gentle', 'compassionate'] },
    ],
  },
  {
    question: 'Which speaks to you most?',
    options: [
      { text: 'Victory belongs to the most prepared mind', traits: ['strategic', 'leader'] },
      { text: 'Every detour is a lesson if you survive it', traits: ['adventurous', 'resilient'] },
      { text: 'What is measured can be mastered', traits: ['organized', 'scholarly'] },
      { text: 'Even shattered things can be made whole again', traits: ['nurturing', 'devoted'] },
    ],
  },
  {
    question: 'Your greatest strength:',
    options: [
      { text: 'My mind — I think before I act', traits: ['strategic', 'analytical', 'organized'] },
      { text: 'My heart — I feel things deeply', traits: ['compassionate', 'empathetic', 'nurturing'] },
      { text: 'My courage — I act when others hesitate', traits: ['bold', 'independent', 'rebellious'] },
      { text: 'My curiosity — I never stop asking why', traits: ['seeker', 'philosophical', 'scholarly'] },
    ],
  },
]

function QuizPage() {
  const navigate = useNavigate()
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState([])
  const [result, setResult] = useState(null)
  const [showResult, setShowResult] = useState(false)

  const handleAnswer = (option) => {
    playClick()
    const newAnswers = [...answers, option.traits]

    if (currentQ < quizQuestions.length - 1) {
      setAnswers(newAnswers)
      setCurrentQ(currentQ + 1)
    } else {
      // Tally up traits
      const traitCounts = {}
      for (const traitList of newAnswers) {
        for (const trait of traitList) {
          traitCounts[trait] = (traitCounts[trait] || 0) + 1
        }
      }

      // Score each character
      const scores = characters.map((char) => {
        let score = 0
        for (const trait of char.quizTraits) {
          score += traitCounts[trait] || 0
        }
        return { character: char, score }
      })

      scores.sort((a, b) => b.score - a.score)
      setResult(scores[0].character)
      setShowResult(true)
      setTimeout(() => playResponseChime(), 500)
    }
  }

  const restart = () => {
    setCurrentQ(0)
    setAnswers([])
    setResult(null)
    setShowResult(false)
  }

  const ResultAvatar = result ? avatarMap[result.id] : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen relative flex items-center justify-center"
    >
      <ParticleBackground />

      <div className="relative z-10 max-w-xl w-full mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate('/select')}
          className="mb-6 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-purple-100/50 dark:border-purple-900/50 shadow-xl"
            >
              {/* Progress */}
              <div className="flex gap-1.5 mb-6">
                {quizQuestions.map((_, i) => (
                  <div
                    key={i}
                    className="h-1.5 rounded-full flex-1 transition-all duration-300"
                    style={{
                      background: i <= currentQ
                        ? 'linear-gradient(to right, #F5C842, #FF8C00)'
                        : '#e2e8f0',
                    }}
                  />
                ))}
              </div>

              <p className="text-xs text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider font-medium">
                Question {currentQ + 1} of {quizQuestions.length}
              </p>

              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6" style={{ fontFamily: "'Cinzel Decorative', Georgia, serif" }}>
                {quizQuestions[currentQ].question}
              </h2>

              <div className="space-y-3">
                {quizQuestions[currentQ].options.map((option, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(option)}
                    className="w-full text-left px-5 py-4 rounded-xl bg-white/80 dark:bg-slate-700/80 border border-purple-200/30 dark:border-purple-700/30 text-slate-700 dark:text-slate-200 hover:border-purple-400/60 hover:shadow-md transition-all text-sm font-medium"
                  >
                    {option.text}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border-2 shadow-xl text-center"
              style={{ borderColor: `${result.colors.primary}60` }}
            >
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium mb-4">Your oracle match is...</p>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="mb-4 inline-block"
              >
                {ResultAvatar && <ResultAvatar size={120} hover={false} />}
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold mb-2"
                style={{ color: result.colors.primary, fontFamily: "'Cinzel Decorative', Georgia, serif" }}
              >
                {result.name}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-slate-600 dark:text-slate-300 text-sm italic mb-2"
              >
                {result.tagline}
              </motion.p>

              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-6"
                style={{ backgroundColor: result.colors.primary, color: '#fff' }}
              >
                {result.mythology} Mythology
              </motion.span>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-slate-500 dark:text-slate-400 text-sm mb-6"
              >
                Best advice for: {result.bio.bestAdviceFor}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex gap-3"
              >
                <button
                  onClick={() => navigate(`/chat/${result.id}`)}
                  className="flex-1 py-3 rounded-xl text-white font-medium shadow-lg transition-all"
                  style={{ background: result.colors.bg }}
                >
                  Talk to {result.name}
                </button>
                <button
                  onClick={restart}
                  className="px-5 py-3 rounded-xl text-sm text-slate-600 dark:text-slate-300 bg-white/60 dark:bg-slate-700/60 border border-purple-200/30 dark:border-purple-700/30 hover:bg-white/80 transition-all"
                >
                  Retake
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default QuizPage
