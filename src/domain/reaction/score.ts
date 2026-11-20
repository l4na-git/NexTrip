// 1 人分の口角のブレンドシェイプ(0〜1)。検出器が返す生の値
export type MouthSmile = {
  left: number
  right: number
}

// 1 人分の笑顔。生の値と、そこから計算したスコア(0〜1)
export type FaceSmile = MouthSmile & {
  score: number
}

export function faceSmileScore(left: number, right: number): number {
  return (left + right) / 2
}

// 検出器の生の値に、笑顔のスコアを付ける
export function toFaceSmile({ left, right }: MouthSmile): FaceSmile {
  return { left, right, score: faceSmileScore(left, right) }
}

// 写っている全員の平均。誰も写っていなければ null(計測の対象外)
export function groupSmileScore(faces: FaceSmile[]): number | null {
  if (faces.length === 0) return null
  return faces.reduce((sum, face) => sum + face.score, 0) / faces.length
}
