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
      <section className={styles.help}>
        <h2 className={styles.helpTitle}>横にしても変わらないときは</h2>
        <ul className={styles.causes}>
          <li>
            <p className={styles.cause}>画面の向きがロックされていませんか？</p>
            <p className={styles.remedy}>
              スマホの設定で、向きのロックをオフ(自動回転をオン)にしてください。
            </p>
          </li>
          <li>
            <p className={styles.cause}>LINE や Instagram などのアプリの中で開いていませんか？</p>
            <p className={styles.remedy}>
              アプリによっては横向きになりません。メニューの「ブラウザで開く」などから、Safari や Chrome
              で開き直してください。
            </p>
          </li>
        </ul>
      </section>
    </main>
  )
}
