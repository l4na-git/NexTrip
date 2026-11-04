import type { ReactNode } from 'react'
import styles from './Screen.module.css'

type Props = {
  orientation: 'portrait' | 'landscape'
  children: ReactNode
}

export function Screen({ orientation, children }: Props) {
  return <main className={`${styles.screen} ${styles[orientation]}`}>{children}</main>
}
