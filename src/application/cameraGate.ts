// 表情判定(候補表示)に進めるかどうか。
// カメラの映像が取れていて、表情検出の準備もできているときだけ進める。
export function canStartCandidate(
  camera: { stream: MediaStream | null; error: boolean },
  detectorReady: boolean,
) {
  return camera.stream !== null && !camera.error && detectorReady
}
