import type { MouthSmile } from '../domain/reaction/score'

// 顔の上端(額)の中心。映像の幅・高さに対する割合(0〜1)で、鏡像にする前の向き
export type FacePoint = { x: number; y: number }

// 検出した 1 人分。口角の値と、顔の位置
export type DetectedFace = MouthSmile & { top: FacePoint }

// 映像から、写っている人ごとの口角の値と顔の位置を取り出す検出器。
// 映像(HTMLVideoElement)を扱うためブラウザの型に依存するので、domain ではなくここに置く。
export interface SmileDetector {
  detect(video: HTMLVideoElement, timestampMs: number): DetectedFace[]
  setMaxFaces(count: number): Promise<void>
  close(): void
}

// 検出器を作る。モデルの読み込みなどで時間がかかるため非同期
export type SmileDetectorFactory = (maxFaces: number) => Promise<SmileDetector>
