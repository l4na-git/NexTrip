import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import { faceSmileScore, type FaceSmile } from './score'

const BASE = import.meta.env.BASE_URL

export type SmileDetector = {
  detect: (video: HTMLVideoElement, timestampMs: number) => FaceSmile[]
  setMaxFaces: (count: number) => Promise<void>
  close: () => void
}

// 顔検出はすべて端末内で行う。WASM とモデルは public/mediapipe/ から配信し、外部へは通信しない。
export async function createSmileDetector(maxFaces = 4): Promise<SmileDetector> {
  const vision = await FilesetResolver.forVisionTasks(`${BASE}mediapipe/wasm`)

  const create = (delegate: 'GPU' | 'CPU') =>
    FaceLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: `${BASE}mediapipe/face_landmarker.task`, delegate },
      runningMode: 'VIDEO',
      numFaces: maxFaces,
      outputFaceBlendshapes: true,
    })

  let landmarker: FaceLandmarker
  try {
    landmarker = await create('GPU')
  } catch {
    landmarker = await create('CPU')
  }

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
