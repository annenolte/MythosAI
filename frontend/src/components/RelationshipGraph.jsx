import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { characters, characterRelationships } from '../data/characters'
import { avatarMap } from './characters'

// Circular layout positions for 8 characters
const positions = [
  { x: 250, y: 60 },   // top center-left
  { x: 400, y: 60 },   // top center-right
  { x: 500, y: 170 },  // right top
  { x: 500, y: 300 },  // right bottom
  { x: 400, y: 400 },  // bottom center-right
  { x: 250, y: 400 },  // bottom center-left
  { x: 150, y: 300 },  // left bottom
  { x: 150, y: 170 },  // left top
]

function RelationshipGraph() {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredRelation, setHoveredRelation] = useState(null)
  const [hoveredChar, setHoveredChar] = useState(null)

  const charPositions = {}
  characters.forEach((c, i) => {
    charPositions[c.id] = positions[i]
  })

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-amber-400 to-rose-400 text-white shadow-lg shadow-amber-300/20 hover:shadow-amber-300/40 transition-all"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="6" r="3" />
          <circle cx="18" cy="18" r="3" />
          <circle cx="18" cy="6" r="3" />
          <line x1="8.5" y1="7.5" x2="15.5" y2="16.5" />
          <line x1="15.5" y1="7.5" x2="8.5" y2="16.5" />
        </svg>
        Character Connections
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-4 border border-purple-100/50 dark:border-purple-900/50">
              <p className="text-slate-500 dark:text-slate-400 text-xs text-center mb-2 italic">
                Hover over the lines to see how they are connected
              </p>

              <svg viewBox="0 0 650 460" className="w-full" style={{ maxHeight: '400px' }}>
                {/* Relationship lines */}
                {characterRelationships.map((rel, i) => {
                  const from = charPositions[rel.from]
                  const to = charPositions[rel.to]
                  if (!from || !to) return null

                  const isHighlighted = hoveredRelation === i ||
                    hoveredChar === rel.from || hoveredChar === rel.to

                  const fromChar = characters.find(c => c.id === rel.from)

                  return (
                    <g key={i}
                      onMouseEnter={() => setHoveredRelation(i)}
                      onMouseLeave={() => setHoveredRelation(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      <line
                        x1={from.x} y1={from.y}
                        x2={to.x} y2={to.y}
                        stroke={isHighlighted ? fromChar?.colors?.primary || '#7C3AED' : '#cbd5e1'}
                        strokeWidth={isHighlighted ? 3 : 1.5}
                        strokeDasharray={rel.type === 'parallel' ? '6,4' : 'none'}
                        opacity={isHighlighted ? 1 : 0.4}
                      />
                      {/* Invisible wider line for easier hover */}
                      <line
                        x1={from.x} y1={from.y}
                        x2={to.x} y2={to.y}
                        stroke="transparent"
                        strokeWidth={12}
                      />
                      {/* Label on hover */}
                      {isHighlighted && (
                        <text
                          x={(from.x + to.x) / 2}
                          y={(from.y + to.y) / 2 - 8}
                          textAnchor="middle"
                          fill={fromChar?.colors?.primary || '#7C3AED'}
                          fontSize="11"
                          fontWeight="600"
                        >
                          <tspan
                            dy="-2"
                            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
                          >
                            {rel.label}
                          </tspan>
                        </text>
                      )}
                    </g>
                  )
                })}

                {/* Character nodes */}
                {characters.map((char, i) => {
                  const pos = positions[i]
                  const isHighlighted = hoveredChar === char.id ||
                    (hoveredRelation !== null && (
                      characterRelationships[hoveredRelation]?.from === char.id ||
                      characterRelationships[hoveredRelation]?.to === char.id
                    ))

                  return (
                    <g key={char.id}
                      onMouseEnter={() => setHoveredChar(char.id)}
                      onMouseLeave={() => setHoveredChar(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Glow */}
                      {isHighlighted && (
                        <circle
                          cx={pos.x} cy={pos.y} r="30"
                          fill={char.colors.primary}
                          opacity={0.15}
                        />
                      )}
                      {/* Circle bg */}
                      <circle
                        cx={pos.x} cy={pos.y} r="22"
                        fill="white"
                        stroke={char.colors.primary}
                        strokeWidth={isHighlighted ? 3 : 2}
                        opacity={isHighlighted ? 1 : 0.8}
                      />
                      {/* Mythology dot */}
                      <circle
                        cx={pos.x} cy={pos.y} r="16"
                        fill={`${char.colors.primary}25`}
                      />
                      {/* Name label */}
                      <text
                        x={pos.x} y={pos.y + 36}
                        textAnchor="middle"
                        fill="#475569"
                        fontSize="11"
                        fontWeight="600"
                      >
                        {char.name}
                      </text>
                      {/* Mythology label */}
                      <text
                        x={pos.x} y={pos.y + 48}
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="9"
                      >
                        {char.mythology}
                      </text>
                      {/* Character initial */}
                      <text
                        x={pos.x} y={pos.y + 5}
                        textAnchor="middle"
                        fill={char.colors.primary}
                        fontSize="16"
                        fontWeight="bold"
                      >
                        {char.name[0]}
                      </text>
                    </g>
                  )
                })}
              </svg>

              {/* Legend */}
              <div className="flex justify-center gap-6 mt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-6 h-0.5 bg-slate-400 inline-block" /> Direct bond
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-6 h-0.5 bg-slate-400 inline-block" style={{ borderTop: '2px dashed #94a3b8', height: 0 }} /> Cross-mythology parallel
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default RelationshipGraph
