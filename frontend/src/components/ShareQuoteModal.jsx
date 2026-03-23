import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function ShareQuoteModal({ message, character, onClose }) {
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef(null)

  const quote = message.content.length > 280
    ? message.content.substring(0, 277) + '...'
    : message.content

  const handleCopyText = async () => {
    const text = `"${quote}"\n\n— ${character.name}, MythosAI`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadImage = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 800
    canvas.height = 500

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 800, 500)
    grad.addColorStop(0, '#1a1033')
    grad.addColorStop(1, '#0d1117')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 800, 500)

    // Decorative border
    ctx.strokeStyle = character.colors.primary
    ctx.lineWidth = 3
    ctx.globalAlpha = 0.5
    ctx.strokeRect(20, 20, 760, 460)
    ctx.globalAlpha = 0.2
    ctx.strokeRect(30, 30, 740, 440)
    ctx.globalAlpha = 1

    // Quote mark
    ctx.fillStyle = character.colors.primary
    ctx.globalAlpha = 0.3
    ctx.font = '120px Georgia'
    ctx.fillText('\u201C', 40, 120)
    ctx.globalAlpha = 1

    // Quote text (word-wrapped)
    ctx.fillStyle = '#e2e8f0'
    ctx.font = '22px Georgia'
    const words = quote.split(' ')
    let line = ''
    let y = 140
    const maxWidth = 680
    for (const word of words) {
      const test = line + word + ' '
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line.trim(), 60, y)
        line = word + ' '
        y += 34
      } else {
        line = test
      }
    }
    ctx.fillText(line.trim(), 60, y)

    // Character name
    ctx.fillStyle = character.colors.primary
    ctx.font = 'bold 20px Georgia'
    ctx.fillText(`\u2014 ${character.name}`, 60, y + 60)

    // Mythology tag
    ctx.fillStyle = '#94a3b8'
    ctx.font = '14px sans-serif'
    ctx.fillText(character.mythology + ' Mythology', 60, y + 88)

    // App branding
    ctx.fillStyle = '#64748b'
    ctx.font = '13px sans-serif'
    ctx.fillText('MythosAI \u2022 Ancient wisdom for the modern age', 60, 450)

    // Small accent line
    ctx.fillStyle = character.colors.primary
    ctx.fillRect(60, y + 40, 80, 2)

    // Download
    const link = document.createElement('a')
    link.download = `mythos-wisdom-${character.id}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl"
        >
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Share this wisdom</h3>

          {/* Preview */}
          <div
            className="rounded-xl p-5 mb-4"
            style={{
              background: `linear-gradient(135deg, #1a1033, #0d1117)`,
              border: `1px solid ${character.colors.primary}40`,
            }}
          >
            <p className="text-slate-200 text-sm italic leading-relaxed mb-3">&ldquo;{quote}&rdquo;</p>
            <p className="text-sm font-semibold" style={{ color: character.colors.primary }}>
              &mdash; {character.name}
            </p>
            <p className="text-slate-500 text-xs">{character.mythology} Mythology</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleCopyText}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all"
              style={{
                borderColor: character.colors.primary,
                color: character.colors.primary,
              }}
            >
              {copied ? 'Copied!' : 'Copy Text'}
            </button>
            <button
              onClick={handleDownloadImage}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
              style={{ background: character.colors.bg }}
            >
              Download Image
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-3 py-2 text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ShareQuoteModal
