import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import { faceSmileScore, type FaceSmile } from './score'

const BASE = import.meta.env.BASE_URL

export type SmileDetector = {
  detect: (video: HTMLVideoElement, timestampMs: number) => FaceSmile[]
  setMaxFaces: (count: number) => Promise<void>
  close: () => void
}

// 顔検出はすべて端末内で行う。WASM とモデルは public/mediapipe/ から配信し、外部へは通信しない。
// スマホの GPU で映像と同時に動かすと、最初の検出で処理が止まることがあったため、CPU で動かす。
export async function createSmileDetector(maxFaces = 4): Promise<SmileDetector> {
  const vision = await FilesetResolver.forVisionTasks(`${BASE}mediapipe/wasm`)

  const landmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: `${BASE}mediapipe/face_landmarker.task`, delegate: 'CPU' },
    runningMode: 'VIDEO',
    numFaces: maxFaces,
    outputFaceBlendshapes: true,
  })

  // 最初の検出は初期化で重くなるので、準備中のうちに空の画像で 1 回流しておく
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  landmarker.detectForVideo(canvas, performance.now())

  return {
    detect(video, timestampMs) {
      const result = landmarker.detectForVideo(video, timestampMs)
      return (result.faceBlendshapes ?? []).map(({ categories }) => {
        const left = categories.find((c) => c.categoryName === 'mouthSmileLeft')?.score ?? 0
        const right = categories.find((c) => c.categoryName === 'mouthSmileRight')?.score ?? 0
        return { left, right, score: faceSmileScore(left, right) }
      })
    },
    setMaxFaces: (count) => landmarker.setOptions({ numFaces: count }),
    close: () => landmarker.close(),
  }
}
