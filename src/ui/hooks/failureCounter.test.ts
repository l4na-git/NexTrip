import { describe, expect, it } from 'vitest'
import { createFailureCounter } from './failureCounter'

describe('createFailureCounter', () => {
  it('連続で limit 回失敗したときに true になる', () => {
    const counter = createFailureCounter(3)
    expect(counter.fail()).toBe(false)
    expect(counter.fail()).toBe(false)
    expect(counter.fail()).toBe(true)
  })

  it('途中で成功すると数え直す', () => {
    const counter = createFailureCounter(3)
    counter.fail()
    counter.fail()
    counter.succeed()
    expect(counter.fail()).toBe(false)
    expect(counter.fail()).toBe(false)
    expect(counter.fail()).toBe(true)
  })

  it('limit が 1 なら 1 回目の失敗で true になる', () => {
    expect(createFailureCounter(1).fail()).toBe(true)
  })
})
