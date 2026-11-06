import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../styles/tokens.css'
import '../../styles/global.css'
import { ThresholdPage } from './ThresholdPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThresholdPage />
  </StrictMode>,
)
