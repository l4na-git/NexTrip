// 1 人分の笑顔のブレンドシェイプ(0〜1)
export type FaceSmile = {
  left: number
  right: number
  score: number
}

export function faceSmileScore(left: number, right: number): number {
  return (left + right) / 2
}

// 写っている全員の平均。誰も写っていなければ null(計測の対象外)
export function groupSmileScore(faces: FaceSmile[]): number | null {
  if (faces.length === 0) return null
  return faces.reduce((sum, face) => sum + face.score, 0) / faces.length
}
