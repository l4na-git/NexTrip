import { useCallback, useEffect, useRef, useState } from 'react'
import { CANDIDATE_DURATION_MS } from '../../data/candidates'
import { useCamera } from '../../hooks/useCamera'
import { DEFAULT_SMILE_CONFIG, type SmileConfig } from '../../lib/smile/config'
import { interestPercent } from '../../lib/smile/interest'
import type { FaceSmile } from '../../lib/smile/score'
import { SmileTracker, type SmileResult } from '../../lib/smile/SmileTracker'
import { useSmileMeter, type SmileFrame } from '../../lib/smile/useSmileMeter'
import { CHART_WINDOW_MS, drawChart, type ChartPoint } from './chart'
import { Meter } from './Meter'
import styles from './ThresholdPage.module.css'

type Live = { faces: FaceSmile[]; group: number | null; value: number | null; smiling: boolean }
type Run = { id: number; result: SmileResult; interest: number }

const EMPTY_LIVE: Live = { faces: [], group: null, value: null, smiling: false }
const HISTORY_LIMIT = 8
const percent = (v: number) => `${Math.round(v * 100)}%`

function configSnippet(config: SmileConfig) {
  const round = (v: number) => Number(v.toFixed(2))
  return `export const DEFAULT_SMILE_CONFIG: SmileConfig = {
  threshold: ${round(config.threshold)},
  hysteresis: ${round(config.hysteresis)},
  smoothing: ${round(config.smoothing)},
  maxGapMs: ${config.maxGapMs},
  weights: { time: ${round(config.weights.time)}, intensity: ${round(config.weights.intensity)} },
}`
}

export function ThresholdPage() {
  const [config, setConfig] = useState<SmileConfig>(DEFAULT_SMILE_CONFIG)
  const [maxFaces, setMaxFaces] = useState(4)
  const [cameraOn, setCameraOn] = useState(false)
  const [simulate, setSimulate] = useState(false)
  const [simValue, setSimValue] = useState(0.3)
  const [simNoFace, setSimNoFace] = useState(false)
  const [live, setLive] = useState<Live>(EMPTY_LIVE)
  const [measuring, setMeasuring] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [history, setHistory] = useState<Run[]>([])
  const [copied, setCopied] = useState(false)
  const [video, setVideo] = useState<HTMLVideoElement | null>(null)

  const liveTracker = useRef(new SmileTracker(DEFAULT_SMILE_CONFIG))
  const measureTracker = useRef(new SmileTracker(DEFAULT_SMILE_CONFIG))
  const measureStart = useRef<number | null>(null)
  const measureTimer = useRef<number | null>(null)
  const runId = useRef(0)
  const points = useRef<ChartPoint[]>([])
  const canvas = useRef<HTMLCanvasElement>(null)
  const configRef = useRef(config)
  const simRef = useRef({ value: simValue, noFace: simNoFace })

  const camera = useCamera(cameraOn && !simulate)

  // video 要素は、srcObject の設定用の ref と、検出フックに渡す state の両方に持つ
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const attachVideo = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el
    setVideo(el)
  }, [])

  useEffect(() => {
    configRef.current = config
    liveTracker.current.setConfig(config)
    measureTracker.current.setConfig(config)
  }, [config])

  useEffect(() => {
    simRef.current = { value: simValue, noFace: simNoFace }
  }, [simValue, simNoFace])

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = camera.stream
  }, [video, camera.stream])

  useEffect(
    () => () => {
      if (measureTimer.current !== null) window.clearTimeout(measureTimer.current)
    },
    [],
  )

  const pushFrame = useCallback((frame: SmileFrame) => {
    const live = liveTracker.current
    live.update(frame.timestamp, frame.group)
    const current = live.current()

    const buffer = points.current
    buffer.push({ t: frame.timestamp, raw: frame.group, ...current, value: current.value })
    while (buffer.length > 0 && buffer[0].t < frame.timestamp - CHART_WINDOW_MS - 500) buffer.shift()
    if (canvas.current) drawChart(canvas.current, buffer, configRef.current, frame.timestamp)

    if (measureStart.current !== null) {
      measureTracker.current.update(frame.timestamp, frame.group)
      setElapsedMs(frame.timestamp - measureStart.current)
    }
    setLive({ faces: frame.faces, group: frame.group, ...current })
  }, [])

  const meter = useSmileMeter(video, {
    enabled: cameraOn && !simulate,
    maxFaces,
    onFrame: pushFrame,
  })

  // 疑似入力: スライダーの値を約 15fps で流す
  useEffect(() => {
    if (!simulate) return
    const id = window.setInterval(() => {
      const { value, noFace } = simRef.current
      pushFrame({ timestamp: performance.now(), faces: [], group: noFace ? null : value })
    }, 66)
    return () => window.clearInterval(id)
  }, [simulate, pushFrame])

  // 入力元を切り替えたら、計測中の値を捨てる
  const resetLive = () => {
    liveTracker.current.reset()
    points.current = []
    setLive(EMPTY_LIVE)
  }

  const startMeasure = () => {
    if (measureTimer.current !== null) window.clearTimeout(measureTimer.current)
    measureTracker.current.reset()
    measureStart.current = performance.now()
    setElapsedMs(0)
    setMeasuring(true)
    measureTimer.current = window.setTimeout(() => {
      const result = measureTracker.current.result()
      measureStart.current = null
      measureTimer.current = null
      setMeasuring(false)
      runId.current += 1
      const run = { id: runId.current, result, interest: interestPercent(result, configRef.current) }
      setHistory((prev) => [run, ...prev].slice(0, HISTORY_LIMIT))
    }, CANDIDATE_DURATION_MS)
  }

  const update = (patch: Partial<SmileConfig>) => setConfig((prev) => ({ ...prev, ...patch }))
  const setTimeWeight = (time: number) => update({ weights: { time, intensity: 1 - time } })

  const snippet = configSnippet(config)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // クリップボードが使えない場合は、下に表示している内容を手動でコピーする
    }
  }

  const source = simulate ? '疑似入力' : cameraOn ? 'カメラ' : '停止中'
  const status = simulate
    ? '疑似入力中'
    : !cameraOn
      ? 'カメラ停止中'
      : camera.error
        ? 'カメラを利用できません'
        : meter.status === 'error'
          ? '検出モデルの読み込みに失敗'
          : meter.status === 'ready'
            ? `検出中(${live.faces.length} 人)`
            : '検出モデルを読み込み中…'

  return (
    <div className={styles.page}>
      <p className={styles.banner}>開発用ページです。本番ビルドには含まれません。</p>
      <h1 className={styles.title}>笑顔の閾値確認</h1>

      <div className={styles.grid}>
        <section className={styles.card}>
          <h2 className={styles.heading}>入力({source})</h2>
          <div className={styles.videoBox}>
            <video ref={attachVideo} className={styles.video} autoPlay muted playsInline />
            {!camera.stream && <p className={styles.videoNote}>{status}</p>}
          </div>
          <div className={styles.buttons}>
            <button
              type="button"
              className={styles.button}
              onClick={() => {
                setCameraOn((on) => !on)
                setSimulate(false)
                resetLive()
              }}
            >
              {cameraOn && !simulate ? 'カメラを止める' : 'カメラを起動'}
            </button>
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={simulate}
                onChange={(e) => {
                  setSimulate(e.target.checked)
                  resetLive()
                }}
              />
              疑似入力(カメラなし)
            </label>
          </div>
          {simulate && (
            <div className={styles.sim}>
              <label className={styles.slider}>
                <span>笑顔スコア {simValue.toFixed(2)}</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={simValue}
                  onChange={(e) => setSimValue(Number(e.target.value))}
                />
              </label>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={simNoFace}
                  onChange={(e) => setSimNoFace(e.target.checked)}
                />
                顔なし
              </label>
            </div>
          )}
          <p className={styles.status}>{status}</p>
        </section>

        <section className={styles.card}>
          <h2 className={styles.heading}>ライブ</h2>
          <Meter
            label="全員の平均"
            value={live.value}
            threshold={config.threshold}
            exit={config.threshold - config.hysteresis}
          />
          <p className={styles.state}>
            判定: <strong>{live.value === null ? '顔なし' : live.smiling ? '笑顔' : '笑顔ではない'}</strong>
            (生の値 {live.group === null ? '--' : live.group.toFixed(2)})
          </p>
          <canvas ref={canvas} className={styles.chart} />
          <p className={styles.legend}>
            青の太線: 平滑化後 / グレー: 生の値 / 破線: 閾値と抜ける線 / 薄い青の帯: 笑顔と判定
          </p>
          {live.faces.map((face, i) => (
            <div key={i} className={styles.face}>
              <Meter label={`顔 ${i + 1} 左`} value={face.left} />
              <Meter label={`顔 ${i + 1} 右`} value={face.right} />
            </div>
          ))}
        </section>

        <section className={styles.card}>
          <h2 className={styles.heading}>設定</h2>
          <label className={styles.slider}>
            <span>閾値(笑顔と判定){config.threshold.toFixed(2)}</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={config.threshold}
              onChange={(e) => update({ threshold: Number(e.target.value) })}
            />
          </label>
          <label className={styles.slider}>
            <span>ヒステリシス(抜ける幅){config.hysteresis.toFixed(2)}</span>
            <input
              type="range"
              min={0}
              max={0.5}
              step={0.01}
              value={config.hysteresis}
              onChange={(e) => update({ hysteresis: Number(e.target.value) })}
            />
          </label>
          <label className={styles.slider}>
            <span>平滑化(大きいほど素早く追従){config.smoothing.toFixed(2)}</span>
            <input
              type="range"
              min={0.05}
              max={1}
              step={0.05}
              value={config.smoothing}
              onChange={(e) => update({ smoothing: Number(e.target.value) })}
            />
          </label>
          <label className={styles.slider}>
            <span>
              関心度の重み 時間 {config.weights.time.toFixed(2)} / 強さ {config.weights.intensity.toFixed(2)}
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={config.weights.time}
              onChange={(e) => setTimeWeight(Number(e.target.value))}
            />
          </label>
          <label className={styles.slider}>
            <span>最大人数 {maxFaces}</span>
            <input
              type="range"
              min={1}
              max={6}
              step={1}
              value={maxFaces}
              onChange={(e) => setMaxFaces(Number(e.target.value))}
            />
          </label>
          <div className={styles.buttons}>
            <button type="button" className={styles.button} onClick={copy}>
              {copied ? 'コピーしました' : '設定をコピー'}
            </button>
            <button type="button" className={styles.ghost} onClick={() => setConfig(DEFAULT_SMILE_CONFIG)}>
              初期値に戻す
            </button>
          </div>
          <pre className={styles.code}>{snippet}</pre>
        </section>

        <section className={styles.card}>
          <h2 className={styles.heading}>{CANDIDATE_DURATION_MS / 1000}秒計測</h2>
          <p className={styles.note}>候補表示と同じ時間だけ計測し、笑顔の時間と強さを出します。</p>
          <div className={styles.buttons}>
            <button type="button" className={styles.button} onClick={startMeasure} disabled={measuring}>
              {measuring
                ? `計測中… ${(Math.max(CANDIDATE_DURATION_MS - elapsedMs, 0) / 1000).toFixed(1)}秒`
                : `${CANDIDATE_DURATION_MS / 1000}秒計測`}
            </button>
            <button type="button" className={styles.ghost} onClick={() => setHistory([])}>
              履歴を消す
            </button>
          </div>
          {history.length === 0 ? (
            <p className={styles.note}>まだ計測していません。</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>関心度</th>
                    <th>笑顔の割合</th>
                    <th>笑顔の秒数</th>
                    <th>平均の強さ</th>
                    <th>笑顔中の強さ</th>
                    <th>最大</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(({ id, result, interest }) => (
                    <tr key={id}>
                      <td>{id}</td>
                      {result.noFace ? (
                        <td colSpan={6}>計測できませんでした(顔が検出されず)</td>
                      ) : (
                        <>
                          <td>{interest}%</td>
                          <td>{percent(result.smileRatio)}</td>
                          <td>{result.smileSeconds.toFixed(1)}秒</td>
                          <td>{result.meanIntensity.toFixed(2)}</td>
                          <td>{result.smileMs > 0 ? result.meanSmilingIntensity.toFixed(2) : '--'}</td>
                          <td>{result.peak.toFixed(2)}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
