import styles from './RotateScreen.module.css'

export function RotateScreen() {
  return (
    <main className={styles.screen} role="status">
      <svg className={styles.icon} width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
        <rect x="22" y="8" width="28" height="56" rx="6" fill="none" stroke="currentColor" strokeWidth="4" />
        <line x1="32" y1="56" x2="40" y2="56" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <h1 className={styles.title}>画面を横にしてください</h1>
      <p className={styles.lead}>みんなで見やすいように、スマホを横向きにします。</p>
      <p className={styles.note}>向きがかわらないときは、向きのロックをオフにしてください。</p>
    </main>
  )
}
