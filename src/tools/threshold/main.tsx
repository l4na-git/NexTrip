import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../styles/tokens.css'
import '../../styles/global.css'
import { createSmileDetector } from '../../infrastructure/mediapipe/smileDetector'
import { SmileDetectorContext } from '../../ui/smileDetectorContext'
import { ThresholdPage } from './ThresholdPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SmileDetectorContext value={createSmileDetector}>
      <ThresholdPage />
    </SmileDetectorContext>
  </StrictMode>,
)
