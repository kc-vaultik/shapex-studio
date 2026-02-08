import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Game3D from './components/3d/Game3D'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Game3D />
  </StrictMode>,
)
