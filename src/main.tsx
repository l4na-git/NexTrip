import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/global.css'
import App from './App.tsx'
import type { Repositories } from './domain/ports'
import {
  staticImageRepository,
  staticKeywordRepository,
  staticSpotRepository,
} from './infrastructure/staticData'

// composition root: 使うデータの実装はここで選ぶ
const repositories: Repositories = {
  keywords: staticKeywordRepository,
  images: staticImageRepository,
  spots: staticSpotRepository,
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App repositories={repositories} />
  </StrictMode>,
)
