import { Button } from '../components/Button'
import { Placeholder } from '../components/Placeholder'
import { Screen } from '../components/Screen'
import styles from './StartScreen.module.css'

const steps = ['条件を決める', 'カメラで確認する', '候補を比べて決定']

type Props = {
  onStart: () => void
}

export function StartScreen({ onStart }: Props) {
  return (
    <Screen orientation="portrait">
      <section className={styles.intro}>
        <p className={styles.brand}>NexTrip</p>
        <h1 className={styles.title}>
          次のおでかけを
          <br />
          みんなで決めよう
        </h1>
        <p className={styles.lead}>
          1台のスマホを囲んで、表情の反応も参考にしながら候補を選びます。
        </p>
      </section>

      <Placeholder label="［イラスト ］" className={styles.illustration} />

      <section className={styles.how}>
        <h2 className={styles.howTitle}>進め方</h2>
        <ol className={styles.steps}>
          {steps.map((step, i) => (
            <li key={step} className={styles.step}>
              <span className={styles.number}>{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <div className={styles.action}>
        <Button size="lg" fullWidth onClick={onStart}>
          はじめる
        </Button>
      </div>
    </Screen>
  )
}
