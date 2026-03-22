import { useState } from 'react'
import { motion } from 'framer-motion'
import { avatarMap } from './characters'
import { culturalBorders, culturalPatternBgs } from './CulturalPatterns'

const mythologyColors = {
  Greek: '#F5C842',
  Norse: '#5BA4CF',
  Egyptian: '#1ABC9C',
  'East Asian': '#E74C3C',
}

function CharacterCard({ character, onClick, dailyWisdom }) {
  const [isHovered, setIsHovered] = useState(false)
  const AvatarComponent = avatarMap[character.id]

  const tagColor = mythologyColors[character.mythology] || character.colors.primary
  const BorderComponent = culturalBorders[character.mythology]
  const PatternBgComponent = culturalPatternBgs[character.mythology]

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className="cursor-pointer"
    >
      <div
        className="relative backdrop-blur-xl bg-white/80 border-2 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col items-center text-center"
        style={{
          borderColor: isHovered ? character.colors.primary : `${character.colors.primary}30`,
          boxShadow: isHovered
            ? `0 8px 40px ${character.colors.primary}30, 0 2px 10px ${character.colors.primary}15`
            : '0 2px 10px rgba(0,0,0,0.04)',
          transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
        }}
      >
        {/* Cultural pattern border on top */}
        {BorderComponent && (
          <div className="w-full">
            <BorderComponent
              color={character.colors.primary}
              opacity={isHovered ? 0.7 : 0.4}
              height={16}
            />
          </div>
        )}

        {/* SVG cultural pattern background */}
        {PatternBgComponent && (
          <PatternBgComponent opacity={isHovered ? 0.1 : 0.05} />
        )}

        <div className="relative z-10 p-6 pt-3 flex flex-col items-center">
          {/* Avatar */}
          <div className="mb-4">
            {AvatarComponent && (
              <AvatarComponent size={100} hover={isHovered} />
            )}
          </div>

          {/* Name */}
          <h3 className="text-slate-800 text-lg font-semibold mb-1">{character.name}</h3>

          {/* Mythology tag */}
          <span
            className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3"
            style={{
              backgroundColor: tagColor,
              color: '#fff',
            }}
          >
            {character.mythology}
          </span>

          {/* Tagline */}
          <p className="text-slate-600 text-sm leading-relaxed">{character.tagline}</p>

          {/* Daily Wisdom */}
          {dailyWisdom && (
            <div
              className="mt-3 pt-3 w-full border-t text-xs italic leading-relaxed"
              style={{
                borderColor: `${character.colors.primary}20`,
                color: `${character.colors.primary}cc`,
              }}
            >
              &ldquo;{dailyWisdom}&rdquo;
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default CharacterCard
