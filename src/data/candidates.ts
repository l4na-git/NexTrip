export type Category = {
  id: string
  name: string
}

export type Destination = {
  id: string
  name: string
  reaction: string
  // 雰囲気キーワード(atmosphere.ts の keywords の id)。関心度はこの割合から計算する
  keywordIds: string[]
  eta: string
  price: string
}

export const CANDIDATE_DURATION_MS = 3000

export const categories: Category[] = [
  { id: 'mori', name: 'もり' },
  { id: 'umi', name: 'うみ' },
  { id: 'machi', name: 'まち' },
  { id: 'onsen', name: 'おんせん' },
]

// 仮の値。スポット推薦(D)で置き換える
export const destinations: Destination[] = [
  {
    id: 'aquarium',
    name: '〇〇水族館',
    reaction: '表情からの推定：反応が良い',
    keywordIds: ['special', 'healing'],
    eta: '現在地から約25分',
    price: '大人 2,400円〜',
  },
  {
    id: 'beach',
    name: '〇〇海水浴場',
    reaction: '表情からの推定：関心が高そう',
    keywordIds: ['open', 'lively', 'nature'],
    eta: '現在地から約40分',
    price: '無料',
  },
  {
    id: 'park',
    name: '〇〇海浜公園',
    reaction: '表情からの推定：もう少し検討',
    keywordIds: ['relax', 'nature', 'open'],
    eta: '現在地から約35分',
    price: '大人 500円〜',
  },
]
