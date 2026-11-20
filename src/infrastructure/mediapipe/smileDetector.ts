import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import type { SmileDetector, SmileDetectorFactory } from '../../application/ports'

const BASE = import.meta.env.BASE_URL

// 顔検出はすべて端末内で行う。WASM とモデルは public/mediapipe/ から配信し、外部へは通信しない。
// スマホの GPU で映像と同時に動かすと、最初の検出で処理が止まることがあったため、CPU で動かす。
export const createSmileDetector: SmileDetectorFactory = async (maxFaces): Promise<SmileDetector> => {
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
    // 口角の生の値だけを返す。笑顔のスコアの計算はドメインで行う
    detect(video, timestampMs) {
      const result = landmarker.detectForVideo(video, timestampMs)
      return (result.faceBlendshapes ?? []).map(({ categories }) => ({
        left: categories.find((c) => c.categoryName === 'mouthSmileLeft')?.score ?? 0,
        right: categories.find((c) => c.categoryName === 'mouthSmileRight')?.score ?? 0,
      }))
    },
    setMaxFaces: (count) => landmarker.setOptions({ numFaces: count }),
    close: () => landmarker.close(),
  }
}
