/**
 * useSounds - Sound effect system
 * Handles UI clicks, phase transitions, success sounds
 */

import { useEffect, useRef } from 'react'
import { useGameStore, GamePhase } from '../store/gameStore'

interface SoundConfig {
  frequency: number
  duration: number
  type: OscillatorType
  volume: number
}

// Sound presets
const sounds = {
  click: { frequency: 800, duration: 50, type: 'sine' as OscillatorType, volume: 0.1 },
  phaseChange: { frequency: 600, duration: 200, type: 'square' as OscillatorType, volume: 0.15 },
  success: { frequency: 880, duration: 300, type: 'sine' as OscillatorType, volume: 0.2 },
  error: { frequency: 200, duration: 200, type: 'sawtooth' as OscillatorType, volume: 0.15 },
  levelUp: { frequency: 1200, duration: 500, type: 'sine' as OscillatorType, volume: 0.25 }
}

class SoundEngine {
  private audioContext: AudioContext | null = null
  private enabled: boolean = true

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }

  play(config: SoundConfig) {
    if (!this.enabled || !this.audioContext) return

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.type = config.type
      oscillator.frequency.value = config.frequency

      gainNode.gain.setValueAtTime(config.volume, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioContext.currentTime + config.duration / 1000
      )

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.start()
      oscillator.stop(this.audioContext.currentTime + config.duration / 1000)
    } catch (error) {
      console.warn('Sound playback error:', error)
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }
}

const soundEngine = new SoundEngine()

export function useSounds() {
  const currentPhase = useGameStore((state) => state.currentPhase)
  const prevPhaseRef = useRef<GamePhase>(currentPhase)

  // Initialize audio context on mount
  useEffect(() => {
    soundEngine.init()

    // Resume audio context on user interaction (required by browsers)
    const resumeAudio = () => {
      if (soundEngine.audioContext?.state === 'suspended') {
        soundEngine.audioContext.resume()
      }
    }

    window.addEventListener('click', resumeAudio, { once: true })
    window.addEventListener('touchstart', resumeAudio, { once: true })

    return () => {
      window.removeEventListener('click', resumeAudio)
      window.removeEventListener('touchstart', resumeAudio)
    }
  }, [])

  // Play sound on phase change
  useEffect(() => {
    if (prevPhaseRef.current !== currentPhase) {
      // Phase transition sounds
      if (currentPhase === 'RESEARCHING' || currentPhase === 'VALIDATING' || currentPhase === 'STRATEGIZING') {
        soundEngine.play(sounds.phaseChange)
      } else if (currentPhase === 'CELEBRATING') {
        soundEngine.play(sounds.success)
      }

      prevPhaseRef.current = currentPhase
    }
  }, [currentPhase])

  return {
    playClick: () => soundEngine.play(sounds.click),
    playSuccess: () => soundEngine.play(sounds.success),
    playError: () => soundEngine.play(sounds.error),
    playLevelUp: () => soundEngine.play(sounds.levelUp),
    setEnabled: (enabled: boolean) => soundEngine.setEnabled(enabled)
  }
}
