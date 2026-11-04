import type { SmileConfig } from '../../lib/smile/config'

export type ChartPoint = {
  t: number
  // 検出した生のスコア。誰も写っていなければ null
  raw: number | null
  // 平滑化後のスコア
  value: number | null
  smiling: boolean
}

export const CHART_WINDOW_MS = 10000

const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

// 直近 CHART_WINDOW_MS の推移を描く。横軸は右端が現在。
export function drawChart(
  canvas: HTMLCanvasElement,
  points: ChartPoint[],
  config: SmileConfig,
  now: number,
) {
  const dpr = window.devicePixelRatio || 1
  const width = canvas.clientWidth
  const height = canvas.clientHeight
  if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
    canvas.width = width * dpr
    canvas.height = height * dpr
  }
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)

  const x = (t: number) => ((t - (now - CHART_WINDOW_MS)) / CHART_WINDOW_MS) * width
  const y = (v: number) => height - Math.min(Math.max(v, 0), 1) * height

  const accent = css('--color-accent')
  const soft = css('--color-accent-soft')
  const line = css('--color-line')

  // 笑顔と判定されていた区間を薄く塗る
  ctx.fillStyle = soft
  points.forEach((p, i) => {
    const next = points[i + 1]
    if (p.smiling && next) ctx.fillRect(x(p.t), 0, Math.max(x(next.t) - x(p.t), 1), height)
  })

  // 閾値(笑顔に入る)と、笑顔から抜ける線
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])
  ctx.strokeStyle = accent
  ctx.beginPath()
  ctx.moveTo(0, y(config.threshold))
  ctx.lineTo(width, y(config.threshold))
  ctx.stroke()
  ctx.strokeStyle = line
  ctx.beginPath()
  ctx.moveTo(0, y(config.threshold - config.hysteresis))
  ctx.lineTo(width, y(config.threshold - config.hysteresis))
  ctx.stroke()
  ctx.setLineDash([])

  const stroke = (key: 'raw' | 'value', color: string, lineWidth: number) => {
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.beginPath()
    let drawing = false
    for (const p of points) {
      const v = p[key]
      if (v === null) {
        drawing = false
        continue
      }
      if (drawing) ctx.lineTo(x(p.t), y(v))
      else ctx.moveTo(x(p.t), y(v))
      drawing = true
    }
    ctx.stroke()
  }
  stroke('raw', line, 1)
  stroke('value', accent, 2)
}
