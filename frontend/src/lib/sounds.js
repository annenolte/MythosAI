// Mystical sound effects using Web Audio API — no external files needed

let audioCtx = null

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  return audioCtx
}

/** Mystical chime — plays when a character finishes responding */
export function playResponseChime() {
  try {
    const ctx = getCtx()
    const now = ctx.currentTime

    // Layer 1: Bell tone
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(830, now)
    osc1.frequency.exponentialRampToValueAtTime(620, now + 0.6)
    gain1.gain.setValueAtTime(0.12, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8)
    osc1.connect(gain1).connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.8)

    // Layer 2: Ethereal high shimmer
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(1320, now + 0.1)
    osc2.frequency.exponentialRampToValueAtTime(990, now + 0.7)
    gain2.gain.setValueAtTime(0.06, now + 0.1)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9)
    osc2.connect(gain2).connect(ctx.destination)
    osc2.start(now + 0.1)
    osc2.stop(now + 0.9)

    // Layer 3: Deep resonance
    const osc3 = ctx.createOscillator()
    const gain3 = ctx.createGain()
    osc3.type = 'triangle'
    osc3.frequency.setValueAtTime(220, now)
    gain3.gain.setValueAtTime(0.08, now)
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.0)
    osc3.connect(gain3).connect(ctx.destination)
    osc3.start(now)
    osc3.stop(now + 1.0)
  } catch (e) {
    // Silently fail if audio isn't available
  }
}

/** Subtle click for UI interactions */
export function playClick() {
  try {
    const ctx = getCtx()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, now)
    gain.gain.setValueAtTime(0.05, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
    osc.connect(gain).connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.1)
  } catch (e) {}
}

/** Mystical ambient whoosh for page transitions */
export function playWhoosh() {
  try {
    const ctx = getCtx()
    const now = ctx.currentTime

    // White noise burst filtered
    const bufferSize = ctx.sampleRate * 0.4
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(800, now)
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.4)
    filter.Q.value = 2

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.06, now + 0.1)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

    noise.connect(filter).connect(gain).connect(ctx.destination)
    noise.start(now)
    noise.stop(now + 0.4)
  } catch (e) {}
}
