import type { MouthSmile } from '../domain/reaction/score'

// 映像から、写っている人ごとの口角の値を取り出す検出器。
// 映像(HTMLVideoElement)を扱うためブラウザの型に依存するので、domain ではなくここに置く。
export interface SmileDetector {
  detect(video: HTMLVideoElement, timestampMs: number): MouthSmile[]
  setMaxFaces(count: number): Promise<void>
  close(): void
}

// 検出器を作る。モデルの読み込みなどで時間がかかるため非同期
export type SmileDetectorFactory = (maxFaces: number) => Promise<SmileDetector>
