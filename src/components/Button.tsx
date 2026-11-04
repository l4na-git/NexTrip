import type { ReactNode } from 'react'
import styles from './Button.module.css'

type Props = {
  variant?: 'primary' | 'soft'
  size?: 'md' | 'lg'
  fullWidth?: boolean
  onClick?: () => void
  children: ReactNode
}

export function Button({ variant = 'primary', size = 'md', fullWidth, onClick, children }: Props) {
  const className = [styles.button, styles[variant], styles[size], fullWidth && styles.full]
    .filter(Boolean)
    .join(' ')
  return (
    <button type="button" className={className} onClick={onClick}>
      {children}
    </button>
  )
}
