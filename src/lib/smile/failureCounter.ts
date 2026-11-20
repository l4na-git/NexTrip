// 連続した失敗の回数を数える。一時的な失敗は見逃し、limit 回続いたときだけ諦める。
export function createFailureCounter(limit: number) {
  let count = 0
  return {
    // 失敗を記録する。連続で limit 回に達したら true
    fail: () => {
      count += 1
      return count >= limit
    },
    // 成功したら数え直す
    succeed: () => {
      count = 0
    },
  }
}
