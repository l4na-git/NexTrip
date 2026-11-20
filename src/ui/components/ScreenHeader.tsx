import styles from './ScreenHeader.module.css'

type Props = {
  className?: string
}

export function ScreenHeader({ className }: Props) {
  return <p className={[styles.header, className].filter(Boolean).join(' ')}>NexTrip</p>
}
