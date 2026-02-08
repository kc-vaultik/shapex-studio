/**
 * Effects - Post-processing for cyberpunk aesthetic
 * Bloom, vignette, chromatic aberration
 */

import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Vector2 } from 'three'

export default function Effects() {
  return (
    <EffectComposer>
      {/* Bloom - Glowing neon effect */}
      <Bloom
        intensity={1.5}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        blendFunction={BlendFunction.ADD}
      />

      {/* Vignette - Dark edges */}
      <Vignette
        offset={0.3}
        darkness={0.5}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* Chromatic Aberration - Slight color split */}
      <ChromaticAberration
        offset={new Vector2(0.001, 0.001)}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  )
}
