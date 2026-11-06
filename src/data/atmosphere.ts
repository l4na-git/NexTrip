export type PlaceType = 'sea' | 'cafe' | 'nature' | 'nightview' | 'themepark' | 'onsen'

export type Keyword = {
  id: string
  label: string
}

export type AtmosphereImage = {
  id: PlaceType
  placeType: string
  // 画像の入る場所。null の間はプレースホルダーを表示する
  image: { src: string | null }
  // 雰囲気キーワードの入る場所。keywords の id を指定する
  keywordIds: string[]
}

export type Spot = {
  id: string
  name: string
  placeType: PlaceType
  keywordIds: string[]
  lat: number
  lng: number
}

// 仮の値。今後変更する
export const keywords: Keyword[] = [
  { id: 'relax', label: 'のんびり' },
  { id: 'open', label: '開放的' },
  { id: 'lively', label: 'にぎやか' },
  { id: 'stylish', label: 'おしゃれ' },
  { id: 'healing', label: '癒やし' },
  { id: 'special', label: '非日常' },
  { id: 'nature', label: '自然' },
  { id: 'romantic', label: 'ロマンチック' },
]

// 仮の値。今後変更する
export const atmosphereImages: AtmosphereImage[] = [
  { id: 'sea', placeType: '海', image: { src: null }, keywordIds: ['open', 'relax', 'nature'] },
  { id: 'cafe', placeType: 'カフェ', image: { src: null }, keywordIds: ['stylish', 'relax'] },
  { id: 'nature', placeType: '山・自然', image: { src: null }, keywordIds: ['nature', 'healing', 'open'] },
  { id: 'nightview', placeType: '夜景', image: { src: null }, keywordIds: ['romantic', 'special'] },
  { id: 'themepark', placeType: 'テーマパーク', image: { src: null }, keywordIds: ['lively', 'special'] },
  { id: 'onsen', placeType: '温泉', image: { src: null }, keywordIds: ['healing', 'relax'] },
]

// ダミー。スポット推薦(D)で使う
export const spots: Spot[] = [
  { id: 'sea-1', name: '〇〇海岸', placeType: 'sea', keywordIds: ['open', 'nature'], lat: 35.3, lng: 139.5 },
  { id: 'sea-2', name: '〇〇ビーチ', placeType: 'sea', keywordIds: ['lively', 'open'], lat: 35.2, lng: 139.6 },
  { id: 'cafe-1', name: '〇〇カフェ', placeType: 'cafe', keywordIds: ['stylish', 'relax'], lat: 35.7, lng: 139.7 },
  { id: 'nature-1', name: '〇〇高原', placeType: 'nature', keywordIds: ['nature', 'healing'], lat: 36.0, lng: 138.9 },
  { id: 'nightview-1', name: '〇〇展望台', placeType: 'nightview', keywordIds: ['romantic', 'special'], lat: 35.6, lng: 139.8 },
  { id: 'themepark-1', name: '〇〇ランド', placeType: 'themepark', keywordIds: ['lively', 'special'], lat: 35.6, lng: 139.9 },
  { id: 'onsen-1', name: '〇〇温泉', placeType: 'onsen', keywordIds: ['healing', 'relax'], lat: 35.2, lng: 139.0 },
]
