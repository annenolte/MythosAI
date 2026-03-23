import { motion } from 'framer-motion'
import ParticleBackground from '../components/ParticleBackground'
import AuthForm from '../components/AuthForm'

function LandingPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
    >
      <ParticleBackground />

      {/* Colorful background blobs */}
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl translate-x-1/3" />
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-teal-300/20 rounded-full blur-3xl translate-y-1/3" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-rose-300/15 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-md">

        {/* Floating mythology symbols */}
        {/* Trident */}
        <svg className="absolute -top-8 -left-12 w-10 h-10 float-symbol" style={{ animationDelay: '0s' }} viewBox="0 0 40 40" fill="none">
          <path d="M20 38V10M20 10L12 4M20 10L28 4M20 10V4M14 14H26" stroke="#D4A843" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
        </svg>

        {/* Lightning bolt */}
        <svg className="absolute -top-4 -right-10 w-8 h-8 float-symbol" style={{ animationDelay: '1.2s' }} viewBox="0 0 32 32" fill="none">
          <path d="M18 2L6 18H16L14 30L26 14H16L18 2Z" fill="#F5C842" opacity="0.4" />
        </svg>

        {/* Ankh */}
        <svg className="absolute top-24 -left-16 w-9 h-9 float-symbol" style={{ animationDelay: '2.5s' }} viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="10" r="6" stroke="#1ABC9C" strokeWidth="2" opacity="0.45" />
          <path d="M18 16V32M12 22H24" stroke="#1ABC9C" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
        </svg>

        {/* Lotus */}
        <svg className="absolute top-32 -right-14 w-10 h-10 float-symbol" style={{ animationDelay: '3.8s' }} viewBox="0 0 40 40" fill="none">
          <path d="M20 32C20 32 10 24 10 16C10 12 14 10 20 14C26 10 30 12 30 16C30 24 20 32 20 32Z" fill="#FF4081" opacity="0.3" />
          <path d="M20 32C20 32 14 22 16 14C17 10 19 10 20 12C21 10 23 10 24 14C26 22 20 32 20 32Z" fill="#E74C3C" opacity="0.25" />
        </svg>

        {/* Rune symbol (Algiz/protection rune) */}
        <svg className="absolute -bottom-6 -left-10 w-8 h-8 float-symbol" style={{ animationDelay: '5s' }} viewBox="0 0 32 32" fill="none">
          <path d="M16 28V4M16 10L8 4M16 10L24 4" stroke="#7B68EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
        </svg>

        {/* Large colorful mystical eye */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="relative mb-6"
        >
          <svg
            width="120"
            height="75"
            viewBox="0 0 120 75"
            className="mystical-eye"
          >
            <defs>
              <radialGradient id="eyeGlowBright" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#F5C842" stopOpacity="0.9" />
                <stop offset="40%" stopColor="#FF8C00" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#7B68EE" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="eyeOuterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F5C842" />
                <stop offset="50%" stopColor="#FF8C00" />
                <stop offset="100%" stopColor="#E74C3C" />
              </linearGradient>
              <linearGradient id="eyeInnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7B68EE" />
                <stop offset="100%" stopColor="#1ABC9C" />
              </linearGradient>
            </defs>
            {/* Outer eye shape */}
            <path
              d="M8,37.5 Q60,0 112,37.5 Q60,75 8,37.5 Z"
              fill="none"
              stroke="url(#eyeOuterGrad)"
              strokeWidth="2.5"
              opacity="0.7"
            />
            {/* Inner eye shape */}
            <path
              d="M22,37.5 Q60,12 98,37.5 Q60,63 22,37.5 Z"
              fill="none"
              stroke="url(#eyeInnerGrad)"
              strokeWidth="1.5"
              opacity="0.5"
            />
            {/* Iris */}
            <circle cx="60" cy="37.5" r="15" fill="url(#eyeGlowBright)" />
            {/* Iris ring */}
            <circle cx="60" cy="37.5" r="11" fill="none" stroke="#D4A843" strokeWidth="1" opacity="0.5" />
            {/* Pupil */}
            <circle cx="60" cy="37.5" r="6" fill="#B8860B" opacity="0.9" />
            {/* Pupil highlight */}
            <circle cx="63" cy="34" r="2.5" fill="white" opacity="0.8" />
            <circle cx="57" cy="40" r="1" fill="white" opacity="0.5" />
          </svg>
        </motion.div>

        {/* Title with Cinzel Decorative font */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl sm:text-7xl font-bold mb-3 tracking-tight oracle-title"
          style={{ fontFamily: "'Cinzel Decorative', cursive", color: '#B8860B' }}
        >
          MythosAI
        </motion.h1>

        {/* Colorful decorative divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-48 h-1 rounded-full bg-gradient-to-r from-amber-400 via-purple-500 to-teal-400 mb-4"
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-purple-800/60 text-lg mb-10 tracking-wide text-center"
        >
          Ancient wisdom for the modern age
        </motion.p>

        {/* Greek key meander border + auth form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-full"
        >
          <div className="relative">
            {/* Greek key border - top */}
            <svg viewBox="0 0 400 16" className="w-full h-4 mb-2" preserveAspectRatio="none">
              <defs>
                <pattern id="greekKeyTop" x="0" y="0" width="32" height="16" patternUnits="userSpaceOnUse">
                  <path d="M0,8 L8,8 L8,0 L16,0 L16,8 L24,8 L24,16 L32,16 L32,8" fill="none" stroke="#D4A843" strokeWidth="1.5" opacity="0.4" />
                </pattern>
              </defs>
              <rect width="400" height="16" fill="url(#greekKeyTop)" />
            </svg>

            <AuthForm />

            {/* Greek key border - bottom */}
            <svg viewBox="0 0 400 16" className="w-full h-4 mt-2" preserveAspectRatio="none" style={{ transform: 'scaleY(-1)' }}>
              <defs>
                <pattern id="greekKeyBottom" x="0" y="0" width="32" height="16" patternUnits="userSpaceOnUse">
                  <path d="M0,8 L8,8 L8,0 L16,0 L16,8 L24,8 L24,16 L32,16 L32,8" fill="none" stroke="#D4A843" strokeWidth="1.5" opacity="0.4" />
                </pattern>
              </defs>
              <rect width="400" height="16" fill="url(#greekKeyBottom)" />
            </svg>
          </div>
        </motion.div>
      </div>

      <style>{`
        .oracle-title {
          text-shadow:
            0 0 12px rgba(184, 134, 11, 0.22),
            0 0 24px rgba(245, 200, 66, 0.08);
          animation: titleGlow 3s ease-in-out infinite;
        }

        @keyframes titleGlow {
          0%, 100% {
            text-shadow:
              0 0 12px rgba(184, 134, 11, 0.16),
              0 0 24px rgba(245, 200, 66, 0.06);
          }
          50% {
            text-shadow:
              0 0 18px rgba(184, 134, 11, 0.26),
              0 0 36px rgba(245, 200, 66, 0.12);
          }
        }

        .mystical-eye {
          filter: drop-shadow(0 0 12px rgba(245, 200, 66, 0.3));
          animation: eyePulse 4s ease-in-out infinite;
        }

        @keyframes eyePulse {
          0%, 100% {
            filter: drop-shadow(0 0 12px rgba(245, 200, 66, 0.25));
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 0 24px rgba(245, 200, 66, 0.5));
            transform: scale(1.05);
          }
        }

        .float-symbol {
          animation: floatSymbol 6s ease-in-out infinite;
        }

        @keyframes floatSymbol {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-12px) rotate(3deg); }
          66% { transform: translateY(-6px) rotate(-2deg); }
        }
      `}</style>
    </motion.div>
  )
}

export default LandingPage
