import { useId, useRef } from 'react'
import { Button } from './Button'
import styles from './StopDialog.module.css'

type Props = {
  onStop: () => void
  // 確認を開いている間は、呼び出し側で候補の切り替えなどを止める
  onOpenChange?: (open: boolean) => void
}

// 計測の途中でやめるためのボタン。結果が消えるので、押したらまず確認する
export function StopDialog({ onStop, onOpenChange }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  const open = () => {
    dialog.current?.showModal()
    onOpenChange?.(true)
  }

  return (
    <>
      <button type="button" className={styles.trigger} onClick={open}>
        やめる
      </button>
      {/* Esc キーで閉じたときも close が届くので、「続ける」と同じ扱いになる */}
      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-labelledby={titleId}
        onClose={() => onOpenChange?.(false)}
      >
        <h2 id={titleId} className={styles.title}>
          計測をやめて最初の画面に戻りますか？
        </h2>
        <p className={styles.lead}>
          ここまでの計測は残りません。次に始めるときは、最初の候補からやり直しになります。
        </p>
        <div className={styles.buttons}>
          <Button variant="soft" onClick={onStop}>
            やめる
          </Button>
          {/* 誤って開いたときにそのまま戻れるよう、続けるを最初に選ばれた状態にする */}
          <Button onClick={() => dialog.current?.close()} autoFocus>
            続ける
          </Button>
        </div>
      </dialog>
    </>
  )
}
