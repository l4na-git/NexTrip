import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/global.css'
import App from './ui/App.tsx'
import type { Repositories } from './domain/ports'
import { createSmileDetector } from './infrastructure/mediapipe/smileDetector'
import {
  staticImageRepository,
  staticKeywordRepository,
  staticSpotRepository,
} from './infrastructure/staticData'
import { SmileDetectorContext } from './ui/smileDetectorContext'

// composition root: 使うデータと検出器の実装はここで選ぶ
const repositories: Repositories = {
  keywords: staticKeywordRepository,
  images: staticImageRepository,
  spots: staticSpotRepository,
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SmileDetectorContext value={createSmileDetector}>
      <App repositories={repositories} />
    </SmileDetectorContext>
  </StrictMode>,
)
