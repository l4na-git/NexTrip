import type { CSSProperties } from 'react'
import styles from './Placeholder.module.css'

type Props = {
  label: string
  size?: 'sm' | 'md' | 'lg'
  radius?: number
  className?: string
  style?: CSSProperties
}

export function Placeholder({ label, size = 'md', radius = 16, className, style }: Props) {
  return (
    <div
      className={[styles.placeholder, styles[size], className].filter(Boolean).join(' ')}
      style={{ borderRadius: radius, ...style }}
    >
      {label}
    </div>
  )
}
