// MediaPipe の WASM を public/ にコピーし、外部サーバーから読み込まずに配信できるようにする
import { cpSync, existsSync, mkdirSync } from 'node:fs'

const from = 'node_modules/@mediapipe/tasks-vision/wasm'
const to = 'public/mediapipe/wasm'

if (!existsSync(from)) {
  console.warn(`[copy-mediapipe-wasm] ${from} が見つかりません。npm install を実行してください。`)
  process.exit(0)
}

mkdirSync(to, { recursive: true })
cpSync(from, to, { recursive: true })
console.log(`[copy-mediapipe-wasm] ${from} -> ${to}`)
